// noinspection JSUnusedGlobalSymbols,DuplicatedCode

/** 解析列宽：数字为 px；字符串支持 "120"、"120px" */
export function parseSizePx(v: number | string | undefined): number | null {
  if (v === undefined || v === null) {
    return null
  }
  if (typeof v === 'number' && !Number.isNaN(v)) {
    return v
  }
  const s = String(v).trim()
  if (s === '') {
    return null
  }
  const n = parseInt(s.replace(/px$/i, ''), 10)
  return Number.isNaN(n) ? null : n
}

/** 按点路径读取 row 字段，如 `group_key.permission_group_string_id` */
export function getProp(row: unknown, path: string): unknown {
  if (!path) {
    return undefined
  }
  const parts = path.split('.')
  let cur: unknown = row
  for (const p of parts) {
    if (cur === null || cur === undefined) {
      return undefined
    }
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}
