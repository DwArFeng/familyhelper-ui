// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type DisplayInfo } from '@/navigation/types.ts'

type DisplayValue = {
  label?: string
  messageKey?: string
}

type Translate = (key: string) => string

/**
 * 解析导航显示信息。
 *
 * @param displayInfo 导航显示信息。
 * @param t vue-i18n 翻译函数。
 * @returns 导航显示文本。
 */
export function parseLabel(displayInfo: DisplayInfo, t: Translate): string {
  const displayValue = displayInfo['element-plus-engineering'] as DisplayValue | undefined
  if (displayValue?.messageKey) {
    return t(displayValue.messageKey)
  }
  if (displayValue?.label) {
    return displayValue.label
  }
  const elementPlusDisplayValue = displayInfo['element-plus'] as DisplayValue | undefined
  if (elementPlusDisplayValue?.messageKey) {
    return t(elementPlusDisplayValue.messageKey)
  }
  if (elementPlusDisplayValue?.label) {
    return elementPlusDisplayValue.label
  }
  const defaultDisplayValue = displayInfo[''] as DisplayValue | undefined
  if (defaultDisplayValue?.messageKey) {
    return t(defaultDisplayValue.messageKey)
  }
  if (defaultDisplayValue?.label) {
    return defaultDisplayValue.label
  }
  return t('library.element_plus_engineering.navigation.unknown')
}
