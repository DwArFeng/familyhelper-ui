<template>
  <div class="remind-driver-support-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <table-panel
        class="table"
        v-model:page-size="remindDriverSupportTablePageSize"
        v-model:current-page="remindDriverSupportTableCurrentPage"
        :item-count="remindDriverSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="remindDriverSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleRemindDriverSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowRemindDriverSupportMaintainInspectDialog"
      >
        <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
        <el-table-column prop="label" label="标签" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column class-name="single-line" prop="example_param" label="示例参数" />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleRemindDriverSupportSearch">刷新</el-button>
          <div class="tooltip">提醒驱动器的支持与程序相关，仅可查看，不能更改</div>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="remindDriverSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="remindDriverSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key_string_id">
        <el-input v-model="remindDriverSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="remindDriverSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="remindDriverSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item label="示例参数" prop="example_param">
        <text-editor
          class="text-editor"
          v-model="remindDriverSupportMaintainDialogItem.example_param"
          readonly
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import { type RemindDriverSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/remindDriverSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/remindDriverSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'RemindDriverSupport',
})

// -----------------------------------------------------------加载标记-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------搜索逻辑-----------------------------------------------------------
function handleRemindDriverSupportSearch(): void {
  handleRemindDriverSupportAllSearch()
}

async function handleRemindDriverSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      remindDriverSupportTablePagingInfo.value,
    )
    updateRemindDriverSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleRemindDriverSupportSearch()
})

// -----------------------------------------------------------提醒驱动器支持表格-----------------------------------------------------------
const {
  currentPage: remindDriverSupportTableCurrentPage,
  pageSize: remindDriverSupportTablePageSize,
  itemCount: remindDriverSupportTableItemCount,
  items: remindDriverSupportTableItems,
  pagingInfo: remindDriverSupportTablePagingInfo,
  updateByLookup: updateRemindDriverSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<RemindDriverSupport>(15)

function handleRemindDriverSupportTablePagingAttributeChanged(): void {
  handleRemindDriverSupportSearch()
}

// -----------------------------------------------------------维护对话框-----------------------------------------------------------
type RemindDriverSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: remindDriverSupportMaintainDialogVisible,
  item: remindDriverSupportMaintainDialogItem,
  showDialog: showRemindDriverSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<RemindDriverSupport, RemindDriverSupportMaintainDialogItem>(
  remindDriverSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function remindDriverSupportMaintainDialogItemMap(
  t: RemindDriverSupport,
): RemindDriverSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowRemindDriverSupportMaintainInspectDialog(item: RemindDriverSupport): void {
  showRemindDriverSupportMaintainDialog(item)
}
</script>

<style scoped>
.remind-driver-support-container {
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

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor {
  height: 300px;
}
</style>
