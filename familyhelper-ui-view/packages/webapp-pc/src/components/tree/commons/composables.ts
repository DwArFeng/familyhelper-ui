// noinspection JSUnusedGlobalSymbols

import type { Ref } from 'vue'
import { ref } from 'vue'

import type { TreeNode } from '@/components/tree/commons/types.ts'

// -----------------------------------------------------------树选区-----------------------------------------------------------
type UseTreeSelectionResult<CT> = {
  item: Ref<CT | null>
  node: Ref<TreeNode<CT> | null>
}

/**
 * 使用树选区。
 *
 * 该方法适用于使用树选区的场景，可使用该方法快速获取标准的树的选区的结构。
 *
 * 返回的结果中：
 * - `item` 表示当前选中的数据项，可以作为树的选区标准数据项使用。
 * - `node` 表示当前选中的节点，可以作为树的选区标准节点使用。
 *
 * @template CT component bean 类型。
 * @returns 调用方法后的返回结果。
 */
export function useTreeSelection<CT>(): UseTreeSelectionResult<CT> {
  const _item = ref<CT | null>(null)
  const _node = ref<TreeNode<CT> | null>(null)

  return {
    item: _item,
    node: _node,
  } as UseTreeSelectionResult<CT>
}
