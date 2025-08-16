// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import { type StoreSetup, type VimStoreModule } from '@/store/types.ts'

import { type ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'
import { ExecutableActionHandleImpl } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'

import { computed, type ComputedRef, ref } from 'vue'

import {
  type DynamicLoginInfo,
  type LoginResponse,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/login.ts'
import {
  dynamicLogin,
  logout as apiLogout,
  postpone,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/login.ts'
import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permission.ts'
import { lookupForUser } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permission.ts'
import { currentDate } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/time.ts'

import { type ResponseBadHandler } from '@/util/response.ts'
import { defaultResponseBadHandler, resolveResponse } from '@/util/response.ts'

import { currentTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { uuid } from '@dwarfeng/familyhelper-ui-component-util/src/util/uuid.ts'

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerVimInitializedHook(vimInitializedLoadHook)
  ctx.registerWindowLoadHook(windowLoadHook)
  ctx.registerWindowBeforeUnloadHook(windowUnloadHook)
}

// -----------------------------------------------------------Store 定义-----------------------------------------------------------
/**
 * Lnp Store。
 */
export type LnpStore = {
  isLogin: ComputedRef<boolean>
  token: ComputedRef<string>
  me: ComputedRef<string>
  hasPermission: (node: string) => boolean
  willLogin: (
    dynamicLoginInfo: Pick<DynamicLoginInfo, 'account_key' | 'password'>,
  ) => ExecutableActionHandle<void, void, void>
  willLogout: () => ExecutableActionHandle<void, void, void>
  willFireKick: () => ExecutableActionHandle<void, void, void>
}

// Store 区域。
const _accountId = ref<string>('')
const _token = ref<string>('')
const _expireDate = ref<number>(0)
const _serviceDateOffset = ref<number>(0)
const _permissions = ref<Record<string, string>>({})
const _permissionUuid = ref<string>('')
const _onlineFlag = ref<boolean>(false)

// 登录。
const isLogin = computed<boolean>(() => {
  if (!_onlineFlag.value) {
    return false
  }
  if (!_token.value) {
    return false
  }
  return currentTimestamp() + _serviceDateOffset.value - _expireDate.value < 0
})

const token = computed<string>(() => _token.value)

function setLoginInfo(loginResponse: LoginResponse): void {
  _accountId.value = loginResponse.account_id
  _token.value = loginResponse.token
  _expireDate.value = loginResponse.expire_date
}

function setOnlineFlag(value: boolean): void {
  _onlineFlag.value = value
}

function willLogin(
  dynamicLoginInfo: Pick<DynamicLoginInfo, 'account_key' | 'password'>,
): ExecutableActionHandle<void, void, void> {
  return new ExecutableActionHandleImpl(() => login(dynamicLoginInfo))
}

async function login(
  dynamicLoginInfo: Pick<DynamicLoginInfo, 'account_key' | 'password'>,
): Promise<void> {
  return resolveResponse(
    dynamicLogin({ ...dynamicLoginInfo, remark: '家庭助手移动端登录', extra_params: {} }),
  )
    .then((res) => setLoginInfo(res))
    .then(() => {
      setOnlineFlag(true)
      return resolveResponse(currentDate())
    })
    .then((res) => {
      setServiceDateOffset(res - currentTimestamp())
      // noinspection JSUnresolvedReference
      return resolveResponse(lookupForUser(dynamicLoginInfo.account_key))
    })
    .then((res) => setPermissions(res))
}

function willLogout(): ExecutableActionHandle<void, void, void> {
  return new ExecutableActionHandleImpl(() => logout())
}

async function logout(): Promise<void> {
  return Promise.resolve()
    .then(() => {
      setOnlineFlag(false)
      return Promise.resolve()
    })
    .then(() => resolveResponse(apiLogout({ long_id: _token.value })))
    .then(() => Promise.resolve())
}

function willFireKick(): ExecutableActionHandle<void, void, void> {
  return new ExecutableActionHandleImpl(() => fireKick())
}

function fireKick(): Promise<void> {
  setOnlineFlag(false)
  return Promise.resolve()
}

// 账号。
const me = computed<string>(() => _accountId.value)

// 权限。
function hasPermission(node: string): boolean {
  return _permissions.value[node] === _permissionUuid.value
}

function setPermissions(value: Permission[]): void {
  const id = uuid()
  _permissionUuid.value = id
  value.forEach((p) => {
    _permissions.value[p.key.string_id] = id
  })
}

// 服务器时间。
function setServiceDateOffset(value: number): void {
  _serviceDateOffset.value = value
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): LnpStore => ({
    isLogin,
    me,
    token,
    hasPermission,
    willLogin,
    willLogout,
    willFireKick,
  })
}

// -----------------------------------------------------------钩子逻辑-----------------------------------------------------------
/**
 * 持久化数据。
 */
type PersistenceData = {
  accountId: string
  token: string
  expireDate: number
  serviceDateOffset: number
  permissions: Record<string, string>
  permissionUuid: string
  onlineFlag: boolean
}

// 存储在 LocalStorage 中的持久化主键
const LOCAL_STORAGE_PERSISTENCE_DATA_KEY = 'store.persistence_data.lnp'

// 登录保持器。
let loginKeeper: number

/**
 * VIM 初始化钩子。
 */
function vimInitializedLoadHook(): void {
  // 复位登录参数。
  const persistenceDataJson = localStorage.getItem(LOCAL_STORAGE_PERSISTENCE_DATA_KEY)
  if (persistenceDataJson !== null && persistenceDataJson !== undefined) {
    const persistenceData = JSON.parse(persistenceDataJson)
    restorePersistenceData(persistenceData)
  }
}

/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  // 立即执行一次登录状态检查。
  loginCheck()

  // 设置登录保持器。
  loginKeeper = setInterval(loginCheck, 10000)
}

function loginCheck(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  // 如果没有登录，则跳转到登录页面。
  if (!isLogin.value) {
    const vueRouter = ctx.router().vueRouter()
    if (!vueRouter.currentRoute.value.name) {
      vueRouter.push({ name: 'vim.login' }).then(() => {})
    } else if (vueRouter.currentRoute.value.name !== 'vim.login') {
      ctx.library().defaultVisualizer().notify('errorMessage', '登录状态异常，请重新登录')
      vueRouter.push({ name: 'vim.login' }).then(() => {})
    }
  }
  // 否则，立即执行一次登录保持。
  else {
    const responseBadHandler: ResponseBadHandler = {
      handle(responseMeta) {
        if (!ctx) {
          throw new Error('不应该执行到此处, 请联系开发人员')
        }
        if (responseMeta.code === 90) {
          ctx.library().defaultVisualizer().notify('errorMessage', '登录状态异常，请重新登录')
        } else {
          defaultResponseBadHandler.handle(responseMeta)
        }
        setOnlineFlag(false)
        ctx
          .router()
          .vueRouter()
          .push({ name: 'vim.login' })
          .then(() => {})
      },
    }
    resolveResponse(postpone({ long_id: _token.value }), responseBadHandler)
      .then((res) => {
        setLoginInfo(res)
        return resolveResponse(currentDate())
      })
      .then((res) => {
        setServiceDateOffset(res - currentTimestamp())
      })
  }
}

/**
 * Window 卸载钩子。
 */
function windowUnloadHook(): void {
  // 存储登录参数。
  window.localStorage.setItem(
    LOCAL_STORAGE_PERSISTENCE_DATA_KEY,
    JSON.stringify(getPersistenceData()),
  )
  // 清除登录保持器。
  clearInterval(loginKeeper)
}

function getPersistenceData(): PersistenceData {
  return {
    accountId: _accountId.value,
    token: _token.value,
    expireDate: _expireDate.value,
    serviceDateOffset: _serviceDateOffset.value,
    permissions: _permissions.value,
    permissionUuid: _permissionUuid.value,
    onlineFlag: _onlineFlag.value,
  }
}

function restorePersistenceData(value: PersistenceData): void {
  _accountId.value = value.accountId
  _token.value = value.token
  _expireDate.value = value.expireDate
  _serviceDateOffset.value = value.serviceDateOffset
  _permissions.value = value.permissions
  _permissionUuid.value = value.permissionUuid
  _onlineFlag.value = value.onlineFlag
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
