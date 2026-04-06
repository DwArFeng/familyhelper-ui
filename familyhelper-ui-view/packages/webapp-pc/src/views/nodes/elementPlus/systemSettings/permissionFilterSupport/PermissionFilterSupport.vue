<template>
  <div class="permission-filter-support-container">
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
        v-model:page-size="permissionFilterSupportTablePageSize"
        v-model:current-page="permissionFilterSupportTableCurrentPage"
        :item-count="permissionFilterSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="permissionFilterSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handlePermissionFilterSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowPermissionFilterSupportMaintainInspectDialog"
      >
        <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
        <el-table-column prop="label" label="标签" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column class-name="single-line" prop="example_pattern" label="示例参数" />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handlePermissionFilterSupportSearch">刷新</el-button>
          <div class="tooltip">权限过滤器的支持与程序相关，仅可查看，不能更改</div>
        </div>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="permissionFilterSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="permissionFilterSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key_string_id">
        <el-input v-model="permissionFilterSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="permissionFilterSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="permissionFilterSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item label="示例参数" prop="example_pattern">
        <text-editor
          class="text-editor"
          v-model="permissionFilterSupportMaintainDialogItem.example_pattern"
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
  handlePermissionFilterSupportAllSearch()
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
