<template>
  <div class="export-task-panel-container">
    <root-border-layout-panel
      class="border-layout-panel"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
      :header-visible="true"
    >
      <table-panel
        class="table"
        v-loading="loading"
        v-model:page-size="tablePageSize"
        v-model:current-page="tableCurrentPage"
        :item-count="tableItemCount"
        :items="tableItems"
        :page-sizes="[15, 20, 30, 50]"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleSearch"
      >
        <template v-slot:default>
          <el-table-column label="图标" width="53" :resizable="false">
            <template v-slot:default="{ row }">
              <div class="icon-wrapper">
                <i class="iconfont icon">{{
                  resolveFileIcon((row as ExportFileInfo).origin_name)
                }}</i>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="key.identifier" label="标识" show-overflow-tooltip />
          <el-table-column prop="origin_name" label="文件名" show-overflow-tooltip />
          <el-table-column
            prop="length"
            label="文件大小"
            show-overflow-tooltip
            :formatter="unitFormatter"
          />
          <el-table-column
            prop="generated_date"
            label="生成时间"
            show-overflow-tooltip
            :formatter="tableTimestampFormatter"
          />
        </template>
        <template v-slot:operateColumn="{ row }">
          <el-button-group class="operate-column">
            <el-button
              class="table-button"
              type="success"
              :icon="DownloadIcon"
              :disabled="taskInfo.status !== 2"
              @click="handleDownloadFile(row as ExportFileInfo)"
            />
          </el-button-group>
        </template>
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-form label-position="left" inline>
            <el-form-item>
              <el-button type="success" @click="handleSearch">刷新</el-button>
            </el-form-item>
            <el-form-item label="开始时间:">
              {{
                taskInfo.start_date
                  ? timestampFormatter(taskInfo.start_date)
                  : timestampFormatter(Date.now())
              }}
            </el-form-item>
            <el-form-item label="结束时间:">
              {{
                [0, 1].includes(taskInfo.status)
                  ? '未完成，请等待！'
                  : timestampFormatter(taskInfo.end_date)
              }}
            </el-form-item>
            <el-form-item label="持续时间:">{{ durationFormatter() }}</el-form-item>
            <el-form-item label="数据数量:">{{ taskInfo.data_count }}</el-form-item>
            <el-form-item label="任务状态:">{{ statusFormatter(taskInfo.status) }}</el-form-item>
          </el-form>
        </div>
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { Download as DownloadIcon } from '@element-plus/icons-vue'

import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import {
  type ExportTask,
  get as getTask,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exportTask.ts'
import {
  childForTask,
  downloadFile,
  type ExportFileInfo,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exportFile.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'
import {
  formatDuration,
  formatTimestamp,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

defineOptions({ name: 'ExportTaskPanel' })

const route = useRoute()
const taskId = computed<string>(() => (route.query.taskId as string | undefined) ?? '')
const loading = ref<boolean>(false)

const taskInfo = ref<ExportTask>({
  key: { long_id: '' },
  setting_key: { long_id: '' },
  userKey: { string_id: '' },
  status: 0,
  create_date: 0,
  start_date: 0,
  end_date: 0,
  duration: 0,
  data_count: 0,
  message: '',
  should_dead_date: 0,
  last_beat_date: 0,
})

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ExportFileInfo>(15)

let timerInstance: number | null = null

watch(
  taskId,
  () => {
    void handleSearch()
    startTimer()
  },
  { immediate: true },
)

onUnmounted(() => {
  stopTimer()
})

async function handleSearch(): Promise<void> {
  if (!taskId.value) return
  loading.value = true
  try {
    await getTaskInfo()
    await getTaskFileInfo()
  } finally {
    loading.value = false
  }
}

async function getTaskInfo(): Promise<void> {
  if (!taskId.value) return
  taskInfo.value = await resolveResponse(getTask(taskId.value))
  if (![0, 1].includes(taskInfo.value.status)) {
    stopTimer()
  }
}

async function getTaskFileInfo(): Promise<void> {
  if (!taskId.value) return
  const res = await lookupWithAdjustPage(
    (pagingInfo) => childForTask({ long_id: taskId.value }, pagingInfo),
    tablePagingInfo.value,
  )
  updateTableByLookup(res)
}

async function handleDownloadFile(row: ExportFileInfo): Promise<void> {
  const blob = await downloadFile(row.key.task_id, row.key.identifier)
  if (!blob) return
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = row.origin_name
  link.click()
  window.URL.revokeObjectURL(link.href)
}

function startTimer(): void {
  if (timerInstance !== null) return
  timerInstance = window.setInterval(() => {
    void handleSearch()
  }, 1000)
}

function stopTimer(): void {
  if (timerInstance === null) return
  window.clearInterval(timerInstance)
  timerInstance = null
}

function statusFormatter(status: number): string {
  switch (status) {
    case 0:
      return '已创建'
    case 1:
      return '进行中'
    case 2:
      return '已完成'
    case 3:
      return '失败'
    case 4:
      return '超时'
    case 5:
      return '死亡'
    default:
      return '未知'
  }
}

function timestampFormatter(timestamp: unknown): string {
  if (typeof timestamp !== 'number') return '（暂无）'
  return formatTimestamp(timestamp)
}

function durationFormatter(): string {
  const duration =
    [0, 1].includes(taskInfo.value.status) && taskInfo.value.start_date
      ? Date.now() - taskInfo.value.start_date
      : taskInfo.value.duration
  if (typeof duration !== 'number' || !Number.isFinite(duration)) {
    return '（暂无）'
  }
  return formatDuration(duration)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tableTimestampFormatter(row: ExportFileInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return timestampFormatter((row as any)[column.property])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unitFormatter(row: ExportFileInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as number
  return formatUnit(Number(value), dataSizePreset)
}

function resolveFileIcon(fileName: string): string {
  const name = fileName.toLowerCase()
  if (name.endsWith('.rtf') || name.endsWith('.txt')) return '\uffe4'
  if (
    name.endsWith('.pdf') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.gif')
  )
    return '\uffe3'
  return '\uffe5'
}
</script>

<style scoped>
.export-task-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-container :deep(.el-form-item) {
  margin-bottom: 0;
}

.table .icon-wrapper {
  height: 32px;
  line-height: 32px;
}

.table .icon {
  font-size: 32px;
  user-select: none;
}

.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}
</style>
