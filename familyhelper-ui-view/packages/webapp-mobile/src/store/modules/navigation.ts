// noinspection JSUnusedCustomSymbols,DuplicatedCode

import { computed, type ComputedRef, ref } from 'vue'

import { type VimApplicationContext } from '@/vim/types.ts'
import { type SimplyStore, type StoreSetup, type VimStoreModule } from '@/store/types.ts'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { type ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'

import { type DisplayInfo, type NodeInfo, type VimNavigation } from '@/navigation/types.ts'

import {
  operateInspect,
  operateInspectForPublic as textNodeOperateInspect,
  operatePut,
  type TextNode,
  type TextNodeInspectInfo,
  type TextNodePutInfo,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import {
  type NavigationNodeInspectResult,
  type NavigationNodeInspectResultItem,
  operateInspectForPublic as navigationNodeOperateInspect,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/navigationNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

// region 初始化逻辑

/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerVimInitializedHook(vimInitializedLoadHook)
  ctx.registerWindowLoadHook(windowLoadHook)
  ctx.registerWindowBeforeUnloadHook(windowBeforeUnloadHook)
}

// endregion

// region Store 定义

/**
 * Navigation Store。
 */
export type NavigationStore = {
  ready: ComputedRef<boolean>
  defaultNodeKey: ComputedRef<string>
  nodeInfos: ComputedRef<Readonly<Record<string, NodeInfo>>>
  isCurrentNode: (nodeKey: string) => boolean
  currentNodeKey: ComputedRef<string>
  getNodeInfo: (nodeKey: string) => Readonly<NodeInfo> | null
  getParentNodeInfo: (nodeKey: string) => Readonly<NodeInfo> | null
  getChildNodeInfos: (nodeKey: string | null) => Readonly<NodeInfo[]>
  setCurrentNodeKey: (value: string) => void
  ezNavEnabled: ComputedRef<boolean>
  ezNavMaxActiveItem: ComputedRef<number>
  ezNavRestoreWhenLogin: ComputedRef<'restore-pinned' | 'restore-all'>
  ezNavAffixNodeKeys: ComputedRef<Readonly<string[]>>
  ezNavPinnedNodeKeys: ComputedRef<Readonly<string[]>>
  ezNavActiveNodeKeys: ComputedRef<Readonly<string[]>>
  ezNavNodeMetaMap: ComputedRef<Record<string, EzNavNodeMeta>>
  ezNavNodeBackMap: ComputedRef<Record<string, string>>
  ezNavLoading: ComputedRef<number>
  ezNavBacking: ComputedRef<number>
  setEzNavPinnedNodeKeys: (value: string[]) => void
  setEzNavActiveNodeKeys: (value: string[]) => void
  incrementEzNavBacking: () => void
  decrementEzNavBacking: () => void
  ezNavNodes: ComputedRef<Readonly<NodeInfo[]>>
  ezNavAnnotation: (nodeKey: string) => EzNavAnnotation
  ezNavNodeMeta: (nodeKey: string) => EzNavNodeMeta | null
  ezNavNodeBack: (nodeKey: string) => string | null
  pushEzNavByNodeKey: (nodeKey: string) => void
  pushEzNavByLocation: (location: EzNavLocation) => void
  pushEzNavByLocateInfo: (locateInfo: EzNavLocateInfo) => void
  pinEzNavNode: (nodeKey: string) => void
  unpinEzNavNode: (nodeKey: string) => void
  removeEzNavNode: (nodeKey: string) => void
  clearActiveEzNavNodes: () => void
  clearAllEzNavNodes: () => void
}

export type Modal = {
  setting: Readonly<{
    defaultNodeKey: string
    ezNavEnabled: boolean
    ezNavMaxActiveItem: number
    ezNavRestoreWhenLogin: 'restore-pinned' | 'restore-all'
  }>
  nodeRootKeys: Readonly<string[]>
  nodeInfos: Readonly<Record<string, NodeInfo>>
}

export type NavigationKey = {
  type: NavigationKeyType

  /**
   * ID。
   *
   * - 如果 `type` 是 `default`，则不需要填写此字段。
   * - 如果 `type` 是 `custom`，则此字段表示自定义分类的 ID。
   */
  id?: string
}

export type NavigationKeyType = 'default' | 'custom'

export type EzNavNodeMeta = { query: object; params: object }

export type EzNavAnnotation = 'affix' | 'pinned' | 'active'

export type EzNavLocation = {
  name: string
  params?: object
  query?: object
}

export type EzNavLocateInfo = {
  to: EzNavLocation
  from: EzNavLocation
}

// Store 区域。

// Ready。
const _ready = ref<boolean>(false)

const ready: ComputedRef<boolean> = computed(() => _ready.value)

function setReady(): void {
  _ready.value = true
}

// 模态。
const _modal = ref<Readonly<Modal> | null>(null)

const defaultNodeKey: ComputedRef<string> = computed<string>(() => {
  if (!_modal.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return _modal.value.setting.defaultNodeKey
})

const nodeInfos: ComputedRef<Readonly<Record<string, NodeInfo>>> = computed<
  Readonly<Record<string, NodeInfo>>
>(() => {
  if (!_modal.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return _modal.value.nodeInfos
})

function updateModal(modal: Modal | null): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (!modal) {
    _modal.value = {
      setting: {
        defaultNodeKey: ctx.navigation().setting.defaultNodeKey,
        ezNavEnabled: ctx.navigation().setting.ezNavEnabled,
        ezNavMaxActiveItem: ctx.navigation().setting.ezNavMaxActiveItem,
        ezNavRestoreWhenLogin: ctx.navigation().setting.ezNavRestoreWhenLogin,
      },
      nodeRootKeys: ctx.navigation().nodeRootKeys(),
      nodeInfos: ctx.navigation().nodeInfos(),
    }
  } else {
    _modal.value = modal
  }
}

// Node。
const _currentNodeKey = ref<string>('')

const currentNodeKey = computed<string>(() => _currentNodeKey.value)

function isCurrentNode(nodeKey: string): boolean {
  return _currentNodeKey.value === nodeKey
}

function getNodeInfo(nodeKey: string): Readonly<NodeInfo> | null {
  return _modal.value?.nodeInfos[nodeKey] ?? null
}

function getParentNodeInfo(nodeKey: string): Readonly<NodeInfo> | null {
  const _aimNodeInfo: Readonly<NodeInfo> | null = _modal.value?.nodeInfos[nodeKey] ?? null
  if (!_aimNodeInfo || !_aimNodeInfo.parentKey) {
    return null
  }
  return _modal.value?.nodeInfos[_aimNodeInfo.parentKey] ?? null
}

function getChildNodeInfos(nodeKey: string | null): Readonly<NodeInfo[]> {
  const __navigation: Readonly<Modal> | null = _modal.value
  if (!__navigation) {
    return []
  }
  if (!nodeKey) {
    return (
      __navigation.nodeRootKeys
        .map((rk) => __navigation.nodeInfos[rk])
        .filter((info) => info !== null) ?? []
    )
  } else {
    return (
      __navigation.nodeInfos[nodeKey]?.childKeys
        .map((ck) => __navigation.nodeInfos[ck])
        .filter((info) => info !== null) ?? []
    )
  }
}

function setCurrentNodeKey(value: string): void {
  _currentNodeKey.value = value
}

// EzNav 设置。
const ezNavEnabled: ComputedRef<boolean> = computed<boolean>(
  () => _modal.value?.setting.ezNavEnabled ?? false,
)

const ezNavMaxActiveItem: ComputedRef<number> = computed<number>(
  () => _modal.value?.setting.ezNavMaxActiveItem ?? 0,
)

const ezNavRestoreWhenLogin: ComputedRef<'restore-pinned' | 'restore-all'> = computed<
  'restore-pinned' | 'restore-all'
>(() => _modal.value?.setting.ezNavRestoreWhenLogin ?? 'restore-pinned')

// EzNav 节点。
const _ezNavAffixNodeKeys = ref<string[]>([])
const _ezNavPinnedNodeKeys = ref<string[]>([])
const _ezNavActiveNodeKeys = ref<string[]>([])
const _ezNavNodeMetaMap = ref<Record<string, EzNavNodeMeta>>({})
const _ezNavNodeBackMap = ref<Record<string, string>>({})
const _ezNavLoading = ref<number>(0)
const _ezNavBacking = ref<number>(0)

const ezNavAffixNodeKeys = computed<string[]>(() => _ezNavAffixNodeKeys.value)
const ezNavPinnedNodeKeys = computed<string[]>(() => _ezNavPinnedNodeKeys.value)
const ezNavActiveNodeKeys = computed<string[]>(() => _ezNavActiveNodeKeys.value)
const ezNavNodeMetaMap = computed<Record<string, EzNavNodeMeta>>(() => _ezNavNodeMetaMap.value)
const ezNavNodeBackMap = computed<Record<string, string>>(() => _ezNavNodeBackMap.value)
const ezNavLoading = computed<number>(() => _ezNavLoading.value)
const ezNavBacking = computed<number>(() => _ezNavBacking.value)

function setEzNavPinnedNodeKeys(value: string[]): void {
  _ezNavPinnedNodeKeys.value = value
}

function setEzNavActiveNodeKeys(value: string[]): void {
  _ezNavActiveNodeKeys.value = value
}

function incrementEzNavBacking(): void {
  _ezNavBacking.value += 1
}

function decrementEzNavBacking(): void {
  _ezNavBacking.value -= 1
}

const ezNavNodes = computed<Readonly<NodeInfo[]>>(() => {
  const _nodes: NodeInfo[] = []
  for (const nodeKey of [
    ..._ezNavAffixNodeKeys.value,
    ..._ezNavPinnedNodeKeys.value,
    ..._ezNavActiveNodeKeys.value,
  ]) {
    const nodeInfo = getNodeInfo(nodeKey)
    if (nodeInfo) {
      const abc = JSON.stringify(nodeInfo)
      _nodes.push(JSON.parse(abc))
    }
  }
  return _nodes
})

function ezNavAnnotation(nodeKey: string): EzNavAnnotation {
  if (_ezNavAffixNodeKeys.value.includes(nodeKey)) {
    return 'affix'
  } else if (_ezNavPinnedNodeKeys.value.includes(nodeKey)) {
    return 'pinned'
  } else {
    return 'active'
  }
}

function ezNavNodeMeta(nodeKey: string): EzNavNodeMeta | null {
  return _ezNavNodeMetaMap.value[nodeKey] ?? null
}

function ezNavNodeBack(nodeKey: string): string | null {
  const defaultNodeKey: string | null = _modal.value?.setting.defaultNodeKey ?? null
  let backNodeKey: string = nodeKey
  const forbiddenNodeKeys: string[] = []
  while (true) {
    backNodeKey = _ezNavNodeBackMap.value[backNodeKey] ?? null
    if (!backNodeKey) {
      return defaultNodeKey
    }
    if (forbiddenNodeKeys.includes(backNodeKey)) {
      return defaultNodeKey
    }
    forbiddenNodeKeys.push(backNodeKey)
    if (
      _ezNavAffixNodeKeys.value.includes(backNodeKey) ||
      _ezNavPinnedNodeKeys.value.includes(backNodeKey) ||
      _ezNavActiveNodeKeys.value.includes(backNodeKey)
    ) {
      return backNodeKey
    }
  }
}

function pushEzNavByNodeKey(nodeKey: string): void {
  // _ezNavNodeMetaMap 进行添加或更新空对象。
  _ezNavNodeMetaMap.value[nodeKey] = { query: {}, params: {} }
  // 根据当前状态，选择性地更新 _ezNavActiveItemKeys。
  mayPutEzNavActiveNodeKey(nodeKey)
}

function pushEzNavByLocation(location: EzNavLocation): void {
  // 获取 location 的名称，作为接下来一系列操作的主键使用。
  const nodeKey: string = location.name

  // 获取 params, query 参数，并对 _ezNavNodeMetaMap 进行添加或更新。
  const { params, query } = location
  _ezNavNodeMetaMap.value[nodeKey] = {
    query: query ?? {},
    params: params ?? {},
  }

  // 根据当前状态，选择性地更新 _ezNavActiveItemKeys。
  mayPutEzNavActiveNodeKey(nodeKey)
}

function pushEzNavByLocateInfo(locateInfo: EzNavLocateInfo): void {
  // 获取 to, from 信息。
  const { to, from } = locateInfo

  // 获取 location 的名称，作为接下来一系列操作的主键使用。
  const nodeKey = to.name

  // 获取 params, query 参数，并对 _ezNavNodeMetaMap 进行添加或更新。
  const { params, query } = to
  _ezNavNodeMetaMap.value[nodeKey] = {
    query: query ?? {},
    params: params ?? {},
  }

  // 根据当前状态，选择性地更新 _ezNavNodeBackMap。
  mayPutEzNavNodeBackMap(to, from)

  // 根据当前状态，选择性地更新 _ezNavActiveItemKeys。
  mayPutEzNavActiveNodeKey(nodeKey)
}

function pinEzNavNode(nodeKey: string): void {
  if (_ezNavPinnedNodeKeys.value.includes(nodeKey)) {
    return
  }
  const index: number = _ezNavActiveNodeKeys.value.indexOf(nodeKey)
  if (index >= 0) {
    _ezNavActiveNodeKeys.value.splice(index, 1)
  }
  _ezNavPinnedNodeKeys.value.push(nodeKey)
}

function unpinEzNavNode(nodeKey: string): void {
  const index: number = _ezNavPinnedNodeKeys.value.indexOf(nodeKey)
  if (index >= 0) {
    _ezNavPinnedNodeKeys.value.splice(index, 1)
    _ezNavActiveNodeKeys.value.push(nodeKey)
  }
}

function removeEzNavNode(nodeKey: string): void {
  let index: number
  index = _ezNavPinnedNodeKeys.value.indexOf(nodeKey)
  if (index >= 0) {
    _ezNavPinnedNodeKeys.value.splice(index, 1)
  }
  index = _ezNavActiveNodeKeys.value.indexOf(nodeKey)
  if (index >= 0) {
    _ezNavActiveNodeKeys.value.splice(index, 1)
  }
}

function clearActiveEzNavNodes(): void {
  _ezNavActiveNodeKeys.value = []
}

function clearAllEzNavNodes(): void {
  _ezNavPinnedNodeKeys.value = []
  _ezNavActiveNodeKeys.value = []
  _ezNavNodeMetaMap.value = {}
  _ezNavNodeBackMap.value = {}
}

// 公共方法。
function mayPutEzNavNodeBackMap(to: EzNavLocation, from: EzNavLocation): void {
  // 如果当前状态在 backing，或者是 loading 则直接返回。
  if (_ezNavBacking.value || _ezNavLoading.value) {
    return
  }

  // 获取 from, to 的名称。
  const fromName: string = from.name
  const toName: string = to.name

  // 如果二者名称相同，则直接返回。
  if (fromName === toName) {
    return
  }

  // 更新 _ezNavNodeBackMap。
  _ezNavNodeBackMap.value[toName] = fromName
}

function mayPutEzNavActiveNodeKey(nodeKey: string): void {
  // 如果当前 navigation 不存在，则返回。
  if (!_modal.value) {
    return
  }

  // 如果 affix, pinned, active 三处数组任意一处有 nodeKey 的话，则返回。
  if (
    _ezNavAffixNodeKeys.value.includes(nodeKey) ||
    _ezNavPinnedNodeKeys.value.includes(nodeKey) ||
    _ezNavActiveNodeKeys.value.includes(nodeKey)
  ) {
    return
  }

  // 如果 pinned 数组 + active 数组的数量已经到达了最大值，则返回。
  const maxActiveItem: number = _modal.value.setting.ezNavMaxActiveItem
  if (_ezNavPinnedNodeKeys.value.length + _ezNavActiveNodeKeys.value.length >= maxActiveItem) {
    return
  }

  // 将 nodeKey 添加到 active 数组的末尾。
  _ezNavActiveNodeKeys.value.push(nodeKey)
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): NavigationStore => ({
    ready,
    defaultNodeKey,
    nodeInfos,
    isCurrentNode,
    currentNodeKey,
    getNodeInfo,
    getParentNodeInfo,
    getChildNodeInfos,
    setCurrentNodeKey,
    ezNavEnabled,
    ezNavMaxActiveItem,
    ezNavRestoreWhenLogin,
    ezNavAffixNodeKeys,
    ezNavPinnedNodeKeys,
    ezNavActiveNodeKeys,
    ezNavNodeMetaMap,
    ezNavNodeBackMap,
    ezNavLoading,
    ezNavBacking,
    setEzNavPinnedNodeKeys,
    setEzNavActiveNodeKeys,
    incrementEzNavBacking,
    decrementEzNavBacking,
    ezNavNodes,
    ezNavAnnotation,
    ezNavNodeMeta,
    ezNavNodeBack,
    pushEzNavByNodeKey,
    pushEzNavByLocation,
    pushEzNavByLocateInfo,
    pinEzNavNode,
    unpinEzNavNode,
    removeEzNavNode,
    clearActiveEzNavNodes,
    clearAllEzNavNodes,
  })
}

// endregion

// region 钩子逻辑

export type EzNavPersistenceData = {
  pinnedNodeKeys?: string[]
  activeNodeKeys?: string[]
  nodeMetaMap?: Record<string, EzNavNodeMeta>
  nodeBackMap?: Record<string, string>
}

// 导航.配置仓库类型。
const NAVIGATION_SETTINGREPO_CATEGORY: string = 'framework.mobile.navigation'
// 导航.配置仓库参数: key。
const NAVIGATION_SETTINGREPO_ARGS_KEY: string[] = ['key']
// 导航.配置仓库参数: custom。
const NAVIGATION_SETTINGREPO_ARGS_CUSTOM: string[] = ['custom']
// EzNav.本地存储持久化键
const EZ_NAV_LOCAL_STORAGE_PERSISTENCE_DATA_KEY = 'store.persistence_data.eznav'
// EzNav.配置仓库类型
const EZ_NAV_SETTINGREPO_CATEGORY = 'framework.mobile.eznav'

let ezNavLnpStoreLoginActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 ezNavLnpStoreLoginActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  ezNavLnpStoreLoginActionHandle = import.meta.hot.data.lnpStoreLoginActionHandle ?? (() => {})
}

let ezNavLnpStoreLogoutActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 ezNavLnpStoreLogoutActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  ezNavLnpStoreLogoutActionHandle = import.meta.hot.data.lnpStoreLogoutActionHandle ?? (() => {})
}

