<template>
  <div class="inspector-support-container">
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
        v-model:page-size="inspectorSupportTablePageSize"
        v-model:current-page="inspectorSupportTableCurrentPage"
        :item-count="inspectorSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="inspectorSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleInspectorSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowInspectorSupportMaintainInspectDialog"
      >
        <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
        <el-table-column prop="label" label="标签" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column class-name="single-line" prop="example_param" label="示例参数" />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleInspectorSupportSearch">刷新</el-button>
          <div class="tooltip">检查器支持与程序实现相关，仅可查看，不能更改。</div>
        </div>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="inspectorSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="inspectorSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key_string_id">
        <el-input v-model="inspectorSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="inspectorSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="inspectorSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item label="示例参数" prop="example_param">
        <text-editor
          class="text-editor"
          v-model="inspectorSupportMaintainDialogItem.example_param"
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

import {
  all,
  type InspectorSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectorSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'InspectorSupport',
})

// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handleInspectorSupportSearch(): void {
  handleInspectorSupportAllSearch()
}

async function handleInspectorSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      inspectorSupportTablePagingInfo.value,
    )
    updateInspectorSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleInspectorSupportSearch()
})

// endregion

// region 检查器支持表格

const {
  currentPage: inspectorSupportTableCurrentPage,
  pageSize: inspectorSupportTablePageSize,
  itemCount: inspectorSupportTableItemCount,
  items: inspectorSupportTableItems,
  pagingInfo: inspectorSupportTablePagingInfo,
  updateByLookup: updateInspectorSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<InspectorSupport>(15)

function handleInspectorSupportTablePagingAttributeChanged(): void {
  handleInspectorSupportSearch()
}

// endregion

// region 维护对话框

type InspectorSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: inspectorSupportMaintainDialogVisible,
  item: inspectorSupportMaintainDialogItem,
  showDialog: showInspectorSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<InspectorSupport, InspectorSupportMaintainDialogItem>(
  inspectorSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function inspectorSupportMaintainDialogItemMap(
  t: InspectorSupport,
): InspectorSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowInspectorSupportMaintainInspectDialog(item: InspectorSupport): void {
  showInspectorSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.inspector-support-container {
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
