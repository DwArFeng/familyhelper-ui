<template>
  <div class="sender-info-container">
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
          新建发送器信息
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
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="maintainDialog.anchorEntity.type"
          :readonly="maintainDialog.mode === 'INSPECT'"
        >
          <el-button
            v-if="maintainDialog.mode !== 'INSPECT'"
            slot="append"
            icon="el-icon-search"
            @click="senderSupportDialog.visible = true"
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
    <sender-support-select-dialog
      :visible.sync="senderSupportDialog.visible"
      @onConfirmed="handleSenderSupportSelected"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TextEditor from '@/components/text/TextEditor.vue';
import SenderSupportSelectDialog
from '@/views/items/notifyManagement/senderSupport/SenderSupportSelectDialog.vue';

import {
  all, insert, remove, update,
} from '@/api/notify/senderInfo';
import { exists as senderSupportExists } from '@/api/notify/senderSupport';
import resolveResponse from '@/util/response';

export default {
  name: 'SenderInfo',
  components: {
    SenderSupportSelectDialog,
    EntityMaintainDialog,
    TablePanel,
    BorderLayoutPanel,
    TextEditor,
  },
  data() {
    const senderTypeValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('发送器类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(senderSupportExists(value));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('不支持的发送器类型'));
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
            { validator: senderTypeValidator, trigger: 'blur' },
          ],
        },
      },
      notifySettingDialog: {
        visible: false,
      },
      senderSupportDialog: {
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
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.param,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '发送器信息创建成功',
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
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.param,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '发送器信息更新成功',
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
        .then(() => this.$confirm('此操作将永久删除此发送器信息。<br>'
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
            message: '发送器信息删除成功',
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
      this.maintainDialog.anchorEntity.type = entity.type;
      this.maintainDialog.anchorEntity.param = entity.param;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handleSenderSupportSelected(selection) {
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
.sender-info-container {
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
