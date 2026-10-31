// noinspection JSUnusedGlobalSymbols

// region 主题常量

/**
 * Element Plus Engineering Visualizer 的 key。
 *
 * 该 key 与 library 中可视化器模块的目录名称保持一致。
 */
export const ELEMENT_PLUS_ENGINEERING_VISUALIZER_KEY = 'element-plus-engineering'

/**
 * 已由主题功能写入目标元素的 CSS 自定义属性名称。
 *
 * 使用 WeakMap 记录写入状态，使重新应用主题时只清理主题功能自身写入的属性，
 * 不破坏调用方在目标元素上维护的其他内联 CSS 变量。
 */
const appliedThemeVariableNames: WeakMap<HTMLElement, string[]> = new WeakMap()

/**
 * 主题根元素允许设置的 CSS 自定义属性名称。
 *
 * 主题配置来自可编辑的远端数据，因此只允许写入这里登记的自定义属性。新增主题变量时，
 * 应同时在本集合、默认变量和主题 SQL 中登记，保证远端选择不会影响无关样式。
 */
export const ELEMENT_PLUS_ENGINEERING_THEME_VARIABLE_NAMES: ReadonlySet<string> = new Set([
  // Element Plus 基础颜色。
  '--el-color-white',
  '--el-color-black',
  '--el-color-primary',
  '--el-color-primary-rgb',
  '--el-color-primary-light-3',
  '--el-color-primary-light-5',
  '--el-color-primary-light-7',
  '--el-color-primary-light-8',
  '--el-color-primary-light-9',
  '--el-color-primary-dark-2',
  '--el-color-success',
  '--el-color-success-rgb',
  '--el-color-success-light-3',
  '--el-color-success-light-5',
  '--el-color-success-light-7',
  '--el-color-success-light-8',
  '--el-color-success-light-9',
  '--el-color-success-dark-2',
  '--el-color-warning',
  '--el-color-warning-rgb',
  '--el-color-warning-light-3',
  '--el-color-warning-light-5',
  '--el-color-warning-light-7',
  '--el-color-warning-light-8',
  '--el-color-warning-light-9',
  '--el-color-warning-dark-2',
  '--el-color-danger',
  '--el-color-danger-rgb',
  '--el-color-danger-light-3',
  '--el-color-danger-light-5',
  '--el-color-danger-light-7',
  '--el-color-danger-light-8',
  '--el-color-danger-light-9',
  '--el-color-danger-dark-2',
  '--el-color-error',
  '--el-color-error-rgb',
  '--el-color-error-light-3',
  '--el-color-error-light-5',
  '--el-color-error-light-7',
  '--el-color-error-light-8',
  '--el-color-error-light-9',
  '--el-color-error-dark-2',
  '--el-color-info',
  '--el-color-info-rgb',
  '--el-color-info-light-3',
  '--el-color-info-light-5',
  '--el-color-info-light-7',
  '--el-color-info-light-8',
  '--el-color-info-light-9',
  '--el-color-info-dark-2',
  // Element Plus 背景与文字。
  '--el-bg-color',
  '--el-bg-color-page',
  '--el-bg-color-overlay',
  '--el-text-color-primary',
  '--el-text-color-regular',
  '--el-text-color-secondary',
  '--el-text-color-placeholder',
  '--el-text-color-disabled',
  // Element Plus 边框与填充。
  '--el-border-color',
  '--el-border-color-light',
  '--el-border-color-lighter',
  '--el-border-color-extra-light',
  '--el-border-color-dark',
  '--el-border-color-darker',
  '--el-fill-color',
  '--el-fill-color-light',
  '--el-fill-color-lighter',
  '--el-fill-color-extra-light',
  '--el-fill-color-dark',
  '--el-fill-color-darker',
  '--el-fill-color-blank',
  '--el-mask-color',
  '--el-mask-color-extra-light',
  '--el-overlay-color',
  '--el-overlay-color-light',
  '--el-overlay-color-lighter',
  '--el-disabled-bg-color',
  '--el-disabled-text-color',
  '--el-disabled-border-color',
  '--el-border-color-hover',
  '--el-svg-monochrome-grey',
  '--el-popup-modal-bg-color',
  '--el-popup-modal-opacity',
  '--el-menu-active-color',
  '--el-menu-text-color',
  '--el-menu-hover-text-color',
  '--el-menu-bg-color',
  '--el-menu-hover-bg-color',
  '--el-menu-item-font-size',
  '--el-menu-item-hover-fill',
  '--el-menu-border-color',
  // Element Plus 字体、尺寸、圆角与阴影。
  '--el-font-family',
  '--el-font-size-extra-large',
  '--el-font-size-large',
  '--el-font-size-medium',
  '--el-font-size-base',
  '--el-font-size-small',
  '--el-font-size-extra-small',
  '--el-font-weight-primary',
  '--el-font-line-height-primary',
  '--el-component-size-large',
  '--el-component-size',
  '--el-component-size-small',
  '--el-border-radius-base',
  '--el-border-radius-small',
  '--el-border-radius-round',
  '--el-border-width',
  '--el-box-shadow',
  '--el-box-shadow-light',
  '--el-box-shadow-lighter',
  '--el-box-shadow-dark',
  // 工程化导航。
  '--element-plus-engineering-navbar-background',
  '--element-plus-engineering-navbar-text-color',
  '--element-plus-engineering-navbar-hover-background',
  '--element-plus-engineering-navbar-shadow',
  '--element-plus-engineering-navbar-border-color',
  // 工程化侧边栏及 EZ Nav。
  '--element-plus-engineering-sidebar-background',
  '--element-plus-engineering-sidebar-text-color',
  '--element-plus-engineering-sidebar-active-text-color',
  '--element-plus-engineering-workbench-background',
  '--element-plus-engineering-ez-nav-background',
  '--element-plus-engineering-ez-nav-text-color',
  '--element-plus-engineering-ez-nav-border-color',
  '--element-plus-engineering-ez-nav-active-background',
  '--element-plus-engineering-ez-nav-active-text-color',
  // 工程化浮窗与菜单。
  '--element-plus-engineering-panel-background',
  '--element-plus-engineering-panel-header-background',
  '--element-plus-engineering-panel-border-color',
  '--element-plus-engineering-panel-shadow',
  '--element-plus-engineering-menu-background',
  '--element-plus-engineering-menu-text-color',
  '--element-plus-engineering-menu-border-color',
  '--element-plus-engineering-menu-hover-background',
  '--element-plus-engineering-menu-shadow',
  '--element-plus-engineering-content-placeholder-color',
  '--element-plus-engineering-hover-background',
  '--element-plus-engineering-active-background',
  '--element-plus-engineering-toolbar-background',
  '--element-plus-engineering-toolbar-text-color',
  '--element-plus-engineering-error-panel-background',
  '--element-plus-engineering-error-text-background',
  '--element-plus-engineering-error-title-color',
  '--element-plus-engineering-error-title-shadow',
  '--element-plus-engineering-login-panel-background',
  '--element-plus-engineering-login-loading-mask-background',
  '--element-plus-engineering-login-accent-color',
  '--element-plus-engineering-login-text-color',
  '--element-plus-engineering-login-title-shadow',
  '--element-plus-engineering-login-subtitle-shadow',
  // 工程化字体、字号。
  '--element-plus-engineering-font-family',
  '--element-plus-engineering-font-size-small',
  '--element-plus-engineering-font-size-base',
  '--element-plus-engineering-font-size-large',
  '--element-plus-engineering-font-size-title',
  '--element-plus-engineering-font-size-display',
  '--element-plus-engineering-font-size-icon-large',
  '--element-plus-engineering-font-size-file-type',
  '--element-plus-engineering-font-size-error-title',
  '--element-plus-engineering-font-size-floaty-placeholder',
  '--element-plus-engineering-font-size-login-title',
  '--element-plus-engineering-font-size-login-subtitle',
  // Element Plus 组件局部固定值颜色、字体覆盖入口。
  '--el-alert-title-font-size-override',
  '--el-alert-title-with-description-font-size-override',
  '--el-alert-description-font-size-override',
  '--el-alert-close-font-size-override',
  '--el-alert-close-customed-font-size-override',
  '--el-badge-font-size-override',
  '--el-button-divide-border-color-override',
  '--el-carousel-arrow-font-size-override',
  '--el-carousel-arrow-background-override',
  '--el-carousel-arrow-hover-background-override',
  '--el-checkbox-font-size-override',
  '--el-collapse-header-font-size-override',
  '--el-collapse-content-font-size-override',
  '--el-color-picker-alpha-bg-a-override',
  '--el-color-picker-alpha-bg-b-override',
  '--el-dialog-content-font-size-override',
  '--el-empty-fill-color-1-override',
  '--el-empty-fill-color-2-override',
  '--el-empty-fill-color-3-override',
  '--el-empty-fill-color-4-override',
  '--el-empty-fill-color-5-override',
  '--el-empty-fill-color-6-override',
  '--el-empty-fill-color-7-override',
  '--el-empty-fill-color-8-override',
  '--el-empty-fill-color-9-override',
  '--el-input-tag-line-height-override',
  '--el-input-tag-font-size-override',
  '--el-input-otp-font-size-override',
  '--el-messagebox-error-font-size-override',
  '--el-notification-title-font-size-override',
  '--el-pagination-font-size-override',
  '--el-pagination-font-size-small-override',
  '--el-popover-title-font-size-override',
  '--el-rate-fill-color-override',
  '--el-result-icon-font-size-override',
  '--el-result-title-font-size-override',
  '--el-select-input-font-size-override',
  '--el-tag-font-size-override',
  '--el-statistic-title-font-weight-override',
  '--el-statistic-content-font-weight-override',
  '--el-tour-title-font-size-override',
  '--el-tour-title-font-weight-override',
  '--el-tour-font-size-override',
  '--el-tour-title-text-color-override',
  '--el-tour-text-color-override',
  '--el-tour-close-color-override',
  '--el-anchor-line-height-override',
  '--el-anchor-font-size-override',
])

