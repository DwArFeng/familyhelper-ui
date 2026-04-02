<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="可视化器选择"
    :close-on-click-modal="false"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="dialog-table-wrap">
      <loading-overlay :loading="loading > 0" />
      <paging-table-panel
        class="table"
        v-model:current-page="tableCurrentPage"
        v-model:page-size="tablePageSize"
        highlight-current-row
        :row-key="visualizerRowKey"
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
import { onMounted, ref, watch } from 'vue'

import vim from '@/vim'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { type VisualizerSupportRow } from './visualizerSupportRow.ts'

defineOptions({
  name: 'VisualizerSupportSelectDialog',
})

// region Props

type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// endregion

// region Emits

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: VisualizerSupportRow): void
}

const emit = defineEmits<Emits>()

// endregion

// region 行构建

function visualizerRowKey(row: VisualizerSupportRow): string {
  return row.key
}

function buildRows(): VisualizerSupportRow[] {
  const lib = vim.ctx().library()
  const keys = [...lib.visualizerInfoKeys()].sort((a, b) => a.localeCompare(b))
  const rows: VisualizerSupportRow[] = []
  for (const key of keys) {
    const info = lib.visualizerInfo(key)
    if (!info) {
      continue
    }
    rows.push({
      key,
      name: info.name,
      description: info.description,
      exampleDisplay: info.exampleDisplay,
    })
  }
  return rows
}

// endregion

// region 加载

const loading = ref(0)

// endregion

// region 可见性

const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

// endregion

// region 表格

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  updateByLookup: tableUpdateByLookup,
  refreshPaging: tableRefreshPaging,
} = useIdentityFrontendPagingTablePanel<VisualizerSupportRow>(15)

const tableCurrentRow = ref<VisualizerSupportRow | null>(null)

function handleTablePagingAttributeChanged(): void {
  tableRefreshPaging()
}

function handleTableCurrentChanged(current: VisualizerSupportRow | null): void {
  tableCurrentRow.value = current
}

function handleSearch(): void {
  loading.value += 1
  try {
    tableUpdateByLookup(buildRows())
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  watchedVisible.value = props.visible
  handleSearch()
})

// endregion

// region 对话框操作

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
  position: relative;
  width: min(80vw, 1000px);
  max-width: 92vw;
}

.table {
  height: 450px;
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
