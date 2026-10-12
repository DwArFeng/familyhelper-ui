<template>
  <div class="derive-history-panel-container">
    <placeholder-panel
      v-if="accountId === ''"
      :text="t('views.element_plus_engineering.system_settings.please_select_account')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleDeriveHistorySearch">{{
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
            v-model:current-page="deriveHistoryTableCurrentPage"
            v-model:page-size="deriveHistoryTablePageSize"
            :item-count="deriveHistoryTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="deriveHistoryTableItems"
            :operate-column-width="53"
            :inspect-button-visible="true"
            :edit-button-visible="false"
            :delete-button-visible="false"
            @onPagingAttributeChanged="handleDeriveHistoryPagingAttributeChanged"
            @onItemInspect="handleShowDeriveHistoryInspectDialog"
          >
            <el-table-column
              prop="happened_date"
              :label="t('views.element_plus_engineering.system_settings.derive_date')"
              width="180px"
              show-overflow-tooltip
              :formatter="deriveHistoryTableTimestampFormatter"
            />
            <el-table-column
              prop="response_code"
              :label="t('views.element_plus_engineering.system_settings.derive_response')"
              width="135px"
              show-overflow-tooltip
              :formatter="deriveHistoryTableResponseCodeFormatter"
            />
            <el-table-column
              prop="message"
              :label="t('views.element_plus_engineering.system_settings.message')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="derive_remark"
              :label="t('views.element_plus_engineering.system_settings.derive_remark')"
              show-overflow-tooltip
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <derive-history-inspect-dialog
      v-model:visible="inspectDialogVisible"
      :derive-history-id="inspectDialogDeriveHistoryId"
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

import DeriveHistoryInspectDialog from '@/views/nodes/elementPlusEngineering/systemSettings/accountSecurity/subDialogs/DeriveHistoryInspectDialog.vue'

import {
  type DeriveHistory,
  type DeriveResponseCode,
  accountIdEquals,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/deriveHistory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'DeriveHistoryPanel',
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

// region 派生历史搜索

async function handleDeriveHistorySearch(): Promise<void> {
  if (!props.accountId) {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => accountIdEquals(props.accountId, pagingInfo),
      deriveHistoryTablePagingInfo.value,
    )
    updateDeriveHistoryTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.accountId,
  () => {
    handleDeriveHistorySearch()
  },
)

onMounted(() => {
  handleDeriveHistorySearch()
})

// endregion

// region 派生历史表格

const {
  currentPage: deriveHistoryTableCurrentPage,
  pageSize: deriveHistoryTablePageSize,
  itemCount: deriveHistoryTableItemCount,
  items: deriveHistoryTableItems,
  pagingInfo: deriveHistoryTablePagingInfo,
  updateByLookup: updateDeriveHistoryTableByLookup,
} = useIdentityBackendPagingTablePanel<DeriveHistory>(15)

function handleDeriveHistoryPagingAttributeChanged(): void {
  handleDeriveHistorySearch()
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deriveHistoryTableTimestampFormatter(row: DeriveHistory, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deriveHistoryTableResponseCodeFormatter(row: DeriveHistory, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: DeriveResponseCode = (row as any)[column.property] as DeriveResponseCode
  switch (value) {
    case 0:
      return t('views.element_plus_engineering.system_settings.accepted')
    case 10:
      return t('views.element_plus_engineering.system_settings.login_state_not_found')
    case 15:
      return t('views.element_plus_engineering.system_settings.login_state_expired')
    case 20:
      return t('views.element_plus_engineering.system_settings.account_not_found')
    case 30:
      return t('views.element_plus_engineering.system_settings.account_disabled')
    case 40:
      return t('views.element_plus_engineering.system_settings.serial_version_mismatch')
    default:
      return t('views.element_plus_engineering.system_settings.unknown_parenthesized')
  }
}

// endregion

// region 查询对话框

const inspectDialogVisible = ref<boolean>(false)
const inspectDialogDeriveHistoryId = ref<string>('')

function handleShowDeriveHistoryInspectDialog(row: DeriveHistory): void {
  inspectDialogDeriveHistoryId.value = row.key.long_id
  inspectDialogVisible.value = true
}

// endregion
</script>

<style scoped>
.derive-history-panel-container {
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