/**
 * 默认主题配置。
 *
 * 这些值保留当前 Element Plus Engineering 的默认视觉效果，并补齐主题功能需要的颜色、
 * 字体和字号变量。默认值通过 `global.css` 注册到主题根元素上，本对象与默认变量集合用于
 * 运行时约束可以写入主题根元素的变量名称。
 */
export const ELEMENT_PLUS_ENGINEERING_DEFAULT_THEME: Readonly<Record<string, string>> = {
  '--el-color-white': '#ffffff',
  '--el-color-black': '#000000',
  '--el-color-primary': '#409eff',
  '--el-color-primary-rgb': '64, 158, 255',
  '--el-color-primary-light-3': '#79bbff',
  '--el-color-primary-light-5': '#a0cfff',
  '--el-color-primary-light-7': '#c6e2ff',
  '--el-color-primary-light-8': '#d9ecff',
  '--el-color-primary-light-9': '#ecf5ff',
  '--el-color-primary-dark-2': '#337ecc',
  '--el-color-success': '#67c23a',
  '--el-color-success-rgb': '103, 194, 58',
  '--el-color-success-light-3': '#95d475',
  '--el-color-success-light-5': '#b3e19d',
  '--el-color-success-light-7': '#d1edc4',
  '--el-color-success-light-8': '#e1f3d8',
  '--el-color-success-light-9': '#f0f9eb',
  '--el-color-success-dark-2': '#529b2e',
  '--el-color-warning': '#e6a23c',
  '--el-color-warning-rgb': '230, 162, 60',
  '--el-color-warning-light-3': '#eebe77',
  '--el-color-warning-light-5': '#f3d19e',
  '--el-color-warning-light-7': '#f8e3c5',
  '--el-color-warning-light-8': '#faecd8',
  '--el-color-warning-light-9': '#fdf6ec',
  '--el-color-warning-dark-2': '#b88230',
  '--el-color-danger': '#f56c6c',
  '--el-color-danger-rgb': '245, 108, 108',
  '--el-color-danger-light-3': '#f89898',
  '--el-color-danger-light-5': '#fab6b6',
  '--el-color-danger-light-7': '#fcd3d3',
  '--el-color-danger-light-8': '#fde2e2',
  '--el-color-danger-light-9': '#fef0f0',
  '--el-color-danger-dark-2': '#c45656',
  '--el-color-error': '#f56c6c',
  '--el-color-error-rgb': '245, 108, 108',
  '--el-color-error-light-3': '#f89898',
  '--el-color-error-light-5': '#fab6b6',
  '--el-color-error-light-7': '#fcd3d3',
  '--el-color-error-light-8': '#fde2e2',
  '--el-color-error-light-9': '#fef0f0',
  '--el-color-error-dark-2': '#c45656',
  '--el-color-info': '#909399',
  '--el-color-info-rgb': '144, 147, 153',
  '--el-color-info-light-3': '#b1b3b8',
  '--el-color-info-light-5': '#c8c9cc',
  '--el-color-info-light-7': '#dedfe0',
  '--el-color-info-light-8': '#e9e9eb',
  '--el-color-info-light-9': '#f4f4f5',
  '--el-color-info-dark-2': '#73767a',
  '--el-bg-color': '#ffffff',
  '--el-bg-color-page': '#f2f3f5',
  '--el-bg-color-overlay': '#ffffff',
  '--el-text-color-primary': '#303133',
  '--el-text-color-regular': '#606266',
  '--el-text-color-secondary': '#909399',
  '--el-text-color-placeholder': '#a8abb2',
  '--el-text-color-disabled': '#c0c4cc',
  '--el-border-color': '#dcdfe6',
  '--el-border-color-light': '#e4e7ed',
  '--el-border-color-lighter': '#ebeef5',
  '--el-border-color-extra-light': '#f2f6fc',
  '--el-border-color-dark': '#d4d7de',
  '--el-border-color-darker': '#cdd0d6',
  '--el-fill-color': '#f0f2f5',
  '--el-fill-color-light': '#f5f7fa',
  '--el-fill-color-lighter': '#fafafa',
  '--el-fill-color-extra-light': '#fafcff',
  '--el-fill-color-dark': '#ebedf0',
  '--el-fill-color-darker': '#e6e8eb',
  '--el-fill-color-blank': '#ffffff',
  '--el-mask-color': 'rgba(255, 255, 255, 0.9)',
  '--el-mask-color-extra-light': 'rgba(255, 255, 255, 0.3)',
  '--el-overlay-color': 'rgba(0, 0, 0, 0.8)',
  '--el-overlay-color-light': 'rgba(0, 0, 0, 0.7)',
  '--el-overlay-color-lighter': 'rgba(0, 0, 0, 0.5)',
  '--el-disabled-bg-color': 'var(--el-fill-color-light)',
  '--el-disabled-text-color': 'var(--el-text-color-placeholder)',
  '--el-disabled-border-color': 'var(--el-border-color-light)',
  '--el-border-color-hover': 'var(--el-text-color-disabled)',
  '--el-svg-monochrome-grey': 'var(--el-border-color)',
  '--el-popup-modal-bg-color': 'var(--el-color-black)',
  '--el-popup-modal-opacity': '0.5',
  '--el-menu-active-color': '#ffd04b',
  '--el-menu-text-color': '#ffffff',
  '--el-menu-hover-text-color': '#ffffff',
  '--el-menu-bg-color': '#2d3a4b',
  '--el-menu-hover-bg-color': '#242e3c',
  '--el-menu-item-font-size': 'var(--el-font-size-base)',
  '--el-menu-item-hover-fill': '#242e3c',
  '--el-menu-border-color': 'var(--el-border-color)',
  '--el-font-family':
    "'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif",
  '--el-font-size-extra-large': '20px',
  '--el-font-size-large': '18px',
  '--el-font-size-medium': '16px',
  '--el-font-size-base': '14px',
  '--el-font-size-small': '13px',
  '--el-font-size-extra-small': '12px',
  '--el-font-weight-primary': '500',
  '--el-font-line-height-primary': '24px',
  '--el-component-size-large': '40px',
  '--el-component-size': '32px',
  '--el-component-size-small': '24px',
  '--el-border-radius-base': '4px',
  '--el-border-radius-small': '2px',
  '--el-border-radius-round': '20px',
  '--el-border-width': '1px',
  '--el-box-shadow': '0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px rgba(0, 0, 0, 0.08)',
  '--el-box-shadow-light': '0px 0px 12px rgba(0, 0, 0, 0.12)',
  '--el-box-shadow-lighter': '0px 0px 6px rgba(0, 0, 0, 0.12)',
  '--el-box-shadow-dark':
    '0px 16px 48px 16px rgba(0, 0, 0, 0.08), 0px 12px 32px rgba(0, 0, 0, 0.12), 0px 8px 16px -8px rgba(0, 0, 0, 0.16)',
  '--element-plus-engineering-navbar-background': '#ffffff',
  '--element-plus-engineering-navbar-text-color': '#889aa4',
  '--element-plus-engineering-navbar-hover-background': 'rgba(0, 0, 0, 0.025)',
  '--element-plus-engineering-navbar-shadow': '0 1px 4px rgba(0, 21, 41, 0.08)',
  '--element-plus-engineering-navbar-border-color': '#d8dce5',
  '--element-plus-engineering-sidebar-background': '#2d3a4b',
  '--element-plus-engineering-sidebar-text-color': '#ffffff',
  '--element-plus-engineering-sidebar-active-text-color': '#ffd04b',
  '--element-plus-engineering-workbench-background': '#ffffff',
  '--element-plus-engineering-ez-nav-background': '#ffffff',
  '--element-plus-engineering-ez-nav-text-color': '#495060',
  '--element-plus-engineering-ez-nav-border-color': '#d8dce5',
  '--element-plus-engineering-ez-nav-active-background': '#42b983',
  '--element-plus-engineering-ez-nav-active-text-color': '#ffffff',
  '--element-plus-engineering-panel-background': '#ffffff',
  '--element-plus-engineering-panel-header-background': '#f5f7fa',
  '--element-plus-engineering-panel-border-color': '#d8dce5',
  '--element-plus-engineering-panel-shadow':
    '0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04)',
  '--element-plus-engineering-menu-background': '#ffffff',
  '--element-plus-engineering-menu-text-color': '#333333',
  '--element-plus-engineering-menu-border-color': '#7f7f7f',
  '--element-plus-engineering-menu-hover-background': '#eeeeee',
  '--element-plus-engineering-menu-shadow': '2px 2px 3px 0 rgba(0, 0, 0, 0.3)',
  '--element-plus-engineering-content-placeholder-color': '#bfbfbf',
  '--element-plus-engineering-hover-background': 'rgba(0, 0, 0, 0.025)',
  '--element-plus-engineering-active-background': '#409eff',
  '--element-plus-engineering-toolbar-background': '#d6d6d6',
  '--element-plus-engineering-toolbar-text-color': '#ffffff',
  '--element-plus-engineering-error-panel-background': 'rgba(225, 225, 225, 0.5)',
  '--element-plus-engineering-error-text-background': 'rgba(255, 255, 255, 0.8)',
  '--element-plus-engineering-error-title-color': '#7bbdff',
  '--element-plus-engineering-error-title-shadow': '0 0 8px #000000',
  '--element-plus-engineering-login-panel-background': 'rgba(128, 128, 128, 0.5)',
  '--element-plus-engineering-login-loading-mask-background': 'rgba(0, 0, 0, 0.1)',
  '--element-plus-engineering-login-accent-color': '#7bbdff',
  '--element-plus-engineering-login-text-color': '#ffffff',
  '--element-plus-engineering-login-title-shadow': '0 0 8px #000000',
  '--element-plus-engineering-login-subtitle-shadow': '0 0 4px #000000',
  '--element-plus-engineering-font-family':
    "'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif",
  '--element-plus-engineering-font-size-small': '12px',
  '--element-plus-engineering-font-size-base': '14px',
  '--element-plus-engineering-font-size-large': '16px',
  '--element-plus-engineering-font-size-title': '18px',
  '--element-plus-engineering-font-size-display': '40px',
  '--element-plus-engineering-font-size-icon-large': '32px',
  '--element-plus-engineering-font-size-file-type': '48px',
  '--element-plus-engineering-font-size-error-title': '58px',
  '--element-plus-engineering-font-size-floaty-placeholder': '64px',
  '--element-plus-engineering-font-size-login-title': '64px',
  '--element-plus-engineering-font-size-login-subtitle': '24px',
  '--el-alert-title-font-size-override': '14px',
  '--el-alert-title-with-description-font-size-override': '16px',
  '--el-alert-description-font-size-override': '14px',
  '--el-alert-close-font-size-override': '16px',
  '--el-alert-close-customed-font-size-override': '14px',
  '--el-badge-font-size-override': '12px',
  '--el-button-divide-border-color-override': '#ffffff80',
  '--el-carousel-arrow-font-size-override': '12px',
  '--el-carousel-arrow-background-override': '#1f2d3d1c',
  '--el-carousel-arrow-hover-background-override': '#1f2d3d3b',
  '--el-checkbox-font-size-override': '14px',
  '--el-collapse-header-font-size-override': '13px',
  '--el-collapse-content-font-size-override': '13px',
  '--el-color-picker-alpha-bg-a-override': '#cccccc',
  '--el-color-picker-alpha-bg-b-override': 'transparent',
  '--el-dialog-content-font-size-override': '14px',
  '--el-empty-fill-color-1-override': '#fcfcfd',
  '--el-empty-fill-color-2-override': '#f8f9fb',
  '--el-empty-fill-color-3-override': '#f7f8fc',
  '--el-empty-fill-color-4-override': '#eeeff3',
  '--el-empty-fill-color-5-override': '#edeef2',
  '--el-empty-fill-color-6-override': '#e9ebef',
  '--el-empty-fill-color-7-override': '#e5e7e9',
  '--el-empty-fill-color-8-override': '#e0e3e9',
  '--el-empty-fill-color-9-override': '#d5d7de',
  '--el-input-tag-line-height-override': '24px',
  '--el-input-tag-font-size-override': '14px',
  '--el-input-otp-font-size-override': '14px',
  '--el-messagebox-error-font-size-override': '12px',
  '--el-notification-title-font-size-override': '16px',
  '--el-pagination-font-size-override': '14px',
  '--el-pagination-font-size-small-override': '12px',
  '--el-popover-title-font-size-override': '16px',
  '--el-rate-fill-color-override': '#f7ba2a',
  '--el-result-icon-font-size-override': '64px',
  '--el-result-title-font-size-override': '20px',
  '--el-select-input-font-size-override': '14px',
  '--el-tag-font-size-override': '12px',
  '--el-statistic-title-font-weight-override': '400',
  '--el-statistic-content-font-weight-override': '400',
  '--el-tour-title-font-size-override': '16px',
  '--el-tour-title-font-weight-override': '400',
  '--el-tour-font-size-override': '14px',
  '--el-tour-title-text-color-override': '#ffffff',
  '--el-tour-text-color-override': '#ffffff',
  '--el-tour-close-color-override': '#ffffff',
  '--el-anchor-line-height-override': '22px',
  '--el-anchor-font-size-override': '12px',
}

