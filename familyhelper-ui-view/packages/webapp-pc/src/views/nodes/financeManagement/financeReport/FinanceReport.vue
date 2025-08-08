<template>
  <div class="finance-report-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <account-book-indicator
            mode="FINANCE_REPORT"
            @onChanged="handleBankCardIndicatorChanged"
          />
        </div>
      </template>
      <template v-slot:default>
        <el-tabs class="finance-report-main-body" v-model="tabPanelValue" tab-position="left">
          <el-tab-pane label="账本" name="account_book">
            <account-book-panel :account-book="accountBookIndicatorValue" />
          </el-tab-pane>
          <el-tab-pane label="银行卡" name="bank_card">
            <bank-card-panel :account-book="accountBookIndicatorValue" />
          </el-tab-pane>
          <el-tab-pane label="资金变更" name="fund_change">
            <fund-change-panel :account-book="accountBookIndicatorValue" />
          </el-tab-pane>
        </el-tabs>
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import AccountBookIndicator from '@/views/nodes/financeManagement/accountBook/AccountBookIndicator.vue'

import AccountBookPanel from './subPanels/AccountBookPanel.vue'
import BankCardPanel from './subPanels/BankCardPanel.vue'
import FundChangePanel from './subPanels/FundChangePanel.vue'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'

defineOptions({
  name: 'FinanceReport',
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const accountBookIndicatorValue = ref<DispAccountBook | null>(null)

function handleBankCardIndicatorChanged(value: DispAccountBook | null): void {
  accountBookIndicatorValue.value = value
}

// -----------------------------------------------------------页签面板-----------------------------------------------------------
const tabPanelValue = ref<'account_book' | 'bank_card' | 'fund_change'>('account_book')
</script>

<style scoped>
.finance-report-container {
  width: 100%;
  height: 100%;
}

.header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.finance-report-main-header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.finance-report-main-body {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.finance-report-main-body :deep(.el-tabs__content) {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.finance-report-main-body :deep(.el-tab-pane) {
  height: 100%;
}
</style>
