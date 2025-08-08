<template>
  <div class="bank-card-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleBankCardSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <account-book-indicator mode="BANK_CARD" @onChanged="handleBankCardIndicatorChanged" />
        </div>
      </template>
      <template v-slot:default>
        <div class="placeholder" v-show="!accountBookIndicatorValue">请选择账本</div>
        <card-panel
          v-show="accountBookIndicatorValue"
          v-loading="bankCardCardLoading"
          title-field="name"
          card-width="calc(20% - 18px)"
          :items="bankCardCardItems"
          :max-card="bankCardCardMaxCard"
          :show-contextmenu="true"
          :contextmenu-width="120"
          :addon-button-visible="!readonly"
          @onItemAdd="handleBankCardToCreate"
        >
          <template v-slot:default="{ item }">
            <div class="bank-card-card-container">
              <div class="bank-card-property">
                <span class="iconfont bank-card-property-icon" style="color: black">&#xffee;</span>
                <!--suppress JSUnresolvedVariable -->
                <div class="bank-card-property-text">
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
              <div class="bank-card-property">
                <span class="iconfont bank-card-property-icon" style="color: black">&#xfff9;</span>
                <!--suppress JSUnresolvedVariable -->
                <span class="bank-card-property-text">
                  余额: {{ (item as BankCardCardItem).balance_value }}
                </span>
              </div>
              <div class="bank-card-property">
                <span class="iconfont bank-card-property-icon" style="color: black">&#xffef;</span>
                <!--suppress JSUnresolvedVariable -->
                <span class="bank-card-property-text">
                  记录日期: {{ (item as BankCardCardItem).formatted_last_recorded_date }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:header="{ index, item }">
            <el-button-group class="bank-card-control-button-group">
              <el-button
                class="card-button"
                :icon="EditPen"
                :disabled="readonly"
                @click="handleItemToEdit(index, item)"
              />
              <el-button
                class="card-button"
                :icon="DeleteIcon"
                :disabled="readonly"
                @click="handleItemToDelete(index, item)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ index, item, close }">
            <ul class="my-contextmenu">
              <!--suppress JSUnresolvedVariable -->
              <li
                :class="{ disabled: readonly }"
                @click="handleEditMenuItemClicked(index, item, close, $event)"
              >
                编辑...
              </li>
              <!--suppress JSUnresolvedVariable -->
              <li
                :class="{ disabled: readonly }"
                @click="handleDeleteMenuItemClicked(index, item, close, $event)"
              >
                删除...
              </li>
            </ul>
          </template>
        </card-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="bankCardMaintainDialogVisible"
      :loading="bankCardMaintainDialogLoading"
      :mode="bankCardMaintainDialogMode"
      :item="bankCardMaintainDialogItem"
      :create-rules="bankCardMaintainDialogRules"
      :edit-rules="bankCardMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleBankCardCreate"
      @onItemEdit="handleBankCardEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="bankCardMaintainDialogItem.name"
          :readonly="bankCardMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="类型" prop="card_type">
        <el-select
          class="bank-card-type-select"
          v-model="bankCardMaintainDialogItem.card_type"
          placeholder="请选择"
        >
          <el-option
            v-for="indicator in bankCardTypeIndicators"
            :key="indicator.key.string_id"
            :label="indicator.label"
            :value="indicator.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="bankCardMaintainDialogItem.remark"
          :readonly="bankCardMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import { Delete as DeleteIcon, EditPen } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import CardPanel from '@/components/card/cardPanel/CardPanel.vue'

import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'
import { useGeneralCardPanel } from '@/components/card/cardPanel/composables.ts'

import AccountBookIndicator from '@/views/nodes/financeManagement/accountBook/AccountBookIndicator.vue'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { type DispBankCard } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCard.ts'
import {
  childForAccountBookDisp,
  create,
  update,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCard.ts'
import { type BankCardTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCardTypeIndicator.ts'
import { all as allBankCardTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCardTypeIndicator.ts'
import { lookupAllToList, lookupCount } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'BankCard',
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const accountBookIndicatorValue = ref<DispAccountBook | null>(null)

function handleBankCardIndicatorChanged(value: DispAccountBook | null): void {
  accountBookIndicatorValue.value = value
  handleBankCardSearch()
}

// -----------------------------------------------------------只读计算-----------------------------------------------------------
const readonly = computed<boolean>(() => {
  if (!accountBookIndicatorValue.value) {
    return true
  }
  // noinspection JSUnresolvedVariable
  return accountBookIndicatorValue.value.permission_level !== 0
})

// -----------------------------------------------------------银行卡类型-----------------------------------------------------------
const bankCardTypeIndicators = ref<BankCardTypeIndicator[]>([])

// -----------------------------------------------------------查询逻辑-----------------------------------------------------------
function handleSearch(): void {
  handleBankCardTypeIndicatorSearch()
  handleBankCardSearch()
}

function handleBankCardTypeIndicatorSearch(): void {
  handleBankCardTypeIndicatorAllSearch()
}

async function handleBankCardTypeIndicatorAllSearch(): Promise<void> {
  bankCardCardLoading.value += 1
  try {
    bankCardTypeIndicators.value = await lookupAllToList((pagingInfo) =>
      allBankCardTypeIndicator(pagingInfo),
    )
  } finally {
    bankCardCardLoading.value -= 1
  }
}

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
  handleSearch()
})

// -----------------------------------------------------------银行卡卡片-----------------------------------------------------------
type BankCardCardItem = {
  name: string
  formatted_type: { label: string; remark: string }
  balance_value: number
  formatted_last_recorded_date: string
  bank_card: DispBankCard
}

const { items: bankCardCardItems, updateByLookup: updateBankCardCardByLookup } =
  useGeneralCardPanel<DispBankCard, BankCardCardItem>(bankCardCardItemMap)
const bankCardCardLoading = ref<number>(0)
const bankCardCardMaxCard = ref<number>(1000)

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
    bank_card: t,
  }
}

