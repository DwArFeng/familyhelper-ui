<template>
  <div class="role-container">
    <content-panel
      class="content-panel"
      :header-visible="true"
      :east-visible="true"
    >
      <table-panel
        :page-size.sync="roleTablePanel.pageSize"
        :entity-count="parseInt(roleTablePanel.entities.count)"
        :current-page.sync="roleTablePanel.currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="roleTablePanel.entities.data"
        :table-selection.sync="roleTablePanel.selection"
        @onPagingAttributeChanged="handleRolePagingAttributeChanged"
        @onEntityInspect="handleShowRoleInspectDialog"
        @onEntityEdit="handleShowRoleEditDialog"
        @onEntityDelete="handleRoleDelete"
      >
        <el-table-column
          prop="key.string_id"
          label="角色ID"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="name"
          label="显示名称"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="enabled"
          label="启用"
          :formatter="enabledFormatter"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="remark"
          label="备注"
          show-tooltip-when-overflow
        />
      </table-panel>
      <table-panel
        slot="east"
        :page-size.sync="pexpTablePanel.pageSize"
        :entity-count="parseInt(pexpTablePanel.entities.count)"
        :current-page.sync="pexpTablePanel.currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="pexpTablePanel.entities.data"
        :table-selection.sync="pexpTablePanel.selection"
        @onPagingAttributeChanged="handlePexpPagingAttributeChanged"
        @onEntityInspect="handleShowPexpInspectDialog"
        @onEntityEdit="handleShowPexpEditDialog"
        @onEntityDelete="handlePexpDelete"
      >
        <el-table-column
          prop="content"
          label="表达式"
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
          type="primary"
          @click="handleShowRoleCreateDialog"
        >
          新建角色
        </el-button>
        <el-divider direction="vertical"/>
        <el-button
          type="primary"
          :disabled="roleTablePanel.selection === null"
          @click="handleShowPexpCreateDialog"
        >
          新建权限表达式
        </el-button>
      </div>
    </content-panel>
    <entity-maintain-dialog
      :mode="roleMaintainDialog.dialogMode"
      :visible.sync="roleMaintainDialog.dialogVisible"
      :entity="roleMaintainDialog.anchorEntity"
      :create-rules="roleMaintainDialog.createRules"
      :edit-rules="roleMaintainDialog.editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleRoleCreate"
      @onEntityEdit="handleRoleEdit"
    >
      <el-form-item label="账户ID" prop="key.string_id">
        <el-input
          v-model="roleMaintainDialog.anchorEntity.key.string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="roleMaintainDialog.dialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="roleMaintainDialog.anchorEntity.name"
          :readonly="roleMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="启用" prop="enabled" v-if="roleMaintainDialog.dialogMode !== 'CREATE'">
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="roleMaintainDialog.anchorEntity.enabled"
          active-text="启用"
          inactive-text="禁用"
          :disabled="roleMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="roleMaintainDialog.anchorEntity.remark"
          :readonly="roleMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <entity-maintain-dialog
      :mode="pexpMaintainDialog.dialogMode"
      :visible.sync="pexpMaintainDialog.dialogVisible"
      :entity="pexpMaintainDialog.anchorEntity"
      :create-rules="pexpMaintainDialog.rules"
      :edit-rules="pexpMaintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handlePexpCreate"
      @onEntityEdit="handlePexpEdit"
    >
      <el-form-item label="表达式" prop="content">
        <el-input
          v-model="pexpMaintainDialog.anchorEntity.content"
          :readonly="pexpMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="pexpMaintainDialog.anchorEntity.remark"
          :readonly="pexpMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import ContentPanel from '@/components/layout/LayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/dialog/EntityMaintainDialog.vue';

