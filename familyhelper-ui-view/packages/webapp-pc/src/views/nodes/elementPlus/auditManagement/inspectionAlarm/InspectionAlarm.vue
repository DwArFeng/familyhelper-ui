<template>
  <div class="inspection-alarm-container">
    <root-border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleInspectionAlarmRefresh">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-input
            class="search-bar"
            :model-value="searchBarValue"
            readonly
            :placeholder="searchPlaceholder"
            @keydown.enter="handleInspectionAlarmRefresh"
          >
            <template v-slot:prepend>
              <el-select
                class="search-field-select"
                v-model="queryMode"
                @change="handleQueryModeChanged"
              >
                <el-option label="按巡检" value="INSPECTION" />
                <el-option label="按任务" value="TASK" />
                <el-option label="按检查器" value="INSPECTOR" />
              </el-select>
            </template>
            <template v-slot:suffix>
              <el-icon
                v-if="searchBarValue !== ''"
                class="search-clear"
                @click.stop="handleSearchTargetCleared"
              >
                <CircleCloseIcon />
              </el-icon>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleSearchButtonClicked" />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="inspectionAlarmTableCurrentPage"
          v-model:page-size="inspectionAlarmTablePageSize"
          :item-count="inspectionAlarmTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="inspectionAlarmTableItems"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="53"
          @onPagingAttributeChanged="handleInspectionAlarmPagingAttributeChanged"
          @onItemInspect="handleShowInspectionAlarmInspectDialog"
        >
          <template v-slot:default>
            <el-table-column
              label="巡检"
              show-overflow-tooltip
              :formatter="inspectionNameFormatter"
            />
            <el-table-column label="检查器" show-overflow-tooltip :formatter="inspectorFormatter" />
            <el-table-column
              label="发生时间"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispInspectionAlarm) => formatNullableTimestamp(row.happened_date)"
            />
            <el-table-column
              label="类型标签"
              show-overflow-tooltip
              :formatter="typeLabelFormatter"
            />
            <el-table-column prop="message" label="消息摘要" show-overflow-tooltip />
          </template>
        </table-panel>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      label-width="110px"
      v-model:visible="inspectionAlarmMaintainDialogVisible"
      mode="INSPECT"
      :item="inspectionAlarmMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="巡检">
        <el-input v-model="inspectionAlarmMaintainDialogItem.inspection_name" readonly />
      </el-form-item>
      <el-form-item label="检查器">
        <el-input v-model="inspectionAlarmMaintainDialogItem.inspector_label" readonly />
      </el-form-item>
      <el-form-item label="原始类型">
        <el-input v-model="inspectionAlarmMaintainDialogItem.type" readonly />
      </el-form-item>
      <el-form-item label="类型标签">
        <el-input v-model="inspectionAlarmMaintainDialogItem.type_label" readonly />
      </el-form-item>
      <el-form-item label="发生时间">
        <el-input v-model="inspectionAlarmMaintainDialogItem.happened_date" readonly />
      </el-form-item>
      <el-form-item label="消息">
        <el-input
          v-model="inspectionAlarmMaintainDialogItem.message"
          type="textarea"
          :rows="4"
          readonly
        />
      </el-form-item>
    </maintain-dialog>
    <inspection-select-dialog
      v-model:visible="inspectionSelectDialogVisible"
      @onConfirmed="handleInspectionConfirmed"
    />
    <inspection-task-select-dialog
      v-model:visible="taskSelectDialogVisible"
      @onConfirmed="handleTaskConfirmed"
    />
    <inspector-info-select-dialog
      v-model:visible="inspectorSelectDialogVisible"
      @onConfirmed="handleInspectorConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { CircleClose as CircleCloseIcon, Search as SearchIcon } from '@element-plus/icons-vue'

