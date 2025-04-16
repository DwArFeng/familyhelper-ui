// noinspection JSUnusedGlobalSymbols

import type { Ref } from 'vue'
import { ref } from 'vue'

import type { DockStatus, UserPreference, VisualField } from './types.ts'

// -----------------------------------------------------------通用-----------------------------------------------------------
export type UseGeneralFloatyDialogResult = {
  visible: Ref<boolean>
  initialX: Ref<number>
  initialY: Ref<number>
  initialHeight: Ref<number>
  initialWidth: Ref<number>
  initialDockStatus: Ref<DockStatus>
  initialContentOpacity: Ref<number>
  updateInitialVisualField: (visualField: VisualField) => void
}

/**
 * 使用通用的浮动对话框。
 *
 * 该方法适用于使用通用浮动对话框的场景。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `initialX` 表示对话框的初始 X 坐标，可直接用于对话框的 `initialX` 属性。
 * - `initialY` 表示对话框的初始 Y 坐标，可直接用于对话框的 `initialY` 属性。
 * - `initialHeight` 表示对话框的初始高度，可直接用于对话框的 `initialHeight` 属性。
 * - `initialWidth` 表示对话框的初始宽度，可直接用于对话框的 `initialWidth` 属性。
 * - `initialDockStatus` 表示对话框的初始停靠状态，可直接用于对话框的 `initialDockStatus` 属性。
 * - `initialContentOpacity` 表示对话框的初始内容透明度，可直接用于对话框的 `initialContentOpacity` 属性。
 * - `updateInitialVisualField` 方法用于更新对话框的初始视觉字段，当浮动窗口的位置改变后，
 *   常使用此方法更新对话框的初始位置，以便用户关闭对话框并重新打开时，浮动窗口的位置不会改变，
 *   因此，该方法常用于 `onVisualFieldAdjusted` 事件的响应函数。
 *
 * @param initialVisualField 初始的视觉字段。
 */
export function useGeneralFloatyDialog(
  initialVisualField: VisualField,
): UseGeneralFloatyDialogResult {
  // noinspection DuplicatedCode
  const _visible = ref<boolean>(false)
  const _initialX = ref<number>(initialVisualField.x)
  const _initialY = ref<number>(initialVisualField.y)
  const _initialHeight = ref<number>(initialVisualField.height)
  const _initialWidth = ref<number>(initialVisualField.width)
  const _initialDockStatus = ref<DockStatus>(initialVisualField.dockStatus)
  const _initialContentOpacity = ref<number>(initialVisualField.contentOpacity)

  // noinspection DuplicatedCode
  function updateInitialVisualField(visualField: VisualField): void {
    _initialX.value = visualField.x
    _initialY.value = visualField.y
    _initialHeight.value = visualField.height
    _initialWidth.value = visualField.width
    _initialDockStatus.value = visualField.dockStatus
    _initialContentOpacity.value = visualField.contentOpacity
  }

  return {
    visible: _visible,
    initialX: _initialX,
    initialY: _initialY,
    initialHeight: _initialHeight,
    initialWidth: _initialWidth,
    initialDockStatus: _initialDockStatus,
    initialContentOpacity: _initialContentOpacity,
    updateInitialVisualField,
  } as UseGeneralFloatyDialogResult
}

// -----------------------------------------------------------用户偏好-----------------------------------------------------------
export type UseUserPreferenceFloatyDialogResult = {
  visible: Ref<boolean>
  initialX: Ref<number>
  initialY: Ref<number>
  initialHeight: Ref<number>
  initialWidth: Ref<number>
  initialDockStatus: Ref<DockStatus>
  initialContentOpacity: Ref<number>
  updateInitialVisualField: (visualField: VisualField) => void
  provideUserPreference: () => UserPreference
  applyUserPreference: (userPreference: UserPreference | null | undefined) => void
}

