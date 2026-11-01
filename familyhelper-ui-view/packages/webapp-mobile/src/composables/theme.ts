// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import vim from '@/vim'

import { type ThemeStore, type ThemeValue } from '@/store/modules/theme.ts'

// region 主题

/**
 * 主题值提供函数。
 *
 * 调用时读取当前主题中与配置键对应的字符串值，主题尚未就绪、没有当前主题或
 * 配置键不存在时返回 null。
 */
export type ThemeValueProvider = (key: string) => ThemeValue | null

/**
 * useTheme 的返回结果。
 */
export type UseThemeResult = {
  tv: ThemeValueProvider
}

/**
 * 使用主题。
 *
 * 该方法以 Theme Store 作为主题数据的唯一来源，只提供读取单个主题配置值的
 * 便捷方法 tv。调用方需要读写其他主题状态时，应继续从 Theme Store 获取。
 * 返回的 tv 既可以在脚本中调用，也可以在组件的模板中直接调用，例如：
 *
 * ```text
 * const { tv } = useTheme()
 * ```
 *
 * tv 每次执行时都会读取对应主题值的计算属性，因此主题异步加载完成或切换主题后，
 * 调用方重新执行模板渲染或脚本求值时即可获得最新的主题值。
 *
 * 该方法应在 VIM 初始化完成后调用，不能在 VIM 模块初始化期间获取。
 *
 * @returns 包含主题值读取方法 tv 的返回结果。
 */
export function useTheme(): UseThemeResult {
  const themeStore = vim.ctx().store().vueStore<'theme', ThemeStore>('theme')

  /**
   * 读取当前主题中指定配置键对应的值。
   *
   * @param key 主题配置键。
   * @returns 主题配置值；主题尚未就绪、没有当前主题或配置键不存在时返回 null。
   */
  const tv: ThemeValueProvider = (key: string): ThemeValue | null => {
    return themeStore.themeValue(key).value
  }

  return {
    tv,
  }
}

// endregion
