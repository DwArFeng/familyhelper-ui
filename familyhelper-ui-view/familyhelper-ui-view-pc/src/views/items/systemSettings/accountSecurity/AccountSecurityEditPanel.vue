<template>
  <div class="account-security-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabs.activeName" tab-position="left">
      <el-tab-pane label="账户概览" name="account_overlook">
        <account-overlook-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @onPanelFloatyButtonClicked="handlePanelFloatyButtonClicked(0)"
        />
      </el-tab-pane>
      <el-tab-pane label="凭证管理" name="login_state">
        <login-state-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @onPanelFloatyButtonClicked="handlePanelFloatyButtonClicked(1)"
        />
      </el-tab-pane>
      <el-tab-pane label="登录历史" name="login_history">
        <login-history-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @onPanelFloatyButtonClicked="handlePanelFloatyButtonClicked(2)"
        />
      </el-tab-pane>
      <el-tab-pane label="派生历史" name="derive_history">
        <derive-history-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @onPanelFloatyButtonClicked="handlePanelFloatyButtonClicked(3)"
        />
      </el-tab-pane>
    </el-tabs>
    <floaty-dialog
      show-dock-button
      show-opacity-button
      show-content-mask
      :visible.sync="panelFloaty.visible"
      :title="panelFloaty.title"
      :z-index="100"
      :min-width="550"
      :min-height="200"
      :initial-x="panelFloaty.initialX"
      :initial-y="panelFloaty.initialY"
      :initial-height="panelFloaty.initialHeight"
      :initial-width="panelFloaty.initialWidth"
      :initial-dock-status="panelFloaty.initialDockStatus"
      :initial-content-opacity="panelFloaty.initialContentOpacity"
      @onVisualFieldAdjusted="handlePanelFloatyVisualFieldAdjusted"
      @onClosed="handlePanelFloatyClosed"
    >
      <account-overlook-panel
        v-if="panelFloaty.type === 0"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
        />
      <login-state-panel
        v-if="panelFloaty.type === 1"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
        />
      <login-history-panel
        v-if="panelFloaty.type === 2"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
        />
      <derive-history-panel
        v-if="panelFloaty.type === 3"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
        />
    </floaty-dialog>
  </div>
</template>

<script>
import AccountOverlookPanel
from '@/views/items/systemSettings/accountSecurity/AccountOverlookPanel.vue';
import LoginHistoryPanel from '@/views/items/systemSettings/accountSecurity/LoginHistoryPanel.vue';
import DeriveHistoryPanel
from '@/views/items/systemSettings/accountSecurity/DeriveHistoryPanel.vue';
import LoginStatePanel from '@/views/items/systemSettings/accountSecurity/LoginStatePanel.vue';
import FloatyDialog from '@/components/layout/FloatyDialog.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/textNode';
import resolveResponse from '@/util/response';

export default {
  name: 'AccountSecurityEditPanel',
  components: {
    FloatyDialog,
    LoginStatePanel,
    DeriveHistoryPanel,
    LoginHistoryPanel,
    AccountOverlookPanel,
  },
  props: {
    accountId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    upsc: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      tabs: {
        activeName: 'overlook',
      },
      panelFloaty: {
        visible: false,
        type: 0,
        title: '浮动窗口',
        initialX: 50,
        initialY: 100,
        initialHeight: 600,
        initialWidth: 800,
        initialDockStatus: 0,
        initialContentOpacity: 100,
      },
    };
  },
  methods: {
    handlePanelFloatyButtonClicked(type) {
      let changeFlag = false;
      if (this.panelFloaty.type !== type) {
        changeFlag = true;
        this.panelFloaty.type = type;
      }
      switch (type) {
        case 0:
          this.panelFloaty.title = '账户概览浮动窗口';
          break;
        case 1:
          this.panelFloaty.title = '凭证管理浮动窗口';
          break;
        case 2:
          this.panelFloaty.title = '登录历史浮动窗口';
          break;
        case 3:
          this.panelFloaty.title = '派生历史浮动窗口';
          break;
        default:
          this.panelFloaty.title = '浮动窗口';
          break;
      }
      if (!this.panelFloaty.visible) {
        changeFlag = true;
        this.panelFloaty.visible = true;
      }
      if (!changeFlag) {
        return;
      }
      this.updateUserPreference();
    },
    handlePanelFloatyVisualFieldAdjusted(visualField) {
      // 同步初始值。
      this.panelFloaty.initialX = visualField.x;
      this.panelFloaty.initialY = visualField.y;
      this.panelFloaty.initialHeight = visualField.height;
      this.panelFloaty.initialWidth = visualField.width;
      this.panelFloaty.initialDockStatus = visualField.dockStatus;
      this.panelFloaty.initialContentOpacity = visualField.contentOpacity;
      this.updateUserPreference();
    },
    handlePanelFloatyClosed() {
      this.updateUserPreference();
    },
    loadUserPreference() {
      if (this.upsc === '') {
        return;
      }
      this.loading = true;
      resolveResponse(operateInspect(this.upsc, [this.me]))
        .then((res) => {
          if (res !== null) {
            this.resumeUserPreference(JSON.parse(res.value));
          }
          return Promise.resolve();
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    resumeUserPreference(userPreference) {
      this.panelFloaty.visible = userPreference.panelFloaty.visible;
      this.panelFloaty.type = userPreference.panelFloaty.type;
      this.panelFloaty.initialX = userPreference.panelFloaty.initialX;
      this.panelFloaty.initialY = userPreference.panelFloaty.initialY;
      this.panelFloaty.initialHeight = userPreference.panelFloaty.initialHeight;
      this.panelFloaty.initialWidth = userPreference.panelFloaty.initialWidth;
      this.panelFloaty.initialDockStatus = userPreference.panelFloaty.initialDockStatus;
      this.panelFloaty.initialContentOpacity = userPreference.panelFloaty.initialContentOpacity;
      switch (this.panelFloaty.type) {
        case 0:
          this.panelFloaty.title = '账户概览浮动窗口';
          break;
        case 1:
          this.panelFloaty.title = '凭证管理浮动窗口';
          break;
        case 2:
          this.panelFloaty.title = '登录历史浮动窗口';
          break;
        case 3:
          this.panelFloaty.title = '派生历史浮动窗口';
          break;
        default:
          this.panelFloaty.title = '浮动窗口';
          break;
      }
    },
    updateUserPreference() {
      if (this.upsc === '') {
        return;
      }
      if (this.loading) {
        return;
      }
      resolveResponse(
        operatePut(
          this.upsc,
          [this.me],
          JSON.stringify(this.getUserPreference()),
        ),
      ).then(() => {
        this.$message({
          showClose: true,
          message: '偏好已更新',
          type: 'success',
          center: true,
        });
      });
    },
    getUserPreference() {
      return {
        panelFloaty: {
          visible: this.panelFloaty.visible,
          type: this.panelFloaty.type,
          initialX: this.panelFloaty.initialX,
          initialY: this.panelFloaty.initialY,
          initialHeight: this.panelFloaty.initialHeight,
          initialWidth: this.panelFloaty.initialWidth,
          initialDockStatus: this.panelFloaty.initialDockStatus,
          initialContentOpacity: this.panelFloaty.initialContentOpacity,
        },
      };
    },
  },
  mounted() {
    this.loadUserPreference();
  },
};

</script>

<style scoped>
.account-security-edit-panel-container {
  height: 100%;
  width: 100%;
}

.tabs-panel {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel >>> .el-tabs__content {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel >>> .el-tab-pane {
  height: 100%;
}
</style>
