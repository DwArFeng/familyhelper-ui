import type { VimApplicationContext } from '@/vim/types.ts'
import type {
  Hyperscript,
  NotifyType,
  RenderType,
  ResponseMeta,
  VimLibraryModule,
  Visualizer,
} from '@/library/types.ts'

import type { VNode } from 'vue'

import ElementPLUS, { ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import 'element-plus/dist/index.css'

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

function init(ctx: VimApplicationContext) {
  ctx.app.use(ElementPLUS, {
    locale: zhCn,
  })
}

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
  ElMessage({
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: `
              <div style="width:300px;padding: 10px 0">
              <div style="text-align: center">服务端通信错误，返回错误代码</div>
              <div style="text-align: left">
              <ul style="margin-bottom: 0">
              <li>错误代码: ${responseMeta.code}</li>
              <li>错误信息: ${responseMeta.message}</li>
              </ul>
              </div>
              </div>
            `,
    type: 'error',
    center: true,
    duration: 2000,
  })
}

function notifyApiResponseError(err: Error): void {
  ElMessage({
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: `
              <div style="width:300px;padding: 10px 0">
              <div style="text-align: center">通信错误</div>
              <div style="text-align: left">
              <ul style="margin-bottom: 0">
              <li>错误信息: ${err == null ? '' : err.message}</li>
              </ul>
              </div>
              </div>
             `,
    type: 'error',
    center: true,
    duration: 2000,
  })
}

function notifyErrorMessage(message: string): void {
  ElMessage({
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: `
              <div style="width:300px;padding: 10px 0">
              <div style="text-align: center">内部错误</div>
              <div style="text-align: left">
              <ul style="margin-bottom: 0">
              <li>错误信息: ${message}</li>
              </ul>
              </div>
              </div>
             `,
    type: 'error',
    center: true,
    duration: 2000,
  })
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