import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type Inspection } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspection.ts'
import {
  allDisp,
  childForInspectionDisp,
  childForInspectionTaskDisp,
  childForInspectorInfoDisp,
  type DispInspectionAlarm,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionAlarm.ts'
import { type DispInspectionTask } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionTask.ts'
import { type DispInspectorInfo } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectorInfo.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import InspectionSelectDialog from '../inspection/InspectionSelectDialog.vue'
import InspectorInfoSelectDialog from '../inspection/InspectorInfoSelectDialog.vue'
import InspectionTaskSelectDialog from '../inspectionTask/InspectionTaskSelectDialog.vue'

defineOptions({
  name: 'InspectionAlarm',
})

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

type QueryMode = 'INSPECTION' | 'TASK' | 'INSPECTOR'

const queryMode = ref<QueryMode>('INSPECTION')
const inspectionId = ref<string>('')
const inspectionLabel = ref<string>('')
const taskId = ref<string>('')
const taskLabel = ref<string>('')
const inspectorId = ref<string>('')
const inspectorLabel = ref<string>('')
const inspectionSelectDialogVisible = ref<boolean>(false)
const taskSelectDialogVisible = ref<boolean>(false)
const inspectorSelectDialogVisible = ref<boolean>(false)

const searchBarValue = computed(() => {
  if (queryMode.value === 'TASK') {
    return taskLabel.value
  }
  if (queryMode.value === 'INSPECTOR') {
    return inspectorLabel.value
  }
  return inspectionLabel.value
})

const searchPlaceholder = computed(() => {
  if (queryMode.value === 'TASK') {
    return '请选择巡检任务'
  }
  if (queryMode.value === 'INSPECTOR') {
    return '请选择检查器'
  }
  return '请选择巡检'
})

function handleQueryModeChanged(): void {
  inspectionAlarmTableCurrentPage.value = 0
  handleInspectionAlarmSearch()
}

function handleSearchButtonClicked(): void {
  if (queryMode.value === 'TASK') {
    taskSelectDialogVisible.value = true
    return
  }
  if (queryMode.value === 'INSPECTOR') {
    inspectorSelectDialogVisible.value = true
    return
  }
  inspectionSelectDialogVisible.value = true
}

function handleSearchTargetCleared(): void {
  if (queryMode.value === 'INSPECTION') {
    inspectionId.value = ''
    inspectionLabel.value = ''
  } else if (queryMode.value === 'TASK') {
    taskId.value = ''
    taskLabel.value = ''
  } else if (queryMode.value === 'INSPECTOR') {
    inspectorId.value = ''
    inspectorLabel.value = ''
  }
  inspectionAlarmTableCurrentPage.value = 0
  handleInspectionAlarmSearch()
}

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

function formatTaskSelectionLabel(task: DispInspectionTask): string {
  return `${task.inspection.name} / ${formatTaskStatus(task.status)} / ${formatTimestamp(task.created_date)}`
}

function formatInspectorSelectionLabel(inspector: DispInspectorInfo): string {
  const inspectionName = inspector.inspection.name
  if (inspectionName === '') {
    return inspector.type
  }
  return `${inspectionName} / ${inspector.type}`
}

function handleInspectionConfirmed(inspection: Inspection): void {
  inspectionId.value = inspection.key.long_id
  inspectionLabel.value = inspection.name
  queryMode.value = 'INSPECTION'
  inspectionAlarmTableCurrentPage.value = 0
  handleInspectionAlarmSearch()
}

function handleTaskConfirmed(task: DispInspectionTask): void {
  taskId.value = task.key.long_id
  taskLabel.value = formatTaskSelectionLabel(task)
  queryMode.value = 'TASK'
  inspectionAlarmTableCurrentPage.value = 0
  handleInspectionAlarmSearch()
}

function handleInspectorConfirmed(inspector: DispInspectorInfo): void {
  inspectorId.value = inspector.key.long_id
  inspectorLabel.value = formatInspectorSelectionLabel(inspector)
  queryMode.value = 'INSPECTOR'
  inspectionAlarmTableCurrentPage.value = 0
  handleInspectionAlarmSearch()
}

// endregion

async function handleInspectionAlarmRefresh(): Promise<void> {
  await handleInspectionAlarmSearch()
}

// region 巡检告警搜索

async function handleInspectionAlarmSearch(): Promise<void> {
  loading.value += 1
  try {
    let res
    if (queryMode.value === 'INSPECTION' && inspectionId.value !== '') {
      res = await lookupWithAdjustPage(
        (pagingInfo) => childForInspectionDisp({ long_id: inspectionId.value }, pagingInfo),
        inspectionAlarmTablePagingInfo.value,
      )
    } else if (queryMode.value === 'TASK' && taskId.value !== '') {
      res = await lookupWithAdjustPage(
        (pagingInfo) => childForInspectionTaskDisp({ long_id: taskId.value }, pagingInfo),
        inspectionAlarmTablePagingInfo.value,
      )
    } else if (queryMode.value === 'INSPECTOR' && inspectorId.value !== '') {
      res = await lookupWithAdjustPage(
        (pagingInfo) => childForInspectorInfoDisp({ long_id: inspectorId.value }, pagingInfo),
        inspectionAlarmTablePagingInfo.value,
      )
    } else {
      res = await lookupWithAdjustPage(
        (pagingInfo) => allDisp(pagingInfo),
        inspectionAlarmTablePagingInfo.value,
      )
    }
    updateInspectionAlarmTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  void handleInspectionAlarmRefresh()
})

// endregion

// region 巡检告警表格处理

const {
  currentPage: inspectionAlarmTableCurrentPage,
  pageSize: inspectionAlarmTablePageSize,
  itemCount: inspectionAlarmTableItemCount,
  items: inspectionAlarmTableItems,
  pagingInfo: inspectionAlarmTablePagingInfo,
  updateByLookup: updateInspectionAlarmTableByLookup,
} = useIdentityBackendPagingTablePanel<DispInspectionAlarm>(15)

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '（暂无）'
  }
  return formatTimestamp(value)
}

