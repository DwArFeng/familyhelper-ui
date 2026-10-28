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
  type TextNodeInspectResult,
  operateInspectForPublic as textNodeOperateInspectForPublic,
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
 * 定制列表配置项。
 *
 * 列表项只描述可选方案，不包含方案内容；方案内容由对应的独立 KV 节点承载。
 */
export type CustomizeListSettingItem = {
  key: string
  label: string
  remark: string
}

/**
 * 定制配置值。
 *
 * 该类型表示定制方案中单个配置键对应的值。
 */
export type CustomizeValue = string

/**
 * 定制配置值集合。
 *
 * 定制语义由可视化器自行解释，Store 只负责将方案仓库中的 KV 条目按配置字段聚合。
 */
export type CustomizeValues = Readonly<Record<string, CustomizeValue>>

/**
 * 运行时定制方案项。
 */
export type CustomizeItem = CustomizeListSettingItem & {
  value: CustomizeValues
}

/**
 * 定制方案本地覆盖条目。
 *
 * 条目只保存定制方案选择，所属 Visualizer 由覆盖映射的键表示。
 */
export type CustomizeOverrideInfoItem = {
  customizeKey: string
  override: true
}

/**
 * 定制方案本地覆盖映射。
 *
 * 覆盖映射以 Visualizer key 为键，使每个 Visualizer 可以分别保存本地覆盖。
 */
export type CustomizeOverrideInfo = Record<string, CustomizeOverrideInfoItem>

/**
 * 定制方案本地覆盖查询结果。
 *
 * 查询结果只在页面展示时补充 Visualizer key，不写入持久化映射。
 */
export type CustomizeOverrideLookup = CustomizeOverrideInfoItem & {
  visualizerKey: string
}

/**
 * Customize Store。
 */
export type CustomizeStore = {
  ready: ComputedRef<boolean>
  customizeKey: ComputedRef<string>
  customizeList: ComputedRef<Readonly<CustomizeItem[]>>
  customizeItem: ComputedRef<CustomizeItem | null>
  customizeMeta: ComputedRef<CustomizeListSettingItem | null>
  customizeMetaList: ComputedRef<Readonly<CustomizeListSettingItem[]>>
  customizeValue: (key: string) => ComputedRef<CustomizeValue | null>
  setCustomizeOverride: (customizeKey: string) => void
  getCustomizeOverrideInfo: () => CustomizeOverrideInfo
  getCustomizeOverrideInfoItem: (visualizerKey?: string) => CustomizeOverrideLookup | null
  clearCustomizeOverride: (visualizerKey?: string) => void
  setCustomizeOverrideInfoItem: (
    visualizerKey: string,
    overrideInfoItem: CustomizeOverrideInfoItem,
  ) => void
}

// Store 区域。
const _ready = ref<boolean>(false)
const _customizeKey = ref<string>('')
const _customizeList = ref<Readonly<CustomizeItem[]>>([])

const ready: ComputedRef<boolean> = computed(() => _ready.value)
const customizeKey: ComputedRef<string> = computed(() => _customizeKey.value)
const customizeList: ComputedRef<Readonly<CustomizeItem[]>> = computed(() => _customizeList.value)
const customizeItem: ComputedRef<CustomizeItem | null> = computed(() => {
  if (!_ready.value) {
    return null
  }
  return _customizeList.value.find((item) => item.key === _customizeKey.value) ?? null
})
const customizeMetaList: ComputedRef<Readonly<CustomizeListSettingItem[]>> = computed(() =>
  _customizeList.value.map(({ key, label, remark }) => ({ key, label, remark })),
)
const customizeMeta: ComputedRef<CustomizeListSettingItem | null> = computed(() => {
  if (!_ready.value) {
    return null
  }
  return _customizeList.value.find((item) => item.key === _customizeKey.value) ?? null
})

/**
 * 获取当前定制方案中指定配置键对应的响应式值。
 *
 * 调用时返回一个计算属性，该计算属性会追踪当前方案及其配置值集合。方案数据更新后，
 * 可以通过已有的计算属性读取最新结果，无需重新获取该计算属性本身。
 *
 * @param key 定制配置键。
 * @returns 当前方案中该配置键对应的值；方案不存在或配置键不存在时返回 null。
 */
function customizeValue(key: string): ComputedRef<CustomizeValue | null> {
  return computed(() => customizeItem.value?.value[key] ?? null)
}

