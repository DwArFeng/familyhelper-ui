// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import { type StoreSetup, type VimStoreModule } from '@/store/types.ts'

import { computed, type ComputedRef, ref } from 'vue'

import screenfull from 'screenfull'

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerWindowLoadHook(windowLoadHook)
  ctx.registerWindowBeforeUnloadHook(windowUnloadHook)
}

// -----------------------------------------------------------Store 定义-----------------------------------------------------------
/**
 * Element Plus Store。
 */
export type ElementPlusStore = {
  menuVisible: ComputedRef<boolean>
  setMenuVisible: (value: boolean) => void
  fullScreen: ComputedRef<boolean>
  setFullScreen: (value: boolean) => void
}

// Store 区域。
const _menuVisible = ref<boolean>(true)
const _fullScreen = ref<boolean>(false)

// 事件逃逸标记。
let escapeEventFlag = false

// 菜单显示。
const menuVisible = computed<boolean>(() => _menuVisible.value)

function setMenuVisible(value: boolean): void {
  _menuVisible.value = value
}

// 全屏。
const fullScreen = computed<boolean>(() => _fullScreen.value)

function setFullScreen(value: boolean): void {
  if (_fullScreen.value !== value) {
    escapeEventFlag = true
  }
  _fullScreen.value = value
  if (value) {
    screenfull.request().finally()
  } else {
    screenfull.exit().finally()
  }
}

function handleFullScreenChange(): void {
  if (escapeEventFlag) {
    escapeEventFlag = false
    return
  }

  setFullScreen(screenfull.isFullscreen)
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): ElementPlusStore => ({
    menuVisible,
    setMenuVisible,
    fullScreen,
    setFullScreen,
  })
}

// -----------------------------------------------------------钩子逻辑-----------------------------------------------------------
let fullScreenHandler: () => void
let f11KeyHandler: (event: KeyboardEvent) => void

/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  if (_fullScreen.value) {
    screenfull.request().finally()
  } else {
    screenfull.exit().finally()
  }
  fullScreenHandler = () => {
    handleFullScreenChange()
  }
  f11KeyHandler = (event: KeyboardEvent) => {
    handleF11Pressed(event)
  }
  if (screenfull.isEnabled) {
    screenfull.on('change', fullScreenHandler)
  }
  window.addEventListener('keydown', f11KeyHandler, true)
}

function handleF11Pressed(event: KeyboardEvent): void {
  if (event.key === 'F11') {
    // 禁用 f11。
    event.preventDefault()
    // 使用 screenfull 组件实现全屏。
    setFullScreen(!screenfull.isFullscreen)
  }
}

/**
 * Window 卸载钩子。
 */
function windowUnloadHook(): void {
  if (screenfull.isEnabled) {
    screenfull.off('change', fullScreenHandler)
  }
  window.removeEventListener('keydown', f11KeyHandler)
}

// -----------------------------------------------------------VimStoreModule 定义-----------------------------------------------------------
/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup,
}

export default vimStoreModule
