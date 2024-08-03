<template>
  <div class="activity-data-record-panel-container">
    <div v-if="activityId===''" class="placeholder">请选择活动</div>
    <!--suppress VueUnrecognizedDirective -->
    <div v-else v-loading="loading" class="main-container">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowEntityCreateDialog"
            >
              新建数据记录
            </el-button>
            <el-divider direction="vertical"/>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <el-divider direction="vertical"/>
            <el-select
              class="select"
              v-model="select.value"
              placeholder="请选择"
              @change="handleSearch"
            >
              <el-option
                v-for="item in select.options"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              />
            </el-select>
            <div style="flex-grow: 1"/>
            <el-button
              class="icon-button"
              v-if="mode==='DEFAULT'"
              type="info"
              @click="handlePanelFloatyButtonClicked"
            >
              <i class="iconfont">&#xffd3;</i>
            </el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table-container"
            :page-size.sync="table.pageSize"
            :entity-count="parseInt(table.entities.count)"
            :current-page.sync="table.currentPage"
            :page-sizes="[10,20,30,50]"
            :table-data="table.entities.data"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="item_key"
                label="数据条目"
                show-tooltip-when-overflow
                :formatter="itemFormatter"
              />
              <el-table-column
                prop="value"
                label="值"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="recorded_date"
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
                  @click="handleShowEntityInspectDialog($index,row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  :disabled="readonly"
                  @click="handleShowEntityEditDialog($index,row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  :disabled="readonly"
                  @click="handleEntityDelete($index,row)"
                />
              </el-button-group>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      :loading="maintainDialog.loading"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="数据条目" prop="item_key.long_id">
        <activity-data-item-selector
          v-model="maintainDialog.anchorEntity.item_key.long_id"
          :readonly="maintainDialog.mode==='INSPECT'"
        />
      </el-form-item>
      <el-form-item label="值" prop="value">
        <el-input
          v-model="maintainDialog.anchorEntity.value"
          :readonly="maintainDialog.mode==='INSPECT'"
          @input="handleValueInput($event)"
        />
      </el-form-item>
      <el-form-item
        v-if="maintainDialog.mode === 'INSPECT'"
        label="记录日期"
        prop="recorded_date"
      >
        <el-input
          v-model="maintainDialog.anchorEntity.formatted_recorded_date"
          readonly
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode==='INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import ActivityDataItemSelector
from '@/views/items/life/activityManagement/ActivityDataItemSelector.vue';

import {
  childForActivityRecordedDateAscDisp,
  childForActivityRecordedDateDescDisp,
  create,
  remove,
  update,
} from '@/api/life/activityDataRecord';
import resolveResponse from '@/util/response';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'ActivityDataRecordPanel',
  components: {
    ActivityDataItemSelector, EntityMaintainDialog, TablePanel, HeaderLayoutPanel,
  },
  props: {
    activityId: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'DEFAULT',
      validator(value) {
        return ['DEFAULT', 'FLOATY'].indexOf(value) !== -1;
      },
    },
  },
  watch: {
    activityId() {
      this.handleSearch();
    },
  },
  data() {
    return {
      loading: false,
      select: {
        value: 'recorded-date-desc',
        options: [
          { key: 'recorded-date-desc', label: '由新到旧' },
          { key: 'recorded-date-asc', label: '由旧到新' },
        ],
      },
      table: {
        loading: false,
        currentPage: 0,
        pageSize: 10,
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      maintainDialog: {
        loading: false,
        mode: 'INSPECT',
        visible: false,
        anchorEntity: {
          key: {
            long_id: '',
          },
          item_key: {
            long_id: '',
          },
          value: '',
          remark: '',
          formatted_recorded_date: '',
        },
        rules: {
          'item_key.long_id': [
            { required: true, message: '数据条目不能为空', trigger: 'blur' },
          ],
          value: [
            { required: true, message: '值不能为空', trigger: 'blur' },
          ],
        },
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.activityId === '') {
        return;
      }
      if (this.select.value === 'recorded-date-asc') {
        this.lookupChildForActivityRecordedDateAsc();
      } else if (this.select.value === 'recorded-date-desc') {
        this.lookupChildForActivityRecordedDateDesc();
      }
    },
    lookupChildForActivityRecordedDateAsc() {
      this.loading = true;
      resolveResponse(childForActivityRecordedDateAscDisp(
        this.activityId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForActivityRecordedDateAscDisp(
              this.activityId, res.total_pages - 1, this.record.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .finally(() => {
          this.loading = false;
        });
    },
    lookupChildForActivityRecordedDateDesc() {
      this.loading = true;
      resolveResponse(childForActivityRecordedDateDescDisp(
        this.activityId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForActivityRecordedDateDescDisp(
              this.activityId, res.total_pages - 1, this.record.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .finally(() => {
          this.loading = false;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
      return Promise.resolve();
    },
    itemFormatter(row) {
      if (!row.item) {
        return '（未知）';
      }
      return row.item.name;
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleShowEntityCreateDialog() {
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
      const { anchorEntity } = this.maintainDialog;
      anchorEntity.key.long_id = entity.key.long_id;
      anchorEntity.item_key.long_id = entity.item_key.long_id;
      anchorEntity.value = entity.value;
      anchorEntity.recorded_date = entity.recorded_date;
      anchorEntity.remark = entity.remark;
      anchorEntity.formatted_recorded_date = formatTimestamp(entity.recorded_date);
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handleValueInput(value) {
      this.record.maintainDialog.anchorEntity.value = this.limitInput(value);
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
      const tempResult = val.join('')
        .match(/^\d*(\.?\d*)/g)[0] || '';

      return `${lead}${tempResult}`;
    },
    handleEntityCreate() {
      resolveResponse(create(
        this.maintainDialog.anchorEntity.item_key.long_id,
        this.activityId,
        this.maintainDialog.anchorEntity.value,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '数据记录创建成功',
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
        this.maintainDialog.anchorEntity.key.long_id,
        this.maintainDialog.anchorEntity.value,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '数据记录更新成功',
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
    handleEntityDelete(category, entity) {
      Promise.resolve(entity.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此数据记录。<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(res)).then(() => res))
        .then(() => {
          this.$message({
            showClose: true,
            message: '数据记录删除成功',
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
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.activity-data-record-panel-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
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

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .select {
  width: 135px;
}

.header-container .icon-button {
  padding: 11px;
}

.table-container {
  width: 100%;
  height: 100%;
}

.table-button {
  padding: 7px
}
</style>
