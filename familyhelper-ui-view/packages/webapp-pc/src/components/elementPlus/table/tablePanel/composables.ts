// noinspection JSUnusedGlobalSymbols

import { type ComputedRef, type Ref } from 'vue'
import { computed, ref } from 'vue'

import { type PagingInfo } from '@dwarfeng/familyhelper-ui-component-api/src/util/request.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'

// -----------------------------------------------------------后端分页-----------------------------------------------------------
type UseBackendPagingTablePanelResult<T, CT> = {
  currentPage: Ref<number>
  pageSize: Ref<number>
  itemCount: Ref<number>
  items: Ref<CT[]>
  pagingInfo: ComputedRef<PagingInfo>
  updateByLookup: (res: PagedData<T>) => void
}

/**
 * 使用后端分页的表格面板。
 *
 * 该方法适用于使用后端分页的场景。
 *
 * 返回的结果中：
 * - `currentPage` 表示当前页码（起始于 `0`），可直接用于表格面板的 `currentPage` 属性，
 *   应使用 `v-model` 绑定。
 * - `pageSize` 表示每页的大小，可直接用于表格面板的 `pageSize` 属性，应使用 `v-model` 绑定。
 * - `items` 表示 component bean 列表，可直接用于表格面板的 `items` 属性。
 * - `itemCount` 表示 component bean 数量，可直接用于表格面板的 `itemCount` 属性。
 * - `pagingInfo` 表示分页信息，该方法可以快速获取分页信息，以便在调用后端接口时使用。
 * - `updateByLookup` 方法用于更新当前的 component bean 列表和 component bean 数量，
 *   当使用后端接口查询到数据后，调用此方法可以快速更新当前的 component bean 列表和数量。
 *
 * 当表格面板使用的 component bean 类型和后端接口返回的 bean 类型一致时，
 * 可以使用 {@link useIdentityBackendPagingTablePanel} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param initialPageSize 初始的分页大小。
 * @returns 调用方法后的返回结果。
 * @see useIdentityBackendPagingTablePanel
 */
export function useBackendPagingTablePanel<T, CT>(
  beanMap: (t: T) => CT,
  initialPageSize: number,
): UseBackendPagingTablePanelResult<T, CT> {
  const _currentPage = ref<number>(0)
  const _pageSize = ref<number>(initialPageSize)
  const _itemCount = ref<number>(0)
  const _items = ref<CT[]>([])

  const _pagingInfo = computed<PagingInfo>(() => {
    return {
      page: _currentPage.value,
      rows: _pageSize.value,
    }
  })

  function updateByLookup(res: PagedData<T>): void {
    _items.value = res.data.map(beanMap)
    _itemCount.value = parseInt(res.count)
    _currentPage.value = res.current_page
  }

  return {
    currentPage: _currentPage,
    pageSize: _pageSize,
    itemCount: _itemCount,
    items: _items,
    pagingInfo: _pagingInfo,
    updateByLookup,
  } as UseBackendPagingTablePanelResult<T, CT>
}

