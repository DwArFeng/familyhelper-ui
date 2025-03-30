<template>
  <div class="notify-send-record-panel-container">
    <div v-if="!notifyHistory" class="placeholder">请选择通知历史</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleNotifySendRecordSearch">刷新数据</el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="notifySendRecordTableCurrentPage"
            v-model:page-size="notifySendRecordTablePageSize"
            :item-count="notifySendRecordTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="notifySendRecordItems"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleNotifySendRecordTablePagingAttributeChanged"
            @onItemInspect="handleShowNotifySendRecordInspectDialog"
          >
            <el-table-column
              prop="key.topic_id"
              label="主题"
              show-overflow-tooltip
              :formatter="notifySendRecordTableTopicFormatter"
            />
            <el-table-column
              prop="key.user_id"
              label="账户"
              show-overflow-tooltip
              :formatter="notifySendRecordTableAccountFormatter"
            />
            <el-table-column
              prop="succeed_flag"
              label="发送成功"
              width="85px"
              show-overflow-tooltip
              :formatter="notifySendRecordTableBooleanFormatter"
            />
            <el-table-column prop="sender_message" label="发送器消息" show-overflow-tooltip />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="notifySendRecordMaintainDialogVisible"
      label-width="82px"
      inspect-title="查看记录"
      :mode="notifySendRecordMaintainDialogMode"
      :item="notifySendRecordMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="主题">
        <el-input v-model="notifySendRecordMaintainDialogItem.formatted_topic" readonly />
      </el-form-item>
      <el-form-item label="账户">
        <el-input v-model="notifySendRecordMaintainDialogItem.formatted_account" readonly />
      </el-form-item>
      <el-form-item label="发送成功">
        <el-input v-model="notifySendRecordMaintainDialogItem.formatted_succeed_flag" readonly />
      </el-form-item>
      <el-form-item label="发送器信息">
        <el-input v-model="notifySendRecordMaintainDialogItem.sender_message" readonly />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import type { DispNotifyHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyHistory.ts'
import type { DispNotifySendRecord } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySendRecord.ts'
import type { DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import type { Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { childForNotifySettingDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySendRecord.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'NotifySendRecordPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  notifyHistory: DispNotifyHistory | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------通知发送记录查询-----------------------------------------------------------
watch(
  () => props.notifyHistory,
  () => {
    handleNotifySendRecordSearch()
  },
)

function handleNotifySendRecordSearch(): void {
  if (!props.notifyHistory) {
    return
  }
  handleNotifySendRecordAllSearch()
}

async function handleNotifySendRecordAllSearch(): Promise<void> {
  const notifyHistory: DispNotifyHistory | null = props.notifyHistory
  if (!notifyHistory) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForNotifySettingDisp(notifyHistory.key, pagingInfo),
      notifySendRecordTablePagingInfo.value,
    )
    updateNotifySendRecordTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleNotifySendRecordSearch()
})

// -----------------------------------------------------------格式化-----------------------------------------------------------
function formatTopic(topic: Topic): string {
  return `${topic.label}(${topic.key.string_id})`
}

function formatAccount(account: DispAccount): string {
  return `${account.display_name}(${account.key.string_id})`
}

function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }
  return value ? '是' : '否'
}

// -----------------------------------------------------------通知发送记录表格-----------------------------------------------------------
const {
  currentPage: notifySendRecordTableCurrentPage,
  pageSize: notifySendRecordTablePageSize,
  itemCount: notifySendRecordTableItemCount,
  items: notifySendRecordItems,
  pagingInfo: notifySendRecordTablePagingInfo,
  updateByLookup: updateNotifySendRecordTableByLookup,
} = useIdentityBackendPagingTablePanel<DispNotifySendRecord>(15)

function notifySendRecordTableTopicFormatter(row: DispNotifySendRecord): string {
  const { topic } = row
  return formatTopic(topic)
}

function notifySendRecordTableAccountFormatter(row: DispNotifySendRecord): string {
  const { account } = row
  return formatAccount(account)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notifySendRecordTableBooleanFormatter(row: Topic, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: boolean = (row as any)[column.property] as boolean
  return formatBoolean(value)
}

function handleNotifySendRecordTablePagingAttributeChanged(): void {
  handleNotifySendRecordSearch()
}

function handleShowNotifySendRecordInspectDialog(row: DispNotifySendRecord): void {
  showNotifySendRecordMaintainDialog(row)
}

// -----------------------------------------------------------通知发送记录维护对话框-----------------------------------------------------------
type NotifySendRecordMaintainDialogItem = {
  key_notify_history_id: string
  key_topic_id: string
  key_user_id: string
  succeed_flag: boolean
  sender_message: string
  formatted_topic: string
  formatted_account: string
  formatted_succeed_flag: string
}

const {
  visible: notifySendRecordMaintainDialogVisible,
  item: notifySendRecordMaintainDialogItem,
  mode: notifySendRecordMaintainDialogMode,
  showDialog: showNotifySendRecordMaintainDialog,
} = useInspectOnlyMaintainDialog<DispNotifySendRecord, NotifySendRecordMaintainDialogItem>(
  notifySendRecordMaintainDialogItemMap,
  {
    key_notify_history_id: '',
    key_topic_id: '',
    key_user_id: '',
    succeed_flag: false,
    sender_message: '',
    formatted_topic: '',
    formatted_account: '',
    formatted_succeed_flag: '',
  },
)

function notifySendRecordMaintainDialogItemMap(
  t: DispNotifySendRecord,
): NotifySendRecordMaintainDialogItem {
  return {
    key_notify_history_id: t.key.notify_history_id,
    key_topic_id: t.key.topic_id,
    key_user_id: t.key.user_id,
    succeed_flag: t.succeed_flag,
    sender_message: t.sender_message,
    formatted_topic: formatTopic(t.topic),
    formatted_account: formatAccount(t.account),
    formatted_succeed_flag: formatBoolean(t.succeed_flag),
  }
}
</script>

<style scoped>
.notify-send-record-panel-container {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}
</style>
