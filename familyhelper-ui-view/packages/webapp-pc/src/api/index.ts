// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import { type ApiSetting, type VimApi } from '@/api/types.ts'
import {
  apiPrefix,
  authenticationRequestHeaderKey,
  debugUrlPrefix,
  developmentUrlPrefix,
  productionUrlPrefix,
  timeout,
  versionPrefix,
} from '@/api/props.ts'

import http, { type HttpClient } from '@dwarfeng/familyhelper-ui-component-api/src/util/http.ts'
import { type LnpStore } from '@/store/modules/lnp.ts'

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'

/**
 * 缓存的基础 URL。
 */
let cachedBaseUrl: string = ''

/**
 * Api。
 */
const api: VimApi = {
  init,
  setting: setting(),
  baseUrl,
  generalClient,
  publicClient,
}

/**
 * 初始化。
 *
 * @param ctx VIM 应用上下文对象。
 */
function init(ctx: VimApplicationContext): void {
  // 检查状态。
  if (status !== 'initializing') {
    throw new Error('只能在 initializing 状态下初始化')
  }

  // 设置缓存的基础 URL。
  const env = import.meta.env.MODE
  switch (env) {
    case 'development':
      cachedBaseUrl += developmentUrlPrefix
      break
    case 'debug':
      cachedBaseUrl += debugUrlPrefix
      break
    case 'production':
      cachedBaseUrl += productionUrlPrefix
      break
    default:
      throw new Error(`未知的环境: ${env}`)
  }
  // 如果 apiPrefix 字符串不为空，则添加 '/' +  apiPrefix。
  if (apiPrefix) {
    cachedBaseUrl += apiPrefix
  }
  // 如果 versionPrefix 字符串不为空，则添加 '/' +  versionPrefix。
  if (versionPrefix) {
    cachedBaseUrl += versionPrefix
  }

  // 初始化 HTTP。
  http.init({
    getBaseUrl: () => cachedBaseUrl,
    getTimeout: () => timeout,
    getAuthenticationRequestHeaderKey: () => authenticationRequestHeaderKey,
    getToken: () => ctx.store().vueStore<'lnp', LnpStore>('lnp').token,
  })

  // 设置状态。
  status = 'initialized'
}

/**
 * 获取设置。
 *
 * @returns 设置。
 */
function setting(): ApiSetting {
  return {
    developmentUrlPrefix,
    debugUrlPrefix,
    productionUrlPrefix,
    apiPrefix,
    versionPrefix,
    timeout,
    authenticationRequestHeaderKey,
  }
}

/**
 * 获取基础 URL。
 *
 * @returns 基础 URL。
 */
function baseUrl(): string {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 baseUrl')
  }
  return cachedBaseUrl
}

/**
 * 获取通用客户端。
 *
 * @returns 通用客户端。
 */
function generalClient(): HttpClient {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 generalClient')
  }
  return http.generalClient()
}

/**
 * 获取公共客户端。
 *
 * @returns 公共客户端。
 */
function publicClient(): HttpClient {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 publicClient')
  }
  return http.publicClient()
}

export default api
