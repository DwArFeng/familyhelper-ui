// noinspection DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import {
  type Hyperscript,
  type NotifyType,
  type RenderType,
  type ResponseMeta,
  type VimLibraryModule,
  type VisualizerSetting,
} from '@/library/types.ts'

import { computed, type VNode, watch } from 'vue'

import ElementPLUS, { ElMessage, provideGlobalConfig } from 'element-plus'

import { i18n } from '@/library/modules/iahn/index.ts'
import { type VisualizerStore } from '@/store/modules/visualizer.ts'

import { elementPlusLocale, setElementPlusEngineeringVisualizerActive } from './util/i18n.ts'

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
  provideVisualizerSetting,
}

function init(ctx: VimApplicationContext): void {
  provideGlobalConfig(
    computed(() => ({
      locale: elementPlusLocale.value,
    })),
    ctx.app,
    true,
  )
  ctx.app.use(ElementPLUS)
  ctx.registerVimInitializedHook(() => {
    const visualizerStore = ctx.store().vueStore<'visualizer', VisualizerStore>('visualizer')
    watch(
      () => visualizerStore.visualizerKey,
      (visualizerKey) => {
        setElementPlusEngineeringVisualizerActive(visualizerKey === 'element-plus-engineering')
      },
      { immediate: true },
    )
  }, 1)
}

function provideVisualizerSetting(): VisualizerSetting {
  return {
    name: 'Element Plus Engineering',
    description: '基于 Element Plus 组件库的工程化可视化方案',
    exampleDisplay: {
      messageKey: 'library.element_plus_engineering.visualizer.example_display.label',
    },
    visualizer: {
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
    },
  }
}

function notifyApiResponseBad(responseMeta: ResponseMeta): void {
  const apiResponseBadTitle = i18n.global.t(
    'library.element_plus_engineering.notify.api_response_bad.title',
  )
  const codeLabel = i18n.global.t('library.element_plus_engineering.notify.api_response_bad.code')
  const messageLabel = i18n.global.t(
    'library.element_plus_engineering.notify.api_response_bad.message',
  )
  ElMessage({
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: `
              <div style="width:300px;padding: 10px 0">
              <div style="text-align: center">${apiResponseBadTitle}</div>
              <div style="text-align: left">
              <ul style="margin-bottom: 0">
              <li>${codeLabel}: ${responseMeta.code}</li>
              <li>${messageLabel}: ${responseMeta.message}</li>
              </ul>
              </div>
              </div>
            `,
    type: 'error',
    duration: 2000,
  })
}

function notifyApiResponseError(err: Error): void {
  const apiResponseErrorTitle = i18n.global.t(
    'library.element_plus_engineering.notify.api_response_error.title',
  )
  const messageLabel = i18n.global.t(
    'library.element_plus_engineering.notify.api_response_error.message',
  )
  ElMessage({
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: `
              <div style="width:300px;padding: 10px 0">
              <div style="text-align: center">${apiResponseErrorTitle}</div>
              <div style="text-align: left">
              <ul style="margin-bottom: 0">
              <li>${messageLabel}: ${err == null ? '' : err.message}</li>
              </ul>
              </div>
              </div>
             `,
    type: 'error',
    duration: 2000,
  })
}

function notifyErrorMessage(message: string): void {
  const errorTitle = i18n.global.t('library.element_plus_engineering.notify.error.title')
  const messageLabel = i18n.global.t('library.element_plus_engineering.notify.error.message')
  ElMessage({
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: `
              <div style="width:300px;padding: 10px 0">
              <div style="text-align: center">${errorTitle}</div>
              <div style="text-align: left">
              <ul style="margin-bottom: 0">
              <li>${messageLabel}: ${message}</li>
              </ul>
              </div>
              </div>
             `,
    type: 'error',
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
