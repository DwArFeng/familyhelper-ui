// noinspection JSUnusedGlobalSymbols

import { computed, type ComputedRef, ref, type Ref } from 'vue'

import { i18n } from '@/library/modules/iahn/index.ts'

import en from 'element-plus/es/locale/lang/en'
import ja from 'element-plus/es/locale/lang/ja'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import zhHk from 'element-plus/es/locale/lang/zh-hk'
import zhTw from 'element-plus/es/locale/lang/zh-tw'

/**
 * Element Plus Engineering Visualizer 是否处于激活状态。
 *
 * 初始值设置为 false，使 Element Plus 在 Visualizer 信息完成加载前使用中文，
 * 避免初始 IAHN 地区导致非 Engineering Visualizer 出现英文界面。
 */
const elementPlusEngineeringVisualizerActive: Ref<boolean> = ref(false)

/**
 * 设置 Element Plus Engineering Visualizer 的激活状态。
 *
 * @param active 是否处于激活状态。
 */
export function setElementPlusEngineeringVisualizerActive(active: boolean): void {
  elementPlusEngineeringVisualizerActive.value = active
}

/**
 * 当前 Element Plus 地区。
 */
export const elementPlusLocale: ComputedRef<typeof en> = computed(() => {
  if (!elementPlusEngineeringVisualizerActive.value) {
    return zhCn
  }
  return resolveElementPlusLocale(i18n.global.locale.value)
})

/**
 * 将 IAHN 地区映射为 Element Plus 地区。
 *
 * @param locale IAHN 地区键。
 * @returns Element Plus 地区对象。
 */
export function resolveElementPlusLocale(locale: string): typeof en {
  const normalized = locale.trim().toLowerCase()
  if (normalized === 'zh-tw') {
    return zhTw
  }
  if (normalized === 'zh-hk' || normalized === 'zh-mo') {
    return zhHk
  }
  if (normalized === 'zh' || normalized.startsWith('zh-')) {
    return zhCn
  }
  if (normalized === 'ja' || normalized.startsWith('ja-')) {
    return ja
  }
  return en
}
