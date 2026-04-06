<template>
  <div class="account-protector-support-container">
    <root-border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <table-panel
        class="table"
        v-model:page-size="accountProtectorSupportTablePageSize"
        v-model:current-page="accountProtectorSupportTableCurrentPage"
        :item-count="accountProtectorSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="accountProtectorSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleAccountProtectorSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowAccountProtectorSupportMaintainInspectDialog"
      >
        <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
        <el-table-column prop="label" label="标签" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column class-name="single-line" prop="example_param" label="示例参数" />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleAccountProtectorSupportSearch">刷新</el-button>
          <div class="tooltip">账户保护器的支持与程序相关，仅可查看，不能更改</div>
        </div>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="accountProtectorSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="accountProtectorSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key_string_id">
        <el-input v-model="accountProtectorSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="accountProtectorSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="accountProtectorSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item label="示例参数" prop="example_param">
        <text-editor
          class="text-editor"
          v-model="accountProtectorSupportMaintainDialogItem.example_param"
          readonly
        />
      </el-form-item>
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

import { type ProtectorSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'AccountProtectorSupport',
})

// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handleAccountProtectorSupportSearch(): void {
  handleAccountProtectorSupportAllSearch()
}

async function handleAccountProtectorSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      accountProtectorSupportTablePagingInfo.value,
    )
    updateAccountProtectorSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleAccountProtectorSupportSearch()
})

// endregion

// region 账户保护器支持表格

const {
  currentPage: accountProtectorSupportTableCurrentPage,
  pageSize: accountProtectorSupportTablePageSize,
  itemCount: accountProtectorSupportTableItemCount,
  items: accountProtectorSupportTableItems,
  pagingInfo: accountProtectorSupportTablePagingInfo,
  updateByLookup: updateAccountProtectorSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<ProtectorSupport>(15)

function handleAccountProtectorSupportTablePagingAttributeChanged(): void {
  handleAccountProtectorSupportSearch()
}

// endregion

// region 维护对话框

type AccountProtectorSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: accountProtectorSupportMaintainDialogVisible,
  item: accountProtectorSupportMaintainDialogItem,
  showDialog: showAccountProtectorSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<ProtectorSupport, AccountProtectorSupportMaintainDialogItem>(
  accountProtectorSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function accountProtectorSupportMaintainDialogItemMap(
  t: ProtectorSupport,
): AccountProtectorSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowAccountProtectorSupportMaintainInspectDialog(item: ProtectorSupport): void {
  showAccountProtectorSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.account-protector-support-container {
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
