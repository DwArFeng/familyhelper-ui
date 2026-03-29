<template>
  <div class="paging-table-panel-container">
    <div class="column-definitions" aria-hidden="true">
      <slot name="default" />
    </div>
    <div class="table-container">
      <table class="native-table" :class="{ stripe, 'layout-fixed': registeredColumns.length > 0 }">
        <colgroup>
          <col
            v-if="selectionColumnVisible"
            class="selection-col"
            :style="{ width: '40px', minWidth: '40px' }"
          />
          <col
            v-for="col in registeredColumns"
            :key="'cg-' + col.id"
            :style="colGroupColStyle(col)"
          />
          <col
            v-if="operateColumnVisible"
            :style="{ width: operateColumnWidth + 'px', minWidth: operateColumnWidth + 'px' }"
          />
        </colgroup>
        <thead>
          <tr>
            <th v-if="selectionColumnVisible" class="selection-cell" scope="col">
              <input
                ref="selectAllCheckboxRef"
                type="checkbox"
                :checked="allPageSelected"
                :aria-label="'全选当前页'"
                @change="onToggleSelectAll"
              />
            </th>
            <th
              v-for="col in registeredColumns"
              :key="'th-' + col.id"
              scope="col"
              :class="['data-th', col.headerClass]"
              :style="dataColumnCellStyle(col)"
            >
              <div class="th-inner">
                <span class="th-label">
                  <paging-table-cell-host :render="() => col.renderHeader()" />
                </span>
                <div
                  v-if="columnResizeEnabled && col.resizable"
                  class="col-resize-handle"
                  @mousedown.prevent.stop="onColResizeMouseDown($event, col.id)"
                />
              </div>
            </th>
            <th
              v-if="operateColumnVisible"
              class="operate-cell"
              scope="col"
              :style="{
                width: operateColumnWidth + 'px',
                minWidth: operateColumnWidth + 'px',
              }"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in items"
            :key="getRowKey(row, index)"
            :class="{ 'is-current': highlightCurrentRow && isCurrentRow(row) }"
            @click="handleRowClick(row)"
          >
            <td v-if="selectionColumnVisible" class="selection-cell" @click.stop>
              <input
                type="checkbox"
                :checked="isRowSelected(row, index)"
                :aria-label="'选择行'"
                @change="onToggleRow(row, index, $event)"
              />
            </td>
            <td
              v-for="col in registeredColumns"
              :key="'td-' + col.id"
              :class="['data-td', col.cellClass]"
              :style="dataColumnCellStyle(col)"
            >
              <paging-table-cell-host :render="() => col.renderCell({ row, index })" />
            </td>
            <td
              v-if="operateColumnVisible"
              class="operate-cell"
              :style="{ width: operateColumnWidth + 'px', minWidth: operateColumnWidth + 'px' }"
              @click.stop
            >
              <slot
                name="operateColumn"
                :row="row as CT"
                :index="index as number"
                :fireItemInspect="() => handleOperateColumnItemInspect(row, index)"
                :fireItemEdit="() => handleOperateColumnItemEdit(row, index)"
                :fireItemDelete="() => handleOperateColumnItemDelete(row, index)"
              >
                <span class="operate-actions">
                  <native-link
                    v-if="inspectButtonVisible"
                    size="small"
                    type="primary"
                    @click="handleOperateColumnItemInspect(row, index)"
                  >
                    查看
                  </native-link>
                  <native-link
                    v-if="editButtonVisible"
                    size="small"
                    type="primary"
                    @click="handleOperateColumnItemEdit(row, index)"
                  >
                    编辑
                  </native-link>
                  <native-link
                    v-if="deleteButtonVisible"
                    size="small"
                    type="danger"
                    @click="handleOperateColumnItemDelete(row, index)"
                  >
                    删除
                  </native-link>
                </span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination" :class="{ compact: paginationStyle === 'COMPACT' }">
      <span class="pagination-total">共 {{ itemCount }} 条</span>
      <label class="pagination-sizes">
        <select
          v-model.number="watchedPageSize"
          class="pagination-select"
          :disabled="(pageSizes?.length ?? 0) === 0"
        >
          <option v-for="s in pageSizes" :key="s" :value="s">{{ s }} 条/页</option>
        </select>
      </label>
      <native-button size="small" class="pagination-nav" :disabled="!canPrev" @click="goPrev">
        上一页
      </native-button>
      <span class="pagination-pager">
        <native-button
          v-for="p in pagerButtons"
          :key="'p-' + p"
          size="small"
          class="pagination-page"
          :kind="p === watchedCurrentPage1Based ? 'primary' : 'default'"
          :plain="p === watchedCurrentPage1Based"
          @click="goPage(p)"
        >
          {{ p }}
        </native-button>
      </span>
      <native-button size="small" class="pagination-nav" :disabled="!canNext" @click="goNext">
        下一页
      </native-button>
      <label class="pagination-jump">
        前往
        <input
          v-model="jumpInput"
          class="pagination-jump-input"
          type="text"
          inputmode="numeric"
          @change="onJumpChange"
          @keyup.enter="onJumpChange"
        />
        页
      </label>
    </div>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, nextTick, onMounted, provide, ref, shallowRef, unref, watch } from 'vue'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'