async function handleBankCardToCreate(): Promise<void> {
  const _accountBook: DispAccountBook | null = accountBookIndicatorValue.value
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  bankCardCardLoading.value += 1
  try {
    const count: number = await lookupCount((pagingInfo) =>
      childForAccountBookDisp(_accountBook.key, pagingInfo),
    )
    const maxCard: number = bankCardCardMaxCard.value
    if (count > maxCard) {
      await ElMessageBox.alert(
        `您创建了过多的银行卡，每个人创建银行卡的最大数量不应超过 ${maxCard}  个！<br>${maxCard}个应该够用了QwQ`,
        {
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true,
          type: 'warning',
          customClass: 'custom-message-box__w500',
        },
      )
      return
    }
    showBankCardCreateMaintainDialog()
  } finally {
    bankCardCardLoading.value -= 1
  }
}

function handleEditMenuItemClicked(
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
  handleItemToEdit(_index, item)
}

function handleItemToEdit(_index: number, item: BankCardCardItem): void {
  const _accountBook: DispAccountBook | null = accountBookIndicatorValue.value
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (_accountBook.permission_level !== 0) {
    ElMessageBox.alert('您不是此账本的所有者，无权编辑该账本！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  showBankCardEditMaintainDialog(item.bank_card)
}

function handleDeleteMenuItemClicked(
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
  handleItemToDelete(_index, item)
}

function handleItemToDelete(_index: number, item: BankCardCardItem): void {
  const _accountBook: DispAccountBook | null = accountBookIndicatorValue.value
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (_accountBook.permission_level !== 0) {
    ElMessageBox.alert('您不是此账本的所有者，无权删除该账本！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  handleItemDelete(item)
}

async function handleItemDelete(item: BankCardCardItem): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此银行卡。<br>是否继续?', '提示', {
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
    await resolveResponse(remove(item.bank_card.key))
    ElMessage({
      showClose: true,
      message: `银行卡 ${item.name} 删除成功`,
      type: 'success',
    })
    handleBankCardSearch()
  } finally {
    bankCardCardLoading.value -= 1
  }
}

// -----------------------------------------------------------银行卡维护对话框-----------------------------------------------------------
type BankCardMaintainDialogItem = {
  key_long_id: string
  name: string
  card_type: string
  remark: string
}

const {
  visible: bankCardMaintainDialogVisible,
  item: bankCardMaintainDialogItem,
  mode: bankCardMaintainDialogMode,
  showCreateDialog: showBankCardCreateMaintainDialog,
  showEditDialog: showBankCardEditMaintainDialog,
} = useGeneralMaintainDialog<DispBankCard, BankCardMaintainDialogItem>(
  bankCardMaintainDialogItemMap,
  {
    key_long_id: '',
    name: '',
    card_type: '',
    remark: '',
  },
)
const bankCardMaintainDialogLoading = ref<number>(0)
const bankCardMaintainDialogRules = ref({
  name: [{ required: true, message: '银行卡名称不能为空', trigger: 'blur' }],
  card_type: [{ required: true, message: '请选择银行卡类型', trigger: 'blur' }],
})

function bankCardMaintainDialogItemMap(t: DispBankCard): BankCardMaintainDialogItem {
  return {
    key_long_id: t.key.long_id,
    name: t.name,
    card_type: t.card_type,
    remark: t.remark,
  }
}

async function handleBankCardCreate(item: BankCardMaintainDialogItem): Promise<void> {
  const _accountBook: DispAccountBook | null = accountBookIndicatorValue.value
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  bankCardMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      create({
        account_book_key: _accountBook.key,
        name: item.name,
        card_type: item.card_type,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `银行卡 ${item.name} 创建成功`,
      type: 'success',
    })
    bankCardMaintainDialogVisible.value = false
    handleBankCardSearch()
  } finally {
    bankCardMaintainDialogLoading.value -= 1
  }
}

async function handleBankCardEdit(item: BankCardMaintainDialogItem): Promise<void> {
  bankCardMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        bank_card_key: { long_id: item.key_long_id },
        name: item.name,
        card_type: item.card_type,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `银行卡 ${item.name} 更新成功`,
      type: 'success',
    })
    bankCardMaintainDialogVisible.value = false
    handleBankCardSearch()
  } finally {
    bankCardMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.bank-card-container {
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

.bank-card-card-container {
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

.bank-card-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.bank-card-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.bank-card-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.bank-card-control-button-group {
  display: flex;
}

.card-button {
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

.bank-card-type-select {
  width: 100%;
}
</style>
