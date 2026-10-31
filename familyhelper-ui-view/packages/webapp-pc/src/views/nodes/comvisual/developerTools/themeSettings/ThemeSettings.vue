<template>
  <div class="theme-settings-container">
    <root-border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
      west-width="40%"
      :west-visible="true"
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
            placeholder="请选择支持主题的可视化器"
          />
        </div>
      </template>
      <template v-slot:west>
        <placeholder-panel v-if="!selectedVisualizerKey" text="没有支持主题的可视化器" />
        <theme-list-settings-panel
          v-else
          :key="selectedVisualizerKey"
          :visualizer-key="selectedVisualizerKey"
          @on-current-changed="handleThemeListCurrentChanged"
        />
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="!selectedVisualizerKey" text="没有支持主题的可视化器" />
        <placeholder-panel v-else-if="selectedThemeKey === null" text="请选择左侧列表中的主题" />
        <theme-kv-settings-panel
          v-else
          :key="selectedVisualizerKey + '/' + selectedThemeKey"
          :visualizer-key="selectedVisualizerKey"
          :theme-key="selectedThemeKey"
        />
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

import ThemeListSettingsPanel from './subPanels/ThemeListSettingsPanel.vue'
import ThemeKvSettingsPanel from './subPanels/ThemeKvSettingsPanel.vue'

defineOptions({
  name: 'ThemeSettingsComponent',
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
 * 读取所有支持主题的可视化器，并按照 key 排序，保证每次进入页面时选项顺序一致。
 *
 * 主题配置按可视化器隔离，因此页面需要先确定当前维护的目标可视化器。
 *
 * @returns 支持主题的可视化器列表。
 */
function buildVisualizerOptions(): VisualizerOption[] {
  const library = vim.ctx().library()
  return [...library.visualizerInfoKeys()]
    .sort((a, b) => a.localeCompare(b))
    .flatMap((key) => {
      const info = library.visualizerInfo(key)
      if (!info?.supportTheme) {
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

// region 主题列表选中

/**
 * 左侧当前选中的主题 key。
 */
const selectedThemeKey = ref<string | null>(null)

/**
 * 同步左侧主题列表的当前选中项。
 *
 * @param key 当前选中的主题 key；没有选中项时为 null。
 */
function handleThemeListCurrentChanged(key: string | null): void {
  selectedThemeKey.value = key
}

watch(selectedVisualizerKey, () => {
  selectedThemeKey.value = null
})

// endregion
</script>

<style scoped>
.theme-settings-container {
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

.border-layout-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
