<template>
  <div class="export-task-editor-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="activeName" tab-position="left">
      <el-tab-pane name="exportMetadata" label="元数据">
        <export-metadata-panel :task-id="taskId" />
      </el-tab-pane>
      <el-tab-pane name="exportFileInfo" label="文件">
        <export-file-info-panel :task-id="taskId" :task-status="taskStatus" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ExportMetadataPanel from '@/views/nodes/elementPlus/fileio/exportTask/subPanels/ExportMetadataPanel.vue'
import ExportFileInfoPanel from '@/views/nodes/elementPlus/fileio/exportTask/subPanels/ExportFileInfoPanel.vue'

defineOptions({ name: 'ExportTaskEditorPanel' })

defineProps<{ taskId: string; taskStatus: number }>()

const loading = ref<boolean>(false)
const activeName = ref<string>('exportMetadata')
</script>

<style scoped>
.export-task-editor-container,
.tabs-panel {
  width: 100%;
  height: 100%;
}
.tabs-panel :deep(.el-tabs__content),
.tabs-panel :deep(.el-tab-pane) {
  height: 100%;
}
</style>
