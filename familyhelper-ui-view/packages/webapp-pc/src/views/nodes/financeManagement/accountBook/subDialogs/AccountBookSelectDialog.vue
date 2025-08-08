<template>
  <el-dialog
    class="account-book-select-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    destroy-on-close
    title="选择账本"
    top="8vh"
    width="80%"
    :close-on-click-modal="false"
    @open="handleOpen"
    @closed="handleClosed"
    @keydown="handleHotKeyDown"
  >
    <header-layout-panel class="body-wrapper">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleAccountBookSearch">刷新数据</el-button>
          <el-divider v-if="inspectAllSwitchVisible" direction="vertical" />
          <el-switch
            v-if="inspectAllSwitchVisible"
            v-model="inspectAllSwitchValue"
            active-text="看所有的"
            inactive-text="看自己的"
            @change="handleAccountBookSearch"
          />
        </div>
      </template>
      <template v-slot:default>
        <div class="body-container">
          <card-panel
            class="card-list-container"
            v-loading="accountBookCardLoading"
            title-field="name"
            card-width="calc(20% - 18px)"
            select-mode="SINGLE"
            :items="accountBookCardItems"
            :max-card="accountBookCardMaxCard"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :add-button-visible="false"
            :show-contextmenu="false"
            @onSelectionChanged="handleAccountBookCardSelectionChanged"
          >
            <template v-slot:default="{ item }">
              <div class="account-book-card-container">
                <div class="account-book-property">
                  <span class="iconfont account-book-property-icon" style="color: black"
                    >&#xfffa;</span
                  >
                  <!--suppress JSUnresolvedVariable -->
                  <span class="account-book-property-text">
                    权限: {{ (item as AccountBookCardItem).formatted_permission_level }}
                  </span>
                </div>
                <div class="account-book-property">
                  <span class="iconfont account-book-property-icon" style="color: black"
                    >&#xfffb;</span
                  >
                  <!--suppress JSUnresolvedVariable -->
                  <span class="account-book-property-text">
                    所有者: {{ (item as AccountBookCardItem).owner_display_name }}
                  </span>
                </div>
                <div class="account-book-property">
                  <span class="iconfont account-book-property-icon" style="color: black"
                    >&#xfff9;</span
                  >
                  <!--suppress JSUnresolvedVariable -->
                  <span class="account-book-property-text">
                    余额: {{ (item as AccountBookCardItem).total_value }}
                  </span>
                </div>
                <div class="account-book-property">
                  <span class="iconfont account-book-property-icon" style="color: black"
                    >&#xffef;</span
                  >
                  <!--suppress JSUnresolvedVariable -->
                  <span class="account-book-property-text">
                    记录日期: {{ (item as AccountBookCardItem).formatted_last_recorded_date }}
                  </span>
                </div>
              </div>
            </template>
          </card-panel>
          <el-checkbox v-model="setToDefaultCheckboxValue">设为默认</el-checkbox>
        </div>
      </template>
    </header-layout-panel>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button
          type="primary"
          :disabled="confirmButtonDisabled"
          @click="handleConfirmButtonClicked"
        >
          确定
        </el-button>
        <el-button @click="handleCancelButtonClicked"> 取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import CardPanel from '@/components/card/cardPanel/CardPanel.vue'

