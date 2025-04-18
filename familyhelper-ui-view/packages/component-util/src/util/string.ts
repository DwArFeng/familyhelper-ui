// noinspection JSUnusedGlobalSymbols

/**
 * 将字符串转换为 kebab case。
 *
 * @param str 字符串。
 * @returns kebab case 字符串。
 */
export function toKebabCase(str: string): string {
  return (
    str
      // Insert hyphen between lowercase and uppercase letters
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // Insert hyphen between consecutive uppercase letters followed by a lowercase letter
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      // Convert the entire string to lowercase
      .toLowerCase()
  )
}
