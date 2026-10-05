<template>
  <div class="performer-support-container">
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
        v-model:page-size="performerSupportTablePageSize"
        v-model:current-page="performerSupportTableCurrentPage"
        :item-count="performerSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="performerSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handlePerformerSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowPerformerSupportMaintainInspectDialog"
      >
        <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
        <el-table-column prop="label" label="标签" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column
          class-name="single-line"
          prop="example_param"
          label="示例参数"
          min-width="110"
        />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handlePerformerSupportSearch">刷新</el-button>
          <div class="tooltip">执行器支持与程序实现相关，仅可查看，不能更改。</div>
        </div>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="performerSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="performerSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key_string_id">
        <el-input v-model="performerSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="performerSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="performerSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item label="示例参数" prop="example_param">
        <text-editor
          class="text-editor"
          v-model="performerSupportMaintainDialogItem.example_param"
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
  type PerformerSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/performerSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'PerformerSupport',
})

// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handlePerformerSupportSearch(): void {
  handlePerformerSupportAllSearch()
}

async function handlePerformerSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      performerSupportTablePagingInfo.value,
    )
    updatePerformerSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handlePerformerSupportSearch()
})

// endregion

// region 执行器支持表格

const {
  currentPage: performerSupportTableCurrentPage,
  pageSize: performerSupportTablePageSize,
  itemCount: performerSupportTableItemCount,
  items: performerSupportTableItems,
  pagingInfo: performerSupportTablePagingInfo,
  updateByLookup: updatePerformerSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<PerformerSupport>(15)

function handlePerformerSupportTablePagingAttributeChanged(): void {
  handlePerformerSupportSearch()
}

// endregion

// region 维护对话框

type PerformerSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: performerSupportMaintainDialogVisible,
  item: performerSupportMaintainDialogItem,
  showDialog: showPerformerSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<PerformerSupport, PerformerSupportMaintainDialogItem>(
  performerSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function performerSupportMaintainDialogItemMap(
  t: PerformerSupport,
): PerformerSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowPerformerSupportMaintainInspectDialog(item: PerformerSupport): void {
  showPerformerSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.performer-support-container {
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
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
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
