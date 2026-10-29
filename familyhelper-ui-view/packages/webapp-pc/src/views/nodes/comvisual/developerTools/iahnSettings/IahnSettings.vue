<template>
  <div class="iahn-settings-container">
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
            placeholder="请选择支持国际化的可视化器"
          />
        </div>
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="!selectedVisualizerKey" text="没有支持国际化的可视化器" />
        <native-tabs
          v-else
          :key="selectedVisualizerKey"
          v-model="tabsActiveName"
          class="tabs-panel"
          tab-position="left"
        >
          <native-tab-pane name="locale_list" label="地区列表">
            <iahn-locale-settings-panel
              :visualizer-key="selectedVisualizerKey"
              @on-data-changed="handleLocaleDataChanged"
            />
          </native-tab-pane>
          <native-tab-pane name="repo" label="消息仓库">
            <iahn-message-settings-panel
              ref="messagePanelRef"
              :visualizer-key="selectedVisualizerKey"
            />
          </native-tab-pane>
        </native-tabs>
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import vim from '@/vim'

import RootBorderLayoutPanel from '@/components/comvisual/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import NativeSelect, {
  type NativeSelectOption,
} from '@/components/comvisual/form/nativeSelect/NativeSelect.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import IahnLocaleSettingsPanel from './subPanels/IahnLocaleSettingsPanel.vue'
import IahnMessageSettingsPanel from './subPanels/IahnMessageSettingsPanel.vue'

defineOptions({
  name: 'IahnSettingsComponent',
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
 * 读取所有支持 IAHN 的可视化器，并按照 key 排序，保证每次进入页面时选项顺序一致。
 *
 * @returns 支持 IAHN 的可视化器列表。
 */
function buildVisualizerOptions(): VisualizerOption[] {
  const library = vim.ctx().library()
  return [...library.visualizerInfoKeys()]
    .sort((a, b) => a.localeCompare(b))
    .flatMap((key) => {
      const info = library.visualizerInfo(key)
      if (!info?.supportIahn) {
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