/**
 * 使用用户偏好的浮动对话框。
 *
 * 该方法适用于使用用户偏好的浮动对话框的场景。
 *
 * 该方法可以简化浮动对话框使用的用户偏好设置，
 * 该方法提供了浮动窗口标准的浮动面板用户偏好的获取和设置方法，
 * 使用者可以将浮动面板的用户偏好设置单独使用，也可以和场景下的其它元素的用户偏好组合使用。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `initialX` 表示对话框的初始 X 坐标，可直接用于对话框的 `initialX` 属性。
 * - `initialY` 表示对话框的初始 Y 坐标，可直接用于对话框的 `initialY` 属性。
 * - `initialHeight` 表示对话框的初始高度，可直接用于对话框的 `initialHeight` 属性。
 * - `initialWidth` 表示对话框的初始宽度，可直接用于对话框的 `initialWidth` 属性。
 * - `initialDockStatus` 表示对话框的初始停靠状态，可直接用于对话框的 `initialDockStatus` 属性。
 * - `initialContentOpacity` 表示对话框的初始内容透明度，可直接用于对话框的 `initialContentOpacity` 属性。
 * - `updateInitialVisualField` 方法用于更新对话框的初始视觉字段，当浮动窗口的位置改变后，
 *   常使用此方法更新对话框的初始位置，以便用户关闭对话框并重新打开时，浮动窗口的位置不会改变，
 *   因此，该方法常用于 `onVisualFieldAdjusted` 事件的响应函数。
 * - `provideUserPreference` 方法用于提供用户偏好设置，返回一个对象，包含了浮动窗口的标准用户偏好。
 * - `applyUserPreference` 方法用于应用用户偏好设置，接受标准的用户偏好对象，并将其应用到浮动窗口中。
 *   如果传入的用户偏好对象为 `null` 或 `undefined`，则使用初始的用户偏好设置。
 *
 * @param initialVisualField 初始的视觉字段。
 * @returns 调用方法后的返回结果。
 */
export function useUserPreferenceFloatyDialog(
  initialVisualField: VisualField,
): UseUserPreferenceFloatyDialogResult {
  // noinspection DuplicatedCode
  const _visible = ref<boolean>(false)
  const _initialX = ref<number>(initialVisualField.x)
  const _initialY = ref<number>(initialVisualField.y)
  const _initialHeight = ref<number>(initialVisualField.height)
  const _initialWidth = ref<number>(initialVisualField.width)
  const _initialDockStatus = ref<DockStatus>(initialVisualField.dockStatus)
  const _initialContentOpacity = ref<number>(initialVisualField.contentOpacity)

  function updateInitialVisualField(visualField: VisualField): void {
    _initialX.value = visualField.x
    _initialY.value = visualField.y
    _initialHeight.value = visualField.height
    _initialWidth.value = visualField.width
    _initialDockStatus.value = visualField.dockStatus
    _initialContentOpacity.value = visualField.contentOpacity
  }

  function provideUserPreference(): UserPreference {
    return {
      visible: _visible.value,
      initialX: _initialX.value,
      initialY: _initialY.value,
      initialHeight: _initialHeight.value,
      initialWidth: _initialWidth.value,
      initialDockStatus: _initialDockStatus.value,
      initialContentOpacity: _initialContentOpacity.value,
    }
  }

  function applyUserPreference(userPreference: UserPreference | null | undefined): void {
    if (userPreference === null || userPreference === undefined) {
      _visible.value = false
      _initialX.value = initialVisualField.x
      _initialY.value = initialVisualField.y
      _initialHeight.value = initialVisualField.height
      _initialWidth.value = initialVisualField.width
      _initialDockStatus.value = initialVisualField.dockStatus
      _initialContentOpacity.value = initialVisualField.contentOpacity
    } else {
      _visible.value = userPreference.visible
      _initialX.value = userPreference.initialX
      _initialY.value = userPreference.initialY
      _initialHeight.value = userPreference.initialHeight
      _initialWidth.value = userPreference.initialWidth
      _initialDockStatus.value = userPreference.initialDockStatus
      _initialContentOpacity.value = userPreference.initialContentOpacity
    }
  }

  return {
    visible: _visible,
    initialX: _initialX,
    initialY: _initialY,
    initialHeight: _initialHeight,
    initialWidth: _initialWidth,
    initialDockStatus: _initialDockStatus,
    initialContentOpacity: _initialContentOpacity,
    updateInitialVisualField,
    provideUserPreference,
    applyUserPreference,
  } as UseUserPreferenceFloatyDialogResult
}
