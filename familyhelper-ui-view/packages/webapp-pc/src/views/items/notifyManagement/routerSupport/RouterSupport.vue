<template>
  <div class="router-support-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <table-panel
        class="table"
        v-model:page-size="routerSupportTablePageSize"
        v-model:current-page="routerSupportTableCurrentPage"
        :item-count="routerSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="routerSupportItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleRouterSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowRouterSupportMaintainInspectDialog"
      >
        <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
        <el-table-column prop="label" label="标签" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column class-name="single-line" prop="example_param" label="示例参数" />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleRouterSupportSearch">刷新</el-button>
          <div class="tooltip">路由器的支持与程序相关，仅可查看，不能更改</div>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="routerSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="routerSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key_string_id">
        <el-input v-model="routerSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="routerSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="routerSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item label="示例参数" prop="example_param">
        <text-editor
          class="text-editor"
          v-model="routerSupportMaintainDialogItem.example_param"
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

import type { RouterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'RouterSupport',
})

// -----------------------------------------------------------加载标记-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------搜索逻辑-----------------------------------------------------------
function handleRouterSupportSearch(): void {
  handleRouterSupportAllSearch()
}

async function handleRouterSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      routerSupportTablePagingInfo.value,
    )
    updateRouterSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleRouterSupportSearch()
})

// -----------------------------------------------------------路由器支持表格-----------------------------------------------------------
const {
  currentPage: routerSupportTableCurrentPage,
  pageSize: routerSupportTablePageSize,
  itemCount: routerSupportTableItemCount,
  items: routerSupportItems,
  pagingInfo: routerSupportTablePagingInfo,
  updateByLookup: updateRouterSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<RouterSupport>(15)

function handleRouterSupportTablePagingAttributeChanged(): void {
  handleRouterSupportSearch()
}

// -----------------------------------------------------------维护对话框-----------------------------------------------------------
type RouterSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: routerSupportMaintainDialogVisible,
  item: routerSupportMaintainDialogItem,
  showDialog: showRouterSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<RouterSupport, RouterSupportMaintainDialogItem>(
  routerSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function routerSupportMaintainDialogItemMap(t: RouterSupport): RouterSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowRouterSupportMaintainInspectDialog(item: RouterSupport): void {
  showRouterSupportMaintainDialog(item)
}
</script>

<style scoped>
.router-support-container {
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
