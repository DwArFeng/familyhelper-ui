// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NavigationSetting } from '@/navigation/types.ts'

/**
 * 默认 Navigation key。
 *
 * 该字段对应的值是一个字符串，表示默认的 Navigation 的 key。
 *
 * 该字段的值必须是一个 `./modules/*.ts` 文件中提供的
 * `VimNavigationModule.provideNavigationNodeSettings()` 方法返回的 `NavigationNodeSetting[]`
 * 中存在的 `NavigationNodeSetting.key` 字段对应的值。
 */
const defaultNavigationKey: NavigationSetting['defaultNavigationKey'] = 'welcome'

/**
 * 是否启用 EzNav。
 *
 * 该字段对应的值是一个布尔值，表示是否启用 EzNav。
 */
const ezNavEnabled: NavigationSetting['ezNavEnabled'] = true

/**
 * EzNav 最大活动项数量。
 *
 * 该字段对应的值是一个数字，表示 EzNav 最大活动项数量。
 */
const ezNavMaxActiveItem: NavigationSetting['ezNavMaxActiveItem'] = 1000

/**
 * EzNav 恢复登录时行为。
 *
 * 该字段对应的值是一个字符串枚举，表示 EzNav 恢复登录时行为，可能的值为：
 * - `restore-pinned`：恢复固定项。
 * - `restore-all`：恢复全部项。
 */
const ezNavRestoreWhenLogin: NavigationSetting['ezNavRestoreWhenLogin'] = 'restore-pinned'

export { defaultNavigationKey, ezNavEnabled, ezNavMaxActiveItem, ezNavRestoreWhenLogin }
