<template>
  <div class="file-editor-container">
    <file-edit-panel :type="fileEditPanelType" :id="fileEditPanelId" :mode="fileEditPanelMode" />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { watch, ref, onMounted } from 'vue'

import FileEditPanel from './FileEditPanel.vue'

import type { FileEditType, FileEditMode } from './type.ts'
import { hasFileEditType } from './fileHandlers.ts'

defineOptions({
  name: 'FileEditor',
})

// -----------------------------------------------------------Router 引入-----------------------------------------------------------
const router = vim.ctx().router().vueRouter()

// -----------------------------------------------------------路由处理-----------------------------------------------------------
watch(router.currentRoute, (value) => {
  if (value.name !== 'miscellaneous.fileEditor') {
    return
  }
  const { type, id, action } = value.query as {
    type: string
    id: string
    action: string
  }
  fileEditPanelType.value = parseType(type)
  fileEditPanelId.value = id
  fileEditPanelMode.value = parseMode(action)
})

function parseType(type: string): FileEditType {
  const transformedType: string = type.toUpperCase().replaceAll('-', '_')
  if (hasFileEditType(transformedType)) {
    return transformedType as FileEditType
  } else {
    return ''
  }
}

function parseMode(action: string): FileEditMode {
  switch (action) {
    case 'inspect':
      return 'INSPECT'
    case 'edit':
      return 'EDIT'
    default:
      return ''
  }
}

onMounted(() => {
  const { type, id, action } = router.currentRoute.value.query as {
    type: string
    id: string
    action: string
  }
  fileEditPanelType.value = parseType(type)
  fileEditPanelId.value = id
  fileEditPanelMode.value = parseMode(action)
})

// -----------------------------------------------------------文件编辑器-----------------------------------------------------------
const fileEditPanelType = ref<FileEditType>('')
const fileEditPanelId = ref<string>('')
const fileEditPanelMode = ref<FileEditMode>('')
</script>

<style scoped>
.file-editor-container {
  height: 100%;
  width: 100%;
}
</style>
