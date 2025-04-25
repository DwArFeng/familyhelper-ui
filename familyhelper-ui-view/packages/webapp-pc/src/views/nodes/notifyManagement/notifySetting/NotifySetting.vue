<template>
  <div class="notify-setting-container">
    <border-layout-panel class="border-layout-panel" west-width="50%" :west-visible="true">
      <template v-slot:west>
        <notify-setting-panel @onCurrentNotifySettingChanged="handleCurrentNotifySettingChanged" />
      </template>
      <template v-slot:default>
        <router-info-panel :notify-setting="notifySetting" />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import NotifySettingPanel from './subPanels/NotifySettingPanel.vue'
import RouterInfoPanel from './subPanels/RouterInfoPanel.vue'

import type { NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'

defineOptions({
  name: 'NotifySetting',
})

const notifySetting = ref<NotifySetting | null>(null)

function handleCurrentNotifySettingChanged(value: NotifySetting | null): void {
  notifySetting.value = value
}
</script>

<style scoped>
.notify-setting-container {
  height: 100%;
  width: 100%;
}
</style>
