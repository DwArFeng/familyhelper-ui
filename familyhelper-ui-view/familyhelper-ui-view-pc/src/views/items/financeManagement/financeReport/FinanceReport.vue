<template>
  <div class="finance-report-container">
    <border-layout-panel
      class="border-layout-panel"
    >
      <div class="finance-report-main">
        <div class="finance-report-main-header">
          <account-book-indicator mode="FINANCE_REPORT" @change="handleAccountBookChanged"/>
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
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import AccountBookPanel from '@/views/items/financeManagement/financeReport/AccountBookPanel.vue';
import BankCardPanel from '@/views/items/financeManagement/financeReport/BankCardPanel.vue';
import FundChangePanel from '@/views/items/financeManagement/financeReport/FundChangePanel.vue';
import AccountBookIndicator from '@/views/items/financeManagement/accountBook/AccountBookIndicator.vue';

export default {
  name: 'FinanceReport',
  components: {
    AccountBookIndicator,
    AccountBookPanel,
    BankCardPanel,
    FundChangePanel,
    BorderLayoutPanel,
  },
  data() {
    return {
      accountBookSelection: {
        accountBookId: '',
        accountBook: null,
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
    handleAccountBookChanged(accountBook) {
      if (accountBook === null) {
        this.accountBookSelection.accountBook = null;
        this.accountBookSelection.accountBookId = '';
      } else {
        this.accountBookSelection.accountBook = accountBook;
        this.accountBookSelection.accountBookId = accountBook.key.long_id;
      }
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
