/**
 * 停靠状态：浮动。
 */
export type DockStatusFloat = 0

/**
 * 停靠状态：顶部。
 */
export type DockStatusTop = 1

/**
 * 停靠状态：左侧。
 */
export type DockStatusLeft = 2

/**
 * 停靠状态：底部。
 */
export type DockStatusBottom = 3

/**
 * 停靠状态：右侧。
 */
export type DockStatusRight = 4

/**
 * 停靠状态。
 */
export type DockStatus =
  | DockStatusFloat
  | DockStatusTop
  | DockStatusLeft
  | DockStatusBottom
  | DockStatusRight
