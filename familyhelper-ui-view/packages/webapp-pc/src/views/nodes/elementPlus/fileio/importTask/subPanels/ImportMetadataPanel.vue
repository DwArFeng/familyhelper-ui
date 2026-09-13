<template>
  <div class="import-metadata-panel-container">
    <div v-if="taskId === ''" class="placeholder">请选择任务</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:page-size="tablePageSize"
            v-model:current-page="tableCurrentPage"
            :item-count="tableItemCount"
            :items="tableItems"
            :page-sizes="[10, 15, 20, 30]"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleSearch"
            @onItemInspect="handleEntityInspect"
          >
            <el-table-column prop="key.identifier" label="标识" />
            <el-table-column class-name="single-line" prop="content" label="内容" />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </table-panel>
        </template>
      </header-layout-panel>
      <maintain-dialog
        v-model:visible="dialogVisible"
        mode="INSPECT"
        :item="dialogItem"
        :close-on-click-modal="false"
        label-width="100px"
      >
        <el-form-item label="标识" prop="identifier"
          ><el-input v-model="dialogItem.identifier" readonly
        /></el-form-item>
        <el-form-item label="内容" prop="content"
          ><text-editor class="text-editor" v-model="dialogItem.content" readonly
        /></el-form-item>
        <el-form-item label="备注" prop="remark"
          ><el-input v-model="dialogItem.remark" readonly
        /></el-form-item>
      </maintain-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlus/text/textEditor/TextEditor.vue'
import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import {
  childForTask,
  type ImportMetadata,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/importMetadata.ts'

defineOptions({ name: 'ImportMetadataPanel' })
const props = defineProps<{ taskId: string }>()
const loading = ref<boolean>(false)

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ImportMetadata>(10)

type DialogItem = { identifier: string; content: string; remark: string }
const {
  visible: dialogVisible,
  item: dialogItem,
  showDialog,
} = useInspectOnlyMaintainDialog<ImportMetadata, DialogItem>(
  (t) => ({
    identifier: t.key?.identifier ?? '',
    content: t.content ?? '',
    remark: t.remark ?? '',
  }),
  { identifier: '', content: '', remark: '' },
)

watch(
  () => props.taskId,
  () => {
    void handleSearch()
  },
  { immediate: true },
)

async function handleSearch(): Promise<void> {
  if (props.taskId === '') return
  loading.value = true
  try {
    updateTableByLookup(
      await lookupWithAdjustPage(
        (pagingInfo) => childForTask({ long_id: props.taskId }, pagingInfo),
        tablePagingInfo.value,
      ),
    )
  } finally {
    loading.value = false
  }
}

function handleEntityInspect(item: ImportMetadata): void {
  showDialog(item)
}
</script>

<style scoped>
.import-metadata-panel-container,
.main-container {
  width: 100%;
  height: 100%;
}
.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}
.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
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
