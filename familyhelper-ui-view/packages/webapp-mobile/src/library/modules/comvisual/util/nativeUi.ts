// noinspection JSUnusedGlobalSymbols,DuplicatedCode

/**
 * 使用浏览器原生对话框展示操作成功类提示。
 *
 * 适用于仅需原生能力时的轻量成功反馈，
 * 实现为 {@link window.alert}，会阻塞当前窗口直至用户关闭。
 *
 * @param message - 展示给用户的说明文案
 */
export function notifySuccess(message: string): void {
  window.alert(message)
}

/**
 * 使用浏览器原生对话框展示需要注意但不一定是错误的情况。
 *
 * 与 {@link notifySuccess} 相同，底层为 {@link window.alert}；
 * 语义上用于警告、校验不通过等，便于调用方区分用途。
 *
 * @param message - 警告或注意事项的说明文案
 */
export function notifyWarning(message: string): void {
  window.alert(message)
}

/**
 * 使用浏览器原生对话框展示一般性说明或中性信息。
 *
 * 文案前会加上「提示：」前缀，便于与纯成功/错误提示在视觉上区分。
 *
 * @param message - 信息说明正文（不含前缀，前缀由本函数追加）
 */
export function notifyInfo(message: string): void {
  window.alert(`提示：${message}`)
}

/**
 * 使用浏览器原生对话框展示错误、失败或异常相关说明。
 *
 * 文案前会加上「错误：」前缀，便于用户快速识别为问题类提示。
 *
 * @param message - 错误说明正文（不含前缀，前缀由本函数追加）
 */
export function notifyError(message: string): void {
  window.alert(`错误：${message}`)
}

/**
 * 弹出原生确认框，由用户选择是否继续当前操作。
 *
 * 用于删除、不可逆修改等需二次确认的场景，以同步方式取得用户选择。
 * 对话框会阻塞脚本直至用户点击按钮或关闭。
 *
 * @param message - 向用户展示的确认问题或说明（例如「确定要删除吗？」）
 * @returns 用户点击「确定」时为 true；点击「取消」或关闭对话框时为 false
 */
export function confirmAction(message: string): boolean {
  return window.confirm(message)
}

/**
 * 弹出原生输入框，允许用户输入一行文本。
 *
 * 适用于需要临时向用户索取简短字符串、且无表单组件时的兜底方案。
 *
 * @param message - 输入框上方的提示语
 * @param defaultValue - 输入框中的初始内容；默认为空字符串
 * @returns 用户确认后输入的字符串；用户取消或关闭对话框时为 null
 */
export function promptText(message: string, defaultValue = ''): string | null {
  return window.prompt(message, defaultValue)
}