/**
 * 设置准备标记。
 */
function setReady(): void {
  _ready.value = true
}

/**
 * 重置定制配置运行时状态。
 *
 * 开始加载新配置前清理旧状态，避免当前 Visualizer 初始化期间暴露上一个 Visualizer 的内容。
 */
function resetCustomizeState(): void {
  _ready.value = false
  _customizeKey.value = ''
  _customizeList.value = []
}

/**
 * 设置当前定制方案本地覆盖。
 *
 * 仅在方案存在于当前方案列表中时保存，确保覆盖目标有效。
 *
 * @param customizeKey 定制方案 key。
 */
function setCustomizeOverride(customizeKey: string): void {
  if (!_customizeList.value.some((item) => item.key === customizeKey)) {
    return
  }
  if (!ctx) {
    return
  }
  const visualizerStore = ctx.store().vueStore<'visualizer', VisualizerStore>('visualizer')
  if (!visualizerStore.ready) {
    return
  }
  setCustomizeOverrideInfoItem(visualizerStore.visualizerKey, {
    customizeKey,
    override: true,
  })
}

/**
 * 获取当前浏览器全部 Visualizer 的定制方案本地覆盖映射。
 *
 * 读取时兼容旧的单条记录格式，使已有本地覆盖在升级后继续生效。
 *
 * @returns 以 Visualizer key 为键的本地覆盖映射。
 */
function getCustomizeOverrideInfo(): CustomizeOverrideInfo {
  return parseCustomizeOverrideInfo(readLocalStorage(CUSTOMIZE_LOCAL_STORAGE_KEY))
}

/**
 * 获取指定 Visualizer 的定制方案本地覆盖。
 *
 * 未指定 Visualizer 时读取当前浏览器实际使用的 Visualizer；指定时可读取其他可视化器，
 * 供定制设置页面独立管理各可视化器的本地覆盖。
 *
 * @param visualizerKey 目标 Visualizer key；省略时读取当前浏览器 Visualizer。
 * @returns 有效本地覆盖查询结果；无覆盖时返回 null。
 */
function getCustomizeOverrideInfoItem(visualizerKey?: string): CustomizeOverrideLookup | null {
  const targetVisualizerKey = resolveCustomizeOverrideVisualizerKey(visualizerKey)
  if (targetVisualizerKey === null) {
    return null
  }
  const overrideInfoItem = getCustomizeOverrideInfo()[targetVisualizerKey]
  if (!overrideInfoItem) {
    return null
  }
  return {
    visualizerKey: targetVisualizerKey,
    customizeKey: overrideInfoItem.customizeKey,
    override: true,
  }
}

/**
 * 清除指定 Visualizer 的定制方案本地覆盖。
 *
 * 只删除目标 Visualizer 的映射条目，保留其他 Visualizer 的本地覆盖。未指定 Visualizer
 * 时清除当前浏览器实际使用的 Visualizer 的覆盖。
 *
 * @param visualizerKey 目标 Visualizer key；省略时清除当前浏览器 Visualizer 的覆盖。
 */
function clearCustomizeOverride(visualizerKey?: string): void {
  const targetVisualizerKey = resolveCustomizeOverrideVisualizerKey(visualizerKey)
  if (targetVisualizerKey === null) {
    return
  }
  const overrideInfo = getCustomizeOverrideInfo()
  if (!(targetVisualizerKey in overrideInfo)) {
    return
  }
  delete overrideInfo[targetVisualizerKey]
  persistCustomizeOverrideInfo(overrideInfo)
}

/**
 * 写入指定 Visualizer 的定制方案本地覆盖。
 *
 * 保存前读取完整覆盖映射，只替换目标 Visualizer 的条目，防止修改一个可视化器时
 * 覆盖其他可视化器的本地设置。旧格式会在本次写入时转换为新映射格式。
 *
 * @param visualizerKey 目标 Visualizer key。
 * @param overrideInfoItem 目标 Visualizer 的本地覆盖条目。
 */
