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
   */
  setting: Readonly<ApiSetting>

  /**
   * 基础 URL。
   */
  baseUrl: () => string

  /**
   * 通用 Http 客户端。
   */
  generalClient: () => HttpClient

  /**
   * 公共 Http 客户端。
   */
  publicClient: () => HttpClient
}

/**
 * Api 设置。
 */
export type ApiSetting = {
  developmentUrlPrefix: string
  debugUrlPrefix: string
  productionUrlPrefix: string
  apiPrefix: string
  versionPrefix: string
  timeout: number
  authenticationRequestHeaderKey: string
}
