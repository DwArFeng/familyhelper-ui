<template>
  <div class="notify-info-record-panel-container">
    <placeholder-panel
      v-if="!notifyHistory"
      :text="t('views.element_plus_engineering.notify_management.please_select_notify_history')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleNotifyInfoRecordSearch">{{
              t('views.element_plus_engineering.notify_management.refresh_data')
            }}</el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="notifyInfoRecordTableCurrentPage"
            v-model:page-size="notifyInfoRecordTablePageSize"
            :item-count="notifyInfoRecordTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="notifyInfoRecordTableItems"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleNotifyInfoRecordTablePagingAttributeChanged"
            @onItemInspect="handleShowNotifyInfoRecordInspectDialog"
          >
            <el-table-column
              prop="key.type"
              :label="t('views.element_plus_engineering.notify_management.message_type')"
              width="100px"
              show-overflow-tooltip
              :formatter="notifyInfoRecordTableTypeFormatter"
            />
            <el-table-column
              prop="key.record_id"
              :label="t('views.element_plus_engineering.notify_management.record_id')"
              width="150px"
              show-overflow-tooltip
            />
            <el-table-column
              class-name="single-line"
              prop="value"
              :label="t('views.element_plus_engineering.notify_management.value')"
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="notifyInfoRecordMaintainDialogVisible"
      label-width="68px"
      :inspect-title="t('views.element_plus_engineering.notify_management.inspect_record')"
      :mode="notifyInfoRecordMaintainDialogMode"
      :item="notifyInfoRecordMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item :label="t('views.element_plus_engineering.notify_management.message_type')">
        <el-input v-model="notifyInfoRecordMaintainDialogItem.key_type" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.notify_management.record_id')">
        <el-input v-model="notifyInfoRecordMaintainDialogItem.key_record_id" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.notify_management.value')">
        <text-editor
          class="text-editor"
          v-model="notifyInfoRecordMaintainDialogItem.value"
          readonly
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type DispNotifyHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyHistory.ts'
import {
  type NotifyInfoRecord,
  type NotifyInfoRecordType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyInfoRecord.ts'
import { childForNotifyHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyInfoRecord.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'NotifyInfoRecordPanel',
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

// region 通知信息记录查询

watch(
  () => props.notifyHistory,
  () => {
    handleNotifyInfoRecordSearch()
  },
)

function handleNotifyInfoRecordSearch(): void {
  if (!props.notifyHistory) {
    return
  }
  handleNotifyInfoRecordAllSearch()
}

async function handleNotifyInfoRecordAllSearch(): Promise<void> {
  const notifyHistory: DispNotifyHistory | null = props.notifyHistory
  if (!notifyHistory) {
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForNotifyHistory(notifyHistory.key, pagingInfo),
      notifyInfoRecordTablePagingInfo.value,
    )
    updateNotifyInfoRecordTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleNotifyInfoRecordSearch()
})

// endregion

// region 通知信息记录表格

const {
  currentPage: notifyInfoRecordTableCurrentPage,
  pageSize: notifyInfoRecordTablePageSize,
  itemCount: notifyInfoRecordTableItemCount,
  items: notifyInfoRecordTableItems,
  pagingInfo: notifyInfoRecordTablePagingInfo,
  updateByLookup: updateNotifyInfoRecordTableByLookup,
} = useIdentityBackendPagingTablePanel<NotifyInfoRecord>(15)

function notifyInfoRecordTableTypeFormatter(row: NotifyInfoRecord): string {
  function formatType(type: NotifyInfoRecordType): string {
    switch (type) {
      case 0:
        return t('views.element_plus_engineering.notify_management.router_information')
      case 1:
        return t('views.element_plus_engineering.notify_management.dispatcher_information')
      case 2:
        return t('views.element_plus_engineering.notify_management.sender_information')
      default:
        return t('views.element_plus_engineering.notify_management.unknown_parenthesized')
    }
  }

  const { type } = row.key
  return formatType(type)
}

function handleNotifyInfoRecordTablePagingAttributeChanged(): void {
  handleNotifyInfoRecordSearch()
}

function handleShowNotifyInfoRecordInspectDialog(row: NotifyInfoRecord): void {
  showNotifyInfoRecordMaintainDialog(row)
}

// endregion

// region 通知信息记录维护对话框

type NotifyInfoRecordMaintainDialogItem = {
  key_notify_history_id: string
  key_type: NotifyInfoRecordType
  key_record_id: string
  value: string
}

const {
  visible: notifyInfoRecordMaintainDialogVisible,
  item: notifyInfoRecordMaintainDialogItem,
  mode: notifyInfoRecordMaintainDialogMode,
  showDialog: showNotifyInfoRecordMaintainDialog,
} = useInspectOnlyMaintainDialog<NotifyInfoRecord, NotifyInfoRecordMaintainDialogItem>(
  notifyInfoRecordMaintainDialogItemMap,
  {
    key_notify_history_id: '',
    key_type: 0,
    key_record_id: '',
    value: '',
  },
)

function notifyInfoRecordMaintainDialogItemMap(
  t: NotifyInfoRecord,
): NotifyInfoRecordMaintainDialogItem {
  return {
    key_notify_history_id: t.key.notify_history_id,
    key_type: t.key.type,
    key_record_id: t.key.record_id,
    value: t.value,
  }
}

// endregion
</script>

<style scoped>
.notify-info-record-panel-container {
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

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor {
  height: 300px;
}
</style>
