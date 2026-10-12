<template>
  <div class="exporter-support-container">
    <root-border-layout-panel
      class="border-layout-panel"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
      v-loading="loading"
      :header-visible="true"
    >
      <table-panel
        class="table"
        v-model:page-size="tablePageSize"
        v-model:current-page="tableCurrentPage"
        :item-count="tableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="tableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleSearch"
        @onItemInspect="handleShowMaintainInspectDialog"
      >
        <el-table-column
          prop="key.string_id"
          :label="t('views.element_plus_engineering.fileio.type')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="label"
          :label="t('views.element_plus_engineering.fileio.label')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          :label="t('views.element_plus_engineering.fileio.description')"
          show-overflow-tooltip
        />
        <el-table-column
          class-name="single-line"
          prop="example_param"
          :label="t('views.element_plus_engineering.fileio.example_parameters')"
        />
        <el-table-column
          class-name="single-line"
          prop="example_metadata"
          :label="t('views.element_plus_engineering.fileio.example_metadata')"
        />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleSearch">{{
            t('views.element_plus_engineering.fileio.refresh')
          }}</el-button>
          <div class="tooltip">
            {{ t('views.element_plus_engineering.fileio.exporter_support_read_only_hint') }}
          </div>
        </div>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="maintainDialogVisible"
      mode="INSPECT"
      :item="maintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item :label="t('views.element_plus_engineering.fileio.type')" prop="key_string_id"
        ><el-input v-model="maintainDialogItem.key_string_id" readonly
      /></el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.fileio.label')" prop="label"
        ><el-input v-model="maintainDialogItem.label" readonly
      /></el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.fileio.description')"
        prop="description"
        ><el-input v-model="maintainDialogItem.description" readonly
      /></el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.fileio.example_parameters')"
        prop="example_param"
        ><text-editor class="text-editor" v-model="maintainDialogItem.example_param" readonly
      /></el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.fileio.example_metadata')"
        prop="example_metadata"
        ><text-editor class="text-editor" v-model="maintainDialogItem.example_metadata" readonly
      /></el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'
import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import {
  all,
  type ExporterSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exporterSupport.ts'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ExporterSupport' })

// region I18n 引入

const { t } = useI18n()

// endregion
const loading = ref<number>(0)

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ExporterSupport>(15)

type MaintainItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
  example_metadata: string
}
const {
  visible: maintainDialogVisible,
  item: maintainDialogItem,
  showDialog: showMaintainDialog,
} = useInspectOnlyMaintainDialog<ExporterSupport, MaintainItem>(
  (t) => ({
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
    example_metadata: t.example_metadata ?? '',
  }),
  { key_string_id: '', label: '', description: '', example_param: '', example_metadata: '' },
)

async function handleSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage((pagingInfo) => all(pagingInfo), tablePagingInfo.value)
    updateTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

function handleShowMaintainInspectDialog(item: ExporterSupport): void {
  showMaintainDialog(item)
}

onMounted(() => {
  void handleSearch()
})
</script>

<style scoped>
.exporter-support-container {
  height: 100%;
  width: 100%;
}
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-container .tooltip {
  font-size: 14px;
  color: #909399;
}
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.text-editor {
  height: 300px;
}
</style>
