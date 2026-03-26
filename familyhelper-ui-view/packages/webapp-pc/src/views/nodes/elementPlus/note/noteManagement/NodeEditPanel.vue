<template>
  <div class="node-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="概览" name="overlook">
        <node-overlook-panel
          :note-node-id="noteNodeId"
          :readonly="readonly"
          @onNoteNodePropertyUpdated="handleNoteNodePropertyUpdated"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import NodeOverlookPanel from './subPanels/NodeOverlookPanel.vue'

defineOptions({
  name: 'NodeEditPanel',
})

// region Props 定义

type Props = {
  noteNodeId: string
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  readonly: false,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onNoteNodePropertyUpdated'): void
}

const emit = defineEmits<Emits>()

// endregion

// region Tab 页

type TabsActiveName = 'overlook'

const tabsActiveName = ref<TabsActiveName>('overlook')

// endregion

// region 事件处理

function handleNoteNodePropertyUpdated(): void {
  emit('onNoteNodePropertyUpdated')
}

// endregion
</script>

<style scoped>
.node-edit-panel-container {
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
