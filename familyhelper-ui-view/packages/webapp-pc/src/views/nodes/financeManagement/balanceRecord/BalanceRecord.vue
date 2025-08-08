<template>
  <div class="balance-record-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" :disabled="readonly" @click="handleRecordCommit">
            提交记录
          </el-button>
          <el-button type="danger" :disabled="readonly" @click="handleRollbackAll">
            撤销记录
          </el-button>
          <el-button type="success" @click="handleBankCardSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <account-book-indicator
            mode="BALANCE_RECORD"
            @onChanged="handleBankCardIndicatorChanged"
          />
        </div>
      </template>
      <template v-slot:default>
        <div class="placeholder" v-show="!accountBookIndicatorValue">请选择账本</div>
        <card-panel
          class="card-panel"
          v-show="accountBookIndicatorValue"
          v-loading="bankCardCardLoading"
          ref="cardPanelRef"
          title-field="name"
          card-width="calc(20% - 18px)"
          tabindex="0"
          :items="bankCardCardItems"
          :max-card="bankCardCardMaxCard"
          :show-contextmenu="true"
          :contextmenu-width="120"
          :add-button-visible="false"
          @onItemToEdit="handleShowRecordDialog"
          @keydown.ctrl.enter="handleBankCardCardHotKeyDown"
        >
          <template v-slot:default="{ item }">
            <!--suppress JSUnresolvedVariable -->
            <corner-light-panel
              class="balance-record-card-wrapper"
              light-bevel-edge="80px"
              light-color="#E6A23C"
              :show-south-east="item.temp_flag"
            >
              <div class="balance-record-card-container">
                <div class="balance-record-property">
                  <span class="iconfont balance-record-property-icon" style="color: black">
                    &#xffee;
                  </span>
                  <!--suppress JSUnresolvedVariable -->
                  <div class="balance-record-property-text">
                    <span>类型: </span>
                    <el-tooltip
                      effect="dark"
                      placement="right"
                      :content="(item as BankCardCardItem).formatted_type.remark"
                      :open-delay="500"
                    >
                      <span>{{ (item as BankCardCardItem).formatted_type.label }}</span>
                    </el-tooltip>
                  </div>
                </div>
                <div class="balance-record-property">
                  <span class="iconfont balance-record-property-icon" style="color: black">
                    &#xfff9;
                  </span>
                  <!--suppress JSUnresolvedVariable -->
                  <div class="balance-record-property-text">
                    <div>
                      <!--suppress JSUnresolvedVariable -->
                      <div v-if="item.temp_flag">
                        <!--suppress JSUnresolvedVariable -->
                        <el-tooltip
                          effect="dark"
                          placement="right"
                          :content="'原余额：' + (item as BankCardCardItem).balance_value"
                          :open-delay="500"
                        >
                          <!--suppress JSUnresolvedVariable -->
                          <span> 余额: {{ (item as BankCardCardItem).temp_balance_value }} </span>
                        </el-tooltip>
                      </div>
                      <!--suppress JSUnresolvedVariable -->
                      <span v-else> 余额: {{ (item as BankCardCardItem).balance_value }} </span>
                    </div>
                  </div>
                </div>
                <div class="balance-record-property">
                  <span class="iconfont balance-record-property-icon" style="color: black">
                    &#xffef;
                  </span>
                  <!--suppress JSUnresolvedVariable -->
                  <div class="balance-record-property-text">
                    <div>
                      <!--suppress JSUnresolvedVariable -->
                      <div v-if="item.temp_flag">
                        <!--suppress JSUnresolvedVariable -->
                        <el-tooltip
                          effect="dark"
                          placement="right"
                          :content="
                            '原记录日期：' + (item as BankCardCardItem).formatted_last_recorded_date
                          "
                          :open-delay="500"
                        >
                          <!--suppress JSUnresolvedVariable -->
                          <span>
                            记录日期:
                            {{ (item as BankCardCardItem).formatted_temp_last_recorded_date }}
                          </span>
                        </el-tooltip>
                      </div>
                      <!--suppress JSUnresolvedVariable -->
                      <span v-else>
                        记录日期: {{ (item as BankCardCardItem).formatted_last_recorded_date }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="balance-record-property">
                  <span class="iconfont balance-record-property-icon" style="color: black">
                    &#xffed;
                  </span>
                  <!--suppress JSUnresolvedVariable -->
                  <span class="balance-record-property-text">
                    提交状态: {{ item.temp_flag ? '待提交' : '未更改' }}
                  </span>
                </div>
              </div>
            </corner-light-panel>
          </template>
          <template v-slot:header="{ index, item }">
            <el-button-group class="balance-record-control-button-group">
              <el-tooltip
                effect="dark"
                placement="top"
                content="记录余额"
                :open-delay="500"
                :disabled="readonly"
              >
                <el-button
                  class="card-button"
                  :icon="EditPen"
                  :disabled="readonly"
                  @click="handleShowRecordDialog(index, item)"
                />
              </el-tooltip>
              <el-tooltip
                effect="dark"
                placement="top"
                content="撤销记录"
                :open-delay="500"
                :disabled="readonly"
              >
                <el-button
                  class="card-button"
                  type="danger"
                  :icon="RefreshLeft"
                  :disabled="readonly"
                  @click="handleBankCardRollback(index, item)"
                />
              </el-tooltip>
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ index, item, close }">
            <ul class="contextmenu">
              <!--suppress JSUnresolvedVariable -->
              <li
                :class="{ disabled: readonly }"
                @click="handleRecordMenuItemClicked(index, item, close, $event)"
              >
                记录余额...
              </li>
              <!--suppress JSUnresolvedVariable -->
              <li
                :class="{ disabled: readonly }"
                @click="handleRollbackMenuItemClicked(index, item, close, $event)"
              >
                撤销记录
              </li>
            </ul>
          </template>
        </card-panel>
      </template>
    </border-layout-panel>
    <el-dialog
      class="record-dialog-container"
      v-model="recordDialogVisible"
      ref="dialog"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="输入余额"
      top="6vh"
      width="80%"
      :close-on-click-modal="false"
      @keydown.ctrl.enter="handleRecordDialogHotKeyDown"
    >
      <el-form
        v-loading="recordDialogLoading"
        ref="recordFormRef"
        label-width="80px"
        :model="recordDialogItem"
        :rules="recordDialogRules"
        :validate-on-rule-change="false"
        @submit.prevent
      >
        <el-form-item label="新余额" prop="balance">
          <div class="record-dialog-input-wrapper">
            <el-input
              v-model="recordDialogItem.balance"
              placeholder="请填写余额"
              @input="handleRecordBalanceInput($event)"
            />
            <el-divider class="record-dialog-input-divider" direction="vertical" />
            <el-input
              v-model="recordDialogItem.formatted_balance"
              placeholder="此处显示大写余额"
              readonly
            />
          </div>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <div class="footer-container">
          <el-button
            type="primary"
            :disabled="recordDialogLoading > 0"
            @click="handleBankCardToRecord"
            >确定
          </el-button>
          <el-button :disabled="recordDialogLoading > 0" @click="handleBankCardToCancel"
            >取消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { type FormItemRule } from 'element-plus'
