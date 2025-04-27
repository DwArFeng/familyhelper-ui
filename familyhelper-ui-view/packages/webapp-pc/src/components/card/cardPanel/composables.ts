// noinspection JSUnusedGlobalSymbols

import { type Ref } from 'vue'
import { ref } from 'vue'

// -----------------------------------------------------------通用-----------------------------------------------------------
type UseGeneralCardPanelResult<T, CT> = {
  items: Ref<CT[]>
  updateByLookup: (res: T[]) => void
}

/**
 * 使用通用的卡片面板。
 *
 * 该方法适用于使用通用卡片面板的场景。
 *
 * 返回的结果中：
 * - `items` 表示当前的 bean 列表，可直接用于卡片面板的 `items` 属性。
 * - `updateByLookup` 方法用于更新当前的 bean 列表，当使用后端接口查询到数据后，
 *  调用此方法可以快速更新当前的 component bean 列表。
 *
 * 当卡片面板的 component bean 类型和后端接口返回的 bean 类型一致时，
 * 可以使用 {@link useIdentityCardPanel} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @returns 调用方法后的返回结果。
 * @see useIdentityCardPanel
 */
export function useGeneralCardPanel<T, CT>(
  beanMap: (t: T) => CT,
): UseGeneralCardPanelResult<T, CT> {
  const _items = ref<CT[]>([])

  function updateByLookup(res: T[]): void {
    _items.value = res.map(beanMap)
  }

  return {
    items: _items,
    updateByLookup,
  } as UseGeneralCardPanelResult<T, CT>
}

/**
 * 使用通用的卡片面板。
 *
 * 该方法适用于使用通用卡片面板的场景。
 *
 * 该方法可以简化卡片面板使用的 component bean 类型和组件对话框使用的 bean 类型一致的场景。
 *
 * 返回的结果中：
 * - `items` 表示当前的 bean 列表，可直接用于卡片面板的 `items` 属性。
 * - `updateByLookup` 方法用于更新当前的 bean 列表，当使用后端接口查询到数据后，
 *  调用此方法可以快速更新当前的 component bean 列表。
 *
 * @template T bean 类型。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityCardPanel<T>(): UseGeneralCardPanelResult<T, T> {
  return useGeneralCardPanel<T, T>((t) => t)
}
