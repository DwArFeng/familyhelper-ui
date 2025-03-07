// noinspection JSUnusedGlobalSymbols

/**
 * 响应数据。
 */
export type ResponseData<E> = {
  data: E
  meta: ResponseMeta
}

/**
 * 响应元数据。
 */
export type ResponseMeta = {
  code: number
  message: string
}

/**
 * 分页数据。
 */
export type PagedData<E> = {
  current_page: number
  total_pages: number
  rows: number
  count: string
  data: E[]
}

/**
 * 异步响应数据的简写。
 */
export type Pres<E> = Promise<ResponseData<E>>

/**
 * 异步分页响应数据的简写。
 */
// noinspection SpellCheckingInspection
export type Prespa<E> = Promise<ResponseData<PagedData<E>>>
