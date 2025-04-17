// noinspection JSUnusedGlobalSymbols

import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'

import type { ExtensionFilter } from './types.ts'

// -----------------------------------------------------------特定扩展名-----------------------------------------------------------
export type UseSpecifiedExtensionFileCreateDialogResult = {
  visible: Ref<boolean>
  filter: ComputedRef<ExtensionFilter>
}

/**
 * 使用特定扩展名的文件创建对话框。
 *
 * 该方法适用于选择单个特定扩展名的文件的场景。
 *
 * 该方法会返回适合用于特定扩展名的 `filter` 属性。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `filter` 表示文件过滤器，适合用于文件创建对话框的 `filter` 属性，
 *
 * @param specifiedExtension 指定的扩展名。
 * @returns 调用方法后的返回结果。
 */
export function useSpecifiedExtensionFileCreateDialog(
  specifiedExtension: string,
): UseSpecifiedExtensionFileCreateDialogResult {
  const _visible = ref<boolean>(false)
  const _filter = computed<ExtensionFilter>(() => {
    return (extension: string) => {
      return specifiedExtension === extension
    }
  })

  return {
    visible: _visible,
    filter: _filter,
  } as UseSpecifiedExtensionFileCreateDialogResult
}

export type UseSpecifiedExtensionsFileCreateDialogResult = {
  visible: Ref<boolean>
  filter: ComputedRef<ExtensionFilter>
}

/**
 * 使用特定扩展名的文件创建对话框。
 *
 * 该方法适用于选择多个特定扩展名的文件的场景。
 *
 * 该方法会返回适合用于特定扩展名的 `filter` 属性。
 *
 * 返回的结果中：
 * - `visible` 表示对话框是否可见，可直接用于对话框的 `visible` 属性，应使用 `v-model` 绑定。
 * - `filter` 表示文件过滤器，适合用于文件创建对话框的 `filter` 属性，
 *
 * @param specifiedExtensions 指定的扩展名组成的数组。
 * @returns 调用方法后的返回结果。
 */
export function useSpecifiedExtensionsFileCreateDialog(
  specifiedExtensions: string[],
): UseSpecifiedExtensionsFileCreateDialogResult {
  const _visible = ref<boolean>(false)
  const _filter = computed<ExtensionFilter>(() => {
    return (extension: string) => {
      return specifiedExtensions.includes(extension)
    }
  })

  return {
    visible: _visible,
    filter: _filter,
  } as UseSpecifiedExtensionsFileCreateDialogResult
}
