// noinspection JSUnusedGlobalSymbols

import type { Extension } from '@/components/file/fileCreateDialog/types.ts'

export type Indicator = {
  icon: string
  label: string
  description: string
  extension: Extension
  permission?: PermissionSetting
}

export type PermissionSetting = {
  required: boolean
  node?: string
}

const indicators: Indicator[] = []

indicators.push({
  icon: '\uffe2',
  label: '富文本',
  description: '包含文本，图片等多媒体的富文本文件',
  extension: '.rtf',
  permission: {
    required: true,
    node: 'action.file_create.rtf',
  },
})
indicators.push({
  icon: '\uffe1',
  label: '纯文本',
  description: '纯文本文件，节约空间',
  extension: '.txt',
  permission: {
    required: true,
    node: 'action.file_create.txt',
  },
})

export { indicators }
