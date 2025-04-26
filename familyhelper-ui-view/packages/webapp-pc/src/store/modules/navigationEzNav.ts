// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { VimApplicationContext } from '@/vim/types.ts'
import type { SimplyStore, StoreSetup, VimStoreModule } from '@/store/types.ts'

import type { ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'

import { computed, type ComputedRef, ref } from 'vue'

import type {
  TextNodeInspectInfo,
  TextNodePutInfo,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import {
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { resolveResponse } from '@/util/response.ts'

import type { LnpStore } from '@/store/modules/lnp.ts'
import type { NavigationNodeInfo } from '@/navigation/types.ts'

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerVimInitializedHook(vimInitializedLoadHook)
  ctx.registerWindowBeforeUnloadHook(windowBeforeUnloadHook)
}

// -----------------------------------------------------------Store 定义-----------------------------------------------------------
/**
 * NavigationEzNav Store。
 */
export type NavigationEzNavStore = {
  affixNodeKeys: ComputedRef<string[]>
  pinnedNodeKeys: ComputedRef<string[]>
  activeNodeKeys: ComputedRef<string[]>
  nodeMetaMap: ComputedRef<Record<string, NavigationEzNavNodeMeta>>
  nodeBackMap: ComputedRef<Record<string, string>>
  loading: ComputedRef<number>
  backing: ComputedRef<number>
  setPinnedNodeKeys: (value: string[]) => void
  setActiveNodeKeys: (value: string[]) => void
  setBacking: (value: number) => void
  navigationNodes: ComputedRef<NavigationNodeInfo[]>
  annotation: (nodeKey: string) => NavigationEzNavAnnotation
  nodeMeta: (nodeKey: string) => NavigationEzNavNodeMeta
  nodeBack: (nodeKey: string) => string
  pushNodeKey: (nodeKey: string) => void
  pushLocation: (location: NavigationEzNavLocation) => void
  pushLocateInfo: (locateInfo: NavigationEzNavLocateInfo) => void
  pin: (nodeKey: string) => void
  unpin: (nodeKey: string) => void
  removeNodeKey: (nodeKey: string) => void
  clearActive: () => void
  clearAll: () => void
}

export type NavigationEzNavNodeMeta = { query: object; params: object }

export type NavigationEzNavAnnotation = 'affix' | 'pinned' | 'active'

export type NavigationEzNavLocation = {
  name: string
  params?: object
  query?: object
}

export type NavigationEzNavLocateInfo = {
  from: NavigationEzNavLocation
  to: NavigationEzNavLocation
}

// Store 区域。
const _affixNodeKeys = ref<string[]>([])
const _pinnedNodeKeys = ref<string[]>([])
const _activeNodeKeys = ref<string[]>([])
const _nodeMetaMap = ref<Record<string, NavigationEzNavNodeMeta>>({})
const _nodeBackMap = ref<Record<string, string>>({})
const _loading = ref<number>(0)
const _backing = ref<number>(0)

// Getters
const affixNodeKeys = computed<string[]>(() => _affixNodeKeys.value)
const pinnedNodeKeys = computed<string[]>(() => _pinnedNodeKeys.value)
const activeNodeKeys = computed<string[]>(() => _activeNodeKeys.value)
const nodeMetaMap = computed<Record<string, NavigationEzNavNodeMeta>>(() => _nodeMetaMap.value)
const nodeBackMap = computed<Record<string, string>>(() => _nodeBackMap.value)
const loading = computed<number>(() => _loading.value)
const backing = computed<number>(() => _backing.value)

// Setters
function setPinnedNodeKeys(value: string[]): void {
  _pinnedNodeKeys.value = value
}

function setActiveNodeKeys(value: string[]): void {
  _activeNodeKeys.value = value
}

function setBacking(value: number): void {
  _backing.value = value
}

// 所有导航视图。
const navigationNodes = computed(() => {
  const nodes: NavigationNodeInfo[] = []
  _affixNodeKeys.value.forEach((key) => {
    if (!ctx) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const mayNode: NavigationNodeInfo | null = ctx.navigation().nodeInfo(key)
    if (mayNode) {
      nodes.push(mayNode)
    }
  })
  _pinnedNodeKeys.value.forEach((key) => {
    if (!ctx) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const mayNode: NavigationNodeInfo | null = ctx.navigation().nodeInfo(key)
    if (mayNode) {
      nodes.push(mayNode)
    }
  })
  _activeNodeKeys.value.forEach((key) => {
    if (!ctx) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const mayNode: NavigationNodeInfo | null = ctx.navigation().nodeInfo(key)
    if (mayNode) {
      nodes.push(mayNode)
    }
  })
  return nodes
})

// EzNav 注解。
function annotation(nodeKey: string): NavigationEzNavAnnotation {
  if (_affixNodeKeys.value.includes(nodeKey)) {
    return 'affix'
  }
  if (_pinnedNodeKeys.value.includes(nodeKey)) {
    return 'pinned'
  }
  return 'active'
}

// 元数据。
function nodeMeta(nodeKey: string): NavigationEzNavNodeMeta {
  const metaMayExists = _nodeMetaMap.value[nodeKey]
  if (metaMayExists === undefined || metaMayExists === null) {
    return { query: {}, params: {} }
  }
  return metaMayExists
}

// 返回。
function nodeBack(nodeKey: string): string {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  let backKey = nodeKey
  const forbidden: string[] = []
  const defaultNodeKey: string = ctx.navigation().setting.defaultNavigationKey
  while (true) {
    backKey = _nodeBackMap.value[backKey]
    if (backKey === null || backKey === undefined) {
      return defaultNodeKey
    }
    if (forbidden.includes(backKey)) {
      return defaultNodeKey
    }
    forbidden.push(backKey)
    if (
      _affixNodeKeys.value.includes(backKey) ||
      _pinnedNodeKeys.value.includes(backKey) ||
      _activeNodeKeys.value.includes(backKey)
    ) {
      return backKey
    }
  }
}

// 推送。
function pushNodeKey(nodeKey: string): void {
  // _nodeMetaMap 进行添加或更新空对象。
  _nodeMetaMap.value[nodeKey] = { params: {}, query: {} }
  // 根据当前状态，选择性地更新 _activeItemKeys。
  mayPutActiveNodeKeys(nodeKey)
}

function pushLocation(location: NavigationEzNavLocation): void {
  // 获取 location 的名称，作为接下来一系列操作的主键使用。
  const nodeKey = location.name

  // 获取 params, query 参数，并对 nodeMetaMap 进行添加或更新。
  const { params, query } = location
  _nodeMetaMap.value[nodeKey] = { params: params ?? {}, query: query ?? {} }

  // 根据当前状态，选择性地更新 activeNodeKeys。
  mayPutActiveNodeKeys(nodeKey)
}

function pushLocateInfo(locateInfo: NavigationEzNavLocateInfo): void {
  const { from, to } = locateInfo

  // 获取 location 的名称，作为接下来一系列操作的主键使用。
  const nodeKey = to.name

  // 获取 params, query 参数，并对 nodeMetaMap 进行添加或更新。
  const { params, query } = to
  _nodeMetaMap.value[nodeKey] = { params: params ?? {}, query: query ?? {} }

  // 根据当前状态，选择性地更新 nodeBackMap。
  mayPutNodeBackMap(to, from)

  // 根据当前状态，选择性地更新 activeNodeKeys。
  mayPutActiveNodeKeys(nodeKey)
}

function mayPutActiveNodeKeys(nodeKey: string): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  // 如果 affix, pinned, active 三处数组任意一处有 nodeKey 的话，则返回。
  if (_affixNodeKeys.value.includes(nodeKey)) {
    return
  }
  if (_pinnedNodeKeys.value.includes(nodeKey)) {
    return
  }
  if (_activeNodeKeys.value.includes(nodeKey)) {
    return
  }
  // 如果 pinned 数组 + active 数组的数量已经到达了最大值，则返回。
  if (
    _pinnedNodeKeys.value.length + _activeNodeKeys.value.length >=
    ctx.navigation().setting.ezNavMaxActiveItem
  ) {
    return
  }
  // 把 nodeKey 添加到 active 数组里。
  _activeNodeKeys.value.push(nodeKey)
}

function mayPutNodeBackMap(to?: NavigationEzNavLocation, from?: NavigationEzNavLocation): void {
  // 如果当前状态在 backing，或者是 loading 则直接返回。
  if (_backing.value || _loading.value) {
    return
  }

  // 如果 to 是 null 或者 undefined，则直接返回。
  if (to === null || to === undefined) {
    return
  }
  // 如果 from 是 null 或者 undefined，则直接返回。
  if (from === null || from === undefined) {
    return
  }

  // 获取 to 和 from 的名称。
  const toName = to.name
  const fromName = from.name

  // 如果二者名称相同，则直接返回。
  if (toName === fromName) {
    return
  }

  // 更新 nodeBackMap。
  _nodeBackMap.value[toName] = fromName
}

// Pin & Unpin
function pin(nodeKey: string): void {
  if (_pinnedNodeKeys.value.includes(nodeKey)) {
    return
  }
  const index = _activeNodeKeys.value.indexOf(nodeKey)
  if (index >= 0) {
    _activeNodeKeys.value.splice(index, 1)
  }
  _pinnedNodeKeys.value.push(nodeKey)
}

function unpin(nodeKey: string): void {
  const index = _pinnedNodeKeys.value.indexOf(nodeKey)
  if (index >= 0) {
    _pinnedNodeKeys.value.splice(index, 1)
    _activeNodeKeys.value.push(nodeKey)
  }
}

// Remove & Clear
function removeNodeKey(nodeKey: string): void {
  let index: number
  index = _pinnedNodeKeys.value.indexOf(nodeKey)
  if (index >= 0) {
    _pinnedNodeKeys.value.splice(index, 1)
  }
  index = _activeNodeKeys.value.indexOf(nodeKey)
  if (index >= 0) {
    _activeNodeKeys.value.splice(index, 1)
  }
}

function clearActive(): void {
  _activeNodeKeys.value = []
}

function clearAll(): void {
  _pinnedNodeKeys.value = []
  _activeNodeKeys.value = []
  _nodeMetaMap.value = {}
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): NavigationEzNavStore => ({
    affixNodeKeys,
    pinnedNodeKeys,
    activeNodeKeys,
    nodeMetaMap,
    nodeBackMap,
    loading,
    backing,
    setPinnedNodeKeys,
    setActiveNodeKeys,
    setBacking,
    navigationNodes,
    annotation,
    nodeMeta,
    nodeBack,
    pushNodeKey,
    pushLocation,
    pushLocateInfo,
    pin,
    unpin,
    removeNodeKey,
    clearActive,
    clearAll,
  })
}

