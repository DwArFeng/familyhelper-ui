// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { computed, type ComputedRef, ref } from 'vue'

import { type VimApplicationContext } from '@/vim/types.ts'
import { type StoreSetup, type VimStoreModule } from '@/store/types.ts'

import {
  type IahnNodeMessageTableInspectResult,
  type IahnNodeMessageTableInspectResultRow,
  inspectMessageTableForPublic,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/iahnNode.ts'
import {
  operateInspectForPublic as textNodeOperateInspect,
  type TextNodeInspectResult,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'

import { formatLocale } from '@dwarfeng/familyhelper-ui-component-util/src/util/i18n.ts'

import {
  applyIahnMessageSets,
  i18n,
  IAHN_DEFAULT_LOCALE,
  type IahnMessageSet,
  setIahnLocale,
} from '@/library/modules/iahn/index.ts'

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
  ctx.registerVimInitializedHook(vimInitializedLoadHook)
  ctx.registerWindowLoadHook(windowLoadHook)
}

// endregion

// region Store 定义

/**
 * 地区列表配置项。
 */
export type IahnLocaleListSettingItem = {
  language: string
  country: string
  variant: string
  label: string
}

/**
 * 运行时地区项。
 */
export type IahnLocaleItem = IahnLocaleListSettingItem & {
  locale: string
}

/**
 * IAHN Store。
 */
export type IahnStore = {
  ready: ComputedRef<boolean>
  locale: ComputedRef<string>
  localeList: ComputedRef<Readonly<IahnLocaleItem[]>>
  setLocale: (locale: string) => void
}

// Store 区域。
const _ready = ref<boolean>(false)
const _locale = ref<string>(IAHN_DEFAULT_LOCALE)
const _localeList = ref<Readonly<IahnLocaleItem[]>>([])

const ready: ComputedRef<boolean> = computed(() => _ready.value)
const locale: ComputedRef<string> = computed(() => _locale.value)
const localeList: ComputedRef<Readonly<IahnLocaleItem[]>> = computed(() => _localeList.value)

/**
 * 设置准备标记。
 */
function setReady(): void {
  _ready.value = true
}

/**
 * 设置当前地区。
 *
 * @param value 地区键。
 */
function setLocale(value: string): void {
  if (!_localeList.value.some((item) => item.locale === value)) {
    return
  }
  _locale.value = value
  setIahnLocale(value)
  persistLocale(value)
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): IahnStore => ({
    ready,
    locale,
    localeList,
    setLocale,
  })
}

// endregion

// region 钩子逻辑

/**
 * IAHN 本地持久化数据。
 */
type IahnPersistenceData = {
  locale: string
}

// IAHN 本地存储键。
const IAHN_LOCAL_STORAGE_KEY: string = 'store.persistence_data.iahn'
// IAHN 配置仓库分类。
const IAHN_SETTINGREPO_CATEGORY: string = 'framework.pc.iahn'
// IAHN 地区列表配置参数。
const IAHN_SETTINGREPO_ARGS_LOCALE_LIST: string[] = ['locale_list']
// IAHN 国际化仓库配置参数。
const IAHN_SETTINGREPO_ARGS_REPO: string[] = ['repo']

/**
 * VIM 初始化钩子。
 */
function vimInitializedLoadHook(): void {
  const persistenceData = loadPersistenceData()
  if (persistenceData) {
    _locale.value = persistenceData.locale
    setIahnLocale(persistenceData.locale)
  }
}

/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  loadIahn().then(() => {})
}

/**
 * 加载 IAHN 数据。
 */
async function loadIahn(): Promise<void> {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  try {
    const [localeListResult, repoResult] = await Promise.all([
      loadLocaleListFromSettingrepo(),
      loadRepoFromSettingrepo(),
    ])
    const parsedLocaleList = parseIahnLocaleList(localeListResult?.value)
    _localeList.value = parsedLocaleList
    await applyIahnMessageSets(buildIahnMessageSets(repoResult))
    const resolvedLocale = resolveIahnLocaleKey(parsedLocaleList, _locale.value)
    _locale.value = resolvedLocale
    setIahnLocale(resolvedLocale)
    persistLocale(resolvedLocale)
  } catch (e: unknown) {
    notifyLoadError(e)
  } finally {
    setReady()
  }
}

/**
 * 从配置仓库加载地区列表。
 *
 * @returns 地区列表配置。
 */
async function loadLocaleListFromSettingrepo(): Promise<TextNodeInspectResult | null> {
  return (await resolveResponse(
    textNodeOperateInspect({
      category: IAHN_SETTINGREPO_CATEGORY,
      args: IAHN_SETTINGREPO_ARGS_LOCALE_LIST,
    }),
  )) as TextNodeInspectResult | null
}

/**
 * 从配置仓库加载国际化消息表。
 *
 * @returns 国际化消息表。
 */
async function loadRepoFromSettingrepo(): Promise<IahnNodeMessageTableInspectResult | null> {
  return (await resolveResponse(
    inspectMessageTableForPublic({
      category: IAHN_SETTINGREPO_CATEGORY,
      args: IAHN_SETTINGREPO_ARGS_REPO,
    }),
  )) as IahnNodeMessageTableInspectResult | null
}

/**
 * 从本地存储加载持久化数据。
 *
 * @returns 持久化数据。
 */
function loadPersistenceData(): IahnPersistenceData | null {
  try {
    const raw = window.localStorage.getItem(IAHN_LOCAL_STORAGE_KEY)
    const data = parseIahnPersistenceData(raw)
    if (!data) {
      if (raw !== null) {
        window.localStorage.removeItem(IAHN_LOCAL_STORAGE_KEY)
      }
      return null
    }
    return data
  } catch {
    window.localStorage.removeItem(IAHN_LOCAL_STORAGE_KEY)
    return null
  }
}

