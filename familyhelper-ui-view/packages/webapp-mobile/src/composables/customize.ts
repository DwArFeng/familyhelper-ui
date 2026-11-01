// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import vim from '@/vim'

import { type CustomizeStore, type CustomizeValue } from '@/store/modules/customize.ts'

// region 定制

/**
 * 定制值提供函数。
 *
 * 调用时读取当前定制方案中与配置键对应的字符串值，定制方案尚未就绪、没有当前方案
 * 或配置键不存在时返回 null。
 */
export type CustomizeValueProvider = (key: string) => CustomizeValue | null

/**
 * useCustomize 的返回结果。
 */
export type UseCustomizeResult = {
  cv: CustomizeValueProvider
}

/**
 * 使用定制。
 *
 * 该方法以 Customize Store 作为定制方案数据的唯一来源，只提供读取单个定制配置值的
 * 便捷方法 cv。调用方需要重新加载方案或读写本地覆盖信息时，应继续从 Customize Store
 * 获取。
 *
 * 返回的 cv 既可以在脚本中调用，也可以在组件的模板中直接调用，例如：
 *
 * ```text
 * const { cv } = useCustomize()
 * ```
 *
 * cv 每次执行时都会读取对应定制值的计算属性，因此定制方案异步加载完成、切换或重新
 * 加载后，调用方重新执行模板渲染或脚本求值时即可获得最新的定制值。
 *
 * 该方法应在 VIM 初始化完成后调用，不能在 VIM 模块初始化期间获取。
 *
 * @returns 包含定制值读取方法 cv 的返回结果。
 */
export function useCustomize(): UseCustomizeResult {
  const customizeStore = vim.ctx().store().vueStore<'customize', CustomizeStore>('customize')

  /**
   * 读取当前定制方案中指定配置键对应的值。
   *
   * @param key 定制配置键。
   * @returns 定制配置值；定制方案尚未就绪、没有当前方案或配置键不存在时返回 null。
   */
  const cv: CustomizeValueProvider = (key: string): CustomizeValue | null => {
    return customizeStore.customizeValue(key).value
  }

  return {
    cv,
  }
}

// endregion
