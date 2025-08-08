<template>
  <div class="fund-change-panel-container">
    <div class="center-panel-wrapper">
      <div class="placeholder" v-if="accountBook === null">请选择账本</div>
      <header-layout-panel class="center-panel" v-else v-loading="loading">
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowFundChangeCreateDialog"
            >
              记录资金变更
            </el-button>
            <el-button type="success" @click="handleSearch"> 刷新数据</el-button>
            <el-divider direction="vertical" />
            <el-select
              class="fund-change-type-selector"
              v-model="fundChangeTypeIndicatorSelectorValue"
              placeholder="资金变更类型"
              clearable
              @change="handleFundChangeSearch"
            >
              <el-option
                v-for="item in fundChangeTypeIndicators"
                :key="item.key.string_id"
                :label="item.label"
                :value="item.key.string_id"
              />
            </el-select>
            <el-divider direction="vertical" />
            <el-input
              class="remark-search-bar"
              v-model="fundChangeRemarkSearchBarValue"
              clearable
              @keydown.enter="handleFundChangeSearch"
              @clear="handleFundChangeSearch"
            >
              <template v-slot:prepend>
                <span>备注</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleSearch" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="fundChangeTableCurrentPage"
            v-model:page-size="fundChangeTablePageSize"
            :item-count="fundChangeTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="fundChangeTableItems"
            :show-contextmenu="true"
            @onPagingAttributeChanged="handleFundChangeTablePagingAttributeChanged"
            @onCurrentChanged="handleFundChangeTableCurrentChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="delta"
                label="变更金额"
                align="right"
                width="110px"
                show-overflow-tooltip
                :formatter="fundChangeTableDeltaFormatter"
              />
              <el-table-column
                prop="change_type"
                label="资金变更类型"
                width="120px"
                show-overflow-tooltip
                :formatter="fundChangeTableChangeTypeFormatter"
              />
              <el-table-column
                prop="happened_date"
                label="变更日期"
                width="180px"
                show-overflow-tooltip
                :formatter="fundChangeTableTimestampFormatter"
              />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
            <template v-slot:operateColumn="{ index, row }">
              <el-button-group class="operate-column">
                <el-button
                  class="table-button"
                  type="success"
                  :icon="SearchIcon"
                  @click="handleShowFundChangeInspectDialog(index, row as DispFundChange)"
                />
                <el-button
                  class="table-button"
                  type="primary"
                  :icon="EditPen"
                  :disabled="readonly"
                  @click="handleShowFundChangeEditDialog(index, row as DispFundChange)"
                />
                <el-button
                  class="table-button"
                  type="danger"
                  :icon="DeleteIcon"
                  :disabled="readonly"
                  @click="handleFundChangeDelete(index, row as DispFundChange)"
                />
              </el-button-group>
            </template>
            <template v-slot:contextmenu="{ index, row, close }">
              <ul class="my-contextmenu">
                <li @click="handleInspectMenuItemClicked(index, row as DispFundChange, close)">
                  查看...
                </li>
                <li
                  :class="{ disabled: readonly }"
                  @click="handleEditMenuItemClicked(index, row as DispFundChange, close, $event)"
                >
                  编辑...
                </li>
                <li
                  :class="{ disabled: readonly }"
                  @click="handleDeleteMenuItemClicked(index, row as DispFundChange, close, $event)"
                >
                  删除...
                </li>
              </ul>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      label-width="100px"
      create-title="记录"
      v-model:visible="fundChangeMaintainDialogVisible"
      :loading="fundChangeMaintainDialogLoading"
      :mode="fundChangeMaintainDialogMode"
      :item="fundChangeMaintainDialogItem"
      :create-rules="fundChangeMaintainDialogRules"
      :edit-rules="fundChangeMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleFundChangeRecord"
      @onItemEdit="handleFundChangeUpdate"
    >
      <div class="maintain-dialog-body-wrapper">
        <el-form-item label="变更金额" prop="delta">
          <el-input
            v-model="fundChangeMaintainDialogItem.delta"
            placeholder="请填变更金额"
            :readonly="fundChangeMaintainDialogMode === 'INSPECT'"
            @input="handleFundChangeMaintainDialogDeltaInput($event)"
          />
        </el-form-item>
        <el-form-item label="类型" prop="change_type">
          <el-input
            v-model="fundChangeMaintainDialogItem.formatted_change_type"
            readonly
            v-if="fundChangeMaintainDialogMode === 'INSPECT'"
          />
          <el-select
            class="fund-change-type-selector"
            v-else
            v-model="fundChangeMaintainDialogItem.change_type"
            placeholder="请选择"
          >
            <el-option
              v-for="item in fundChangeTypeIndicators"
              :key="item.key.string_id"
              :label="item.label"
              :value="item.key.string_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="fundChangeMaintainDialogItem.remark"
            :readonly="fundChangeMaintainDialogMode === 'INSPECT'"
          />
        </el-form-item>
        <el-form-item label="变更日期" prop="happened_date">
          <el-input
            v-model="fundChangeMaintainDialogItem.formatted_happened_date"
            readonly
            v-if="fundChangeMaintainDialogMode === 'INSPECT'"
          />
          <el-date-picker
            class="date-picker"
            v-else
            v-model="fundChangeMaintainDialogItem.happened_date"
            type="datetime"
            placeholder="请选择变更日期，不填写默认为当前时间"
            value-format="x"
            :shortcuts="fundChangeMaintainDialogShortcuts"
            :editable="true"
          />
        </el-form-item>
      </div>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { Search as SearchIcon, EditPen, Delete as DeleteIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { type FundChangeTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator.ts'
import { all as allFundChangeTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator.ts'
import { type DispFundChange } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange.ts'
import {
  childForAccountBookWithConditionDisplayDisp,
  record,
  update,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange.ts'
import { lookupAllToList, lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'FundChangePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountBook: DispAccountBook | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onCurrentChanged', current: DispFundChange | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------只读计算-----------------------------------------------------------
const readonly = computed<boolean>(() => {
  if (!props.accountBook) {
    return true
  }
  return props.accountBook.permission_level !== 0
})

// -----------------------------------------------------------资金变更类型-----------------------------------------------------------
const fundChangeTypeIndicators = ref<FundChangeTypeIndicator[]>([])

// -----------------------------------------------------------查询逻辑-----------------------------------------------------------
function handleSearch(): void {
  handleFundChangeTypeIndicatorSearch()
  handleFundChangeSearch()
}

function handleFundChangeTypeIndicatorSearch(): void {
  handleFundChangeTypeIndicatorAllSearch()
}

async function handleFundChangeTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    fundChangeTypeIndicators.value = await lookupAllToList((pagingInfo) =>
      allFundChangeTypeIndicator(pagingInfo),
    )
  } finally {
    loading.value -= 1
  }
}

function handleFundChangeSearch(): void {
  if (!props.accountBook) {
    return
  }
  handleFundChangeChildForAccountBookWithConditionDisplayDispSearch()
}

async function handleFundChangeChildForAccountBookWithConditionDisplayDispSearch(): Promise<void> {
  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loading.value += 1
  try {
    const _changeType: string = fundChangeTypeIndicatorSelectorValue.value ?? ''
    const _remarkPattern: string = fundChangeRemarkSearchBarValue.value
    const res = await lookupWithAdjustPage(
      (pagingInfo) =>
        childForAccountBookWithConditionDisplayDisp(
          _accountBook.key,
          _changeType,
          _remarkPattern,
          pagingInfo,
        ),
      fundChangeTablePagingInfo.value,
    )
    updateFundChangeTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.accountBook,
  () => {
    handleFundChangeSearch()
  },
)

onMounted(() => {
  handleSearch()
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const fundChangeTypeIndicatorSelectorValue = ref<string | null>(null)
const fundChangeRemarkSearchBarValue = ref<string>('')

function handleShowFundChangeCreateDialog(): void {
  showFundChangeCreateMaintainDialog()
}

// -----------------------------------------------------------资金变更表格处理-----------------------------------------------------------
const {
  currentPage: fundChangeTableCurrentPage,
  pageSize: fundChangeTablePageSize,
  itemCount: fundChangeTableItemCount,
  items: fundChangeTableItems,
  pagingInfo: fundChangeTablePagingInfo,
  updateByLookup: updateFundChangeTableByLookup,
} = useIdentityBackendPagingTablePanel<DispFundChange>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fundChangeTableDeltaFormatter(row: DispFundChange, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (row as any)[column.property].toFixed(2)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
function fundChangeTableChangeTypeFormatter(row: DispFundChange): string {
  if (row.type_indicator !== null) {
    return row.type_indicator.label
  }
  if (row.change_type !== '' || row.change_type !== null) {
    return '（未知）'
  }
  return '（未指定）'
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fundChangeTableTimestampFormatter(row: DispFundChange, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function handleFundChangeTablePagingAttributeChanged(): void {
  handleFundChangeSearch()
}

function handleFundChangeTableCurrentChanged(item: DispFundChange | null): void {
  emit('onCurrentChanged', item)
}

function handleInspectMenuItemClicked(
  _index: number,
  item: DispFundChange,
  close: () => void,
): void {
  close()
  handleShowFundChangeInspectDialog(_index, item)
}

function handleShowFundChangeInspectDialog(_index: number, item: DispFundChange): void {
  showFundChangeInspectMaintainDialog(item)
}

function handleEditMenuItemClicked(
  _index: number,
  item: DispFundChange,
  close: () => void,
  event: MouseEvent,
): void {
  if (readonly.value) {
    event.preventDefault()
    return
  }
  close()
  handleShowFundChangeEditDialog(_index, item)
}

function handleShowFundChangeEditDialog(_index: number, item: DispFundChange): void {
  showFundChangeEditMaintainDialog(item)
}

function handleDeleteMenuItemClicked(
  _index: number,
  item: DispFundChange,
  close: () => void,
  event: MouseEvent,
): void {
  if (readonly.value) {
    event.preventDefault()
    return
  }
  close()
  handleFundChangeDelete(_index, item)
}

async function handleFundChangeDelete(_index: number, item: DispFundChange): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此条资金变更记录。<br>是否继续?', '提示', {
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
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: '资金变更记录删除成功',
      type: 'success',
    })
    handleFundChangeSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------资金变更维护对话框-----------------------------------------------------------
type FundChangeMaintainDialogItem = {
  key_long_id: string
  delta: string
  change_type: string
  remark: string
  happened_date: number | null
  formatted_change_type: string
  formatted_happened_date: string
}

const {
  visible: fundChangeMaintainDialogVisible,
  item: fundChangeMaintainDialogItem,
  mode: fundChangeMaintainDialogMode,
  showCreateDialog: showFundChangeCreateMaintainDialog,
  showEditDialog: showFundChangeEditMaintainDialog,
  showInspectDialog: showFundChangeInspectMaintainDialog,
} = useGeneralMaintainDialog<DispFundChange, FundChangeMaintainDialogItem>(
  fundChangeMaintainDialogItemMap,
  {
    key_long_id: '',
    delta: '',
    change_type: '',
    remark: '',
    happened_date: null,
    formatted_change_type: '',
    formatted_happened_date: '',
  },
)
const fundChangeMaintainDialogLoading = ref<number>(0)
const fundChangeDeltaValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  if (value === '') {
    callback(new Error('变更金额不能为空'))
  } else if (value === '+' || value === '-') {
    callback(new Error('请输入有效的数字'))
  } else {
    callback()
  }
}
const fundChangeMaintainDialogRules = ref({
  delta: [{ required: true, validator: fundChangeDeltaValidator, trigger: 'blur' }],
  change_type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
})
const fundChangeMaintainDialogShortcuts = ref<{ text: string; value: Date | (() => Date) }[]>([
  {
    text: '一天前',
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: '两天前',
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 2)
      return date
    },
  },
  {
    text: '三天前',
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 3)
      return date
    },
  },
  {
    text: '四天前',
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 4)
      return date
    },
  },
  {
    text: '五天前',
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 5)
      return date
    },
  },
  {
    text: '一周前',
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
  {
    text: '两周前',
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7 * 2)
      return date
    },
  },
])

