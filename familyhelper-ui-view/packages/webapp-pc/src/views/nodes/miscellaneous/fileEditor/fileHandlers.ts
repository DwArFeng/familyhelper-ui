// noinspection JSUnusedGlobalSymbols

import type { FileEditType } from '@/views/nodes/miscellaneous/fileEditor/type.ts'

import type { AttachmentFileInfo } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/attachmentFile.ts'
import {
  inspect as inspectNoteAttachmentFile,
  download as downloadNoteAttachmentFile,
  update as updateNoteAttachmentFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/attachmentFile.ts'
import { resolveResponse } from '@/util/response.ts'

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

fileHandlerMap.set('NOTE_ATTACHMENT_FILE', {
  async inspectFile(id: string): Promise<InspectFileResult> {
    const attachmentFileInfo: AttachmentFileInfo = await resolveResponse(
      inspectNoteAttachmentFile({ long_id: id }),
    )
    const blob: Blob = await downloadNoteAttachmentFile({ long_id: id })
    return {
      name: attachmentFileInfo.origin_name,
      blob: blob,
    }
  },
  async updateFile(id: string, blob: Blob, fileName: string): Promise<UpdateFileResult> {
    try {
      const formData: FormData = new FormData()
      formData.append('file', blob, fileName)
      await resolveResponse(updateNoteAttachmentFile({ long_id: id }, formData))
      return { success: true, message: '附件文件提交成功' }
    } catch {
      return { success: false, message: '附件文件提交失败' }
    }
  },
})

export function hasFileEditType(type: unknown): boolean {
  return fileHandlerMap.has(type as FileEditType)
}

export function fileHandler(type: unknown): FileHandler | null {
  return fileHandlerMap.get(type as FileEditType) ?? null
}
