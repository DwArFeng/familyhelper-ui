// noinspection JSUnusedGlobalSymbols

/**
 * 获取当前的时间戳。
 *
 * @returns 当前的时间戳。
 */
export function currentTimestamp(): number {
  return new Date().getTime()
}

/**
 * 将时间戳格式化为 yyyy-mm-dd hh:mm:ss 的形式。
 *
 * @param timestamp 时间戳。
 * @returns 格式化后的时间戳。
 */
export function formatTimestamp(timestamp: number): string {
  // 时间戳为10位需*1000，时间戳为13位的话不需乘1000 var date = new Date(timestamp*1000);
  // noinspection DuplicatedCode
  const date = new Date(timestamp)
  const YY = `${date.getFullYear()}-`
  const MM = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`
  const DD = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  const hh = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`
  const mm = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:`
  const ss = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
  return `${YY + MM + DD} ${hh}${mm}${ss}`
}

/**
 * 将时间戳格式化为 yyyy-mm-dd 的形式。
 *
 * @param timestamp 时间戳。
 * @returns 格式化后的时间戳。
 */
export function formatShortTimestamp(timestamp: number): string {
  // 时间戳为10位需*1000，时间戳为13位的话不需乘1000 var date = new Date(timestamp*1000);
  // noinspection DuplicatedCode
  const date = new Date(timestamp)
  const YY = `${date.getFullYear()}-`
  const MM = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`
  const DD = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  return `${YY + MM + DD}`
}

/**
 * 将持续时间格式化为易读的形式。
 *
 * @param duration 持续时间，单位毫秒。
 * @returns 格式化后的持续时间。
 */
export function formatDuration(duration: number): string {
  if (duration < 1000) {
    return `${duration}毫秒`
  }
  if (duration < 60 * 1000) {
    return `${(duration / 1000).toFixed(0)}秒`
  }
  if (duration < 3600 * 1000) {
    return `${(duration / 60 / 1000).toFixed(0)}分钟`
  }
  if (duration < 24 * 3600 * 1000) {
    return `${(duration / 3600 / 1000).toFixed(0)}小时`
  }
  return `${(duration / 24 / 3600 / 1000).toFixed(0)}天`
}
