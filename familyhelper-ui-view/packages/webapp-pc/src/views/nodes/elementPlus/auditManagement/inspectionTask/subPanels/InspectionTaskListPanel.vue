<template>
  <div class="inspection-task-list-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleInspectionTaskSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="inspectionTaskTableCurrentPage"
          v-model:page-size="inspectionTaskTablePageSize"
          highlight-current-row
          pagination-adjust-strategy="FORCE_COMPACT"
          :item-count="inspectionTaskTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="inspectionTaskTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :edit-menu-item-visible="false"
          :delete-menu-item-visible="false"
          :operate-column-width="53"
          @onPagingAttributeChanged="handleInspectionTaskPagingAttributeChanged"
          @onCurrentChanged="handleInspectionTaskTableCurrentChanged"
          @onItemInspect="handleShowInspectionTaskInspectDialog"
        >
          <template v-slot:default>
            <el-table-column
              class-name="single-line"
              label-class-name="single-line"
              label="巡检名称"
              min-width="120"
              show-overflow-tooltip
              :formatter="inspectionNameFormatter"
            />
            <el-table-column
              class-name="single-line"
              label="状态"
              width="90px"
              :formatter="statusFormatter"
            />
            <el-table-column
              class-name="single-line"
              prop="anchor_message"
              label="锚点消息"
              width="120"
              show-overflow-tooltip
              :formatter="anchorMessageFormatter"
            />
            <el-table-column
              class-name="single-line"
              label="创建时间"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispInspectionTask) => formatNullableTimestamp(row.created_date)"
            />
            <el-table-column
              class-name="single-line"
              label="开始时间"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispInspectionTask) => formatNullableTimestamp(row.started_date)"
            />
            <el-table-column
              class-name="single-line"
              label="结束时间"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispInspectionTask) => formatNullableTimestamp(row.ended_date)"
            />
            <el-table-column label="持续时间" width="100">
              <template v-slot="{ row }">
                <span
                  :title="formatInspectionDurationRawTitle((row as DispInspectionTask).duration)"
                >
                  {{ formatInspectionDuration((row as DispInspectionTask).duration) }}
                </span>
              </template>
            </el-table-column>
          </template>
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row as DispInspectionTask, close)">
                复制主键
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      top="10vh"
      label-width="120px"
      v-model:visible="inspectionTaskMaintainDialogVisible"
      mode="INSPECT"
      :item="inspectionTaskMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="任务 ID">
        <el-input v-model="inspectionTaskMaintainDialogItem.long_id" readonly />
      </el-form-item>
      <el-form-item label="巡检 ID">
        <el-input v-model="inspectionTaskMaintainDialogItem.inspection_id" readonly />
      </el-form-item>
      <el-form-item label="巡检名称">
        <el-input v-model="inspectionTaskMaintainDialogItem.inspection_name" readonly />
      </el-form-item>
      <el-form-item label="状态">
        <el-input v-model="inspectionTaskMaintainDialogItem.status_label" readonly />
      </el-form-item>
      <el-form-item label="锚点消息">
        <el-input v-model="inspectionTaskMaintainDialogItem.anchor_message" readonly />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-input v-model="inspectionTaskMaintainDialogItem.created_date" readonly />
      </el-form-item>
      <el-form-item label="开始时间">
        <el-input v-model="inspectionTaskMaintainDialogItem.started_date" readonly />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-input v-model="inspectionTaskMaintainDialogItem.ended_date" readonly />
      </el-form-item>
      <el-form-item label="持续时间">
        <el-input v-model="inspectionTaskMaintainDialogItem.duration_label" readonly />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import {
  allDisp,
  type DispInspectionTask,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionTask.ts'
import {
  formatDuration,
  formatTimestamp,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'InspectionTaskListPanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', current: DispInspectionTask | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 巡检任务搜索

async function handleInspectionTaskSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allDisp(pagingInfo),
      inspectionTaskTablePagingInfo.value,
    )
    updateInspectionTaskTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleInspectionTaskSearch()
})

// endregion

// region 巡检任务表格处理

const {
  currentPage: inspectionTaskTableCurrentPage,
  pageSize: inspectionTaskTablePageSize,
  itemCount: inspectionTaskTableItemCount,
  items: inspectionTaskTableItems,
  pagingInfo: inspectionTaskTablePagingInfo,
  updateByLookup: updateInspectionTaskTableByLookup,
} = useIdentityBackendPagingTablePanel<DispInspectionTask>(15)

function formatTaskStatus(status: number): string {
  switch (status) {
    case 0:
      return '已创建'
    case 1:
      return '处理中'
    case 2:
      return '已完成'
    case 3:
      return '失败'
    case 4:
      return '已过期'
    case 5:
      return '已僵死'
    default:
      return `未知（${status}）`
  }
}

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '（暂无）'
  }
  return formatTimestamp(value)
}

function formatInspectionDuration(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '（暂无）'
  }
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return String(value)
  }
  return formatDuration(numeric)
}

function formatInspectionDurationRawTitle(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '（暂无）'
  }
  return `原始值 ${value} ms`
}

function inspectionNameFormatter(row: DispInspectionTask): string {
  return row.inspection?.name ?? ''
}

function statusFormatter(row: DispInspectionTask): string {
  return formatTaskStatus(row.status)
}

function anchorMessageFormatter(row: DispInspectionTask): string {
  return row.anchor_message ?? ''
}

function handleInspectionTaskPagingAttributeChanged(): void {
  handleInspectionTaskSearch()
}

function handleInspectionTaskTableCurrentChanged(item: DispInspectionTask | null): void {
  emit('onCurrentChanged', item)
}

function handleShowInspectionTaskInspectDialog(item: DispInspectionTask): void {
  showInspectionTaskInspectMaintainDialog(item)
}

// endregion

// region 巡检任务维护对话框处理

type InspectionTaskMaintainDialogItem = {
  long_id: string
  inspection_id: string
  inspection_name: string
  status_label: string
  anchor_message: string
  created_date: string
  started_date: string
  ended_date: string
  duration_label: string
}

const {
  visible: inspectionTaskMaintainDialogVisible,
  item: inspectionTaskMaintainDialogItem,
  showDialog: showInspectionTaskInspectMaintainDialog,
} = useInspectOnlyMaintainDialog<DispInspectionTask, InspectionTaskMaintainDialogItem>(
  (item) => ({
    long_id: item.key.long_id,
    inspection_id: item.inspection_key.long_id,
    inspection_name: item.inspection?.name ?? '',
    status_label: formatTaskStatus(item.status),
    anchor_message: item.anchor_message ?? '',
    created_date: formatNullableTimestamp(item.created_date),
    started_date: formatNullableTimestamp(item.started_date),
    ended_date: formatNullableTimestamp(item.ended_date),
    duration_label: formatInspectionDuration(item.duration),
  }),
  {
    long_id: '',
    inspection_id: '',
    inspection_name: '',
    status_label: '',
    anchor_message: '',
    created_date: '',
    started_date: '',
    ended_date: '',
    duration_label: '',
  },
)

// endregion

// region 右键

async function handleCopyKeyContextmenuClicked(
  row: DispInspectionTask,
  close: () => void,
): Promise<void> {
  close()
  try {
    await navigator.clipboard.writeText(row.key.long_id)
    ElMessage({ showClose: true, message: '复制成功', type: 'success' })
  } catch {
    ElMessage({ showClose: true, message: '复制失败，请手动复制', type: 'error' })
  }
}

// endregion

// region Expose

defineExpose({
  refresh: handleInspectionTaskSearch,
})

// endregion
</script>

<style scoped>
.inspection-task-list-panel-container {
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
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
