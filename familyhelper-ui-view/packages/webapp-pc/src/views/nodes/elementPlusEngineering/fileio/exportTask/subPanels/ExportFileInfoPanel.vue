<template>
  <div class="export-file-info-panel-container">
    <div v-if="taskId === ''" class="placeholder">
      {{ t('views.element_plus_engineering.fileio.please_select_task') }}
    </div>
    <div v-else class="main-container" v-loading="loading">
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
            v-model:page-size="tablePageSize"
            v-model:current-page="tableCurrentPage"
            :item-count="tableItemCount"
            :items="tableItems"
            :page-sizes="[10, 15, 20, 30]"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleSearch"
          >
            <el-table-column
              prop="key.identifier"
              :label="t('views.element_plus_engineering.fileio.identifier')"
              width="70"
              show-overflow-tooltip
            />
            <el-table-column
              prop="origin_name"
              :label="t('views.element_plus_engineering.fileio.file_name')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="length"
              :label="t('views.element_plus_engineering.fileio.file_size')"
              show-overflow-tooltip
              :formatter="unitFormatter"
            />
            <el-table-column
              prop="generated_date"
              :label="t('views.element_plus_engineering.fileio.generated_time')"
              show-overflow-tooltip
              :formatter="timestampFormatter"
            />
            <template v-slot:operateColumn="{ row }">
              <el-button-group class="operate-column">
                <el-button
                  class="table-button"
                  type="success"
                  :icon="DownloadIcon"
                  :disabled="taskStatus !== 2"
                  @click="handleDownloadFile(row as ExportFileInfo)"
                />
              </el-button-group>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import { Download as DownloadIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  childForTask,
  type ExportFileInfo,
  requestFileStreamVoucher,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exportFile.ts'
import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ExportFileInfoPanel' })

// region I18n 引入

const { t } = useI18n()

// endregion
const props = defineProps<{ taskId: string; taskStatus: number }>()
const loading = ref<boolean>(false)

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ExportFileInfo>(10)

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

async function handleDownloadFile(row: ExportFileInfo): Promise<void> {
  loading.value = true
  try {
    // 获取文件下载凭证。
    const _voucherKey: LongIdKey = await resolveResponse(
      requestFileStreamVoucher(row.key.task_id, row.key.identifier),
    )
    // 信息提示。
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.fileio.file_preparing_wait_hint'),
      type: 'success',
      duration: 10000,
    })
    // 创建 iframe, 执行下载。
    const iframe: HTMLIFrameElement = document.createElement('iframe')
    iframe.setAttribute('hidden', 'hidden')
    document.body.appendChild(iframe)
    const url: string = `${vim.ctx().api().baseUrl()}/fileio/export-file/download-by-voucher?voucher-id=${_voucherKey.long_id}`
    iframe.setAttribute('src', url)
    // 销毁 iframe。
    // 由于设置 src 属性的 iframe 不支持 onload 事件，所以使用定时器来销毁 iframe。
    // 假设文件准备的时间不会超过 10 分钟。
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 600000)
  } finally {
    loading.value = false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function timestampFormatter(row: ExportFileInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as unknown
  if (typeof value !== 'number')
    return t('views.element_plus_engineering.fileio.none_available_parenthesized')
  return formatTimestamp(value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unitFormatter(row: ExportFileInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as number
  return formatUnit(Number(value), dataSizePreset)
}
</script>

<style scoped>
.export-file-info-panel-container,
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
.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}
</style>