import PagingTableCellHost from '@/components/comvisual/table/pagingTablePanel/PagingTableCellHost.vue'

import {
  type PagingTableRegisterContext,
  type RegisteredColumn,
} from '@/components/comvisual/table/pagingTablePanel/context.ts'
import { PAGING_TABLE_PANEL_CONTEXT_KEY } from '@/components/comvisual/table/pagingTablePanel/context.ts'

defineOptions({
  name: 'PagingTablePanel',
})

// region Props 定义

type Props = {
  pageSize?: number
  pageSizes?: number[]
  itemCount?: number
  currentPage?: number
  items?: CT[]
  inspectButtonVisible?: boolean
  editButtonVisible?: boolean
  deleteButtonVisible?: boolean
  highlightCurrentRow?: boolean
  operateColumnVisible?: boolean
  operateColumnWidth?: number
  stripe?: boolean
  paginationAdjustStrategy?: 'FORCE_NORMAL' | 'FORCE_COMPACT' | 'AUTO'
  rowKey?: (row: CT, index: number) => string | number
  selectionColumnVisible?: boolean
  selectedKeys?: (string | number)[]
  columnResizeEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 0,
  pageSizes: () => [10, 15, 20, 30, 50],
  itemCount: 0,
  currentPage: 0,
  items: () => [],
  inspectButtonVisible: true,
  editButtonVisible: true,
  deleteButtonVisible: true,
  highlightCurrentRow: false,
  operateColumnVisible: true,
  operateColumnWidth: 107,
  stripe: true,
  paginationAdjustStrategy: 'FORCE_NORMAL',
  rowKey: undefined,
  selectionColumnVisible: false,
  selectedKeys: () => [],
  columnResizeEnabled: true,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:currentPage', currentPage: number): void
  (e: 'update:pageSize', pageSize: number): void
  (e: 'onPagingAttributeChanged'): void
  (e: 'onRowClick', row: CT): void
  (e: 'onItemInspect', item: CT, index: number): void
  (e: 'onItemEdit', item: CT, index: number): void
  (e: 'onItemDelete', item: CT, index: number): void
  (e: 'onCurrentChanged', current: CT | null): void
  (e: 'onSelectionChange', keys: (string | number)[]): void
}

const emit = defineEmits<Emits>()

// endregion

// region Slots 定义

type OperateColumnSlotProps = {
  row: CT
  index: number
  fireItemInspect: () => void
  fireItemEdit: () => void
  fireItemDelete: () => void
}

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operateColumn?: (props: OperateColumnSlotProps) => any
}>()

// endregion

// region 列注册

const registeredColumns = shallowRef<RegisteredColumn<CT>[]>([])
let columnSeq = 0

function registerColumn(meta: Omit<RegisteredColumn<CT>, 'id'>): () => void {
  const id = columnSeq++
  const entry: RegisteredColumn<CT> = {
    ...meta,
    id,
  }
  registeredColumns.value.push(entry)
  return () => {
    const i = registeredColumns.value.findIndex((c) => c.id === id)
    if (i >= 0) {
      registeredColumns.value.splice(i, 1)
    }
  }
}

