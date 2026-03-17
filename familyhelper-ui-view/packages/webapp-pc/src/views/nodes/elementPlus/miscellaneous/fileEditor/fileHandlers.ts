// noinspection JSUnusedGlobalSymbols

import { type FileEditType } from '@/views/nodes/elementPlus/miscellaneous/fileEditor/type.ts'

import { Base64 } from 'js-base64'

import {
  type FileNodeFileDownloadInfo,
  type FileNodeInspectInfo,
  type FileNodeInspectResult,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/fileNode.ts'
import {
  downloadFile as downloadSettingRepoFileNode,
  operateInspect as inspectSettingRepoFileNode,
  upload as updateSettingRepoFileNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/fileNode.ts'
import {
  type FileListNodeFileDownloadInfo,
  type FileListNodeInspectInfo,
  type FileListNodeInspectResult,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/fileListNode.ts'
import {
  downloadFile as downloadSettingRepoFileListNode,
  operateInspect as inspectSettingRepoFileListNode,
  update as updateSettingRepoFileListNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/fileListNode.ts'
import { type AttachmentFileInfo } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/attachmentFile.ts'
import {
  inspect as inspectNoteAttachmentFile,
  download as downloadNoteAttachmentFile,
  update as updateNoteAttachmentFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/attachmentFile.ts'
import { type ItemFileInfo } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemFile.ts'
import {
  inspect as inspectAssetsItemFile,
  download as downloadAssetsItemFile,
  update as updateAssetsItemFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemFile.ts'
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

fileHandlerMap.set('SETTINGREPO_FILE_NODE', {
  async inspectFile(id: string): Promise<InspectFileResult> {
    type DecodedId = {
      category: string
      args: string[]
    }
    const decodedId: DecodedId = JSON.parse(Base64.decode(id))
    const inspectInfo: FileNodeInspectInfo = {
      category: decodedId.category,
      args: decodedId.args,
    }
    const inspectResult: FileNodeInspectResult | null = await resolveResponse(
      inspectSettingRepoFileNode(inspectInfo),
    )
    const downloadInfo: FileNodeFileDownloadInfo = {
      category: decodedId.category,
      args: decodedId.args,
    }
    const blob: Blob | null = await downloadSettingRepoFileNode(downloadInfo)
    return {
      name: inspectResult?.origin_name ?? 'unknown',
      blob: blob ?? new Blob(),
    }
  },
  async updateFile(id: string, blob: Blob, fileName: string): Promise<UpdateFileResult> {
    try {
      type DecodedId = {
        category: string
        args: string[]
      }
      const decodedId: DecodedId = JSON.parse(Base64.decode(id))
      const formData: FormData = new FormData()
      formData.append('category', decodedId.category)
      formData.append('args', JSON.stringify(decodedId.args))
      formData.append('file', blob, fileName)
      await resolveResponse(updateSettingRepoFileNode(formData))
      return { success: true, message: '文件节点文件提交成功' }
    } catch {
      return { success: false, message: '文件节点文件提交失败' }
    }
  },
})

fileHandlerMap.set('SETTINGREPO_FILE_LIST_NODE', {
  async inspectFile(id: string): Promise<InspectFileResult> {
    type DecodedId = {
      category: string
      args: string[]
      index: number
    }
    const decodedId: DecodedId = JSON.parse(Base64.decode(id))
    const inspectInfo: FileListNodeInspectInfo = {
      category: decodedId.category,
      args: decodedId.args,
    }
    const inspectResult: FileListNodeInspectResult | null = await resolveResponse(
      inspectSettingRepoFileListNode(inspectInfo),
    )
    const downloadInfo: FileListNodeFileDownloadInfo = {
      category: decodedId.category,
      args: decodedId.args,
      index: decodedId.index,
    }
    const blob: Blob | null = await downloadSettingRepoFileListNode(downloadInfo)
    return {
      name: inspectResult?.items[decodedId.index]?.origin_name ?? 'unknown',
      blob: blob ?? new Blob(),
    }
  },
  async updateFile(id: string, blob: Blob, fileName: string): Promise<UpdateFileResult> {
    try {
      type DecodedId = {
        category: string
        args: string[]
        index: number
      }
      const decodedId: DecodedId = JSON.parse(Base64.decode(id))
      const formData: FormData = new FormData()
      formData.append('category', decodedId.category)
      formData.append('args', JSON.stringify(decodedId.args))
      formData.append('index', decodedId.index.toString())
      formData.append('file', blob, fileName)
      await resolveResponse(updateSettingRepoFileListNode(formData))
      return { success: true, message: '文件列表节点文件提交成功' }
    } catch {
      return { success: false, message: '文件列表节点文件提交失败' }
    }
  },
})

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

fileHandlerMap.set('ASSETS_ITEM_FILE', {
  async inspectFile(id: string): Promise<InspectFileResult> {
    const itemFileInfo: ItemFileInfo = await resolveResponse(inspectAssetsItemFile({ long_id: id }))
    const blob: Blob = await downloadAssetsItemFile({ long_id: id })
    return {
      name: itemFileInfo.origin_name,
      blob: blob,
    }
  },
  async updateFile(id: string, blob: Blob, fileName: string): Promise<UpdateFileResult> {
    try {
      const formData: FormData = new FormData()
      formData.append('file', blob, fileName)
      await resolveResponse(updateAssetsItemFile({ long_id: id }, formData))
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
