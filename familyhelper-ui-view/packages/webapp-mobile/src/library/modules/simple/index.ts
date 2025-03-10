import type {
  Hyperscript,
  NotifyType,
  RenderType,
  ResponseMeta,
  VimLibraryModule,
  Visualizer,
} from '@/library/types.ts'

import type { VNode } from 'vue'

import './global.css'

// 组件导入。
import LayoutComponent from './render/layout/Layout.vue'
import LoginComponent from './render/login/Login.vue'
import PageForbidden from './render/pageForbidden/PageForbidden.vue'
import PageNotFound from './render/pageNotFound/PageNotFound.vue'
import PageError from './render/pageError/PageError.vue'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init() {}

function provideVisualizer(): Visualizer {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notify(type: NotifyType, ...args: any[]): void {
      switch (type) {
        case 'apiResponseBad':
          notifyApiResponseBad(args[0] as ResponseMeta)
          break
        case 'apiResponseError':
          notifyApiResponseError(args[0] as Error)
          break
        case 'errorMessage':
          notifyErrorMessage(args[0] as string)
          break
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(type: RenderType, ...args: any[]): VNode {
      switch (type) {
        case 'login':
          return renderLogin(args[0] as Hyperscript)
        case 'layout':
          return renderLayout(args[0] as Hyperscript)
        case 'pageForbidden':
          return renderPageForbidden(args[0] as Hyperscript)
        case 'pageNotFound':
          return renderPageNotFound(args[0] as Hyperscript)
        case 'pageError':
          return renderPageError(args[0] as Hyperscript)
      }
    },
  }
}

function notifyApiResponseBad(responseMeta: ResponseMeta): void {
  alert(`服务端通信错误，返回错误代码
错误代码: ${responseMeta.code}
错误信息: ${responseMeta.message}`)
}

function notifyApiResponseError(err: Error): void {
  alert(`通信错误
错误信息: ${err == null ? '' : err.message}`)
}

function notifyErrorMessage(message: string): void {
  alert(`内部错误
错误信息: ${message}`)
}

function renderLogin(h: Hyperscript): VNode {
  return h(LoginComponent)
}

function renderLayout(h: Hyperscript): VNode {
  return h(LayoutComponent)
}

function renderPageForbidden(h: Hyperscript): VNode {
  return h(PageForbidden)
}

function renderPageNotFound(h: Hyperscript): VNode {
  return h(PageNotFound)
}

function renderPageError(h: Hyperscript): VNode {
  return h(PageError)
}

export default vimLibraryModule
