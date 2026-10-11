<template>
  <div class="iahn-message-settings-panel">
    <loading-overlay :loading="loading > 0" />
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="primary" @click="handleShowMekCreateDialog"
            >新增文本键</native-button
          >
          <native-button kind="success" @click="handleRefresh">刷新</native-button>
          <native-select
            v-model="localeFilter"
            class="locale-selector"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :options="localeOptions"
            placeholder="地区过滤"
          />
          <input v-model="mekFilter" class="mek-filter" type="search" placeholder="文本键过滤" />
        </div>
      </template>
      <template v-slot:default>
        <paging-table-panel
          v-model:current-page="tableCurrentPage"
          v-model:page-size="tablePageSize"
          :item-count="tableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="tableItems"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="90"
          :row-key="messageRowKey"
          @on-paging-attribute-changed="handleTablePagingAttributeChanged"
        >
          <paging-table-column label="文本键" prop="mek_id" :min-width="220">
            <template v-slot:default="{ row }">
              <span class="ellipsis">{{ row.mek_id }}</span>
            </template>
          </paging-table-column>
          <paging-table-column label="标签" prop="label" :min-width="160" />
          <paging-table-column label="默认文本" prop="default_message" :min-width="200" />
          <paging-table-column
            v-for="column in displayedColumns"
            :key="column.locale"
            :label="column.label + '(' + column.locale + ')'"
            :width="150"
            :min-width="130"
          >
            <template v-slot:header>
              <span class="ellipsis">{{ column.label }}({{ column.locale }})</span>
            </template>
            <template v-slot:default="{ row }">
              <div class="message-cell">
                <span class="ellipsis" @dblclick="handleCellEdit(row as MessageRow, column)">
                  {{ row.row_datas[column.sourceIndex]?.message ?? '' }}
                </span>
                <native-link type="primary" @click="handleCellEdit(row as MessageRow, column)"
                  >编辑</native-link
                >
              </div>
            </template>
          </paging-table-column>
          <template v-slot:operateColumn="{ row }">
            <native-link type="danger" @click="handleDeleteMek(row as MessageRow)"
              >删除</native-link
            >
          </template>
        </paging-table-panel>
      </template>
    </header-layout-panel>

    <maintain-dialog
      v-model:visible="mekCreateDialogVisible"
      create-title="新增文本键"
      create-confirm-button-label="保存"
      label-width="75px"
      :loading="maintainLoading > 0"
      :mode="mekCreateDialogMode"
      :item="mekCreateDialogItem"
      :close-on-click-modal="false"
      @on-item-create="handleMekCreate"
    >
      <native-form-item label="文本键">
        <input v-model="mekCreateDialogItem.mek_id" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item label="标签">
        <input v-model="mekCreateDialogItem.label" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item label="默认文本">
        <input v-model="mekCreateDialogItem.default_message" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item label="备注">
        <input v-model="mekCreateDialogItem.remark" class="dialog-input" type="text" />
      </native-form-item>
    </maintain-dialog>

    <maintain-dialog
      v-model:visible="messageEditDialogVisible"
      edit-title="编辑消息"
      edit-confirm-button-label="保存"
      label-width="65px"
      :loading="maintainLoading > 0"
      :mode="messageEditDialogMode"
      :item="messageEditDialogItem"
      :close-on-click-modal="false"
      :width="720"
      @on-item-edit="handleMessageEdit"
    >
      <native-form-item label="地区">
        <input :value="messageEditLocale" class="dialog-input" type="text" readonly />
      </native-form-item>
      <native-form-item label="文本键">
        <input :value="messageEditMekId" class="dialog-input" type="text" readonly />
      </native-form-item>
      <native-form-item label="消息" class="message-editor-item">
        <text-editor v-model="messageEditDialogItem.message" height="360px" />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'
import NativeSelect from '@/components/comvisual/form/nativeSelect/NativeSelect.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import TextEditor from '@/components/comvisual/text/textEditor/TextEditor.vue'
import {
  useCreateOnlyMaintainDialog,
  useEditOnlyMaintainDialog,
} from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'
import {
  confirmAction,
  notifyError,
  notifySuccess,
  notifyWarning,
} from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  type IahnNodeMessageTableInspectResult,
  type IahnNodeMessageTableInspectResultColumn,
  type IahnNodeMessageTableInspectResultRow,
  inspectMessageTable,
  putMek,
  removeMek,
  upsertMessage,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/iahnNode.ts'
import { formatLocale } from '@dwarfeng/familyhelper-ui-component-util/src/util/i18n.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'IahnMessageSettingsPanel',
})

// region 配置仓库常量

const SETTINGREPO_CATEGORY = 'public$framework.pc.iahn'
const SETTINGREPO_ARGS_REPO: string[] = ['repo']

// endregion

// region 类型与对话框

type MessageRow = IahnNodeMessageTableInspectResultRow

type MessageColumn = IahnNodeMessageTableInspectResultColumn & {
  locale: string
  sourceIndex: number
}

type MekMaintainItem = {
  mek_id: string
  label: string
  default_message: string
  remark: string
}

type MessageEditContext = {
  row: MessageRow
  column: MessageColumn
}

type MessageEditItem = {
  message: string
}

const INITIAL_MEK_ITEM: MekMaintainItem = {
  mek_id: '',
  label: '',
  default_message: '',
  remark: '',
}

const {
  visible: mekCreateDialogVisible,
  item: mekCreateDialogItem,
  mode: mekCreateDialogMode,
  showDialog: showMekCreateDialog,
} = useCreateOnlyMaintainDialog<MekMaintainItem>({ ...INITIAL_MEK_ITEM })

