<template>
  <div class="import-task-editor-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="activeName" tab-position="left">
      <el-tab-pane
        name="importMetadata"
        :label="t('views.element_plus_engineering.fileio.metadata')"
      >
        <import-metadata-panel :task-id="taskId" />
      </el-tab-pane>
      <el-tab-pane name="importFileInfo" :label="t('views.element_plus_engineering.fileio.file')">
        <import-file-info-panel :task-id="taskId" :task-status="taskStatus" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ImportMetadataPanel from '@/views/nodes/elementPlusEngineering/fileio/importTask/subPanels/ImportMetadataPanel.vue'
import ImportFileInfoPanel from '@/views/nodes/elementPlusEngineering/fileio/importTask/subPanels/ImportFileInfoPanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ImportTaskEditorPanel' })

// region I18n 引入

const { t } = useI18n()

// endregion
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
