<template>
  <div class="placeholder" v-if="propsInvalid">请选择通知设置、主题、用户</div>
  <header-layout-panel v-else v-loading="loading">
    <template v-slot:header>
      <el-button type="primary" @click="metaIndicatorSelectDialogVisible = true">新建</el-button>
      <el-button type="success" @click="handleMetaSearch">刷新</el-button>
    </template>
    <template v-slot:default>
      <table-panel
        class="table"
        v-model:current-page="metaTableCurrentPage"
        v-model:page-size="metaTablePageSize"
        :item-count="metaTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="metaTableItems"
        :operate-column-width="80"
        :inspect-button-visible="false"
        :edit-button-visible="true"
        :delete-button-visible="true"
        @onPagingAttributeChanged="handleMetaTablePagingAttributeChanged"
        @onItemEdit="handleShowMetaMaintainDialog"
        @onItemDelete="handleMetaDelete"
      >
        <el-table-column
          prop="key.meta_id"
          label="名称"
          show-overflow-tooltip
          :formatter="metaTableMetaIdFormatter"
        />
        <el-table-column class-name="single-line" prop="value" label="当前值" />
      </table-panel>
    </template>
  </header-layout-panel>
  <meta-indicator-select-dialog
    v-model:visible="metaIndicatorSelectDialogVisible"
    mode="CHILD_FOR_META_MISSING"
    :notify-setting-id="notifySetting?.key.long_id ?? ''"
    :topic-id="topic?.key.string_id ?? ''"
    :account-id="accountId"
    @onConfirmed="handleMetaIndicatorSelectDialogConfirmed"
  />
  <maintain-dialog
    v-model:visible="metaMaintainDialogVisible"
    top="10vh"
    :loading="metaMaintainDialogLoading"
    :mode="metaMaintainDialogMode"
    :item="metaMaintainDialogItem"
    :close-on-click-modal="false"
    @onItemEdit="handleMetaEdit"
  >
    <el-form-item label="当前值" prop="value">
      <el-input v-model="metaMaintainDialogItem.value" />
    </el-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useEditOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import MetaIndicatorSelectDialog from '@/views/nodes/notifyManagement/metaIndicator/MetaIndicatorSelectDialog.vue'

import { type NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import { type Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { type DispMeta } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/meta.ts'
import {
  childForNotifySettingTopicUserDisp,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/meta.ts'
import { type MetaIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  currentTimestamp,
  formatTimestamp,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'MetaPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  notifySetting: NotifySetting | null
  topic: Topic | null
  accountId: string
}

const props = defineProps<Props>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------占位符-----------------------------------------------------------
const propsInvalid = computed<boolean>(() => {
  return !props.notifySetting || !props.topic || !props.accountId
})

// -----------------------------------------------------------元数据查询-----------------------------------------------------------
watch(
  () => props.notifySetting,
  () => {
    handleMetaSearch()
  },
)

watch(
  () => props.topic,
  () => {
    handleMetaSearch()
  },
)

watch(
  () => props.accountId,
  () => {
    handleMetaSearch()
  },
)

function handleMetaSearch(): void {
  if (propsInvalid.value) {
    return
  }
  handleMetaChildForNotifySettingTopicUserDispSearch()
}

async function handleMetaChildForNotifySettingTopicUserDispSearch(): Promise<void> {
  const notifySetting: NotifySetting | null = props.notifySetting
  if (!notifySetting) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const topic: Topic | null = props.topic
  if (!topic) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const accountId = props.accountId
  if (!accountId) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) =>
        childForNotifySettingTopicUserDisp(
          notifySetting.key,
          topic.key,
          { string_id: accountId },
          pagingInfo,
        ),
      metaTablePagingInfo.value,
    )
    updateMetaTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleMetaSearch()
})

// -----------------------------------------------------------元数据表格-----------------------------------------------------------
const {
  currentPage: metaTableCurrentPage,
  pageSize: metaTablePageSize,
  itemCount: metaTableItemCount,
  items: metaTableItems,
  pagingInfo: metaTablePagingInfo,
  updateByLookup: updateMetaTableByLookup,
} = useIdentityBackendPagingTablePanel<DispMeta>(15)