// 防抖存储延时句柄。
let ezNavDebounceSaveHandle: ReturnType<typeof setTimeout> | null = null

/**
 * VIM 初始化钩子。
 */
function vimInitializedLoadHook(): void {
  // 初始化模态。
  initModal()
  // 添加登录监听器。
  addEzNavLnpStoreLoginActionListener()
  // 添加登出监听器。
  addEzNavLnpStoreLogoutActionListener()
}

function initModal(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  updateModal(null)
}

function addEzNavLnpStoreLoginActionListener(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  async function restoreAfterLogin(lnpStore: SimplyStore<'lnp', LnpStore>): Promise<void> {
    if (!ctx) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }

    // 置位加载标志。
    _ezNavLoading.value += 1

    // 恢复导航信息。
    const textNodeInspectInfo: TextNodeInspectInfo = {
      category: EZ_NAV_SETTINGREPO_CATEGORY,
      args: [lnpStore.me],
    }
    try {
      const res = await resolveResponse(operateInspect(textNodeInspectInfo))
      if (!res) {
        return
      }
      const persistenceData: EzNavPersistenceData = JSON.parse(res.value)
      _ezNavPinnedNodeKeys.value = persistenceData.pinnedNodeKeys ?? []
      _ezNavActiveNodeKeys.value = persistenceData.activeNodeKeys ?? []
      _ezNavNodeMetaMap.value = persistenceData.nodeMetaMap ?? {}
      _ezNavNodeBackMap.value = persistenceData.nodeBackMap ?? {}
      // 根据 VIM 设置，选择性地恢复导航信息。
      switch (_modal.value?.setting.ezNavRestoreWhenLogin) {
        case 'restore-all':
          break
        case 'restore-pinned':
          _ezNavActiveNodeKeys.value = []
          break
        default:
          throw new Error('不应该执行到此处，请联系开发人员')
      }
    } finally {
      // 复位加载标志。
      _ezNavLoading.value -= 1
    }
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  ezNavLnpStoreLoginActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willLogin') {
      return
    }
    after((result: ExecutableActionHandle<void, void, void>) => {
      result.registerAfterHook(() => restoreAfterLogin(lnpStore))
    })
  })
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 ezNavLnpStoreLoginActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLoginActionHandle = ezNavLnpStoreLoginActionHandle
  }
}

