<template>
  <div class="login-state-panel-container">
    <div class="placeholder" v-if="accountId===''">请选择账号</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowLoginDialog"
            >
              生成凭证
            </el-button>
            <el-divider direction="vertical"/>
            <div class="label">登录类型:</div>
            <el-select
              class="select"
              v-model="typeSelector.model"
              @change="handleSearch"
            >
              <el-option
                v-for="item in typeSelector.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-divider direction="vertical"/>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <div style="flex-grow: 1"/>
            <el-button
              class="item icon-button"
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
            class="table"
            :page-size.sync="table.pageSize"
            :entity-count="parseInt(table.entities.count)"
            :current-page.sync="table.currentPage"
            :page-sizes="[10,15,20,30]"
            :table-data="table.entities.data"
            :operate-column-width="76"
            :show-contextmenu="true"
            :contextmenu-width="100"
            :row-class-name="rowClassName"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.long_id"
                label="凭证ID"
                width="190px"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="expire_date"
                label="过期时间"
                width="180px"
                show-tooltip-when-overflow
                :formatter="timestampFormatter"
              />
              <el-table-column
                prop="generated_date"
                label="生成时间"
                width="180px"
                show-tooltip-when-overflow
                :formatter="timestampFormatter"
              />
              <el-table-column
                prop="type"
                label="类型"
                width="60px"
                show-tooltip-when-overflow
                :formatter="typeFormatter"
              />
              <el-table-column
                prop="remark"
                label="备注"
                show-tooltip-when-overflow
              />
            </template>
            <template v-slot:operateColumn="{row}">
              <el-button-group class=operate-column>
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-copy-document"
                  type="warning"
                  :disabled="readonly"
                  @click="handleLoginStateDeriveButtonClicked(row)"
                />
                <!--suppress JSUnresolvedReference -->
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  :disabled="readonly || row.key.long_id === token"
                  @click="handleLoginStateLogoutButtonClicked(row)"
                />
              </el-button-group>
            </template>
            <template v-slot:contextmenu="{row,close}">
              <ul class="my-contextmenu">
                <li @click="handleLoginStateKeyCopyContextmenuClicked(row,close)">
                  复制主键
                </li>
                <el-divider/>
                <li
                  :class="{disabled:readonly}"
                  @click="handleLoginStateDeriveContextmenuClicked(row,close,$event)"
                >
                  派生...
                </li>
                <!--suppress JSUnresolvedReference -->
                <li
                  :class="{disabled:readonly || row.key.long_id === token}"
                  @click="handleLoginStateLogoutContextmenuClicked(row,close,$event)"
                >
                  删除...
                </li>
              </ul>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <el-dialog
      id="loginDialog"
      append-to-body
      destroy-on-close
      title="生成凭证（通过登录）"
      :visible.sync="loginDialog.visible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleLoginDialogHotKeyDown"
      @closed="handleLoginDialogClosed"
    >
      <template v-slot:default>
        <el-form
          class="login-form"
          ref="loginForm"
          label-position="right"
          label-width="85px"
          v-loading="loginDialog.form.loading"
          :model="loginDialog.form.model"
          :rules="loginDialog.form.rule"
          :validate-on-rule-change="false"
          @submit.native.prevent
        >
          <el-form-item label="账号密码" prop="password">
            <el-input v-model="loginDialog.form.model.password" placeholder="请输入密码"
                      show-password/>
          </el-form-item>
          <el-form-item label="过期时间" prop="expire_date">
            <!--suppress JSValidateTypes -->
            <el-date-picker
              class="short-bar"
              v-model="loginDialog.form.model.expire_date"
              type="datetime"
              placeholder="选择过期时间"
              :picker-options="loginDialog.pickerOptions"
            />
          </el-form-item>
          <el-form-item label="凭证备注" prop="remark">
            <el-input v-model="loginDialog.form.model.remark" placeholder="请输入备注"/>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <el-button
          type="primary"
          v-if="mode !== 'INSPECT'"
          :disabled="loading"
          @click="handleLoginConfirmButtonClicked"
        >
          创建
        </el-button>
        <el-button
          :disabled="loading"
          @click="handleLoginCancelButtonClicked"
        >
          取消
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      id="deriveDialog"
      append-to-body
      destroy-on-close
      title="生成凭证（通过派生）"
      :visible.sync="deriveDialog.visible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleDeriveDialogHotKeyDown"
      @closed="handleDeriveDialogClosed"
    >
      <template v-slot:default>
        <el-form
          class="derive-form"
          ref="deriveForm"
          label-position="right"
          label-width="85px"
          v-loading="deriveDialog.form.loading"
          :model="deriveDialog.form.model"
          :rules="deriveDialog.form.rule"
          :validate-on-rule-change="false"
          @submit.native.prevent
        >
          <el-form-item label="过期时间" prop="expire_date">
            <!--suppress JSValidateTypes -->
            <el-date-picker
              class="short-bar"
              v-model="deriveDialog.form.model.expire_date"
              type="datetime"
              placeholder="选择过期时间"
              :picker-options="deriveDialog.pickerOptions"
            />
          </el-form-item>
          <el-form-item label="凭证备注" prop="remark">
            <el-input v-model="deriveDialog.form.model.remark" placeholder="请输入备注"/>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <el-button
          type="primary"
          v-if="mode !== 'INSPECT'"
          :disabled="loading"
          @click="handleDeriveConfirmButtonClicked"
        >
          创建
        </el-button>
        <el-button
          :disabled="loading"
          @click="handleDeriveCancelButtonClicked"
        >
          取消
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';

