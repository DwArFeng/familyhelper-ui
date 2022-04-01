<template>
  <div class="account-book-indicator-container">
    <el-input
      v-loading="loading"
      class="indicator"
      v-model="displayValue"
      readonly
    >
      <span slot="prepend">当前账本</span>
      <el-button-group class="button-group" slot="append">
        <el-button
          class="button"
          icon="el-icon-search"
          @click="handleShowDialog"
        />
        <el-button
          class="button"
          icon="el-icon-refresh"
          @click="fetchSettingrepo"
        />
      </el-button-group>
    </el-input>
    <account-book-select-dialog
      :mode="mode"
      :visible.sync="dialogVisible"
      @onConfirm="handleConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import AccountBookSelectDialog
from '@/views/items/financeManagement/accountBook/AccountBookSelectDialog.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/settingNode';
import { exists, inspectDisp } from '@/api/finance/accountBook';

import resolveResponse from '@/util/response';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';

const SETTINGREPO_CATEGORY_ID = 'finance_management.default_account_book';

// noinspection JSAnnotator
export default {
  name: 'AccountBookIndicator',
  components: { AccountBookSelectDialog },
  props: {
    mode: {
      type: String,
      validator(value) {
        return [
          'BANK_CARD', 'BALANCE_RECORD', 'FUND_CHANGE', 'FINANCE_REPORT', 'DEFAULT',
        ].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  computed: {
    accountBookId() {
      if (this.accountBook === null) {
        return '';
      }
      return this.accountBook.key.long_id;
    },
    displayValue() {
      if (this.accountBook === null) {
        return '（未选择账本）';
      }
      return this.accountBook.name;
    },
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      accountBook: null,
      dialogVisible: false,
      loading: false,
    };
  },
  methods: {
    handleShowDialog() {
      this.dialogVisible = true;
    },
    handleConfirmed(accountBook, setDefault) {
      this.accountBook = accountBook;
      this.$emit('change', accountBook);
      if (!setDefault) {
        return;
      }
      resolveResponse(operatePut(
        SETTINGREPO_CATEGORY_ID,
        [this.me],
        this.accountBookId,
        `更新时间: ${formatTimestamp(currentTimestamp())}`,
      ))
        .catch(() => {
        });
    },
    fetchSettingrepo() {
      this.loading = true;
      resolveResponse(operateInspect(SETTINGREPO_CATEGORY_ID, [this.me]))
        .then((res) => {
          if (res === null) {
            this.accountBook = null;
            return Promise.reject();
          }
          return Promise.resolve(res.value);
        })
        .then((res) => resolveResponse(exists(res))
          .then((existsFlag) => {
            if (existsFlag) {
              return Promise.resolve(res);
            }
            this.accountBook = null;
            return Promise.reject();
          }))
        .then((res) => resolveResponse(inspectDisp(res)))
        .then((res) => {
          this.accountBook = res;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
          this.$emit('change', this.accountBook);
        });
    },
  },
  mounted() {
    this.fetchSettingrepo();
  },
};
</script>

<style scoped>
.indicator {
  width: 360px;
}

/*noinspection CssUnusedSymbol*/
.indicator >>> .el-input__inner {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.indicator >>> .el-input-group__prepend {
  padding: 0 10px;
}

.button-group{
  display: flex;
}

.button-group .button{
  padding-left: 10px;
  padding-right: 10px;
}
</style>
