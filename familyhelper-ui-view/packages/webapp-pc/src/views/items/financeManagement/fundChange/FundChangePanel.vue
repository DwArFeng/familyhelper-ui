<template>
  <div class="fund-change-panel-container">
    <div class="center-panel-wrapper">
      <div class="placeholder" v-if="accountBook===null">请选择一个账本（๑╹◡╹)ﾉ</div>
      <header-layout-panel class="center-panel" v-else v-loading="loading">
        <table-panel
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.entities.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[10,15,30,50]"
          :table-data="table.entities.data"
          :show-contextmenu="true"
          :table-selection.sync="table.selection"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
        >
          <template v-slot:default>
            <!--suppress HtmlDeprecatedAttribute -->
            <el-table-column
              prop="delta"
              label="变更金额"
              align="right"
              width="110px"
              show-tooltip-when-overflow
              :formatter="deltaFormatter"
            />
            <el-table-column
              prop="change_type"
              label="资金变更类型"
              width="120px"
              show-tooltip-when-overflow
              :formatter="changeTypeFormatter"
            />
            <el-table-column
              prop="happened_date"
              label="变更日期"
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
                @click="handleShowEntityInspectDialog($index, row)"
              />
              <!--suppress JSUnresolvedReference -->
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-edit"
                type="primary"
                :disabled="accountBook.permission_level !== 0"
                @click="handleShowEntityEditDialog($index, row)"
              />
              <!--suppress JSUnresolvedReference -->
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-delete"
                type="danger"
                :disabled="accountBook.permission_level !== 0"
                @click="handleEntityDelete($index, row)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{index,row,close}">
            <ul class="my-contextmenu">
              <!--suppress JSUnresolvedVariable -->
              <li
                @click="handleInspectMenuItemClicked(index,row,close,$event)"
              >
                查看...
              </li>
              <!--suppress JSUnresolvedVariable -->
              <li
                :class="{disabled:accountBook.permission_level !== 0}"
                @click="handleEditMenuItemClicked(index,row,close,$event)"
              >
                编辑...
              </li>
              <!--suppress JSUnresolvedVariable -->
              <li
                :class="{disabled:accountBook.permission_level !== 0}"
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
          <el-button type="success" @click="handleSearch">
            刷新数据
          </el-button>
          <el-divider direction="vertical"/>
          <fund-change-type-selector
            class="fund-change-type-selector"
            v-model="typeSelector.value"
            placeholder="资金变更类型"
            clearable
            @change="handleSearch"
          />
          <el-divider direction="vertical"/>
          <el-input
            class="remark-search-bar"
            v-model="remarkSearchBar.value"
            clearable
            @keydown.enter.native="handleSearch"
            @clear="handleSearch"
          >
            <template v-slot:prepend>
              <span>备注</span>
            </template>
            <template v-slot:append>
              <el-button
                icon="el-icon-search"
                @click="handleSearch"
              />
            </template>
          </el-input>
        </div>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      label-width="100px"
      create-title="记录"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityRecord"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="变更金额" prop="delta">
        <el-input
          v-model="maintainDialog.anchorEntity.delta"
          placeholder="请填变更金额"
          :readonly="maintainDialog.mode === 'INSPECT'"
          @input="handleRecordBalanceInput($event)"
        />
      </el-form-item>
      <el-form-item label="类型" prop="change_type">
        <el-input
          v-model="maintainDialog.anchorEntity.formatted_change_type"
          readonly
          v-if="maintainDialog.mode === 'INSPECT'"
        />
        <fund-change-type-selector
          class='fund-change-type-select'
          v-model="maintainDialog.anchorEntity.change_type"
          placeholder="请选择"
          v-else
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="变更日期" prop="happened_date">
        <el-input
          v-model="maintainDialog.anchorEntity.formatted_happened_date"
          readonly
          v-if="maintainDialog.mode === 'INSPECT'"
        />
        <!--suppress JSValidateTypes -->
        <el-date-picker
          class="form-date-picker"
          v-else
          v-model="maintainDialog.anchorEntity.happened_date"
          type="datetime"
          placeholder="请选择变更日期，不填写默认为当前时间"
          :picker-options="maintainDialog.pickerOptions"
          :editable="true"
        />
      </el-form-item>
      <el-form-item
        v-if="maintainDialog.mode === 'INSPECT'"
        label="记录日期"
        prop="formatted_happened_date"
      >
        <el-input
          v-model="maintainDialog.anchorEntity.formatted_happened_date"
          readonly
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import FundChangeTypeSelector
from '@/views/items/financeManagement/fundChangeTypeIndicator/FundChangeTypeSelector.vue';

