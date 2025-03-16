<template>
  <div class="derive-history-panel-container">
    <div class="placeholder" v-if="accountId === ''">请选择账号</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleDeriveHistorySearch">刷新数据</el-button>
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
            :items="deriveHistoryItems"
            :operate-column-width="53"
            :inspect-button-visible="true"
            :edit-button-visible="false"
            :delete-button-visible="false"
            @onPagingAttributeChanged="handleDeriveHistoryPagingAttributeChanged"
            @onItemInspect="handleShowDeriveHistoryInspectDialog"
          >
            <el-table-column
              prop="happened_date"
              label="派生日期"
              width="180px"
              show-overflow-tooltip
              :formatter="deriveHistoryTableTimestampFormatter"
            />
            <el-table-column
              prop="response_code"
              label="派生响应"
              width="135px"
              show-overflow-tooltip
              :formatter="deriveHistoryTableResponseCodeFormatter"
            />
            <el-table-column prop="message" label="消息" show-overflow-tooltip />
            <el-table-column prop="derive_remark" label="派生备注" show-overflow-tooltip />
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

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import DeriveHistoryInspectDialog from './DeriveHistoryInspectDialog.vue'

import type {
  DeriveHistory,
  DeriveHistoryResponseCode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/deriveHistory.ts'
import { accountIdEquals } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/deriveHistory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'DeriveHistoryPanel',
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

// -----------------------------------------------------------派生历史搜索-----------------------------------------------------------
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

// -----------------------------------------------------------派生历史表格-----------------------------------------------------------
const {
  currentPage: deriveHistoryTableCurrentPage,
  pageSize: deriveHistoryTablePageSize,
  itemCount: deriveHistoryTableItemCount,
  items: deriveHistoryItems,
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
  const value: DeriveHistoryResponseCode = (row as any)[
    column.property
  ] as DeriveHistoryResponseCode
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

// -----------------------------------------------------------查询对话框-----------------------------------------------------------
const inspectDialogVisible = ref<boolean>(false)
const inspectDialogDeriveHistoryId = ref<string>('')

function handleShowDeriveHistoryInspectDialog(row: DeriveHistory): void {
  inspectDialogDeriveHistoryId.value = row.key.long_id
  inspectDialogVisible.value = true
}
</script>

<style scoped>
.derive-history-panel-container {
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