/**
 * 使用后端分页的表格面板。
 *
 * 该方法适用于使用后端分页的场景。
 *
 * 该方法可以简化表格面板使用的 component bean 类型和后端接口返回的 bean 类型一致的场景。
 *
 * 返回的结果中：
 * - `currentPage` 表示当前页码（起始于 `0`），可直接用于表格面板的 `currentPage` 属性，
 *   应使用 `v-model` 绑定。
 * - `pageSize` 表示每页的大小，可直接用于表格面板的 `pageSize` 属性，应使用 `v-model` 绑定。
 * - `items` 表示 bean 列表，可直接用于表格面板的 `items` 属性。
 * - `itemCount` 表示 bean 数量，可直接用于表格面板的 `itemCount` 属性。
 * - `pagingInfo` 表示分页信息，该方法可以快速获取分页信息，以便在调用后端接口时使用。
 * - `updateByLookup` 方法用于更新当前的 bean 列表和 bean 数量，当使用后端接口查询到数据后，
 *   调用此方法可以快速更新当前的 bean 列表和数量。
 *
 * @template T bean 类型。
 * @param initialPageSize 初始的分页大小。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityBackendPagingTablePanel<T>(
  initialPageSize: number,
): UseBackendPagingTablePanelResult<T, T> {
  return useBackendPagingTablePanel<T, T>((t) => t, initialPageSize)
}

// -----------------------------------------------------------前端分页-----------------------------------------------------------
type UseFrontendPagingTablePanelResult<T, CT> = {
  currentPage: Ref<number>
  pageSize: Ref<number>
  items: Ref<CT[]>
  itemCount: ComputedRef<number>
  updateByLookup: (res: T[]) => void
  refreshPaging: () => void
}

/**
 * 使用前端分页的表格面板。
 *
 * 该方法适用于使用前端分页的场景。
 *
 * 返回的结果中：
 * - `currentPage` 表示当前页码，可直接用于表格面板的 `currentPage` 属性，应使用 `v-model` 绑定。
 * - `pageSize` 表示每页的大小，可直接用于表格面板的 `pageSize`，应使用 `v-model` 绑定。
 * - `items` 表示当前的 component bean 列表，可直接用于表格面板的 `items` 属性，应使用 `v-model` 绑定。
 * - `itemCount` 表示当前的 component bean 数量，可直接用于表格面板的 `itemCount` 属性。
 * - `updateByLookup` 方法用于更新当前的 component bean 列表和 component bean 数量，
 *   当使用后端接口查询到数据后，调用此方法可以快速更新当前的 component bean 列表和数量。
 * - `refreshPaging` 方法用于刷新当前的分页信息，该方法可根据当前的分页信息更新 items，常用于
 *   `onPagingAttributeChanged` 事件的响应函数。
 *
 * 当表格面板使用的 component bean 类型和后端接口返回的 bean 类型一致时，
 * 可以使用 {@link useIdentityFrontendPagingTablePanel} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param initialPageSize 初始的分页大小。
 * @returns 调用方法后的返回结果。
 * @see useIdentityFrontendPagingTablePanel
 */
export function useFrontendPagingTablePanel<T, CT>(
  beanMap: (t: T) => CT,
  initialPageSize: number,
): UseFrontendPagingTablePanelResult<T, CT> {
  const _allItems = ref<CT[]>([])

  const _currentPage = ref<number>(0)
  const _pageSize = ref<number>(initialPageSize)
  const _items = ref<CT[]>([])

  const _itemCount = computed<number>(() => {
    return _allItems.value.length
  })

  function _refreshPaging(): void {
    // 计算当前 rows 下的最大页数。
    const maxPage: number = Math.floor(_allItems.value.length / _pageSize.value)
    // 如果 currentPage 超过了最大页数，则将 currentPage 设置为最大页数。
    if (_currentPage.value > maxPage) {
      _currentPage.value = maxPage
    }
    // 基于 _allItems 和分页信息更新 _items。
    const start: number = _currentPage.value * _pageSize.value
    const end: number = Math.min(start + _pageSize.value, _allItems.value.length)
    _items.value = _allItems.value.slice(start, end)
  }

  function updateByLookup(res: T[]): void {
    _allItems.value = res.map(beanMap)
    _refreshPaging()
  }

  function refreshPaging(): void {
    _refreshPaging()
  }

  return {
    currentPage: _currentPage,
    pageSize: _pageSize,
    items: _items,
    itemCount: _itemCount,
    updateByLookup,
    refreshPaging,
  } as UseFrontendPagingTablePanelResult<T, CT>
}

/**
 * 使用前端分页的表格面板。
 *
 * 该方法适用于使用前端分页的场景。
 *
 * 该方法可以简化表格面板使用的 component bean 类型和后端接口返回的 bean 类型一致的场景。
 *
 * 返回的结果中：
 * - `currentPage` 表示当前页码，可直接用于表格面板的 `currentPage` 属性，应使用 `v-model` 绑定。
 * - `pageSize` 表示每页的大小，可直接用于表格面板的 `pageSize`，应使用 `v-model` 绑定。
 * - `items` 表示当前的 bean 列表，可直接用于表格面板的 `items` 属性，应使用 `v-model` 绑定。
 * - `itemCount` 表示当前的 bean 数量，可直接用于表格面板的 `itemCount` 属性。
 * - `updateByLookup` 方法用于更新当前的 bean 列表和 bean 数量，当使用后端接口查询到数据后，
 *   调用此方法可以快速更新当前的 bean 列表和数量。
 * - `refreshPaging` 方法用于刷新当前的分页信息，该方法可根据当前的分页信息更新 items，常用于
 *   `onPagingAttributeChanged` 事件的响应函数。
 *
 * @template T bean 类型。
 * @param initialPageSize 初始的分页大小。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityFrontendPagingTablePanel<T>(
  initialPageSize: number,
): UseFrontendPagingTablePanelResult<T, T> {
  return useFrontendPagingTablePanel<T, T>((t) => t, initialPageSize)
}