function setCustomizeOverrideInfoItem(
  visualizerKey: string,
  overrideInfoItem: CustomizeOverrideInfoItem,
): void {
  const targetVisualizerKey = visualizerKey.trim()
  const customizeKey = overrideInfoItem.customizeKey.trim()
  if (targetVisualizerKey === '' || customizeKey === '' || !overrideInfoItem.override) {
    return
  }
  const overrideInfo = getCustomizeOverrideInfo()
  overrideInfo[targetVisualizerKey] = {
    customizeKey,
    override: true,
  }
  persistCustomizeOverrideInfo(overrideInfo)
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): CustomizeStore => ({
    ready,
    customizeKey,
    customizeList,
    customizeItem,
    customizeMeta,
    customizeMetaList,
    customizeValue,
    setCustomizeOverride,
    getCustomizeOverrideInfo,
    getCustomizeOverrideInfoItem,
    clearCustomizeOverride,
    setCustomizeOverrideInfoItem,
  })
}

// endregion

// region 钩子逻辑

// 定制配置本地存储键。
const CUSTOMIZE_LOCAL_STORAGE_KEY: string = 'store.persistence_data.customize'
// 定制配置仓库分类。
const CUSTOMIZE_SETTINGREPO_CATEGORY: string = 'framework.pc.customize'
// 定制配置仓库参数: 默认 key。
const CUSTOMIZE_SETTINGREPO_ARGS_KEY: string = 'key'
// 定制配置仓库参数: 方案列表。
const CUSTOMIZE_SETTINGREPO_ARGS_LIST: string = 'customize_list'
// 定制配置仓库参数: 方案内容仓库。
const CUSTOMIZE_SETTINGREPO_ARGS_REPO: string = 'repo'

/**
 * 已触发定制配置加载的 Visualizer key。
 *
 * 当前 Visualizer 在应用生命周期中只确定一次，保存该值可避免监听重复加载。
 */
let handledVisualizerKey: string | null = null

/**
 * VIM 初始化钩子。
 */
function vimInitializedHook(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
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
      const supportCustomize =
        ctx?.library().visualizerInfo(value.visualizerKey)?.supportCustomize ?? false
      loadCustomize(value.visualizerKey, supportCustomize).then(() => {})
    },
    { immediate: true },
  )
}

/**
 * 加载定制配置。
 *
 * 配置采用与主题相同的列表组织方式：customize_list 提供全部方案，
 * 每个方案的 repo/<customizeKey> KV 节点保存该方案的配置内容，key 则提供管理员选择的默认方案。
 * 列表、仓库和默认选择均按 Visualizer 隔离。
 *
 * @param visualizerKey 当前 Visualizer 的 key。
 * @param supportCustomize 当前 Visualizer 是否支持定制。
 */
async function loadCustomize(visualizerKey: string, supportCustomize: boolean): Promise<void> {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  resetCustomizeState()

  if (!supportCustomize) {
    setReady()
    return
  }

  const settingrepoArgsPrefix = toSnakeCase(visualizerKey)
  try {
    const [keyResult, customizeListResult] = await Promise.all([
      loadCustomizeKeyFromSettingrepo(settingrepoArgsPrefix),
      loadCustomizeListTextNodeFromSettingrepo(settingrepoArgsPrefix),
    ])
    const customizeListSettingItems =
      customizeListResult === null ? [] : parseCustomizeList(customizeListResult.value)
    if (customizeListResult === null) {
      ctx
        .library()
        .defaultVisualizerInfo()
        .visualizer.notify('errorMessage', '定制方案列表配置不存在')
    }
    if (customizeListResult !== null && customizeListSettingItems.length === 0) {
      ctx
        .library()
        .defaultVisualizerInfo()
        .visualizer.notify('errorMessage', '定制方案列表为空或格式不正确')
    }
    ensureCustomizeListSettingItemsExists(customizeListSettingItems, visualizerKey)
    const customizeRepoResults = await loadCustomizeRepoResultsFromSettingrepo(
      settingrepoArgsPrefix,
      customizeListSettingItems,
    )
    const builtCustomizeList = buildCustomizeList(customizeListSettingItems, customizeRepoResults)
    const remoteKey = (keyResult?.value ?? '').trim()
    const overrideInfo = getCustomizeOverrideInfoItem(visualizerKey)
    const resolvedKey = resolveCustomizeKey(
      builtCustomizeList,
      overrideInfo?.customizeKey,
      remoteKey,
    )

    _customizeList.value = builtCustomizeList
    _customizeKey.value = resolvedKey
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    ctx.library().defaultVisualizerInfo().visualizer.notify('errorMessage', '加载定制配置失败')
    ctx.library().defaultVisualizerInfo().visualizer.notify('errorMessage', message)
  } finally {
    // 无论配置加载成功或失败，都结束定制配置初始化流程。
    setReady()
  }
}

