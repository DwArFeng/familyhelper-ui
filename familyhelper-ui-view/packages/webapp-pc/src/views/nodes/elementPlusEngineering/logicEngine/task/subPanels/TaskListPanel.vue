<template>
  <div class="task-list-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleTaskSearch">{{
            t('views.element_plus_engineering.logic_engine.refresh_data')
          }}</el-button>
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
              :label="t('views.element_plus_engineering.logic_engine.section_name')"
              min-width="100"
              show-overflow-tooltip
              :formatter="sectionNameFormatter"
            />
            <el-table-column
              :label="t('views.element_plus_engineering.logic_engine.current_state')"
              min-width="100"
              show-overflow-tooltip
              :formatter="currentStateFormatter"
            />
            <el-table-column
              class-name="single-line"
              :label="t('views.element_plus_engineering.logic_engine.state')"
              width="90px"
              :formatter="statusFormatter"
            />
            <el-table-column
              class-name="single-line"
              :label="t('views.element_plus_engineering.logic_engine.created_time')"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispTask) => formatNullableTimestamp(row.created_date)"
            />
            <el-table-column
              class-name="single-line"
              :label="t('views.element_plus_engineering.logic_engine.starting_time')"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispTask) => formatNullableTimestamp(row.started_date)"
            />
            <el-table-column
              class-name="single-line"
              :label="t('views.element_plus_engineering.logic_engine.ending_time')"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispTask) => formatNullableTimestamp(row.ended_date)"
            />
          </template>
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row as DispTask, close)">
                {{ t('views.element_plus_engineering.logic_engine.copy_primary_key') }}
              </li>
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
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.section_name')">
        <el-input v-model="taskMaintainDialogItem.section_name" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.current_state')">
        <el-input v-model="taskMaintainDialogItem.current_state_label" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.state')">
        <el-input v-model="taskMaintainDialogItem.status_label" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.created_time')">
        <el-input v-model="taskMaintainDialogItem.created_date" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.starting_time')">
        <el-input v-model="taskMaintainDialogItem.started_date" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.ending_time')">
        <el-input v-model="taskMaintainDialogItem.ended_date" readonly />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  allDisp,
  type DispTask,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/task.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'TaskListPanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', current: DispTask | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

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
      return t('views.element_plus_engineering.logic_engine.created')
    case 1:
      return t('views.element_plus_engineering.logic_engine.processing')
    case 2:
      return t('views.element_plus_engineering.logic_engine.completed')
    case 3:
      return t('views.element_plus_engineering.logic_engine.failed')
    case 4:
      return t('views.element_plus_engineering.logic_engine.expired')
    case 5:
      return t('views.element_plus_engineering.logic_engine.dead')
    default:
      return t('views.element_plus_engineering.logic_engine.unknown_status', {
        status,
      })
  }
}

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  return formatTimestamp(value)
}

function sectionNameFormatter(row: DispTask): string {
  return row.section?.name ?? t('views.element_plus_engineering.logic_engine.empty_parenthesized')
}

function currentStateFormatter(row: DispTask): string {
  if (!row.current_state) {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
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
    message: t('views.element_plus_engineering.logic_engine.copy_succeeded'),
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
    section_name:
      item.section?.name ?? t('views.element_plus_engineering.logic_engine.empty_parenthesized'),
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