/**
 * 持久化当前地区。
 *
 * @param value 地区键。
 */
function persistLocale(value: string): void {
  try {
    window.localStorage.setItem(
      IAHN_LOCAL_STORAGE_KEY,
      serializeIahnPersistenceData({ locale: value }),
    )
  } catch {
    window.localStorage.removeItem(IAHN_LOCAL_STORAGE_KEY)
  }
}

/**
 * 通知加载错误。
 *
 * @param e 错误对象。
 */
function notifyLoadError(e: unknown): void {
  if (!ctx) {
    return
  }
  const message = e instanceof Error ? e.message : i18n.global.t('store.iahn.error.unknown')
  ctx
    .library()
    .defaultVisualizerInfo()
    .visualizer.notify('errorMessage', i18n.global.t('store.iahn.error.load'))
  ctx.library().defaultVisualizerInfo().visualizer.notify('errorMessage', message)
}

// endregion

// region 数据解析逻辑

/**
 * 解析地区列表配置。
 *
 * 配置来自 TextNode，因此需要对 JSON 内容和字段类型进行完整校验。
 *
 * @param value TextNode 的值。
 * @returns 运行时地区列表。
 */
function parseIahnLocaleList(value: string | null | undefined): IahnLocaleItem[] {
  /**
   * 地区列表配置。
   *
   * 顶层使用对象结构，便于未来追加列表级配置。
   */
  type IahnLocaleListSetting = {
    items: IahnLocaleListSettingItem[]
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

  const items = (raw as Partial<IahnLocaleListSetting>).items
  if (!Array.isArray(items)) {
    return []
  }

  const result: IahnLocaleItem[] = []
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue
    }
    const language = (item as { language?: unknown }).language
    const country = (item as { country?: unknown }).country
    const variant = (item as { variant?: unknown }).variant
    const label = (item as { label?: unknown }).label
    if (typeof language !== 'string' || typeof label !== 'string' || label.trim() === '') {
      continue
    }
    const normalizedCountry = typeof country === 'string' ? country : ''
    const normalizedVariant = typeof variant === 'string' ? variant : ''
    const locale = formatLocale(language, normalizedCountry, normalizedVariant)
    if (locale === IAHN_DEFAULT_LOCALE) {
      continue
    }
    result.push({
      language,
      country: normalizedCountry,
      variant: normalizedVariant,
      label,
      locale,
    })
  }
  return result
}

/**
 * 解析本地持久化数据。
 *
 * @param value localStorage 中的原始值。
 * @returns IAHN 本地持久化数据。
 */
function parseIahnPersistenceData(value: string | null | undefined): IahnPersistenceData | null {
  if (value === null || value === undefined || value.trim() === '') {
    return null
  }

  let raw: unknown
  try {
    raw = JSON.parse(value) as unknown
  } catch {
    return null
  }

  if (!raw || typeof raw !== 'object') {
    return null
  }

  const locale = (raw as { locale?: unknown }).locale
  if (typeof locale !== 'string' || locale.trim() === '') {
    return null
  }
  return { locale }
}

/**
 * 序列化本地持久化数据。
 *
 * @param data IAHN 本地持久化数据。
 * @returns JSON 字符串。
 */
function serializeIahnPersistenceData(data: IahnPersistenceData): string {
  return JSON.stringify({ locale: data.locale })
}

/**
 * 选择合法的地区键。
 *
 * @param availableLocales 已配置的地区列表。
 * @param preferred 优先使用的地区。
 * @returns 最终地区键。
 */
function resolveIahnLocaleKey(
  availableLocales: readonly IahnLocaleItem[],
  preferred: string | null | undefined,
): string {
  if (preferred && availableLocales.some((item) => item.locale === preferred)) {
    return preferred
  }
  return availableLocales[0]?.locale ?? IAHN_DEFAULT_LOCALE
}

/**
 * 构建 vue-i18n 消息集合。
 *
 * 默认消息来自 IahnNode 的 default_message。地区消息缺失时由 vue-i18n 的
 * fallbackLocale 完成最终回退。
 *
 * @param result IahnNode 消息表。
 * @returns 按地区分组的消息集合。
 */
function buildIahnMessageSets(result: IahnNodeMessageTableInspectResult | null): IahnMessageSet {
  if (!result) {
    return {}
  }

  const messageSets: IahnMessageSet = { [IAHN_DEFAULT_LOCALE]: {} }
  const localeKeys: string[] = result.columns.map((column) =>
    formatLocale(column.language, column.country, column.variant),
  )

  for (const row of result.rows) {
    const mekId = normalizeMekId(row.mek_id)
    if (mekId === '') {
      continue
    }
    messageSets[IAHN_DEFAULT_LOCALE][mekId] = resolveDefaultMessage(row, mekId)
    localeKeys.forEach((locale, index) => {
      messageSets[locale] ??= {}
      const message = row.row_datas[index]?.message
      if (message !== null && message !== undefined) {
        messageSets[locale][mekId] = message
      }
    })
  }

  return messageSets
}

/**
 * 规范化 Mek ID。
 *
 * @param mekId Mek ID。
 * @returns 规范化后的 Mek ID。
 */
function normalizeMekId(mekId: string): string {
  return typeof mekId === 'string' ? mekId.trim() : ''
}

/**
 * 获取默认消息。
 *
 * @param row 国际化消息行。
 * @param mekId Mek ID。
 * @returns 默认消息。
 */
function resolveDefaultMessage(row: IahnNodeMessageTableInspectResultRow, mekId: string): string {
  if (row.default_message !== null && row.default_message !== undefined) {
    return row.default_message
  }
  return mekId
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