// endregion

// region 主题属性处理

/**
 * 判断主题变量名称是否属于 Element Plus Engineering 的可控变量。
 *
 * @param name 待判断的配置键。
 * @returns 是否为允许应用到主题根元素的 CSS 自定义属性名称。
 */
export function isElementPlusEngineeringThemeVariableName(name: string): boolean {
  return ELEMENT_PLUS_ENGINEERING_THEME_VARIABLE_NAMES.has(name)
}

/**
 * 判断主题变量值是否可以作为 CSS 自定义属性值应用。
 *
 * 空值、声明结束符、声明起始符以及空字符可能改变样式结构，因此直接拒绝。
 *
 * @param value 待判断的配置值。
 * @returns 是否为安全的 CSS 自定义属性值。
 */
export function isElementPlusEngineeringThemeVariableValue(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }
  const normalizedValue = value.trim()
  return normalizedValue !== '' && !/[;{}\0]/.test(normalizedValue)
}

/**
 * 读取当前主题允许应用的配置值。
 *
 * 主题 Store 中的仓储数据可能由人工维护，读取后只保留本可视化器登记过的 CSS 自定义属性，
 * 从而防止主题数据写入无关 CSS 声明。
 *
 * @param themeValues 当前主题的配置值集合。
 * @returns 可安全应用的主题配置值。
 */
