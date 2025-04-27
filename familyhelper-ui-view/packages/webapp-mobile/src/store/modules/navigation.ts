// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import { type StoreSetup, type VimStoreModule } from '@/store/types.ts'

import { computed, type ComputedRef, ref } from 'vue'

import { type NavigationNodeInfo } from '@/navigation/types.ts'

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
}

// -----------------------------------------------------------Store 定义-----------------------------------------------------------
/**
 * Navigation Store。
 */
export type NavigationStore = {
  isCurrentNode: (nodeKey: string) => boolean
  currentNodeKey: ComputedRef<string>
  getNodeInfo: (nodeKey: string) => Readonly<NavigationNodeInfo> | null
  getParentNodeInfo: (nodeKey: string) => Readonly<NavigationNodeInfo> | null
  getChildNodeInfos: (nodeKey: string | null) => Readonly<NavigationNodeInfo[]>
  setCurrentNodeKey: (value: string) => void
}

// Store 区域。
const _currentNodeKey = ref<string>('')

const currentNodeKey = computed<string>(() => _currentNodeKey.value)

function isCurrentNode(nodeKey: string): boolean {
  return _currentNodeKey.value === nodeKey
}

function getNodeInfo(nodeKey: string): Readonly<NavigationNodeInfo> | null {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  return ctx.navigation().nodeInfo(nodeKey)
}

function getParentNodeInfo(nodeKey: string): Readonly<NavigationNodeInfo> | null {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const currentNodeInfo = ctx.navigation().nodeInfo(nodeKey)
  if (!currentNodeInfo || !currentNodeInfo.parentKey) {
    return null
  }
  return ctx.navigation().nodeInfo(currentNodeInfo.parentKey)
}

function getChildNodeInfos(nodeKey: string | null): Readonly<NavigationNodeInfo[]> {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (!nodeKey) {
    const result: NavigationNodeInfo[] = []
    ctx
      .navigation()
      .nodeRootKeys()
      .forEach((rk) => {
        if (!ctx) {
          throw new Error('不应该执行到此处，请联系开发人员')
        }
        const mayNodeInfo: NavigationNodeInfo | null = ctx.navigation().nodeInfo(rk)
        if (mayNodeInfo) {
          result.push(mayNodeInfo)
        }
      })
    return result
  } else {
    const currentNodeInfo = ctx.navigation().nodeInfo(nodeKey)
    if (!currentNodeInfo) {
      return []
    }
    return currentNodeInfo.childKeys
      .map((key) => {
        if (!ctx) {
          throw new Error('不应该执行到此处，请联系开发人员')
        }
        return ctx.navigation().nodeInfo(key)
      })
      .filter((info) => info !== null)
  }
}

function setCurrentNodeKey(value: string): void {
  _currentNodeKey.value = value
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): NavigationStore => ({
    isCurrentNode,
    currentNodeKey,
    getNodeInfo,
    getParentNodeInfo,
    getChildNodeInfos,
    setCurrentNodeKey,
  })
}

// -----------------------------------------------------------VimStoreModule 定义-----------------------------------------------------------
/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup,
}

// noinspection JSUnusedGlobalSymbols
export default vimStoreModule
