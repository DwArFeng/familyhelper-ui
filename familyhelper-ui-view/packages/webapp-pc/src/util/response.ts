// noinspection DuplicatedCode

import vim from '@/vim'

import type { Pres, ResponseMeta } from '@dwarfeng/familyhelper-ui-component-api/src/util/response'

/**
 * 响应坏处理器。
 */
export interface ResponseBadHandler {
  handle(responseMeta: ResponseMeta): void
}

/**
 * 响应错误处理器。
 */
export interface ResponseErrorHandler {
  handle(err: Error): void
}

export const defaultResponseBadHandler: ResponseBadHandler = {
  handle(responseMeta: ResponseMeta) {
    vim.ctx().library().defaultVisualizer().notify('apiResponseBad', responseMeta)
  },
}

export const defaultResponseErrorHandler: ResponseErrorHandler = {
  handle(err: Error) {
    vim.ctx().library().defaultVisualizer().notify('apiResponseError', err)
  },
}

/**
 * 解析 API 调用后获得的数据，并妥善处理错误。
 *
 * @param response API 调用后获得的数据。
 * @param responseBadHandler 处理 API 调用后获得的数据中的错误的处理器。
 * @param responseErrorHandler 处理 API 调用后获得的数据中的错误的处理器。
 */
export function resolveResponse<E>(
  response: Pres<E>,
  responseBadHandler?: ResponseBadHandler,
  responseErrorHandler?: ResponseErrorHandler,
): Promise<E> {
  return response.then(
    (res) => {
      if (res.meta.code !== 0) {
        const handler: ResponseBadHandler = responseBadHandler ?? defaultResponseBadHandler
        handler.handle(res.meta)
        return Promise.reject()
      }
      return Promise.resolve(res.data)
    },
    (err) => {
      const handler: ResponseErrorHandler = responseErrorHandler ?? defaultResponseErrorHandler
      handler.handle(err)
      return Promise.reject()
    },
  )
}
