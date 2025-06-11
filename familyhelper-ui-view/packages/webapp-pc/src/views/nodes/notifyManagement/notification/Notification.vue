<template>
  <div class="notification-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleNotificationSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-button class="operate-button" type="primary" @click="handleAllNotificationRead">
            全部已读
          </el-button>
          <el-button class="operate-button" type="danger" @click="handleAllNotificationDelete">
            全部删除
          </el-button>
          <el-divider direction="vertical" />
          <el-switch
            v-model="unreadSwitchValue"
            active-text="仅未读"
            inactive-text="全部"
            active-color="#409EFF"
            inactive-color="#409EFF"
            @change="handleNotificationSearch"
          />
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="notification-table"
          v-model:current-page="notificationTableCurrentPage"
          v-model:page-size="notificationTablePageSize"
          :item-count="notificationTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="notificationTableItems"
          :show-contextmenu="true"
          :edit-button-visible="false"
          :operate-column-width="80"
          :row-class-name="notificationTableRowClassName"
          :cell-class-name="notificationTableCellClassName"
          @onPagingAttributeChanged="handleNotificationTablePagingAttributeChanged"
        >
          <el-table-column label="状态" width="55px" :resizable="false">
            <template v-slot:default="{ row }">
              <div class="icon-wrapper">
                <i class="iconfont icon">{{
                  (row as Notification).read_flag ? '\uffd8' : '\uffd9'
                }}</i>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="notified_date"
            label="通知日期"
            width="180px"
            :resizable="false"
            :formatter="notificationTableTimestampFormatter"
          />
          <el-table-column prop="subject" label="主题" show-overflow-tooltip>
            <template v-slot="{ row, column }">
              <div class="subject-column" @click="handleShowDetailDialog(row as Notification)">
                {{ row[column.property] ?? '（无主题）' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <template v-slot:operateColumn="{ row }">
            <el-button-group>
              <el-button
                class="table-button"
                type="success"
                :icon="FinishedIcon"
                :disabled="(row as Notification).read_flag"
                @click="handleNotificationRead(row as Notification)"
              />
              <el-button
                class="table-button"
                type="danger"
                :icon="DeleteIcon"
                @click="handleNotificationDelete(row as Notification)"
              />
            </el-button-group>
          </template>
        </table-panel>
      </template>
    </border-layout-panel>
    <el-dialog
      v-model="detailDialogVisible"
      append-to-body
      destroy-on-close
      close-on-click-modal
      title="通知详情"
      top="9vh"
    >
      <div class="detail-wrapper">
        <div>{{ detailDialogSubject ?? '（无主题）' }}</div>
        <el-divider />
        <div class="detail-body-wrapper">
          <el-empty
            v-if="!detailDialogBody"
            class="detail-body empty-body"
            description="没有正文"
          />
          <text-editor v-else class="detail-body text-editor" v-model="detailDialogBody" readonly />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'
import { type NotificationStore } from '@/store/modules/notification.ts'

import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon, Finished as FinishedIcon } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import TextEditor from '@/components/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { type Notification } from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/notification.ts'
import {
  childForUser,
  childForUserUnread,
  read,
  readAll,
  remove,
  removeAll,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/notification'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'NotificationComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')
const notificationStore = vim
  .ctx()
  .store()
  .vueStore<'notification', NotificationStore>('notification')

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const unreadSwitchValue = ref<boolean>(false)

async function handleAllNotificationRead(): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作会将所有通知设置为已读。<br>' + '是否继续?', '提示', {
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
    await resolveResponse(readAll({ string_id: lnpStore.me }))
    ElMessage({
      showClose: true,
      message: '通知设为已读',
      type: 'success',
    })
    handleNotificationSearch()
  } finally {
    loading.value -= 1
  }
}

async function handleAllNotificationDelete(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除当前为止所有的通知。<br>' + '该操作不可恢复！<br>' + '是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(removeAll({ string_id: lnpStore.me }))
    ElMessage({
      showClose: true,
      message: '通知删除成功',
      type: 'success',
    })
    handleNotificationSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------通知查询-----------------------------------------------------------
function handleNotificationSearch(): void {
  notificationStore
    .willUpdateUnreadCount()
    .execute()
    .catch(() => {})
  if (unreadSwitchValue.value) {
    lookupNotificationChildForMeUnread()
  } else {
    lookupNotificationChildForMe()
  }
}

async function lookupNotificationChildForMeUnread(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForUserUnread({ string_id: lnpStore.me }, pagingInfo),
      notificationTablePagingInfo.value,
    )
    updateNotificationTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function lookupNotificationChildForMe(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForUser({ string_id: lnpStore.me }, pagingInfo),
      notificationTablePagingInfo.value,
    )
    updateNotificationTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleNotificationSearch()
})

// -----------------------------------------------------------通知表格处理-----------------------------------------------------------
const {
  currentPage: notificationTableCurrentPage,
  pageSize: notificationTablePageSize,
  itemCount: notificationTableItemCount,
  items: notificationTableItems,
  pagingInfo: notificationTablePagingInfo,
  updateByLookup: updateNotificationTableByLookup,
} = useIdentityBackendPagingTablePanel<Notification>(15)

function notificationTableRowClassName({ row }: { row: Notification }): string {
  return row.read_flag ? '' : 'unread'
}

function notificationTableCellClassName({ columnIndex }: { columnIndex: number }): string {
  return columnIndex === 0 ? '' : 'bold-column'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notificationTableTimestampFormatter(row: Notification, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function handleNotificationTablePagingAttributeChanged(): void {
  handleNotificationSearch()
}

async function handleNotificationRead(row: Notification): Promise<void> {
  loading.value += 1
  try {
    await resolveResponse(read(row.key))
    ElMessage({
      showClose: true,
      message: '通知设为已读',
      type: 'success',
    })
    handleNotificationSearch()
  } finally {
    loading.value -= 1
  }
}

async function handleNotificationDelete(row: Notification): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此通知。<br>' + '该操作不可恢复！<br>' + '是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(remove(row.key))
    ElMessage({
      showClose: true,
      message: '通知删除成功',
      type: 'success',
    })
    handleNotificationSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------详情对话框处理-----------------------------------------------------------
const detailDialogVisible = ref<boolean>(false)
const detailDialogSubject = ref<string | null>('')
const detailDialogBody = ref<string | null>('')

function handleShowDetailDialog(row: Notification): void {
  detailDialogSubject.value = row.subject
  detailDialogBody.value = row.body
  detailDialogVisible.value = true
  if (row.read_flag) {
    return
  }
  loading.value += 1
  resolveResponse(read(row.key))
    .then(() => {
      handleNotificationSearch()
    })
    .finally(() => {
      loading.value -= 1
    })
}
</script>

<style scoped>
.notification-container {
  height: 100%;
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.notification-table :deep(.unread .bold-column) {
  font-weight: bold;
}

.notification-table .icon-wrapper {
  height: 24px;
  line-height: 24px;
}

.notification-table .icon {
  font-size: 24px;
  text-align: center;
  user-select: none;
  display: block;
}

.notification-table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.notification-table .subject-column {
  width: fit-content;
  max-width: 100%;
  text-decoration: underline;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-wrapper {
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.detail-wrapper .el-divider {
  margin: 5px 0;
}

.detail-body-wrapper {
  height: 600px;
  width: 100%;
}

.detail-body-wrapper .detail-body {
  height: 100%;
  width: 100%;
}

.detail-body-wrapper .empty-body :deep(p) {
  user-select: none;
}
</style>