import { formatTimestamp } from '@/util/timestamp';
import {
  childForAccount,
  childForAccountTypeEqualsDynamic,
  childForAccountTypeEqualsStatic,
} from '@/api/system/loginState';
import { staticLogin, logout } from '@/api/system/login';
import { staticDerive } from '@/api/system/derive';
import resolveResponse from '@/util/response';

const LOGIN_STATE_TYPE_DYNAMIC = 0;
const LOGIN_STATE_TYPE_STATIC = 10;

// noinspection JSAnnotator
export default {
  name: 'LoginStatePanel',
  components: { TablePanel, HeaderLayoutPanel },
  props: {
    accountId: {
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
  computed: {
    ...mapGetters('lnp', ['token']),
  },
  watch: {
    accountId() {
      this.handleSearch();
    },
  },
  data() {
    const expireDateValidator = (rule, value, callback) => {
      // 不能为空。
      if (!value) {
        callback(new Error('过期时间不能为空'));
      }
      // 大于当前时间。
      if (value <= new Date()) {
        callback(new Error('过期时间必须大于当前时间'));
      }
      // 通过验证。
      callback();
    };
    const commonExpireDatePickerOptions = {
      shortcuts: [
        {
          text: '一天后',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24);
            picker.$emit('pick', date);
          },
        },
        {
          text: '一周后',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          },
        },
        {
          text: '一月后',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 30);
            picker.$emit('pick', date);
          },
        },
        {
          text: '一年后',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 365);
            picker.$emit('pick', date);
          },
        },
      ],
    };
    return {
      loading: false,
      typeSelector: {
        model: 'all',
        options: [
          { value: 'all', label: '全部' },
          { value: 'dynamic', label: '动态' },
          { value: 'static', label: '静态' },
        ],
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
        pageSize: 10,
      },
      loginDialog: {
        visible: false,
        form: {
          loading: false,
          rule: {
            password: [
              { required: true, message: '密码不能为空', trigger: 'change' },
            ],
            expire_date: [
              { required: true, message: '过期时间不能为空', trigger: 'change' },
              { validator: expireDateValidator, trigger: 'blur' },
            ],
            remark: [
              {
                required: true,
                message: '备注不能为空，请填写有意义的内容，以便于维护',
                trigger: 'change',
              },
            ],
          },
          model: {
            password: '',
            expire_date: null,
            remark: '',
          },
        },
        pickerOptions: commonExpireDatePickerOptions,
      },
      deriveDialog: {
        visible: false,
        form: {
          loading: false,
          rule: {
            expire_date: [
              { required: true, message: '过期时间不能为空', trigger: 'change' },
              { validator: expireDateValidator, trigger: 'blur' },
            ],
            remark: [
              {
                required: true,
                message: '备注不能为空，请填写有意义的内容，以便于维护',
                trigger: 'change',
              },
            ],
          },
          model: {
            token: '',
            expire_date: null,
            remark: '',
          },
        },
        pickerOptions: commonExpireDatePickerOptions,
      },
    };
  },
  methods: {
    handleSearch() {
      if (!this.accountId) {
        return;
      }
      switch (this.typeSelector.model) {
        case 'all':
          this.handleSearchAll();
          break;
        case 'dynamic':
          this.handleSearchDynamic();
          break;
        case 'static':
          this.handleSearchStatic();
          break;
        default:
          break;
      }
    },
    handleSearchAll() {
      this.loading = true;
      resolveResponse(childForAccount(
        this.accountId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForAccount(
              this.accountId, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSearchDynamic() {
      this.loading = true;
      resolveResponse(childForAccountTypeEqualsDynamic(
        this.accountId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForAccountTypeEqualsDynamic(
              this.accountId, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSearchStatic() {
      this.loading = true;
      resolveResponse(childForAccountTypeEqualsStatic(
        this.accountId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForAccountTypeEqualsStatic(
              this.accountId, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    typeFormatter(row, column) {
      const type = row[column.property];
      switch (type) {
        case LOGIN_STATE_TYPE_DYNAMIC:
          return '动态';
        case LOGIN_STATE_TYPE_STATIC:
          return '静态';
        default:
          return '（未知）';
      }
    },
    rowClassName({ row }) {
      return row.key.long_id === this.token ? 'current-token' : '';
    },
    handleLoginStateDeriveButtonClicked(row) {
      this.handleShowDeriveDialog(row);
    },
    handleLoginStateLogoutButtonClicked(row) {
      this.handleLoginStateLogout(row);
    },
    handleLoginStateKeyCopyContextmenuClicked(row, close) {
      close();
      navigator.clipboard.writeText(row.key.long_id)
        .then(() => {
          this.$message({
            showClose: true,
            message: '复制成功',
            type: 'success',
            center: true,
          });
        });
    },
    handleLoginStateDeriveContextmenuClicked(row, close, event) {
      if (this.readonly) {
        event.preventDefault();
        return;
      }
      close();
      this.handleShowDeriveDialog(row);
    },
    handleLoginStateLogoutContextmenuClicked(row, close, event) {
      if (this.readonly || row.key.long_id === this.token) {
        event.preventDefault();
        return;
      }
      close();
      this.handleLoginStateLogout(row);
    },
    handleLoginStateLogout(row) {
      Promise.resolve(row.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此登录凭证。<br>'
          + '删除凭证可能会导致使用该凭证的用户强制下线。<br>'
          + '同时会导致使用该凭证的第三方应用无法继续使用。<br>'
          + '<div style="color: #b22222"><b>如果您不知道删除该登录凭证后会产生什么后果，'
          + '请不要进行操作！</b></div>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(logout(res)).then(() => res))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `登录凭证 ${res} 删除成功`,
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
    handleShowLoginDialog() {
      this.loginDialog.visible = true;
    },
    handleLoginDialogHotKeyDown() {
      this.$refs.loginForm.validate((accept) => {
        if (accept) {
          this.handleLoginConfirm();
        }
      });
    },
    handleLoginDialogClosed() {
      this.handleLoginCancel();
    },
    handleLoginConfirmButtonClicked() {
      this.$refs.loginForm.validate((accept) => {
        if (accept) {
          this.handleLoginConfirm();
        }
      });
    },
    handleLoginCancelButtonClicked() {
      this.handleLoginCancel();
    },
    handleLoginConfirm() {
      this.loginDialog.form.loading = true;
      resolveResponse(staticLogin(
        this.accountId,
        this.loginDialog.form.model.password,
        this.loginDialog.form.model.expire_date,
        this.loginDialog.form.model.remark,
      ))
        .then(() => {
          this.$message.success('创建成功');
          this.loginDialog.visible = false;
          this.handleSearch();
        })
        .finally(() => {
          this.loginDialog.form.loading = false;
        });
    },
    handleLoginCancel() {
      this.loginDialog.visible = false;
      this.loginDialog.form.model.password = '';
      this.loginDialog.form.model.expire_date = null;
      this.loginDialog.form.model.remark = '';
    },
    handleShowDeriveDialog(row) {
      this.deriveDialog.visible = true;
      this.deriveDialog.form.model.token = row.key.long_id;
    },
    handleDeriveDialogHotKeyDown() {
      this.$refs.deriveForm.validate((accept) => {
        if (accept) {
          this.handleDeriveConfirm();
        }
      });
    },
    handleDeriveDialogClosed() {
      this.handleDeriveCancel();
    },
    handleDeriveConfirmButtonClicked() {
      this.$refs.deriveForm.validate((accept) => {
        if (accept) {
          this.handleDeriveConfirm();
        }
      });
    },
    handleDeriveCancelButtonClicked() {
      this.handleDeriveCancel();
    },
    handleDeriveConfirm() {
      this.deriveDialog.form.loading = true;
      resolveResponse(staticDerive(
        this.deriveDialog.form.model.token,
        this.deriveDialog.form.model.expire_date,
        this.deriveDialog.form.model.remark,
      ))
        .then(() => {
          this.$message.success('创建成功');
          this.deriveDialog.visible = false;
          this.handleSearch();
        })
        .finally(() => {
          this.deriveDialog.form.loading = false;
        });
    },
    handleDeriveCancel() {
      this.deriveDialog.visible = false;
      this.deriveDialog.form.model.token = '';
      this.deriveDialog.form.model.expire_date = null;
      this.deriveDialog.form.model.remark = '';
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
.login-state-panel-container {
  width: 100%;
  height: 100%;
  background: #FFFFFF;
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

.header-container .label {
  color: #606266;
  margin-right: 10px;
  font-size: 14px;
  font-family: 微软雅黑, serif;
}

.header-container .select {
  width: 110px;
}

.header-container .icon-button {
  padding-left: 12px;
  padding-right: 12px;
}

.table .table-button {
  padding: 7px;
}

/*noinspection CssUnusedSymbol*/
.table >>> .contextmenu .el-divider--horizontal {
  margin-top: 1px;
  margin-bottom: 1px;
}

/*noinspection CssUnusedSymbol*/
.table >>> .current-token {
  font-weight: bold;
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

/*noinspection CssUnusedSymbol*/
.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}

.login-form .short-bar {
  width: 200px;
}
</style>
