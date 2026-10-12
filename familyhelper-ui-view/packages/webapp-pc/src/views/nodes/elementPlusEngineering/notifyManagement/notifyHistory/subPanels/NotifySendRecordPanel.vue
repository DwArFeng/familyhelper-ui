<template>
  <div class="notify-send-record-panel-container">
    <placeholder-panel
      v-if="!notifyHistory"
      :text="t('views.element_plus_engineering.notify_management.please_select_notify_history')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleNotifySendRecordSearch">{{
              t('views.element_plus_engineering.notify_management.refresh_data')
            }}</el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="notifySendRecordTableCurrentPage"
            v-model:page-size="notifySendRecordTablePageSize"
            :item-count="notifySendRecordTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="notifySendRecordTableItems"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleNotifySendRecordTablePagingAttributeChanged"
            @onItemInspect="handleShowNotifySendRecordInspectDialog"
          >
            <el-table-column
              prop="key.topic_id"
              :label="t('views.element_plus_engineering.notify_management.topic')"
              show-overflow-tooltip
              :formatter="notifySendRecordTableTopicFormatter"
            />
            <el-table-column
              prop="key.user_id"
              :label="t('views.element_plus_engineering.notify_management.account')"
              show-overflow-tooltip
              :formatter="notifySendRecordTableAccountFormatter"
            />
            <el-table-column
              prop="succeed_flag"
              :label="t('views.element_plus_engineering.notify_management.sent_successfully')"
              width="85px"
              show-overflow-tooltip
              :formatter="notifySendRecordTableBooleanFormatter"
            />
            <el-table-column
              prop="sender_message"
              :label="t('views.element_plus_engineering.notify_management.sender_message')"
              show-overflow-tooltip
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="notifySendRecordMaintainDialogVisible"
      label-width="82px"
      :inspect-title="t('views.element_plus_engineering.notify_management.inspect_record')"
      :mode="notifySendRecordMaintainDialogMode"
      :item="notifySendRecordMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item :label="t('views.element_plus_engineering.notify_management.topic')">
        <el-input v-model="notifySendRecordMaintainDialogItem.formatted_topic" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.notify_management.account')">
        <el-input v-model="notifySendRecordMaintainDialogItem.formatted_account" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.sent_successfully')"
      >
        <el-input v-model="notifySendRecordMaintainDialogItem.formatted_succeed_flag" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.sender_information')"
      >
        <el-input v-model="notifySendRecordMaintainDialogItem.sender_message" readonly />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type DispNotifyHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyHistory.ts'
import { type DispNotifySendRecord } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySendRecord.ts'
import { type DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { type Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { childForNotifySettingDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySendRecord.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'NotifySendRecordPanel',
})

// region Props 定义

type Props = {
  notifyHistory: DispNotifyHistory | null
}

const props = defineProps<Props>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 通知发送记录查询

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
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
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

// endregion

// region 格式化

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
  return value
    ? t('views.element_plus_engineering.notify_management.yes')
    : t('views.element_plus_engineering.notify_management.no')
}

// endregion

// region 通知发送记录表格

const {
  currentPage: notifySendRecordTableCurrentPage,
  pageSize: notifySendRecordTablePageSize,
  itemCount: notifySendRecordTableItemCount,
  items: notifySendRecordTableItems,
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

// endregion

// region 通知发送记录维护对话框

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

// endregion
</script>

<style scoped>
.notify-send-record-panel-container {
  height: 100%;
  width: 100%;
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
