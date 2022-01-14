<template>
  <div class="category-maintain-panel-container">
    <div class="main-content">
      <div>
        <el-button
          class="insert-button"
          type="primary"
          @click="handleShowEntityCreateDialog"
        >
          新建{{ label }}
        </el-button>
      </div>
      <el-divider/>
      <table-panel
        class="table-panel"
        :page-size.sync="tablePanel.pageSize"
        :entity-count="parseInt(tablePanel.entities.count)"
        :current-page.sync="tablePanel.currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="tablePanel.entities.data"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
        @onEntityInspect="handleShowEntityInspectDialog"
        @onEntityEdit="handleShowEntityEditDialog"
        @onEntityDelete="handleEntityDelete"
      >
        <el-table-column
          prop="key.string_id"
          label="代号"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="label"
          label="标签"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="remark"
          label="备注"
          show-tooltip-when-overflow
        />
      </table-panel>
    </div>
    <entity-maintain-dialog
      label-width="100px"
      :mode="maintainDialog.dialogMode"
      :visible.sync="maintainDialog.dialogVisible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.createRules"
      :edit-rules="maintainDialog.editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="性别类型" prop="string_id">
        <el-input
          v-model="maintainDialog.anchorEntity.string_id"
          oninput="this.value = this.value.toLowerCase().replace('&','')"
          :disabled="maintainDialog.dialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="maintainDialog.anchorEntity.label"
          :readonly="maintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import TablePanel from '@/components/table/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  exists, insert, remove, update, childForCategory,
} from '@/api/clannad/profileTypeIndicator';
import resolveResponse from '@/util/response';

export default {
  name: 'CategoryMaintainPanel',
  components: { TablePanel, EntityMaintainDialog },
  props: {
    category: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
  },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error(`${this.label}不能为空`));
            return Promise.reject();
          }
          return resolveResponse(exists(this.category, value));
        })
        .then((res) => {
          if (res) {
            callback(new Error(`${this.label}已经存在`));
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
      tablePanel: {
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
        dialogVisible: false,
        dialogMode: 'CREATE',
        anchorEntity: {
          string_id: '',
          label: '',
          remark: '',
        },
        createRules: {
          string_id: [
            { validator: keyValidator, trigger: 'blur' },
          ],
          label: [
            { required: true, message: '标签不能为空', trigger: 'blur' },
          ],
        },
        editRules: {
          label: [
            { required: true, message: '标签不能为空', trigger: 'blur' },
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
      this.lookupChildForCategory();
    },
    lookupChildForCategory() {
      resolveResponse(childForCategory(
        this.category, this.tablePanel.currentPage, this.tablePanel.pageSize,
      ))
        .then((res) => {
        // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForCategory(
              this.category, res.total_pages, this.tablePanel.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    updateTableView(res) {
      this.tablePanel.entities = res;
      this.tablePanel.currentPage = res.current_page;
    },
    handleEntityCreate() {
      resolveResponse(insert(
        this.category,
        this.maintainDialog.anchorEntity.string_id,
        this.maintainDialog.anchorEntity.label,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `${this.label} ${this.maintainDialog.anchorEntity.string_id} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.maintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleEntityEdit() {
      resolveResponse(update(
        this.category,
        this.maintainDialog.anchorEntity.string_id,
        this.maintainDialog.anchorEntity.label,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `${this.label} ${this.maintainDialog.anchorEntity.string_id} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.maintainDialog.dialogVisible = false;
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
    handleEntityDelete(node, entity) {
      Promise.resolve(entity.key.string_id)
        .then((res) => this.$confirm('此操作将永久删除此性别类型。<br>'
          + '如果已经有性别属于这个类型，那么该银行的类型将会变为"（未知）"！<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(this.category, res)).then(() => res))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `${this.label} ${res} 删除成功`,
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
      this.maintainDialog.anchorEntity.string_id = entity.key.string_id;
      this.maintainDialog.anchorEntity.label = entity.label;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.dialogMode = mode;
      this.$nextTick(() => {
        this.maintainDialog.dialogVisible = true;
      });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.category-maintain-panel-container {
  height: 100%;
  width: 100%;
}

.main-content{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.el-divider {
  margin-top: 8px;
  margin-bottom: 8px;
}

.table-panel {
  height: 0;
  flex-grow: 1;
  padding-bottom: 1px;
}
</style>
