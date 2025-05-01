<template>
  <div class="draggable-table-container" ref="rootRef">
    <el-table
      class="table"
      ref="elTableRef"
      height="100%"
      stripe
      tooltip-effect="dark"
      border
      :row-key="rowKey as RowKey"
      :data="items"
      :highlight-current-row="highlightCurrentRow"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      @row-click="handleTableRowClick"
      @current-change="handleTableCurrentChange"
      @selection-change="handleTableSelectionChange"
      @row-contextmenu="mayOpenMenu"
    >
      <slot name="default" />
      <el-table-column v-if="operateColumnVisible" label="操作" :width="operateColumnWidth">
        <template v-slot="scope">
          <slot
            name="operateColumn"
            :row="scope.row as CT"
            :column="scope.column as any"
            :index="scope.$index as number"
            :fireItemInspect="() => handleOperateColumnItemInspect(scope.row, scope.$index)"
            :fireItemEdit="() => handleOperateColumnItemEdit(scope.row, scope.$index)"
            :fireItemDelete="() => handleOperateColumnItemDelete(scope.row, scope.$index)"
          >
            <el-button-group class="operate-column">
              <el-button
                class="table-button"
                v-if="inspectButtonVisible"
                type="success"
                :icon="SearchIcon"
                @click="handleOperateColumnItemInspect(scope.row, scope.$index)"
              />
              <el-button
                class="table-button"
                v-if="editButtonVisible"
                type="primary"
                :icon="EditPen"
                @click="handleOperateColumnItemEdit(scope.row, scope.$index)"
              />
              <el-button
                class="table-button"
                v-if="deleteButtonVisible"
                type="danger"
                :icon="DeleteIcon"
                @click.stop="handleOperateColumnItemDelete(scope.row, scope.$index)"
              />
            </el-button-group>
          </slot>
        </template>
      </el-table-column>
    </el-table>
    <div
      v-if="contextmenuVisible"
      class="contextmenu"
      ref="contextmenuRef"
      aria-modal="true"
      tabindex="0"
      :style="{
        left: contextmenuLeft + 'px',
        top: contextmenuTop + 'px',
        width: contextmenuWidth + 'px',
      }"
      @blur="closeMenu"
    >
      <slot
        name="contextmenu"
        :row="contextmenuRow as CT"
        :index="contextmenuIndex as number"
        :close="() => contextmenuClose()"
        :fireItemInspect="
          () => handleOperateColumnItemInspect(contextmenuRow as CT, contextmenuIndex)
        "
        :fireItemEdit="() => handleOperateColumnItemEdit(contextmenuRow as CT, contextmenuIndex)"
        :fireItemDelete="
          () => handleOperateColumnItemDelete(contextmenuRow as CT, contextmenuIndex)
        "
        :fireItemMoveUp="() => handleContextmenuItemMoveUp(contextmenuRow as CT, contextmenuIndex)"
        :fireItemMoveDown="
          () => handleContextmenuItemMoveDown(contextmenuRow as CT, contextmenuIndex)
        "
        :fireItemMoveBegin="
          () => handleContextmenuItemMoveBegin(contextmenuRow as CT, contextmenuIndex)
        "
        :fireItemMoveEnd="
          () => handleContextmenuItemMoveEnd(contextmenuRow as CT, contextmenuIndex)
        "
      >
        <ul>
          <li
            v-if="inspectMenuItemVisible"
            @click="handleContextmenuItemInspect(contextmenuRow as CT, contextmenuIndex)"
          >
            查看...
          </li>
          <li
            v-if="editMenuItemVisible"
            @click="handleContextmenuItemEdit(contextmenuRow as CT, contextmenuIndex)"
          >
            编辑...
          </li>
          <li
            v-if="deleteMenuItemVisible"
            @click="handleContextmenuItemDelete(contextmenuRow as CT, contextmenuIndex)"
          >
            删除...
          </li>
          <li
            v-if="moveUpMenuItemVisible"
            @click="handleContextmenuItemMoveUp(contextmenuRow as CT, contextmenuIndex)"
          >
            上移
          </li>
          <li
            v-if="moveDownMenuItemVisible"
            @click="handleContextmenuItemMoveDown(contextmenuRow as CT, contextmenuIndex)"
          >
            下移
          </li>
          <li
            v-if="moveBeginMenuItemVisible"
            @click="handleContextmenuItemMoveBegin(contextmenuRow as CT, contextmenuIndex)"
          >
            移至首位
          </li>
          <li
            v-if="moveEndMenuItemVisible"
            @click="handleContextmenuItemMoveEnd(contextmenuRow as CT, contextmenuIndex)"
          >
            移至末位
          </li>
        </ul>
      </slot>
    </div>
    <div v-if="contextmenuVisible" class="contextmenu-modal" />
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { nextTick, ref, useTemplateRef, watch } from 'vue'

