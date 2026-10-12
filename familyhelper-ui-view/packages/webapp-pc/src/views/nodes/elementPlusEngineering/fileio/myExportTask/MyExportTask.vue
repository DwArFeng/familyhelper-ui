<template>
  <div class="my-export-task-container">
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
                <el-button type="success" @click="handleSearch">{{
                  t('views.element_plus_engineering.fileio.refresh_data')
                }}</el-button>
              </div>
            </template>
            <template v-slot:default>
              <table-panel
                class="table"
                highlight-current-row
                v-model:page-size="exportTaskTablePageSize"
                v-model:current-page="exportTaskTableCurrentPage"
                :item-count="exportTaskTableItemCount"
                :items="exportTaskTableItems"
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
                    :label="t('views.element_plus_engineering.fileio.user')"
                    width="120"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="create_date"
                    :label="t('views.element_plus_engineering.fileio.created_time')"
                    show-overflow-tooltip
                    :formatter="timestampFormatter"
                  />
                  <el-table-column
                    prop="start_date"
                    :label="t('views.element_plus_engineering.fileio.start_time')"
                    show-overflow-tooltip
                    :formatter="timestampFormatter"
                  />
                  <el-table-column
                    prop="end_date"
                    :label="t('views.element_plus_engineering.fileio.end_time')"
                    show-overflow-tooltip
                    :formatter="timestampFormatter"
                  />
                  <el-table-column
                    prop="duration"
                    :label="t('views.element_plus_engineering.fileio.duration')"
                    width="100"
                    show-overflow-tooltip
                    :formatter="durationFormatter"
                  />
                  <el-table-column
                    prop="data_count"
                    :label="t('views.element_plus_engineering.fileio.data_count')"
                    width="80"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="status"
                    :label="t('views.element_plus_engineering.fileio.status')"
                    width="80"
                    show-overflow-tooltip
                    :formatter="statusFormatter"
                  />
                </template>
                <template v-slot:contextmenu="{ row, close }">
                  <ul>
                    <li @click="handleCopyKeyContextmenuClicked(row as DispExportTask, close)">
                      {{ t('views.element_plus_engineering.fileio.copy_primary_key') }}
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
          <export-task-editor-panel
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

import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import ExportTaskEditorPanel from '@/views/nodes/elementPlusEngineering/fileio/exportTask/subPanels/ExportTaskEditorPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import {
  formatDuration,
  formatTimestamp,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import {
  childForMeDisp,
  type DispExportTask,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exportTask.ts'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'MyExportTask' })

// region I18n 引入

const { t } = useI18n()

// endregion
const westLoading = ref<boolean>(false)
const {
  currentPage: exportTaskTableCurrentPage,
  pageSize: exportTaskTablePageSize,
  itemCount: exportTaskTableItemCount,
  items: exportTaskTableItems,
  pagingInfo: exportTaskTablePagingInfo,
  updateByLookup: updateExportTaskTableByLookup,
} = useIdentityBackendPagingTablePanel<DispExportTask>(15)

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
      exportTaskTablePagingInfo.value,
    )
    updateExportTaskTableByLookup(res)
    adjustSelection()
  } finally {
    westLoading.value = false
  }
}

function adjustSelection(): void {
  const selected = exportTaskTableItems.value.find(
    (item) => item.key.long_id === taskTabPanelTaskId.value,
  )
  if (selected) {
    taskTabPanelTaskStatus.value = selected.status
    return
  }
  const first = exportTaskTableItems.value[0]
  if (!first) {
    taskTabPanelTaskId.value = ''
    taskTabPanelTaskStatus.value = 0
    return
  }
  taskTabPanelTaskId.value = first.key.long_id
  taskTabPanelTaskStatus.value = first.status
}

function handleCurrentChanged(current: DispExportTask | null): void {
  if (!current) return
  taskTabPanelTaskId.value = current.key.long_id
  taskTabPanelTaskStatus.value = current.status
}

async function handleCopyKeyContextmenuClicked(
  row: DispExportTask,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.fileio.copy_succeeded'),
    type: 'success',
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function timestampFormatter(row: DispExportTask, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as unknown
  if (typeof value !== 'number')
    return t('views.element_plus_engineering.fileio.none_available_parenthesized')
  return formatTimestamp(value)
}

function durationFormatter(row: DispExportTask): string {
  if (row.duration === null) {
    return t('views.element_plus_engineering.fileio.none_available_parenthesized')
  }
  return formatDuration(row.duration)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function statusFormatter(row: DispExportTask, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as number
  switch (value) {
    case 0:
      return t('views.element_plus_engineering.fileio.created')
    case 1:
      return t('views.element_plus_engineering.fileio.in_progress')
    case 2:
      return t('views.element_plus_engineering.fileio.completed')
    case 3:
      return t('views.element_plus_engineering.fileio.failed')
    case 4:
      return t('views.element_plus_engineering.fileio.timed_out')
    case 5:
      return t('views.element_plus_engineering.fileio.dead')
    default:
      return t('views.element_plus_engineering.fileio.unknown')
  }
}

void handleSearch()
</script>

<style scoped>
.my-export-task-container,
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
