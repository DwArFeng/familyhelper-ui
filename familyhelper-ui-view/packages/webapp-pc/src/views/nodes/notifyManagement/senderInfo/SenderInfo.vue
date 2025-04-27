<template>
  <div class="sender-info-container">
    <border-layout-panel class="border-layout-panel" west-width="50%" :west-visible="true">
      <template v-slot:west>
        <notify-setting-topic-panel
          @onCurrentNotifySettingChanged="handleCurrentNotifySettingChanged"
          @onCurrentTopicChanged="handleCurrentTopicChanged"
        />
      </template>
      <template v-slot:default>
        <sender-info-panel :notify-setting="notifySetting" :topic="topic" />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import NotifySettingTopicPanel from './subPanels/NotifySettingTopicPanel.vue'
import SenderInfoPanel from './subPanels/SenderInfoPanel.vue'

import { type NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import { type Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'

defineOptions({
  name: 'SenderInfoComponent',
})

const notifySetting = ref<NotifySetting | null>(null)
const topic = ref<Topic | null>(null)

function handleCurrentNotifySettingChanged(value: NotifySetting | null): void {
  notifySetting.value = value
}

function handleCurrentTopicChanged(value: Topic | null): void {
  topic.value = value
}
</script>

<style scoped>
.sender-info-container {
  height: 100%;
  width: 100%;
}
</style>
