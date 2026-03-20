// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type CompregSetting } from '@/compreg/types.ts'

/**
 * 默认 Component key。
 *
 * 该字段对应的值是一个字符串，表示默认的 Component 的 key。
 *
 * 该字段的值必须是一个 `./modules/*.ts` 文件中提供的
 * `VimCompregModule.provideComponentSettings()` 方法返回的 `ComponentSetting[]`
 * 中存在的 `ComponentSetting.key` 字段对应的值。
 */
const defaultComponentKey: CompregSetting['defaultComponentKey'] = 'miscellaneous.compregFallback'

export { defaultComponentKey }
