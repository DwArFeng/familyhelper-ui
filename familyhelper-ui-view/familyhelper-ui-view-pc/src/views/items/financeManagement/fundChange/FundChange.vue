<template>
  <div class="fund-change-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
    >
      <table-panel
        :page-size.sync="pageSize"
        :entity-count="parseInt(entities.count)"
        :current-page.sync="currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="entities.data"
        :show-contextmenu="true"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
      >
        <template v-slot:default>
          <!--suppress HtmlDeprecatedAttribute -->
          <el-table-column
            prop="delta"
            label="变更金额"
            align="right"
            show-tooltip-when-overflow
            :formatter="deltaFormatter"
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
        </template>
        <template v-slot:operateColumn="{$index,row}">
          <el-button-group class=operate-column>
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-search"
              type="success"
              :disabled="parentSelection.accountBook.permission_level !== 0"
              @click="handleShowEntityInspectDialog($index, row)"
            />
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-edit"
              type="primary"
              :disabled="parentSelection.accountBook.permission_level !== 0"
              @click="handleShowEntityEditDialog($index, row)"
            />
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-delete"
              type="danger"
              :disabled="parentSelection.accountBook.permission_level !== 0"
              @click="handleEntityDelete($index, row)"
            />
          </el-button-group>
        </template>
        <template v-slot:contextmenu="{index,row,close}">
          <ul class="my-contextmenu">
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:parentSelection.accountBook.permission_level !== 0}"
              @click="handleInspectMenuItemClicked(index,row,close,$event)"
            >
              查看...
            </li>
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:parentSelection.accountBook.permission_level !== 0}"
              @click="handleEditMenuItemClicked(index,row,close,$event)"
            >
              编辑...
            </li>
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:parentSelection.accountBook.permission_level !== 0}"
              @click="handleDeleteMenuItemClicked(index,row,close,$event)"
            >
              删除...
            </li>
          </ul>
        </template>
      </table-panel>
      <div class="header-container" slot="header">
        <el-button
          type="primary"
          :disabled="headerButtonDisabled"
          @click="handleShowEntityRecordDialog"
        >
          记录资金变更
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
    </border-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      create-title="记录"
      :mode="dialogMode"
      :visible.sync="dialogVisible"
      :entity="anchorEntity"
      :create-rules="rules"
      :edit-rules="rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityRecord"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="变更金额" prop="delta">
        <el-input
          v-model="anchorEntity.delta"
          placeholder="请填变更金额"
          :readonly="dialogMode === 'INSPECT'"
          @input="handleRecordBalanceInput($event)"
        />
      </el-form-item>
      <el-form-item label="类型" prop="change_type">
        <el-input
          v-model="anchorEntity.formatted_change_type"
          readonly
          v-if="dialogMode === 'INSPECT'"
        />
        <el-select
          class='fund-change-type-select'
          v-model="anchorEntity.change_type"
          placeholder="请选择"
          v-else
        >
          <el-option
            v-for="item in fundChangeTypeIndicator.entities.data"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="anchorEntity.remark"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <account-book-select-dialog
      type="FUND_CHANGE"
      :visible.sync="accountBookSelectDialog.visible"
      @onConfirm="handleAccountBookConfirmed"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import AccountBookSelectDialog
from '@/views/items/financeManagement/accountBook/AccountBookSelectDialog.vue';

