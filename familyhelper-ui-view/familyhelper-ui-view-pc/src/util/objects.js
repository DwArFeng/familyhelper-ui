/**
 * 获取一个对象的深层属性。
 * 不同层级的属性使用 . 进行分隔。
 *
 * @param target 指定的目标。
 * @param property 深层属性字符串。
 * @param defaultResult 当属性找不到时返回的默认结果。
 * @returns 对象的深层属性，或者是默认结果。
 */
export default function getDeepProperty(target, property, defaultResult) {
  const subPropertyList = property.split('.');
  let subTarget = target;
  for (let i = 0; i < subPropertyList.length; i += 1) {
    const subProperty = subPropertyList[i];
    if (Object.prototype.hasOwnProperty.call(subTarget, subProperty)) {
      subTarget = subTarget[subProperty];
    } else {
      return defaultResult;
    }
  }
  return subTarget;
}