// -----------------------------------------------------------钩子逻辑-----------------------------------------------------------
// 存储在 Localstorage 中的持久化主键
const LOCAL_STORAGE_PERSISTENCE_DATA_KEY = 'store.persistence_data.eznav'
// 存储在 Settingrepo 中的持久化主键
const SETTINGREPO_PERSISTENCE_DATA_KEY = 'framework.pc.eznav'

let lnpStoreLoginActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 lnpStoreLoginActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  lnpStoreLoginActionHandle = import.meta.hot.data.lnpStoreLoginActionHandle ?? (() => {})
}

let lnpStoreLogoutActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 lnpStoreLogoutActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  lnpStoreLogoutActionHandle = import.meta.hot.data.lnpStoreLogoutActionHandle ?? (() => {})
}

let lnpStoreFireKickActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 lnpStoreFireKickActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  lnpStoreFireKickActionHandle = import.meta.hot.data.lnpStoreFireKickActionHandle ?? (() => {})
}

/**
 * VIM 初始化钩子。
 */
function vimInitializedLoadHook(): void {
  // 遍历所有 nodeInfos，加载 affixNodeKeys。
  loadAffixNodeKeys()
  // 根据当前状态，选择性地恢复持久化数据。
  mayRestorePersistenceData()
  // 添加登录监听器。
  addLnpStoreLoginActionListener()
  // 添加登出监听器。
  addLnpStoreLogoutActionListener()
  // 添加通知踢出监听器。
  addLnpStoreFireKickActionListener()
}

