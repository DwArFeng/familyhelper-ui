<template>
  <div class="account-book-panel-container">
    <div class="placeholder" v-if="selection.accountBookId===''">
      请选择一个账本（๑╹◡╹)ﾉ
    </div>
    <div class="account-book-body" v-else>
      <div class="account-book-body-grid">
        <el-divider class="expand-divider" content-position="left">账本详情</el-divider>
        <el-form class="account-book-detail" label-position="left" inline label-width="60px">
          <el-form-item label="名称" style="width: 50%">
            <span>{{ selection.accountBook.name }}</span>
          </el-form-item>
          <el-form-item label="所有者" style="width: 50%">
            <!--suppress JSUnresolvedVariable -->
            <span>{{ selection.accountBook.owner_account.key.string_id }}</span>
          </el-form-item>
          <el-form-item label="备注" style="width: 100%">
            <span>{{ selection.accountBook.remark }}</span>
          </el-form-item>
        </el-form>
        <el-divider class="expand-divider" content-position="left">余额</el-divider>
        <div class="balance-container">
          <div
            class="balance-label"
            :style="balance.valueStyle"
          >
            {{ balance.value }}
          </div>
          <div
            class="balance-label"
            :style="balance.formattedValueStyle"
          >
            {{ balance.formattedValue }}
          </div>
        </div>
        <el-divider class="expand-divider" content-position="left">图表</el-divider>
        <balance-chart
          class="account-book-chart"
          :show-title="false"
          :hover-animation="false"
          :category="chart.category"
          :data="chart.data"
        />
      </div>
      <el-divider class="vertical-divider" direction="vertical"/>
      <div class="account-book-body-grid">
        <el-divider class="expand-divider" content-position="left">银行卡概述</el-divider>
        <table-panel
          class="account-book-table"
          :page-size.sync="bankCardTable.pageSize"
          :entity-count="parseInt(bankCardTable.entities.count)"
          :current-page.sync="bankCardTable.currentPage"
          :page-sizes="[3,5,7]"
          :table-data="bankCardTable.entities.data"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          @onPagingAttributeChanged="handleBankCardTablePagingAttributeChanged"
        >
          <!--suppress HtmlDeprecatedAttribute -->
          <el-table-column
            prop="name"
            label="名称"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="card_type"
            label="类型"
            show-tooltip-when-overflow
            :formatter="cardTypeFormatter"
          />
          <!--suppress HtmlDeprecatedAttribute -->
          <el-table-column
            prop="balance_value"
            label="余额"
            align="right"
            show-tooltip-when-overflow
            :formatter="balanceNumberFormatter"
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
        </table-panel>
        <el-divider class="expand-divider" content-position="left">资金变更概述</el-divider>
        <table-panel
          class="account-book-table"
          :page-size.sync="fundChangeTable.pageSize"
          :entity-count="parseInt(fundChangeTable.entities.count)"
          :current-page.sync="fundChangeTable.currentPage"
          :page-sizes="[3,5,7]"
          :table-data="fundChangeTable.entities.data"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          @onPagingAttributeChanged="handleFundChangeTablePagingAttributeChanged"
        >
          <!--suppress HtmlDeprecatedAttribute -->
          <el-table-column
            prop="delta"
            label="变更金额"
            align="right"
            show-tooltip-when-overflow
            :formatter="balanceNumberFormatter"
          />
          <el-table-column
            prop="change_type"
            label="资金变更类型"
            show-tooltip-when-overflow
            :formatter="changeTypeFormatter"
          />
          <el-table-column
            prop="happened_date"
            label="记录日期"
            width="180px"
            show-tooltip-when-overflow
            :formatter="timestampFormatter"
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
        </table-panel>
      </div>
    </div>
  </div>
</template>

<script>
import BalanceChart from '@/views/items/financeManagement/financeReport/BalanceChart.vue';
import TablePanel from '@/components/layout/TablePanel.vue';

import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';
import { childForAccountBookDesc } from '@/api/finance/totalBalanceHistory';
import { childForAccountBookDisp as bankCardChildForAccountBookDisp } from '@/api/finance/bankCard';
import { childForAccountBookDescDisp as fundChangeChildForAccountBookDescDisp } from '@/api/finance/fundChange';