import {
  childForAccountBookWithConditionDisplayDisp,
  record,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'FundChangePanel',
  components: {
    FundChangeTypeSelector, TablePanel, EntityMaintainDialog, HeaderLayoutPanel,
  },
  props: {
    accountBook: {
      type: Object,
      default: () => null,
    },
    fundChangeSelection: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    headerButtonDisabled() {
      return this.accountBook === null || this.accountBook.permission_level !== 0;
    },
  },
  watch: {
    accountBook() {
      this.handleSearch();
    },
    'table.selection': {
      handler(value) {
        this.$emit('update:fundChangeSelection', value);
      },
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
      loading: 0,
      table: {
        currentPage: 0,
        pageSize: 10,
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        selection: null,
      },
      maintainDialog: {
        mode: 'CREATE',
        visible: false,
        rules: {
          delta: [
            { validator: deltaValidator, trigger: 'blur' },
          ],
          change_type: [
            { required: true, message: '类型不能为空', trigger: 'change' },
          ],
        },
        anchorEntity: {
          long_id: '',
          delta: '',
          change_type: '',
          remark: '',
          formatted_change_type: '',
          happened_date: null,
          formatted_happened_date: '（当前时间）',
        },
        pickerOptions: {
          shortcuts: [
            {
              text: '一天前',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() - 3600 * 1000 * 24);
                picker.$emit('pick', date);
              },
            },
            {
              text: '两天前',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 2);
                picker.$emit('pick', date);
              },
            },
            {
              text: '三天前',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 3);
                picker.$emit('pick', date);
              },
            },
            {
              text: '四天前',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 4);
                picker.$emit('pick', date);
              },
            },
            {
              text: '五天前',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 5);
                picker.$emit('pick', date);
              },
            },
            {
              text: '一周前',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit('pick', date);
              },
            },
            {
              text: '两周前',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 7 * 2);
                picker.$emit('pick', date);
              },
            },
          ],
        },
      },
      typeSelector: {
        value: '',
      },
      remarkSearchBar: {
        value: '',
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.accountBook === null) {
        return;
      }
      this.lookupChildForAccountBookWithConditionDisplay();
    },
    lookupChildForAccountBookWithConditionDisplay() {
      this.loading += 1;
      resolveResponse(childForAccountBookWithConditionDisplayDisp(
        this.accountBook.key.long_id,
        this.typeSelector.value,
        this.remarkSearchBar.value,
        this.table.currentPage,
        this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForAccountBookWithConditionDisplayDisp(
              this.accountBook.key.long_id,
              this.typeSelector.value,
              this.remarkSearchBar.value,
              res.total_pages - 1,
              this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    handleEntityRecord() {
      resolveResponse(record(
        this.accountBook.key.long_id,
        this.maintainDialog.anchorEntity.delta,
        this.maintainDialog.anchorEntity.change_type,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.happened_date,
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
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        });
    },
    handleEntityEdit() {
      resolveResponse(update(
        this.maintainDialog.anchorEntity.long_id,
        this.maintainDialog.anchorEntity.delta,
        this.maintainDialog.anchorEntity.change_type,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.happened_date,
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
          this.maintainDialog.visible = false;
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
      // 去除 happened_date 的值，这样更加符合用户的预期。
      this.maintainDialog.anchorEntity.happened_date = null;
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
      this.maintainDialog.anchorEntity.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.delta = entity.delta;
      this.maintainDialog.anchorEntity.change_type = entity.change_type;
      this.maintainDialog.anchorEntity.remark = entity.remark;
      // noinspection JSUnresolvedVariable
      if (entity.type_indicator !== null) {
        // noinspection JSUnresolvedVariable
        this.maintainDialog.anchorEntity.formatted_change_type = entity.type_indicator.label;
      } else if ((entity.card_type !== '' || entity.card_type !== null)) {
        this.maintainDialog.anchorEntity.formatted_change_type = '（未知）';
      } else {
        this.maintainDialog.anchorEntity.formatted_change_type = '（未指定）';
      }
      this.maintainDialog.anchorEntity.happened_date = entity.happened_date;
      this.maintainDialog.anchorEntity.formatted_happened_date = this.formatHappenedDate(
        entity.happened_date,
      );
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handleRecordBalanceInput(value) {
      this.maintainDialog.anchorEntity.delta = this.limitInput(value);
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
        .match(/^\d*(\.?\d{0,2})/g)[0] || '';

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
    handleInspectMenuItemClicked(index, row, close) {
      close();
      this.handleShowEntityInspectDialog(index, row);
    },
    handleEditMenuItemClicked(index, row, close, event) {
      if (this.accountBook.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleShowEntityEditDialog(index, row);
    },
    handleDeleteMenuItemClicked(index, row, close, event) {
      if (this.accountBook.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleEntityDelete(index, row);
    },
    formatHappenedDate(happenedDate) {
      if (happenedDate === null) {
        return '（当前时间）';
      }
      return formatTimestamp(happenedDate);
    },
  },
};
</script>

<style scoped>
.fund-change-panel-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .fund-change-type-selector{
  width: 130px;
}

.header-container .remark-search-bar {
  width: 250px;
}

/*noinspection CssUnusedSymbol*/
.header-container .remark-search-bar >>> .el-input-group__prepend {
  padding: 0 10px;
}

.center-panel-wrapper {
  width: 100%;
  height: 100%;
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

.fund-change-type-select {
  width: 100%;
}

.table-button {
  padding: 7px
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

.center-panel {
  width: 100%;
  height: 100%;
}

.form-date-picker {
  width: 100%;
}
</style>