function metaTableMetaIdFormatter(row: DispMeta): string {
  if (row.indicator !== null) {
    return row.indicator.label
  }
  return row.key.meta_id
}

function handleMetaTablePagingAttributeChanged(): void {
  handleMetaSearch()
}

function handleShowMetaMaintainDialog(row: DispMeta): void {
  showMetaMaintainDialog(row)
}

async function handleMetaDelete(row: DispMeta): Promise<void> {
  function parseMetaLabel(dispMeta: DispMeta): string {
    if (dispMeta.indicator !== null) {
      return dispMeta.indicator.label
    }
    return dispMeta.key.meta_id
  }

  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此元数据。<br>' + '该操作不可恢复！<br>' + '是否继续?',
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
      message: `元数据 ${parseMetaLabel(row)} 删除成功`,
      type: 'success',
    })
    handleMetaSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------元数据指示器选择对话框-----------------------------------------------------------
const metaIndicatorSelectDialogVisible = ref<boolean>(false)

async function handleMetaIndicatorSelectDialogConfirmed(selection: MetaIndicator[]): Promise<void> {
  const notifySetting: NotifySetting | null = props.notifySetting
  if (!notifySetting) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const topic: Topic | null = props.topic
  if (!topic) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const accountId = props.accountId
  if (!accountId) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const promises: Promise<unknown>[] = selection.map((s) =>
    resolveResponse(
      insert({
        key: {
          notify_setting_id: notifySetting.key.long_id,
          topic_id: topic.key.string_id,
          user_id: accountId,
          meta_id: s.key.meta_id,
        },
        value: s.default_value,
        remark: `更新时间: ${formatTimestamp(currentTimestamp())}`,
      }),
    ),
  )
  loading.value += 1
  try {
    await Promise.all(promises)
    ElMessage({
      showClose: true,
      message: '元数据创建成功',
      type: 'success',
    })
    metaIndicatorSelectDialogVisible.value = false
    handleMetaSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------元数据维护话框-----------------------------------------------------------
type MetaMaintainDialogItem = {
  key_notify_setting_id: string
  key_topic_id: string
  key_user_id: string
  key_meta_id: string
  value: string
  remark: string
  indicator: MetaIndicator
}

const {
  visible: metaMaintainDialogVisible,
  item: metaMaintainDialogItem,
  mode: metaMaintainDialogMode,
  showDialog: showMetaMaintainDialog,
} = useEditOnlyMaintainDialog<DispMeta, MetaMaintainDialogItem>(metaMaintainDialogItemMap, {
  key_notify_setting_id: '',
  key_topic_id: '',
  key_user_id: '',
  key_meta_id: '',
  value: '',
  remark: '',
  indicator: {
    key: {
      topic_id: '',
      meta_id: '',
    },
    label: '',
    remark: '',
    default_value: '',
  },
})
const metaMaintainDialogLoading = ref<number>(0)

function metaMaintainDialogItemMap(t: DispMeta): MetaMaintainDialogItem {
  return {
    key_notify_setting_id: t.key.notify_setting_id,
    key_topic_id: t.key.topic_id,
    key_user_id: t.key.user_id,
    key_meta_id: t.key.meta_id,
    value: t.value,
    remark: t.remark,
    indicator: t.indicator,
  }
}

async function handleMetaEdit(item: MetaMaintainDialogItem): Promise<void> {
  function parseMetaLabel(dispMeta: MetaMaintainDialogItem): string {
    if (dispMeta.indicator !== null) {
      return dispMeta.indicator.label
    }
    return dispMeta.key_meta_id
  }

  metaMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: {
          notify_setting_id: item.key_notify_setting_id,
          topic_id: item.key_topic_id,
          user_id: item.key_user_id,
          meta_id: item.key_meta_id,
        },
        value: item.value,
        remark: `更新时间: ${formatTimestamp(currentTimestamp())}`,
      }),
    )
    ElMessage({
      showClose: true,
      message: `元数据 ${parseMetaLabel(item)} 更新成功`,
      type: 'success',
    })
    metaMaintainDialogVisible.value = false
    handleMetaSearch()
  } finally {
    metaMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
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

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
