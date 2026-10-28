// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { computed, type ComputedRef, ref, watch } from 'vue'

import { type VimApplicationContext } from '@/vim/types.ts'
import { type StoreSetup, type VimStoreModule } from '@/store/types.ts'
import { type VisualizerStore } from '@/store/modules/visualizer.ts'

import {
  type KvNodeInspectResult,
  operateInspectForPublic as kvNodeOperateInspectForPublic,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/kvNode.ts'
import {
  operateInspectForPublic as textNodeOperateInspect,
  type TextNodeInspectResult,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'

import { toSnakeCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

import { resolveResponse } from '@/util/response.ts'

// region 初始化逻辑

/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

/**
 * 初始化。
 *
 * @param _ctx VIM 应用上下文对象。
 */
function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerVimInitializedHook(vimInitializedHook)
}

// endregion

// region Store 定义

/**
 * 主题列表配置项。
 */
export type ThemeListSettingItem = {
  key: string
  label: string
  remark: string
}

/**
 * 主题配置值。
 *
 * 该类型表示主题中单个配置键对应的值。
 */
export type ThemeValue = string

/**
 * 主题配置值集合。
 *
 * 主题语义由可视化器自行解释，Store 只负责将主题仓库中的 KV 条目按主题配置字段聚合。
 */
export type ThemeValues = Readonly<Record<string, ThemeValue>>

/**
 * 运行时主题项。
 */
export type ThemeItem = ThemeListSettingItem & {
  value: ThemeValues
}

/**
 * Theme Store。
 */
export type ThemeStore = {
  ready: ComputedRef<boolean>
  theme: ComputedRef<string>
  themeList: ComputedRef<Readonly<ThemeItem[]>>
  themeItem: ComputedRef<ThemeItem | null>
  setTheme: (theme: string) => void
  themeValue: (key: string) => ComputedRef<ThemeValue | null>
}

// Store 区域。
const _ready = ref<boolean>(false)
const _theme = ref<string>('')
const _themeList = ref<Readonly<ThemeItem[]>>([])

const ready: ComputedRef<boolean> = computed(() => _ready.value)
const theme: ComputedRef<string> = computed(() => _theme.value)
const themeList: ComputedRef<Readonly<ThemeItem[]>> = computed(() => _themeList.value)
const themeItem: ComputedRef<ThemeItem | null> = computed(() => {
  if (!_ready.value) {
    return null
  }
  return _themeList.value.find((item) => item.key === _theme.value) ?? null
})

/**
 * 设置准备标记。
 */
function setReady(): void {
  _ready.value = true
}

/**
 * 设置当前主题。
 *
 * @param value 主题键。
 */
function setTheme(value: string): void {
  if (!_themeList.value.some((item) => item.key === value)) {
    return
  }
  _theme.value = value
  persistTheme(value)
}

/**
 * 获取当前主题中指定配置键对应的响应式值。
 *
 * 调用时返回一个计算属性，该计算属性会追踪当前主题及其配置值集合。主题切换或主题数据
 * 重新加载后，可以通过已有的计算属性读取最新结果，无需重新获取该计算属性本身。
 *
 * @param key 主题配置键，例如 `--el-color-primary`。
 * @returns 当前主题中该配置键对应的值；主题不存在或配置键不存在时返回 null。
 */
function themeValue(key: string): ComputedRef<ThemeValue | null> {
  return computed(() => themeItem.value?.value[key] ?? null)
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): ThemeStore => ({
    ready,
    theme,
    themeList,
    themeItem,
    setTheme,
    themeValue,
  })
}

// endregion

// region 钩子逻辑

/**
 * 主题本地持久化数据。
 */
type ThemePersistenceData = {
  theme: string
}

// 主题本地存储键。
const THEME_LOCAL_STORAGE_KEY: string = 'store.persistence_data.theme'
// 主题配置仓库分类。
const THEME_SETTINGREPO_CATEGORY: string = 'framework.pc.theme'
// 主题列表配置参数的基础部分。
const THEME_SETTINGREPO_ARGS_LIST: string = 'theme_list'
// 主题仓库配置参数的基础部分。
const THEME_SETTINGREPO_ARGS_REPO: string = 'repo'

/**
 * 已触发主题加载的 Visualizer key。
 *
 * Visualizer 在应用生命周期中只确定一次，因此保存该值可以防止响应式监听重复发起加载请求。
 */
let handledVisualizerKey: string | null = null

/**
 * VIM 初始化钩子。
 */
function vimInitializedHook(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const persistenceData = loadPersistenceData()
  if (persistenceData) {
    _theme.value = persistenceData.theme
  }
  const visualizerStore = ctx.store().vueStore<'visualizer', VisualizerStore>('visualizer')
  watch(
    () => ({
      ready: visualizerStore.ready,
      visualizerKey: visualizerStore.ready ? visualizerStore.visualizerKey : null,
    }),
    (value) => {
      if (!value.ready || !value.visualizerKey) {
        return
      }
      if (handledVisualizerKey === value.visualizerKey) {
        return
      }
      handledVisualizerKey = value.visualizerKey
      const supportTheme = ctx?.library().visualizerInfo(value.visualizerKey)?.supportTheme ?? false
      loadTheme(value.visualizerKey, supportTheme).then(() => {})
    },
    { immediate: true },
  )
}

/**
 * 加载主题数据。
 *
 * 只有支持主题的 Visualizer 才需要访问配置仓库。对于不支持主题的 Visualizer，
 * 直接结束初始化流程，避免不必要的网络请求与主题配置处理。
 *
 * @param visualizerKey 当前 Visualizer 的 key。
 * @param supportTheme 当前 Visualizer 是否支持主题。
 */
async function loadTheme(visualizerKey: string, supportTheme: boolean): Promise<void> {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  if (!supportTheme) {
    setReady()
    return
  }

  try {
    const [themeListResult, themeRepoResults] = await loadThemeFromSettingrepo(visualizerKey)
    const parsedThemeList = parseThemeList(themeListResult.value)
    const builtThemeList = buildThemeList(parsedThemeList, themeRepoResults)
    _themeList.value = builtThemeList
    const resolvedTheme = resolveThemeKey(builtThemeList, _theme.value)
    _theme.value = resolvedTheme
    persistTheme(resolvedTheme)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    ctx.library().defaultVisualizerInfo().visualizer.notify('errorMessage', '加载主题失败')
    ctx.library().defaultVisualizerInfo().visualizer.notify('errorMessage', message)
  } finally {
    // 无论配置加载成功或失败，都结束支持主题的初始化流程。
    setReady()
  }
}

/**
 * 加载并校验 Visualizer 的主题配置。
 *
 * @param visualizerKey 当前 Visualizer 的 key。
 * @returns 主题列表与每个主题对应的仓库配置。
 */
async function loadThemeFromSettingrepo(
  visualizerKey: string,
): Promise<[TextNodeInspectResult, Map<string, KvNodeInspectResult | null>]> {
  const settingrepoArgsPrefix = toSnakeCase(visualizerKey)
  const themeListResult = await loadThemeListFromSettingrepo(settingrepoArgsPrefix)
  if (!themeListResult) {
    throw new Error(`Visualizer ${visualizerKey} 的主题配置不存在`)
  }
  const themeListSettingItems = parseThemeList(themeListResult.value)
  const repoResults = await Promise.all(
    themeListSettingItems.map(async (item) => {
      const result = await loadRepoFromSettingrepo(settingrepoArgsPrefix, item.key)
      return [item.key, result] as const
    }),
  )
  return [themeListResult, new Map(repoResults)]
}

/**
 * 从配置仓库加载主题列表。
 *
 * @param settingrepoArgsPrefix 配置仓库参数中的 Visualizer 前缀。
 * @returns 主题列表配置。
 */
async function loadThemeListFromSettingrepo(
  settingrepoArgsPrefix: string,
): Promise<TextNodeInspectResult | null> {
  return (await resolveResponse(
    textNodeOperateInspect({
      category: THEME_SETTINGREPO_CATEGORY,
      args: [settingrepoArgsPrefix, THEME_SETTINGREPO_ARGS_LIST],
    }),
  )) as TextNodeInspectResult | null
}

/**
 * 从配置仓库加载指定主题的 KV 节点。
 *
 * @param settingrepoArgsPrefix 配置仓库参数中的 Visualizer 前缀。
 * @param themeKey 主题 key，作为 repo 节点的第三个参数。
 * @returns 主题 KV 节点查询结果。
 */
async function loadRepoFromSettingrepo(
  settingrepoArgsPrefix: string,
  themeKey: string,
): Promise<KvNodeInspectResult | null> {
  return (await resolveResponse(
    kvNodeOperateInspectForPublic({
      category: THEME_SETTINGREPO_CATEGORY,
      args: [settingrepoArgsPrefix, THEME_SETTINGREPO_ARGS_REPO, themeKey],
    }),
  )) as KvNodeInspectResult | null
}

/**
 * 从本地存储加载持久化数据。
 *
 * @returns 持久化数据。
 */
function loadPersistenceData(): ThemePersistenceData | null {
  try {
    const raw = window.localStorage.getItem(THEME_LOCAL_STORAGE_KEY)
    const data = parseThemePersistenceData(raw)
    if (!data) {
      if (raw !== null) {
        window.localStorage.removeItem(THEME_LOCAL_STORAGE_KEY)
      }
      return null
    }
    return data
  } catch {
    window.localStorage.removeItem(THEME_LOCAL_STORAGE_KEY)
    return null
  }
}

/**
 * 持久化当前主题。
 *
 * @param value 主题键。
 */
function persistTheme(value: string): void {
  try {
    window.localStorage.setItem(
      THEME_LOCAL_STORAGE_KEY,
      serializeThemePersistenceData({ theme: value }),
    )
  } catch {
    window.localStorage.removeItem(THEME_LOCAL_STORAGE_KEY)
  }
}

// endregion

// region 数据解析逻辑

/**
 * 解析主题列表配置项。
 *
 * 配置来自 TextNode，因此需要对 JSON 内容和字段类型进行完整校验。
 *
 * @param value TextNode 的值。
 * @returns 主题列表配置项。
 */
function parseThemeList(value: string | null | undefined): ThemeListSettingItem[] {
  /**
   * 主题列表配置。
   *
   * 顶层使用对象结构，便于未来追加列表级配置。
   */
  type ThemeListSetting = {
    items: ThemeListSettingItem[]
  }

  if (value === null || value === undefined || value.trim() === '') {
    return []
  }

  let raw: unknown
  try {
    raw = JSON.parse(value) as unknown
  } catch {
    return []
  }

  if (!raw || typeof raw !== 'object') {
    return []
  }

  const items = (raw as Partial<ThemeListSetting>).items
  if (!Array.isArray(items)) {
    return []
  }

  const result: ThemeListSettingItem[] = []
  const seenKeys = new Set<string>()
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue
    }
    const key = (item as { key?: unknown }).key
    const label = (item as { label?: unknown }).label
    const remark = (item as { remark?: unknown }).remark
    if (typeof key !== 'string' || typeof label !== 'string') {
      continue
    }
    const normalizedKey = key.trim()
    const normalizedLabel = label.trim()
    if (normalizedKey === '' || normalizedLabel === '' || seenKeys.has(normalizedKey)) {
      continue
    }
    seenKeys.add(normalizedKey)
    result.push({
      key: normalizedKey,
      label: normalizedLabel,
      remark: typeof remark === 'string' ? remark : '',
    })
  }
  return result
}

