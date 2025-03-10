import type { NavigationSetting } from '@/navigation/types.ts'

/**
 * 默认导航键。
 *
 * 默认展示的页面。
 */
const defaultNavigationKey: NavigationSetting['defaultNavigationKey'] = 'welcome'

/**
 * ezNav 项目是否启用。
 */
const ezNavEnabled: NavigationSetting['ezNavEnabled'] = true

/**
 * ezNav 项目最大的活动项目数。
 */
const ezNavMaxActiveItem: NavigationSetting['ezNavMaxActiveItem'] = 1000

/**
 * ezNav 在登录后还原策略。
 *   restore-pinned:  还原固定的导航栏（默认）。
 *   restore-all:     还原所有的导航栏。
 */
const ezNavRestoreWhenLogin: NavigationSetting['ezNavRestoreWhenLogin'] = 'restore-pinned'

export { defaultNavigationKey, ezNavEnabled, ezNavMaxActiveItem, ezNavRestoreWhenLogin }