import { ElMessageBox, ElMessage, ElForm } from 'element-plus'

import { EditPen, RefreshLeft } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import CardPanel from '@/components/card/cardPanel/CardPanel.vue'
import CornerLightPanel from '@/components/layout/cornerLightPanel/CornerLightPanel.vue'

import { useGeneralCardPanel } from '@/components/card/cardPanel/composables.ts'

import AccountBookIndicator from '@/views/nodes/financeManagement/accountBook/AccountBookIndicator.vue'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import {
  recordCommit,
  rollbackAll,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { type DispBankCard } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCard.ts'
import {
  childForAccountBookDisp,
  recordBalance,
  rollbackBalance,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCard.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'BalanceRecord',
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const accountBookIndicatorValue = ref<DispAccountBook | null>(null)

function handleBankCardIndicatorChanged(value: DispAccountBook | null): void {
  accountBookIndicatorValue.value = value
  handleBankCardSearch()
}

async function handleRecordCommit(): Promise<void> {
  const _accountBook: DispAccountBook | null = accountBookIndicatorValue.value
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  try {
    await ElMessageBox.confirm(
      `此操作将提交账本 ${_accountBook.name} 下的所有银行卡记录。<br>是否继续?`,
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
  bankCardCardLoading.value += 1
  try {
    await resolveResponse(recordCommit(_accountBook.key))
    ElMessage({
      showClose: true,
      message: `账本 ${_accountBook.name} 提交成功`,
      type: 'success',
    })
    handleBankCardSearch()
  } finally {
    bankCardCardLoading.value -= 1
  }
}

async function handleRollbackAll(): Promise<void> {
  const _accountBook: DispAccountBook | null = accountBookIndicatorValue.value
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  try {
    await ElMessageBox.confirm(
      `此操作将回滚账本 ${_accountBook.name} 下的所有银行卡记录。<br>是否继续?`,
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
  bankCardCardLoading.value += 1
  try {
    await resolveResponse(rollbackAll(_accountBook.key))
    ElMessage({
      showClose: true,
      message: `账本 ${_accountBook.name} 回滚成功`,
      type: 'success',
    })
    handleBankCardSearch()
  } finally {
    bankCardCardLoading.value -= 1
  }
}

// -----------------------------------------------------------只读计算-----------------------------------------------------------
const readonly = computed<boolean>(() => {
  if (!accountBookIndicatorValue.value) {
    return true
  }
  // noinspection JSUnresolvedVariable
  return accountBookIndicatorValue.value.permission_level !== 0
})

// -----------------------------------------------------------查询逻辑-----------------------------------------------------------
function handleBankCardSearch(): void {
  if (!accountBookIndicatorValue.value) {
    return
  }
  handleBankCardChildForAccountBookSearch()
}

async function handleBankCardChildForAccountBookSearch(): Promise<void> {
  const _accountBook: DispAccountBook | null = accountBookIndicatorValue.value
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  bankCardCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) =>
      childForAccountBookDisp(_accountBook.key, pagingInfo),
    )
    updateBankCardCardByLookup(res)
  } finally {
    bankCardCardLoading.value -= 1
  }
}

onMounted(() => {
  handleBankCardSearch()
})

// -----------------------------------------------------------金额转换-----------------------------------------------------------
function convertCurrency(value: string): string {
  if (value === '-') {
    return ''
  }

  let lead: string
  let absoluteValue: string
  if (value.substring(0, 1) === '-') {
    lead = '负'
    absoluteValue = value.substring(1)
  } else {
    lead = ''
    absoluteValue = value
  }

  const maxValue: number = 999999999999.99
  if (parseFloat(absoluteValue) > maxValue) {
    throw new Error(`参数 value 的绝对值超过解析范围: value=${value}, maxValue=${maxValue}`)
  }

  let n: string = absoluteValue

  if (n === '') {
    return ''
  }
  if (n.charAt(n.length - 1) === '.') {
    n = n.substring(0, n.length - 1)
  }

  let unit: string = '千佰拾亿千佰拾万千佰拾元角分'
  let str: string = ''

  const indexPoint: number = n.indexOf('.') // 如果是小数，截取小数点前面的位数

  if (indexPoint >= 0) {
    // 去除小数点，并转化为定点数（*100）。
    const integerPart = n.substring(0, indexPoint)
    let decimalPart = n.substring(indexPoint + 1, n.length)
    if (decimalPart.length === 1) {
      decimalPart += '0'
    }
    n = integerPart + decimalPart
  } else {
    n += '00'
  }

  unit = unit.substring(unit.length - n.length) // 若为整数，截取需要使用的unit单位
  for (let i = 0; i < n.length; i += 1) {
    // noinspection JSCheckFunctionSignatures
    str += '零壹贰叁肆伍陆柒捌玖'.charAt(parseInt(n.charAt(i))) + unit.charAt(i) // 遍历转化为大写的数字
  }

  // noinspection RegExpSingleCharAlternation
  return (
    lead +
    str
      .replace(/零(千|佰|拾|角)/g, '零')
      .replace(/(零)+/g, '零')
      .replace(/零(万|亿|元)/g, '$1')
      .replace(/(亿)万|壹(拾)/g, '$1$2')
      .replace(/^元零?|零分/g, '')
      .replace(/元$/g, '元整')
  )
}

// -----------------------------------------------------------银行卡卡片-----------------------------------------------------------
type BankCardCardItem = {
  name: string
  formatted_type: { label: string; remark: string }
  balance_value: number
  formatted_last_recorded_date: string
  temp_flag: boolean
  formatted_temp_last_recorded_date: string
  temp_balance_value: number
  bank_card: DispBankCard
}

const { items: bankCardCardItems, updateByLookup: updateBankCardCardByLookup } =
  useGeneralCardPanel<DispBankCard, BankCardCardItem>(bankCardCardItemMap)
const bankCardCardLoading = ref<number>(0)
const bankCardCardMaxCard = ref<number>(1000)

const cardPanelRef = useTemplateRef<ComponentExposed<typeof CardPanel>>('cardPanelRef')

function bankCardCardItemMap(t: DispBankCard): BankCardCardItem {
  function cardTypeLabel(t: DispBankCard): { label: string; remark: string } {
    // noinspection JSUnresolvedVariable
    if (t.type_indicator !== null) {
      // noinspection JSUnresolvedVariable
      return {
        label: t.type_indicator.label,
        remark: t.type_indicator.remark,
      }
    }
    if (t.card_type !== '' || t.card_type !== null) {
      return {
        label: '（未知）',
        remark: '该银行卡类型经过维护，但是类型已经被删除',
      }
    }
    return {
      label: '（未指定）',
      remark: '该银行卡未指定类型',
    }
  }

  return {
    name: t.name,
    formatted_type: cardTypeLabel(t),
    balance_value: t.balance_value,
    formatted_last_recorded_date: formatTimestamp(t.last_recorded_date ?? 0),
    temp_flag: t.temp_flag,
    formatted_temp_last_recorded_date: formatTimestamp(t.temp_last_recorded_date ?? 0),
    temp_balance_value: t.temp_balance_value,
    bank_card: t,
  }
}

function handleBankCardCardHotKeyDown(): void {
  if (!accountBookIndicatorValue.value) {
    return
  }
  handleRecordCommit()
}

function handleRecordMenuItemClicked(
  _index: number,
  item: BankCardCardItem,
  close: () => void,
  event: MouseEvent,
): void {
  if (readonly.value) {
    event.preventDefault()
    return
  }
  close()
  handleShowRecordDialog(_index, item)
}

function handleShowRecordDialog(_index: number, item: BankCardCardItem): void {
  let templateBalance: string = item.temp_flag
    ? `${item.temp_balance_value}`
    : `${item.balance_value}`
  if (templateBalance === '0') {
    templateBalance = ''
  }
  recordDialogItem.value = {
    key_long_id: item.bank_card.key.long_id,
    name: item.name,
    balance: templateBalance,
    formatted_balance: convertCurrency(templateBalance),
  }
  recordDialogVisible.value = true
}

function handleRollbackMenuItemClicked(
  _index: number,
  item: BankCardCardItem,
  close: () => void,
  event: MouseEvent,
): void {
  if (readonly.value) {
    event.preventDefault()
    return
  }
  close()
  handleBankCardRollback(_index, item)
}

async function handleBankCardRollback(_index: number, item: BankCardCardItem): Promise<void> {
  try {
    await ElMessageBox.alert(`此操作撤销银行卡 ${item.name} 所记录的余额。<br>是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  bankCardCardLoading.value += 1
  try {
    await resolveResponse(rollbackBalance(item.bank_card.key))
    ElMessage({
      showClose: true,
      message: `账本 ${item.name} 记录撤销成功`,
      type: 'success',
    })
    handleBankCardSearch()
  } finally {
    bankCardCardLoading.value -= 1
  }
}

// -----------------------------------------------------------记录对话框-----------------------------------------------------------
type RecordDialogItem = {
  key_long_id: string
  name: string
  balance: string
  formatted_balance: string
}

const recordDialogVisible = ref<boolean>(false)
const recordDialogLoading = ref<number>(0)
const recordDialogItem = ref<RecordDialogItem>({
  key_long_id: '',
  name: '',
  balance: '',
  formatted_balance: '',
})
const recordDialogDeltaValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  if (value === '') {
    callback(new Error('余额不能为空'))
  } else if (value === '+' || value === '-') {
    callback(new Error('请输入有效的数字'))
  } else {
    callback()
  }
}
const recordDialogRules = ref({
  balance: [{ validator: recordDialogDeltaValidator, trigger: 'blur' }],
})

const recordFormRef = useTemplateRef<InstanceType<typeof ElForm>>('recordFormRef')

function handleRecordBalanceInput(value: string): void {
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

  const _recordDialogItem = recordDialogItem.value
  const _neoBalance = limitInput(value)
  _recordDialogItem.balance = _neoBalance
  _recordDialogItem.formatted_balance = convertCurrency(_neoBalance)
}

function handleRecordDialogHotKeyDown(): void {
  handleBankCardToRecord()
}

function handleBankCardToRecord(): void {
  if (!recordFormRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  recordFormRef.value.validate((accept: boolean) => {
    if (accept) {
      recordBankCard()
    }
  })
}

async function recordBankCard(): Promise<void> {
  const _recordDialogItem: RecordDialogItem = recordDialogItem.value
  recordDialogLoading.value += 1
  try {
    await resolveResponse(
      recordBalance({
        bank_card_key: { long_id: _recordDialogItem.key_long_id },
        balance: parseFloat(_recordDialogItem.balance),
      }),
    )
    ElMessage({
      showClose: true,
      message: `账本 ${_recordDialogItem.name} 余额记录成功，别忘了最后提交`,
      type: 'success',
    })
    handleBankCardSearch()
    recordDialogVisible.value = false
    if (!cardPanelRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    const _el: HTMLElement = (cardPanelRef.value as { $el: HTMLElement }).$el
    _el.focus()
  } finally {
    recordDialogLoading.value -= 1
  }
}

function handleBankCardToCancel(): void {
  if (!cardPanelRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  recordDialogVisible.value = false
  const _el: HTMLElement = (cardPanelRef.value as { $el: HTMLElement }).$el
  _el.focus()
}
</script>

<style scoped>
.balance-record-container {
  height: 100%;
  width: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
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

.card-panel:focus {
  outline: none;
}

.balance-record-card-wrapper {
  height: 100%;
  width: 100%;
}

.balance-record-card-container {
  width: 100%;
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.balance-record-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.balance-record-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.balance-record-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.balance-record-control-button-group {
  display: flex;
}

.card-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.contextmenu {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
  user-select: none;
}

.contextmenu li:hover {
  background: #eee;
}

.contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}

/*noinspection CssUnusedSymbol*/
.record-dialog-container :deep(.el-dialog) {
  margin-bottom: 0 !important;
}

.record-dialog-input-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.record-dialog-input-divider {
  height: 40px;
}
</style>
