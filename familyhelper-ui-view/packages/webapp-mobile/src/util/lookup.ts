import type { PagingInfo } from '@dwarfeng/familyhelper-ui-component-api/src/util/request.ts'
import type {
  PagedData,
  Prespa,
} from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'

import { resolveResponse } from '@/util/response.ts'

// noinspection JSUnusedGlobalSymbols
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

// noinspection JSUnusedGlobalSymbols
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
