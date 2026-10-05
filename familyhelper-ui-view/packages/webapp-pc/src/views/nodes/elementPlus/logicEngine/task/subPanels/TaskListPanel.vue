<template>
  <div class="task-list-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleTaskSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="taskTableCurrentPage"
          v-model:page-size="taskTablePageSize"
          highlight-current-row
          pagination-adjust-strategy="FORCE_COMPACT"
          :item-count="taskTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="taskTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :edit-menu-item-visible="false"
          :delete-menu-item-visible="false"
          :operate-column-width="53"
          @onPagingAttributeChanged="handleTaskPagingAttributeChanged"
          @onCurrentChanged="handleTaskTableCurrentChanged"
          @onItemInspect="handleShowTaskInspectDialog"
        >
          <template v-slot:default>
            <el-table-column
              label="部件名称"
              min-width="100"
              show-overflow-tooltip
              :formatter="sectionNameFormatter"
            />
            <el-table-column
              label="当前状态"
              min-width="100"
              show-overflow-tooltip
              :formatter="currentStateFormatter"
            />
            <el-table-column
              class-name="single-line"
              label="状态"
              width="90px"
              :formatter="statusFormatter"
            />
            <el-table-column
              class-name="single-line"
              label="创建时间"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispTask) => formatNullableTimestamp(row.created_date)"
            />
            <el-table-column
              class-name="single-line"
              label="开始时间"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispTask) => formatNullableTimestamp(row.started_date)"
            />
            <el-table-column
              class-name="single-line"
              label="结束时间"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispTask) => formatNullableTimestamp(row.ended_date)"
            />
          </template>
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row as DispTask, close)">复制主键</li>
            </ul>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      top="10vh"
      label-width="120px"
      v-model:visible="taskMaintainDialogVisible"
      mode="INSPECT"
      :item="taskMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="部件名称">
        <el-input v-model="taskMaintainDialogItem.section_name" readonly />
      </el-form-item>
      <el-form-item label="当前状态">
        <el-input v-model="taskMaintainDialogItem.current_state_label" readonly />
      </el-form-item>
      <el-form-item label="状态">
        <el-input v-model="taskMaintainDialogItem.status_label" readonly />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-input v-model="taskMaintainDialogItem.created_date" readonly />
      </el-form-item>
      <el-form-item label="开始时间">
        <el-input v-model="taskMaintainDialogItem.started_date" readonly />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-input v-model="taskMaintainDialogItem.ended_date" readonly />
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
  type DispTask,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/task.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'TaskListPanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', current: DispTask | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 任务搜索

async function handleTaskSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allDisp(pagingInfo),
      taskTablePagingInfo.value,
    )
    updateTaskTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleTaskSearch()
})

// endregion

// region 任务表格处理

const {
  currentPage: taskTableCurrentPage,
  pageSize: taskTablePageSize,
  itemCount: taskTableItemCount,
  items: taskTableItems,
  pagingInfo: taskTablePagingInfo,
  updateByLookup: updateTaskTableByLookup,
} = useIdentityBackendPagingTablePanel<DispTask>(15)

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

function sectionNameFormatter(row: DispTask): string {
  return row.section?.name ?? '（空）'
}

function currentStateFormatter(row: DispTask): string {
  if (!row.current_state) {
    return '（暂无）'
  }
  return `${row.current_state.name}（${row.current_state.key.state_id}）`
}

function statusFormatter(row: DispTask): string {
  return formatTaskStatus(row.status)
}

function handleTaskPagingAttributeChanged(): void {
  handleTaskSearch()
}

function handleTaskTableCurrentChanged(item: DispTask | null): void {
  emit('onCurrentChanged', item)
}

async function handleCopyKeyContextmenuClicked(row: DispTask, close: () => void): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({
    showClose: true,
    message: '复制成功',
    type: 'success',
  })
}

// endregion

// region 查看对话框

type TaskMaintainDialogItem = {
  section_name: string
  current_state_label: string
  status_label: string
  created_date: string
  started_date: string
  ended_date: string
}

const {
  visible: taskMaintainDialogVisible,
  item: taskMaintainDialogItem,
  showDialog: showTaskMaintainDialog,
} = useInspectOnlyMaintainDialog<DispTask, TaskMaintainDialogItem>(taskMaintainDialogItemMap, {
  section_name: '',
  current_state_label: '',
  status_label: '',
  created_date: '',
  started_date: '',
  ended_date: '',
})

function taskMaintainDialogItemMap(item: DispTask): TaskMaintainDialogItem {
  return {
    section_name: item.section?.name ?? '（空）',
    current_state_label: currentStateFormatter(item),
    status_label: formatTaskStatus(item.status),
    created_date: formatNullableTimestamp(item.created_date),
    started_date: formatNullableTimestamp(item.started_date),
    ended_date: formatNullableTimestamp(item.ended_date),
  }
}

function handleShowTaskInspectDialog(item: DispTask): void {
  showTaskMaintainDialog(item)
}

// endregion

// region Expose

defineExpose({
  refresh: handleTaskSearch,
})

// endregion
</script>

<style scoped>
.task-list-panel-container {
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
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
