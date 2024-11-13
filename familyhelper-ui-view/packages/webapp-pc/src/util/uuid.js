/**
 * 生成 uuid。
 *
 * @returns {string} uuid。
 */
/* uuid 算法中需要使用位运算，故禁用 eslint 相关的检查。 */
/* eslint-disable no-bitwise */
const uuid = () => {
  const s = [];
  let anchorIndex;
  // noinspection SpellCheckingInspection
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i += 1) {
    anchorIndex = Math.floor(Math.random() * 0x10);
    s[i] = hexDigits.substring(anchorIndex, anchorIndex + 1);
  }
  // bits 12-15 of the time_hi_and_version field to 0010
  s[14] = '4';
  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  anchorIndex = (s[19] & 0x3) | 0x8;
  s[19] = hexDigits.substring(anchorIndex, anchorIndex + 1);
  s[8] = '-';
  s[13] = '-';
  s[18] = '-';
  s[23] = '-';

  return s.join('');
};

export default uuid;
