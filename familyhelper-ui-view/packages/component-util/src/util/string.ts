// noinspection JSUnusedGlobalSymbols

/**
 * 将字符串转换为 kebab case。
 *
 * @param str 字符串。
 * @return kebab case 字符串。
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Insert hyphen between lowercase and uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Insert hyphen between consecutive uppercase letters followed by a lowercase letter
    .toLowerCase() // Convert the entire string to lowercase
}
