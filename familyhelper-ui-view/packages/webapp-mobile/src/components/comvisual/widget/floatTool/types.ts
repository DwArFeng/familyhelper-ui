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

/**
 * 调整状态：未调整。
 */
export type AdjustStatusIdle = 0

/**
 * 调整状态：正在鼠标按下。
 */
export type AdjustStatusPointerDown = 1

/**
 * 调整状态：正在移动。
 */
export type AdjustStatusMoving = 2

/**
 * 调整状态。
 */
export type AdjustStatus = AdjustStatusIdle | AdjustStatusPointerDown | AdjustStatusMoving
