<template>
  <div class="iahn-settings-container">
    <root-border-layout-panel
      class="border-layout-panel"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:default>
        <native-tabs v-model="tabsActiveName" class="tabs-panel" tab-position="left">
          <native-tab-pane name="locale_list" label="地区列表">
            <iahn-locale-settings-panel @on-data-changed="handleLocaleDataChanged" />
          </native-tab-pane>
          <native-tab-pane name="repo" label="消息仓库">
            <iahn-message-settings-panel ref="messagePanelRef" />
          </native-tab-pane>
        </native-tabs>
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import RootBorderLayoutPanel from '@/components/comvisual/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import IahnLocaleSettingsPanel from './subPanels/IahnLocaleSettingsPanel.vue'
import IahnMessageSettingsPanel from './subPanels/IahnMessageSettingsPanel.vue'

defineOptions({
  name: 'IahnSettingsComponent',
})

// region Tab 页

type TabsActiveName = 'locale_list' | 'repo'

const tabsActiveName = ref<TabsActiveName>('locale_list')

// endregion

// region 子面板联动

const messagePanelRef = ref<InstanceType<typeof IahnMessageSettingsPanel> | null>(null)

function handleLocaleDataChanged(): void {
  void messagePanelRef.value?.refresh()
}

// endregion
</script>

<style scoped>
.iahn-settings-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.border-layout-panel,
.tabs-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
