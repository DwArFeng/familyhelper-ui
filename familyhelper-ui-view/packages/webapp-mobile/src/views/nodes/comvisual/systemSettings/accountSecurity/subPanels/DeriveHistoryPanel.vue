<template>
  <div class="derive-history-panel-container">
    <placeholder-panel v-if="accountId === ''" text="请选择账号" />
    <div v-else class="main-container">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="success" @click="handleDeriveHistorySearch"
              >刷新数据</native-button
            >
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
            v-model:current-page="deriveHistoryTableCurrentPage"
            v-model:page-size="deriveHistoryTablePageSize"
            :item-count="deriveHistoryTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="deriveHistoryTableItems"
            :operate-column-width="53"
            :inspect-button-visible="true"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :highlight-current-row="false"
            :row-key="deriveHistoryRowKey"
            @on-paging-attribute-changed="handleDeriveHistoryPagingAttributeChanged"
            @on-item-inspect="handleShowDeriveHistoryInspectDialog"
          >
            <paging-table-column label="派生日期" :min-width="160">
              <template v-slot:default="{ row }">
                {{ formatTimestamp((row as DeriveHistory).happened_date) }}
              </template>
            </paging-table-column>
            <paging-table-column label="派生响应" :min-width="120">
              <template v-slot:default="{ row }">
                {{ formatDeriveResponseCode((row as DeriveHistory).response_code) }}
              </template>
            </paging-table-column>
            <paging-table-column label="消息" prop="message" :min-width="140" />
            <paging-table-column label="派生备注" prop="derive_remark" :min-width="120" />
          </paging-table-panel>
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

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import DeriveHistoryInspectDialog from '../subDialogs/DeriveHistoryInspectDialog.vue'

import {
  type DeriveHistory,
  type DeriveResponseCode,
  accountIdEquals,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/deriveHistory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

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

function deriveHistoryRowKey(row: DeriveHistory): string {
  return row.key.long_id
}

function handleDeriveHistoryPagingAttributeChanged(): void {
  handleDeriveHistorySearch()
}

function formatDeriveResponseCode(value: DeriveResponseCode): string {
  switch (value) {
    case 0:
      return '通过'
    case 10:
      return '登录状态不存在'
    case 15:
      return '登录状态过期'
    case 20:
      return '账号不存在'
    case 30:
      return '账号禁用'
    case 40:
      return '序列号版本不一致'
    default:
      return '（未知）'
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
