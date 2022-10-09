<template>
  <div class="notify-setting-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <table-panel
        class="table"
        v-loading="table.loading"
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
          prop="label"
          label="名称"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="enabled"
          label="使能"
          width="50px"
          :formatter="booleanFormatter"
        />
        <el-table-column
          prop="required_permission"
          label="需求权限"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="remark"
          label="备注"
          show-tooltip-when-overflow
        />
      </table-panel>
      <div class="header-container" slot="header">
        <el-button
          class="insert-button"
          type="primary"
          @click="handleShowEntityCreateDialog"
        >
          新建通知设置
        </el-button>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      top="10vh"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="名称" prop="label">
        <el-input
          v-model="maintainDialog.anchorEntity.label"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="使能" prop="enabled">
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="maintainDialog.anchorEntity.enabled"
          active-text="是"
          inactive-text="否"
          :disabled="maintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="需求权限" prop="required_permission">
        <el-input
          ref="requiredPermissionInput"
          v-model="maintainDialog.anchorEntity.required_permission"
          :readonly="maintainDialog.mode === 'INSPECT'"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="permissionSelectDialog.visible=true"
          />
        </el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <permission-node-select-dialog
      :visible.sync="permissionSelectDialog.visible"
      @onPermissionNodeSelected="handlePermissionNodeSelected"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import PermissionNodeSelectDialog
from '@/views/items/systemSettings/permissionNode/PermissionNodeSelectDialog.vue';

import {
  all, insert, remove, update,
} from '@/api/notify/notifySetting';
import resolveResponse from '@/util/response';

export default {
  name: 'NotifySetting',
  components: {
    PermissionNodeSelectDialog, EntityMaintainDialog, TablePanel, BorderLayoutPanel,
  },
  data() {
    return {
      loading: false,
      table: {
        loading: false,
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
        loading: false,
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          key: {
            long_id: '',
          },
          label: '',
          enabled: false,
          required_permission: '',
          remark: '',
        },
        rules: {
          label: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
          ],
          required_permission: [
            { required: true, message: '需求权限不能为空', trigger: 'blur' },
          ],
        },
      },
      permissionSelectDialog: {
        visible: false,
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupAll();
    },
    lookupAll() {
      this.table.loading = true;
      resolveResponse(all(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(res.total_pages, this.table.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.table.loading = false;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    handleEntityCreate() {
      this.maintainDialog.loading = true;
      resolveResponse(insert(
        '',
        this.maintainDialog.anchorEntity.label,
        this.maintainDialog.anchorEntity.enabled,
        this.maintainDialog.anchorEntity.required_permission,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `通知设置 ${this.maintainDialog.anchorEntity.label} 创建成功`,
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
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.maintainDialog.anchorEntity.key.long_id,
        this.maintainDialog.anchorEntity.label,
        this.maintainDialog.anchorEntity.enabled,
        this.maintainDialog.anchorEntity.required_permission,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `通知设置 ${this.maintainDialog.anchorEntity.label} 更新成功`,
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
        })
        .finally(() => {
          this.maintainDialog.loading = false;
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
    handleEntityDelete(index, entity) {
      this.loading = true;
      Promise.resolve()
        .then(() => this.$confirm('此操作将永久删除此通知设置。<br>'
          + '该操作不可恢复！<br>'
          + '是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject()))
        .then(() => resolveResponse(remove(entity.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: `通知设置 ${entity.label} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.key.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.label = entity.label;
      this.maintainDialog.anchorEntity.enabled = entity.enabled;
      this.maintainDialog.anchorEntity.required_permission = entity.required_permission;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handlePermissionNodeSelected(permissionNode) {
      this.maintainDialog.anchorEntity.required_permission = permissionNode.key.string_id;
      this.$refs.requiredPermissionInput.focus();
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value === null || value === undefined) {
        return '';
      }
      return value ? '是' : '否';
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.notify-setting-container {
  height: 100%;
  width: 100%;
}

.focusable-switch:focus {
  outline: none;
}
</style>
