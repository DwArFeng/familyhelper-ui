<template>
  <div class="sender-support-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <table-panel
        class="table"
        v-model:page-size="senderSupportTablePageSize"
        v-model:current-page="senderSupportTableCurrentPage"
        :item-count="senderSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="senderSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleSenderSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowSenderSupportMaintainInspectDialog"
      >
        <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
        <el-table-column prop="label" label="标签" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column class-name="single-line" prop="example_param" label="示例参数" />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleSenderSupportSearch">刷新</el-button>
          <div class="tooltip">发送器的支持与程序相关，仅可查看，不能更改</div>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="senderSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="senderSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key_string_id">
        <el-input v-model="senderSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="senderSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="senderSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item label="示例参数" prop="example_param">
        <text-editor
          class="text-editor"
          v-model="senderSupportMaintainDialogItem.example_param"
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

import { type SenderSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/senderSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/senderSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'SenderSupport',
})

// -----------------------------------------------------------加载标记-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------搜索逻辑-----------------------------------------------------------
function handleSenderSupportSearch(): void {
  handleSenderSupportAllSearch()
}

async function handleSenderSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      senderSupportTablePagingInfo.value,
    )
    updateSenderSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSenderSupportSearch()
})

// -----------------------------------------------------------发送器支持表格-----------------------------------------------------------
const {
  currentPage: senderSupportTableCurrentPage,
  pageSize: senderSupportTablePageSize,
  itemCount: senderSupportTableItemCount,
  items: senderSupportTableItems,
  pagingInfo: senderSupportTablePagingInfo,
  updateByLookup: updateSenderSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<SenderSupport>(15)

function handleSenderSupportTablePagingAttributeChanged(): void {
  handleSenderSupportSearch()
}

// -----------------------------------------------------------维护对话框-----------------------------------------------------------
type SenderSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: senderSupportMaintainDialogVisible,
  item: senderSupportMaintainDialogItem,
  showDialog: showSenderSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<SenderSupport, SenderSupportMaintainDialogItem>(
  senderSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function senderSupportMaintainDialogItemMap(t: SenderSupport): SenderSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowSenderSupportMaintainInspectDialog(item: SenderSupport): void {
  showSenderSupportMaintainDialog(item)
}
</script>

<style scoped>
.sender-support-container {
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
