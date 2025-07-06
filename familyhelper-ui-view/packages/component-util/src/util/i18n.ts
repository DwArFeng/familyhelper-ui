// noinspection JSUnusedGlobalSymbols

const FORMATTED_LOCALE_DEFAULT: string = '#default'

/**
 * 格式化地区。
 *
 * 该方法将地区格式化为字符串。
 * 示例如下:
 * |language|country|variant|result|
 * |:--|:--|:--|:--|
 * |<empty>|<empty>|<empty>|#default|
 * |zh|<empty>|<empty>|zh|
 * |ZH|<empty>|<empty>|zh|
 * |zh|cn|<empty>|zh-CN|
 * |zh|cn|tw|zh-CN-TW|
 *
 * @param language 地区的语言。
 * @param country 地区的国家。
 * @param variant 地区的变体。
 * @returns 格式化后的地区字符串。
 */
export function formatLocale(language?: string, country?: string, variant?: string): string {
  if (!language || language.trim() === '') {
    return FORMATTED_LOCALE_DEFAULT
  }
  let result = language.toLowerCase()
  if (country && country.trim() !== '') {
    result += '-' + country.toUpperCase()
  }
  if (variant && variant.trim() !== '') {
    result += '-' + variant.toUpperCase()
  }
  return result
}