import resolveResponse from '@/util/response';
import {
  childForAccountBookDescDisp, record, remove, update,
} from '@/api/finance/fundChange';
import {
  all as allFundChangeTypeIndicator,
} from '@/api/finance/fundChangeTypeIndicator';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'FundChange',
  components: {
    TablePanel, BorderLayoutPanel, EntityMaintainDialog, AccountBookSelectDialog,
  },
  computed: {
    headerButtonDisabled() {
      return this.parentSelection.accountBookId === ''
        || this.parentSelection.accountBook.permission_level !== 0;
    },
  },
  data() {
    const deltaValidator = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('变更金额不能为空'));
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
      currentPage: 0,
      pageSize: 15,
      dialogVisible: false,
      dialogMode: 'CREATE',
      anchorEntity: {
        long_id: '',
        delta: '',
        change_type: '',
        remark: '',
        formatted_change_type: '',
      },
      rules: {
        delta: [
          { validator: deltaValidator, trigger: 'blur' },
        ],
        change_type: [
          { required: true, message: '类型不能为空', trigger: 'change' },
        ],
      },
      accountBookSelectDialog: {
        visible: false,
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
    handleFundChangeTypeIndicatorSearch() {
      this.lookupAllFundChangeTypeIndicator();
    },
    lookupAllFundChangeTypeIndicator() {
      resolveResponse(allFundChangeTypeIndicator(0, 1000))
        .then(this.updateFundChangeTypeIndicatorObject)
        .catch(() => {
        });
    },
    updateFundChangeTypeIndicatorObject(res) {
      this.fundChangeTypeIndicator.entities = res;
    },
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupChildForAccountBook();
    },
    lookupChildForAccountBook() {
      resolveResponse(childForAccountBookDescDisp(
        this.parentSelection.accountBookId, this.currentPage, this.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForAccountBookDescDisp(
              this.parentSelection.accountBookId, this.currentPage, this.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    updateTableView(res) {
      this.entities = res;
      this.currentPage = res.current_page;
    },
    handleEntityRecord() {
      resolveResponse(record(
        this.parentSelection.accountBookId,
        this.anchorEntity.delta,
        this.anchorEntity.change_type,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '资金变更记录成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleEntityEdit() {
      resolveResponse(update(
        this.anchorEntity.long_id,
        this.anchorEntity.delta,
        this.anchorEntity.change_type,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '记录更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleEntityDelete(index, entity) {
      this.$confirm('此操作将永久删除此条记录。<br>是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(remove(entity.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '记录删除成功',
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
    handleShowEntityRecordDialog() {
      this.showDialog('CREATE');
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('INSPECT');
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('EDIT');
    },
    syncAnchorEntity(entity) {
      this.anchorEntity.long_id = entity.key.long_id;
      this.anchorEntity.delta = entity.delta;
      this.anchorEntity.change_type = entity.change_type;
      this.anchorEntity.remark = entity.remark;
      // noinspection JSUnresolvedVariable
      if (entity.type_indicator !== null) {
        // noinspection JSUnresolvedVariable
        this.anchorEntity.formatted_change_type = entity.type_indicator.label;
      } else if ((entity.card_type !== '' || entity.card_type !== null)) {
        this.anchorEntity.formatted_change_type = '（未知）';
      } else {
        this.anchorEntity.formatted_change_type = '（未指定）';
      }
    },
    showDialog(mode) {
      this.dialogMode = mode;
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
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
    handleRecordBalanceInput(value) {
      this.anchorEntity.delta = this.limitInput(value);
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
    deltaFormatter(row, column) {
      return row[column.property].toFixed(2);
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
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleInspectMenuItemClicked(index, row, close, event) {
      if (this.parentSelection.accountBook.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleShowEntityInspectDialog(index, row);
    },
    handleEditMenuItemClicked(index, row, close, event) {
      if (this.parentSelection.accountBook.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleShowEntityEditDialog(index, row);
    },
    handleDeleteMenuItemClicked(index, row, close, event) {
      if (this.parentSelection.accountBook.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleEntityDelete(index, row);
    },
  },
  mounted() {
    this.updateParentSelectionDisplayValue();
    this.handleFundChangeTypeIndicatorSearch();
    this.handleSearch();
  },
};
</script>

<style scoped>
.fund-change-container {
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

.fund-change-type-select {
  width: 100%;
}

.table-button {
  padding: 7px
}

.operate-column {
  /*display: flex;*/
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
</style>
