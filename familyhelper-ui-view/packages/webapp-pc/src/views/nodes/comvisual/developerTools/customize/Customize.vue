<template>
  <div class="customize-container">
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
            placeholder="请选择支持定制的可视化器"
          />
        </div>
      </template>
      <template v-slot:west>
        <placeholder-panel v-if="!selectedVisualizerKey" text="没有支持定制的可视化器" />
        <customize-list-panel
          v-else
          :key="selectedVisualizerKey"
          :visualizer-key="selectedVisualizerKey"
          @on-current-changed="handleCustomizeListCurrentChanged"
        />
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="!selectedVisualizerKey" text="没有支持定制的可视化器" />
        <placeholder-panel
          v-else-if="selectedCustomizeKey === null"
          text="请选择左侧列表中的定制"
        />
        <customize-kv-panel
          v-else
          :key="selectedVisualizerKey + '/' + selectedCustomizeKey"
          :visualizer-key="selectedVisualizerKey"
          :customize-key="selectedCustomizeKey"
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

import CustomizeListPanel from './subPanels/CustomizeListPanel.vue'
import CustomizeKvPanel from './subPanels/CustomizeKvPanel.vue'

defineOptions({
  name: 'CustomizeComponent',
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

// region 定制列表选中

/**
 * 左侧当前选中的定制 key。
 */
const selectedCustomizeKey = ref<string | null>(null)

/**
 * 同步左侧定制列表的当前选中项。
 *
 * @param key 当前选中的定制 key；没有选中项时为 null。
 */
function handleCustomizeListCurrentChanged(key: string | null): void {
  selectedCustomizeKey.value = key
}

watch(selectedVisualizerKey, () => {
  selectedCustomizeKey.value = null
})

// endregion
</script>

<style scoped>
.customize-container {
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