/**
 * 确认当前 Visualizer 至少存在一个有效定制方案。
 *
 * 该校验由加载流程独立调用，使配置缺失异常在加载边界统一处理。
 *
 * @param items 已解析的有效定制方案列表。
 * @param visualizerKey 当前 Visualizer 的 key。
 */
function ensureCustomizeListSettingItemsExists(
  items: readonly CustomizeListSettingItem[],
  visualizerKey: string,
): void {
  if (items.length === 0) {
    throw new Error(`Visualizer ${visualizerKey} 的定制方案列表配置不存在`)
  }
}

/**
 * 加载 Visualizer 中每个定制方案对应的 KV 节点。
 *
 * 列表已经确定方案范围，因此可并行读取各方案的独立仓库，避免逐个方案串行等待。
 *
 * @param settingrepoArgsPrefix 配置仓库参数中的 Visualizer 前缀。
 * @param customizeListSettingItems 定制方案列表配置项。
 * @returns 每个方案对应的仓库查询结果。
 */
async function loadCustomizeRepoResultsFromSettingrepo(
  settingrepoArgsPrefix: string,
  customizeListSettingItems: readonly CustomizeListSettingItem[],
): Promise<ReadonlyMap<string, KvNodeInspectResult | null>> {
  const repoResults = await Promise.all(
    customizeListSettingItems.map(async (item) => {
      const result = await loadCustomizeRepoFromSettingrepo(settingrepoArgsPrefix, item.key)
      return [item.key, result] as const
    }),
  )
  return new Map(repoResults)
}

/**
 * 加载 Visualizer 的默认定制方案 key。
 *
 * @param settingrepoArgsPrefix 配置仓库参数中的 Visualizer 前缀。
 * @returns 默认 key TextNode 查询结果。
 */
async function loadCustomizeKeyFromSettingrepo(
  settingrepoArgsPrefix: string,
): Promise<TextNodeInspectResult | null> {
  return (await resolveResponse(
    textNodeOperateInspectForPublic({
      category: CUSTOMIZE_SETTINGREPO_CATEGORY,
      args: [settingrepoArgsPrefix, CUSTOMIZE_SETTINGREPO_ARGS_KEY],
    }),
  )) as TextNodeInspectResult | null
}

/**
 * 从配置仓库加载定制方案列表 TextNode。
 *
 * @param settingrepoArgsPrefix 配置仓库参数中的 Visualizer 前缀。
 * @returns 方案列表 TextNode 查询结果。
 */
async function loadCustomizeListTextNodeFromSettingrepo(
  settingrepoArgsPrefix: string,
): Promise<TextNodeInspectResult | null> {
  return (await resolveResponse(
    textNodeOperateInspectForPublic({
      category: CUSTOMIZE_SETTINGREPO_CATEGORY,
      args: [settingrepoArgsPrefix, CUSTOMIZE_SETTINGREPO_ARGS_LIST],
    }),
  )) as TextNodeInspectResult | null
}

/**
 * 从配置仓库加载指定定制方案的 KV 节点。
 *
 * @param settingrepoArgsPrefix 配置仓库参数中的 Visualizer 前缀。
 * @param customizeKey 定制方案 key，作为 repo 节点的第三个参数。
 * @returns 定制方案 KV 节点查询结果。
 */
async function loadCustomizeRepoFromSettingrepo(
  settingrepoArgsPrefix: string,
  customizeKey: string,
): Promise<KvNodeInspectResult | null> {
  return (await resolveResponse(
    kvNodeOperateInspectForPublic({
      category: CUSTOMIZE_SETTINGREPO_CATEGORY,
      args: [settingrepoArgsPrefix, CUSTOMIZE_SETTINGREPO_ARGS_REPO, customizeKey],
    }),
  )) as KvNodeInspectResult | null
}

// endregion

// region 数据解析逻辑

/**
 * 解析定制方案列表。
 *
 * customize_list 的原始值与主题列表格式一致，顶层使用对象承载 items，每项包含
 * key、label、remark。顶层对象结构便于未来追加列表级配置。
 * 单个无效条目只影响自身，不会导致其他方案不可用。
 *
 * @param value TextNode 中保存的 JSON 字符串。
 * @returns 有效方案列表配置项。
 */