provide(PAGING_TABLE_PANEL_CONTEXT_KEY, {
  registerColumn: registerColumn as PagingTableRegisterContext<
    Record<string, unknown>
  >['registerColumn'],
})

/** 必须用 unref 追踪嵌套在普通列对象上的 widthPx（Ref），否则拖拽改宽后 colgroup 不刷新 */
function colGroupColStyle(col: RegisteredColumn<CT>): { width: string; minWidth: string } {
  return {
    width: `${unref(col.widthPx)}px`,
    minWidth: `${col.minWidthPx}px`,
  }
}

/** 表头/单元格与 col 使用同一套宽度，避免 table 宽度为 100% 时其它列被按比例挤压 */
function dataColumnCellStyle(col: RegisteredColumn<CT>): Record<string, string> {
  return {
    textAlign: col.align,
    ...colGroupColStyle(col),
  }
}

function onColResizeMouseDown(e: MouseEvent, columnId: number): void {
  e.preventDefault()
  e.stopPropagation()
  const col = registeredColumns.value.find((c) => c.id === columnId)
  if (!col || !props.columnResizeEnabled || !col.resizable) {
    return
  }
  const widthPxRef = col.widthPx
  const startX = e.clientX
  const startW = widthPxRef.value
  const minW = col.minWidthPx

  const prevUserSelect = document.body.style.userSelect
  const prevCursor = document.body.style.cursor
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'

  function onMove(ev: MouseEvent): void {
    ev.preventDefault()
    const delta = ev.clientX - startX
    widthPxRef.value = Math.max(minW, startW + delta)
  }

  function onUp(): void {
    document.body.style.userSelect = prevUserSelect
    document.body.style.cursor = prevCursor
    window.removeEventListener('mousemove', onMove, true)
    window.removeEventListener('mouseup', onUp, true)
  }

  window.addEventListener('mousemove', onMove, { capture: true, passive: false })
  window.addEventListener('mouseup', onUp, { capture: true, passive: true })
}

// endregion

// region 分页逻辑处理

const watchedCurrentPage1Based = ref<number>(props.currentPage + 1)
const watchedPageSize = ref<number>(props.pageSize)
let paginationUpdateCount: number = 0

const jumpInput = ref<string>(String(props.currentPage + 1))

watch(
  () => props.currentPage,
  (value) => {
    watchedCurrentPage1Based.value = value + 1
    jumpInput.value = String(value + 1)
  },
)

watch(
  () => watchedCurrentPage1Based.value,
  (value) => {
    emit('update:currentPage', value - 1)
    const paginationUpdateCountSnapshot: number = ++paginationUpdateCount
    nextTick(() => {
      if (paginationUpdateCountSnapshot === paginationUpdateCount) {
        emit('onPagingAttributeChanged')
      }
    })
  },
)

watch(
  () => props.pageSize,
  (value) => {
    watchedPageSize.value = value
  },
)

watch(
  () => watchedPageSize.value,
  (value) => {
    emit('update:pageSize', value)
    const paginationUpdateCountSnapshot: number = ++paginationUpdateCount
    nextTick(() => {
      if (paginationUpdateCountSnapshot === paginationUpdateCount) {
        emit('onPagingAttributeChanged')
      }
    })
  },
)

onMounted(() => {
  watchedCurrentPage1Based.value = props.currentPage + 1
  watchedPageSize.value = props.pageSize
  jumpInput.value = String(watchedCurrentPage1Based.value)
})

// endregion

// region 分页样式处理

const paginationStyle = computed(() => {
  if (props.paginationAdjustStrategy === 'FORCE_NORMAL') {
    return 'NORMAL'
  }
  if (props.paginationAdjustStrategy === 'FORCE_COMPACT') {
    return 'COMPACT'
  }
  const totalPages = Math.ceil(props.itemCount / props.pageSize) || 1
  return totalPages >= 7 ? 'COMPACT' : 'NORMAL'
})

const paginationPagerCount = computed(() => {
  if (paginationStyle.value === 'COMPACT') {
    return 5
  }
  return 7
})

const totalPages = computed(() => {
  if (props.pageSize <= 0) {
    return 1
  }
  const t = Math.ceil(props.itemCount / props.pageSize)
  return t > 0 ? t : 1
})

