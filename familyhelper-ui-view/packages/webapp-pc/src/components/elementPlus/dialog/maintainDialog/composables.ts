// noinspection JSUnusedGlobalSymbols

import { type ComputedRef, type Ref } from 'vue'
import { computed, ref } from 'vue'

// -----------------------------------------------------------通用-----------------------------------------------------------
type UseGeneralMaintainDialogResult<T, CT> = {
  visible: Ref<boolean>
  item: Ref<CT>
  mode: Ref<'CREATE' | 'EDIT' | 'INSPECT'>
  showCreateDialog: () => void
  showEditDialog: (item: T) => void
  showInspectDialog: (item: T) => void
}

/**
 * 使用通用的维护对话框。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `item` 表示当前的 bean 对象，可直接用于对话框的 `item` 属性。
 * - `mode` 表示当前的对话框模式，可直接用于对话框的 `mode` 属性。
 * - `showCreateDialog` 方法用于显示创建对话框。
 * - `showEditDialog` 方法用于显示编辑对话框，参数为要编辑的 bean 对象。
 * - `showInspectDialog` 方法用于显示查看对话框，参数为要查看的 bean 对象。
 *
 * 当维护对话框使用的 component bean 类型和组件对话框使用的 bean 类型一致时，
 * 可以使用 {@link useIdentityMaintainDialog} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param initialItem 初始的 component bean 对象。
 * @returns 调用方法后的返回结果。
 * @see useIdentityMaintainDialog
 */
export function useGeneralMaintainDialog<T, CT>(
  beanMap: (t: T) => CT,
  initialItem: CT,
): UseGeneralMaintainDialogResult<T, CT> {
  const _visible = ref<boolean>(false)
  const _item = ref<CT>(initialItem)
  const _mode = ref<'CREATE' | 'EDIT' | 'INSPECT'>('INSPECT')

  function showDialog(mode: 'CREATE' | 'EDIT' | 'INSPECT'): void {
    _mode.value = mode
    _visible.value = true
  }

  function showCreateDialog(): void {
    showDialog('CREATE')
  }

  function showEditDialog(item: T): void {
    _item.value = beanMap(item)
    showDialog('EDIT')
  }

  function showInspectDialog(item: T): void {
    _item.value = beanMap(item)
    showDialog('INSPECT')
  }

  return {
    visible: _visible,
    item: _item,
    mode: _mode,
    showCreateDialog,
    showEditDialog,
    showInspectDialog,
  } as UseGeneralMaintainDialogResult<T, CT>
}

/**
 * 使用通用的维护对话框。
 *
 * 该方法可以简化维护对话框使用的 component bean 类型和组件对话框使用的 bean 类型一致的场景。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `item` 表示当前的 bean 对象，可直接用于对话框的 `item` 属性。
 * - `mode` 表示当前的对话框模式，可直接用于对话框的 `mode` 属性。
 * - `showCreateDialog` 方法用于显示创建对话框，参数为是否保留对话框中旧的 bean 对象。
 * - `showEditDialog` 方法用于显示编辑对话框，参数为要编辑的 bean 对象。
 * - `showInspectDialog` 方法用于显示查看对话框，参数为要查看的 bean 对象。
 *
 * @template T bean 类型。
 * @param initialItem 初始的 component bean 对象。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityMaintainDialog<T>(initialItem: T): UseGeneralMaintainDialogResult<T, T> {
  return useGeneralMaintainDialog<T, T>((t) => t, initialItem)
}

// -----------------------------------------------------------仅查看-----------------------------------------------------------
type UseInspectOnlyMaintainDialogResult<T, CT> = {
  visible: Ref<boolean>
  item: Ref<CT>
  mode: ComputedRef<'INSPECT'>
  showDialog: (item: T) => void
}

/**
 * 使用仅查看的维护对话框。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `item` 表示当前的 bean 对象，可直接用于对话框的 `item` 属性。
 * - `mode` 表示当前的对话框模式，该值恒为 `INSPECT`，可直接用于对话框的 `mode` 属性。
 * - `showDialog` 方法用于显示查看对话框，参数为要查看的 bean 对象。
 *
 * 当维护对话框使用的 component bean 类型和组件对话框使用的 bean 类型一致时，
 * 可以使用 {@link useIdentityInspectOnlyMaintainDialog} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param initialItem 初始的 component bean 对象。
 * @returns 调用方法后的返回结果。
 * @see useIdentityInspectOnlyMaintainDialog
 */
export function useInspectOnlyMaintainDialog<T, CT>(
  beanMap: (t: T) => CT,
  initialItem: CT,
): UseInspectOnlyMaintainDialogResult<T, CT> {
  const _visible = ref<boolean>(false)
  const _item = ref<CT>(initialItem)
  const _mode = computed<'INSPECT'>(() => 'INSPECT')

  function showDialog(item: T): void {
    _item.value = beanMap(item)
    _visible.value = true
  }

  return {
    visible: _visible,
    item: _item,
    mode: _mode,
    showDialog,
  } as UseInspectOnlyMaintainDialogResult<T, CT>
}