function addEzNavLnpStoreLogoutActionListener(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  async function saveBeforeLogout(lnpStore: SimplyStore<'lnp', LnpStore>): Promise<void> {
    if (!ctx) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }

    // 原始值。
    const rawValue = {
      pinnedNodeKeys: _ezNavPinnedNodeKeys.value,
      activeNodeKeys: _ezNavActiveNodeKeys.value,
      nodeMetaMap: _ezNavNodeMetaMap.value,
      nodeBackMap: _ezNavNodeBackMap.value,
    }

    // 根据 VIM 设置，选择性地恢复导航信息。
    switch (_modal.value?.setting.ezNavRestoreWhenLogin) {
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
      category: EZ_NAV_SETTINGREPO_CATEGORY,
      args: [lnpStore.me],
      value: JSON.stringify(rawValue),
    }

    // 调用服务存储 EzNav 数据。
    await resolveResponse(operatePut(textNodePutInfo))
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  ezNavLnpStoreLogoutActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willLogout') {
      return
    }
    after((result: ExecutableActionHandle<void, void, void>) => {
      result.registerBeforeHook(() => {
        // 如果防抖存储延时句柄不存在，则直接返回。
        if (!ezNavDebounceSaveHandle) {
          return Promise.resolve()
        }
        // 取消防抖存储延时，并立即存储。
        clearTimeout(ezNavDebounceSaveHandle)
        ezNavDebounceSaveHandle = null
        return saveBeforeLogout(lnpStore)
      })
    })
  })
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 ezNavLnpStoreLogoutActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLogoutActionHandle = ezNavLnpStoreLogoutActionHandle
  }
}

