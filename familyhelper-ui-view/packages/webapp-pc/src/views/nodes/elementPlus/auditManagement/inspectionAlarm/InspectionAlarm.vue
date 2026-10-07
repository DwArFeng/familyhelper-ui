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
          <el-radio-group v-model="queryMode" @change="handleQueryModeChanged">
            <el-radio-button value="ALL">全部告警</el-radio-button>
            <el-radio-button value="INSPECTION">按巡检</el-radio-button>
            <el-radio-button value="TASK">按任务</el-radio-button>
            <el-radio-button value="INSPECTOR">按检查器</el-radio-button>
          </el-radio-group>
          <el-divider direction="vertical" />
          <el-input
            v-if="queryMode === 'INSPECTION'"
            class="id-search-bar"
            :model-value="inspectionId"
            readonly
          >
            <template v-slot:prepend>
              <span>巡检</span>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="inspectionSelectDialogVisible = true" />
            </template>
          </el-input>
          <el-input
            v-else-if="queryMode === 'TASK'"
            class="id-search-bar"
            v-model="taskId"
            clearable
            @keydown.enter="handleInspectionAlarmSearch"
            @clear="handleInspectionAlarmSearch"
          >
            <template v-slot:prepend>
              <span>任务 ID</span>
            </template>
          </el-input>
          <el-input
            v-else-if="queryMode === 'INSPECTOR'"
            class="id-search-bar"
            v-model="inspectorId"
            clearable
            @keydown.enter="handleInspectionAlarmSearch"
            @clear="handleInspectionAlarmSearch"
          >
            <template v-slot:prepend>
              <span>检查器 ID</span>
            </template>
          </el-input>
          <el-button type="success" @click="handleInspectionAlarmRefresh">刷新数据</el-button>
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
            <el-table-column prop="key.long_id" label="告警 ID" show-overflow-tooltip />
            <el-table-column
              label="巡检"
              show-overflow-tooltip
              :formatter="inspectionNameFormatter"
            />
            <el-table-column label="任务 ID" show-overflow-tooltip :formatter="taskIdFormatter" />
            <el-table-column label="检查器" show-overflow-tooltip :formatter="inspectorFormatter" />
            <el-table-column
              label="发生时间"
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
      <el-form-item label="告警 ID">
        <el-input v-model="inspectionAlarmMaintainDialogItem.long_id" readonly />
      </el-form-item>
      <el-form-item label="巡检">
        <el-input v-model="inspectionAlarmMaintainDialogItem.inspection_name" readonly />
      </el-form-item>
      <el-form-item label="任务 ID">
        <el-input v-model="inspectionAlarmMaintainDialogItem.task_id" readonly />
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

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
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import InspectionSelectDialog from '../inspection/InspectionSelectDialog.vue'

defineOptions({
  name: 'InspectionAlarm',
})

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

type QueryMode = 'ALL' | 'INSPECTION' | 'TASK' | 'INSPECTOR'

const queryMode = ref<QueryMode>('ALL')
const inspectionId = ref<string>('')
const taskId = ref<string>('')
const inspectorId = ref<string>('')
const inspectionSelectDialogVisible = ref<boolean>(false)

function handleQueryModeChanged(): void {
  inspectionAlarmTableCurrentPage.value = 0
  handleInspectionAlarmSearch()
}

function handleInspectionConfirmed(inspection: Inspection): void {
  inspectionId.value = inspection.key.long_id
  queryMode.value = 'INSPECTION'
  inspectionAlarmTableCurrentPage.value = 0
  handleInspectionAlarmSearch()
}

// endregion

async function handleInspectionAlarmRefresh(): Promise<void> {
  await handleInspectionAlarmSearch()
}

// region 巡检告警搜索

async function handleInspectionAlarmSearch(): Promise<void> {
  if (queryMode.value === 'INSPECTION' && inspectionId.value === '') {
    updateInspectionAlarmTableByLookup({
      current_page: 0,
      total_pages: 0,
      rows: inspectionAlarmTablePageSize.value,
      count: '0',
      data: [],
    })
    return
  }
  if (queryMode.value === 'TASK' && taskId.value === '') {
    updateInspectionAlarmTableByLookup({
      current_page: 0,
      total_pages: 0,
      rows: inspectionAlarmTablePageSize.value,
      count: '0',
      data: [],
    })
    return
  }
  if (queryMode.value === 'INSPECTOR' && inspectorId.value === '') {
    updateInspectionAlarmTableByLookup({
      current_page: 0,
      total_pages: 0,
      rows: inspectionAlarmTablePageSize.value,
      count: '0',
      data: [],
    })
    return
  }
  loading.value += 1
  try {
    let res
    if (queryMode.value === 'INSPECTION') {
      res = await lookupWithAdjustPage(
        (pagingInfo) => childForInspectionDisp({ long_id: inspectionId.value }, pagingInfo),
        inspectionAlarmTablePagingInfo.value,
      )
    } else if (queryMode.value === 'TASK') {
      res = await lookupWithAdjustPage(
        (pagingInfo) => childForInspectionTaskDisp({ long_id: taskId.value }, pagingInfo),
        inspectionAlarmTablePagingInfo.value,
      )
    } else if (queryMode.value === 'INSPECTOR') {
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

function taskIdFormatter(row: DispInspectionAlarm): string {
  if (row.inspection_task_key === null) {
    return '（未知）'
  }
  return row.inspection_task_key.long_id
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
  long_id: string
  inspection_name: string
  task_id: string
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
    long_id: item.key.long_id,
    inspection_name: item.inspection === null ? '（未知）' : item.inspection.name,
    task_id: item.inspection_task_key === null ? '（未知）' : item.inspection_task_key.long_id,
    inspector_label: item.inspector_info === null ? '（未知）' : item.inspector_info.type,
    type: item.type,
    type_label: item.type_indicator?.label ?? '（未知）',
    happened_date: formatNullableTimestamp(item.happened_date),
    message: item.message,
  }),
  {
    long_id: '',
    inspection_name: '',
    task_id: '',
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
  gap: 8px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .id-search-bar {
  width: 320px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}
</style>