function handleFundChangeMaintainDialogDeltaInput(value: string): void {
  function limitInput(value: string): string {
    if (value === '' || value === null) {
      return ''
    }

    let lead: string = value.charAt(0)
    let val: string[]
    if (lead === '+' || lead === '-') {
      val = value.substring(1).split('')
    } else {
      lead = ''
      val = value.split('')
    }

    if (val.length === 0) {
      return lead
    }

    const reg1: RegExp = /\d/
    const reg2: RegExp = /\./

    // 第一个字符不能为小数点
    if (val[0] === '.') {
      return lead
    }
    // 过滤掉除数字和小数点外的字符
    val = val.filter((e) => reg1.test(e) || reg2.test(e))
    const val2: string[] | null = val.join('').match(/^\d*(\.?\d{0,2})/g)
    // 匹配小数点后只能有两位小数
    if (val2 === null) {
      return '0'
    }
    if (val2.length === 0) {
      return '0'
    }
    const tempResult: string = val2[0]

    // 设置最大值，不允许输入的余额超过此值。
    const maxValue: number = 999999999999.99
    if (parseFloat(tempResult) > maxValue) {
      return `${lead}${maxValue}`
    }
    return `${lead}${tempResult}`
  }

  fundChangeMaintainDialogItem.value.delta = limitInput(value)
}

