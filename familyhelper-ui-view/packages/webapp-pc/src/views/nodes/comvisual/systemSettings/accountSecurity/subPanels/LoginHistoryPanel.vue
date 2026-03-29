<template>
  <div class="login-history-panel-container">
    <placeholder-panel v-if="accountId === ''" text="请选择账号" />
    <div v-else class="main-container">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="success" @click="handleLoginHistorySearch">刷新数据</native-button>
            <span class="header-spacer" />
            <native-button
              v-if="mode === 'DEFAULT'"
              title="弹出"
              @click="handlePanelFloatyButtonClicked"
            >
              弹出
            </native-button>
          </div>
        </template>
        <template v-slot:default>
          <paging-table-panel
            class="table"
            v-model:current-page="loginHistoryTableCurrentPage"
            v-model:page-size="loginHistoryTablePageSize"
            :item-count="loginHistoryTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="loginHistoryTableItems"
            :operate-column-width="53"
            :inspect-button-visible="true"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :highlight-current-row="false"
            :row-key="loginHistoryRowKey"
            @on-paging-attribute-changed="handleLoginHistoryPagingAttributeChanged"
            @on-item-inspect="handleShowLoginHistoryInspectDialog"
          >
            <paging-table-column label="登录日期" :min-width="160">
              <template v-slot:default="{ row }">
                {{ formatTimestamp((row as LoginHistory).happened_date) }}
              </template>
            </paging-table-column>
            <paging-table-column label="登录响应" :min-width="120">
              <template v-slot:default="{ row }">
                {{ formatResponseCode((row as LoginHistory).response_code) }}
              </template>
            </paging-table-column>
            <paging-table-column label="消息" prop="message" :min-width="140" />
            <paging-table-column label="警报级别" prop="alarm_level" :min-width="100" />
            <paging-table-column label="登录备注" prop="login_remark" :min-width="120" />
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </div>
    <login-history-inspect-dialog
      v-model:visible="inspectDialogVisible"
      :login-history-id="inspectDialogLoginHistoryId"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import LoginHistoryInspectDialog from '../subDialogs/LoginHistoryInspectDialog.vue'

import {
  type LoginHistory,
  type LoginResponseCode,
  accountIdEquals,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/loginHistory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'LoginHistoryPanel',
})

// region Props 定义

type Props = {
  accountId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 登录历史搜索

async function handleLoginHistorySearch(): Promise<void> {
  if (!props.accountId) {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => accountIdEquals(props.accountId, pagingInfo),
      loginHistoryTablePagingInfo.value,
    )
    updateLoginHistoryTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.accountId,
  () => {
    handleLoginHistorySearch()
  },
)

onMounted(() => {
  handleLoginHistorySearch()
})

// endregion

// region 登录历史表格

const {
  currentPage: loginHistoryTableCurrentPage,
  pageSize: loginHistoryTablePageSize,
  itemCount: loginHistoryTableItemCount,
  items: loginHistoryTableItems,
  pagingInfo: loginHistoryTablePagingInfo,
  updateByLookup: updateLoginHistoryTableByLookup,
} = useIdentityBackendPagingTablePanel<LoginHistory>(15)

function loginHistoryRowKey(row: LoginHistory): string {
  return row.key.long_id
}

function handleLoginHistoryPagingAttributeChanged(): void {
  handleLoginHistorySearch()
}

function formatResponseCode(value: LoginResponseCode): string {
  switch (value) {
    case 0:
      return '通过'
    case 10:
      return '账号不存在'
    case 20:
      return '账号已禁用'
    case 30:
      return '密码错误'
    case 40:
      return '保护器禁止'
    case 50:
      return '保护器信息不存在'
    default:
      return '（未知）'
  }
}

// endregion

// region 查询对话框

const inspectDialogVisible = ref<boolean>(false)
const inspectDialogLoginHistoryId = ref<string>('')

function handleShowLoginHistoryInspectDialog(row: LoginHistory): void {
  inspectDialogLoginHistoryId.value = row.key.long_id
  inspectDialogVisible.value = true
}

// endregion
</script>

<style scoped>
.login-history-panel-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
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
  gap: 8px;
}

.header-spacer {
  flex: 1;
  min-width: 8px;
}

.table {
  min-height: 0;
}
</style>
