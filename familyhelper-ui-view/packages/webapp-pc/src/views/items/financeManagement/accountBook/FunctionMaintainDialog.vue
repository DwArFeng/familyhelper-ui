<template>
  <div class="function-maintain-dialog-container">
    <el-dialog
      id="dialog"
      append-to-body
      title="功能编辑"
      top="6vh"
      :visible.sync="dialog.watchedVisible"
      :close-on-click-modal="false"
    >
      <div class="dialog-container">
        <el-tabs class="tabs-panel" v-model="tabs.activeName" tab-position="left">
          <el-tab-pane name="permit" label="权限管理">
            <permit-maintain-panel :account-book-id="accountBookId"/>
          </el-tab-pane>
          <el-tab-pane name="remind" label="提醒管理">
            <remind-maintain-panel :account-book-id="accountBookId"/>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="footer-container" slot="footer">
        <el-button @click="dialog.watchedVisible=false">
          关闭窗口
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import PermitMaintainPanel
from '@/views/items/financeManagement/accountBook/PermitMaintainPanel.vue';
import RemindMaintainPanel
from '@/views/items/financeManagement/accountBook/RemindMaintainPanel.vue';

export default {
  name: 'FunctionMaintainDialog',
  components: { PermitMaintainPanel, RemindMaintainPanel },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    accountBookId: {
      type: String,
      default: '',
    },
  },
  watch: {
    visible(value) {
      this.dialog.watchedVisible = value;
    },
    'dialog.watchedVisible': {
      handler(value) {
        this.$emit('update:visible', value);
      },
    },
  },
  data() {
    return {
      dialog: {
        watchedVisible: false,
      },
      tabs: {
        activeName: 'permit',
      },
    };
  },
};
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 68vh;
  display: flex;
  flex-direction: column;
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
