<template>
  <span class="paging-table-column-host" aria-hidden="true" />
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { inject, onBeforeUnmount, ref, useSlots, watch, type VNode } from 'vue'

import { type PagingTableRegisterContext } from './context.ts'
import { PAGING_TABLE_PANEL_CONTEXT_KEY } from './context.ts'
import { getProp, parseSizePx } from './utils.ts'

defineOptions({
  name: 'PagingTableColumn',
})

// region Props 定义

type Props = {
  label: string
  prop?: string
  width?: number | string
  minWidth?: number | string
  resizable?: boolean
  align?: 'left' | 'center' | 'right'
  headerClass?: string
  cellClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  resizable: true,
  align: 'left',
})

// endregion

// region Slots 定义

const slots = useSlots()

type DefaultSlotProps = {
  row: CT
  column: string
  index: number
}

defineSlots<{
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: DefaultSlotProps) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  header?: (props: {}) => any
}>()

// endregion

// region 注入与校验

const ctx = inject(PAGING_TABLE_PANEL_CONTEXT_KEY, null) as PagingTableRegisterContext<CT> | null

if (ctx === null) {
  throw new Error('PagingTableColumn must be used inside PagingTablePanel')
}

// endregion

// region 列宽

const widthPx = ref(parseSizePx(props.width) ?? parseSizePx(props.minWidth) ?? 120)

// endregion

// region 渲染（表头 / 单元格）

function renderHeader(): string | VNode[] {
  if (slots.header) {
    return slots.header({})
  }
  return props.label
}

function renderCell(scope: { row: CT; index: number }): string | VNode[] {
  if (slots.default) {
    return slots.default({
      row: scope.row,
      index: scope.index,
      column: props.label,
    })
  }
  if (props.prop) {
    const v = getProp(scope.row, props.prop)
    return v === undefined || v === null ? '' : String(v)
  }
  return ''
}

// endregion

// region 注册与生命周期

let unregister: (() => void) | null = null

watch(
  () => ({
    width: props.width,
    minWidth: props.minWidth,
    align: props.align,
    resizable: props.resizable,
    headerClass: props.headerClass,
    cellClass: props.cellClass,
    prop: props.prop,
    label: props.label,
  }),
  (next, prev) => {
    if (prev !== undefined) {
      if (next.width !== prev.width || next.minWidth !== prev.minWidth) {
        widthPx.value = parseSizePx(props.width) ?? parseSizePx(props.minWidth) ?? 120
      }
    }
    unregister?.()
    unregister = ctx.registerColumn({
      label: props.label,
      prop: props.prop,
      widthPx,
      minWidthPx: parseSizePx(props.minWidth) ?? 48,
      resizable: props.resizable,
      align: props.align,
      headerClass: props.headerClass,
      cellClass: props.cellClass,
      renderHeader,
      renderCell,
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unregister?.()
})

// endregion
</script>

<style scoped>
.paging-table-column-host {
  display: none;
}
</style>