function parseCustomizeList(value: string | null | undefined): CustomizeListSettingItem[] {
  /**
   * 定制方案列表配置。
   */
  type CustomizeListSetting = {
    items: CustomizeListSettingItem[]
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
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return []
  }

  const items = (raw as Partial<CustomizeListSetting>).items
  if (!Array.isArray(items)) {
    return []
  }

  const result: CustomizeListSettingItem[] = []
  const seenKeys = new Set<string>()
  for (const item of items) {
    const parsedItem = parseCustomizeListItem(item)
    if (!parsedItem || seenKeys.has(parsedItem.key)) {
      continue
    }
    seenKeys.add(parsedItem.key)
    result.push(parsedItem)
  }
  return result
}

/**
 * 解析单个定制方案列表配置项。
 *
 * @param value 原始列表配置项。
 * @returns 有效列表配置项；字段不合法时返回 null。
 */
function parseCustomizeListItem(value: unknown): CustomizeListSettingItem | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  const obj = value as Record<string, unknown>
  const key = typeof obj.key === 'string' ? obj.key.trim() : ''
  const label = typeof obj.label === 'string' ? obj.label.trim() : ''
  const remark = typeof obj.remark === 'string' ? obj.remark.trim() : ''
  if (key === '' || label === '') {
    return null
  }
  return { key, label, remark }
}

/**
 * 根据定制方案列表配置和方案仓库构建运行时方案列表。
 *
 * 每个方案使用独立的 repo KV 节点，节点参数由可视化前缀、repo 和方案 key 组成。
 * 方案节点不存在时以空配置处理，由可视化器自行决定空配置的默认效果。
 *
 * @param customizeListSettingItems 定制方案列表配置项。
 * @param customizeRepoResults 每个方案对应的仓库查询结果。
 * @returns 运行时定制方案列表。
 */
function buildCustomizeList(
  customizeListSettingItems: readonly CustomizeListSettingItem[],
  customizeRepoResults: ReadonlyMap<string, KvNodeInspectResult | null>,
): CustomizeItem[] {
  const normalizedItems = normalizeCustomizeListSettingItems(customizeListSettingItems)
  return normalizedItems.map((item) => ({
    key: item.key,
    label: item.label,
    remark: item.remark,
    value: buildCustomizeValues(customizeRepoResults.get(item.key) ?? null),
  }))
}

/**
 * 将指定方案的仓库 KV 条目转换为配置值集合。
 *
 * @param repoResult 指定方案的仓库查询结果。
 * @returns 定制方案配置值集合。
 */
