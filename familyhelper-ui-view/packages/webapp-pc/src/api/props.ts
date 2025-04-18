// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { ApiSetting } from '@/api/types.ts'

const developmentUrlPrefix: ApiSetting['developmentUrlPrefix'] =
  'http://localhost:8080/familyhelper_webapi_node_war_exploded'

const debugUrlPrefix: ApiSetting['debugUrlPrefix'] =
  'http://localhost:8080/familyhelper_webapi_node_war_exploded'

const productionUrlPrefix: ApiSetting['productionUrlPrefix'] = '/familyhelper-webapi'

const apiPrefix: ApiSetting['apiPrefix'] = '/api'

const versionPrefix: ApiSetting['versionPrefix'] = '/v1'

const timeout: ApiSetting['timeout'] = 600000

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