import {
  exists, insert as insertRole, update as updateRole, remove as removeRole, all as allRole,
} from '@/api/system/role';
import { childForRole } from '@/api/system/account';
import {
  insert as insertPexp,
  update as updatePexp,
  remove as removePexp,
  childForRole as childPexpForRole,
} from '@/api/system/pexp';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'Role',
  components: { ContentPanel, TablePanel, EntityMaintainDialog },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    'roleTablePanel.selection': {
      handler(val) {
        if (val === null) {
          this.pexpTablePanel.entities.current_page = 0;
          this.pexpTablePanel.entities.total_pages = 0;
          this.pexpTablePanel.entities.rows = 0;
          this.pexpTablePanel.entities.count = '0';
          this.pexpTablePanel.entities.data = [];
        } else {
          this.handlePexpSearch();
        }
      },
    },
  },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('角色不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('角色已经存在'));
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
      roleTablePanel: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
        pageSize: 15,
        selection: null,
      },
      roleMaintainDialog: {
        dialogVisible: false,
        dialogMode: 'CREATE',
        anchorEntity: {
          key: {
            string_id: '',
          },
          name: '',
          enabled: false,
          remark: '',
          original_enabled: false,
        },
        createRules: {
          'key.string_id': [
            { validator: keyValidator, trigger: 'blur' },
          ],
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
          ],
        },
        editRules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
          ],
        },
      },
      pexpTablePanel: {
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
      pexpMaintainDialog: {
        dialogVisible: false,
        dialogMode: 'CREATE',
        anchorEntity: {
          key: {
            long_id: '',
          },
          content: '',
          remark: '',
        },
        rules: {
          content: [
            { required: true, message: '表达式不能为空', trigger: 'blur' },
          ],
        },
      },
    };
  },
  methods: {
    handleRolePagingAttributeChanged() {
      this.roleTablePanel.selection = null;
      this.handleRoleSearch();
    },
    handleRoleSearch() {
      this.lookupAllRole();
    },
    lookupAllRole() {
      resolveResponse(allRole(this.roleTablePanel.currentPage, this.roleTablePanel.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allRole(res.total_pages, this.roleTablePanel.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateRoleTableView)
        .catch(() => {
        });
    },
    updateRoleTableView(res) {
      this.roleTablePanel.entities = res;
      this.roleTablePanel.currentPage = res.current_page;
    },
    handleRoleCreate() {
      resolveResponse(insertRole(
        this.roleMaintainDialog.anchorEntity.key.string_id,
        this.roleMaintainDialog.anchorEntity.name,
        true,
        this.roleMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `账户 ${this.roleMaintainDialog.anchorEntity.name} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleRoleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.roleMaintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleRoleEdit() {
      Promise.resolve()
        .then(() => {
          const roleKeyToUpdate = this.roleMaintainDialog.anchorEntity.key.string_id;
          const originalEnabled = this.roleMaintainDialog.anchorEntity.original_enabled;
          const newEnabled = this.roleMaintainDialog.anchorEntity.enabled;
          if (originalEnabled !== newEnabled) {
            return this.checkInfluenced(roleKeyToUpdate)
              .then((res) => {
                if (res) {
                  return this.$confirm('您似乎在改变一个您所属的角色的启用状态。<br>'
                    + '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据其余的角色重新分配权限</b></div>'
                    + '<b>您有可能失去系统的部分权限，且可能无法自行恢复</b><br>'
                    + '是否继续?',
                  '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    dangerouslyUseHTMLString: true,
                    customClass: 'custom-message-box__w500',
                    type: 'warning',
                  })
                    .then(() => Promise.resolve(true))
                    .catch(() => Promise.reject());
                }
                return Promise.resolve(false);
              });
          }
          return Promise.resolve(false);
        })
        .then((res) => resolveResponse(updateRole(
          this.roleMaintainDialog.anchorEntity.key.string_id,
          this.roleMaintainDialog.anchorEntity.name,
          this.roleMaintainDialog.anchorEntity.enabled,
          this.roleMaintainDialog.anchorEntity.remark,
        )).then(() => Promise.resolve(res)))
        .then((res) => {
          const roleId = this.roleMaintainDialog.anchorEntity.key.string_id;
          const { name } = this.roleMaintainDialog.anchorEntity;
          this.$message({
            showClose: true,
            message: `角色 ${name}(${roleId}) 更新成功`,
            type: 'success',
            center: true,
          });
          return Promise.resolve(res);
        })
        .then((res) => {
          if (res) {
            this.$message({
              showClose: true,
              message: '由于您改变了您所属的角色的启用状态，账号将会注销，请重新登录',
              type: 'warning',
              center: true,
            });
            return this.logout().then(() => Promise.reject());
          }
          return Promise.resolve();
        })
        .then(() => {
          this.handleRoleSearch();
        })
        .then(() => {
          this.roleMaintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleShowRoleCreateDialog() {
      this.showRoleDialog('CREATE');
    },
    handleShowRoleInspectDialog(index, entity) {
      this.syncAnchorRole(entity);
      this.showRoleDialog('INSPECT');
    },
    handleShowRoleEditDialog(index, entity) {
      this.syncAnchorRole(entity);
      this.showRoleDialog('EDIT');
    },
    handleRoleDelete(node, entity) {
      const roleKeyToDelete = entity.key.string_id;
      this.checkInfluenced(roleKeyToDelete)
        .then((res) => {
          if (res) {
            return this.$confirm('您似乎在删除一个您所属的角色。<br>'
              + '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据其余的角色重新分配权限</b></div>'
              + '<b>您有可能失去系统的部分权限，且可能无法自行恢复</b><br>'
              + '是否继续?',
            '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString: true,
              customClass: 'custom-message-box__w500',
              type: 'warning',
            })
              .then(() => Promise.resolve(true))
              .catch(() => Promise.reject());
          }
          return this.$confirm('此操作将永久删除此角色。<br>'
            + '<b>该操作将会影响所有数据该角色的用户的权限！</b><br>'
            + '是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            customClass: 'custom-message-box__w500',
            type: 'warning',
          })
            .then(() => Promise.resolve(false))
            .catch(() => Promise.reject());
        })
        .then((res) => resolveResponse(removeRole(roleKeyToDelete))
          .then(() => Promise.resolve(res)))
        .then((res) => {
          const roleId = entity.key.string_id;
          const { name } = entity;
          this.$message({
            showClose: true,
            message: `角色 ${name}(${roleId}) 删除成功`,
            type: 'success',
            center: true,
          });
          return Promise.resolve(res);
        })
        .then((res) => {
          if (res) {
            this.$message({
              showClose: true,
              message: '由于您删除了您所属的角色，账号将会注销，请重新登录',
              type: 'warning',
              center: true,
            });
            return this.logout().then(() => Promise.reject());
          }
          return Promise.resolve();
        })
        .then(() => {
          this.handleRoleSearch();
        })
        .catch(() => {
        });
    },
    syncAnchorRole(entity) {
      this.roleMaintainDialog.anchorEntity.key.string_id = entity.key.string_id;
      this.roleMaintainDialog.anchorEntity.name = entity.name;
      this.roleMaintainDialog.anchorEntity.enabled = entity.enabled;
      this.roleMaintainDialog.anchorEntity.remark = entity.remark;
      this.roleMaintainDialog.anchorEntity.original_enabled = entity.enabled;
    },
    showRoleDialog(mode) {
      this.roleMaintainDialog.dialogMode = mode;
      this.$nextTick(() => {
        this.roleMaintainDialog.dialogVisible = true;
      });
    },
    enabledFormatter(row, column) {
      return row[column.property] ? '是' : '否';
    },
    checkInfluenced(roleKey) {
      return resolveResponse(childForRole(roleKey, 0, 99999))
        .then((res) => Promise.resolve(
          res.data.find((r) => r.key.string_id === this.me) !== undefined,
        ));
    },
    handlePexpPagingAttributeChanged() {
      this.handlePexpSearch();
    },
    handlePexpSearch() {
      this.lookupChildPexpForRole();
    },
    lookupChildPexpForRole() {
      resolveResponse(
        childPexpForRole(
          this.roleTablePanel.selection.key.string_id,
          this.pexpTablePanel.currentPage,
          this.pexpTablePanel.pageSize,
        ),
      ).then((res) => {
        // 当查询的页数大于总页数，自动查询最后一页。
        if (res.current_page > res.total_pages && res.total_pages > 0) {
          return resolveResponse(
            childPexpForRole(
              this.roleTablePanel.selection.key.string_id,
              res.total_pages,
              this.pexpTablePanel.pageSize,
            ),
          );
        }
        return Promise.resolve(res);
      })
        .then(this.updatePexpTableView)
        .catch(() => {
        });
    },
    updatePexpTableView(res) {
      this.pexpTablePanel.entities = res;
      this.pexpTablePanel.currentPage = res.current_page;
    },
    handlePexpCreate() {
      const roleKey = this.roleTablePanel.selection.key.string_id;
      this.checkInfluenced(roleKey)
        .then((res) => {
          if (res) {
            return this.$confirm('您似乎在编辑一个您所属的角色的权限表达式。<br>'
              + '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据其余的角色重新分配权限</b></div>'
              + '<b>您有可能失去系统的部分权限，且可能无法自行恢复</b><br>'
              + '是否继续?',
            '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString: true,
              customClass: 'custom-message-box__w500',
              type: 'warning',
            })
              .then(() => Promise.resolve(true))
              .catch(() => Promise.reject());
          }
          return Promise.resolve(false);
        })
        .then((res) => resolveResponse(insertPexp(
          '',
          roleKey,
          this.pexpMaintainDialog.anchorEntity.content,
          this.pexpMaintainDialog.anchorEntity.remark,
        )).then(() => Promise.resolve(res)))
        .then((res) => {
          this.$message({
            showClose: true,
            message: '权限表达式编辑成功',
            type: 'success',
            center: true,
          });
          return Promise.resolve(res);
        })
        .then((res) => {
          if (res) {
            this.$message({
              showClose: true,
              message: '由于您编辑了您所属的角色的权限表达式，账号将会注销，请重新登录',
              type: 'warning',
              center: true,
            });
            return this.logout().then(() => Promise.reject());
          }
          return Promise.resolve();
        })
        .then(() => {
          this.handlePexpSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.pexpMaintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handlePexpEdit() {
      const roleKey = this.roleTablePanel.selection.key.string_id;
      this.checkInfluenced(roleKey)
        .then((res) => {
          if (res) {
            return this.$confirm('您似乎在编辑一个您所属的角色的权限表达式。<br>'
              + '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据其余的角色重新分配权限</b></div>'
              + '<b>您有可能失去系统的部分权限，且可能无法自行恢复</b><br>'
              + '是否继续?',
            '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString: true,
              customClass: 'custom-message-box__w500',
              type: 'warning',
            })
              .then(() => Promise.resolve(true))
              .catch(() => Promise.reject());
          }
          return Promise.resolve(false);
        })
        .then((res) => resolveResponse(updatePexp(
          this.pexpMaintainDialog.anchorEntity.key.long_id,
          roleKey,
          this.pexpMaintainDialog.anchorEntity.content,
          this.pexpMaintainDialog.anchorEntity.remark,
        )).then(() => Promise.resolve(res)))
        .then((res) => {
          this.$message({
            showClose: true,
            message: '权限表达式编辑成功',
            type: 'success',
            center: true,
          });
          return Promise.resolve(res);
        })
        .then((res) => {
          if (res) {
            this.$message({
              showClose: true,
              message: '由于您编辑了您所属的角色的权限表达式，账号将会注销，请重新登录',
              type: 'warning',
              center: true,
            });
            return this.logout().then(() => Promise.reject());
          }
          return Promise.resolve();
        })
        .then(() => {
          this.handlePexpSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.pexpMaintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleShowPexpCreateDialog() {
      this.showPexpDialog('CREATE');
    },
    handleShowPexpInspectDialog(index, entity) {
      this.syncAnchorPexp(entity);
      this.showPexpDialog('INSPECT');
    },
    handleShowPexpEditDialog(index, entity) {
      this.syncAnchorPexp(entity);
      this.showPexpDialog('EDIT');
    },
    handlePexpDelete(node, entity) {
      const roleKey = this.roleTablePanel.selection.key.string_id;
      const pexpKeyToDelete = entity.key.long_id;
      return this.checkInfluenced(roleKey)
        .then((res) => {
          if (res) {
            return this.$confirm('您似乎在编辑一个您所属的角色的权限表达式。<br>'
              + '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据其余的角色重新分配权限</b></div>'
              + '<b>您有可能失去系统的部分权限，且可能无法自行恢复</b><br>'
              + '是否继续?',
            '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString: true,
              customClass: 'custom-message-box__w500',
              type: 'warning',
            })
              .then(() => Promise.resolve(true))
              .catch(() => Promise.reject());
          }
          return Promise.resolve(false);
        })
        .then((res) => resolveResponse(removePexp(pexpKeyToDelete))
          .then(() => Promise.resolve(res)))
        .then((res) => {
          this.$message({
            showClose: true,
            message: '权限表达式编辑成功',
            type: 'success',
            center: true,
          });
          return Promise.resolve(res);
        })
        .then((res) => {
          if (res) {
            this.$message({
              showClose: true,
              message: '由于您编辑了您所属的角色的权限表达式，账号将会注销，请重新登录',
              type: 'warning',
              center: true,
            });
            return this.logout().then(() => Promise.reject());
          }
          return Promise.resolve();
        })
        .then(() => {
          this.handlePexpSearch();
        })
        .catch(() => {
        });
    },
    syncAnchorPexp(entity) {
      this.pexpMaintainDialog.anchorEntity.key.long_id = entity.key.long_id;
      this.pexpMaintainDialog.anchorEntity.content = entity.content;
      this.pexpMaintainDialog.anchorEntity.remark = entity.remark;
    },
    showPexpDialog(mode) {
      this.pexpMaintainDialog.dialogMode = mode;
      this.$nextTick(() => {
        this.pexpMaintainDialog.dialogVisible = true;
      });
    },
    ...mapActions('lnp', ['logout']),
  },
  mounted() {
    this.handleRoleSearch();
  },
};
</script>

<style scoped>
.role-container {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.content-panel >>> .box-card-east {
  width: 45%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.focusable-switch:focus {
  outline: none;
}
</style>
