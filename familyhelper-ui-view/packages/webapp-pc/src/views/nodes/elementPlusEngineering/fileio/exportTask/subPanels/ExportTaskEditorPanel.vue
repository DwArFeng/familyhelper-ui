<template>
  <div class="export-task-editor-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="activeName" tab-position="left">
      <el-tab-pane
        name="exportMetadata"
        :label="t('views.element_plus_engineering.fileio.metadata')"
      >
        <export-metadata-panel :task-id="taskId" />
      </el-tab-pane>
      <el-tab-pane name="exportFileInfo" :label="t('views.element_plus_engineering.fileio.file')">
        <export-file-info-panel :task-id="taskId" :task-status="taskStatus" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ExportMetadataPanel from '@/views/nodes/elementPlusEngineering/fileio/exportTask/subPanels/ExportMetadataPanel.vue'
import ExportFileInfoPanel from '@/views/nodes/elementPlusEngineering/fileio/exportTask/subPanels/ExportFileInfoPanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ExportTaskEditorPanel' })

// region I18n 引入

const { t } = useI18n()

// endregion
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