/**
 * 根据主题列表配置和主题仓库构建运行时主题列表。
 *
 * 每个主题使用独立的 repo KV 节点，节点参数由可视化器前缀、repo 和主题 key 组成。
 * 主题节点不存在时以空配置处理，由可视化器自行决定空配置的默认效果。
 *
 * @param themeListSettingItems 主题列表配置项。
 * @param themeRepoResults 每个主题对应的仓库查询结果。
 * @returns 运行时主题列表。
 */
function buildThemeList(
  themeListSettingItems: readonly ThemeListSettingItem[],
  themeRepoResults: ReadonlyMap<string, KvNodeInspectResult | null>,
): ThemeItem[] {
  const normalizedItems = normalizeThemeListSettingItems(themeListSettingItems)
  return normalizedItems.map((item) => ({
    key: item.key,
    label: item.label,
    remark: item.remark,
    value: buildThemeValue(themeRepoResults.get(item.key) ?? null),
  }))
}

/**
 * 将指定主题的仓库 KV 条目转换为配置值集合。
 *
 * @param repoResult 指定主题的仓库查询结果。
 * @returns 主题配置值集合。
 */
function buildThemeValue(repoResult: KvNodeInspectResult | null): ThemeValues {
  const value: Record<string, ThemeValue> = {}
  for (const item of repoResult?.items ?? []) {
    if (!item || typeof item !== 'object') {
      continue
    }
    const key = typeof item.item_string_id === 'string' ? item.item_string_id.trim() : ''
    if (key === '' || typeof item.value !== 'string') {
      continue
    }
    value[key] = item.value
  }
  return value
}

