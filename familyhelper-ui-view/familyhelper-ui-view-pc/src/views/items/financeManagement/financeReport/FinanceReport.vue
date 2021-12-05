<template>
  <div class="finance-report-container">
    <border-layout-panel
      class="border-layout-panel"
    >
      <div class="finance-report-main">
        <div class="finance-report-main-header">
          <el-input
            class="indicator"
            v-model="accountBookSelection.displayValue"
            readonly
          >
            <span slot="prepend">当前账本</span>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handleShowAccountBookSelectDialog"
            />
          </el-input>
        </div>
        <el-divider class="tiny-margin-divider"/>
        <el-tabs class="finance-report-main-body" v-model="tabPane.activeName" tab-position="left">
          <el-tab-pane label="账本" name="account_book">
            <account-book-panel :selection="accountBookSelection"/>
          </el-tab-pane>
          <el-tab-pane label="银行卡" name="bank_card">
            <bank-card-panel :selection="accountBookSelection"/>
          </el-tab-pane>
          <el-tab-pane label="资金变更" name="fund_change">
            <fund-change-panel :selection="accountBookSelection"/>
          </el-tab-pane>
        </el-tabs>
      </div>
    </border-layout-panel>
    <account-book-select-dialog
      type="FINANCE_REPORT"
      :visible.sync="accountBookSelectDialog.visible"
      @onConfirm="handleAccountBookConfirmed"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import AccountBookSelectDialog
from '@/views/items/financeManagement/accountBook/AccountBookSelectDialog.vue';
import AccountBookPanel from '@/views/items/financeManagement/financeReport/AccountBookPanel.vue';
import BankCardPanel from '@/views/items/financeManagement/financeReport/BankCardPanel.vue';
import FundChangePanel from '@/views/items/financeManagement/financeReport/FundChangePanel.vue';

export default {
  name: 'FinanceReport',
  components: {
    AccountBookPanel,
    BankCardPanel,
    FundChangePanel,
    BorderLayoutPanel,
    AccountBookSelectDialog,
  },
  data() {
    return {
      accountBookSelection: {
        accountBookId: '',
        accountBook: null,
        displayValue: '',
      },
      accountBookSelectDialog: {
        visible: false,
      },
      tabPane: {
        activeName: 'account_book',
      },
    };
  },
  methods: {
    handleAccountBookConfirmed(accountBook) {
      this.accountBookSelection.accountBook = accountBook;
      this.accountBookSelection.accountBookId = accountBook.key.long_id;
      this.accountBookSelection.displayValue = accountBook.name;
    },
    handleShowAccountBookSelectDialog() {
      this.accountBookSelectDialog.visible = true;
    },
  },
};
</script>

<style scoped>
.finance-report-container {
  width: 100%;
  height: 100%;
}

.finance-report-main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tiny-margin-divider {
  margin-top: 10px;
  margin-bottom: 10px;
}

.finance-report-main-header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.indicator {
  width: min(50%, 400px);
}

/*noinspection CssUnusedSymbol*/
.indicator >>> .el-input__inner {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.indicator >>> .el-input-group__prepend {
  padding: 0 10px;
}

.finance-report-main-body {
  width: 100%;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.finance-report-main-body >>> .el-tabs__content{
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.finance-report-main-body >>> .el-tab-pane{
  height: 100%;
}
</style>
