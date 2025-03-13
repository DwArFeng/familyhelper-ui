/**
 * 停靠状态：无。
 */
export type DockStatusNone = 0

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
  | DockStatusNone
  | DockStatusTop
  | DockStatusLeft
  | DockStatusBottom
  | DockStatusRight

/**
 * 可视化字段。
 */
export type VisualField = {
  x: number
  y: number
  height: number
  width: number
  dockStatus: DockStatus
  contentOpacity: number
}

/**
 * 用户偏好。
 */
export type UserPreference = {
  visible: boolean
  initialX: number
  initialY: number
  initialHeight: number
  initialWidth: number
  initialDockStatus: DockStatus
  initialContentOpacity: number
}
