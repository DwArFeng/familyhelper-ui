// noinspection JSUnusedGlobalSymbols

export type ExtensionInfo = {
  actionLevel: 'INSPECT' | 'EDIT'
}

const extensionInfoMap: Map<string, ExtensionInfo> = new Map<string, ExtensionInfo>()

extensionInfoMap.set('PDF', { actionLevel: 'INSPECT' })
extensionInfoMap.set('JPG', { actionLevel: 'INSPECT' })
extensionInfoMap.set('JPEG', { actionLevel: 'INSPECT' })
extensionInfoMap.set('PNG', { actionLevel: 'INSPECT' })
extensionInfoMap.set('GIF', { actionLevel: 'INSPECT' })

extensionInfoMap.set('RTF', { actionLevel: 'EDIT' })
extensionInfoMap.set('TXT', { actionLevel: 'EDIT' })

export function hasExtensionInfo(extension: unknown): boolean {
  if (typeof extension !== 'string') {
    return false
  }
  return extensionInfoMap.has(extension.toUpperCase())
}

export function extensionInfo(extension: unknown): ExtensionInfo | null {
  if (typeof extension !== 'string') {
    return null
  }
  return extensionInfoMap.get(extension.toUpperCase()) ?? null
}
