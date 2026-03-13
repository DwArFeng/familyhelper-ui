// noinspection JSUnusedGlobalSymbols

import { type ComputedRef, type Ref } from 'vue'
import { computed, ref } from 'vue'

import { type FileTester } from './types.ts'

// -----------------------------------------------------------图片-----------------------------------------------------------
export type UseImageFileSelectorResult = {
  tester: Ref<FileTester>
  accept: ComputedRef<string>
}

/**
 * 使用图片选择器。
 *
 * 该方法适用于选择图片的场景。
 *
 * 该方法会返回适合用于图片选择器的 `tester` 和 `accept` 属性。
 *
 * 返回的结果中：
 * - `tester` 表示文件测试器，适合用于图片选择器的 `tester` 属性，
 * 该测试器会检查文件的扩展名是否为图片，可直接用于图片选择器的 `tester` 属性。
 * - `accept` 表示接受的文件类型，适合用于图片选择器的 `accept` 属性，
 * 该属性会返回一个字符串，表示接受的文件类型，这些类型为常见的图片类型，
 * 可直接用于图片选择器的 `accept` 属性。
 *
 * @returns 调用方法后的返回结果。
 */
export function useImageFileSelector(): UseImageFileSelectorResult {
  const tester = ref<FileTester>((file: File) => {
    if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(file.name)) {
      return { passed: false, message: '图片类型要求：jpeg、jpg、png' }
    }
    return true
  })

  const accept = computed(() => 'image/jpeg, image/png')

  return {
    tester,
    accept,
  } as UseImageFileSelectorResult
}
