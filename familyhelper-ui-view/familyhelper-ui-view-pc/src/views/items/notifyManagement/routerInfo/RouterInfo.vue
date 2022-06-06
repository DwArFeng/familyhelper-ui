<template>
  <div class="router-info-container">
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
          prop="notify_setting.label"
          label="所属通知设置"
          show-tooltip-when-overflow
          :formatter="notifySettingFormatter"
        />
        <el-table-column
          prop="type"
          label="类型"
          show-tooltip-when-overflow
        />
        <el-table-column
          class-name="single-line"
          prop="param"
          label="参数"
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
          新建路由器信息
        </el-button>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      top="10vh"
      label-width="96px"
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
      <el-form-item label="所属通知设置" prop="notify_setting_key.long_id">
        <notify-setting-input
          v-model="maintainDialog.anchorEntity.notify_setting_key.long_id"
          :readonly="maintainDialog.mode === 'INSPECT'"
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
            @click="routerSupportDialog.visible = true"
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
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <router-support-select-dialog
      :visible.sync="routerSupportDialog.visible"
      @onConfirmed="handleRouterSupportSelected"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TextEditor from '@/components/text/TextEditor.vue';
import RouterSupportSelectDialog
from '@/views/items/notifyManagement/routerSupport/RouterSupportSelectDialog.vue';
import NotifySettingInput from '@/views/items/notifyManagement/notifySetting/NotifySettingInput.vue';

import {
  allDisp, insert, remove, update,
} from '@/api/notify/routerInfo';
import { exists as routerSupportExists } from '@/api/notify/routerSupport';
import resolveResponse from '@/util/response';

export default {
  name: 'RouterInfo',
  components: {
    NotifySettingInput,
    RouterSupportSelectDialog,
    EntityMaintainDialog,
    TablePanel,
    BorderLayoutPanel,
    TextEditor,
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
          notify_setting_key: {
            long_id: '',
          },
          label: '',
          type: '',
          param: '',
          remark: '',
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
      notifySettingDialog: {
        visible: false,
      },
      routerSupportDialog: {
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
      resolveResponse(allDisp(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allDisp(res.total_pages, this.table.pageSize));
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
        this.maintainDialog.anchorEntity.notify_setting_key.long_id,
        this.maintainDialog.anchorEntity.label,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.param,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '路由器信息创建成功',
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
        this.maintainDialog.anchorEntity.notify_setting_key.long_id,
        this.maintainDialog.anchorEntity.label,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.param,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '路由器信息更新成功',
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
        .then(() => this.$confirm('此操作将永久删除此路由器信息。<br>'
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
            message: '路由器信息删除成功',
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
      if (entity.notify_setting_key === null) {
        this.maintainDialog.anchorEntity.notify_setting_key.long_id = '';
      } else {
        this.maintainDialog.anchorEntity.notify_setting_key
          .long_id = entity.notify_setting_key.long_id;
      }
      this.maintainDialog.anchorEntity.label = entity.label;
      this.maintainDialog.anchorEntity.type = entity.type;
      this.maintainDialog.anchorEntity.param = entity.param;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    notifySettingFormatter(row) {
      // noinspection JSUnresolvedVariable
      if (row.notify_setting !== null) {
        // noinspection JSUnresolvedVariable
        return row.notify_setting.label;
      }
      if (row.notify_setting_key === null) {
        return '（未指定）';
      }
      return '（未知）';
    },
    handleRouterSupportSelected(selection) {
      this.maintainDialog.anchorEntity.type = selection.key.string_id;
      this.maintainDialog.anchorEntity.param = selection.example_param;
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.router-info-container {
  height: 100%;
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor {
  height: 350px;
}
</style>
