<template>
  <div class="navigation-settings-container">
    <border-layout-panel class="border-layout-panel">
      <template v-slot:default>
        <native-tabs v-model="tabsActiveName" class="tabs-panel" tab-position="left">
          <native-tab-pane name="remote_settings" label="远端设置">
            <navigation-settings-remote-setting-panel />
          </native-tab-pane>
          <native-tab-pane name="local_override" label="本地覆盖">
            <navigation-settings-local-override-panel />
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

import NavigationSettingsLocalOverridePanel from './subPanels/NavigationSettingsLocalOverridePanel.vue'
import NavigationSettingsRemoteSettingPanel from './subPanels/NavigationSettingsRemoteSettingPanel.vue'

defineOptions({
  name: 'NavigationSettingsComponent',
})

// region Tab 页

type TabsActiveName = 'remote_settings' | 'local_override'

const tabsActiveName = ref<TabsActiveName>('remote_settings')

// endregion
</script>

<style scoped>
.navigation-settings-container {
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
