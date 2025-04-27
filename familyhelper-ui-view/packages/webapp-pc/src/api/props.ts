// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type ApiSetting } from '@/api/types.ts'

/**
 * develop 环境的基础 URL 前缀。
 */
const developmentUrlPrefix: ApiSetting['developmentUrlPrefix'] =
  'http://localhost:8080/familyhelper_webapi_node_war_exploded'

/**
 * debug 环境的基础 URL 前缀。
 */
const debugUrlPrefix: ApiSetting['debugUrlPrefix'] =
  'http://localhost:8080/familyhelper_webapi_node_war_exploded'

/**
 * production 环境的基础 URL 前缀。
 */
const productionUrlPrefix: ApiSetting['productionUrlPrefix'] = '/familyhelper-webapi'

/**
 * Api 前缀。
 */
const apiPrefix: ApiSetting['apiPrefix'] = '/api'

/**
 * 版本前缀。
 */
const versionPrefix: ApiSetting['versionPrefix'] = '/v1'

/**
 * 超时时间。
 *
 * 该字段对应的值是一个数字，单位为毫秒。
 */
const timeout: ApiSetting['timeout'] = 600000

/**
 * 授权请求头键。
 */
const authenticationRequestHeaderKey: ApiSetting['authenticationRequestHeaderKey'] =
  'Authentication'

export {
  developmentUrlPrefix,
  debugUrlPrefix,
  productionUrlPrefix,
  apiPrefix,
  versionPrefix,
  timeout,
  authenticationRequestHeaderKey,
}
