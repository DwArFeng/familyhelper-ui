/**
 * 输出带有前导0的数字。
 * @param number 指定的数字。
 * @param size 前导0与数字加起来的位数。
 */
// eslint-disable-next-line import/prefer-default-export
export function pad(number, size) {
  let s = String(number);
  while (s.length < (size || 2)) {
    s = `0${s}`;
  }
  return s;
}