/**
 * 使用仅查看的维护对话框。
 *
 * 该方法可以简化维护对话框使用的 component bean 类型和组件对话框使用的 bean 类型一致的场景。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `item` 表示当前的 bean 对象，可直接用于对话框的 `item` 属性。
 * - `mode` 表示当前的对话框模式，该值恒为 `INSPECT`，可直接用于对话框的 `mode` 属性。
 * - `showDialog` 方法用于显示查看对话框，参数为要查看的 bean 对象。
 *
 * @template T bean 类型。
 * @param initialItem 初始的 component bean 对象。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityInspectOnlyMaintainDialog<T>(
  initialItem: T,
): UseInspectOnlyMaintainDialogResult<T, T> {
  return useInspectOnlyMaintainDialog<T, T>((t) => t, initialItem)
}

// -----------------------------------------------------------仅编辑-----------------------------------------------------------
type UseEditOnlyMaintainDialogResult<T, CT> = {
  visible: Ref<boolean>
  item: Ref<CT>
  mode: ComputedRef<'EDIT'>
  showDialog: (item: T) => void
}

/**
 * 使用仅编辑的维护对话框。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `item` 表示当前的 bean 对象，可直接用于对话框的 `item` 属性。
 * - `mode` 表示当前的对话框模式，该值恒为 `EDIT`，可直接用于对话框的 `mode` 属性。
 * - `showDialog` 方法用于显示编辑对话框，参数为要编辑的 bean 对象。
 *
 * 当维护对话框使用的 component bean 类型和组件对话框使用的 bean 类型一致时，
 * 可以使用 {@link useIdentityEditOnlyMaintainDialog} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param initialItem 初始的 component bean 对象。
 * @returns 调用方法后的返回结果。
 * @see useIdentityEditOnlyMaintainDialog
 */
export function useEditOnlyMaintainDialog<T, CT>(
  beanMap: (t: T) => CT,
  initialItem: CT,
): UseEditOnlyMaintainDialogResult<T, CT> {
  const _visible = ref<boolean>(false)
  const _item = ref<CT>(initialItem)
  const _mode = computed<'EDIT'>(() => 'EDIT')

  function showDialog(item: T): void {
    _item.value = beanMap(item)
    _visible.value = true
  }

  return {
    visible: _visible,
    item: _item,
    mode: _mode,
    showDialog,
  } as UseEditOnlyMaintainDialogResult<T, CT>
}

/**
 * 使用仅编辑的维护对话框。
 *
 * 该方法可以简化维护对话框使用的 component bean 类型和组件对话框使用的 bean 类型一致的场景。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `item` 表示当前的 bean 对象，可直接用于对话框的 `item` 属性。
 * - `mode` 表示当前的对话框模式，该值恒为 `EDIT`，可直接用于对话框的 `mode` 属性。
 * - `showDialog` 方法用于显示编辑对话框，参数为要编辑的 bean 对象。
 *
 * @template T bean 类型。
 * @param initialItem 初始的 component bean 对象。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityEditOnlyMaintainDialog<T>(
  initialItem: T,
): UseEditOnlyMaintainDialogResult<T, T> {
  return useEditOnlyMaintainDialog<T, T>((t) => t, initialItem)
}

// -----------------------------------------------------------仅创建-----------------------------------------------------------
type UseCreateOnlyMaintainDialogResult<CT> = {
  visible: Ref<boolean>
  item: Ref<CT>
  mode: ComputedRef<'CREATE'>
  showDialog: () => void
}

/**
 * 使用仅创建的维护对话框。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `item` 表示当前的 bean 对象，可直接用于对话框的 `item` 属性。
 * - `mode` 表示当前的对话框模式，该值恒为 `CREATE`，可直接用于对话框的 `mode` 属性。
 * - `showDialog` 方法用于显示创建对话框。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param initialItem 初始的 component bean 对象。
 * @returns 调用方法后的返回结果。
 * @see useIdentityCreateOnlyMaintainDialog
 */
export function useCreateOnlyMaintainDialog<CT>(
  initialItem: CT,
): UseCreateOnlyMaintainDialogResult<CT> {
  const _visible = ref<boolean>(false)
  const _item = ref<CT>(initialItem)
  const _mode = computed<'CREATE'>(() => 'CREATE')

  function showDialog(): void {
    _visible.value = true
  }

  return {
    visible: _visible,
    item: _item,
    mode: _mode,
    showDialog,
  } as UseCreateOnlyMaintainDialogResult<CT>
}
