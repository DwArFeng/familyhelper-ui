<template>
  <div class="table-panel-container" ref="rootRef">
    <div class="table-container">
      <el-table
        ref="elTable"
        class="table"
        height="100%"
        stripe
        tooltip-effect="dark"
        border
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
                  size="small"
                  type="success"
                  :icon="SearchIcon"
                  @click="handleOperateColumnItemInspect(scope.row, scope.$index)"
                />
                <el-button
                  class="table-button"
                  v-if="editButtonVisible"
                  size="small"
                  type="primary"
                  :icon="EditPen"
                  @click="handleOperateColumnItemEdit(scope.row, scope.$index)"
                />
                <el-button
                  class="table-button"
                  v-if="deleteButtonVisible"
                  size="small"
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
          </ul>
        </slot>
      </div>
      <div v-if="contextmenuVisible" class="contextmenu-modal" />
    </div>
    <el-pagination
      class="pagination"
      :class="paginationStyle === 'COMPACT' ? 'compact' : ''"
      v-model:page-size="watchedPageSize"
      v-model:current-page="watchedCurrentPage"
      background
      :layout="paginationLayout"
      :page-sizes="pageSizes"
      :total="itemCount"
      :pager-count="paginationPagerCount"
    />
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

import { Delete as DeleteIcon, EditPen, Search as SearchIcon } from '@element-plus/icons-vue'

defineOptions({
  name: 'TablePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
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
  showContextmenu?: boolean
  contextmenuWidth?: number
  inspectMenuItemVisible?: boolean
  editMenuItemVisible?: boolean
  deleteMenuItemVisible?: boolean
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
  paginationAdjustStrategy?: 'FORCE_NORMAL' | 'FORCE_COMPACT' | 'AUTO'
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
  showContextmenu: false,
  contextmenuWidth: 85,
  inspectMenuItemVisible: true,
  editMenuItemVisible: true,
  deleteMenuItemVisible: true,
  rowClassName: '',
  cellClassName: '',
  paginationAdjustStrategy: 'FORCE_NORMAL',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:currentPage', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'update:items', value: CT[]): void
  (e: 'onPagingAttributeChanged'): void
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

// -----------------------------------------------------------分页逻辑处理-----------------------------------------------------------
const watchedCurrentPage = ref<number>(1)
const watchedPageSize = ref<number>(0)

let paginationUpdateCount: number = 0

watch(
  () => props.currentPage,
  (value) => {
    watchedCurrentPage.value = value + 1
  },
)

watch(
  () => watchedCurrentPage.value,
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
  watchedCurrentPage.value = props.currentPage + 1
  watchedPageSize.value = props.pageSize
})

// -----------------------------------------------------------分页样式处理-----------------------------------------------------------
const paginationStyle = computed(() => {
  if (props.paginationAdjustStrategy === 'FORCE_NORMAL') {
    return 'NORMAL'
  }
  if (props.paginationAdjustStrategy === 'FORCE_COMPACT') {
    return 'COMPACT'
  }
  const totalPages = Math.ceil(props.itemCount / props.pageSize)
  return totalPages >= 7 ? 'COMPACT' : 'NORMAL'
})

const paginationPagerCount = computed(() => {
  if (paginationStyle.value === 'COMPACT') {
    return 5
  }
  return 7
})

const paginationLayout = computed(() => {
  if (paginationStyle.value === 'COMPACT') {
    return 'sizes, pager, jumper'
  }
  return 'total, sizes, prev, pager, next, jumper'
})

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
.table-panel-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.table-panel-container .table-container {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.table {
  min-width: 100%;
}

.table-panel-container .pagination {
  text-align: center;
  padding: 0;
  margin-top: 2px;
}

/*noinspection CssUnusedSymbol*/
.table-panel-container .pagination :deep(.el-pagination__total) {
  height: 28px;
  line-height: 29px;
}

.table-panel-container .pagination :deep(.el-pagination__sizes input) {
  height: 28px;
  line-height: 26px;
}

/*noinspection CssUnusedSymbol*/
.table-panel-container .pagination :deep(.el-pagination__jump) {
  height: 28px;
  line-height: 27px;
}

.table-panel-container .pagination :deep(.el-pagination__jump input) {
  height: 28px;
  line-height: 28px;
}

.table-panel-container .pagination.compact :deep(.el-pager li) {
  margin: 0 1px;
}

/*noinspection CssUnusedSymbol*/
.table-panel-container .pagination.compact :deep(.el-pagination__sizes) {
  margin: 0 6px 0 0;
}

/*noinspection CssUnusedSymbol*/
.table-panel-container .pagination.compact :deep(.el-pagination__sizes .el-input) {
  margin: 0;
}

/*noinspection CssUnusedSymbol*/
.table-panel-container .pagination.compact :deep(.el-pagination__jump) {
  margin: 0 0 0 6px;
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