/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  // 加载 navigation。
  loadModal().then(() => Promise.resolve())
}

// 模态加载方法。
async function loadModal(): Promise<void> {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  try {
    // 获取模态。
    const modal: Modal = await loadModal0()
    // 更新模态。
    updateModal(modal)
  } catch (e: unknown) {
    // 输出错误信息。
    ctx.library().defaultVisualizer().notify('errorMessage', '加载 Navigation 失败')
    let message: string
    if (e instanceof Error) {
      message = e.message
    } else {
      message = '未知错误'
    }
    ctx.library().defaultVisualizer().notify('errorMessage', message)
    // 更新模态。
    updateModal(null)
  } finally {
    // 遍历所有 nodeInfos，加载 affixNodeKeys。
    loadEzNavAffixNodeKeys()
    // 根据当前状态，选择性地恢复持久化数据。
    mayRestoreEzNavPersistenceData()
    // 设置准备标记。
    setReady()
  }
}

async function loadModal0(): Promise<Modal> {
  // 该方法用于验证 NavigationKey 对象的格式，接受任何类型的参数，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function validateNavigationKey(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      throw new Error('NavigationKey 格式不正确')
    }
    if (!obj.type || (obj.type !== 'default' && obj.type !== 'custom')) {
      throw new Error('NavigationKey.type 格式不正确')
    }
    if (obj.type === 'custom') {
      if (!obj.id || typeof obj.id !== 'string') {
        throw new Error('NavigationKey.id 格式不正确')
      }
    }
  }

  // 获取 Navigation Key。
  const navigationKeyTextNode: TextNode | null = (await resolveResponse(
    textNodeOperateInspect({
      category: NAVIGATION_SETTINGREPO_CATEGORY,
      args: NAVIGATION_SETTINGREPO_ARGS_KEY,
    }),
  )) as TextNode | null
  if (!navigationKeyTextNode) {
    throw new Error('无法获取 Navigation Key, 请联系开发人员')
  }
  const navigationKey: NavigationKey = JSON.parse(navigationKeyTextNode.value)
  validateNavigationKey(navigationKey)

  // 加载 Navigation。
  if (navigationKey.type === 'default') {
    return loadModalDefault()
  }
  if (navigationKey.type === 'custom') {
    // 已经通过验证，此处断言非空。
    return await loadModalCustom(navigationKey.id!)
  }
  throw new Error('不应该执行到此处，请联系开发人员')
}

