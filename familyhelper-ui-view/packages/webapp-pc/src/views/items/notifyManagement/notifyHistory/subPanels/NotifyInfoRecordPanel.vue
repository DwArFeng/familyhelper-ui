<template>
  <div class="notify-info-record-panel-container">
    <div v-if="!notifyHistory" class="placeholder">请选择通知历史</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleNotifyInfoRecordSearch">刷新数据</el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="notifyInfoRecordTableCurrentPage"
            v-model:page-size="notifyInfoRecordTablePageSize"
            :item-count="notifyInfoRecordTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="notifyInfoRecordItems"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleNotifyInfoRecordTablePagingAttributeChanged"
            @onItemInspect="handleShowNotifyInfoRecordInspectDialog"
          >
            <el-table-column
              prop="key.type"
              label="信息类型"
              width="100px"
              show-overflow-tooltip
              :formatter="notifyInfoRecordTableTypeFormatter"
            />
            <el-table-column
              prop="key.record_id"
              label="记录ID"
              width="150px"
              show-overflow-tooltip
            />
            <el-table-column class-name="single-line" prop="value" label="值" />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="notifyInfoRecordMaintainDialogVisible"
      label-width="68px"
      inspect-title="查看记录"
      :mode="notifyInfoRecordMaintainDialogMode"
      :item="notifyInfoRecordMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="信息类型">
        <el-input v-model="notifyInfoRecordMaintainDialogItem.key_type" readonly />
      </el-form-item>
      <el-form-item label="记录ID">
        <el-input v-model="notifyInfoRecordMaintainDialogItem.key_record_id" readonly />
      </el-form-item>
      <el-form-item label="值">
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

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/text/textEditor/TextEditor.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import type { DispNotifyHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyHistory.ts'
import type {
  NotifyInfoRecord,
  NotifyInfoRecordType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyInfoRecord.ts'
import { childForNotifyHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyInfoRecord.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'NotifyInfoRecordPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  notifyHistory: DispNotifyHistory | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------通知信息记录查询-----------------------------------------------------------
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
    throw new Error('不应该执行到此处, 请联系开发人员')
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

// -----------------------------------------------------------通知信息记录表格-----------------------------------------------------------
const {
  currentPage: notifyInfoRecordTableCurrentPage,
  pageSize: notifyInfoRecordTablePageSize,
  itemCount: notifyInfoRecordTableItemCount,
  items: notifyInfoRecordItems,
  pagingInfo: notifyInfoRecordTablePagingInfo,
  updateByLookup: updateNotifyInfoRecordTableByLookup,
} = useIdentityBackendPagingTablePanel<NotifyInfoRecord>(15)

function notifyInfoRecordTableTypeFormatter(row: NotifyInfoRecord): string {
  function formatType(type: NotifyInfoRecordType) {
    switch (type) {
      case 0:
        return '路由器信息'
      case 1:
        return '调度器信息'
      case 2:
        return '发送器信息'
      default:
        return '（未知）'
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

// -----------------------------------------------------------通知信息记录维护对话框-----------------------------------------------------------
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
</script>

<style scoped>
.notify-info-record-panel-container {
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
