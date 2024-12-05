<template>
  <div class="message-send-container">
    <border-layout-panel
      class="border-layout-panel"
      west-visible
      west-width="30%"
    >
      <template v-slot:west>
        <header-layout-panel class="west-container">
          <template v-slot:header>
            <div class="header-container">
              <el-button type="primary" @click="handleShowMessageCreateDialog">新建留言</el-button>
              <el-divider direction="vertical"/>
              <el-button type="success" @click="handleSearch">刷新</el-button>
              <el-divider direction="vertical"/>
              <el-select
                class="flex-expand"
                v-model="west.header.messageStatusSelect.value"
                placeholder="消息状态"
                clearable
                @change="handleSearch"
              >
                <el-option
                  v-for="indicator in west.header.messageStatusSelect.indicator"
                  :key="indicator.key"
                  :label="indicator.label"
                  :value="indicator.key"
                />
              </el-select>
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
              @onEntityDelete="handleMessageDelete"
            >
              <template v-slot:default>
                <el-table-column
                  prop="receive_account"
                  label="接收人"
                  show-tooltip-when-overflow
                  :formatter="accountFormatter"
                />
                <el-table-column
                  prop="subject"
                  label="主题"
                  show-tooltip-when-overflow
                />
                <el-table-column
                  prop="status"
                  label="状态"
                  show-tooltip-when-overflow
                  :formatter="messageStatusFormatter"
                />
              </template>
            </table-panel>
          </template>
        </header-layout-panel>
      </template>
      <template v-slot:default>
        <div class="center-container">
          <message-edit-panel
            :message-id="center.messageEditPanel.messageId"
            :readonly="[1, 2].includes(center.messageEditPanel.messageStatus)"
            :upsc="center.messageEditPanel.upsc"
            @onMessagePropertyUpdated="handleSearch"
            @onMessageSent="handleSearch"
          />
        </div>
      </template>
    </border-layout-panel>
    <entity-maintain-dialog
      custom-class="entity-maintain-dialog"
      top="12vh"
      label-width="100px"
      mode="CREATE"
      :loading="maintainDialog.loading > 0"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleMessageCreate"
    >
      <el-form-item label="接收人" prop="receive_user_key">
        <div class="account-selector-wrapper">
          <!--suppress JSUnresolvedReference -->
          <message-authorize-account-selector
            class="account-selector"
            v-model="maintainDialog.anchorEntity.receive_user_key"
            placeholder="请选择接收人，可暂时不填"
            clearable
            :filter="(d)=> d.key.receive_user_id !== me"
          />
          <el-popover
            placement="bottom"
            title="用户选择器中没有弹出选项？"
            width="240"
            trigger="hover"
            content="如果用户选择器中没有弹出选项，说明没有任何人为您开放留言授权，您可以在现实中用其它方式联系相应的用户开放授权。"
          >
            <template v-slot:reference>
              <el-button icon="el-icon-question"/>
            </template>
          </el-popover>
        </div>
      </el-form-item>
      <el-form-item label="主题" prop="subject">
        <el-input
          v-model="maintainDialog.anchorEntity.subject"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import MessageAuthorizeAccountSelector
from '@/views/items/meAndClannad/messageAuthorize/MessageAuthorizeAccountSelector.vue';
import MessageEditPanel from '@/views/items/meAndClannad/message/MessageEditPanel.vue';

import {
  childForSendAccountDisplayDisp,
  childForSendAccountStatusEqDisplayDisp,
  create,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/message';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'MessageSend',
  components: {
    MessageEditPanel,
    MessageAuthorizeAccountSelector,
    EntityMaintainDialog,
    TablePanel,
    HeaderLayoutPanel,
    BorderLayoutPanel,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    'west.table.selection': {
      handler(value) {
        if (value === null || value === undefined) {
          this.center.messageEditPanel.messageId = '';
          this.center.messageEditPanel.messageStatus = 0;
        } else {
          this.center.messageEditPanel.messageId = value.key.long_id;
          this.center.messageEditPanel.messageStatus = value.status;
        }
      },
    },
  },
  data() {
    return {
      west: {
        header: {
          messageStatusSelect: {
            value: null,
            indicator: [
              { key: 0, label: '编辑中' },
              { key: 1, label: '已发送' },
              { key: 2, label: '已接收' },
            ],
          },
        },
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
          upsc: 'ui_preference.pc.me_and_clannad.message_send.message_edit_panel',
        },
      },
      maintainDialog: {
        loading: 0,
        visible: false,
        anchorEntity: {
          receive_user_key: '',
          subject: '',
          remark: '',
        },
        rules: {
          subject: [
            { required: true, message: '主题不能为空', trigger: 'blur' },
          ],
        },
      },
    };
  },
  methods: {
    handleSearch() {
      let messageStatus = this.west.header.messageStatusSelect.value;
      if (messageStatus === '') {
        messageStatus = null;
      }
      if (messageStatus === null) {
        this.handleSearchChildForSendAccount();
      } else {
        this.handleSearchChildForSendAccountStatusEq();
      }
    },
    handleSearchChildForSendAccount() {
      this.west.table.loading += 1;
      resolveResponse(childForSendAccountDisplayDisp(
        this.me, this.west.table.currentPage, this.west.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForSendAccountDisplayDisp(
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
    handleSearchChildForSendAccountStatusEq() {
      this.west.table.loading += 1;
      const status = this.west.header.messageStatusSelect.value;
      resolveResponse(childForSendAccountStatusEqDisplayDisp(
        this.me, status, this.west.table.currentPage, this.west.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForSendAccountStatusEqDisplayDisp(
              this.me, status, res.total_pages - 1, this.west.table.pageSize,
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
    messageStatusFormatter(row, column) {
      switch (row[column.property]) {
        case 0:
          return '编辑中';
        case 1:
          return '已发送';
        case 2:
          return '已接收';
        default:
          return '（未知）';
      }
    },
    handleShowMessageCreateDialog() {
      this.showMessageMaintainDialog();
    },
    showMessageMaintainDialog() {
      this.maintainDialog.visible = true;
    },
    handleMessageCreate() {
      this.maintainDialog.loading += 1;
      resolveResponse(create(
        this.maintainDialog.anchorEntity.receive_user_key,
        this.maintainDialog.anchorEntity.subject,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '留言创建成功',
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
          this.maintainDialog.loading -= 1;
        });
    },
    handleMessageDelete(index, entity) {
      let deleteFlag = false;
      Promise.resolve(entity.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此留言，接收者留言查看功能中对应的数据也会一并删除。<br>'
          + '<b>此操作不可恢复!</b><br>'
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
          deleteFlag = true;
          return resolveResponse(remove(res)).then(() => res);
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: '留言删除成功',
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
          if (deleteFlag) {
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
.message-send-container {
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

.west-container .header-container .flex-expand {
  width: 0;
  flex-grow: 1;
}

.west-container .table-container {
  height: 100%;
  width: 100%;
}

.center-container {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.entity-maintain-dialog .account-selector-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  column-gap: 5px;
}

/*noinspection CssUnusedSymbol*/
.entity-maintain-dialog .account-selector-wrapper .account-selector {
  width: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.entity-maintain-dialog .account-selector-wrapper >>> .el-button {
  height: 100%;
  padding: 10px;
}

.entity-maintain-dialog .account-selector-wrapper > span {
  height: 40px;
}

.entity-maintain-dialog .account-selector-wrapper >>> .el-button i {
  font-size: 18px;
}
</style>