/**
 * 规范化主题列表配置项。
 *
 * @param items 主题列表配置项。
 * @returns 去除无效项和重复 Key 后的配置项。
 */
function normalizeThemeListSettingItems(
  items: readonly ThemeListSettingItem[],
): ThemeListSettingItem[] {
  const result: ThemeListSettingItem[] = []
  const seenKeys = new Set<string>()
  for (const item of items) {
    const key = typeof item.key === 'string' ? item.key.trim() : ''
    const label = typeof item.label === 'string' ? item.label.trim() : ''
    if (key === '' || label === '' || seenKeys.has(key)) {
      continue
    }
    seenKeys.add(key)
    result.push({
      key,
      label,
      remark: typeof item.remark === 'string' ? item.remark : '',
    })
  }
  return result
}

/**
 * 选择合法的主题键。
 *
 * 优先使用当前主题，若该主题已从远端删除，则回退到第一套可用主题。
 *
 * @param availableThemes 已配置的主题列表。
 * @param preferred 优先使用的主题。
 * @returns 最终主题键。
 */
function resolveThemeKey(
  availableThemes: readonly ThemeItem[],
  preferred: string | null | undefined,
): string {
  if (preferred && availableThemes.some((item) => item.key === preferred)) {
    return preferred
  }
  return availableThemes[0]?.key ?? ''
}

/**
 * 解析本地持久化数据。
 *
 * @param value localStorage 中的原始值。
 * @returns 主题本地持久化数据。
 */
function parseThemePersistenceData(value: string | null | undefined): ThemePersistenceData | null {
  if (value === null || value === undefined || value.trim() === '') {
    return null
  }

  let raw: unknown
  try {
    raw = JSON.parse(value) as unknown
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }

  const theme = (raw as { theme?: unknown }).theme
  if (typeof theme !== 'string' || theme.trim() === '') {
    return null
  }
  return { theme }
}

/**
 * 序列化本地持久化数据。
 *
 * @param data 主题本地持久化数据。
 * @returns JSON 字符串。
 */
function serializeThemePersistenceData(data: ThemePersistenceData): string {
  return JSON.stringify({ theme: data.theme })
}

// endregion

// region VimStoreModule 定义

/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup,
}

// endregion

export default vimStoreModule
