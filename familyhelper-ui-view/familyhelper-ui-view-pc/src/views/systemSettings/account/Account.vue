<template>
  <div class="account-container">
    <content-panel
      class="content-panel"
      :header-visible="true"
      :breadcrumb="['系统设置', '账户管理']"
    >
      <table-panel
        :page-size.sync="accountTablePanel.pageSize"
        :entity-count="parseInt(accountTablePanel.entities.count)"
        :current-page.sync="accountTablePanel.currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="accountTablePanel.entities.data"
        :table-selection.sync="accountTablePanel.selection"
        @onPagingAttributeChanged="handleAccountPagingAttributeChanged"
        @onEntityInspect="handleShowAccountInspectDialog"
        @onEntityEdit="handleShowAccountEditDialog"
        @onEntityDelete="handleAccountDelete"
      >
        <el-table-column
          prop="key.string_id"
          label="账户ID"
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
      <div class="header-container" slot="header">
        <el-button
          type="primary"
          @click="handleShowAccountRegisterDialog"
        >
          注册账户
        </el-button>
        <el-button
          type="primary"
          :disabled="accountTablePanel.selection === null"
          @click="handleShowRoleAssignDialog"
        >
          分配角色
        </el-button>
        <el-button
          type="primary"
          :disabled="accountTablePanel.selection === null"
          @click="handleShowPasswordResetDialog"
        >
          重置密码
        </el-button>
      </div>
    </content-panel>
    <entity-maintain-dialog
      create-title="注册"
      create-confirm-button-label="注册"
      :mode="accountMaintainDialog.dialogMode"
      :visible.sync="accountMaintainDialog.dialogVisible"
      :entity="accountMaintainDialog.anchorEntity"
      :create-rules="accountMaintainDialog.createRules"
      :edit-rules="accountMaintainDialog.editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleAccountRegister"
      @onEntityEdit="handleAccountEdit"
    >
      <el-form-item label="账户ID" prop="key.string_id">
        <el-input
          v-model="accountMaintainDialog.anchorEntity.key.string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="accountMaintainDialog.dialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="accountMaintainDialog.anchorEntity.name"
          :readonly="accountMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="启用" prop="enabled" v-if="accountMaintainDialog.dialogMode !== 'CREATE'">
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="accountMaintainDialog.anchorEntity.enabled"
          active-text="启用"
          inactive-text="禁用"
          :disabled="accountMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="accountMaintainDialog.anchorEntity.remark"
          :readonly="accountMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        label="初始密码"
        prop="password"
        v-if="accountMaintainDialog.dialogMode === 'CREATE'"
      >
        <el-input
          v-model="accountMaintainDialog.anchorEntity.password"
          show-password
        />
      </el-form-item>
      <el-form-item
        label="确认密码"
        prop="password_confirm"
        v-if="accountMaintainDialog.dialogMode === 'CREATE'"
      >
        <el-input
          v-model="accountMaintainDialog.anchorEntity.password_confirm"
          show-password
        />
      </el-form-item>
    </entity-maintain-dialog>
    <el-dialog
      class="role-assign-dialog-container"
      ref="roleAssignDialog"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="角色分配"
      :visible.sync="roleAssignDialog.dialogVisible"
      :close-on-click-modal="false"
      @opened="handleRoleAssignDialogOpened"
      @keydown.ctrl.enter.native="handleResetRoleRelation"
    >
      <el-transfer
        class="role-assign-transfer"
        v-model="roleAssignDialog.selectedRoles"
        :titles="['待选角色','已选角色']"
        :props="roleAssignDialog.props"
        :data="roleAssignDialog.allRoles"
      >
      </el-transfer>
      <div class="role-assign-dialog-footer-container" slot="footer">
        <el-button
          type="primary"
          @click="handleResetRoleRelation"
        >
          确定
        </el-button>
        <el-button
          @click="handleCancelRoleRelation"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      class="password-reset-dialog-container"
      ref="passwordResetDialog"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="密码重置"
      :visible.sync="passwordResetDialog.dialogVisible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleResetPassword"
    >
      <el-form
        ref="passwordResetForm"
        label-width="80px"
        :model="passwordResetDialog.formModel"
        :rules="passwordResetDialog.rules"
        :validate-on-rule-change="false"
        @submit.native.prevent
      >
        <el-form-item
          label="重置密码"
          prop="password"
        >
          <el-input
            v-model="passwordResetDialog.formModel.password"
            show-password
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="password_confirm"
        >
          <el-input
            v-model="passwordResetDialog.formModel.password_confirm"
            show-password
          />
        </el-form-item>
      </el-form>
      <div class="role-assign-dialog-footer-container" slot="footer">
        <el-button
          type="primary"
          @click="handleResetPassword"
        >
          确定
        </el-button>
        <el-button
          @click="handleCancelResetPassword"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/dialog/EntityMaintainDialog.vue';