const canPrev = computed(() => watchedCurrentPage1Based.value > 1)

const canNext = computed(() => watchedCurrentPage1Based.value < totalPages.value)

const pagerButtons = computed((): number[] => {
  const total = totalPages.value
  const current = watchedCurrentPage1Based.value
  const count = paginationPagerCount.value
  if (total <= count) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  let start = Math.max(1, current - Math.floor(count / 2))
  let end = start + count - 1
  if (end > total) {
    end = total
    start = Math.max(1, end - count + 1)
  }
  const out: number[] = []
  for (let p = start; p <= end; p += 1) {
    out.push(p)
  }
  return out
})

// endregion

// region 选择/选区处理

const currentRow = ref<CT | null>(null)

watch(
  () => props.items,
  (list) => {
    if (!props.highlightCurrentRow) {
      return
    }
    if (currentRow.value && !list.includes(currentRow.value)) {
      currentRow.value = null
      emit('onCurrentChanged', null)
    }
  },
)

function handleRowClick(row: CT): void {
  emit('onRowClick', row)
  if (props.highlightCurrentRow) {
    currentRow.value = row
    emit('onCurrentChanged', row)
  }
}

function isCurrentRow(row: CT): boolean {
  return props.highlightCurrentRow && currentRow.value === row
}

function getRowKey(row: CT, index: number): string | number {
  if (props.rowKey) {
    return props.rowKey(row, index)
  }
  return index
}

function rowKeyOf(row: CT, index: number): string | number {
  return getRowKey(row, index)
}

function isRowSelected(row: CT, index: number): boolean {
  const k = rowKeyOf(row, index)
  return props.selectedKeys.includes(k)
}

const allPageSelected = computed(() => {
  if (!props.selectionColumnVisible || props.items.length === 0) {
    return false
  }
  return props.items.every((row, i) => props.selectedKeys.includes(rowKeyOf(row, i)))
})

const pageIndeterminate = computed(() => {
  if (!props.selectionColumnVisible || props.items.length === 0) {
    return false
  }
  const n = props.items.filter((row, i) => props.selectedKeys.includes(rowKeyOf(row, i))).length
  return n > 0 && n < props.items.length
})

const selectAllCheckboxRef = ref<HTMLInputElement | null>(null)

watch(
  [allPageSelected, pageIndeterminate, () => props.selectionColumnVisible, () => props.items],
  () => {
    nextTick(() => {
      const el = selectAllCheckboxRef.value
      if (!el) {
        return
      }
      el.indeterminate = pageIndeterminate.value && !allPageSelected.value
    })
  },
)

function emitSelectedKeys(keys: (string | number)[]): void {
  emit('onSelectionChange', keys)
}

function onToggleSelectAll(ev: Event): void {
  const checked = (ev.target as HTMLInputElement).checked
  const pageKeys = props.items.map((row, i) => rowKeyOf(row, i))
  let next = [...props.selectedKeys]
  if (checked) {
    const set = new Set(next)
    pageKeys.forEach((k) => set.add(k))
    next = [...set]
  } else {
    const drop = new Set(pageKeys)
    next = next.filter((k) => !drop.has(k))
  }
  emitSelectedKeys(next)
}

function onToggleRow(row: CT, index: number, ev: Event): void {
  const checked = (ev.target as HTMLInputElement).checked
  const k = rowKeyOf(row, index)
  let next = [...props.selectedKeys]
  if (checked) {
    if (!next.includes(k)) {
      next.push(k)
    }
  } else {
    next = next.filter((x) => x !== k)
  }
  emitSelectedKeys(next)
}

// endregion

// region 操作列处理

function handleOperateColumnItemInspect(item: CT, index: number): void {
  emit('onItemInspect', item, index)
}

function handleOperateColumnItemEdit(item: CT, index: number): void {
  emit('onItemEdit', item, index)
}

function handleOperateColumnItemDelete(item: CT, index: number): void {
  emit('onItemDelete', item, index)
}

// endregion

// region 分页导航处理

function goPrev(): void {
  if (!canPrev.value) {
    return
  }
  watchedCurrentPage1Based.value -= 1
  jumpInput.value = String(watchedCurrentPage1Based.value)
}

