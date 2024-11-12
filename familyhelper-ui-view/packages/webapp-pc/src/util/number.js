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

const dataSizePreset = [
  { label: 'B', stair: 1 },
  { label: 'KB', stair: 1024 },
  { label: 'MB', stair: 1024 },
  { label: 'GB', stair: 1024 },
  { label: 'TB', stair: 1024 },
];
export { dataSizePreset };

export function formatUnit(number, preset, toFixed = 2) {
  let lastValidValue;
  let lastValidLabel;
  for (let i = 0; i < preset.length; i += 1) {
    const { label, stair } = preset[i];
    // 由于循环的逻辑，执行到此处 lastValidValue 变量一定会被初始化。
    // noinspection JSUnusedAssignment
    const value = i === 0 ? number / stair : lastValidValue / stair;
    if (value < 1) {
      if (i === 0) {
        return `${value.toFixed(toFixed)} ${label}`;
      }
      return `${lastValidValue.toFixed(toFixed)} ${lastValidLabel}`;
    }
    lastValidValue = value;
    lastValidLabel = label;
  }
  return `${lastValidValue.toFixed(toFixed)} ${lastValidLabel}`;
}
