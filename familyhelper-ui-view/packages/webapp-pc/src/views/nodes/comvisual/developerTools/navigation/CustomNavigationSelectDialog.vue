<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="自定义导航选择"
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
              placeholder="匹配键或名称"
              aria-label="搜索键或名称"
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
            :row-key="navigationRowKey"
            :item-count="tableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="tableItems"
            :operate-column-visible="false"
            @on-paging-attribute-changed="handleTablePagingAttributeChanged"
            @on-current-changed="handleTableCurrentChanged"
          >
            <paging-table-column label="键" prop="key" :min-width="160" />
            <paging-table-column label="名称" prop="name" :min-width="120" />
            <paging-table-column label="备注" prop="remark" :min-width="140" />
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

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { operateInspect as textOperateInspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  SETTINGREPO_ARGS_LIST,
  SETTINGREPO_CATEGORY,
  type CustomNavigation,
  parseCustomNavigations,
} from './customNavigation.ts'

defineOptions({
  name: 'CustomNavigationSelectDialog',
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
  (e: 'onConfirmed', value: CustomNavigation): void
}

const emit = defineEmits<Emits>()

// endregion

// region 类型与行键

function navigationRowKey(row: CustomNavigation): string {
  return row.key
}

// endregion

// region 加载状态

const loading = ref(0)

// endregion

// region 数据源

const searchKeyword = ref('')
const fullRows = ref<CustomNavigation[]>([])

// endregion

// region 分页表格与搜索

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  updateByLookup: tableUpdateByLookup,
  refreshPaging: tableRefreshPaging,
} = useIdentityFrontendPagingTablePanel<CustomNavigation>(15)

const tableCurrentRow = ref<CustomNavigation | null>(null)
const isRestoringSelection = ref(false)

function rowMatchesSearch(row: CustomNavigation, query: string): boolean {
  const t = query.trim().toLowerCase()
  if (t === '') {
    return true
  }
  return row.key.toLowerCase().includes(t) || row.name.toLowerCase().includes(t)
}

function filteredRows(): CustomNavigation[] {
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

function handleTableCurrentChanged(current: CustomNavigation | null): void {
  if (isRestoringSelection.value) {
    return
  }
  tableCurrentRow.value = current
}

// endregion

// region 数据刷新

async function refreshFullRowsAndTable(): Promise<void> {
  loading.value += 1
  try {
    const res = await resolveResponse(
      textOperateInspect({
        category: SETTINGREPO_CATEGORY,
        args: [...SETTINGREPO_ARGS_LIST],
      }),
    )
    const text = res?.value ?? ''
    fullRows.value = parseCustomNavigations(text)
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
      void refreshFullRowsAndTable()
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
    void refreshFullRowsAndTable()
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
</style>
