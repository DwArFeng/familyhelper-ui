<template>
  <div class="balance-record-container">
    <content-panel
      class="content-panel"
      :header-visible="true"
    >
      <card-list-panel
        class="card-list-panel"
        ref="cardList"
        title-prop="name"
        card-width="calc(20% - 18px)"
        tabindex="0"
        :data="entities.data"
        :maxCard="1000"
        :inspect-button-visible="false"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :addon-button-visible="false"
        @onItemToEdit="handleShowRecordDialog"
        @keydown.ctrl.enter.native="handleCardListHotKeyDown"
      >
        <template slot-scope="card">
          <div class="balance-record-card-container">
            <div class="balance-record-property">
              <span
                class="iconfont balance-record-property-icon"
                style="color:black"
              >
                &#xffee;
              </span>
              <!--suppress JSUnresolvedVariable -->
              <div class="balance-record-property-text">
                <span>类型: </span>
                <el-tooltip
                  effect="dark"
                  placement="right"
                  :content="cardTypeLabel(card.item).remark"
                  :open-delay="500"
                >
                  <span>{{ cardTypeLabel(card.item).label }}</span>
                </el-tooltip>
              </div>
            </div>
            <div class="balance-record-property">
              <span
                class="iconfont balance-record-property-icon"
                style="color:black"
              >
                &#xfff9;
              </span>
              <!--suppress JSUnresolvedVariable -->
              <div class="balance-record-property-text">
                <div>
                  <!--suppress JSUnresolvedVariable -->
                  <div v-if="card.item.temp_flag">
                    <!--suppress JSUnresolvedVariable -->
                    <el-tooltip
                      effect="dark"
                      placement="right"
                      :content="'原余额：' + card.item.balance_value"
                      :open-delay="500"
                    >
                      <!--suppress JSUnresolvedVariable -->
                      <span>{{ '余额: ' + card.item.temp_balance_value }}</span>
                    </el-tooltip>
                  </div>
                  <!--suppress JSUnresolvedVariable -->
                  <span v-else>{{ '余额: ' + card.item.balance_value }}</span>
                </div>
              </div>
            </div>
            <div class="balance-record-property">
              <span
                class="iconfont balance-record-property-icon"
                style="color:black"
              >
                &#xffef;
              </span>
              <!--suppress JSUnresolvedVariable -->
              <div class="balance-record-property-text">
                <div>
                  <!--suppress JSUnresolvedVariable -->
                  <div v-if="card.item.temp_flag">
                    <!--suppress JSUnresolvedVariable -->
                    <el-tooltip
                      effect="dark"
                      placement="right"
                      :content="'原记录日期：' + formatTimestamp(card.item.last_recorded_date)"
                      :open-delay="500"
                    >
                      <!--suppress JSUnresolvedVariable -->
                      <span>
                        {{ '记录日期: ' + formatTimestamp(card.item.temp_last_recorded_date) }}
                      </span>
                    </el-tooltip>
                  </div>
                  <!--suppress JSUnresolvedVariable -->
                  <span v-else>
                    {{ '记录日期: ' + formatTimestamp(card.item.last_recorded_date) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="balance-record-property">
              <span
                class="iconfont balance-record-property-icon"
                style="color:black"
              >
                &#xffed;
              </span>
              <!--suppress JSUnresolvedVariable -->
              <span class="balance-record-property-text">
                提交状态: {{ card.item.temp_flag ? '待提交' : '未更改' }}
              </span>
            </div>
          </div>
        </template>
        <template slot-scope="bg" slot="header">
          <el-button-group class="card-list-button-group">
            <el-tooltip
              effect="dark"
              placement="top"
              content="记录余额"
              :open-delay="500"
            >
              <el-button
                class="card-list-header-button"
                size="mini"
                icon="el-icon-edit"
                @click="handleShowRecordDialog(bg.index, bg.item)"
              />
            </el-tooltip>
            <el-tooltip
              effect="dark"
              placement="top"
              content="撤销记录"
              :open-delay="500"
            >
              <el-button
                class="card-list-header-button"
                type="danger"
                size="mini"
                icon="el-icon-refresh-left"
                @click="handleBankCardRollback(bg.index, bg.item)"
              />
            </el-tooltip>
          </el-button-group>
        </template>
      </card-list-panel>
      <div class="header-container" slot="header">
        <el-button
          type="primary"
          :disabled="parentSelection.accountBookId===''"
          @click="handleRecordCommit"
        >
          提交记录
        </el-button>
        <el-button
          type="danger"
          :disabled="parentSelection.accountBookId===''"
          @click="handleRollbackAll"
        >
          撤销记录
        </el-button>
        <el-divider direction="vertical"/>
        <el-input
          class="header-account-book-indicator"
          v-model="parentSelection.displayValue"
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
    </content-panel>
    <account-book-select-dialog
      :visible.sync="accountBookSelectDialog.visible"
      @onConfirm="handleAccountBookConfirmed"
    />
    <el-dialog
      class="record-dialog-container"
      ref="dialog"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="输入余额"
      top="6vh"
      width="80%"
      :visible.sync="recordDialog.visible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleRecordDialogHotKeyDown"
    >
      <el-form
        ref="recordForm"
        label-width="80px"
        :model="recordDialog.anchorEntity"
        :rules="recordDialog.rules"
        :validate-on-rule-change="false"
        @submit.native.prevent
      >
        <el-form-item label="新余额" prop="balance">
          <div class="record-dialog-input-wrapper">
            <el-input
              v-model="recordDialog.anchorEntity.balance"
              placeholder="请填写余额"
              @input="handleRecordBalanceInput($event)"
            />
            <el-divider class="record-dialog-input-divider" direction="vertical"/>
            <el-input
              v-model="recordDialog.formattedBalance"
              placeholder="此处显示大写余额"
              readonly
            />
          </div>
        </el-form-item>
      </el-form>
      <div class="footer-container" slot="footer">
        <el-button type="primary" @click="handleBankCardToRecord">确定</el-button>
        <el-button @click="handleBankCardToCancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import CardListPanel from '@/components/layout/CardListPanel.vue';
import AccountBookSelectDialog
from '@/views/items/financeManagement/accountBook/AccountBookSelectDialog.vue';

import resolveResponse from '@/util/response';
import { recordCommit, rollbackAll } from '@/api/finance/accountBook';
import { childForAccountBookDisp, recordBalance, rollbackBalance } from '@/api/finance/bankCard';
import { all as allBankCardTypeIndicator } from '@/api/finance/bankCardTypeIndicator';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'BalanceRecord',
  components: {
    CardListPanel, ContentPanel, AccountBookSelectDialog,
  },
  data() {
    const deltaValidator = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('余额不能为空'));
      } else if (value === '+' || value === '-') {
        callback(new Error('请输入有效的数字'));
      } else {
        callback();
      }
    };
    return {
      parentSelection: {
        accountBookId: '',
        accountBook: null,
        displayValue: '',
      },
      entities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      cardList: {
        maxCard: 100,
      },
      accountBookSelectDialog: {
        visible: false,
      },
      bankCardTypeIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      recordDialog: {
        visible: false,
        anchorEntity: {
          long_id: '',
          name: '',
          balance: '',
        },
        formattedBalance: '',
        rules: {
          balance: [
            { validator: deltaValidator, trigger: 'blur' },
          ],
        },
      },
    };
  },
  methods: {
    handleBankCardTypeIndicatorSearch() {
      this.lookupAllBankCardTypeIndicator();
    },
    lookupAllBankCardTypeIndicator() {
      resolveResponse(allBankCardTypeIndicator(0, 1000))
        .then(this.updateBankCardTypeIndicatorObject)
        .catch(() => {
        });
    },
    updateBankCardTypeIndicatorObject(res) {
      this.bankCardTypeIndicator.entities = res;
    },
    handleSearch() {
      this.lookupChildForAccountBook();
    },
    lookupChildForAccountBook() {
      resolveResponse(childForAccountBookDisp(this.parentSelection.accountBookId, 0, 1000))
        .then(this.updateCardListView)
        .catch(() => {
        });
    },
    updateCardListView(res) {
      this.entities = res;
    },
    formatTimestamp(timestamp) {
      return formatTimestamp(timestamp);
    },
    updateParentSelectionDisplayValue() {
      if (this.parentSelection.accountBook === null) {
        this.parentSelection.displayValue = '（未选择账本）';
      } else {
        this.parentSelection.displayValue = this.parentSelection.accountBook.name;
      }
    },
    handleShowAccountBookSelectDialog() {
      this.accountBookSelectDialog.visible = true;
    },
    handleAccountBookConfirmed(accountBook) {
      this.parentSelection.accountBook = accountBook;
      this.parentSelection.accountBookId = accountBook.key.long_id;
      this.parentSelection.displayValue = accountBook.name;
      this.handleSearch();
    },
    cardTypeLabel(item) {
      // noinspection JSUnresolvedVariable
      if (item.type_indicator !== null) {
        // noinspection JSUnresolvedVariable
        return {
          label: item.type_indicator.label,
          remark: item.type_indicator.remark,
        };
      }
      if ((item.card_type !== '' || item.card_type !== null)) {
        return {
          label: '（未知）',
          remark: '该银行卡类型经过维护，但是类型已经被删除',
        };
      }
      return {
        label: '（未指定）',
        remark: '该银行卡未指定类型',
      };
    },
    handleShowRecordDialog(index, item) {
      this.recordDialog.anchorEntity.long_id = item.key.long_id;
      this.recordDialog.anchorEntity.name = item.name;
      // noinspection JSUnresolvedVariable
      let tempResult = item.temp_flag ? `${item.temp_balance_value}` : `${item.balance_value}`;
      if (tempResult === '0') {
        tempResult = '';
      }
      this.recordDialog.anchorEntity.balance = tempResult;
      this.recordDialog.formattedBalance = this.convertCurrency(tempResult);
      this.recordDialog.visible = true;
    },
    handleCardListHotKeyDown() {
      if (this.parentSelection.accountBookId === '') {
        return;
      }
      this.handleRecordCommit();
    },
    handleRecordDialogHotKeyDown() {
      this.handleBankCardToRecord();
    },
    handleBankCardToRecord() {
      this.$refs.recordForm.validate((accept) => {
        if (accept) {
          resolveResponse(recordBalance(
            this.recordDialog.anchorEntity.long_id,
            this.recordDialog.anchorEntity.balance,
          ))
            .then(() => {
              this.$message({
                showClose: true,
                message: `账本 ${this.recordDialog.anchorEntity.name} 余额记录成功，别忘了最后提交`,
                type: 'success',
                center: true,
              });
            })
            .then(() => {
              this.handleSearch();
              return Promise.resolve();
            })
            .then(() => {
              this.recordDialog.visible = false;
              // noinspection JSUnresolvedFunction
              this.$refs.cardList.$el.focus();
            })
            .catch(() => {
            });
        }
      });
    },
    handleBankCardToCancel() {
      this.recordDialog.visible = false;
      // noinspection JSUnresolvedFunction
      this.$refs.cardList.$el.focus();
    },
    handleBankCardRollback(index, item) {
      this.$confirm(`此操作撤销银行卡 ${item.name} 所记录的余额。<br>是否继续?`,
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        })
        .then(() => Promise.resolve())
        .catch(() => Promise.reject())
        .then(() => resolveResponse(rollbackBalance(item.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: `账本 ${item.name} 记录撤销成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.recordDialog.visible = false;
        })
        .catch(() => {
        });
    },
    handleRecordBalanceInput(value) {
      this.recordDialog.anchorEntity.balance = this.limitInput(value);
      this.recordDialog.formattedBalance = this.convertCurrency(
        this.recordDialog.anchorEntity.balance,
      );
    },
    limitInput(value) {
      if (value === '' || value === null) {
        return '';
      }

      let [lead] = value;
      let val;
      if (lead === '+' || lead === '-') {
        val = (value.substring(1) && value.substring(1).split('')) || [];
      } else {
        lead = '';
        val = (value && value.split('')) || [];
      }

      if (val.length === 0) {
        return lead;
      }

      const reg1 = /\d/;
      const reg2 = /\./;

      // 第一个字符不能为小数点
      if (val[0] === '.') {
        return lead;
      }
      // 过滤掉除数字和小数点外的字符
      val = val.filter((e) => reg1.test(e) || reg2.test(e));
      // 匹配小数点后只能有两位小数
      const tempResult = val.join('')
        .match(/^\d*(\.?\d{0,2})/g)[0] || null;

      // 设置最大值，不允许输入的余额超过此值。
      const maxValue = 999999999999.99;
      if (parseFloat(tempResult) > maxValue) {
        return `${lead}${maxValue}`;
      }
      return `${lead}${tempResult}`;
    },
    convertCurrency(value) {
      if (value === '-') {
        return '';
      }

      let lead = '';
      let absoluteValue;
      if (value.substring(0, 1) === '-') {
        lead = '负';
        absoluteValue = value.substring(1);
      } else {
        lead = '';
        absoluteValue = value;
      }

      const maxValue = 999999999999.99;
      if (parseFloat(absoluteValue) > maxValue) {
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
      return lead + str.replace(/零(千|百|拾|角)/g, '零')
        .replace(/(零)+/g, '零')
        .replace(/零(万|亿|元)/g, '$1')
        .replace(/(亿)万|壹(拾)/g, '$1$2')
        .replace(/^元零?|零分/g, '')
        .replace(/元$/g, '元整');
    },
    handleRecordCommit() {
      Promise.resolve(this.parentSelection.accountBook)
        .then((res) => this.$confirm(`此操作将提交账本 ${res.name} 下的所有银行卡记录。<br>是否继续?`,
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            customClass: 'custom-message-box__w500',
            type: 'warning',
          }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(recordCommit(res.key.long_id))
          .then(() => Promise.resolve(res)))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `账本 ${res.name} 提交成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
    handleRollbackAll() {
      Promise.resolve(this.parentSelection.accountBook)
        .then((res) => this.$confirm(`此操作将回滚账本 ${res.name} 下的所有银行卡记录。<br>是否继续?`,
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            customClass: 'custom-message-box__w500',
            type: 'warning',
          }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(rollbackAll(res.key.long_id))
          .then(() => Promise.resolve(res)))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `账本 ${res.name} 回滚成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
  },
  mounted() {
    this.updateParentSelectionDisplayValue();
    this.handleBankCardTypeIndicatorSearch();
  },
};
</script>

<style scoped>
.balance-record-container {
  height: 100%;
  width: 100%;
}

.header-account-book-indicator {
  width: 360px;
}

/*noinspection CssUnusedSymbol*/
.header-account-book-indicator >>> .el-input__inner {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.header-account-book-indicator >>> .el-input-group__prepend {
  padding: 0 10px;
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
}

/*noinspection CssUnusedSymbol*/
.record-dialog-container >>> .el-dialog {
  margin-bottom: 0 !important;
}

.card-list-button-group {
  display: flex;
}

.card-list-header-button {
  padding: 7px
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

.card-list-panel:focus{
  outline: none;
}
</style>
