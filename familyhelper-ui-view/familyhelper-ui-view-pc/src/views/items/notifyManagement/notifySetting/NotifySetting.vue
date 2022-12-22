<template>
  <div class="notify-setting-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="50%"
      :west-visible="true"
    >
      <div class="main-container" v-loading="west.loading" slot="west">
        <header-layout-panel>
          <template v-slot:header>
            <div class="header-container">
              <el-button
                type="primary"
                @click="handleShowNotifySettingCreateDialog"
              >
                新建通知设置
              </el-button>
              <el-divider direction="vertical"/>
              <el-button type="success" @click="handleNotifySettingSearch">刷新数据</el-button>
              <el-divider direction="vertical"/>
              <el-button
                type="primary"
                :disabled="west.applyChangesButton.disabled"
                @click="handleApplyChanges"
              >
                应用变更
              </el-button>
            </div>
          </template>
          <template v-slot:default>
            <table-panel
              class="table"
              highlight-current-row
              :page-size.sync="west.table.pageSize"
              :entity-count="parseInt(west.table.entities.count)"
              :current-page.sync="west.table.currentPage"
              :page-sizes="[15,20,30,50]"
              :table-data="west.table.entities.data"
              :table-selection.sync="west.table.selection"
              @onPagingAttributeChanged="handlePagingAttributeChanged"
              @onEntityInspect="handleShowNotifySettingInspectDialog"
              @onEntityEdit="handleShowNotifySettingEditDialog"
              @onEntityDelete="handleNotifySettingDelete"
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
                prop="remark"
                label="备注"
                show-tooltip-when-overflow
              />
            </table-panel>
          </template>
        </header-layout-panel>
      </div>
      <div class="main-container" v-loading="center.loading">
        <div class="placeholder" v-if="west.table.selection===null">
          请选择通知设置
        </div>
        <header-layout-panel v-else>
          <template v-slot:header>
            <div class="header-container">
              <el-button type="primary" @click="handleSaveRouterInfo">保存路由器设置</el-button>
              <el-divider direction="vertical"/>
              <el-button type="success" @click="handleRouterInfoSearch">刷新数据</el-button>
            </div>
          </template>
          <template v-slot:default>
            <el-form
              class="form"
              ref="form"
              label-position="left"
              label-width="20px"
              :model="center.form.model"
              :rules="center.form.rules"
            >
              <el-form-item class="validated" label="类型" prop="type">
                <el-input
                  v-model="center.form.model.type"
                >
                  <el-button
                    slot="append"
                    icon="el-icon-search"
                    @click="center.routerSupportDialog.visible = true"
                  />
                </el-input>
              </el-form-item>
              <el-form-item label="参数" prop="param">
                <text-editor
                  class="text-editor"
                  v-model="center.form.model.param"
                />
              </el-form-item>
            </el-form>
          </template>
        </header-layout-panel>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      top="10vh"
      :mode="west.maintainDialog.mode"
      :visible.sync="west.maintainDialog.visible"
      :entity="west.maintainDialog.anchorEntity"
      :create-rules="west.maintainDialog.rules"
      :edit-rules="west.maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="west.maintainDialog.loading"
      @onEntityCreate="handleNotifySettingCreate"
      @onEntityEdit="handleNotifySettingEdit"
    >
      <el-form-item label="名称" prop="label">
        <el-input
          v-model="west.maintainDialog.anchorEntity.label"
          :readonly="west.maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="使能" prop="enabled">
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="west.maintainDialog.anchorEntity.enabled"
          active-text="是"
          inactive-text="否"
          :disabled="west.maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="west.maintainDialog.anchorEntity.remark"
          :readonly="west.maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <router-support-select-dialog
      :visible.sync="center.routerSupportDialog.visible"
      @onConfirmed="handleRouterSupportSelected"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TextEditor from '@/components/text/TextEditor.vue';
import RouterSupportSelectDialog
from '@/views/items/notifyManagement/routerSupport/RouterSupportSelectDialog.vue';

import {
  all as allNotifySetting,
  insert as insertNotifySetting,
  remove as removeNotifySetting,
  update as updateNotifySetting,
} from '@/api/notify/notifySetting';
import {
  exists as existsRouterInfo,
  inspect as inspectRouterInfo,
  insert as insertRouterInfo,
  update as updateRouterInfo,
} from '@/api/notify/routerInfo';
import { exists as routerSupportExists } from '@/api/notify/routerSupport';
import { resetRoute } from '@/api/notify/reset';
import resolveResponse from '@/util/response';

