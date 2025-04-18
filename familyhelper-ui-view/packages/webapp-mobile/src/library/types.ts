// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { VimComponent, VimComponentModule } from '@/vim/types.ts'
import type { VNode } from 'vue'

// -----------------------------------------------------------VIM 组件定义-----------------------------------------------------------
/**
 * VIM Library。
 */
export interface VimLibrary extends VimComponent {
  /**
   * Library 设置。
   */
  setting: Readonly<LibrarySetting>

  /**
   * 默认的 Visualizer。
   */
  defaultVisualizer: () => Visualizer

  /**
   * Visualizer key 列表。
   */
  visualizerKeys: () => Readonly<string[]>

  /**
   * Visualizer 列表。
   */
  visualizers: () => Readonly<Visualizer[]>

  /**
   * 根据指定的 key 获取 Visualizer。
   *
   * @param key 指定的 key。
   */
  visualizer: (key: string) => Visualizer | null
}

/**
 * Library 设置。
 */
export type LibrarySetting = {
  /**
   * 默认 Visualizer key。
   */
  defaultVisualizerKey: string
}

// -----------------------------------------------------------模块定义-----------------------------------------------------------
/**
 * VIM Library 模块。
 */
export interface VimLibraryModule extends VimComponentModule {
  /**
   * 提供 Visualizer。
   */
  provideVisualizer(): Visualizer | null
}

/**
 * Visualizer。
 * TODO 需要编写文档注释。
 */
export interface Visualizer {
  notify(type: Extract<NotifyType, 'apiResponseBad'>, responseMeta: ResponseMeta): void

  notify(type: Extract<NotifyType, 'apiResponseError'>, err: Error): void

  notify(type: Extract<NotifyType, 'errorMessage'>, message: string): void

  render(type: Extract<RenderType, 'login'>, h: Hyperscript): VNode

  render(type: Extract<RenderType, 'layout'>, h: Hyperscript): VNode

  render(type: Extract<RenderType, 'pageForbidden'>, h: Hyperscript): VNode

  render(type: Extract<RenderType, 'pageNotFound'>, h: Hyperscript): VNode

  render(type: Extract<RenderType, 'pageError'>, h: Hyperscript): VNode
}

export type NotifyType = 'apiResponseBad' | 'apiResponseError' | 'errorMessage'

export type ResponseMeta = {
  code: number
  message: string
}

export type RenderType = 'login' | 'layout' | 'pageForbidden' | 'pageNotFound' | 'pageError'

/**
 * Vue hyperscript 函数。
 */
export type Hyperscript = (typeof import('vue'))['h']
