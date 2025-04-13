<template>
  <div class="notify-history-panel-container">
    <header-layout-panel v-loading="loading">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleNotifyHistorySearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="notifyHistoryTableCurrentPage"
          v-model:page-size="notifyHistoryTablePageSize"
          highlight-current-row
          pagination-adjust-strategy="FORCE_COMPACT"
          :item-count="notifyHistoryTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="notifyHistoryTableItems"
          :edit-button-visible="false"
          :operate-column-width="80"
          @onPagingAttributeChanged="handleNotifyHistoryTablePagingAttributeChanged"
          @onCurrentChanged="handleNotifyHistoryTableCurrentChanged"
          @onItemInspect="handleShowNotifyHistoryInspectDialog"
          @onItemDelete="handleNotifyHistoryDeleteButtonClicked"
        >
          <el-table-column
            prop="notify_setting"
            label="通知设置"
            show-overflow-tooltip
            :formatter="notifyHistoryTableNotifySettingFormatter"
          />
          <el-table-column
            prop="happened_date"
            label="通知日期"
            width="180px"
            show-overflow-tooltip
            :formatter="notifyHistoryTableTimestampFormatter"
          />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      label-width="68px"
      v-model:visible="notifyHistoryMaintainDialogVisible"
      inspect-title="查看记录"
      :mode="notifyHistoryMaintainDialogMode"
      :item="notifyHistoryMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="通知设置">
        <el-input v-model="notifyHistoryMaintainDialogItem.notify_setting_label" readonly />
      </el-form-item>
      <el-form-item label="通知日期">
        <el-input v-model="notifyHistoryMaintainDialogItem.formatted_happened_date" readonly />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="notifyHistoryMaintainDialogItem.remark" readonly />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import type { DispNotifyHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyHistory.ts'
import type { NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import {
  allDisp,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyHistory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'NotifyHistoryPanel',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onCurrentNotifyHistoryChanged', value: DispNotifyHistory | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------通知历史查询-----------------------------------------------------------
function handleNotifyHistorySearch(): void {
  handleNotifyHistoryAllSearch()
}

async function handleNotifyHistoryAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allDisp(pagingInfo),
      notifyHistoryTablePagingInfo.value,
    )
    updateNotifyHistoryTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleNotifyHistorySearch()
})

// -----------------------------------------------------------通知历史表格-----------------------------------------------------------
const {
  currentPage: notifyHistoryTableCurrentPage,
  pageSize: notifyHistoryTablePageSize,
  itemCount: notifyHistoryTableItemCount,
  items: notifyHistoryTableItems,
  pagingInfo: notifyHistoryTablePagingInfo,
  updateByLookup: updateNotifyHistoryTableByLookup,
} = useIdentityBackendPagingTablePanel<DispNotifyHistory>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notifyHistoryTableNotifySettingFormatter(row: DispNotifyHistory, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notifySetting: NotifySetting | null = (row as any)[column.property]
  if (!notifySetting) {
    return '（未知）'
  }
  return notifySetting.label
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notifyHistoryTableTimestampFormatter(row: DispNotifyHistory, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function handleNotifyHistoryTablePagingAttributeChanged(): void {
  handleNotifyHistorySearch()
}

function handleNotifyHistoryTableCurrentChanged(current: DispNotifyHistory | null): void {
  emit('onCurrentNotifyHistoryChanged', current)
}

function handleShowNotifyHistoryInspectDialog(row: DispNotifyHistory): void {
  showNotifyHistoryMaintainDialog(row)
}

function handleNotifyHistoryDeleteButtonClicked(row: DispNotifyHistory): void {
  handleNotifyHistoryDelete(row)
}

async function handleNotifyHistoryDelete(row: DispNotifyHistory): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此通知历史。<br>' + '是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(remove(row.key))
    ElMessage({
      showClose: true,
      message: '通知历史删除成功',
      type: 'success',
      center: true,
    })
    handleNotifyHistorySearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------通知历史维护对话框-----------------------------------------------------------
type NotifyHistoryMaintainDialogItem = {
  key_long_id: string
  notify_setting_key_long_id: string
  happened_date: number
  remark: string
  notify_setting_label: string
  formatted_happened_date: string
}

const {
  visible: notifyHistoryMaintainDialogVisible,
  item: notifyHistoryMaintainDialogItem,
  mode: notifyHistoryMaintainDialogMode,
  showDialog: showNotifyHistoryMaintainDialog,
} = useInspectOnlyMaintainDialog<DispNotifyHistory, NotifyHistoryMaintainDialogItem>(
  notifyHistoryMaintainDialogItemMap,
  {
    key_long_id: '',
    notify_setting_key_long_id: '',
    happened_date: 0,
    remark: '',
    notify_setting_label: '',
    formatted_happened_date: '',
  },
)

function notifyHistoryMaintainDialogItemMap(t: DispNotifyHistory): NotifyHistoryMaintainDialogItem {
  return {
    key_long_id: t.key.long_id,
    notify_setting_key_long_id: t.notify_setting_key?.long_id ?? '',
    happened_date: t.happened_date,
    remark: t.remark,
    notify_setting_label: t.notify_setting?.label ?? '',
    formatted_happened_date: formatTimestamp(t.happened_date),
  }
}
</script>

<style scoped>
.notify-history-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}
</style>
