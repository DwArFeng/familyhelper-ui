// noinspection JSUnusedGlobalSymbols,DuplicatedCode

export type CustomNavigation = {
  key: string
  name: string
  remark: string
}

export const SETTINGREPO_CATEGORY = 'public$framework.pc.navigation' as const

export const SETTINGREPO_ARGS_LIST = ['list'] as const

function isCustomNavigation(v: unknown): v is CustomNavigation {
  if (v === null || typeof v !== 'object') {
    return false
  }
  const o = v as Record<string, unknown>
  return typeof o.key === 'string' && typeof o.name === 'string' && typeof o.remark === 'string'
}

export function parseCustomNavigations(value: string | null | undefined): CustomNavigation[] {
  if (value === null || value === undefined || value.trim() === '') {
    return []
  }
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }
    const rows: CustomNavigation[] = []
    for (const el of parsed) {
      if (!isCustomNavigation(el)) {
        return []
      }
      rows.push({
        key: el.key,
        name: el.name,
        remark: el.remark,
      })
    }
    return rows
  } catch {
    return []
  }
}

/** 每行对象键顺序：key → name → remark；数组整体 2 空格缩进。 */
export function stringifyNavigationListRows(rows: CustomNavigation[]): string {
  const ordered = rows.map((r) => ({
    key: r.key,
    name: r.name,
    remark: r.remark,
  }))
  return `${JSON.stringify(ordered, null, 2)}\n`
}
