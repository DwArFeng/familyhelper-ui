<template>
  <div class="fund-change-panel-container">
    <div class="placeholder" v-if="selection.accountBookId===''">
      请选择一个账本（๑╹◡╹)ﾉ
    </div>
    <div class="fund-change-body" v-else>
      <div class="fund-change-body-grid">
        <div class="placeholder" v-if="detail.fundChange === null">
          请选择一条数据（๑╹◡╹)ﾉ
        </div>
        <div class="fund-change-body-grid-main" v-else>
          <el-divider class="expand-divider" content-position="left">资金变更详情</el-divider>
          <el-form class="fund-change-detail" label-position="left" inline label-width="70px">
            <el-form-item label="变更类型" style="width: 50%">
              <span>{{ formatChangeType(detail.fundChange) }}</span>
            </el-form-item>
            <el-form-item label="变更日期" style="width: 50%">
              <!--suppress JSUnresolvedVariable -->
              <span>{{ formatTimestamp(detail.fundChange.happened_date) }}</span>
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
          <fund-change-chart
            class="fund-change-chart"
            :show-title="false"
            :hover-animation="false"
            :category="detail.category"
            :data="detail.data"
          />
        </div>
      </div>
      <el-divider class="vertical-divider" direction="vertical"/>
      <div class="fund-change-body-grid">
        <el-divider class="expand-divider" content-position="left">类型选择</el-divider>
        <el-select
          class='fund-change-type-select'
          v-model="detail.change_type"
          placeholder="选择资金变更类型以查看图表"
          @change="handleChangeTypeChanged"
        >
          <el-option
            v-for="item in fundChangeTypeIndicator.entities.data"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
        <el-divider class="expand-divider" content-position="left">资金变更列表</el-divider>
        <table-panel
          class="fund-change-table"
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.entities.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[15,20,30,50]"
          :table-data="table.entities.data"
          :edit-button-visible="false"
          :delete-button-visible="false"
          @onPagingAttributeChanged="handleTablePagingAttributeChanged"
          @onEntityInspect="handleEntityInspect"
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
import FundChangeChart from '@/views/financeManagement/financeReport/FundChangeChart.vue';
import TablePanel from '@/components/layout/TablePanel.vue';

import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';
import {
  childForAccountBookDescDisp,
  childForAccountBookDisp,
  childForAccountBookTypeEqualsDescDisp,
} from '@/api/finance/fundChange';
import { all as allFundChangeTypeIndicator } from '@/api/finance/fundChangeTypeIndicator';

export default {
  name: 'FundChangePanel',
  components: { FundChangeChart, TablePanel },
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
      detail: {
        fundChange: null,
        aimChangeType: '',
        category: [],
        data: [],
      },
      table: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
        pageSize: 15,
        dialogVisible: false,
      },
      fundChangeTypeIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
    };
  },
  methods: {
    handleTablePagingAttributeChanged() {
      this.handleFundChangeSearch(this.selection.accountBookId);
    },
    handleFundChangeSearch(accountBookId) {
      resolveResponse(this, childForAccountBookDescDisp(
        accountBookId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(this, childForAccountBookDisp(
              accountBookId, this.table.currentPage, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then((res) => {
          this.table.entities = res;
          this.table.currentPage = res.current_page;
        })
        .then(() => {
          this.updateDetail(0, '');
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
      this.handleFundChangeSearch(accountBookId);
    },
    updateDetail(index, changeType) {
      this.updateEntityDetail(index);
      this.updateChartDetail(changeType);
    },
    updateEntityDetail(index) {
      if (index >= this.table.entities.data.length) {
        this.detail.fundChange = null;
        return;
      }
      this.detail.fundChange = this.table.entities.data[index];

      // noinspection JSUnresolvedVariable
      const formattedTotalValue = this.detail.fundChange.delta.toFixed(2);
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
    updateChartDetail(changeType) {
      this.detail.category = [];
      this.detail.data = [];
      Promise.resolve(this.selection.accountBookId)
        .then((res) => {
          if (changeType === '') {
            return resolveResponse(this, childForAccountBookDescDisp(res, 0, 20));
          }
          return resolveResponse(this, childForAccountBookTypeEqualsDescDisp(
            res, changeType, 0, 20,
          ));
        })
        .then((res) => {
          console.log(res);
          const data = res.data.reverse();
          data.forEach((item) => {
            // noinspection JSUnresolvedVariable
            this.detail.category.push(formatTimestamp(item.happened_date));
            // noinspection JSUnresolvedVariable
            this.detail.data.push({
              value: [formatTimestamp(item.happened_date), item.delta],
            });
          });
        });
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
    formatChangeType(fundChange) {
      // noinspection JSUnresolvedVariable
      if (fundChange.type_indicator !== null) {
        // noinspection JSUnresolvedVariable
        return fundChange.type_indicator.label;
      }
      if ((fundChange.change_type !== '' || fundChange.change_type !== null)) {
        return '（未知）';
      }
      return '（未指定）';
    },
    formatTimestamp(timestamp) {
      return formatTimestamp(timestamp);
    },
    handleEntityInspect(index) {
      this.updateEntityDetail(index);
    },
    handleFundChangeTypeIndicatorSearch() {
      resolveResponse(this, allFundChangeTypeIndicator(0, 1000))
        .then((res) => {
          this.fundChangeTypeIndicator.entities = res;
          // 在列表的最开始添加默认的实体，代表全选。
          this.fundChangeTypeIndicator.entities.data.splice(0, 0, {
            key: { string_id: '' },
            label: '选择所有',
          });
        })
        .catch(() => {
        });
    },
    handleChangeTypeChanged(value) {
      this.updateChartDetail(value);
    },
  },
  mounted() {
    this.handleFundChangeTypeIndicatorSearch();
  },
};
</script>

<style scoped>
.fund-change-panel-container {
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

.fund-change-body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.fund-change-body-grid {
  height: 100%;
  width: 0;
  box-sizing: border-box;
  padding: 1px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.fund-change-body-grid:first-child {
  margin-right: 1px;
}

.fund-change-body-grid:last-child {
  margin-left: 1px;
}

.fund-change-body-grid-main {
  width: 100%;
  height: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.fund-change-detail >>> label {
  width: 240px;
  color: #99a9bf;
}

/*noinspection CssUnusedSymbol*/
.fund-change-detail >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
}

/*noinspection CssUnusedSymbol*/
.fund-change-detail >>> .el-form-item {
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

.fund-change-chart {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.fund-change-table {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.fund-change-type-select {
  width: 100%;
}
</style>
