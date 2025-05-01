// noinspection JSUnusedGlobalSymbols

import { type Ref } from 'vue'
import { ref } from 'vue'

// -----------------------------------------------------------通用-----------------------------------------------------------
type UseGeneralPagingTablePanelResult<T, CT> = {
  items: Ref<CT[]>
  updateByLookup: (res: T[]) => void
}

/**
 * 使用通用的可拖拽表格面板。
 *
 * 该方法适用于通用的可拖拽表格面板。
 *
 * 返回的结果中：
 * - `items` 表示当前的 component bean 列表，可直接用于表格面板的 `items` 属性，应使用 `v-model` 绑定。
 * - `updateByLookup` 方法用于更新当前的 component bean 列表和 bean 数量，当使用后端接口查询到数据后，
 *   调用此方法可以快速更新当前的 component bean 列表。
 *
 * 当表格面板使用的 component bean 类型和后端接口返回的 bean 类型一致时，
 * 可以使用 {@link useIdentityFrontendPagingTablePanel} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @returns 调用方法后的返回结果。
 * @see useIdentityFrontendPagingTablePanel
 */
export function useGeneralDraggableTablePanel<T, CT>(
  beanMap: (t: T) => CT,
): UseGeneralPagingTablePanelResult<T, CT> {
  const _items = ref<CT[]>([])

  function updateByLookup(res: T[]): void {
    _items.value = res.map(beanMap)
  }

  return {
    items: _items,
    updateByLookup,
  } as UseGeneralPagingTablePanelResult<T, CT>
}

/**
 * 使用可拖拽表格面板。
 *
 * 该方法适用于通用的可拖拽表格面板。
 *
 * 该方法可以简化表格面板使用的 component bean 类型和后端接口返回的 bean 类型一致的场景。
 *
 * 返回的结果中：
 * - `items` 表示当前的 bean 列表，可直接用于表格面板的 `items` 属性，应使用 `v-model` 绑定。
 * - `updateByLookup` 方法用于更新当前的 bean 列表和 bean 数量，当使用后端接口查询到数据后，
 *   调用此方法可以快速更新当前的 bean 列表。
 *
 * @template T bean 类型。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityDraggableTablePanel<T>(): UseGeneralPagingTablePanelResult<T, T> {
  return useGeneralDraggableTablePanel<T, T>((t) => t)
}
