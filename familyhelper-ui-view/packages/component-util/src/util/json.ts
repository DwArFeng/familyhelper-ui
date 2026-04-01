// noinspection JSUnusedGlobalSymbols

/**
 * 与合法 JSON 文本经 {@link JSON.parse} 解析后得到的运行时结构相对应的类型。
 *
 * 包含：
 * - 标量：`string`、`number`、`boolean`、`null`
 * - 数组：元素类型仍为 `JsonValue`，可任意嵌套
 * - 对象：键为字符串，值为 `JsonValue`，可任意嵌套
 *
 * 不包含 JSON 规范以外的值（例如 `undefined`、`bigint`、`symbol`）。
 *
 * @see https://www.json.org/json-zh.html JSON 数据格式说明
 */
export type JsonObject =
  | string
  | number
  | boolean
  | null
  | JsonObject[]
  | { [key: string]: JsonObject }
