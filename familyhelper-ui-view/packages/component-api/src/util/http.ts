// noinspection JSUnusedGlobalSymbols

import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'

/**
 * HTTP。
 */
export interface Http {
  init(handler: HttpHandler): void

  generalClient: () => HttpClient
  publicClient: () => HttpClient
}

/**
 * HTTP 处理器。
 */
export interface HttpHandler {
  /**
   * 获取基础 URL。
   */
  getBaseUrl(): string

  /**
   * 获取超时时间。
   */
  getTimeout(): number

  /**
   * 获取授权请求头键。
   */
  getAuthenticationRequestHeaderKey(): string

  /**
   * 获取 Token。
   */
  getToken(): string
}

/**
 * HTTP 客户端。
 */
export interface HttpClient {
  /**
   * GET 请求。
   *
   * @param module 模块。
   * @param url URL。
   * @param params GET 参数。
   * @param responseType 响应类型。
   */
  get<E>(module: string, url: string, params: GetParam, responseType: ResponseType): Promise<E>

  /**
   * POST 请求。
   *
   * @param module 模块。
   * @param url URL。
   * @param params POST 参数。
   * @param contentType 内容类型。
   */
  post<E>(module: string, url: string, params: PostParam, contentType: ContentType): Promise<E>

  /**
   * PATCH 请求。
   *
   * @param module 模块。
   * @param url URL。
   * @param params PATCH 参数。
   * @param contentType 内容类型。
   */
  patch<E>(module: string, url: string, params: PatchParam, contentType: ContentType): Promise<E>

  /**
   * DELETE 请求。
   *
   * @param module 模块。
   * @param url URL。
   * @param params DEL 参数。
   * @param responseType 响应类型。
   */
  del<E>(module: string, url: string, params: DelParam, responseType: ResponseType): Promise<E>
}

/**
 * GET 参数。
 */
export type GetParam = Record<string, string | number | boolean>

/**
 * 响应类型。
 */
export type ResponseType = 'json' | 'blob'

/**
 * POST 参数。
 */
export type PostParam = object | FormData

/**
 * PATCH 参数。
 */
export type PatchParam = object | FormData

/**
 * DELETE 参数。
 */
export type DelParam = object | FormData

/**
 * 内容类型。
 */
export type ContentType = 'application/json;charset=UTF-8' | 'multipart/form-data'

/**
 * 处理器。
 */
let handler: HttpHandler | null = null

/**
 * Http。
 */
const http: Http = {
  init,
  generalClient,
  publicClient,
}

let status: 'initializing' | 'initialized' = 'initializing'

/**
 * 初始化。
 *
 * @param _handler HTTP 处理器。
 */
function init(_handler: HttpHandler): void {
  // 状态判断。
  if (status !== 'initializing') {
    throw new Error('只能在 initializing 状态下初始化')
  }

  // 设置处理器。
  handler = _handler

  // 初始化。
  status = 'initialized'
}

/**
 * 通用客户端缓存。
 */
let generalClientCache: HttpClient | null = null

/**
 * 获取通用客户端。
 *
 * @returns HttpClient 通用客户端。
 */
function generalClient(): HttpClient {
  // 状态判断。
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 generalClientCache')
  }
  if (!handler) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  // 如果实例已经存在，直接返回。
  if (generalClientCache) {
    return generalClientCache
  }

  // 生成实例。
  const generalAxios: AxiosInstance = axios.create()

  // 应用鉴权请求拦截器。
  applyAuthenticationRequestInterceptor(generalAxios)
  // 应用响应拦截器。
  applyResponseInterceptor(generalAxios)

  // 设置实例。
  generalClientCache = axiosInstanceToHttpClient(generalAxios)

  // 返回实例。
  return generalClientCache
}

/**
 * 公共客户端缓存。
 */
let publicClientCache: HttpClient | null = null

/**
 * 获取公共客户端。
 *
 * @returns HttpClient 公共客户端。
 */
function publicClient(): HttpClient {
  // 状态判断。
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 publicClientCache')
  }
  if (!handler) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  // 如果实例已经存在，直接返回。
  if (publicClientCache) {
    return publicClientCache
  }

  // 生成实例。
  const publicAxios: AxiosInstance = axios.create()

  // 应用响应拦截器。
  applyResponseInterceptor(publicAxios)

  // 设置实例。
  publicClientCache = axiosInstanceToHttpClient(publicAxios)

  // 返回实例。
  return publicClientCache
}

/**
 * 应用鉴权请求拦截器。
 *
 * @param axiosInstance Axios 实例。
 */
function applyAuthenticationRequestInterceptor(axiosInstance: AxiosInstance): void {
  if (!handler) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  axiosInstance.interceptors.request.use((config) => {
    if (!handler) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    config.headers[handler.getAuthenticationRequestHeaderKey()] = handler.getToken()
    return config
  })
}

/**
 * 应用响应拦截器。
 *
 * @param axiosInstance Axios 实例。
 */
function applyResponseInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use((response) => {
    if (response.status === 200) {
      return Promise.resolve(response)
    }
    return Promise.reject(new Error(`${response.status}`))
  })
}

/**
 * 将 Axios 实例转换为 HttpClient。
 *
 * @param axiosInstance Axios 实例。
 * @returns HttpClient。
 */
function axiosInstanceToHttpClient(axiosInstance: AxiosInstance): HttpClient {
  return {
    get<E>(
      module: string,
      url: string,
      params: GetParam,
      responseType: ResponseType = 'json',
    ): Promise<E> {
      if (!handler) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      const config: AxiosRequestConfig = {
        baseURL: handler.getBaseUrl(),
        timeout: handler.getTimeout(),
        params: params,
        responseType: responseType,
      }
      return new Promise((resolve, reject) => {
        axiosInstance
          .get<E>(`/${module}/${url}`, config)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    post<E>(
      module: string,
      url: string,
      params: PostParam,
      contentType: ContentType = 'application/json;charset=UTF-8',
    ): Promise<E> {
      if (!handler) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      const config: AxiosRequestConfig = {
        baseURL: handler.getBaseUrl(),
        timeout: handler.getTimeout(),
        headers: { 'Content-Type': contentType },
      }
      return new Promise((resolve, reject) => {
        axiosInstance
          .post<E>(`/${module}/${url}`, params, config)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    patch<E>(
      module: string,
      url: string,
      params: PatchParam,
      contentType: ContentType = 'application/json;charset=UTF-8',
    ): Promise<E> {
      if (!handler) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      const config: AxiosRequestConfig = {
        baseURL: handler.getBaseUrl(),
        timeout: handler.getTimeout(),
        headers: { 'Content-Type': contentType },
      }
      return new Promise((resolve, reject) => {
        axiosInstance
          .patch<E>(`/${module}/${url}`, params, config)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    del<E>(
      module: string,
      url: string,
      params: DelParam,
      responseType: ResponseType = 'json',
    ): Promise<E> {
      if (!handler) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      const config: AxiosRequestConfig = {
        baseURL: handler.getBaseUrl(),
        timeout: handler.getTimeout(),
        params: params,
        responseType: responseType,
      }
      return new Promise((resolve, reject) => {
        axiosInstance
          .delete<E>(`/${module}/${url}`, config)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
  }
}

export default http
