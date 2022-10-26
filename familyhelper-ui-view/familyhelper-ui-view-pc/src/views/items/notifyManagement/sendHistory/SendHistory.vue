<template>
  <div class="send-history-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <table-panel
        class="table"
        :page-size.sync="table.pageSize"
        :entity-count="parseInt(table.entities.count)"
        :current-page.sync="table.currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="table.entities.data"
        :operate-column-width="76"
        :inspect-button-visible="true"
        :edit-button-visible="false"
        :delete-button-visible="true"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
        @onEntityInspect="handleShowEntityInspectDialog"
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
          prop="account.display_name"
          label="账户"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="happened_date"
          label="发送日期"
          :formatter="dateFormatter"
        />
        <el-table-column
          prop="sender_message"
          label="发送器消息"
        />
        <el-table-column
          class-name="single-line"
          prop="route_info"
          label="路由信息"
        />
        <el-table-column
          class-name="single-line"
          prop="dispatch_info"
          label="调度信息"
        />
        <el-table-column
          class-name="single-line"
          prop="send_info"
          label="发送信息"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="remark"
          label="备注"
          show-tooltip-when-overflow
        />
      </table-panel>
      <div class="header-container" slot="header">
        <el-button type="success" @click="handleSearch">刷新数据</el-button>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      mode="INSPECT"
      label-width="85px"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :close-on-click-modal="false"
    >
      <el-form-item label="通知设置" prop="notify_setting.label">
        <el-input v-model="maintainDialog.anchorEntity.notify_setting.label" readonly/>
      </el-form-item>
      <el-form-item label="主题" prop="topic.label">
        <el-input v-model="maintainDialog.anchorEntity.topic.label" readonly/>
      </el-form-item>
      <el-form-item label="账户" prop="account.display_name">
        <el-input v-model="maintainDialog.anchorEntity.account.display_name" readonly/>
      </el-form-item>
      <el-form-item label="发送日期" prop="happened_date">
        <el-input v-model="maintainDialog.anchorEntity.formatted_happened_date" readonly/>
      </el-form-item>
      <el-form-item label="发送器消息" prop="sender_message">
        <el-input v-model="maintainDialog.anchorEntity.sender_message" readonly/>
      </el-form-item>
      <el-form-item label="路由信息" prop="route_info">
        <text-editor
          class="text-editor"
          v-model="maintainDialog.anchorEntity.route_info"
          readonly
        />
      </el-form-item>
      <el-form-item label="调度信息" prop="dispatch_info">
        <text-editor
          class="text-editor"
          v-model="maintainDialog.anchorEntity.dispatch_info"
          readonly
        />
      </el-form-item>
      <el-form-item label="发送信息" prop="send_info">
        <text-editor
          class="text-editor"
          v-model="maintainDialog.anchorEntity.send_info"
          readonly
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="maintainDialog.anchorEntity.remark" readonly/>
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TextEditor from '@/components/text/TextEditor.vue';

import { formatTimestamp } from '@/util/timestamp';

import { remove, allDisp as all } from '@/api/notify/sendHistory';
import resolveResponse from '@/util/response';

export default {
  name: 'SendHistory',
  components: {
    TextEditor, EntityMaintainDialog, TablePanel, BorderLayoutPanel,
  },
  data() {
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
        anchorEntity: {
          key: {
            long_id: '',
          },
          notify_setting: {
            label: '',
          },
          topic: {
            label: '',
          },
          account: {
            display_name: '',
          },
          happened_date: 0,
          sender_message: '',
          route_info: '',
          dispatch_info: '',
          send_info: '',
          remark: '',
          formatted_happened_date: '',
        },
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
      this.loading = true;
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
          this.loading = false;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    handleShowEntityInspectDialog(index, entity) {
      this.maintainDialog.anchorEntity.key.long_id = entity.key.long_id;
      if (entity.notify_setting === null) {
        this.maintainDialog.anchorEntity.notify_setting.label = '';
      } else {
        this.maintainDialog.anchorEntity.notify_setting.label = entity.notify_setting.label;
      }
      if (entity.topic === null) {
        this.maintainDialog.anchorEntity.topic.label = '';
      } else {
        this.maintainDialog.anchorEntity.topic.label = entity.topic.label;
      }
      if (entity.account === null) {
        this.maintainDialog.anchorEntity.account.display_name = '';
      } else {
        this.maintainDialog.anchorEntity.account.display_name = entity.account.display_name;
      }
      this.maintainDialog.anchorEntity.happened_date = entity.happened_date;
      this.maintainDialog.anchorEntity.sender_message = entity.sender_message;
      this.maintainDialog.anchorEntity.route_info = entity.route_info;
      this.maintainDialog.anchorEntity.dispatch_info = entity.dispatch_info;
      this.maintainDialog.anchorEntity.send_info = entity.send_info;
      this.maintainDialog.anchorEntity.remark = entity.remark;
      this.maintainDialog.anchorEntity.formatted_happened_date = formatTimestamp(
        entity.happened_date,
      );
      this.maintainDialog.visible = true;
    },
    handleEntityDelete(index, entity) {
      Promise.resolve()
        .then(() => this.$confirm('此操作将永久删除此发送历史。<br>'
          + '该操作不可恢复！<br>'
          + '是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject()))
        .then(() => {
          this.loading = true;
        })
        .then(() => resolveResponse(remove(entity.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '发送历史删除成功',
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
    dateFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.send-history-container{
  height: 100%;
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor{
  height: 300px;
}
</style>