function loadModalDefault(): Modal {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  // 获取 Navigation VIM 组件。
  const navigation: Omit<VimNavigation, 'init'> = ctx.navigation()

  // 返回结果。
  return {
    setting: {
      defaultNodeKey: navigation.setting.defaultNodeKey,
      ezNavEnabled: navigation.setting.ezNavEnabled,
      ezNavMaxActiveItem: navigation.setting.ezNavMaxActiveItem,
      ezNavRestoreWhenLogin: navigation.setting.ezNavRestoreWhenLogin,
    },
    nodeRootKeys: navigation.nodeRootKeys(),
    nodeInfos: navigation.nodeInfos(),
  }
}

async function loadModalCustom(id: string): Promise<Modal> {
  type NavigationSetting = {
    defaultNodeKey: string
    ezNavEnabled: boolean
    ezNavMaxActiveItem: number
    ezNavRestoreWhenLogin: 'restore-pinned' | 'restore-all'
  }

  type NodeSetting = {
    key: string
    display?: Record<'', Record<string, string>> & Record<string, Record<string, string>>
    menu?: {
      shown: boolean
    }
    ezNav?: {
      shown: boolean
      affix?: boolean
      affixIndex?: number
      closedBehavior?: {
        type: 'back' | 'default' | 'none'
        data: Record<string, string>
      }
    }
    router?: {
      required: boolean
      path?: string
      component?: {
        key: string
        param?: Record<string, Record<string, unknown>> & { '': Record<string, unknown> }
      }
    }
    permission?: {
      required: boolean
      node?: string
    }
  }

  // 该方法用于验证 NavigationSetting 对象的格式，接受任何类型的参数，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function validateNavigationSetting(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      throw new Error('NavigationSetting 格式不正确')
    }
    if (!obj.defaultNodeKey || typeof obj.defaultNodeKey !== 'string') {
      throw new Error('NavigationSetting.defaultNodeKey 格式不正确')
    }
    if (obj.ezNavEnabled !== undefined && typeof obj.ezNavEnabled !== 'boolean') {
      throw new Error('NavigationSetting.ezNavEnabled 格式不正确')
    }
    if (obj.ezNavMaxActiveItem !== undefined && typeof obj.ezNavMaxActiveItem !== 'number') {
      throw new Error('NavigationSetting.ezNavMaxActiveItem 格式不正确')
    }
    if (
      obj.ezNavRestoreWhenLogin !== undefined &&
      obj.ezNavRestoreWhenLogin !== 'restore-pinned' &&
      obj.ezNavRestoreWhenLogin !== 'restore-all'
    ) {
      throw new Error('NavigationSetting.ezNavRestoreWhenLogin 格式不正确')
    }
  }

  // 该方法用于验证 NavigationSetting 对象的格式，接受任何类型的参数，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function validateNodeSetting(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      throw new Error('NodeSetting 格式不正确')
    }
    if (!obj.key || typeof obj.key !== 'string') {
      throw new Error('NodeSetting.key 格式不正确')
    }
    // 其他字段可选，无需验证。
  }

  /*
   * 递归遍历节点时，需要保证 key 唯一。
   */
  const keyChecker: Set<string> = new Set<string>()

  function pushNodeRecursive(
    node: {
      rootKeys: string[]
      infos: Record<string, NodeInfo>
    },
    current: {
      nodeItem: NavigationNodeInspectResultItem
      nodeSetting: NodeSetting
    },
    parent: {
      nodeItem: NavigationNodeInspectResultItem
      nodeSetting: NodeSetting
    } | null,
  ): void {
    // 验证 current.nodeSetting 格式。
    validateNodeSetting(current.nodeSetting)
    // 检查 key 唯一性。
    if (keyChecker.has(current.nodeSetting.key)) {
      throw new Error(`Navigation Node key 不唯一: ${current.nodeSetting.key}`)
    }
    keyChecker.add(current.nodeSetting.key)
    // 处理当前节点。
    const children: {
      nodeItem: NavigationNodeInspectResultItem
      nodeSetting: NodeSetting
    }[] =
      current.nodeItem.children?.map((child) => ({
        nodeItem: child,
        nodeSetting: JSON.parse(child.content),
      })) ?? []
    if (!parent) {
      node.rootKeys.push(current.nodeSetting.key)
    }
    node.infos[current.nodeSetting.key] = {
      parentKey: parent?.nodeSetting.key ?? null,
      childKeys: children.map((child) => child.nodeSetting.key),
      key: current.nodeSetting.key,
      index: current.nodeItem.index,
      display: mapDisplay(current.nodeSetting.display),
      menu: current.nodeSetting.menu ?? { shown: false },
      ezNav: current.nodeSetting.ezNav ?? { shown: false },
      router: current.nodeSetting.router ?? { required: false },
      permission: current.nodeSetting.permission ?? { required: false },
    }
    for (const child of children) {
      pushNodeRecursive(node, child, current)
    }
  }

  function mapDisplay(displayInfo?: DisplayInfo): DisplayInfo {
    const _displayInfo: DisplayInfo = { '': {} }
    for (const key in displayInfo) {
      _displayInfo[toKebabCase(key)] = displayInfo[key]
    }
    return _displayInfo
  }

  // 获取 Custom List。
  const customContentNavigationNode: NavigationNodeInspectResult | null = (await resolveResponse(
    navigationNodeOperateInspect({
      category: NAVIGATION_SETTINGREPO_CATEGORY,
      args: [...NAVIGATION_SETTINGREPO_ARGS_CUSTOM, id],
    }),
  )) as NavigationNodeInspectResult | null
  if (!customContentNavigationNode) {
    throw new Error(`无法获取 Custom Navigation Content, ID: ${id}, 请联系开发人员`)
  }
  const navigationSetting: NavigationSetting = JSON.parse(customContentNavigationNode.content)
  validateNavigationSetting(navigationSetting)

  // 组织结果并返回。
  const nodeRootKeys: string[] = []
  const nodeInfos: Record<string, NodeInfo> = {}
  for (const child of customContentNavigationNode.children) {
    pushNodeRecursive(
      {
        rootKeys: nodeRootKeys,
        infos: nodeInfos,
      },
      {
        nodeItem: child,
        nodeSetting: JSON.parse(child.content),
      },
      null,
    )
  }
  return {
    setting: {
      defaultNodeKey: navigationSetting.defaultNodeKey,
      ezNavEnabled: navigationSetting.ezNavEnabled,
      ezNavMaxActiveItem: navigationSetting.ezNavMaxActiveItem,
      ezNavRestoreWhenLogin: navigationSetting.ezNavRestoreWhenLogin,
    },
    nodeRootKeys,
    nodeInfos,
  }
}

