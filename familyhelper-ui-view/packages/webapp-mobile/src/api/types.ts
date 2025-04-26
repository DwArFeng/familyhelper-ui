// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { VimComponent } from '@/vim/types.ts'
import type { HttpClient } from '@dwarfeng/familyhelper-ui-component-api/src/util/http.ts'

// -----------------------------------------------------------VIM 组件定义-----------------------------------------------------------
/**
 * VIM Api。
 */
export interface VimApi extends VimComponent {
  /**
   * Api 设置。
   *
   * 该字段对应的值是一个只读对象，包含了 Api 的设置项。
   *
   * 该字段对应的值可以在 VIM 任何状态下调用。
   */
  setting: Readonly<ApiSetting>

  /**
   * 基础 URL。
   *
   * 该字段对应的值是一个函数，调用后返回 Api 的基础 URL。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  baseUrl: () => string

  /**
   * 通用 Http 客户端。
   *
   * 该字段对应的值是一个函数，调用后返回一个 HttpClient 对象，
   * 该对象是一个通用的 Http 客户端，调用其中的方法时需要在授权请求头中提供登录认证信息。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  generalClient: () => HttpClient

  /**
   * 公共 Http 客户端。
   *
   * 该字段对应的值是一个函数，调用后返回一个 HttpClient 对象，
   * 该对象是一个公共的 Http 客户端，调用其中的方法时不需要进行验证。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  publicClient: () => HttpClient
}

/**
 * Api 设置。
 */
export type ApiSetting = {
  /**
   * development 环境的基础 URL 前缀。
   */
  developmentUrlPrefix: string

  /**
   * debug 环境的基础 URL 前缀。
   */
  debugUrlPrefix: string

  /**
   * production 环境的基础 URL 前缀。
   */
  productionUrlPrefix: string

  /**
   * Api 前缀。
   */
  apiPrefix: string

  /**
   * 版本前缀。
   */
  versionPrefix: string

  /**
   * 超时时间。
   *
   * 该字段对应的值是一个数字，单位为毫秒。
   */
  timeout: number

  /**
   * 授权请求头键。
   */
  authenticationRequestHeaderKey: string
}