function fundChangeMaintainDialogItemMap(t: DispFundChange): FundChangeMaintainDialogItem {
  let formatted_change_type: string
  if (t.type_indicator !== null) {
    formatted_change_type = t.type_indicator.label
  } else if (t.change_type !== '' || t.change_type !== null) {
    formatted_change_type = '（未知）'
  } else {
    formatted_change_type = '（未指定）'
  }
  return {
    key_long_id: t.key.long_id,
    delta: t.delta + '',
    change_type: t.change_type,
    remark: t.remark,
    happened_date: t.happened_date,
    formatted_change_type: formatted_change_type,
    formatted_happened_date: formatTimestamp(t.happened_date),
  }
}

async function handleFundChangeRecord(item: FundChangeMaintainDialogItem): Promise<void> {
  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  fundChangeMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      record({
        account_book_key: _accountBook.key,
        delta: parseFloat(item.delta),
        change_type: item.change_type,
        remark: item.remark,
        happened_date: item.happened_date,
      }),
    )
    ElMessage({
      showClose: true,
      message: '资金变更记录成功',
      type: 'success',
    })
    handleFundChangeSearch()
    fundChangeMaintainDialogVisible.value = false
  } finally {
    fundChangeMaintainDialogLoading.value -= 1
  }
}

async function handleFundChangeUpdate(item: FundChangeMaintainDialogItem): Promise<void> {
  fundChangeMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        fund_change_key: { long_id: item.key_long_id },
        delta: parseFloat(item.delta),
        change_type: item.change_type,
        remark: item.remark,
        happened_date: item.happened_date,
      }),
    )
    ElMessage({
      showClose: true,
      message: '资金变更更新成功',
      type: 'success',
    })
    handleFundChangeSearch()
    fundChangeMaintainDialogVisible.value = false
  } finally {
    fundChangeMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.fund-change-panel-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .fund-change-type-selector {
  width: 130px;
}

.header-container .remark-search-bar {
  width: 250px;
}

/*noinspection CssUnusedSymbol*/
.header-container .remark-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.center-panel-wrapper {
  width: 100%;
  height: 100%;
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

.table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.my-contextmenu {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.my-contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
  user-select: none;
}

.my-contextmenu li:hover {
  background: #eee;
}

.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}

.center-panel {
  width: 100%;
  height: 100%;
}

.maintain-dialog-body-wrapper :deep(.fund-change-type-selector) {
  width: 100%;
}

.maintain-dialog-body-wrapper :deep(.date-picker) {
  width: 100%;
}
</style>
