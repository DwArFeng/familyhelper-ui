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

/**
 * 将字符串转换为 snake case。
 *
 * 该方法将 camelCase、连续大写字母以及短横线连接的单词统一转换为以下划线分隔的小写形式。
 * 连续的分隔字符会被合并，字符串首尾的空白和分隔字符会被移除。
 *
 * @param str 字符串。
 * @returns snake case 字符串。
 */
export function toSnakeCase(str: string): string {
  return (
    str
      // Trim leading and trailing whitespace
      .trim()
      // Replace existing separators with underscores
      .replace(/[\s-]+/g, '_')
      // Insert an underscore between lowercase and uppercase letters
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      // Insert an underscore between consecutive uppercase letters and the following word
      .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
      // Merge consecutive underscores
      .replace(/_+/g, '_')
      // Remove leading and trailing underscores and convert to lowercase
      .replace(/^_|_$/g, '')
      .toLowerCase()
  )
}
