<template>
  <div class="message-receive-container">
    <border-layout-panel
      class="border-layout-panel"
      west-visible
      west-width="30%"
    >
      <template v-slot:west>
        <header-layout-panel class="west-container">
          <template v-slot:header>
            <div class="header-container">
              <el-button type="success" @click="handleSearch">刷新</el-button>
            </div>
          </template>
          <template v-slot:default>
            <table-panel
              class="table-container"
              highlight-current-row
              pagination-adjust-strategy="FORCE_COMPACT"
              :page-size.sync="west.table.pageSize"
              :entity-count="parseInt(west.table.entities.count)"
              :current-page.sync="west.table.currentPage"
              :page-sizes="[15,20,30,50]"
              :table-data="west.table.entities.data"
              :table-selection.sync="west.table.selection"
              :operate-column-width="49"
              :inspect-button-visible="false"
              :edit-button-visible="false"
              :row-class-name="rowClassName"
              :cell-class-name="cellClassName"
              @onRowClick="handleMessageTableRowClick"
              @onEntityDelete="handleMessageMarkReceiveUserHide"
            >
              <template v-slot:default>
                <el-table-column
                  label="状态"
                  width="49px"
                  :resizable="false"
                >
                  <template v-slot:default="{row}">
                    <div class="icon-wrapper">
                      <!--suppress JSUnresolvedVariable -->
                      <i class="iconfont icon">{{ row.status | messageStatusIconFilter }}</i>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="send_account"
                  label="发送人"
                  show-tooltip-when-overflow
                  :formatter="accountFormatter"
                />
                <el-table-column
                  prop="subject"
                  label="主题"
                  show-tooltip-when-overflow
                />
              </template>
            </table-panel>
          </template>
        </header-layout-panel>
      </template>
      <template v-slot:default>
        <div class="center-container">
          <message-edit-panel
            readonly
            send-disabled
            :message-id="center.messageEditPanel.messageId"
            :upsc="center.messageEditPanel.upsc"
            @onMessagePropertyUpdated="handleSearch"
            @onMessageSent="handleSearch"
          />
        </div>
      </template>
    </border-layout-panel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import MessageEditPanel from '@/views/items/meAndClannad/message/MessageEditPanel.vue';
import resolveResponse from '@/util/response';
import {
  childForReceiveAccountDisplayDisp,
  exists,
  markReceived,
  markReceiveUserHide,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/message';

// noinspection JSAnnotator
export default {
  name: 'MessageReceive',
  components: {
    MessageEditPanel, TablePanel, HeaderLayoutPanel, BorderLayoutPanel,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  filters: {
    messageStatusIconFilter(messageStatus) {
      return messageStatus === 2 ? '\uffd8' : '\uffd9';
    },
  },
  data() {
    return {
      west: {
        table: {
          loading: 0,
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
      },
      center: {
        messageEditPanel: {
          messageId: '',
          messageStatus: 0,
          upsc: 'ui_preference.pc.me_and_clannad.message_receive.message_edit_panel',
        },
      },
    };
  },
  methods: {
    handleSearch() {
      this.handleSearchChildForSendAccount();
    },
    handleSearchChildForSendAccount() {
      this.west.table.loading += 1;
      resolveResponse(childForReceiveAccountDisplayDisp(
        this.me, this.west.table.currentPage, this.west.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForReceiveAccountDisplayDisp(
              this.me, res.total_pages - 1, this.west.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.west.table.loading -= 1;
        });
    },
    updateTableView(res) {
      this.west.table.entities = res;
      this.west.table.currentPage = res.current_page;
    },
    accountFormatter(row, column) {
      const account = row[column.property];
      if (!account) {
        return '（未指定）';
      }
      return `${account.display_name}(${account.key.string_id})`;
    },
    rowClassName({ row }) {
      // noinspection JSUnresolvedVariable
      return row.status === 2 ? '' : 'unread';
    },
    cellClassName({ columnIndex }) {
      return columnIndex === 0 ? '' : 'bold-column';
    },
    handleMessageTableRowClick(row) {
      if (row === null || row === undefined) {
        this.center.messageEditPanel.messageId = '';
        this.center.messageEditPanel.messageStatus = 0;
      } else {
        // 判断 value 是否存在。
        resolveResponse(exists(row.key.long_id))
          .then((res) => {
            if (!res) {
              this.$message({
                showClose: true,
                message: '留言已经被发送者删除，刷新数据！',
                type: 'warning',
                center: true,
              });
              this.handleSearch();
              return false;
            }
            this.center.messageEditPanel.messageId = row.key.long_id;
            this.center.messageEditPanel.messageStatus = row.status;
            return row.status !== 2;
          })
          .then((res) => {
            if (!res) {
              return;
            }
            this.west.table.loading += 1;
            resolveResponse(markReceived(row.key.long_id))
              .then(() => {
                this.$set(row, 'status', 2);
              })
              .catch(() => {
              })
              .finally(() => {
                this.west.table.loading -= 1;
              });
          })
          .catch(() => {
          });
      }
    },
    handleMessageMarkReceiveUserHide(index, entity) {
      let hideFlag = false;
      Promise.resolve(entity.key.long_id)
        .then((res) => this.$confirm('此操作将永久隐藏此留言，您无法再次显示该留言。<br>'
          + '该留言将继续保留在系统后台，除非留言的发送者主动删除该留言。<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w450',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => {
          this.west.table.loading += 1;
          hideFlag = true;
          return resolveResponse(markReceiveUserHide(res)).then(() => res);
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: '留言隐藏成功',
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
          if (hideFlag) {
            this.west.table.loading -= 1;
          }
        });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.message-receive-container {
  height: 100%;
  width: 100%;
}

.border-layout-panel {
  width: 100%;
  height: 100%;
}

.west-container {
  height: 100%;
  width: 100%;
}

.west-container .header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

/*noinspection CssUnusedSymbol*/
.west-container .header-container .el-divider--vertical {
  margin: 0 8px;
}

.west-container .table-container {
  height: 100%;
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.west-container .table-container >>> .unread .bold-column {
  font-weight: bold;
}

.west-container .table-container .icon-wrapper {
  height: 24px;
  line-height: 24px;
}

.west-container .table-container .icon {
  font-size: 24px;
  text-align: center;
  user-select: none;
  display: block;
}

.center-container {
  width: 100%;
  height: 100%;
}
</style>