import {
  all as allAccount, exists, register, remove, resetPassword, resetRoleRelation, update,
} from '@/api/system/account';
import {
  all as allRole, childForAccount as childRoleForAccount,
} from '@/api/system/role';
import resolveResponse from '@/util/response';

export default {
  name: 'Account',
  components: { EntityMaintainDialog, ContentPanel, TablePanel },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('账户不能为空'));
            return Promise.reject();
          }
          return resolveResponse(this, exists(value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('账户已经存在'));
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
    const accountMaintainDialogPasswordConfirmValidator = (rule, value, callback) => {
      if (this.accountMaintainDialog.anchorEntity.password
        !== this.accountMaintainDialog.anchorEntity.password_confirm) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };
    const passwordResetDialogPasswordConfirmValidator = (rule, value, callback) => {
      if (this.passwordResetDialog.formModel.password
        !== this.passwordResetDialog.formModel.password_confirm) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };
    return {
      me: '',
      accountTablePanel: {
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
      accountMaintainDialog: {
        dialogVisible: false,
        dialogMode: 'CREATE',
        anchorEntity: {
          key: {
            string_id: '',
          },
          name: '',
          enabled: false,
          remark: '',
          password: '',
          password_confirm: '',
        },
        createRules: {
          'key.string_id': [
            { validator: keyValidator, trigger: 'blur' },
          ],
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
          ],
          password_confirm: [
            { required: true, message: '请确认密码', trigger: 'blur' },
            { validator: accountMaintainDialogPasswordConfirmValidator, trigger: 'blur' },
          ],
        },
        editRules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
          ],
        },
      },
      roleAssignDialog: {
        dialogVisible: false,
        allRoles: [],
        selectedRoles: [],
        props: {
          key: 'key',
          label: 'label',
        },
      },
      passwordResetDialog: {
        dialogVisible: false,
        formModel: {
          password: '',
          password_confirm: '',
        },
        rules: {
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
          ],
          password_confirm: [
            { required: true, message: '请确认密码', trigger: 'blur' },
            { validator: passwordResetDialogPasswordConfirmValidator, trigger: 'blur' },
          ],
        },
      },
    };
  },
  methods: {
    handleWhoAmI() {
      // noinspection JSUnresolvedVariable
      const loginInfo = this.$ls.get('loginInfo');
      if (loginInfo === null) {
        this.me = '';
      } else {
        // noinspection JSUnresolvedVariable
        this.me = loginInfo.account_id;
      }
    },
    handleAccountPagingAttributeChanged() {
      this.accountTablePanel.selection = null;
      this.handleAccountSearch();
    },
    handleAccountSearch() {
      this.lookupAllAccount();
    },
    lookupAllAccount() {
      resolveResponse(
        this, allAccount(this.accountTablePanel.currentPage, this.accountTablePanel.pageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(
              this, allAccount(res.total_pages, this.accountTablePanel.pageSize),
            );
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    updateTableView(res) {
      this.accountTablePanel.entities = res;
      this.accountTablePanel.currentPage = res.current_page;
    },
    handleAccountRegister() {
      resolveResponse(this, register(
        this.accountMaintainDialog.anchorEntity.key.string_id,
        this.accountMaintainDialog.anchorEntity.name,
        true,
        this.accountMaintainDialog.anchorEntity.remark,
        this.accountMaintainDialog.anchorEntity.password,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `账户 ${this.accountMaintainDialog.anchorEntity.name} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleAccountSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.accountMaintainDialog.anchorEntity.password = '';
          this.accountMaintainDialog.anchorEntity.password_confirm = '';
          this.accountMaintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleAccountEdit() {
      Promise.resolve()
        .then(() => {
          const accountIdToEdit = this.accountMaintainDialog.anchorEntity.key.string_id;
          const accountEnabledToEdit = this.accountMaintainDialog.anchorEntity.enabled;
          if (accountIdToEdit === this.me && !accountEnabledToEdit) {
            return this.$confirm('您似乎在禁用您自己。<br>'
              + '<div style="color: #b22222"><b>如果继续，您将会被注销，并且无法继续登录</b></div>'
              + '<b>您有可能完全失去该账号的使用权，且无法自行恢复</b><br>'
              + '是否继续?',
            '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString: true,
              customClass: 'custom-message-box__w500',
              type: 'warning',
            })
              .then(() => Promise.resolve())
              .catch(() => Promise.reject());
          }
          return Promise.resolve();
        })
        .then(() => resolveResponse(this, update(
          this.accountMaintainDialog.anchorEntity.key.string_id,
          this.accountMaintainDialog.anchorEntity.name,
          this.accountMaintainDialog.anchorEntity.enabled,
          this.accountMaintainDialog.anchorEntity.remark,
        )))
        .then(() => {
          const accountId = this.accountMaintainDialog.anchorEntity.key.string_id;
          const { name } = this.accountMaintainDialog.anchorEntity;
          this.$message({
            showClose: true,
            message: `账户 ${name}(${accountId}) 更新成功`,
            type: 'success',
            center: true,
          });
          return Promise.resolve();
        })
        .then(() => {
          const accountIdToEdit = this.accountMaintainDialog.anchorEntity.key.string_id;
          const accountEnabledToEdit = this.accountMaintainDialog.anchorEntity.enabled;
          if (accountIdToEdit === this.me && !accountEnabledToEdit) {
            this.$message({
              showClose: true,
              message: '由于您禁用了您自己，账号将会注销，请重新登录',
              type: 'warning',
              center: true,
            });
            // noinspection JSUnresolvedVariable
            this.$ls.remove('loginInfo');
            // noinspection JSUnresolvedVariable
            this.$ls.remove('permissionInfo');
            this.$router.push({ path: '/login' });
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          this.handleAccountSearch();
        })
        .then(() => {
          this.accountMaintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleShowAccountRegisterDialog() {
      this.showAccountDialog('CREATE');
    },
    handleShowAccountInspectDialog(index, entity) {
      this.syncAnchorAccount(entity);
      this.showAccountDialog('INSPECT');
    },
    handleShowAccountEditDialog(index, entity) {
      this.syncAnchorAccount(entity);
      this.showAccountDialog('EDIT');
    },
    handleAccountDelete(node, entity) {
      Promise.resolve()
        .then(() => {
          const accountIdToDelete = entity.key.string_id;
          const nameToDelete = entity.name;
          if (accountIdToDelete === this.me) {
            return this.$confirm('您似乎在删除您自己。<br>'
              + '<div style="color: #b22222"><b>如果继续，您将会被注销，并且会永远失去该账号</b></div>'
              + '<b>您有将会失去此账号的全部数据，且无法恢复</b><br>'
              + '是否继续?',
            '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString: true,
              customClass: 'custom-message-box__w500',
              type: 'warning',
            })
              .then(() => Promise.resolve())
              .catch(() => Promise.reject());
          }
          return this.$confirm(`您似乎在删除 ${nameToDelete}(${accountIdToDelete})。<br>`
              + '<b>该账号的所有者将会失去此账号的全部数据，且无法恢复</b><br>'
              + '是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            customClass: 'custom-message-box__w500',
            type: 'warning',
          })
            .then(() => Promise.resolve())
            .catch(() => Promise.reject());
        })
        .then(() => {
          const accountIdToDelete = entity.key.string_id;
          return resolveResponse(this, remove(accountIdToDelete));
        })
        .then(() => {
          const accountId = entity.key.string_id;
          const { name } = entity;
          this.$message({
            showClose: true,
            message: `账户 ${name}(${accountId}) 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          const accountIdToDelete = entity.key.string_id;
          if (accountIdToDelete === this.me) {
            this.$message({
              showClose: true,
              message: '由于您删除了您自己，账号将会注销，请重新登录',
              type: 'warning',
              center: true,
            });
            // noinspection JSUnresolvedVariable
            this.$ls.remove('loginInfo');
            // noinspection JSUnresolvedVariable
            this.$ls.remove('permissionInfo');
            this.$router.push({ path: '/login' });
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          this.handleAccountSearch();
        })
        .catch(() => {
        });
    },
    syncAnchorAccount(entity) {
      this.accountMaintainDialog.anchorEntity.key.string_id = entity.key.string_id;
      this.accountMaintainDialog.anchorEntity.name = entity.name;
      this.accountMaintainDialog.anchorEntity.enabled = entity.enabled;
      this.accountMaintainDialog.anchorEntity.remark = entity.remark;
      this.accountMaintainDialog.anchorEntity.password = '';
      this.accountMaintainDialog.anchorEntity.password_confirm = '';
    },
    showAccountDialog(mode) {
      this.accountMaintainDialog.dialogMode = mode;
      this.$nextTick(() => {
        this.accountMaintainDialog.dialogVisible = true;
      });
    },
    enabledFormatter(row, column) {
      return row[column.property] ? '是' : '否';
    },
    handleShowRoleAssignDialog() {
      resolveResponse(this, allRole(0, 99999))
        .then((res) => {
          this.roleAssignDialog.allRoles = res.data.map(
            (r) => ({ key: r.key.string_id, label: r.name }),
          );
        })
        .then(() => resolveResponse(this, childRoleForAccount(
          this.accountTablePanel.selection.key.string_id, 0, 99999,
        )))
        .then((res) => {
          this.roleAssignDialog.selectedRoles = res.data.map((r) => r.key.string_id);
        })
        .then(() => {
          this.roleAssignDialog.dialogVisible = true;
        })
        .catch(() => {
        });
    },
    handleRoleAssignDialogOpened() {
      // noinspection JSUnresolvedFunction
      this.$refs.roleAssignDialog.$el.focus();
    },
    handleResetRoleRelation() {
      Promise.resolve()
        .then(() => {
          const accountIdToEdit = this.accountTablePanel.selection.key.string_id;
          if (accountIdToEdit === this.me) {
            return this.$confirm('您似乎在更改您自己的角色。<br>'
              + '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据新设定的角色重新分配权限</b></div>'
              + '<b>您有可能失去系统的部分权限，且可能无法自行恢复</b><br>'
              + '是否继续?',
            '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString: true,
              customClass: 'custom-message-box__w500',
              type: 'warning',
            })
              .then(() => Promise.resolve())
              .catch(() => Promise.reject());
          }
          return Promise.resolve();
        })
        .then(() => {
          const accountKey = this.accountTablePanel.selection.key.string_id;
          const roleKeys = this.roleAssignDialog.selectedRoles.map((r) => ({ string_id: r }));
          return resolveResponse(this, resetRoleRelation(accountKey, roleKeys));
        })
        .then(() => {
          const accountId = this.accountTablePanel.selection.key.string_id;
          const { name } = this.accountTablePanel.selection;
          this.$message({
            showClose: true,
            message: `账户 ${name}(${accountId}) 角色更新成功`,
            type: 'success',
            center: true,
          });
          return Promise.resolve();
        })
        .then(() => {
          const accountIdToEdit = this.accountTablePanel.selection.key.string_id;
          if (accountIdToEdit === this.me) {
            this.$message({
              showClose: true,
              message: '由于您更改了您自己的角色，账号将会注销，请重新登录',
              type: 'warning',
              center: true,
            });
            // noinspection JSUnresolvedVariable
            this.$ls.remove('loginInfo');
            // noinspection JSUnresolvedVariable
            this.$ls.remove('permissionInfo');
            this.$router.push({ path: '/login' });
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          this.roleAssignDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleCancelRoleRelation() {
      this.roleAssignDialog.dialogVisible = false;
    },
    handleShowPasswordResetDialog() {
      this.passwordResetDialog.formModel.password = '';
      this.passwordResetDialog.formModel.password_confirm = '';
      this.passwordResetDialog.dialogVisible = true;
    },
    handleResetPassword() {
      this.$refs.passwordResetForm.validate((accept) => {
        if (!accept) {
          return;
        }
        Promise.resolve()
          .then(() => this.$confirm('您在重置账户的密码。<br>'
            + '<div style="color: #b22222"><b>能力越大，责任越大，请尊重他人隐私</b></div>'
            + '是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            customClass: 'custom-message-box__w500',
            type: 'warning',
          })
            .then(() => Promise.resolve())
            .catch(() => Promise.reject()))
          .then(() => {
            const accountIdToEdit = this.accountTablePanel.selection.key.string_id;
            const newPassword = this.passwordResetDialog.formModel.password;
            return resolveResponse(this, resetPassword(accountIdToEdit, newPassword));
          })
          .then(() => {
            const accountId = this.accountTablePanel.selection.key.string_id;
            const { name } = this.accountTablePanel.selection;
            this.$message({
              showClose: true,
              message: `账户 ${name}(${accountId}) 密码重置成功`,
              type: 'success',
              center: true,
            });
            return Promise.resolve();
          })
          .then(() => {
            const accountIdToEdit = this.accountTablePanel.selection.key.string_id;
            if (accountIdToEdit === this.me) {
              this.$message({
                showClose: true,
                message: '由于您重置了您自己的密码，账号将会注销，请重新登录',
                type: 'warning',
                center: true,
              });
              // noinspection JSUnresolvedVariable
              this.$ls.remove('loginInfo');
              // noinspection JSUnresolvedVariable
              this.$ls.remove('permissionInfo');
              this.$router.push({ path: '/login' });
              return Promise.reject();
            }
            return Promise.resolve();
          })
          .then(() => {
            this.passwordResetDialog.formModel.password = '';
            this.passwordResetDialog.formModel.password_confirm = '';
            this.passwordResetDialog.dialogVisible = false;
          })
          .catch(() => {
          });
      });
    },
    handleCancelResetPassword() {
      this.passwordResetDialog.dialogVisible = false;
    },
  },
  mounted() {
    this.handleWhoAmI();
    this.handleAccountSearch();
  },
};
</script>

<style scoped>
.account-container {
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
.role-assign-dialog-container >>> .el-dialog__body {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}

.role-assign-dialog-footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
}

.focusable-switch:focus {
  outline: none;
}
</style>
