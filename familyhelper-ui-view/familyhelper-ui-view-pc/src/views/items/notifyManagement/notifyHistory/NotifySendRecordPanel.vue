<template>
  <div class="notify-send-record-panel-container">
    <div v-if="notifyHistoryId===''" class="placeholder">
      请选择通知历史
    </div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            :page-size.sync="table.pageSize"
            :entity-count="parseInt(table.entities.count)"
            :current-page.sync="table.currentPage"
            :page-sizes="[15,20,30,50]"
            :table-data="table.entities.data"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="49"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
            @onEntityInspect="handleShowEntityInspectDialog"
          >
            <el-table-column
              prop="key.topic_id"
              label="主题"
              show-tooltip-when-overflow
              :formatter="topicFormatter"
            />
            <el-table-column
              prop="key.user_id"
              label="账户"
              show-tooltip-when-overflow
              :formatter="accountFormatter"
            />
            <el-table-column
              prop="succeed_flag"
              label="发送成功"
              width="80px"
              show-tooltip-when-overflow
              :formatter="booleanFormatter"
            />
            <el-table-column
              prop="sender_message"
              label="发送器消息"
              show-tooltip-when-overflow
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      label-width="82px"
      inspect-title="查看记录"
      mode="INSPECT"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :close-on-click-modal="false"
    >
      <el-form-item label="主题" prop="topic">
        <el-input
          v-model="maintainDialog.anchorEntity.topic"
          readonly
        />
      </el-form-item>
      <el-form-item label="账户" prop="account">
        <el-input
          v-model="maintainDialog.anchorEntity.account"
          readonly
        />
      </el-form-item>
      <el-form-item label="发送成功" prop="succeed_flag">
        <el-input
          v-model="maintainDialog.anchorEntity.succeed_flag"
          readonly
        />
      </el-form-item>
      <el-form-item label="发送器信息" prop="sender_message">
        <el-input
          v-model="maintainDialog.anchorEntity.sender_message"
          readonly
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import { childForNotifySettingDisp as childForNotifySetting } from '@/api/notify/notifySendRecord';
import resolveResponse from '@/util/response';

export default {
  name: 'NotifySendRecordPanel',
  components: {
    EntityMaintainDialog, TablePanel, HeaderLayoutPanel,
  },
  props: {
    notifyHistoryId: {
      type: String,
      required: true,
    },
  },
  watch: {
    notifyHistoryId() {
      this.handleSearch();
    },
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
        mode: 'CREATE',
        anchorEntity: {
          topic: '',
          account: '',
          succeed_flag: '',
          sender_message: '',
        },
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.notifyHistoryId === '') {
        return;
      }
      this.lookupChildForNotifySetting();
    },
    lookupChildForNotifySetting() {
      this.loading = true;
      resolveResponse(childForNotifySetting(
        this.notifyHistoryId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForNotifySetting(
              this.notifyHistoryId, res.total_pages - 1, this.table.pageSize,
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
    topicFormatter(row) {
      const { topic } = row;
      return this.formatTopic(topic);
    },
    accountFormatter(row) {
      const { account } = row;
      return this.formatAccount(account);
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      return this.formatBoolean(value);
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog();
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.topic = this.formatTopic(entity.topic);
      this.maintainDialog.anchorEntity.account = this.formatAccount(entity.account);
      this.maintainDialog.anchorEntity.succeed_flag = this.formatBoolean(entity.succeed_flag);
      this.maintainDialog.anchorEntity.sender_message = entity.sender_message;
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
    formatTopic(topic) {
      return `${topic.label}(${topic.key.string_id})`;
    },
    formatAccount(account) {
      return `${account.display_name}(${account.key.string_id})`;
    },
    formatBoolean(value) {
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
.notify-send-record-panel-container {
  height: 100%;
  width: 100%;
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
</style>