import { ElTable } from 'element-plus'

import { Delete as DeleteIcon, EditPen, Search as SearchIcon } from '@element-plus/icons-vue'

import { type SortableEvent } from 'sortablejs'
import Sortable from 'sortablejs'

defineOptions({
  name: 'DraggableTablePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type RowKey =
  | keyof {
      [K in keyof CT as CT[K] extends string ? K : never]: unknown
    }
  | ((row: CT) => string)

type Props = {
  /**
   * 表格的行键。
   */
  rowKey: RowKey
  items?: CT[]
  inspectButtonVisible?: boolean
  editButtonVisible?: boolean
  deleteButtonVisible?: boolean
  highlightCurrentRow?: boolean
  operateColumnVisible?: boolean
  operateColumnWidth?: number
  showContextmenu?: boolean
  contextmenuWidth?: number
  inspectMenuItemVisible?: boolean
  editMenuItemVisible?: boolean
  deleteMenuItemVisible?: boolean
  moveUpMenuItemVisible?: boolean
  moveDownMenuItemVisible?: boolean
  moveBeginMenuItemVisible?: boolean
  moveEndMenuItemVisible?: boolean
  rowClassName?: string | ((data: { row: CT; rowIndex: number }) => string)
  cellClassName?:
    | string
    | ((data: {
        row: CT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        column: any
        rowIndex: number
        columnIndex: number
      }) => string)
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  inspectButtonVisible: true,
  editButtonVisible: true,
  deleteButtonVisible: true,
  highlightCurrentRow: false,
  operateColumnVisible: true,
  operateColumnWidth: 107,
  showContextmenu: false,
  contextmenuWidth: 85,
  inspectMenuItemVisible: true,
  editMenuItemVisible: true,
  deleteMenuItemVisible: true,
  moveUpMenuItemVisible: true,
  moveDownMenuItemVisible: true,
  moveBeginMenuItemVisible: true,
  moveEndMenuItemVisible: true,
  rowClassName: '',
  cellClassName: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:items', items: CT[]): void
  (e: 'onItemOrderChanged', items: CT[]): void
  (e: 'onRowClick', row: CT): void
  (e: 'onItemInspect', item: CT, index: number): void
  (e: 'onItemEdit', item: CT, index: number): void
  (e: 'onItemDelete', item: CT, index: number): void
  (e: 'onCurrentChanged', current: CT): void
  (e: 'onSelectionChanged', selection: CT[]): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
type OperateColumnSlotProps = {
  row: CT
  // 此处 any 是 element-plus 使用的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: any
  index: number
  fireItemInspect: () => void
  fireItemEdit: () => void
  fireItemDelete: () => void
}

type ContextmenuSlotProps = {
  row: CT
  index: number
  close: () => void
  fireItemInspect: () => void
  fireItemEdit: () => void
  fireItemDelete: () => void
  fireItemMoveUp: () => void
  fireItemMoveDown: () => void
  fireItemMoveBegin: () => void
  fireItemMoveEnd: () => void
}

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operateColumn?: (props: OperateColumnSlotProps) => any
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextmenu?: (props: ContextmenuSlotProps) => any
}>()

// -----------------------------------------------------------拖拽处理-----------------------------------------------------------
const elTableRef = useTemplateRef<InstanceType<typeof ElTable>>('elTableRef')

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

function setSort(): void {
  // 如果 sortable 已经存在，则销毁。
  if (sortable !== null) {
    sortable.destroy()
  }
  // 如果没有数据，则不需要排序。
  if (props.items.length === 0) {
    return
  }
  // 获取表格元素。
  if (!elTableRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const el: HTMLElement = elTableRef.value.$el.querySelector('.el-table__body-wrapper table tbody')
  // 基于表格元素初始化 sortable。
  sortable = Sortable.create(el, {
    ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
    setData: (dataTransfer: DataTransfer): void => {
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
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

// -----------------------------------------------------------选择/选区处理-----------------------------------------------------------
function handleTableRowClick(row: CT): void {
  emit('onRowClick', row)
}

function handleTableCurrentChange(current: CT): void {
  emit('onCurrentChanged', current)
}

function handleTableSelectionChange(selection: CT[]): void {
  emit('onSelectionChanged', selection)
}

// -----------------------------------------------------------操作列处理-----------------------------------------------------------
function handleOperateColumnItemInspect(item: CT, index: number): void {
  emit('onItemInspect', item, index)
}

function handleOperateColumnItemEdit(item: CT, index: number): void {
  emit('onItemEdit', item, index)
}

function handleOperateColumnItemDelete(item: CT, index: number): void {
  emit('onItemDelete', item, index)
}

function handleContextmenuItemMoveUp(_item: CT, index: number): void {
  const _tempItems = [...props.items]
  const targetRow = _tempItems.splice(index, 1)[0]
  _tempItems.splice(index - 1, 0, targetRow)
  emit('update:items', _tempItems)
  emit('onItemOrderChanged', _tempItems)
}

function handleContextmenuItemMoveDown(_item: CT, index: number): void {
  const _tempItems = [...props.items]
  const targetRow = _tempItems.splice(index, 1)[0]
  _tempItems.splice(index + 1, 0, targetRow)
  emit('update:items', _tempItems)
  emit('onItemOrderChanged', _tempItems)
}

function handleContextmenuItemMoveBegin(_item: CT, index: number): void {
  const _tempItems = [...props.items]
  const targetRow = _tempItems.splice(index, 1)[0]
  _tempItems.unshift(targetRow)
  emit('update:items', _tempItems)
  emit('onItemOrderChanged', _tempItems)
}

function handleContextmenuItemMoveEnd(_item: CT, index: number): void {
  const _tempItems = [...props.items]
  const targetRow = _tempItems.splice(index, 1)[0]
  _tempItems.push(targetRow)
  emit('update:items', _tempItems)
  emit('onItemOrderChanged', _tempItems)
}

// -----------------------------------------------------------上下文菜单处理-----------------------------------------------------------
const contextmenuVisible = ref<boolean>(false)
const contextmenuLeft = ref<number>(0)
const contextmenuTop = ref<number>(0)
const contextmenuIndex = ref<number>(-1)
const contextmenuRow = ref<CT | null>(null)

const rootRef = useTemplateRef<HTMLElement>('rootRef')
const contextmenuRef = useTemplateRef<HTMLElement>('contextmenuRef')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mayOpenMenu(row: CT, _column: any, event: MouseEvent): void {
  if (!rootRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  if (!props.showContextmenu) {
    return
  }

  // 阻止系统菜单弹出。
  event.preventDefault()

  contextmenuRow.value = row
  contextmenuIndex.value = findRowIndex(row)

  const offsetLeft = rootRef.value.getBoundingClientRect().left // container margin left
  const { offsetWidth } = rootRef.value // container width
  const maxLeft = offsetWidth + offsetLeft - props.contextmenuWidth // left boundary
  const left = event.clientX + 15 // 15: margin right

  if (left > maxLeft) {
    contextmenuLeft.value = maxLeft
  } else {
    contextmenuLeft.value = left
  }

  contextmenuVisible.value = true

  nextTick(() => {
    if (!rootRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    if (!contextmenuRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }

    const contextmenuHeight = contextmenuRef.value.getBoundingClientRect().height
    const offsetTop = rootRef.value.getBoundingClientRect().top // container margin top
    const { offsetHeight } = rootRef.value // container height
    const maxTop = offsetHeight + offsetTop - contextmenuHeight // top boundary
    const top = event.clientY // 15: margin bottom

    if (top > maxTop) {
      contextmenuTop.value = maxTop
    } else {
      contextmenuTop.value = top
    }

    contextmenuRef.value.focus()
  })
}

function findRowIndex(row: CT): number {
  for (let i = 0; i < props.items.length; i += 1) {
    if (props.items[i] === row) {
      return i
    }
  }
  return -1
}

function closeMenu(): void {
  contextmenuVisible.value = false
}

function contextmenuClose(): void {
  contextmenuVisible.value = false
}

function handleContextmenuItemInspect(item: CT, index: number): void {
  contextmenuClose()
  emit('onItemInspect', item, index)
}

function handleContextmenuItemEdit(item: CT, index: number): void {
  contextmenuClose()
  emit('onItemEdit', item, index)
}

function handleContextmenuItemDelete(item: CT, index: number): void {
  contextmenuClose()
  emit('onItemDelete', item, index)
}
</script>

<style scoped>
.draggable-table-container {
  height: 100%;
  width: 100%;
}

.table {
  min-width: 100%;
}

.table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.contextmenu {
  margin: 0;
  padding: 5px 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #7f7f7f;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.contextmenu:focus {
  outline: none;
}

.contextmenu :deep(ul) {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.contextmenu :deep(li) {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.contextmenu :deep(li:hover) {
  background: #eee;
}

.contextmenu-modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 2999;
}
</style>
