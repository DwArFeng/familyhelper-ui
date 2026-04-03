// noinspection JSUnusedGlobalSymbols,DuplicatedCode

export type EzNavRestoreWhenLogin = 'restore-pinned' | 'restore-all'

export type NavigationSetting = {
  defaultNodeKey: string
  ezNavEnabled: boolean
  ezNavMaxActiveItem: number
  ezNavRestoreWhenLogin: EzNavRestoreWhenLogin
}

export const DEFAULT_NAVIGATION_ROOT_SETTING: NavigationSetting = {
  defaultNodeKey: '',
  ezNavEnabled: true,
  ezNavMaxActiveItem: 1000,
  ezNavRestoreWhenLogin: 'restore-pinned',
}

export function parseNavigationSetting(content: string | null | undefined): NavigationSetting {
  if (content === null || content === undefined || content.trim() === '') {
    return { ...DEFAULT_NAVIGATION_ROOT_SETTING }
  }
  try {
    const raw: unknown = JSON.parse(content)
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ...DEFAULT_NAVIGATION_ROOT_SETTING }
    }
    const o = raw as Record<string, unknown>
    const login = o.ezNavRestoreWhenLogin
    const restoreOk = login === 'restore-pinned' || login === 'restore-all'
    const n = o.ezNavMaxActiveItem
    return {
      defaultNodeKey: typeof o.defaultNodeKey === 'string' ? o.defaultNodeKey : '',
      ezNavEnabled: typeof o.ezNavEnabled === 'boolean' ? o.ezNavEnabled : true,
      ezNavMaxActiveItem: typeof n === 'number' && Number.isFinite(n) ? n : 1000,
      ezNavRestoreWhenLogin: restoreOk ? login : 'restore-pinned',
    }
  } catch {
    return { ...DEFAULT_NAVIGATION_ROOT_SETTING }
  }
}

/** 键顺序与 NavigationSetting 字段一致，2 空格缩进。 */
export function stringifyNavigationSetting(model: NavigationSetting): string {
  const body = {
    defaultNodeKey: model.defaultNodeKey,
    ezNavEnabled: model.ezNavEnabled,
    ezNavMaxActiveItem: model.ezNavMaxActiveItem,
    ezNavRestoreWhenLogin: model.ezNavRestoreWhenLogin,
  }
  return `${JSON.stringify(body, null, 2)}\n`
}
