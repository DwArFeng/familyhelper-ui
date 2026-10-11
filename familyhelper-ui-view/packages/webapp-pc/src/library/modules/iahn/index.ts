// noinspection JSUnusedGlobalSymbols

import { type VimApplicationContext } from '@/vim/types.ts'
import { type VimLibraryModule } from '@/library/types.ts'

import { createI18n } from 'vue-i18n'

/**
 * 默认地区键。
 */
export const IAHN_DEFAULT_LOCALE: string = '#default'

/**
 * 全应用共享的 vue-i18n 实例。
 */
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  // Mek ID 是完整的消息键，父键与子键允许同时存在，不能按对象路径展开。
  flatJson: false,
  locale: IAHN_DEFAULT_LOCALE,
  fallbackLocale: IAHN_DEFAULT_LOCALE,
  messages: {
    [IAHN_DEFAULT_LOCALE]: {},
  },
  missingWarn: false,
  fallbackWarn: false,
})

/**
 * vue-i18n 消息集合。
 */
export type IahnMessageSet = Record<string, Record<string, string>>

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizerSetting,
}

/**
 * 初始化国际化支持。
 *
 * @param ctx VIM 应用上下文对象。
 */
function init(ctx: VimApplicationContext): void {
  ctx.app.use(i18n)
}

/**
 * 提供 Visualizer 设置。
 *
 * @returns 始终返回 null，表示该模块不提供可视化器。
 */
function provideVisualizerSetting(): null {
  return null
}

/**
 * 异步应用 IAHN 消息集合。
 *
 * vue-i18n 的 setLocaleMessage 本身是同步方法，此方法将消息设置安排到异步流程中执行，
 * 使调用方可以等待全部地区消息写入完成。
 *
 * @param messageSets 按地区分组的消息集合。
 */
export async function applyIahnMessageSets(messageSets: IahnMessageSet): Promise<void> {
  await Promise.resolve()
  for (const locale in messageSets) {
    i18n.global.setLocaleMessage(locale, messageSets[locale])
  }
}

/**
 * 设置 IAHN 当前地区。
 *
 * @param locale 地区键。
 */
export function setIahnLocale(locale: string): void {
  i18n.global.locale.value = locale
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale === IAHN_DEFAULT_LOCALE ? 'en' : locale
  }
}

export default vimLibraryModule
