<template>
  <div class="meta-container">
    <border-layout-panel west-width="50%" :west-visible="true">
      <template v-slot:west>
        <notify-setting-topic-panel
          @onCurrentNotifySettingChanged="handleCurrentNotifySettingChanged"
          @onCurrentTopicChanged="handleCurrentTopicChanged"
          @onSelectedAccountIdChanged="handleSelectedAccountIdChanged"
        />
      </template>
      <template v-slot:default>
        <meta-panel :notify-setting="notifySetting" :topic="topic" :account-id="accountId" />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import NotifySettingTopicPanel from './subPanels/NotifySettingTopicPanel.vue'
import MetaPanel from '@/views/items/notifyManagement/meta/subPanels/MetaPanel.vue'

import type { NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import type { Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'

defineOptions({
  name: 'MetaComponent',
})

const notifySetting = ref<NotifySetting | null>(null)
const topic = ref<Topic | null>(null)
const accountId = ref<string>('')

function handleCurrentNotifySettingChanged(value: NotifySetting | null): void {
  notifySetting.value = value
}

function handleCurrentTopicChanged(value: Topic | null): void {
  topic.value = value
}

function handleSelectedAccountIdChanged(value: string): void {
  accountId.value = value
}
</script>

<style scoped>
.meta-container {
  height: 100%;
  width: 100%;
}
</style>
