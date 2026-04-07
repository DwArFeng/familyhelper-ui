<template>
  <div class="account-protector-support-container">
    <div class="panel-wrap">
      <loading-overlay :loading="loading > 0" />
      <root-border-layout-panel
        class="border-layout-panel"
        :header-visible="true"
        :full-screen-tool-visible="false"
        :initial-tool-dock-status="4"
        :initial-tool-y="-200"
      >
        <paging-table-panel
          class="table"
          v-model:current-page="accountProtectorSupportTableCurrentPage"
          v-model:page-size="accountProtectorSupportTablePageSize"
          :item-count="accountProtectorSupportTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="accountProtectorSupportTableItems"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="28"
          @on-paging-attribute-changed="handleAccountProtectorSupportTablePagingAttributeChanged"
          @on-item-inspect="handleShowAccountProtectorSupportMaintainInspectDialog"
        >
          <paging-table-column label="类型" prop="key.string_id" :min-width="120" />
          <paging-table-column label="标签" prop="label" :min-width="120" />
          <paging-table-column label="描述" prop="description" :min-width="160" />
          <paging-table-column
            label="示例参数"
            prop="example_param"
            :min-width="200"
            cell-class="single-line"
          />
        </paging-table-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="success" @click="handleAccountProtectorSupportSearch">
              刷新
            </native-button>
            <div class="tooltip">账户保护器的支持与程序相关，仅可查看，不能更改</div>
          </div>
        </template>
      </root-border-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="accountProtectorSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="accountProtectorSupportMaintainDialogItem"
      inspect-title="查看"
      :close-on-click-modal="false"
    >
      <native-form-item label="类型">
        <input
          v-model="accountProtectorSupportMaintainDialogItem.key_string_id"
          type="text"
          class="native-input"
          readonly
        />
      </native-form-item>
      <native-form-item label="标签">
        <input
          v-model="accountProtectorSupportMaintainDialogItem.label"
          type="text"
          class="native-input"
          readonly
        />
      </native-form-item>
      <native-form-item label="描述">
        <input
          v-model="accountProtectorSupportMaintainDialogItem.description"
          type="text"
          class="native-input"
          readonly
        />
      </native-form-item>
      <native-form-item label="示例参数">
        <textarea
          v-model="accountProtectorSupportMaintainDialogItem.example_param"
          class="native-textarea"
          readonly
          rows="12"
        />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import RootBorderLayoutPanel from '@/components/comvisual/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import { type ProtectorSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { type AccountProtectorSupportMaintainDialogItem } from './accountProtectorSupportMaintainTypes.ts'

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

.panel-wrap {
  height: 100%;
  width: 100%;
}

.border-layout-panel {
  height: 100%;
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

.table {
  height: 100%;
}

.native-input,
.native-textarea {
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px 10px;
}

.native-input:read-only,
.native-textarea:read-only {
  background: #f5f7fa;
}

.native-textarea {
  resize: none;
  min-height: 0;
  font-family: inherit;
  line-height: 1.4;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}
</style>
