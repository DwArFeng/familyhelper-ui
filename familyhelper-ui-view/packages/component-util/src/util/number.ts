// noinspection JSUnusedGlobalSymbols

/**
 * 输出带有前导0的数字。
 * @param number 指定的数字。
 * @param size 前导0与数字加起来的位数。
 */
export function pad(number: number, size: number): string {
  let s = String(number)
  while (s.length < (size || 2)) {
    s = `0${s}`
  }
  return s
}

export type DataSizePreset = {
  label: string
  stair: number
}[]

const dataSizePreset: DataSizePreset = [
  { label: 'B', stair: 1 },
  { label: 'KB', stair: 1024 },
  { label: 'MB', stair: 1024 },
  { label: 'GB', stair: 1024 },
  { label: 'TB', stair: 1024 },
]
export { dataSizePreset }

export function formatUnit(number: number, preset: DataSizePreset, toFixed: number = 2): string {
  let lastValidValue: number = NaN
  let lastValidLabel: string = ''
  for (let i = 0; i < preset.length; i += 1) {
    const { label, stair } = preset[i]
    // 由于循环的逻辑，执行到此处 lastValidValue 变量一定会被初始化。
    const value: number = i === 0 ? number / stair : lastValidValue / stair
    if (value < 1) {
      if (i === 0) {
        return `${value.toFixed(toFixed)} ${label}`
      }
      return `${lastValidValue.toFixed(toFixed)} ${lastValidLabel}`
    }
    lastValidValue = value
    lastValidLabel = label
  }
  return `${lastValidValue.toFixed(toFixed)} ${lastValidLabel}`
}
