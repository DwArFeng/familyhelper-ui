// noinspection JSUnusedGlobalSymbols,DuplicatedCode

export type Indicator = 'PDF' | 'JPG' | 'JPEG' | 'PNG' | 'GIF' | 'RTF' | 'TXT'

export type IconInfo = {
  readonly type: string
  readonly content: string
}

export type DisplayInfo = {
  readonly indicator: Indicator
  readonly icon: IconInfo
}

export type CreatePermissionInfo = {
  readonly required: boolean
  readonly node?: string
}

export type CreateInfo = {
  readonly indicator: Indicator
  readonly icon: IconInfo
  readonly label: string
  readonly description: string
  readonly extension: string
  readonly permission?: CreatePermissionInfo
}

export type EditInfo = {
  readonly indicator: Indicator
  readonly actionLevel: 'INSPECT' | 'EDIT'
  readonly subEditor: string
}

/**
 * 文件显示信息列表。
 *
 * 如需扩展应用支持的文件类型，请在此处添加相应信息即可。
 */
const displayInfos: DisplayInfo[] = [
  { indicator: 'PDF', icon: { type: 'iconfont', content: '\uffe3' } },
  { indicator: 'JPG', icon: { type: 'iconfont', content: '\uffe3' } },
  { indicator: 'JPEG', icon: { type: 'iconfont', content: '\uffe3' } },
  { indicator: 'PNG', icon: { type: 'iconfont', content: '\uffe3' } },
  { indicator: 'GIF', icon: { type: 'iconfont', content: '\uffe3' } },
  { indicator: 'RTF', icon: { type: 'iconfont', content: '\uffe4' } },
  { indicator: 'TXT', icon: { type: 'iconfont', content: '\uffe4' } },
]

/**
 * 文件创建信息列表。
 *
 * 如需扩展应用支持的文件类型，请在此处添加相应信息即可。
 */
const createInfos: CreateInfo[] = [
  {
    indicator: 'RTF',
    icon: { type: 'iconfont', content: '\uffe2' },
    label: '富文本',
    description: '包含文本，图片等多媒体的富文本文件',
    extension: '.rtf',
    permission: {
      required: true,
      node: 'action.file_create.rtf',
    },
  },
  {
    indicator: 'TXT',
    icon: { type: 'iconfont', content: '\uffe1' },
    label: '纯文本',
    description: '纯文本文件，节约空间',
    extension: '.txt',
    permission: {
      required: true,
      node: 'action.file_create.txt',
    },
  },
]

/**
 * 文件编辑信息列表。
 *
 * 如需扩展应用支持的文件类型，请在此处添加相应信息即可。
 */
const editInfos: EditInfo[] = [
  { indicator: 'PDF', actionLevel: 'INSPECT', subEditor: 'PDF' },
  { indicator: 'JPG', actionLevel: 'INSPECT', subEditor: 'PHOTO' },
  { indicator: 'JPEG', actionLevel: 'INSPECT', subEditor: 'PHOTO' },
  { indicator: 'PNG', actionLevel: 'INSPECT', subEditor: 'PHOTO' },
  { indicator: 'GIF', actionLevel: 'INSPECT', subEditor: 'PHOTO' },
  { indicator: 'RTF', actionLevel: 'EDIT', subEditor: 'RTF' },
  { indicator: 'TXT', actionLevel: 'EDIT', subEditor: 'TXT' },
]

const createInfosMap: Map<string, CreateInfo> = new Map<string, CreateInfo>()

createInfos.forEach((info) => {
  createInfosMap.set(info.indicator, info)
})

const editInfosMap: Map<string, EditInfo> = new Map<string, EditInfo>()

editInfos.forEach((info) => {
  editInfosMap.set(info.indicator, info)
})

const displayInfosMap: Map<string, DisplayInfo> = new Map<string, DisplayInfo>()

displayInfos.forEach((info) => {
  displayInfosMap.set(info.indicator, info)
})

/**
 * 获取所有文件显示信息。
 *
 * @returns 文件显示信息列表。
 */
function getDisplayInfos(): readonly DisplayInfo[] {
  return displayInfos
}

/**
 * 根据文件标识符获取文件显示信息。
 *
 * @param indicator 文件标识符。
 * @returns 对应的文件显示信息，如果未找到则返回 null。
 */
function getDisplayInfo(indicator: unknown): DisplayInfo | null {
  if (typeof indicator !== 'string') {
    return null
  }
  return displayInfosMap.get(indicator) ?? null
}

/**
 * 获取所有文件创建信息。
 *
 * @returns 文件创建信息列表。
 */
function getCreateInfos(): readonly CreateInfo[] {
  return createInfos
}

/**
 * 根据文件标识符获取文件创建信息。
 *
 * @param indicator 文件标识符。
 * @returns 对应的文件创建信息，如果未找到则返回 null。
 */
function getCreateInfo(indicator: unknown): CreateInfo | null {
  if (typeof indicator !== 'string') {
    return null
  }
  return createInfosMap.get(indicator) ?? null
}

/**
 * 获取所有文件编辑信息。
 *
 * @returns 文件编辑信息列表。
 */
function getEditInfos(): readonly EditInfo[] {
  return editInfos
}

/**
 * 根据文件标识符获取文件编辑信息。
 *
 * @param indicator 文件标识符。
 * @returns 对应的文件编辑信息，如果未找到则返回 null。
 */
function getEditInfo(indicator: unknown): EditInfo | null {
  if (typeof indicator !== 'string') {
    return null
  }
  return editInfosMap.get(indicator) ?? null
}

export { getDisplayInfos, getDisplayInfo, getCreateInfos, getCreateInfo, getEditInfos, getEditInfo }
