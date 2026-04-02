<template>
  <div class="visualizer-settings-container">
    <border-layout-panel class="border-layout-panel">
      <template v-slot:default>
        <native-tabs v-model="tabsActiveName" class="tabs-panel" tab-position="left">
          <native-tab-pane name="remote_settings" label="远端设置">
            <visualizer-settings-remote-setting-panel />
          </native-tab-pane>
          <native-tab-pane name="local_override" label="本地覆盖">
            <visualizer-settings-local-override-panel />
          </native-tab-pane>
        </native-tabs>
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import VisualizerSettingsLocalOverridePanel from './subPanels/VisualizerSettingsLocalOverridePanel.vue'
import VisualizerSettingsRemoteSettingPanel from './subPanels/VisualizerSettingsRemoteSettingPanel.vue'

defineOptions({
  name: 'VisualizerSettingsComponent',
})

// region Tab 页

type TabsActiveName = 'remote_settings' | 'local_override'

const tabsActiveName = ref<TabsActiveName>('remote_settings')

// endregion
</script>

<style scoped>
.visualizer-settings-container {
  height: 100%;
  width: 100%;
  min-height: 0;
}

.border-layout-panel {
  height: 100%;
}

.tabs-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
