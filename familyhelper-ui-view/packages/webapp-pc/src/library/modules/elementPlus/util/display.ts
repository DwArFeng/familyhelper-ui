// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type DisplayInfo } from '@/navigation/types.ts'

type DisplayValue = {
  label?: string
}

export function parseLabel(displayInfo: DisplayInfo): string {
  let label
  if ((label = (displayInfo['element-plus'] as DisplayValue).label)) {
    return label
  }
  if ((label = (displayInfo[''] as DisplayValue)?.label)) {
    return label
  }
  return '未知'
}
