<template>
  <div class="notification-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <table-panel
        class="notification-table"
        :page-size.sync="pageSize"
        :entity-count="parseInt(entities.count)"
        :current-page.sync="currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="entities.data"
        :show-contextmenu="true"
        :edit-button-visible="false"
        :operate-column-width="76"
        :row-class-name="rowClassName"
        :cell-class-name="cellClassName"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
      >
        <el-table-column
          label="状态"
          width="49px"
          :resizable="false"
        >
          <template v-slot:default="{row}">
            <div class="icon-wrapper">
              <!--suppress JSUnresolvedVariable -->
              <i class="iconfont icon">{{ row.read_flag | fileType }}</i>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="notified_date"
          label="通知日期"
          width="180px"
          :resizable="false"
          :formatter="timestampFormatter"
        />
        <el-table-column
          prop="subject"
          label="主题"
          show-tooltip-when-overflow
        >
          <template v-slot="{row,column}">
            <!--suppress JSUnresolvedReference -->
            <div class="subject-column" @click="handleShowDetailDialog(row)">
              {{ formatSubject(row[column.property]) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          show-tooltip-when-overflow
        />
        <template v-slot:operateColumn="{row}">
          <el-button-group>
            <!--suppress JSUnresolvedVariable -->
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-finished"
              type="success"
              :disabled="row.read_flag"
              @click="handleNotificationRead(row)"
            />
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-delete"
              type="danger"
              @click="handleNotificationDelete(row)"
            />
          </el-button-group>
        </template>
      </table-panel>
      <div class="header-container" slot="header">
        <el-button type="success" @click="handleSearch">刷新数据</el-button>
        <el-divider direction="vertical"/>
        <el-button
          class="operate-button"
          type="primary"
          @click="handleAllNotificationRead"
        >
          全部已读
        </el-button>
        <el-button
          class="operate-button"
          type="danger"
          @click="handleAllNotificationDelete"
        >
          全部删除
        </el-button>
        <el-divider direction="vertical"/>
        <el-switch
          v-model="unreadSwitch.value"
          active-text="仅未读"
          inactive-text="全部"
          active-color="#409EFF"
          inactive-color="#409EFF"
          @change="handleSearch"
        />
      </div>
    </border-layout-panel>
    <el-dialog
      append-to-body
      destroy-on-close
      close-on-click-modal
      title="通知详情"
      top="9vh"
      :visible.sync="detailDialog.visible"
    >
      <div class="detail-wrapper">
        <div>{{formatSubject(detailDialog.subject)}}</div>
        <el-divider/>
        <div class="detail-body-wrapper">
          <el-empty
            v-if="isStringEmpty(detailDialog.body)"
            class="detail-body empty-body"
            description="没有正文"
          />
          <text-editor
            v-else class="detail-body text-editor"
            v-model="detailDialog.body"
            readonly
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import TextEditor from '@/components/text/TextEditor.vue';

import {
  childForUser,
  childForUserUnread,
  read,
  readAll,
  remove,
  removeAll,
} from '@/api/clannad/notification';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';

// noinspection JSAnnotator
export default {
  name: 'Notification',
  components: {
    TextEditor, BorderLayoutPanel, TablePanel,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  filters: {
    fileType(readFlag) {
      return readFlag ? '\uffd8' : '\uffd9';
    },
  },
  data() {
    return {
      entities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      currentPage: 0,
      pageSize: 15,
      unreadSwitch: {
        value: false,
      },
      loading: false,
      detailDialog: {
        visible: false,
        subject: '',
        body: '',
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.updateUnreadCount();
      if (this.unreadSwitch.value) {
        this.lookupChildForMeUnread();
      } else {
        this.lookupChildForMe();
      }
    },
    lookupChildForMe() {
      this.loading = true;
      resolveResponse(childForUser(this.me, this.currentPage, this.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForUser(this.me, res.total_pages - 1, this.pageSize));
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
    lookupChildForMeUnread() {
      this.loading = true;
      resolveResponse(childForUserUnread(this.me, this.currentPage, this.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForUserUnread(this.me, res.total_pages - 1, this.pageSize));
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
      this.entities = res;
      this.currentPage = res.current_page;
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    rowClassName({ row }) {
      // noinspection JSUnresolvedVariable
      return row.read_flag ? '' : 'unread';
    },
    cellClassName({ columnIndex }) {
      return columnIndex === 0 ? '' : 'bold-column';
    },
    handleNotificationRead(row) {
      this.loading = true;
      resolveResponse(read(row.key.long_id))
        .then(() => {
          this.$message({
            showClose: true,
            message: '通知设为已读',
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
    handleNotificationDelete(row) {
      this.$confirm('此操作将永久删除此通知。<br>'
        + '该操作不可恢复！<br>'
        + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      })
        .then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => {
          this.loading = true;
        })
        .then(() => resolveResponse(remove(row.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '通知删除成功',
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
    handleAllNotificationRead() {
      this.loading = true;
      resolveResponse(readAll(this.me))
        .then(() => {
          this.$message({
            showClose: true,
            message: '通知设为已读',
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
    handleAllNotificationDelete() {
      this.$confirm('此操作将永久删除当前为止所有的通知。<br>'
        + '该操作不可恢复！<br>'
        + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      })
        .then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => {
          this.loading = true;
        })
        .then(() => resolveResponse(removeAll(this.me)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '通知删除成功',
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
    handleShowDetailDialog(row) {
      this.detailDialog.subject = row.subject;
      this.detailDialog.body = row.body;
      this.detailDialog.visible = true;
      // noinspection JSUnresolvedReference
      if (row.read_flag) {
        return;
      }
      resolveResponse(read(row.key.long_id))
        .then(() => {
          this.handleSearch();
        });
    },
    formatSubject(subject) {
      return this.isStringEmpty(subject) ? '（无主题）' : subject;
    },
    isStringEmpty(val) {
      return val === null || val === undefined || val === '';
    },
    ...mapActions('notification', ['updateUnreadCount']),
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.notification-container {
  height: 100%;
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.notification-table >>> .unread .bold-column {
  font-weight: bold;
}

.notification-table .icon-wrapper {
  height: 24px;
  line-height: 24px;
}

.notification-table .icon {
  font-size: 24px;
  text-align: center;
  user-select: none;
  display: block;
}

.notification-table .table-button {
  padding: 7px;
}

.notification-table .subject-column {
  width: fit-content;
  max-width: 100%;
  text-decoration: underline;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-wrapper {
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.detail-wrapper .el-divider {
  margin: 5px 0;
}

.detail-body-wrapper{
  height: 600px;
  width: 100%;
}

.detail-body-wrapper .detail-body{
  height: 100%;
  width: 100%;
}

.detail-body-wrapper .empty-body >>> p {
  user-select: none;
}
</style>
