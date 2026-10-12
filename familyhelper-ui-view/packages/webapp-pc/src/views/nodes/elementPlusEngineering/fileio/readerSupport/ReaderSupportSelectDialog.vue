<template>
  <el-dialog
    tabindex="0"
    :title="t('views.element_plus_engineering.fileio.select_template')"
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
      <el-table-column
        prop="label"
        :label="t('views.element_plus_engineering.fileio.label')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="key.string_id"
        :label="t('views.element_plus_engineering.fileio.type')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="description"
        :label="t('views.element_plus_engineering.fileio.description')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="example_param"
        :label="t('views.element_plus_engineering.fileio.example_parameters')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="example_metadata"
        :label="t('views.element_plus_engineering.fileio.example_metadata')"
        show-overflow-tooltip
      />
    </table-panel>
    <template v-slot:footer>
      <el-button
        type="primary"
        :disabled="loading || selection === null"
        @click="handleConfirmed"
        >{{ t('views.element_plus_engineering.fileio.confirmation') }}</el-button
      >
      <el-button :disabled="loading" @click="emit('update:visible', false)">{{
        t('views.element_plus_engineering.fileio.cancel')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import {
  all,
  type ReaderSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/readerSupport.ts'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ReaderSupportSelectDialog' })

// region I18n 引入

const { t } = useI18n()

// endregion
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