export function resolveElementPlusEngineeringThemeValues(
  themeValues: Readonly<Record<string, string>> | null | undefined,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [name, value] of Object.entries(themeValues ?? {})) {
    if (
      isElementPlusEngineeringThemeVariableName(name) &&
      isElementPlusEngineeringThemeVariableValue(value)
    ) {
      result[name] = value
    }
  }
  return result
}

/**
 * 清除目标元素上由主题功能写入的 CSS 自定义属性。
 *
 * 该方法只移除主题功能记录过的变量，不影响目标元素上已有的其他内联样式。
 *
 * @param element 目标元素。
 */
export function clearElementPlusEngineeringThemeValues(element: HTMLElement): void {
  const appliedNames = appliedThemeVariableNames.get(element) ?? []
  appliedNames.forEach((name) => {
    element.style.removeProperty(name)
  })
  appliedThemeVariableNames.delete(element)
}

/**
 * 将 Element Plus Engineering 主题应用到目标元素。
 *
 * 默认主题与当前主题值合并后写入目标元素。当前主题只允许覆盖白名单中的变量，未登记的
 * 变量、空值和可能破坏 CSS 声明的值会被忽略。
 *
 * @param element 目标元素。
 * @param themeValues 当前主题的配置值。
 */
export function applyElementPlusEngineeringThemeValues(
  element: HTMLElement,
  themeValues: Readonly<Record<string, string>> | null | undefined,
): void {
  clearElementPlusEngineeringThemeValues(element)
  const values: Readonly<Record<string, string>> = {
    ...ELEMENT_PLUS_ENGINEERING_DEFAULT_THEME,
    ...resolveElementPlusEngineeringThemeValues(themeValues),
  }
  const appliedNames: string[] = []
  for (const [name, value] of Object.entries(values)) {
    element.style.setProperty(name, value)
    appliedNames.push(name)
  }
  appliedThemeVariableNames.set(element, appliedNames)
}

// endregion
