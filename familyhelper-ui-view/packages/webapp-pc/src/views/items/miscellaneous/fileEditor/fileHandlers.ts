// noinspection JSUnusedGlobalSymbols

import type { FileEditType } from '@/views/items/miscellaneous/fileEditor/type.ts'

export type InspectFileResult = {
  name: string
  blob: Blob
}

export type UpdateFileResult = {
  success: boolean
  message: string
}

export interface FileHandler {
  inspectFile(id: string): InspectFileResult | Promise<InspectFileResult>

  updateFile(id: string, blob: Blob, fileName: string): UpdateFileResult | Promise<UpdateFileResult>
}

const fileHandlerMap: Map<FileEditType, FileHandler> = new Map<FileEditType, FileHandler>()

export function hasFileEditType(type: unknown): boolean {
  return fileHandlerMap.has(type as FileEditType)
}

export function fileHandler(type: unknown): FileHandler | null {
  return fileHandlerMap.get(type as FileEditType) ?? null
}
