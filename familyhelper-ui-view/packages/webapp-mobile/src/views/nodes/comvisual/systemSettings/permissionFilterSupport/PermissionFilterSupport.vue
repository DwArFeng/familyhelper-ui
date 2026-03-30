<template>
  <div class="permission-filter-support-container">
    <div class="panel-wrap">
      <loading-overlay :loading="loading > 0" />
      <border-layout-panel class="border-layout-panel" :header-visible="true">
        <paging-table-panel
          class="table"
          v-model:current-page="permissionFilterSupportTableCurrentPage"
          v-model:page-size="permissionFilterSupportTablePageSize"
          :item-count="permissionFilterSupportTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="permissionFilterSupportTableItems"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="28"
          @on-paging-attribute-changed="handlePermissionFilterSupportTablePagingAttributeChanged"
          @on-item-inspect="handleShowPermissionFilterSupportMaintainInspectDialog"
        >
          <paging-table-column label="类型" prop="key.string_id" :min-width="120" />
          <paging-table-column label="标签" prop="label" :min-width="120" />
          <paging-table-column label="描述" prop="description" :min-width="160" />
          <paging-table-column
            label="示例参数"
            prop="example_pattern"
            :min-width="200"
            cell-class="single-line"
          />
        </paging-table-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="success" @click="handlePermissionFilterSupportSearch">
              刷新
            </native-button>
            <div class="tooltip">权限过滤器的支持与程序相关，仅可查看，不能更改</div>
          </div>
        </template>
      </border-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="permissionFilterSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="permissionFilterSupportMaintainDialogItem"
      inspect-title="查看"
      :close-on-click-modal="false"
    >
      <native-form-item label="类型">
        <input
          v-model="permissionFilterSupportMaintainDialogItem.key_string_id"
          type="text"
          class="native-input"
          readonly
        />
      </native-form-item>
      <native-form-item label="标签">
        <input
          v-model="permissionFilterSupportMaintainDialogItem.label"
          type="text"
          class="native-input"
          readonly
        />
      </native-form-item>
      <native-form-item label="描述">
        <input
          v-model="permissionFilterSupportMaintainDialogItem.description"
          type="text"
          class="native-input"
          readonly
        />
      </native-form-item>
      <native-form-item label="示例参数">
        <textarea
          v-model="permissionFilterSupportMaintainDialogItem.example_pattern"
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

import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import { type FilterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/filterSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/filterSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'PermissionFilterSupport',
})

// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handlePermissionFilterSupportSearch(): void {
  void handlePermissionFilterSupportAllSearch()
}

async function handlePermissionFilterSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      permissionFilterSupportTablePagingInfo.value,
    )
    updatePermissionFilterSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handlePermissionFilterSupportSearch()
})

// endregion

// region 权限过滤器支持表格

const {
  currentPage: permissionFilterSupportTableCurrentPage,
  pageSize: permissionFilterSupportTablePageSize,
  itemCount: permissionFilterSupportTableItemCount,
  items: permissionFilterSupportTableItems,
  pagingInfo: permissionFilterSupportTablePagingInfo,
  updateByLookup: updatePermissionFilterSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<FilterSupport>(15)

function handlePermissionFilterSupportTablePagingAttributeChanged(): void {
  handlePermissionFilterSupportSearch()
}

// endregion

// region 维护对话框

type PermissionFilterSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_pattern: string
}

const {
  visible: permissionFilterSupportMaintainDialogVisible,
  item: permissionFilterSupportMaintainDialogItem,
  showDialog: showPermissionFilterSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<FilterSupport, PermissionFilterSupportMaintainDialogItem>(
  permissionFilterSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_pattern: '',
  },
)

function permissionFilterSupportMaintainDialogItemMap(
  t: FilterSupport,
): PermissionFilterSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_pattern: t.example_pattern ?? '',
  }
}

function handleShowPermissionFilterSupportMaintainInspectDialog(item: FilterSupport): void {
  showPermissionFilterSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.permission-filter-support-container {
  height: 100%;
  width: 100%;
}

.panel-wrap {
  position: relative;
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
