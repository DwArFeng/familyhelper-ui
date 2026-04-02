<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="组件注册选择"
    width="760px"
    :close-on-click-modal="false"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="dialog-table-wrap">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel apply-container-height>
        <template v-slot:header>
          <div class="dialog-toolbar">
            <span class="search-label">搜索</span>
            <input
              v-model="searchKeyword"
              class="search-input"
              type="text"
              placeholder="匹配 Key 或名称"
              aria-label="搜索 Key 或名称"
              @input="handleSearchInput"
            />
          </div>
        </template>
        <template v-slot:default>
          <paging-table-panel
            class="table"
            v-model:current-page="tableCurrentPage"
            v-model:page-size="tablePageSize"
            highlight-current-row
            :row-key="compregRowKey"
            :item-count="tableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="tableItems"
            :operate-column-visible="false"
            @on-paging-attribute-changed="handleTablePagingAttributeChanged"
            @on-current-changed="handleTableCurrentChanged"
          >
            <paging-table-column label="Key" prop="key" :min-width="140" />
            <paging-table-column label="名称" prop="name" :min-width="120" />
            <paging-table-column
              label="描述"
              prop="description"
              :min-width="160"
              cell-class="single-line"
            />
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </div>
    <template v-slot:footer>
      <div class="footer-row">
        <native-button
          kind="primary"
          :disabled="loading > 0 || tableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </native-button>
        <native-button :disabled="loading > 0" @click="handleCancelButtonClicked">
          取消
        </native-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

import vim from '@/vim'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { type CompregSupportRow } from './compregSupportRow.ts'

defineOptions({
  name: 'CompregSupportSelectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: CompregSupportRow): void
}

const emit = defineEmits<Emits>()

// endregion

// region 类型与行数据

function compregRowKey(row: CompregSupportRow): string {
  return row.key
}

function buildRows(): CompregSupportRow[] {
  const infos = vim.ctx().compreg().componentInfos()
  const keys = Object.keys(infos).sort((a, b) => a.localeCompare(b))
  const rows: CompregSupportRow[] = []
  for (const key of keys) {
    const info = infos[key]
    rows.push({
      key: info.key,
      name: info.name,
      description: info.description,
      exampleRouterComponentParam: info.exampleRouterComponentParam,
    })
  }
  return rows
}

// endregion

// region 加载状态

const loading = ref(0)

// endregion

// region 数据源

const searchKeyword = ref('')
const fullRows = ref<CompregSupportRow[]>([])

// endregion

// region 分页表格与搜索

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  updateByLookup: tableUpdateByLookup,
  refreshPaging: tableRefreshPaging,
} = useIdentityFrontendPagingTablePanel<CompregSupportRow>(15)

const tableCurrentRow = ref<CompregSupportRow | null>(null)
const isRestoringSelection = ref(false)

function rowMatchesSearch(row: CompregSupportRow, query: string): boolean {
  const t = query.trim().toLowerCase()
  if (t === '') {
    return true
  }
  return row.key.toLowerCase().includes(t) || row.name.toLowerCase().includes(t)
}

function filteredRows(): CompregSupportRow[] {
  return fullRows.value.filter((r) => rowMatchesSearch(r, searchKeyword.value))
}

function applyFilteredRowsWithSelectionRestore(): void {
  const rows = filteredRows()
  const prev = tableCurrentRow.value?.key ?? null
  isRestoringSelection.value = true
  tableUpdateByLookup(rows)
  void nextTick(() => {
    try {
      if (prev !== null && rows.some((r) => r.key === prev)) {
        tableCurrentRow.value = rows.find((r) => r.key === prev) ?? null
      } else {
        tableCurrentRow.value = null
      }
    } finally {
      isRestoringSelection.value = false
    }
  })
}

function handleSearchInput(): void {
  applyFilteredRowsWithSelectionRestore()
}

function handleTablePagingAttributeChanged(): void {
  tableRefreshPaging()
}

function handleTableCurrentChanged(current: CompregSupportRow | null): void {
  if (isRestoringSelection.value) {
    return
  }
  tableCurrentRow.value = current
}

// endregion

// region 数据刷新

function refreshFullRowsAndTable(): void {
  loading.value += 1
  try {
    fullRows.value = buildRows()
    applyFilteredRowsWithSelectionRestore()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 对话框可见性

const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
    if (value) {
      refreshFullRowsAndTable()
    }
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

// endregion

// region 生命周期

onMounted(() => {
  watchedVisible.value = props.visible
  if (props.visible) {
    refreshFullRowsAndTable()
  } else {
    fullRows.value = buildRows()
    applyFilteredRowsWithSelectionRestore()
  }
})

// endregion

// region 确认与取消

function handleConfirmButtonClicked(): void {
  const row = tableCurrentRow.value
  if (!row) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', row)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const row = tableCurrentRow.value
  if (!row) {
    return
  }
  emit('onConfirmed', row)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.dialog-table-wrap {
  width: 100%;
}

.dialog-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.search-label {
  font-size: 14px;
  color: #606266;
}

.search-input {
  width: min(320px, 100%);
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
}

.table {
  height: 420px;
}

.footer-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}
</style>
