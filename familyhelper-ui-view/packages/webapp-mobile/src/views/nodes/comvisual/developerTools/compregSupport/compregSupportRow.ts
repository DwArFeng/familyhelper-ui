// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type JsonObject } from '@dwarfeng/familyhelper-ui-component-util/src/util/json.ts'

export type CompregSupportRow = {
  key: string
  name: string
  description: string
  exampleRouterComponentParam: Record<'' | string, JsonObject>
}