function loadEzNavAffixNodeKeys(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  _ezNavAffixNodeKeys.value = Object.values(_modal.value?.nodeInfos ?? {})
    .filter((nodeInfo) => nodeInfo.ezNav.shown && nodeInfo.ezNav.affix)
    .sort((a, b) => {
      const affixIndexAlpha = a.ezNav.affixIndex ?? 0
      const affixIndexBravo = b.ezNav.affixIndex ?? 0
      return affixIndexAlpha - affixIndexBravo
    })
    .map((nodeInfo) => nodeInfo.key)
}

function mayRestoreEzNavPersistenceData(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')

  // 如果没有登录，则什么也不做。
  if (!lnpStore.isLogin) {
    return
  }

  // 复位 EzNav 参数。
  const persistenceDataJson: string | null = localStorage.getItem(
    EZ_NAV_LOCAL_STORAGE_PERSISTENCE_DATA_KEY,
  )
  if (persistenceDataJson !== null && persistenceDataJson !== undefined) {
    const persistenceData: EzNavPersistenceData = JSON.parse(persistenceDataJson)
    _ezNavPinnedNodeKeys.value = persistenceData.pinnedNodeKeys ?? []
    _ezNavActiveNodeKeys.value = persistenceData.activeNodeKeys ?? []
    _ezNavNodeMetaMap.value = persistenceData.nodeMetaMap ?? {}
    _ezNavNodeBackMap.value = persistenceData.nodeBackMap ?? {}
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
  // 根据当前状态，选择性地保存持久化数据。
  maySaveEzNavPersistenceData()
  // 根据防抖存储延时句柄的值，选择性地取消防抖存储。
  mayCancelEzNavDebounceSave()
}

function removeLnpStoreLoginActionListener(): void {
  ezNavLnpStoreLoginActionHandle()
  ezNavLnpStoreLoginActionHandle = () => {}
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 ezNavLnpStoreLoginActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLoginActionHandle = ezNavLnpStoreLoginActionHandle
  }
}

function removeLnpStoreLogoutActionListener(): void {
  ezNavLnpStoreLogoutActionHandle()
  ezNavLnpStoreLogoutActionHandle = () => {}
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 ezNavLnpStoreLogoutActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLogoutActionHandle = ezNavLnpStoreLogoutActionHandle
  }
}

function maySaveEzNavPersistenceData(): void {
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
    EZ_NAV_LOCAL_STORAGE_PERSISTENCE_DATA_KEY,
    JSON.stringify({
      pinnedNodeKeys: _ezNavPinnedNodeKeys.value,
      activeNodeKeys: _ezNavActiveNodeKeys.value,
      nodeMetaMap: _ezNavNodeMetaMap.value,
      nodeBackMap: _ezNavNodeBackMap.value,
    }),
  )
}

function mayCancelEzNavDebounceSave(): void {
  if (!ezNavDebounceSaveHandle) {
    return
  }
  clearTimeout(ezNavDebounceSaveHandle)
}

// endregion

// region VimStoreModule 定义

/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup,
}

// endregion

export default vimStoreModule