function buildCustomizeValues(repoResult: KvNodeInspectResult | null): CustomizeValues {
  const value: Record<string, CustomizeValue> = {}
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
 * 规范化定制方案列表配置项。
 *
 * @param items 定制方案列表配置项。
 * @returns 去除无效项和重复 Key 后的配置项。
 */
function normalizeCustomizeListSettingItems(
  items: readonly CustomizeListSettingItem[],
): CustomizeListSettingItem[] {
  const result: CustomizeListSettingItem[] = []
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
 * 按优先级选择有效的定制方案 key。
 *
 * 优先级依次为本地覆盖、远端默认、方案列表首项。无效候选会被忽略。
 *
 * @param customizeList 有效运行时方案列表。
 * @param overrideKey 本地覆盖 key。
 * @param remoteKey 远端默认 key。
 * @returns 最终方案 key；无可用方案时返回空字符串。
 */
function resolveCustomizeKey(
  customizeList: readonly CustomizeItem[],
  overrideKey: string | null | undefined,
  remoteKey: string | null | undefined,
): string {
  const availableKeys = new Set(customizeList.map((item) => item.key))
  if (overrideKey && availableKeys.has(overrideKey.trim())) {
    return overrideKey.trim()
  }
  if (remoteKey && availableKeys.has(remoteKey.trim())) {
    return remoteKey.trim()
  }
  return customizeList[0]?.key ?? ''
}

/**
 * 解析本地覆盖映射。
 *
 * @param value localStorage 中的原始值。
 * @returns 以 Visualizer key 为键的有效本地覆盖映射。
 */
function parseCustomizeOverrideInfo(value: string | null | undefined): CustomizeOverrideInfo {
  if (value === null || value === undefined || value.trim() === '') {
    return {}
  }
  try {
    const parsed = JSON.parse(value) as unknown
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    const obj = parsed as Record<string, unknown>
    const legacyInfoItem = parseLegacyCustomizeOverrideInfoItem(obj)
    if (legacyInfoItem !== null) {
      return legacyInfoItem
    }
    const result: CustomizeOverrideInfo = {}
    for (const [key, item] of Object.entries(obj)) {
      const visualizerKey = key.trim()
      const overrideInfoItem = parseCustomizeOverrideInfoItem(item)
      if (visualizerKey === '' || overrideInfoItem === null) {
        continue
      }
      result[visualizerKey] = overrideInfoItem
    }
    return result
  } catch {
    return {}
  }
}

/**
 * 解析单个本地覆盖条目。
 *
 * override 必须明确为 true，避免把关闭覆盖或损坏数据误判为有效设置。
 *
 * @param value 待解析的本地覆盖条目。
 * @returns 有效覆盖条目；无效时返回 null。
 */
function parseCustomizeOverrideInfoItem(value: unknown): CustomizeOverrideInfoItem | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  const obj = value as Record<string, unknown>
  if (
    typeof obj.customizeKey !== 'string' ||
    obj.customizeKey.trim() === '' ||
    obj.override !== true
  ) {
    return null
  }
  return {
    customizeKey: obj.customizeKey.trim(),
    override: true,
  }
}

/**
 * 解析旧版单条本地覆盖记录。
 *
 * 旧版根对象直接包含 visualizerKey、customizeKey、override。识别后转换为以
 * visualizerKey 为键的映射，以便设置页面保存时自然迁移到新格式。
 *
 * @param value 已解析的旧版候选对象。
 * @returns 转换后的覆盖映射；不是有效旧记录时返回 null。
 */
function parseLegacyCustomizeOverrideInfoItem(
  value: Record<string, unknown>,
): CustomizeOverrideInfo | null {
  if (
    typeof value.visualizerKey !== 'string' ||
    value.visualizerKey.trim() === '' ||
    typeof value.customizeKey !== 'string' ||
    value.customizeKey.trim() === '' ||
    value.override !== true
  ) {
    return null
  }
  return {
    [value.visualizerKey.trim()]: {
      customizeKey: value.customizeKey.trim(),
      override: true,
    },
  }
}

/**
 * 将本地覆盖映射写入 localStorage。
 *
 * 映射按 Visualizer key 排序后保存，保证相同内容得到稳定的存储文本；全部条目被清除后
 * 移除存储项，避免保留无意义的空对象。
 *
 * @param overrideInfo 本地覆盖映射。
 */
function persistCustomizeOverrideInfo(overrideInfo: CustomizeOverrideInfo): void {
  const keys = Object.keys(overrideInfo).sort((a, b) => a.localeCompare(b))
  if (keys.length === 0) {
    removeLocalStorage(CUSTOMIZE_LOCAL_STORAGE_KEY)
    return
  }
  const serialized: CustomizeOverrideInfo = {}
  for (const key of keys) {
    serialized[key] = overrideInfo[key]
  }
  writeLocalStorage(CUSTOMIZE_LOCAL_STORAGE_KEY, JSON.stringify(serialized))
}

/**
 * 解析本地覆盖操作的目标 Visualizer。
 *
 * 未指定时使用当前浏览器实际运行的 Visualizer；未初始化时返回 null。
 *
 * @param visualizerKey 显式指定的 Visualizer key。
 * @returns 目标 Visualizer key；无法确定时返回 null。
 */
function resolveCustomizeOverrideVisualizerKey(visualizerKey: string | undefined): string | null {
  if (visualizerKey !== undefined) {
    const normalizedKey = visualizerKey.trim()
    return normalizedKey === '' ? null : normalizedKey
  }
  if (!ctx) {
    return null
  }
  const visualizerStore = ctx.store().vueStore<'visualizer', VisualizerStore>('visualizer')
  if (!visualizerStore.ready || visualizerStore.visualizerKey === '') {
    return null
  }
  return visualizerStore.visualizerKey
}

/**
 * 读取 localStorage 值。
 *
 * @param key 存储键。
 * @returns 存储值；读取失败或不存在时返回 null。
 */
function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * 写入 localStorage 值。
 *
 * @param key 存储键。
 * @param value 存储值。
 */
function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    removeLocalStorage(key)
  }
}

/**
 * 移除 localStorage 值。
 *
 * @param key 存储键。
 */
function removeLocalStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // 存储不可用时无需进一步处理，调用方仍可继续运行。
  }
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
