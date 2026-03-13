<template>
  <div class="item-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="概览" name="overlook">
        <item-overlook-panel
          ref="itemOverlookPanelRef"
          :item-id="itemId"
          :read-only="readonly"
          @onItemEdit="handleItemPropertyUpdated"
        />
      </el-tab-pane>
      <el-tab-pane label="记录" name="record">
        <item-record-panel
          :item-id="itemId"
          :read-only="readonly"
          @onContextChanged="handleRecordContextChanged"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import ItemOverlookPanel from './subPanels/ItemOverlookPanel.vue'
import ItemRecordPanel from './subPanels/ItemRecordPanel.vue'

defineOptions({
  name: 'ItemEditPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  itemId: string
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  readonly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onItemPropertyUpdated'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Tab 页-----------------------------------------------------------
type TabsActiveName = 'overlook' | 'record'

const tabsActiveName = ref<TabsActiveName>('overlook')

// -----------------------------------------------------------事件处理-----------------------------------------------------------
const itemOverlookPanelRef =
  useTemplateRef<ComponentExposed<typeof ItemOverlookPanel>>('itemOverlookPanelRef')

function handleItemPropertyUpdated(): void {
  emit('onItemPropertyUpdated')
}

function handleRecordContextChanged(): void {
  itemOverlookPanelRef.value?.updateView()
}
</script>

<style scoped>
.item-edit-panel-container {
  height: 100%;
  width: 100%;
}

.tabs-panel {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tabs__content) {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tab-pane) {
  height: 100%;
}
</style>