function loadAffixNodeKeys(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  _affixNodeKeys.value.push(
    ...ctx
      .navigation()
      .nodeInfos()
      .filter((nodeInfo) => nodeInfo.ezNav.shown && nodeInfo.ezNav.affix)
      .sort((a, b) => {
        const affixIndexAlpha = a.ezNav.affixIndex ?? 0
        const affixIndexBravo = b.ezNav.affixIndex ?? 0
        return affixIndexAlpha - affixIndexBravo
      })
      .map((nodeInfo) => nodeInfo.key),
  )
}

function mayRestorePersistenceData(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')

  // 如果没有登录，则什么也不做。
  if (!lnpStore.isLogin) {
    return
  }

  // 复位 EzNav 参数。
  const persistenceDataJson = localStorage.getItem(LOCAL_STORAGE_PERSISTENCE_DATA_KEY)
  if (persistenceDataJson !== null && persistenceDataJson !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const persistenceData: any = JSON.parse(persistenceDataJson)
    _pinnedNodeKeys.value = persistenceData.pinnedNodeKeys ?? []
    _activeNodeKeys.value = persistenceData.activeNodeKeys ?? []
    _nodeMetaMap.value = persistenceData.nodeMetaMap ?? {}
    _nodeBackMap.value = persistenceData.nodeBackMap ?? {}
  }
}

