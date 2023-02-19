<template>
  <div class="notify-history-container">
    <border-layout-panel class="border-layout-panel" west-visible west-width="40%">
      <template v-slot:west>
        <notify-history-panel @onNotifyHistoryChanged="handleNotifyHistoryChanged"/>
      </template>
      <template v-slot:default>
        <el-tabs class="tabs-panel" v-model="tabs.activeName" tab-position="right">
          <el-tab-pane name="notifyInfoRecord" label="信息记录">
            <notify-info-record-panel :notifyHistoryId="notifyHistoryId"/>
          </el-tab-pane>
          <el-tab-pane name="notifySendRecord" label="发送记录">
            <notify-send-record-panel :notifyHistoryId="notifyHistoryId"/>
          </el-tab-pane>
        </el-tabs>
      </template>
    </border-layout-panel>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import NotifyHistoryPanel
from '@/views/items/notifyManagement/notifyHistory/NotifyHistoryPanel.vue';
import NotifyInfoRecordPanel
from '@/views/items/notifyManagement/notifyHistory/NotifyInfoRecordPanel.vue';
import NotifySendRecordPanel
from '@/views/items/notifyManagement/notifyHistory/NotifySendRecordPanel.vue';

export default {
  name: 'NotifyHistory',
  components: {
    NotifySendRecordPanel, NotifyInfoRecordPanel, NotifyHistoryPanel, BorderLayoutPanel,
  },
  data() {
    return {
      notifyHistoryId: '',
      tabs: {
        activeName: 'notifyInfoRecord',
      },
    };
  },
  methods: {
    handleNotifyHistoryChanged(notifyHistory) {
      if (notifyHistory === null || notifyHistory === undefined) {
        this.notifyHistoryId = '';
      } else {
        this.notifyHistoryId = notifyHistory.key.long_id;
      }
    },
  },
};
</script>

<style scoped>
.notify-history-container {
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
