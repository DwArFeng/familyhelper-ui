<template>
  <div class="my-import-task-container">
    <root-border-layout-panel
      class="border-layout-panel"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
      west-width="55%"
      :west-visible="true"
    >
      <template v-slot:west>
        <div class="west-container" v-loading="westLoading">
          <header-layout-panel>
            <template v-slot:header>
              <div class="header-container">
                <el-button type="success" @click="handleSearch">刷新数据</el-button>
              </div>
            </template>
            <template v-slot:default>
              <table-panel
                class="table"
                highlight-current-row
                v-model:page-size="importTaskTablePageSize"
                v-model:current-page="importTaskTableCurrentPage"
                :item-count="importTaskTableItemCount"
                :items="importTaskTableItems"
                :page-sizes="[15, 20, 30, 50]"
                :show-contextmenu="true"
                :operate-column-visible="false"
                :contextmenu-width="100"
                @onPagingAttributeChanged="handlePagingAttributeChanged"
                @onCurrentChanged="handleCurrentChanged"
              >
                <template v-slot:default>
                  <el-table-column
                    prop="account.name"
                    label="用户"
                    width="120"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="create_date"
                    label="创建时间"
                    show-overflow-tooltip
                    :formatter="timestampFormatter"
                  />
                  <el-table-column
                    prop="start_date"
                    label="开始时间"
                    show-overflow-tooltip
                    :formatter="timestampFormatter"
                  />
                  <el-table-column
                    prop="end_date"
                    label="结束时间"
                    show-overflow-tooltip
                    :formatter="timestampFormatter"
                  />
                  <el-table-column
                    prop="duration"
                    label="持续时间"
                    width="100"
                    show-overflow-tooltip
                    :formatter="durationFormatter"
                  />
                  <el-table-column
                    prop="data_count"
                    label="数据数量"
                    width="80"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="status"
                    label="状态"
                    width="80"
                    show-overflow-tooltip
                    :formatter="statusFormatter"
                  />
                </template>
                <template v-slot:contextmenu="{ row, close }">
                  <ul>
                    <li @click="handleCopyKeyContextmenuClicked(row as DispImportTask, close)">
                      复制主键
                    </li>
                  </ul>
                </template>
              </table-panel>
            </template>
          </header-layout-panel>
        </div>
      </template>
      <template v-slot:default>
        <div class="center-container">
          <import-task-editor-panel
            :task-id="taskTabPanelTaskId"
            :task-status="taskTabPanelTaskStatus"
          />
        </div>
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import ImportTaskEditorPanel from '@/views/nodes/elementPlus/fileio/importTask/subPanels/ImportTaskEditorPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import {
  formatDuration,
  formatTimestamp,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import {
  childForMeDisp,
  type DispImportTask,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/importTask.ts'

defineOptions({ name: 'MyImportTask' })

const westLoading = ref<boolean>(false)
const {
  currentPage: importTaskTableCurrentPage,
  pageSize: importTaskTablePageSize,
  itemCount: importTaskTableItemCount,
  items: importTaskTableItems,
  pagingInfo: importTaskTablePagingInfo,
  updateByLookup: updateImportTaskTableByLookup,
} = useIdentityBackendPagingTablePanel<DispImportTask>(15)

const taskTabPanelTaskId = ref<string>('')
const taskTabPanelTaskStatus = ref<number>(0)

function handlePagingAttributeChanged(): void {
  handleSearch()
}

async function handleSearch(): Promise<void> {
  westLoading.value = true
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForMeDisp(pagingInfo),
      importTaskTablePagingInfo.value,
    )
    updateImportTaskTableByLookup(res)
    adjustSelection()
  } finally {
    westLoading.value = false
  }
}

function adjustSelection(): void {
  const selected = importTaskTableItems.value.find(
    (item) => item.key.long_id === taskTabPanelTaskId.value,
  )
  if (selected) {
    taskTabPanelTaskStatus.value = selected.status
    return
  }
  const first = importTaskTableItems.value[0]
  if (!first) {
    taskTabPanelTaskId.value = ''
    taskTabPanelTaskStatus.value = 0
    return
  }
  taskTabPanelTaskId.value = first.key.long_id
  taskTabPanelTaskStatus.value = first.status
}

function handleCurrentChanged(current: DispImportTask | null): void {
  if (!current) return
  taskTabPanelTaskId.value = current.key.long_id
  taskTabPanelTaskStatus.value = current.status
}

async function handleCopyKeyContextmenuClicked(
  row: DispImportTask,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({ showClose: true, message: '复制成功', type: 'success' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function timestampFormatter(row: DispImportTask, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as unknown
  if (typeof value !== 'number') return '（暂无）'
  return formatTimestamp(value)
}

function durationFormatter(row: DispImportTask): string {
  if (row.duration === null) {
    return '（暂无）'
  }
  return formatDuration(row.duration)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function statusFormatter(row: DispImportTask, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as number
  switch (value) {
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

void handleSearch()
</script>

<style scoped>
.my-import-task-container,
.west-container,
.center-container {
  width: 100%;
  height: 100%;
}
.west-container .header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