function inspectionNameFormatter(row: DispInspectionAlarm): string {
  if (row.inspection === null) {
    return '（未知）'
  }
  return row.inspection.name
}

function inspectorFormatter(row: DispInspectionAlarm): string {
  if (row.inspector_info === null) {
    return '（未知）'
  }
  return row.inspector_info.type
}

function typeLabelFormatter(row: DispInspectionAlarm): string {
  return row.type_indicator?.label ?? '（未知）'
}

function handleInspectionAlarmPagingAttributeChanged(): void {
  handleInspectionAlarmSearch()
}

function handleShowInspectionAlarmInspectDialog(item: DispInspectionAlarm): void {
  showInspectionAlarmInspectMaintainDialog(item)
}

// endregion

// region 巡检告警维护对话框处理

type InspectionAlarmMaintainDialogItem = {
  inspection_name: string
  inspector_label: string
  type: string
  type_label: string
  happened_date: string
  message: string
}

const {
  visible: inspectionAlarmMaintainDialogVisible,
  item: inspectionAlarmMaintainDialogItem,
  showDialog: showInspectionAlarmInspectMaintainDialog,
} = useInspectOnlyMaintainDialog<DispInspectionAlarm, InspectionAlarmMaintainDialogItem>(
  (item) => ({
    inspection_name: item.inspection === null ? '（未知）' : item.inspection.name,
    inspector_label: item.inspector_info === null ? '（未知）' : item.inspector_info.type,
    type: item.type,
    type_label: item.type_indicator?.label ?? '（未知）',
    happened_date: formatNullableTimestamp(item.happened_date),
    message: item.message,
  }),
  {
    inspection_name: '',
    inspector_label: '',
    type: '',
    type_label: '',
    happened_date: '',
    message: '',
  },
)

// endregion
</script>

<style scoped>
.inspection-alarm-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

.header-container .search-bar {
  width: 480px;
}

.header-container .search-field-select {
  width: 100px;
}

.header-container .search-clear {
  cursor: pointer;
  color: var(--el-text-color-placeholder);
}

.header-container .search-clear:hover {
  color: var(--el-text-color-secondary);
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}
</style>
