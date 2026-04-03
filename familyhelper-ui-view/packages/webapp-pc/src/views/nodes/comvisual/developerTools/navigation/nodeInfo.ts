// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type JsonObject } from '@dwarfeng/familyhelper-ui-component-util/src/util/json.ts'

import { type NodeInfo as VimNodeInfo } from '@/navigation/types.ts'

export type EzNavClosedBehaviorType = 'back' | 'default' | 'none'

export type NodeInfo = {
  key: string
  display: Record<'' | string, JsonObject>
  menu: { shown: boolean }
  ezNav: {
    shown: boolean
    affix: boolean
    affixIndex: number
    closedBehavior: {
      type: EzNavClosedBehaviorType
      data: Record<string, string>
    }
  }
  router: {
    required: boolean
    path: string
    component: {
      key: string
      param: Record<'' | string, JsonObject>
    }
  }
  permission: {
    required: boolean
    node: string
  }
}

function deepCloneJson<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export function createEmptyNodeInfo(initialKey: string): NodeInfo {
  return {
    key: initialKey,
    display: {},
    menu: { shown: true },
    ezNav: {
      shown: true,
      affix: false,
      affixIndex: 0,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: '',
      component: {
        key: '',
        param: {},
      },
    },
    permission: {
      required: true,
      node: '',
    },
  }
}

function coerceRecordStringString(v: unknown): Record<string, string> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) {
    return {}
  }
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === 'string') {
      out[k] = val
    }
  }
  return out
}

function coerceJsonObject(v: unknown): JsonObject {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) {
    return {}
  }
  return v as JsonObject
}

function coerceDisplay(v: unknown): Record<string, JsonObject> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) {
    return {}
  }
  const out: Record<string, JsonObject> = {}
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    out[k] = coerceJsonObject(val)
  }
  return out
}

function coerceClosedType(v: unknown): EzNavClosedBehaviorType {
  if (v === 'back' || v === 'default' || v === 'none') {
    return v
  }
  return 'back'
}

export function parseNodeInfoContent(content: string, fallbackKey: string): NodeInfo {
  if (content === null || content.trim() === '') {
    return createEmptyNodeInfo(fallbackKey)
  }
  try {
    const raw: unknown = JSON.parse(content)
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      return createEmptyNodeInfo(fallbackKey)
    }
    const o = raw as Record<string, unknown>
    const key = typeof o.key === 'string' && o.key !== '' ? o.key : fallbackKey
    const menuShown = o.menu !== null && typeof o.menu === 'object' && !Array.isArray(o.menu)
    const menuObj = menuShown ? (o.menu as Record<string, unknown>) : {}
    const ez = o.ezNav !== null && typeof o.ezNav === 'object' && !Array.isArray(o.ezNav)
    const ezObj = ez ? (o.ezNav as Record<string, unknown>) : {}
    const cb =
      ezObj.closedBehavior !== null &&
      typeof ezObj.closedBehavior === 'object' &&
      !Array.isArray(ezObj.closedBehavior)
        ? (ezObj.closedBehavior as Record<string, unknown>)
        : {}
    const rt = o.router !== null && typeof o.router === 'object' && !Array.isArray(o.router)
    const rtObj = rt ? (o.router as Record<string, unknown>) : {}
    const comp =
      rtObj.component !== null &&
      typeof rtObj.component === 'object' &&
      !Array.isArray(rtObj.component)
        ? (rtObj.component as Record<string, unknown>)
        : {}
    const perm =
      o.permission !== null && typeof o.permission === 'object' && !Array.isArray(o.permission)
        ? (o.permission as Record<string, unknown>)
        : {}
    return {
      key,
      display: coerceDisplay(o.display),
      menu: {
        shown: typeof menuObj.shown === 'boolean' ? menuObj.shown : true,
      },
      ezNav: {
        shown: typeof ezObj.shown === 'boolean' ? ezObj.shown : true,
        affix: typeof ezObj.affix === 'boolean' ? ezObj.affix : false,
        affixIndex: typeof ezObj.affixIndex === 'number' ? ezObj.affixIndex : 0,
        closedBehavior: {
          type: coerceClosedType(cb.type),
          data: coerceRecordStringString(cb.data),
        },
      },
      router: {
        required: typeof rtObj.required === 'boolean' ? rtObj.required : true,
        path: typeof rtObj.path === 'string' ? rtObj.path : '',
        component: {
          key: typeof comp.key === 'string' ? comp.key : '',
          param:
            comp.param !== null && typeof comp.param === 'object' && !Array.isArray(comp.param)
              ? (deepCloneJson(comp.param) as Record<string, JsonObject>)
              : {},
        },
      },
      permission: {
        required: typeof perm.required === 'boolean' ? perm.required : true,
        node: typeof perm.node === 'string' ? perm.node : '',
      },
    }
  } catch {
    return createEmptyNodeInfo(fallbackKey)
  }
}

