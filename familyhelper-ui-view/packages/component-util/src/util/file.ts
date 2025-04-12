// noinspection JSUnusedGlobalSymbols

export function parseFileExtension(fileName: string): string | '?' {
  const index: number = fileName.lastIndexOf('.')
  if (index < 0) {
    return '?'
  }
  return fileName.substring(index + 1)
}
