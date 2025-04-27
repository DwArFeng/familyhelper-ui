<template>
  <div class="login-history-panel-container">
    <div class="placeholder" v-if="accountId === ''">请选择账号</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleLoginHistorySearch">刷新数据</el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="item icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <table-panel
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
            @onPagingAttributeChanged="handleLoginHistoryPagingAttributeChanged"
            @onItemInspect="handleShowLoginHistoryInspectDialog"
          >
            <el-table-column
              prop="happened_date"
              label="登录日期"
              width="180px"
              show-overflow-tooltip
              :formatter="loginHistoryTableTimestampFormatter"
            />
            <el-table-column
              prop="response_code"
              label="登录响应"
              width="135px"
              show-overflow-tooltip
              :formatter="loginHistoryTableResponseCodeFormatter"
            />
            <el-table-column prop="message" label="消息" show-overflow-tooltip />
            <el-table-column
              prop="alarm_level"
              label="警报级别"
              width="85px"
              show-overflow-tooltip
            />
            <el-table-column prop="login_remark" label="登录备注" show-overflow-tooltip />
          </table-panel>
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

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import LoginHistoryInspectDialog from './LoginHistoryInspectDialog.vue'

import {
  type LoginHistory,
  type LoginHistoryResponseCode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginHistory.ts'
import { accountIdEquals } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginHistory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'LoginHistoryPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// -----------------------------------------------------------登录历史搜索-----------------------------------------------------------
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

// -----------------------------------------------------------登录历史表格-----------------------------------------------------------
const {
  currentPage: loginHistoryTableCurrentPage,
  pageSize: loginHistoryTablePageSize,
  itemCount: loginHistoryTableItemCount,
  items: loginHistoryTableItems,
  pagingInfo: loginHistoryTablePagingInfo,
  updateByLookup: updateLoginHistoryTableByLookup,
} = useIdentityBackendPagingTablePanel<LoginHistory>(15)

function handleLoginHistoryPagingAttributeChanged(): void {
  handleLoginHistorySearch()
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loginHistoryTableTimestampFormatter(row: LoginHistory, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loginHistoryTableResponseCodeFormatter(row: LoginHistory, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: LoginHistoryResponseCode = (row as any)[column.property] as LoginHistoryResponseCode
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

// -----------------------------------------------------------查询对话框-----------------------------------------------------------
const inspectDialogVisible = ref<boolean>(false)
const inspectDialogLoginHistoryId = ref<string>('')

function handleShowLoginHistoryInspectDialog(row: LoginHistory): void {
  inspectDialogLoginHistoryId.value = row.key.long_id
  inspectDialogVisible.value = true
}
</script>

<style scoped>
.login-history-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
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
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}
</style>