export default {
  name: 'NotifySetting',
  components: {
    RouterSupportSelectDialog,
    TextEditor,
    HeaderLayoutPanel,
    EntityMaintainDialog,
    TablePanel,
    BorderLayoutPanel,
  },
  watch: {
    'west.table.selection': {
      handler() {
        this.handleRouterInfoSearch();
      },
    },
  },
  data() {
    const routerTypeValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('路由器类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(routerSupportExists(value));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('不支持的路由器类型'));
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
      west: {
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
          selection: null,
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
            remark: '',
          },
          rules: {
            label: [
              { required: true, message: '名称不能为空', trigger: 'blur' },
            ],
          },
        },
        applyChangesButton: {
          disabled: false,
        },
      },
      center: {
        loading: false,
        form: {
          model: {
            type: '',
            param: '',
          },
          rules: {
            label: [
              { required: true, message: '标签不能为空', trigger: 'blur' },
            ],
            type: [
              { validator: routerTypeValidator, trigger: 'blur' },
            ],
          },
        },
        routerSupportDialog: {
          visible: false,
        },
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleNotifySettingSearch();
    },
    handleNotifySettingSearch() {
      this.lookupAllNotifySetting();
    },
    lookupAllNotifySetting() {
      this.west.loading = true;
      resolveResponse(allNotifySetting(this.west.table.currentPage, this.west.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allNotifySetting(res.total_pages, this.west.table.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateNotifySettingTableView)
        .catch(() => {
        })
        .finally(() => {
          this.west.loading = false;
        });
    },
    updateNotifySettingTableView(res) {
      this.west.table.entities = res;
      this.west.table.currentPage = res.current_page;
    },
    handleNotifySettingCreate() {
      this.west.maintainDialog.loading = true;
      resolveResponse(insertNotifySetting(
        '',
        this.west.maintainDialog.anchorEntity.label,
        this.west.maintainDialog.anchorEntity.enabled,
        this.west.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `通知设置 ${this.west.maintainDialog.anchorEntity.label} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleNotifySettingSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.west.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.west.maintainDialog.loading = false;
        });
    },
    handleNotifySettingEdit() {
      this.west.maintainDialog.loading = true;
      resolveResponse(updateNotifySetting(
        this.west.maintainDialog.anchorEntity.key.long_id,
        this.west.maintainDialog.anchorEntity.label,
        this.west.maintainDialog.anchorEntity.enabled,
        this.west.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `通知设置 ${this.west.maintainDialog.anchorEntity.label} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleNotifySettingSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.west.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.west.maintainDialog.loading = false;
        });
    },
    handleShowNotifySettingCreateDialog() {
      this.showDialog('CREATE');
    },
    handleShowNotifySettingInspectDialog(index, entity) {
      this.syncAnchorNotifySetting(entity);
      this.showDialog('INSPECT');
    },
    handleShowNotifySettingEditDialog(index, entity) {
      this.syncAnchorNotifySetting(entity);
      this.showDialog('EDIT');
    },
    handleNotifySettingDelete(index, entity) {
      this.west.loading = true;
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
        .then(() => resolveResponse(removeNotifySetting(entity.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: `通知设置 ${entity.label} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleNotifySettingSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          this.west.loading = false;
        });
    },
    syncAnchorNotifySetting(entity) {
      this.west.maintainDialog.anchorEntity.key.long_id = entity.key.long_id;
      this.west.maintainDialog.anchorEntity.label = entity.label;
      this.west.maintainDialog.anchorEntity.enabled = entity.enabled;
      this.west.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.west.maintainDialog.mode = mode;
      this.west.maintainDialog.visible = true;
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value === null || value === undefined) {
        return '';
      }
      return value ? '是' : '否';
    },
    handleRouterSupportSelected(selection) {
      this.center.form.model.type = selection.key.string_id;
      this.center.form.model.param = selection.example_param;
    },
    handleRouterInfoSearch() {
      if (this.west.table.selection === null) {
        this.center.form.model.type = '';
        this.center.form.model.param = '';
      } else {
        this.inspectRouterInfo();
      }
    },
    inspectRouterInfo() {
      this.center.loading = true;
      resolveResponse(existsRouterInfo(this.west.table.selection.key.long_id))
        .then((res) => {
          if (res) {
            return resolveResponse(inspectRouterInfo(this.west.table.selection.key.long_id));
          }
          return Promise.resolve(null);
        })
        .then(this.updateRouterInfoFormView)
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    updateRouterInfoFormView(res) {
      if (res === null) {
        this.center.form.model.type = '';
        this.center.form.model.param = '';
      } else {
        this.center.form.model.type = res.type;
        this.center.form.model.param = res.param;
      }
    },
    handleSaveRouterInfo() {
      if (this.west.table.selection === null) {
        return;
      }
      this.$refs.form.validate((accept) => {
        if (accept) {
          this.saveRouterInfo();
        }
      });
    },
    saveRouterInfo() {
      this.center.loading = true;
      resolveResponse(existsRouterInfo(this.west.table.selection.key.long_id))
        .then((res) => {
          if (res) {
            return resolveResponse(updateRouterInfo(
              this.west.table.selection.key.long_id,
              this.west.table.selection.label,
              this.center.form.model.type,
              this.center.form.model.param,
              this.west.table.selection.remark,
            ));
          }
          return resolveResponse(insertRouterInfo(
            this.west.table.selection.key.long_id,
            this.west.table.selection.label,
            this.center.form.model.type,
            this.center.form.model.param,
            this.west.table.selection.remark,
          ));
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: '路由器设置更新成功',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    handleApplyChanges() {
      this.west.applyChangesButton.disabled = true;
      resolveResponse(resetRoute())
        .then(() => {
          this.$message({
            showClose: true,
            message: '变更应用成功！后台状态刷新中，请不要频繁点击',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        })
        .finally(() => {
          setTimeout(() => {
            this.west.applyChangesButton.disabled = false;
          }, 3000);
        });
    },
  },
  mounted() {
    this.handleNotifySettingSearch();
  },
};
</script>

<style scoped>
.notify-setting-container {
  height: 100%;
  width: 100%;
}

.main-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.focusable-switch:focus {
  outline: none;
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

.form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item {
  margin-right: 0;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item:not(:last-child) {
  margin-bottom: 5px;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item:last-child {
  height: 0;
  flex-grow: 1;
  margin-bottom: 0;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item.validated {
  margin-bottom: 22px;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item__content {
  width: 0;
  height: 100%;
  flex-grow: 1;
}
</style>
