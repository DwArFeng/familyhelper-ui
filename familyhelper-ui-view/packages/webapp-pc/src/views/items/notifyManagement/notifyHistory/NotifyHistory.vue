<template>
  <div class="notify-history-container">
    <border-layout-panel class="border-layout-panel" west-visible west-width="40%">
      <template v-slot:west>
        <notify-history-panel @onCurrentNotifyHistoryChanged="handleCurrentNotifyHistoryChanged" />
      </template>
      <template v-slot:default>
        <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="right">
          <el-tab-pane name="notifyInfoRecord" label="信息记录">
            <notify-info-record-panel :notify-history="notifyHistory" />
          </el-tab-pane>
          <el-tab-pane name="notifySendRecord" label="发送记录">
            <notify-send-record-panel :notify-history="notifyHistory" />
          </el-tab-pane>
        </el-tabs>
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import NotifyHistoryPanel from './subPanels/NotifyHistoryPanel.vue'
import NotifyInfoRecordPanel from './subPanels/NotifyInfoRecordPanel.vue'
import NotifySendRecordPanel from './subPanels/NotifySendRecordPanel.vue'

import type { DispNotifyHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifyHistory.ts'

defineOptions({
  name: 'NotifyHistory',
})

const notifyHistory = ref<DispNotifyHistory | null>(null)

function handleCurrentNotifyHistoryChanged(value: DispNotifyHistory | null): void {
  notifyHistory.value = value
}

const tabsActiveName = ref<'notifyInfoRecord' | 'notifySendRecord'>('notifyInfoRecord')
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
.tabs-panel :deep(.el-tabs__content) {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tab-pane) {
  height: 100%;
}
</style>
