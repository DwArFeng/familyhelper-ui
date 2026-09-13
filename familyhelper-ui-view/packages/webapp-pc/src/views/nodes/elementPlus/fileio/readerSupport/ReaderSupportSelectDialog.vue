<template>
  <el-dialog
    tabindex="0"
    title="模板选择"
    append-to-body
    destroy-on-close
    :model-value="visible"
    :close-on-click-modal="false"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      highlight-current-row
      v-model:page-size="tablePageSize"
      v-model:current-page="tableCurrentPage"
      :item-count="tableItemCount"
      :items="tableItems"
      :page-sizes="[5, 15]"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleSearch"
      @onCurrentChanged="handleCurrentChanged"
    >
      <el-table-column prop="label" label="标签" show-overflow-tooltip />
      <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="example_param" label="示例参数" show-overflow-tooltip />
      <el-table-column prop="example_metadata" label="示例元数据" show-overflow-tooltip />
    </table-panel>
    <template v-slot:footer>
      <el-button type="primary" :disabled="loading || selection === null" @click="handleConfirmed"
        >确认</el-button
      >
      <el-button :disabled="loading" @click="emit('update:visible', false)">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import {
  all,
  type ReaderSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/readerSupport.ts'

defineOptions({ name: 'ReaderSupportSelectDialog' })
defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'onConfirmed', selection: ReaderSupport): void
}>()
const loading = ref<boolean>(false)
const selection = ref<ReaderSupport | null>(null)
const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ReaderSupport>(5)
async function handleSearch(): Promise<void> {
  loading.value = true
  try {
    updateTableByLookup(
      await lookupWithAdjustPage((pagingInfo) => all(pagingInfo), tablePagingInfo.value),
    )
  } finally {
    loading.value = false
  }
}
function handleCurrentChanged(current: ReaderSupport | null): void {
  selection.value = current
}
function handleConfirmed(): void {
  if (!selection.value) return
  emit('onConfirmed', selection.value)
  emit('update:visible', false)
}
function handleHotKeyDown(): void {
  if (selection.value) handleConfirmed()
}
void handleSearch()
</script>

<style scoped>
.table {
  height: 450px;
}
</style>