function addLnpStoreLoginActionListener(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  async function restoreAfterLogin(lnpStore: SimplyStore<'lnp', LnpStore>): Promise<void> {
    if (!ctx) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }

    // 置位加载标志。
    _loading.value += 1

    // 恢复导航信息。
    const textNodeInspectInfo: TextNodeInspectInfo = {
      category: SETTINGREPO_PERSISTENCE_DATA_KEY,
      args: [lnpStore.me],
    }
    try {
      const res = await resolveResponse(operateInspect(textNodeInspectInfo))
      if (!res) {
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const persistenceData: any = JSON.parse(res.value)
      _pinnedNodeKeys.value = persistenceData.pinnedNodeKeys ?? []
      _activeNodeKeys.value = persistenceData.activeNodeKeys ?? []
      _nodeMetaMap.value = persistenceData.nodeMetaMap ?? {}
      _nodeBackMap.value = persistenceData.nodeBackMap ?? {}
      // 根据 VIM 设置，选择性地恢复导航信息。
      switch (ctx.navigation().setting.ezNavRestoreWhenLogin) {
        case 'restore-all':
          break
        case 'restore-pinned':
          _activeNodeKeys.value = []
          break
        default:
          throw new Error('不应该执行到此处，请联系开发人员')
      }
    } finally {
      // 复位加载标志。
      _loading.value -= 1
    }
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  lnpStoreLoginActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willLogin') {
      return
    }
    after((result) => {
      result.registerAfterHook(() => restoreAfterLogin(lnpStore))
    })
  })
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreLoginActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLoginActionHandle = lnpStoreLoginActionHandle
  }
}

function addLnpStoreLogoutActionListener(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  async function saveBeforeLogout(lnpStore: SimplyStore<'lnp', LnpStore>): Promise<void> {
    if (!ctx) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }

    // 原始值。
    const rawValue = {
      pinnedNodeKeys: _pinnedNodeKeys.value,
      activeNodeKeys: _activeNodeKeys.value,
      nodeMetaMap: _nodeMetaMap.value,
      nodeBackMap: _nodeBackMap.value,
    }

    // 根据 VIM 设置，选择性地恢复导航信息。
    switch (ctx.navigation().setting.ezNavRestoreWhenLogin) {
      case 'restore-all':
        break
      case 'restore-pinned':
        rawValue.activeNodeKeys = []
        break
      default:
        throw new Error('不应该执行到此处，请联系开发人员')
    }

    // 存储导航信息。
    const textNodePutInfo: TextNodePutInfo = {
      category: SETTINGREPO_PERSISTENCE_DATA_KEY,
      args: [lnpStore.me],
      value: JSON.stringify(rawValue),
    }

    // 调用服务存储 EzNav 数据。
    await resolveResponse(operatePut(textNodePutInfo))
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  lnpStoreLogoutActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willLogout') {
      return
    }
    after((result: ExecutableActionHandle<void, void, void>) => {
      result.registerBeforeHook(() => saveBeforeLogout(lnpStore))
    })
  })
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreLogoutActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLogoutActionHandle = lnpStoreLogoutActionHandle
  }
}

function addLnpStoreFireKickActionListener(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  lnpStoreFireKickActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willFireKick') {
      return
    }
    after((result: ExecutableActionHandle<void, void, void>) => {
      result.registerBeforeHook(() => Promise.resolve())
    })
  })
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreFireKickActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreFireKickActionHandle = lnpStoreFireKickActionHandle
  }
}

/**
 * Window 卸载前钩子。
 *
 * TODO VIM 的钩子机制必须支持异步操作。
 */
function windowBeforeUnloadHook(): void {
  // 移除登录监听器。
  removeLnpStoreLoginActionListener()
  // 移除登出监听器。
  removeLnpStoreLogoutActionListener()
  // 移除通知踢出监听器。
  removeLnpStoreFireKickActionListener()
  // 根据当前状态，选择性地保存持久化数据。
  maySavePersistenceData()
}

function removeLnpStoreLoginActionListener(): void {
  lnpStoreLoginActionHandle()
  lnpStoreLoginActionHandle = () => {}
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreLoginActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLoginActionHandle = lnpStoreLoginActionHandle
  }
}

function removeLnpStoreLogoutActionListener(): void {
  lnpStoreLogoutActionHandle()
  lnpStoreLogoutActionHandle = () => {}
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreLogoutActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLogoutActionHandle = lnpStoreLogoutActionHandle
  }
}

function removeLnpStoreFireKickActionListener(): void {
  lnpStoreFireKickActionHandle()
  lnpStoreFireKickActionHandle = () => {}
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreFireKickActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreFireKickActionHandle = lnpStoreFireKickActionHandle
  }
}

function maySavePersistenceData(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')

  // 如果没有登录，则什么也不做。
  if (!lnpStore.isLogin) {
    return
  }

  // 存储 EzNav 参数。
  window.localStorage.setItem(
    LOCAL_STORAGE_PERSISTENCE_DATA_KEY,
    JSON.stringify({
      pinnedNodeKeys: _pinnedNodeKeys.value,
      activeNodeKeys: _activeNodeKeys.value,
      nodeMetaMap: _nodeMetaMap.value,
      nodeBackMap: _nodeBackMap.value,
    }),
  )
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
