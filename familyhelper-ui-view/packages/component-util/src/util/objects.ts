// noinspection JSUnusedGlobalSymbols

/**
 * 获取一个对象的深层属性。
 *
 * 该方法用于获取一个对象的深层属性，支持多层嵌套的属性路径，嵌套的属性路径使用 `.` 分隔。
 *
 * 例如：
 * ```typescript
 * const obj = {
 *   a: {
 *     b: 'foo',
 *   },
 *   c: 'bar',
 * }
 *
 * const result1 = getDeepProperty(obj, 'a.b') // 'foo'
 * const result2 = getDeepProperty(obj, 'a.c') // undefined
 * const result3 = getDeepProperty(obj, 'c') // 'bar'
 * const result4 = getDeepProperty(obj, 'a.b.c', 'default') // 'default'
 * ```
 *
 * @param target 指定的对象。
 * @param propertyPath 属性路径字符串。
 * @param defaultResult 当属性找不到时返回的默认结果。
 * @returns 对象的深层属性，或者是默认结果。
 */
export function getDeepProperty<T, R>(
  target: T,
  propertyPath: string,
  defaultResult: R | undefined = undefined,
): R | undefined {
  const subPropertyList: string[] = propertyPath.split('.')
  // 此处使用 any 不可避免，故屏蔽相关检查。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let subTarget: any = target
  for (let i: number = 0; i < subPropertyList.length; i += 1) {
    const subProperty: string = subPropertyList[i]
    if (Object.prototype.hasOwnProperty.call(subTarget, subProperty)) {
      subTarget = subTarget[subProperty]
    } else {
      return defaultResult
    }
  }
  return subTarget
}
