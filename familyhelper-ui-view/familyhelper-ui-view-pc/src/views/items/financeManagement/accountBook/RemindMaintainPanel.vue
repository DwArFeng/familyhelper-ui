<template>
  <div class="remind-maintain-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container" slot="header">
          <el-button
            class="insert-button"
            type="primary"
            @click="handleShowEntityCreateDialog"
          >
            新建驱动器
          </el-button>
          <el-button type="success" @click="handleSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.entities.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[15,20,30,50]"
          :table-data="table.entities.data"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
          @onEntityInspect="handleShowEntityInspectDialog"
          @onEntityEdit="handleShowEntityEditDialog"
          @onEntityDelete="handleEntityDelete"
        >
          <el-table-column
            prop="enabled"
            label="使能"
            show-tooltip-when-overflow
            :formatter="booleanFormatter"
          />
          <el-table-column
            prop="type"
            label="类型"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="param"
            label="参数"
            class-name="single-line"
          />
          <el-table-column
            prop="remind_scope_type"
            label="提醒范围"
            :formatter="remindScopeTypeFormatter"
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
        </table-panel>
      </template>
    </header-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      top="9vh"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.createRules"
      :edit-rules="maintainDialog.editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="maintainDialog.anchorEntity.enabled"
          active-text="是"
          inactive-text="否"
          :disabled="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="maintainDialog.anchorEntity.type"
          :readonly="maintainDialog.mode === 'INSPECT'"
        >
          <el-button
            v-if="maintainDialog.mode !== 'INSPECT'"
            slot="append"
            icon="el-icon-search"
            @click="supportDialog.visible = true"
          />
        </el-input>
      </el-form-item>
      <el-form-item label="参数" prop="param">
        <text-editor
          class="text-editor"
          v-model="maintainDialog.anchorEntity.param"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="提醒范围" prop="remind_scope_type">
        <el-select
          v-model="maintainDialog.anchorEntity.remind_scope_type"
          placeholder="请选择"
          :disabled="maintainDialog.mode === 'INSPECT'"
        >
          <el-option
            v-for="indicator in remindScopeIndicators"
            :key="indicator.key"
            :label="indicator.label"
            :value="indicator.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <remind-driver-support-select-dialog
      :visible.sync="supportDialog.visible"
      @onConfirmed="handleSupportSelected"
    />
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import RemindDriverSupportSelectDialog
from '@/views/items/financeManagement/remindDriverSupport/RemindDriverSupportSelectDialog.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import {
  childForAccountBook, insert, remove, update,
} from '@/api/finance/remindDriverInfo';
import { exists as existsSupport } from '@/api/finance/remindDriverSupport';
import resolveResponse from '@/util/response';
import TextEditor from '@/components/text/TextEditor.vue';

export default {
  name: 'RemindMaintainPanel',
  components: {
    TextEditor,
    TablePanel,
    RemindDriverSupportSelectDialog,
    EntityMaintainDialog,
    HeaderLayoutPanel,
  },
  props: {
    accountBookId: {
      type: String,
      default: '',
    },
  },
  watch: {
    accountBookId(value) {
      if (value === '') {
        return;
      }
      this.handleSearch();
    },
  },
  data() {
    const typeValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(existsSupport(value));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('类型不支持'));
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          callback();
        })
        .catch(() => {
        });
    };
    return {
      loading: false,
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
      },
      maintainDialog: {
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          key: {
            long_id: '',
          },
          enabled: false,
          type: '',
          param: '',
          remind_scope_type: 0,
          remark: '',
        },
        createRules: {
          formatter_type: [
            { validator: typeValidator, trigger: 'blur' },
          ],
        },
        editRules: {
          formatter_type: [
            { validator: typeValidator, trigger: 'blur' },
          ],
        },
      },
      supportDialog: {
        visible: false,
      },
      remindScopeIndicators: [
        { key: 0, label: '仅自己' },
        { key: 1, label: '写权限者' },
        { key: 2, label: '读权限者' },
      ],
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupChildForAccountBook();
    },
    lookupChildForAccountBook() {
      resolveResponse(childForAccountBook(
        this.accountBookId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForAccountBook(
              this.accountBookId, res.total_pages, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    handleEntityCreate() {
      resolveResponse(insert(
        '',
        this.accountBookId,
        this.maintainDialog.anchorEntity.enabled,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.param,
        this.maintainDialog.anchorEntity.remind_scope_type,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '驱动器创建成功',
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
        this.accountBookId,
        this.maintainDialog.anchorEntity.enabled,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.param,
        this.maintainDialog.anchorEntity.remind_scope_type,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '驱动器更新成功',
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
    handleEntityDelete(category, entity) {
      Promise.resolve(entity.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此驱动器。<br>'
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
            message: '提醒驱动删除成功',
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
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.key.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.enabled = entity.enabled;
      this.maintainDialog.anchorEntity.type = entity.type;
      this.maintainDialog.anchorEntity.param = entity.param;
      this.maintainDialog.anchorEntity.remind_scope_type = entity.remind_scope_type;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.$nextTick(() => {
        this.maintainDialog.visible = true;
      });
    },
    handleSupportSelected(selection) {
      this.maintainDialog.anchorEntity.type = selection.key.string_id;
      this.maintainDialog.anchorEntity.param = selection.example_param;
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value === null || value === undefined) {
        return '';
      }
      return value ? '是' : '否';
    },
    remindScopeTypeFormatter(row, column) {
      const value = row[column.property];
      // eslint-disable-next-line no-restricted-syntax
      for (const indicator of this.remindScopeIndicators) {
        if (indicator.key === value) {
          return indicator.label;
        }
      }
      return '（未知）';
    },
  },
  mounted() {
    if (this.accountBookId === '') {
      return;
    }
    this.handleSearch();
  },
};
</script>

<style scoped>
.remind-maintain-panel-container {
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
.table >>> .single-line .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor {
  height: 300px;
}
</style>
