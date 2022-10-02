<template>
  <div class="sender-relation-container">
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
          prop="notify_setting.label"
          label="通知设置"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="topic.label"
          label="主题"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="sender_info.label"
          label="关联发送器"
          show-tooltip-when-overflow
          :formatter="senderInfoFormatter"
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
      :create-rules="maintainDialog.createRules"
      :edit-rules="maintainDialog.editRules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="通知设置" prop="key.notify_setting_id">
        <notify-setting-input
          v-model="maintainDialog.anchorEntity.key.notify_setting_id"
          :readonly="maintainDialog.mode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="主题设置" prop="key.topic_id">
        <topic-input
          v-model="maintainDialog.anchorEntity.key.topic_id"
          :readonly="maintainDialog.mode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="关联发送器" prop="sender_info_key.long_id">
        <sender-info-input
          v-model="maintainDialog.anchorEntity.sender_info_key.long_id"
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
import RouterSupportSelectDialog
from '@/views/items/notifyManagement/routerSupport/RouterSupportSelectDialog.vue';
import NotifySettingInput
from '@/views/items/notifyManagement/notifySetting/NotifySettingInput.vue';
import TopicInput from '@/views/items/notifyManagement/topic/TopicInput.vue';
import SenderInfoInput from '@/views/items/notifyManagement/senderInfo/SenderInfoInput.vue';

import resolveResponse from '@/util/response';
import {
  allDisp, exists, insert, remove, update,
} from '@/api/notify/senderRelation';

export default {
  name: 'SenderRelation',
  components: {
    SenderInfoInput,
    TopicInput,
    NotifySettingInput,
    RouterSupportSelectDialog,
    EntityMaintainDialog,
    TablePanel,
    BorderLayoutPanel,
  },
  data() {
    const notifySettingIdValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('通知设置不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(
            this.maintainDialog.anchorEntity.key.notify_setting_id,
            this.maintainDialog.anchorEntity.key.topic_id,
          ));
        })
        .then((res) => {
          if (res) {
            callback(new Error('通知设置与主题组合已存在'));
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
    const topicIdValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('主题不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(
            this.maintainDialog.anchorEntity.key.notify_setting_id,
            this.maintainDialog.anchorEntity.key.topic_id,
          ));
        })
        .then((res) => {
          if (res) {
            callback(new Error('通知设置与主题组合已存在'));
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
            notify_setting_id: '',
            topic_id: '',
          },
          sender_info_key: {
            long_id: '',
          },
          remark: '',
        },
        createRules: {
          'key.notify_setting_id': [
            { required: true, message: '通知设置不能为空', trigger: 'blur' },
            { validator: notifySettingIdValidator, trigger: 'blur' },
          ],
          'key.topic_id': [
            { required: true, message: '主题不能为空', trigger: 'blur' },
            { validator: topicIdValidator, trigger: 'blur' },
          ],
          'sender_info_key.long_id': [
            { required: true, message: '发送器不能为空', trigger: 'blur' },
          ],
        },
        editRules: {
          'sender_info_key.long_id': [
            { required: true, message: '发送器不能为空', trigger: 'blur' },
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
        this.maintainDialog.anchorEntity.key.notify_setting_id,
        this.maintainDialog.anchorEntity.key.topic_id,
        this.maintainDialog.anchorEntity.sender_info_key.long_id,
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
        this.maintainDialog.anchorEntity.key.notify_setting_id,
        this.maintainDialog.anchorEntity.key.topic_id,
        this.maintainDialog.anchorEntity.sender_info_key.long_id,
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
        .then(() => this.$confirm('此操作将永久删除此关联设置。<br>'
          + '该操作不可恢复！<br>'
          + '是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject()))
        .then(() => resolveResponse(remove(entity.key.notify_setting_id, entity.key.topic_id)))
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
      this.maintainDialog.anchorEntity.key.notify_setting_id = entity.key.notify_setting_id;
      this.maintainDialog.anchorEntity.key.topic_id = entity.key.topic_id;
      if (entity.sender_info_key === null) {
        this.maintainDialog.anchorEntity.sender_info_key.long_id = '';
      } else {
        this.maintainDialog.anchorEntity.sender_info_key
          .long_id = entity.sender_info_key.long_id;
      }
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    senderInfoFormatter(row) {
      // noinspection JSUnresolvedVariable
      if (row.sender_info !== null) {
        // noinspection JSUnresolvedVariable
        return row.sender_info.label;
      }
      if (row.sender_info_key === null) {
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
.sender-relation-container {
  height: 100%;
  width: 100%;
}
</style>
