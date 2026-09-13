<template>
  <div class="import-task-editor-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="activeName" tab-position="left">
      <el-tab-pane name="importMetadata" label="元数据">
        <import-metadata-panel :task-id="taskId" />
      </el-tab-pane>
      <el-tab-pane name="importFileInfo" label="文件">
        <import-file-info-panel :task-id="taskId" :task-status="taskStatus" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ImportMetadataPanel from '@/views/nodes/elementPlus/fileio/importTask/subPanels/ImportMetadataPanel.vue'
import ImportFileInfoPanel from '@/views/nodes/elementPlus/fileio/importTask/subPanels/ImportFileInfoPanel.vue'

defineOptions({ name: 'ImportTaskEditorPanel' })

defineProps<{ taskId: string; taskStatus: number }>()

const loading = ref<boolean>(false)
const activeName = ref<string>('importMetadata')
</script>

<style scoped>
.import-task-editor-container,
.tabs-panel {
  width: 100%;
  height: 100%;
}
.tabs-panel :deep(.el-tabs__content),
.tabs-panel :deep(.el-tab-pane) {
  height: 100%;
}
</style>
