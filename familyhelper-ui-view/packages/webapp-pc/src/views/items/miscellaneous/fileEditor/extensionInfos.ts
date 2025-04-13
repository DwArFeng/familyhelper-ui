// noinspection JSUnusedGlobalSymbols

export type SubEditor = 'PDF' | 'PHOTO' | 'RTF' | 'TXT'

export type ExtensionInfo = {
  actionLevel: 'INSPECT' | 'EDIT'
  subEditor: SubEditor
}

const extensionInfoMap: Map<string, ExtensionInfo> = new Map<string, ExtensionInfo>()

extensionInfoMap.set('PDF', { actionLevel: 'INSPECT', subEditor: 'PDF' })
extensionInfoMap.set('JPG', { actionLevel: 'INSPECT', subEditor: 'PHOTO' })
extensionInfoMap.set('JPEG', { actionLevel: 'INSPECT', subEditor: 'PHOTO' })
extensionInfoMap.set('PNG', { actionLevel: 'INSPECT', subEditor: 'PHOTO' })
extensionInfoMap.set('GIF', { actionLevel: 'INSPECT', subEditor: 'PHOTO' })

extensionInfoMap.set('RTF', { actionLevel: 'EDIT', subEditor: 'RTF' })
extensionInfoMap.set('TXT', { actionLevel: 'EDIT', subEditor: 'TXT' })

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
