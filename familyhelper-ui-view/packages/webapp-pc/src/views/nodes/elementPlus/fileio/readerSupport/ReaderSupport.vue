<template>
  <div class="reader-support-container">
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
        <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
        <el-table-column prop="label" label="标签" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column class-name="single-line" prop="example_param" label="示例参数" />
        <el-table-column class-name="single-line" prop="example_metadata" label="示例元数据" />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleSearch">刷新</el-button>
          <div class="tooltip">读取器的支持与程序相关，仅可查看，不能更改</div>
        </div>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="maintainDialogVisible"
      mode="INSPECT"
      :item="maintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key_string_id"
        ><el-input v-model="maintainDialogItem.key_string_id" readonly
      /></el-form-item>
      <el-form-item label="标签" prop="label"
        ><el-input v-model="maintainDialogItem.label" readonly
      /></el-form-item>
      <el-form-item label="描述" prop="description"
        ><el-input v-model="maintainDialogItem.description" readonly
      /></el-form-item>
      <el-form-item label="示例参数" prop="example_param"
        ><text-editor class="text-editor" v-model="maintainDialogItem.example_param" readonly
      /></el-form-item>
      <el-form-item label="示例元数据" prop="example_metadata"
        ><text-editor class="text-editor" v-model="maintainDialogItem.example_metadata" readonly
      /></el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlus/text/textEditor/TextEditor.vue'
import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import {
  all,
  type ReaderSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/readerSupport.ts'

defineOptions({ name: 'ReaderSupport' })
const loading = ref<number>(0)
const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ReaderSupport>(15)

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
} = useInspectOnlyMaintainDialog<ReaderSupport, MaintainItem>(
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
    updateTableByLookup(
      await lookupWithAdjustPage((pagingInfo) => all(pagingInfo), tablePagingInfo.value),
    )
  } finally {
    loading.value -= 1
  }
}

function handleShowMaintainInspectDialog(item: ReaderSupport): void {
  showMaintainDialog(item)
}

onMounted(() => {
  void handleSearch()
})
</script>

<style scoped>
.reader-support-container {
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
