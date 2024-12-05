<template>
  <div class="message-info-panel-container">
    <div class="placeholder" v-if="messageId===''">请选择留言</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              class="item"
              v-if="!sendDisabled"
              type="primary"
              :disabled="sendButtonDisabled"
              @click="handleSendButtonClicked"
            >
              消息发送
            </el-button>
            <el-divider v-if="!sendDisabled" direction="vertical"/>
            <el-button
              class="item"
              type="primary"
              :disabled="readonly"
              @click="handleShowEditDialog"
            >
              编辑属性
            </el-button>
            <el-divider direction="vertical"/>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <div style="flex-grow: 1"/>
            <div v-if="mode==='DEFAULT'" style="flex-grow: 1"/>
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
          <title-layout-panel class="property-container" title="属性" bordered>
            <overlay-scrollbars>
              <el-form
                class="property-form"
                label-position="left"
                label-width="80px"
                inline
                :model="message"
              >
                <el-form-item label="发送人" style="width: 50%">
                  {{ formatAccount(message.send_account) }}
                </el-form-item>
                <el-form-item label="接收人" style="width: 50%">
                  {{ formatAccount(message.receive_account) }}
                </el-form-item>
                <el-form-item label="主题" style="width: 100%">
                  {{ message.subject }}
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  {{ message.remark }}
                </el-form-item>
                <el-form-item label="状态" style="width: 100%">
                  {{ formatMessageStatus(message.status) }}
                </el-form-item>
                <el-form-item label="发送日期" style="width: 50%">
                  {{ wrappedFormatTimestamp(message.sent_date) }}
                </el-form-item>
                <el-form-item label="接收日期" style="width: 50%">
                  {{ wrappedFormatTimestamp(message.received_date) }}
                </el-form-item>
                <el-form-item label="创建日期" style="width: 50%">
                  {{ wrappedFormatTimestamp(message.created_date) }}
                </el-form-item>
                <el-form-item label="附件数量" style="width: 50%">
                  {{ message.attachment_count }}
                </el-form-item>
              </el-form>
            </overlay-scrollbars>
          </title-layout-panel>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      custom-class="entity-maintain-dialog"
      top="12vh"
      label-width="120px"
      mode="EDIT"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading > 0"
      @onEntityEdit="handleEntityEdit"
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

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import { inspectDisp, update } from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/message';
import resolveResponse from '@/util/response';

import { formatTimestamp } from '@/util/timestamp';
import MessageAuthorizeAccountSelector
from '@/views/items/meAndClannad/messageAuthorize/MessageAuthorizeAccountSelector.vue';

// noinspection JSAnnotator
export default {
  name: 'MessageInfoPanel',
  components: {
    MessageAuthorizeAccountSelector, EntityMaintainDialog, TitleLayoutPanel, HeaderLayoutPanel,
  },
  props: {
    messageId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      required: true,
    },
    sendDisabled: {
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
    sendButtonDisabled() {
      return this.readonly || this.message.receive_user_key === '';
    },
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    messageId() {
      this.handleSearch();
    },
  },
  data() {
    return {
      loading: 0,
      message: {
        send_user_key: '',
        receive_user_key: '',
        subject: '',
        remark: '',
        status: 0,
        sent_date: '（暂无）',
        received_date: '（暂无）',
        attachment_count: 0,
        send_account: null,
        receive_account: null,
        created_date: '（暂无）',
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
      if (this.messageId === '') {
        return;
      }
      this.inspectEntity();
    },
    inspectEntity() {
      this.loading += 1;
      resolveResponse(inspectDisp(this.messageId))
        .then(this.updateEntityView)
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateEntityView(res) {
      this.message.send_user_key = res.send_user_key.string_id;
      this.message.receive_user_key = res.receive_user_key ? res.receive_user_key.string_id : '';
      this.message.subject = res.subject;
      this.message.remark = res.remark;
      this.message.status = res.status;
      this.message.sent_date = res.sent_date;
      this.message.received_date = res.received_date;
      this.message.attachment_count = res.attachment_count;
      this.message.send_account = res.send_account;
      this.message.receive_account = res.receive_account;
      this.message.created_date = res.created_date;
    },
    formatAccount(account) {
      if (account === null || account === undefined) {
        return '（暂无）';
      }
      return `${account.display_name}(${account.key.string_id})`;
    },
    wrappedFormatTimestamp(timestamp) {
      if (timestamp === null || timestamp === undefined || timestamp === 0) {
        return '（暂无）';
      }
      return formatTimestamp(timestamp);
    },
    formatMessageStatus(status) {
      switch (status) {
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
    handleShowEditDialog() {
      this.syncAnchorEntity();
      this.showDialog();
    },
    syncAnchorEntity() {
      this.maintainDialog.anchorEntity.receive_user_key = this.message.receive_user_key;
      this.maintainDialog.anchorEntity.subject = this.message.subject;
      this.maintainDialog.anchorEntity.remark = this.message.remark;
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
    handleEntityEdit() {
      this.maintainDialog.loading += 1;
      resolveResponse(update(
        this.messageId,
        this.maintainDialog.anchorEntity.receive_user_key,
        this.maintainDialog.anchorEntity.subject,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '留言更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.maintainDialog.visible = false;
          this.$emit('onMessagePropertyUpdated');
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading -= 1;
        });
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
    handleSendButtonClicked() {
      this.$emit('onMessageSend');
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.message-info-panel-container {
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

.header-container .icon-button {
  padding: 11px;
}

.property-container {
  height: 100%;
  width: 100%;
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-container .property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
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