import { useGeneralCardPanel } from '@/components/card/cardPanel/composables.ts'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import {
  allPermittedDisp,
  allOwnedDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { type PoabPermissionLevel } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/poab.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'AccountBookSelectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  mode?: 'BANK_CARD' | 'BALANCE_RECORD' | 'FUND_CHANGE' | 'FINANCE_REPORT' | 'DEFAULT'
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', accountBook: DispAccountBook, setToDefault: boolean): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// -----------------------------------------------------------显示处理-----------------------------------------------------------
function handleOpen(): void {
  accountBookSelection.value = []
  setToDefaultCheckboxValue.value = false
  handleAccountBookSearch()
}

function handleClosed(): void {
  accountBookSelection.value = []
}

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const inspectAllSwitchValue = ref<boolean>(false)

const inspectAllSwitchVisible = computed<boolean>(() => props.mode !== 'BALANCE_RECORD')

// -----------------------------------------------------------账本查询-----------------------------------------------------------
function handleAccountBookSearch(): void {
  switch (props.mode) {
    case 'BALANCE_RECORD':
      handleAccountBookSearchBalanceRecordMode()
      return
    case 'BANK_CARD':
    case 'FUND_CHANGE':
    case 'FINANCE_REPORT':
    case 'DEFAULT':
      handleAccountBookSearchBalanceDefaultMode()
  }
}

function handleAccountBookSearchBalanceRecordMode(): void {
  handleAccountBookAllPermittedSearch()
}

function handleAccountBookSearchBalanceDefaultMode(): void {
  if (inspectAllSwitchValue.value) {
    handleAccountBookAllPermittedSearch()
  } else {
    handleAccountBookAllOwnedSearch()
  }
}

async function handleAccountBookAllPermittedSearch(): Promise<void> {
  accountBookCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allPermittedDisp(pagingInfo))
    updateAccountBookCardByLookup(res)
  } finally {
    accountBookCardLoading.value -= 1
  }
}

async function handleAccountBookAllOwnedSearch(): Promise<void> {
  accountBookCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allOwnedDisp(pagingInfo))
    updateAccountBookCardByLookup(res)
  } finally {
    accountBookCardLoading.value -= 1
  }
}

// -----------------------------------------------------------账本卡片-----------------------------------------------------------
type AccountBookCardItem = {
  name: string
  permission_level: PoabPermissionLevel | null
  formatted_permission_level: string
  owner_display_name: string
  total_value: number
  formatted_last_recorded_date: string
  account_book: DispAccountBook
}

const { items: accountBookCardItems, updateByLookup: updateAccountBookCardByLookup } =
  useGeneralCardPanel<DispAccountBook, AccountBookCardItem>(accountBookCardItemMap)
const accountBookCardLoading = ref<number>(0)
const accountBookCardMaxCard = ref<number>(1000)
const accountBookSelection = ref<AccountBookCardItem[]>([])

function accountBookCardItemMap(t: DispAccountBook): AccountBookCardItem {
  function formatPermissionLevel(permissionLevel: PoabPermissionLevel | null): string {
    switch (permissionLevel) {
      case 0:
        return '所有者'
      case 1:
        return '访客'
      default:
        return '未知'
    }
  }

  return {
    name: t.name,
    permission_level: t.permission_level,
    formatted_permission_level: formatPermissionLevel(t.permission_level),
    owner_display_name: t.owner_account?.display_name ?? '未知',
    total_value: t.total_value,
    formatted_last_recorded_date: formatTimestamp(t.last_recorded_date ?? 0),
    account_book: t,
  }
}

function handleAccountBookCardSelectionChanged(selection: AccountBookCardItem[]): void {
  accountBookSelection.value = selection
}

// -----------------------------------------------------------确认逻辑-----------------------------------------------------------
const setToDefaultCheckboxValue = ref<boolean>(false)

const confirmButtonDisabled = computed<boolean>(() => {
  return accountBookSelection.value.length === 0
})

function handleConfirmButtonClicked(): void {
  if (accountBookSelection.value.length === 0) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const accountBook: AccountBookCardItem = accountBookSelection.value[0]
  emit('onConfirmed', accountBook.account_book, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (accountBookSelection.value.length === 0) {
    return
  }
  const accountBook: AccountBookCardItem = accountBookSelection.value[0]
  emit('onConfirmed', accountBook.account_book, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.account-book-select-dialog-container :deep(.el-dialog) {
  margin-bottom: 0 !important;
}

.body-wrapper {
  height: 650px;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.body-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-list-container {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.account-book-card-container {
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

.account-book-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.account-book-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.account-book-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