function goNext(): void {
  if (!canNext.value) {
    return
  }
  watchedCurrentPage1Based.value += 1
  jumpInput.value = String(watchedCurrentPage1Based.value)
}

function goPage(p: number): void {
  if (p < 1 || p > totalPages.value) {
    return
  }
  watchedCurrentPage1Based.value = p
  jumpInput.value = String(p)
}

function onJumpChange(): void {
  const n = parseInt(jumpInput.value.trim(), 10)
  if (Number.isNaN(n) || n < 1) {
    jumpInput.value = String(watchedCurrentPage1Based.value)
    return
  }
  const max = totalPages.value
  const clamped = Math.min(max, Math.max(1, n))
  watchedCurrentPage1Based.value = clamped
  jumpInput.value = String(clamped)
}

// endregion
</script>

<style scoped>
.paging-table-panel-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.column-definitions {
  display: none;
}

.table-container {
  width: 100%;
  min-width: 0;
  height: 0;
  flex-grow: 1;
  overflow: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #ffffff;
}

.native-table {
  border-collapse: collapse;
  font-size: 14px;
  color: #606266;
}

/* 无列定义时仍铺满容器 */
.native-table:not(.layout-fixed) {
  width: 100%;
}

/*
 * 有列子组件时：表格宽度 = 各列宽度之和（max-content），不强制等于容器宽度，
 * 避免调整一列时其它列被重新分配；总宽超过容器时由 .table-container 横向滚动。
 */
.native-table.layout-fixed {
  table-layout: fixed;
  width: max-content;
  max-width: none;
}

.native-table :deep(th),
.native-table :deep(td) {
  border: 1px solid #ebeef5;
  padding: 8px 10px;
  text-align: left;
  vertical-align: middle;
}

.native-table :deep(thead th) {
  background: #fafafa;
  font-weight: 500;
  color: #303133;
}

/*
 * fixed 布局下列宽可小于内容“自然宽度”：必须打破 td/th 默认 min-width:auto（否则长串会撑住整列）。
 * 正文列允许在列内换行；表头单行省略。
 */
.native-table.layout-fixed :deep(th.data-th),
.native-table.layout-fixed :deep(td.data-td) {
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.native-table.layout-fixed :deep(td.data-td) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* 纯文本单元格：块级占满列宽，避免行内文本按“整段”撑开列 */
/*noinspection CssUnusedSymbol*/
.native-table.layout-fixed :deep(.paging-table-cell-plain) {
  display: block;
  width: 100%;
  min-width: 0;
}

.data-th {
  position: relative;
  padding: 0 !important;
  vertical-align: middle;
}

.th-inner {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 40px;
  min-width: 0;
}

.th-label {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-resize-handle {
  flex: 0 0 8px;
  margin-right: -2px;
  cursor: col-resize;
  align-self: stretch;
  touch-action: none;
  background: transparent;
  position: relative;
  z-index: 2;
}

.col-resize-handle:hover {
  background: rgba(64, 158, 255, 0.25);
}

.selection-cell {
  width: 40px;
  text-align: center;
  vertical-align: middle;
}

.native-table.stripe :deep(tbody tr:nth-child(even)) {
  background: #fafafa;
}

.native-table :deep(tbody tr.is-current) {
  background: #ecf5ff;
}

.operate-cell {
  text-align: center;
  white-space: nowrap;
}

.operate-actions {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 10px;
  margin-top: 6px;
  font-size: 13px;
  color: #606266;
}

.pagination.compact {
  gap: 4px 6px;
}

.pagination-total {
  margin-right: 4px;
}

.pagination-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
}

.pagination-pager {
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pagination-jump {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pagination-jump-input {
  width: 48px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
}

/*noinspection CssUnusedSymbol*/
.pagination :deep(button.pagination-nav.native-btn),
.pagination :deep(button.pagination-page.native-btn) {
  height: 28px;
  min-height: 28px;
  box-sizing: border-box;
  padding: 0 8px;
  line-height: 1;
}

/*noinspection CssUnusedSymbol*/
.pagination :deep(button.pagination-page.native-btn) {
  min-width: 28px;
  padding-left: 6px;
  padding-right: 6px;
}
</style>
