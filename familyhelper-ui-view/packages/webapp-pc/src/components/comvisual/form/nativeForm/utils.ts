// noinspection JSUnusedGlobalSymbols,DuplicatedCode

export function splitPropPath(path: string): string[] {
  return path.split('.').filter((s) => s.length > 0)
}

export function getByPath(root: unknown, path: string): unknown {
  const segments = splitPropPath(path)
  let cur: unknown = root
  for (const key of segments) {
    if (cur == null || typeof cur !== 'object') {
      return undefined
    }
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}
