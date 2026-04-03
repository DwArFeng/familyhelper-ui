// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NavigationKey } from '@/store/modules/navigation.ts'

/**
 * 自配置仓库文本解析 NavigationKey；结构非法时返回 null。
 */
export function tryParseNavigationKeyJson(text: string | null | undefined): NavigationKey | null {
  if (text === null || text === undefined || text.trim() === '') {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(text)
    if (!isNavigationKeyLike(parsed)) {
      return null
    }
    if (parsed.type === 'default') {
      return { type: 'default' }
    }
    return { type: 'custom', id: parsed.id }
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNavigationKeyLike(obj: any): obj is NavigationKey {
  if (!obj || typeof obj !== 'object') {
    return false
  }
  if (obj.type !== 'default' && obj.type !== 'custom') {
    return false
  }
  if (obj.type === 'custom') {
    if (!obj.id || typeof obj.id !== 'string') {
      return false
    }
  }
  return true
}

/**
 * 生成与 navigation store 中 validateNavigationKey 一致的持久化 JSON 字符串。
 *
 * 生成的字符串末尾包含换行符，以便于在文本节点中编辑时保持格式美观。
 *
 * @returns 生成的字符串。
 */
export function stringifyNavigationKeyForSave(key: NavigationKey): string {
  if (key.type === 'default') {
    return `${JSON.stringify({ type: 'default' }, null, 2)}\n`
  }
  const id = key.id?.trim() ?? ''
  if (id === '') {
    throw new Error('自定义导航 ID 不能为空')
  }
  return `${JSON.stringify({ type: 'custom', id }, null, 2)}\n`
}

export const DEFAULT_NAVIGATION_KEY: NavigationKey = { type: 'default' }