export default {
  name: 'AccountBookPanel',
  components: { BalanceChart, TablePanel },
  props: {
    selection: {
      type: Object,
      default: () => ({
        accountBookId: '',
        accountBook: null,
        displayValue: '',
      }),
    },
  },
  watch: {
    selection: {
      handler(value) {
        if (value.accountBookId === '') {
          return;
        }
        // noinspection JSUnresolvedVariable
        this.updateBalance(value.accountBook.total_value);
        this.updateChart(value.accountBookId);
        this.updateTable(value.accountBookId);
      },
      deep: true,
    },
  },
  data() {
    return {
      balance: {
        value: '',
        formattedValue: '',
        valueStyle: {},
        formattedValueStyle: {},
      },
      chart: {
        category: [],
        data: [],
      },
      bankCardTable: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
        pageSize: 3,
      },
      fundChangeTable: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
        pageSize: 3,
      },
    };
  },
  methods: {
    updateBalance(totalValue) {
      const formattedTotalValue = totalValue.toFixed(2);
      this.balance.value = `${formattedTotalValue}`;
      let formattedValuePrefix = '';
      if (formattedTotalValue < 0) {
        formattedValuePrefix = '负';
        this.balance.valueStyle = { color: 'red' };
        this.balance.formattedValueStyle = { color: 'red' };
      } else {
        formattedValuePrefix = '';
        this.balance.valueStyle = { color: 'black' };
        this.balance.formattedValueStyle = { color: 'black' };
      }
      const absoluteTotalValue = `${Math.abs(formattedTotalValue)}`;
      this.balance.formattedValue = `${formattedValuePrefix}${this.convertCurrency(absoluteTotalValue)}`;
    },
    convertCurrency(value) {
      const maxValue = 999999999999.99;
      if (parseFloat(value) > maxValue) {
        return '数字太大了';
      }

      let n = value;

      if (n === '') {
        return '';
      }
      if (n.charAt(n.length - 1) === '.') {
        n = n.substring(0, n.length - 1);
      }

      let unit = '千百拾亿千百拾万千百拾元角分';
      let str = '';
      n += '00';

      const indexPoint = n.indexOf('.'); // 如果是小数，截取小数点前面的位数

      if (indexPoint >= 0) {
        // 若为小数，截取需要使用的unit单位
        n = n.substring(0, indexPoint) + n.substr(indexPoint + 1, 2);
      }

      unit = unit.substr(unit.length - n.length); // 若为整数，截取需要使用的unit单位
      for (let i = 0; i < n.length; i += 1) {
        // noinspection JSCheckFunctionSignatures
        str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i); // 遍历转化为大写的数字
      }

      // noinspection RegExpSingleCharAlternation
      return str.replace(/零(千|百|拾|角)/g, '零')
        .replace(/(零)+/g, '零')
        .replace(/零(万|亿|元)/g, '$1')
        .replace(/(亿)万|壹(拾)/g, '$1$2')
        .replace(/^元零?|零分/g, '')
        .replace(/元$/g, '元整');
    },
    updateChart(accountBookKey) {
      this.chart.category = [];
      this.chart.data = [];
      resolveResponse(childForAccountBookDesc(accountBookKey, 0, 20))
        .then((res) => {
          const data = res.data.reverse();
          data.forEach((item) => {
            // noinspection JSUnresolvedVariable
            this.chart.category.push(formatTimestamp(item.happened_date));
            // noinspection JSUnresolvedVariable
            this.chart.data.push({
              value: [formatTimestamp(item.happened_date), item.total_value],
            });
          });
        });
    },
    handleBankCardTablePagingAttributeChanged() {
      this.handleBankCardSearch(this.selection.accountBookId);
    },
    handleBankCardSearch(accountBookId) {
      resolveResponse(bankCardChildForAccountBookDisp(
        accountBookId, this.bankCardTable.currentPage, this.bankCardTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(bankCardChildForAccountBookDisp(
              accountBookId, this.bankCardTable.currentPage, this.bankCardTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then((res) => {
          this.bankCardTable.entities = res;
          this.bankCardTable.currentPage = res.current_page;
        })
        .catch(() => {
        });
    },
    cardTypeFormatter(row) {
      // noinspection JSUnresolvedVariable
      if (row.type_indicator !== null) {
        // noinspection JSUnresolvedVariable
        return row.type_indicator.label;
      }
      if ((row.card_type !== '' || row.card_type !== null)) {
        return '（未知）';
      }
      return '（未指定）';
    },
    handleFundChangeTablePagingAttributeChanged() {
      this.handleFundChangeSearch(this.selection.accountBookId);
    },
    handleFundChangeSearch(accountBookId) {
      resolveResponse(fundChangeChildForAccountBookDescDisp(
        accountBookId, this.fundChangeTable.currentPage, this.fundChangeTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(fundChangeChildForAccountBookDescDisp(
              accountBookId, this.fundChangeTable.currentPage, this.fundChangeTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then((res) => {
          this.fundChangeTable.entities = res;
          this.fundChangeTable.currentPage = res.current_page;
        })
        .catch(() => {
        });
    },
    changeTypeFormatter(row) {
      // noinspection JSUnresolvedVariable
      if (row.type_indicator !== null) {
        // noinspection JSUnresolvedVariable
        return row.type_indicator.label;
      }
      if ((row.change_type !== '' || row.change_type !== null)) {
        return '（未知）';
      }
      return '（未指定）';
    },
    balanceNumberFormatter(row, column) {
      return row[column.property].toFixed(2);
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    updateTable(accountBookId) {
      this.handleBankCardSearch(accountBookId);
      this.handleFundChangeSearch(accountBookId);
    },
  },
};
</script>

<style scoped>
.account-book-panel-container {
  height: 100%;
  width: 100%;
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
  color: #BFBFBF;
  user-select: none;
}

.account-book-body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.account-book-body-grid {
  height: 100%;
  width: 0;
  box-sizing: border-box;
  padding: 1px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.account-book-body-grid:first-child {
  margin-right: 1px;
}

.account-book-body-grid:last-child {
  margin-left: 1px;
}

.account-book-detail >>> label {
  width: 240px;
  color: #99a9bf;
}

/*noinspection CssUnusedSymbol*/
.account-book-detail >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
}

/*noinspection CssUnusedSymbol*/
.account-book-detail >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
}

.vertical-divider {
  height: 100%;
}

.balance-container {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.balance-label {
  width: 0;
  flex-grow: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.account-book-chart {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.account-book-table {
  width: 100%;
  height: 0;
  flex-grow: 1;
}
</style>