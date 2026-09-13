<template>
  <div class="export-task-setting-list-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowCreateDialog">新增任务配置</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-button type="primary" :disabled="applyChangesDisabled" @click="handleApplyChanges">
            应用变更
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          v-loading="tableLoading"
          highlight-current-row
          v-model:page-size="tablePageSize"
          v-model:current-page="tableCurrentPage"
          :item-count="tableItemCount"
          :items="tableItems"
          :page-sizes="[15, 20, 30, 50]"
          :show-contextmenu="true"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="true"
          :operate-column-width="53"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleSearch"
          @onItemDelete="handleEntityDelete"
          @onCurrentChanged="handleCurrentChanged"
        >
          <el-table-column prop="name" label="名称" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row as ExportTaskSetting, close)">
                复制主键
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="dialogVisible"
      mode="CREATE"
      :item="dialogItem"
      :loading="dialogLoading"
      :close-on-click-modal="false"
      @onItemCreate="handleEntityCreate"
    >
      <el-form-item label="名称" prop="name"><el-input v-model="dialogItem.name" /></el-form-item>
      <el-form-item label="使能" prop="enabled"
        ><el-switch v-model="dialogItem.enabled" active-text="是" inactive-text="否"
      /></el-form-item>
      <el-form-item label="备注" prop="remark"
        ><el-input v-model="dialogItem.remark"
      /></el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'
import {
  all,
  type ExportTaskSetting,
  insert,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exportTaskSetting.ts'
import { resetExport } from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/reset.ts'

defineOptions({
  name: 'ExportTaskSettingListPanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', current: ExportTaskSetting | null): void
}

const emit = defineEmits<Emits>()

// endregion

const applyChangesDisabled = ref<boolean>(false)
const currentSetting = ref<ExportTaskSetting | null>(null)

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ExportTaskSetting>(15)
const tableLoading = ref<number>(0)

const dialogVisible = ref<boolean>(false)
const dialogLoading = ref<boolean>(false)
const dialogItem = ref<{ name: string; enabled: boolean; remark: string }>({
  name: '',
  enabled: true,
  remark: '',
})

async function handleSearch(): Promise<void> {
  tableLoading.value += 1
  try {
    updateTableByLookup(
      await lookupWithAdjustPage((pagingInfo) => all(pagingInfo), tablePagingInfo.value),
    )
  } finally {
    tableLoading.value -= 1
  }
}

function handleCurrentChanged(current: ExportTaskSetting | null): void {
  currentSetting.value = current
  emit('onCurrentChanged', current)
}

function handleShowCreateDialog(): void {
  dialogItem.value = { name: '', enabled: true, remark: '' }
  dialogVisible.value = true
}

async function handleEntityDelete(item: ExportTaskSetting): Promise<void> {
  if (!item.key?.long_id) return
  try {
    await ElMessageBox.confirm('此操作将永久删除此数据点。是否继续?', '提示', { type: 'warning' })
  } catch {
    return
  }
  tableLoading.value += 1
  try {
    await resolveResponse(remove(item.key.long_id))
    ElMessage({ showClose: true, type: 'success', message: '任务配置已删除' })
    if (currentSetting.value?.key?.long_id === item.key.long_id) {
      currentSetting.value = null
      emit('onCurrentChanged', null)
    }
    await handleSearch()
  } finally {
    tableLoading.value -= 1
  }
}

async function handleEntityCreate(): Promise<void> {
  dialogLoading.value = true
  try {
    await resolveResponse(
      insert({
        key: { long_id: '' },
        name: dialogItem.value.name,
        enabled: dialogItem.value.enabled,
        remark: dialogItem.value.remark,
      }),
    )
    dialogVisible.value = false
    ElMessage({ showClose: true, type: 'success', message: '任务配置创建成功' })
    await handleSearch()
  } finally {
    dialogLoading.value = false
  }
}

async function handleCopyKeyContextmenuClicked(
  row: ExportTaskSetting,
  close: () => void,
): Promise<void> {
  close()
  if (!row.key?.long_id) return
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({ showClose: true, message: '复制成功', type: 'success' })
}

async function handleApplyChanges(): Promise<void> {
  applyChangesDisabled.value = true
  try {
    await resolveResponse(resetExport())
    ElMessage({ showClose: true, type: 'success', message: '变更应用成功！' })
  } finally {
    setTimeout(() => {
      applyChangesDisabled.value = false
    }, 3000)
  }
}

onMounted(() => {
  void handleSearch()
})

defineExpose({
  refresh: handleSearch,
})
</script>

<style scoped>
.export-task-setting-list-panel-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}
</style>
