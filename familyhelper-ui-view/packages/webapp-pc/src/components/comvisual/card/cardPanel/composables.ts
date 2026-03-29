// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type Ref } from 'vue'
import { ref } from 'vue'

// region 通用

type UseGeneralCardPanelResult<T, CT> = {
  items: Ref<CT[]>
  updateByLookup: (res: T[]) => void
}

/**
 * 使用通用的卡片面板。
 *
 * @see useIdentityGeneralCardPanel
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
 * 使用通用的卡片面板（component bean 与后端 bean 一致）。
 */
export function useIdentityGeneralCardPanel<T>(): UseGeneralCardPanelResult<T, T> {
  return useGeneralCardPanel<T, T>((t) => t)
}

// endregion
