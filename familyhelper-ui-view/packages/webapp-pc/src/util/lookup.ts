// noinspection JSUnusedGlobalSymbols

import type { PagingInfo } from '@dwarfeng/familyhelper-ui-component-api/src/util/request.ts'
import type {
  PagedData,
  Prespa,
} from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'

import { resolveResponse } from '@/util/response.ts'

/**
 * 查询数据，并返回数据列表。
 *
 * 该方法会自动调整查询的页数，以确保查询的页数不超过总页数。
 * 当查询的页数大于总页数时，则会将分页信息调整为最后一页，并重新查询。
 *
 * @param lookupHandler 查询处理器。
 * @param pagingInfo 分页信息。
 */
export async function lookupWithAdjustPage<E>(
  lookupHandler: (pagingInfo: PagingInfo) => Prespa<E>,
  pagingInfo: PagingInfo,
): Promise<PagedData<E>> {
  const testResult: PagedData<E> = await resolveResponse(lookupHandler(pagingInfo))
  // 当查询的页数大于总页数，查询最后一页。
  if (testResult.current_page > testResult.total_pages && testResult.total_pages > 0) {
    const adjustedPageInfo: PagingInfo = {
      page: testResult.total_pages - 1,
      rows: pagingInfo.rows,
    }
    return await resolveResponse(lookupHandler(adjustedPageInfo))
  }
  return testResult
}

const All_DATA_PAGING_INFO: PagingInfo = {
  page: 0,
  rows: 1000000000,
}

/**
 * 查询所有数据，并返回数据列表。
 *
 * 需要注意的是，该方法的本质是一次性加载所有的分页数据，因此，
 * 只有当数据的数量较小，且随着应用的使用，数据的数量也不会大量增加时，才能使用该方法。
 *
 * @param lookupHandler 查询处理器。
 */
export async function lookupAllToList<E>(
  lookupHandler: (pagingInfo: PagingInfo) => Prespa<E>,
): Promise<E[]> {
  let testResult: PagedData<E> = await resolveResponse(lookupHandler(All_DATA_PAGING_INFO))
  // 如果数据的数量超过 All_DATA_PAGING_INFO.rows，那么就需要重新查询。
  // 当然，在实际情况下，这个条件几乎不可能发生。
  if (parseInt(testResult.count) > All_DATA_PAGING_INFO.rows) {
    const adjustedPageInfo: PagingInfo = {
      page: All_DATA_PAGING_INFO.page,
      rows: parseInt(testResult.count),
    }
    testResult = await resolveResponse(lookupHandler(adjustedPageInfo))
  }
  // 返回数据。
  return testResult.data
}

const COUNT_ONLY_PAGING_INFO: PagingInfo = {
  page: 0,
  rows: 0,
}

/**
 * 查询数据的数量。
 *
 * 该方法使用了 `subgrade 1.5.0` 的分页查询特性，构造了准们用于查询数据数量的分页信息。
 * 因此，该方法要求中台程序的 `subgrade` 版本大于 `1.5.0`，否则中台程序无法识别该分页信息。
 *
 * @param lookupHandler 查询处理器。
 */
export async function lookupCount(
  lookupHandler: (pagingInfo: PagingInfo) => Prespa<unknown>,
): Promise<number> {
  const result: PagedData<unknown> = await resolveResponse(lookupHandler(COUNT_ONLY_PAGING_INFO))
  return parseInt(result.count)
}
