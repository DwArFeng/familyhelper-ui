<template>
  <div class="login-history-panel-container">
    <placeholder-panel
      v-if="accountId === ''"
      :text="t('views.element_plus_engineering.system_settings.please_select_account')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleLoginHistorySearch">{{
              t('views.element_plus_engineering.system_settings.refresh_data')
            }}</el-button>
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
              :label="t('views.element_plus_engineering.system_settings.login_date')"
              width="180px"
              show-overflow-tooltip
              :formatter="loginHistoryTableTimestampFormatter"
            />
            <el-table-column
              prop="response_code"
              :label="t('views.element_plus_engineering.system_settings.login_response')"
              width="135px"
              show-overflow-tooltip
              :formatter="loginHistoryTableResponseCodeFormatter"
            />
            <el-table-column
              prop="message"
              :label="t('views.element_plus_engineering.system_settings.message')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="alarm_level"
              :label="t('views.element_plus_engineering.system_settings.alarm_level')"
              width="85px"
              show-overflow-tooltip
            />
            <el-table-column
              prop="login_remark"
              :label="t('views.element_plus_engineering.system_settings.login_remark')"
              show-overflow-tooltip
            />
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

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import LoginHistoryInspectDialog from '@/views/nodes/elementPlusEngineering/systemSettings/accountSecurity/subDialogs/LoginHistoryInspectDialog.vue'

import {
  type LoginHistory,
  type LoginResponseCode,
  accountIdEquals,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/loginHistory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

import { useI18n } from 'vue-i18n'

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

// region I18n 引入

const { t } = useI18n()

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
  const value: LoginResponseCode = (row as any)[column.property] as LoginResponseCode
  switch (value) {
    case 0:
      return t('views.element_plus_engineering.system_settings.accepted')
    case 10:
      return t('views.element_plus_engineering.system_settings.account_not_found')
    case 20:
      return t('views.element_plus_engineering.system_settings.account_is_disabled')
    case 30:
      return t('views.element_plus_engineering.system_settings.incorrect_password')
    case 40:
      return t('views.element_plus_engineering.system_settings.protector_disabled')
    case 50:
      return t('views.element_plus_engineering.system_settings.protector_information_not_found')
    default:
      return t('views.element_plus_engineering.system_settings.unknown_parenthesized')
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
