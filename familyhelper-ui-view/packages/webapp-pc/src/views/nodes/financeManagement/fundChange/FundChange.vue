<template>
  <div class="fund-change-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
      east-width="45%"
      :east-visible="showBillFilePanelSwitchValue"
    >
      <template v-slot:header>
        <div class="header-container">
          <account-book-indicator mode="FUND_CHANGE" @onChanged="handleBankCardIndicatorChanged" />
          <el-divider direction="vertical" />
          <el-switch
            v-model="showBillFilePanelSwitchValue"
            active-text="显示票据"
            inactive-text="隐藏票据"
            active-color="#409EFF"
            inactive-color="#409EFF"
            :disabled="showBillFilePanelSwitchValueDisabled"
            @change="handleShowBillFilePanelSwitchChanged"
          />
        </div>
      </template>
      <template v-slot:default>
        <fund-change-panel
          :account-book="accountBookIndicatorValue"
          @onCurrentChanged="handleFundChangePanelCurrentChanged"
        />
      </template>
      <template v-slot:east>
        <bill-file-panel
          :account-book="accountBookIndicatorValue"
          :fund-change="currentFundChange"
        />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useUserPreference } from '@/composables/userPreference.ts'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import AccountBookIndicator from '@/views/nodes/financeManagement/accountBook/AccountBookIndicator.vue'

import FundChangePanel from './subPanels/FundChangePanel.vue'
import BillFilePanel from './subPanels/BillFilePanel.vue'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { type DispFundChange } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange.ts'

defineOptions({
  name: 'FundChange',
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const accountBookIndicatorValue = ref<DispAccountBook | null>(null)
const showBillFilePanelSwitchValue = ref<boolean>(true)
const showBillFilePanelSwitchValueDisabled = ref<boolean>(false)

function handleBankCardIndicatorChanged(value: DispAccountBook | null): void {
  accountBookIndicatorValue.value = value
}

function handleShowBillFilePanelSwitchChanged(): void {
  // 保存用户偏好。
  saveUserPreference()
  // 防抖。
  showBillFilePanelSwitchValueDisabled.value = true
  setTimeout(() => {
    showBillFilePanelSwitchValueDisabled.value = false
  }, 1000)
}

// -----------------------------------------------------------资金变更面板-----------------------------------------------------------
const currentFundChange = ref<DispFundChange | null>(null)

function handleFundChangePanelCurrentChanged(current: DispFundChange | null): void {
  currentFundChange.value = current
}

// -----------------------------------------------------------用户偏好-----------------------------------------------------------
type UserPreference = {
  showBillFilePanel: boolean
}

const SETTINGREPO_CATEGORY_ID = 'ui_preference.pc.finance_management.fund_change'

const DEFAULT_USER_PREFERENCE: UserPreference = {
  showBillFilePanel: true,
}

const { loadUserPreference, saveUserPreference } = useUserPreference<UserPreference>(
  () => SETTINGREPO_CATEGORY_ID,
  DEFAULT_USER_PREFERENCE,
  userPreferenceGetter,
  userPreferenceSetter,
)

function userPreferenceGetter(): UserPreference {
  return {
    showBillFilePanel: showBillFilePanelSwitchValue.value,
  }
}

function userPreferenceSetter(userPreference: UserPreference): void {
  showBillFilePanelSwitchValue.value = userPreference.showBillFilePanel
}

onMounted(() => {
  loadUserPreference()
})
</script>

<script lang="ts">
// noinspection JSAnnotator
export default {
  watch: {},
  data() {
    return {
      header: {
        accountBook: null,
        showBillFilePanel: true,
        switchDisabled: false,
      },
      center: {
        fundChange: null,
      },
    }
  },
}
</script>

<style scoped>
.fund-change-container {
  height: 100%;
  width: 100%;
}

.header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
