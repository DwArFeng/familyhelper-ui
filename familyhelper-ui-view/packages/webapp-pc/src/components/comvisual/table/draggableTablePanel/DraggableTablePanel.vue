<template>
  <div class="draggable-table-panel-container">
    <div class="column-definitions" aria-hidden="true">
      <slot name="default" />
    </div>
    <div class="table-container">
      <table
        class="native-table"
        :class="{ stripe, 'layout-fixed': registeredColumns.length > 0 }"
        :style="tableStyle"
      >
        <colgroup>
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
        <tbody ref="tbodyRef">
          <tr
            v-for="(row, index) in items"
            :key="getRowKey(row, index)"
            :class="{ 'is-current': highlightCurrentRow && isCurrentRow(row) }"
            @click="handleRowClick(row)"
          >
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
                    type="success"
                    @click="handleOperateColumnItemInspect(row, index)"
                  >
                    查看
                  </native-link>
                  <native-link
                    v-if="editButtonVisible"
                    type="primary"
                    @click="handleOperateColumnItemEdit(row, index)"
                  >
                    编辑
                  </native-link>
                  <native-link
                    v-if="deleteButtonVisible"
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
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, nextTick, onBeforeUnmount, provide, ref, shallowRef, unref, watch } from 'vue'

import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'
import PagingTableCellHost from '@/components/comvisual/table/pagingTablePanel/PagingTableCellHost.vue'

import Sortable, { type SortableEvent } from 'sortablejs'

import {
  DRAGGABLE_TABLE_PANEL_CONTEXT_KEY,
  type DraggableTableRegisterContext,
  type RegisteredColumn,
} from '@/components/comvisual/table/draggableTablePanel/context.ts'

defineOptions({
  name: 'DraggableTablePanel',
})

// region Props 定义

type Props = {
  /**
   * 表格的行键。
   */
  rowKey: (row: CT) => string | number
  items?: CT[]
  inspectButtonVisible?: boolean
  editButtonVisible?: boolean
  deleteButtonVisible?: boolean
  highlightCurrentRow?: boolean
  operateColumnVisible?: boolean
  operateColumnWidth?: number
  stripe?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  inspectButtonVisible: true,
  editButtonVisible: true,
  deleteButtonVisible: true,
  highlightCurrentRow: false,
  operateColumnVisible: true,
  operateColumnWidth: 107,
  stripe: true,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:items', items: CT[]): void
  (e: 'onItemOrderChanged', items: CT[]): void
  (e: 'onRowClick', row: CT): void
  (e: 'onItemInspect', item: CT, index: number): void
  (e: 'onItemEdit', item: CT, index: number): void
  (e: 'onItemDelete', item: CT, index: number): void
  (e: 'onCurrentChanged', current: CT | null): void
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
  registeredColumns.value = [...registeredColumns.value, entry]
  return () => {
    registeredColumns.value = registeredColumns.value.filter((column) => column.id !== id)
  }
}

provide(DRAGGABLE_TABLE_PANEL_CONTEXT_KEY, {
  registerColumn: registerColumn as DraggableTableRegisterContext<
    Record<string, unknown>
  >['registerColumn'],
})

function colGroupColStyle(col: RegisteredColumn<CT>): { width: string; minWidth: string } {
  return {
    width: `${unref(col.widthPx)}px`,
    minWidth: `${col.minWidthPx}px`,
  }
}

function dataColumnCellStyle(col: RegisteredColumn<CT>): Record<string, string> {
  return {
    textAlign: col.align,
    ...colGroupColStyle(col),
  }
}

const tableStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (registeredColumns.value.length === 0) {
    return style
  }
  const dataWidth = registeredColumns.value.reduce((total, column) => {
    return total + unref(column.widthPx)
  }, 0)
  const operateWidth = props.operateColumnVisible ? props.operateColumnWidth : 0
  const width = dataWidth + operateWidth
  style.width = `${width}px`
  style.minWidth = `${width}px`
  return style
})

// endregion

// region 拖拽处理

const tbodyRef = ref<HTMLTableSectionElement | null>(null)

let sortable: Sortable | null = null

watch(
  () => props.items,
  (value) => {
    if (value.length === 0) {
      return
    }
    nextTick(() => {
      setSort()
    })
  },
)

onBeforeUnmount(() => {
  if (sortable !== null) {
    sortable.destroy()
    sortable = null
  }
})

function setSort(): void {
  if (sortable !== null) {
    sortable.destroy()
    sortable = null
  }
  if (props.items.length === 0) {
    return
  }
  if (!tbodyRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  sortable = Sortable.create(tbodyRef.value, {
    ghostClass: 'sortable-ghost',
    setData: (dataTransfer: DataTransfer): void => {
      dataTransfer.setData('Text', '')
    },
    onEnd: (event: SortableEvent): void => {
      const _oldIndex: number | undefined = event.oldIndex
      const _neoIndex: number | undefined = event.newIndex
      if (_oldIndex === undefined || _neoIndex === undefined) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      if (_oldIndex === _neoIndex) {
        return
      }
      const _tempItems = [...props.items]
      const targetRow = _tempItems.splice(_oldIndex, 1)[0]
      _tempItems.splice(_neoIndex, 0, targetRow)
      emit('update:items', _tempItems)
      emit('onItemOrderChanged', _tempItems)
    },
  })
}

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
  void index
  return props.rowKey(row)
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
</script>

<style scoped>
.draggable-table-panel-container {
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

.native-table:not(.layout-fixed) {
  width: 100%;
}

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

.native-table.stripe :deep(tbody tr:nth-child(even)) {
  background: #fafafa;
}

.native-table.stripe :deep(tbody tr.is-current) {
  background: #ecf5ff;
}

.native-table :deep(tbody tr.is-current) {
  background: #ecf5ff;
}

.native-table :deep(tbody tr) {
  cursor: grab;
}

/*noinspection CssUnusedSymbol*/
.native-table :deep(tbody tr.sortable-ghost) {
  opacity: 0.5;
  background: #ecf5ff;
}

.operate-cell {
  text-align: center;
  white-space: nowrap;
}

.operate-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
