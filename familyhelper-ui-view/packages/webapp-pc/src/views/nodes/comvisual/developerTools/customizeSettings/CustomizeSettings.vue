<template>
  <div class="customize-settings-container">
    <root-border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:header>
        <div class="header-container">
          <span class="visualizer-label">可视化器</span>
          <native-select
            v-model="selectedVisualizerKey"
            class="visualizer-selector"
            :options="visualizerSelectOptions"
            placeholder="请选择支持定制的可视化器"
          />
        </div>
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="!selectedVisualizerKey" text="没有支持定制的可视化器" />
        <native-tabs
          v-else
          :key="selectedVisualizerKey"
          v-model="tabsActiveName"
          class="tabs-panel"
          tab-position="left"
        >
          <native-tab-pane name="remote_settings" label="远端设置">
            <customize-settings-remote-setting-panel :visualizer-key="selectedVisualizerKey" />
          </native-tab-pane>
          <native-tab-pane name="local_override" label="本地覆盖">
            <customize-settings-local-override-panel :visualizer-key="selectedVisualizerKey" />
          </native-tab-pane>
        </native-tabs>
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import vim from '@/vim'

import RootBorderLayoutPanel from '@/components/comvisual/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import NativeSelect, {
  type NativeSelectOption,
} from '@/components/comvisual/form/nativeSelect/NativeSelect.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import CustomizeSettingsLocalOverridePanel from './subPanels/CustomizeSettingsLocalOverridePanel.vue'
import CustomizeSettingsRemoteSettingPanel from './subPanels/CustomizeSettingsRemoteSettingPanel.vue'

defineOptions({
  name: 'CustomizeSettingsComponent',
})

// region Visualizer 选择

/**
 * 可视化器选择项。
 */
type VisualizerOption = {
  key: string
  name: string
}

/**
 * 读取所有支持定制的可视化器，并按照 key 排序，保证每次进入页面时选项顺序一致。
 *
 * 定制配置按可视化器隔离，因此页面需要先确定当前维护的目标可视化器。
 *
 * @returns 支持定制的可视化器列表。
 */
function buildVisualizerOptions(): VisualizerOption[] {
  const library = vim.ctx().library()
  return [...library.visualizerInfoKeys()]
    .sort((a, b) => a.localeCompare(b))
    .flatMap((key) => {
      const info = library.visualizerInfo(key)
      if (!info?.supportCustomize) {
        return []
      }
      return [{ key, name: info.name }]
    })
}

const visualizerOptions = buildVisualizerOptions()
const selectedVisualizerKey = ref<string>(visualizerOptions[0]?.key ?? '')
const visualizerSelectOptions: NativeSelectOption[] = visualizerOptions.map((item) => ({
  label: item.name,
  value: item.key,
}))

// endregion

// region Tab 页

type TabsActiveName = 'remote_settings' | 'local_override'

const tabsActiveName = ref<TabsActiveName>('remote_settings')

watch(selectedVisualizerKey, () => {
  tabsActiveName.value = 'remote_settings'
})

// endregion
</script>

<style scoped>
.customize-settings-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.header-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.visualizer-label {
  color: #606266;
  font-size: 14px;
}

.visualizer-selector {
  width: 320px;
}

.border-layout-panel,
.tabs-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
