// noinspection JSUnusedGlobalSymbols

export type Extension = '.rtf' | '.txt'
export type ExtensionFilter = (extension: Extension) => boolean
export type FileCreateInfo = {
  blob: Blob
  name: string
}
