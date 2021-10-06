// noinspection DuplicatedCode

/**
 * 获取当前的时间戳。
 */
export function currentTimestamp() {
  return new Date().getTime();
}

/**
 * 将时间戳格式化为 yyyy-mm-dd hh:mm:ss 的形式。
 * @param timestamp 时间戳。
 */
export function formatTimestamp(timestamp) {
  // 时间戳为10位需*1000，时间戳为13位的话不需乘1000 var date = new Date(timestamp*1000);
  const date = new Date(timestamp);
  const YY = `${date.getFullYear()}-`;
  const MM = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
  const DD = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate());
  const hh = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`;
  const mm = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:`;
  const ss = (date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds());
  return `${YY + MM + DD} ${hh}${mm}${ss}`;
}

/**
 * 将时间戳格式化为 yyyy-mm-dd 的形式。
 * @param timestamp 时间戳。
 */
export function formatShortTimestamp(timestamp) {
  // 时间戳为10位需*1000，时间戳为13位的话不需乘1000 var date = new Date(timestamp*1000);
  const date = new Date(timestamp);
  const YY = `${date.getFullYear()}-`;
  const MM = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
  const DD = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate());
  return `${YY + MM + DD}`;
}