/** 固定键顺序，便于直接读库。 */
export function stringifyNodeInfo(nodeInfo: NodeInfo): string {
  const displayKeys = Object.keys(nodeInfo.display).sort((a, b) => {
    if (a === '') {
      return -1
    }
    if (b === '') {
      return 1
    }
    return a.localeCompare(b)
  })
  const displayOrdered: Record<string, JsonObject> = {}
  for (const k of displayKeys) {
    displayOrdered[k] = nodeInfo.display[k]
  }

  const ezNavOut: Record<string, unknown> = {
    shown: nodeInfo.ezNav.shown,
  }
  if (nodeInfo.ezNav.affix) {
    ezNavOut.affix = nodeInfo.ezNav.affix
  }
  if (nodeInfo.ezNav.affixIndex !== 0) {
    ezNavOut.affixIndex = nodeInfo.ezNav.affixIndex
  }
  ezNavOut.closedBehavior = {
    type: nodeInfo.ezNav.closedBehavior.type,
    data: nodeInfo.ezNav.closedBehavior.data,
  }

  const componentOut: Record<string, unknown> = {
    key: nodeInfo.router.component.key,
  }
  if (Object.keys(nodeInfo.router.component.param).length > 0) {
    componentOut.param = nodeInfo.router.component.param
  }

  const routerOut: Record<string, unknown> = {
    required: nodeInfo.router.required,
    path: nodeInfo.router.path,
    component: componentOut,
  }

  const permissionOut: Record<string, unknown> = {
    required: nodeInfo.permission.required,
  }
  if (nodeInfo.permission.node.trim() !== '') {
    permissionOut.node = nodeInfo.permission.node
  }

  const root: Record<string, unknown> = {
    key: nodeInfo.key,
    display: displayOrdered,
    menu: {
      shown: nodeInfo.menu.shown,
    },
    ezNav: ezNavOut,
    router: routerOut,
    permission: permissionOut,
  }

  return `${JSON.stringify(root, null, 2)}\n`
}

export function initDisplayFromLibrary(
  exampleByKey: (vizKey: string) => JsonObject | null,
  visualizerKeys: readonly string[],
): Record<string, JsonObject> {
  const display: Record<string, JsonObject> = {}
  for (const vk of visualizerKeys) {
    const ex = exampleByKey(vk)
    display[vk] = ex ? deepCloneJson(ex) : { label: '' }
  }
  const emptyEx = exampleByKey('')
  if (emptyEx && display[''] === undefined) {
    display[''] = deepCloneJson(emptyEx)
  }
  return display
}

export function buildDefaultNavigationItemSetting(params: {
  visualizerKeys: readonly string[]
  exampleDisplayForKey: (vizKey: string) => JsonObject | null
  defaultExampleDisplay: JsonObject
}): NodeInfo {
  const m = createEmptyNodeInfo('')
  m.display = initDisplayFromLibrary(params.exampleDisplayForKey, params.visualizerKeys)
  if (m.display[''] === undefined) {
    m.display[''] = deepCloneJson(params.defaultExampleDisplay)
  }
  return m
}

// region 与 VIM 导航元数据互操作

/**
 * 将运行时 {@link NodeInfo} 转为库中存储用的 {@link NodeInfo}。
 *
 * @returns 转换后得到的 {@link NodeInfo}。
 */
export function nodeInfoFromVim(info: Readonly<VimNodeInfo>): NodeInfo {
  const ez = info.ezNav
  const cb = ez.closedBehavior
  const rt = info.router
  const comp = rt.component
  return {
    key: info.key,
    display: deepCloneJson(info.display) as Record<string, JsonObject>,
    menu: { shown: info.menu.shown },
    ezNav: {
      shown: ez.shown,
      affix: ez.affix ?? false,
      affixIndex: ez.affixIndex ?? 0,
      closedBehavior: {
        type: cb ? cb.type : 'back',
        data: cb ? coerceRecordStringString(cb.data) : {},
      },
    },
    router: {
      required: rt.required,
      path: rt.path ?? '',
      component: {
        key: comp?.key ?? '',
        param:
          comp?.param !== undefined
            ? (deepCloneJson(comp.param) as Record<string, JsonObject>)
            : {},
      },
    },
    permission: {
      required: info.permission.required,
      node: info.permission.node ?? '',
    },
  }
}

// endregion