const {
  visible: messageEditDialogVisible,
  item: messageEditDialogItem,
  mode: messageEditDialogMode,
  showDialog: showMessageEditDialog,
} = useEditOnlyMaintainDialog<MessageEditContext, MessageEditItem>(
  (context) => ({
    message: context.row.row_datas[context.column.sourceIndex]?.message ?? '',
  }),
  { message: '' },
)

const messageEditContext = ref<MessageEditContext | null>(null)
const messageEditLocale = computed(() => messageEditContext.value?.column.locale ?? '')
const messageEditMekId = computed(() => messageEditContext.value?.row.mek_id ?? '')

// endregion

// region 状态与过滤

const loading = ref(0)
const maintainLoading = ref(0)
const messageTable = ref<IahnNodeMessageTableInspectResult | null>(null)
const localeFilter = ref<string[]>([])
const mekFilter = ref('')
const allRows = ref<MessageRow[]>([])

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  updateByLookup: updateTableByLookup,
  refreshPaging: refreshTablePaging,
} = useIdentityFrontendPagingTablePanel<MessageRow>(15)

const localeOptions = computed(() => {
  if (!messageTable.value) {
    return []
  }
  return messageTable.value.columns.map((column) => ({
    label: column.label + '(' + formatLocale(column.language, column.country, column.variant) + ')',
    value: formatLocale(column.language, column.country, column.variant),
  }))
})

const displayedColumns = computed<MessageColumn[]>(() => {
  if (!messageTable.value) {
    return []
  }
  const selected = new Set(localeFilter.value)
  return messageTable.value.columns
    .map((column, sourceIndex) => ({
      ...column,
      locale: formatLocale(column.language, column.country, column.variant),
      sourceIndex,
    }))
    .filter((column) => selected.size === 0 || selected.has(column.locale))
})

const filteredRows = computed(() => {
  const keyword = mekFilter.value.trim()
  if (keyword === '') {
    return allRows.value
  }
  return allRows.value.filter((row) => row.mek_id.includes(keyword))
})

watch(
  () => filteredRows.value,
  () => {
    updateTableByLookup(filteredRows.value)
    refreshTablePaging()
  },
  { deep: true },
)

// endregion

// region 加载逻辑

async function handleRefresh(): Promise<void> {
  loading.value += 1
  try {
    const result = await resolveResponse(
      inspectMessageTable({
        category: SETTINGREPO_CATEGORY,
        args: [...SETTINGREPO_ARGS_REPO],
      }),
    )
    messageTable.value = result
    allRows.value = result?.rows ?? []
    updateTableByLookup(allRows.value)
    refreshTablePaging()
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '消息仓库加载失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 文本键维护

function handleShowMekCreateDialog(): void {
  showMekCreateDialog()
}

async function handleMekCreate(item: MekMaintainItem): Promise<void> {
  const mekId = item.mek_id.trim()
  const label = item.label.trim()
  if (mekId === '' || label === '') {
    notifyWarning('文本键和标签不能为空')
    return
  }
  if (allRows.value.some((row) => row.mek_id === mekId)) {
    notifyWarning('文本键已经存在')
    return
  }
  maintainLoading.value += 1
  try {
    await resolveResponse(
      putMek({
        category: SETTINGREPO_CATEGORY,
        args: [...SETTINGREPO_ARGS_REPO],
        mek_id: mekId,
        label,
        default_message: item.default_message,
        remark: item.remark,
      }),
    )
    mekCreateDialogVisible.value = false
    await handleRefresh()
    notifySuccess('文本键 ' + mekId + ' 保存成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '文本键保存失败')
  } finally {
    maintainLoading.value -= 1
  }
}

async function handleDeleteMek(row: MessageRow): Promise<void> {
  if (!confirmAction('是否永久删除文本键 ' + row.mek_id + '？')) {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      removeMek({
        category: SETTINGREPO_CATEGORY,
        args: [...SETTINGREPO_ARGS_REPO],
        mek_id: row.mek_id,
      }),
    )
    await handleRefresh()
    notifySuccess('文本键 ' + row.mek_id + ' 删除成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '文本键删除失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 消息编辑

function handleCellEdit(row: MessageRow, column: MessageColumn): void {
  messageEditContext.value = { row, column }
  showMessageEditDialog({ row, column })
}

async function handleMessageEdit(item: MessageEditItem): Promise<void> {
  const context = messageEditContext.value
  if (!context) {
    notifyError('消息编辑上下文不存在，请刷新后重试')
    return
  }
  maintainLoading.value += 1
  try {
    await resolveResponse(
      upsertMessage({
        category: SETTINGREPO_CATEGORY,
        args: [...SETTINGREPO_ARGS_REPO],
        language: context.column.language,
        country: context.column.country,
        variant: context.column.variant,
        mek_id: context.row.mek_id,
        message: item.message,
      }),
    )
    messageEditDialogVisible.value = false
    await handleRefresh()
    notifySuccess('消息更新成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '消息更新失败')
  } finally {
    maintainLoading.value -= 1
  }
}

// endregion

// region 事件与生命周期

function messageRowKey(row: MessageRow): string {
  return row.mek_id
}

function handleTablePagingAttributeChanged(): void {
  refreshTablePaging()
}

onMounted(() => {
  void handleRefresh()
})

defineExpose({
  refresh: handleRefresh,
})

// endregion
</script>

<style scoped>
.iahn-message-settings-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.header-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.locale-selector {
  width: 280px;
}

.mek-filter {
  width: 260px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.message-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ellipsis {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.message-editor-item :deep(.native-form-item__content) {
  height: 390px;
}
</style>
