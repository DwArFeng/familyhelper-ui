/*
 * 默认项目。
 * 当前模块切换到本模块时展示的默认项目。
 */
const defaultItemKey = 'welcome';

export { defaultItemKey };

/*
 * 附加项目。
 */
/**
 * ezNav 项目是否启用。
 */
const ezNavEnabled = true;

/**
 * ezNav 项目最大的活动项目数。
 */
const ezNavMaxActiveItem = 1000;

/**
 * ezNav 在登录后还原策略。
 *   restore-pinned:  还原固定的导航栏（默认）。
 *   restore-all:     还原所有的导航栏。
 */
const ezNavRestoreWhenLogin = 'restore-pinned';

export { ezNavEnabled, ezNavMaxActiveItem, ezNavRestoreWhenLogin };
