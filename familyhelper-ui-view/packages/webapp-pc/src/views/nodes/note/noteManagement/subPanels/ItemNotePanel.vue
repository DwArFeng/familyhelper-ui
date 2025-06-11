<template>
  <div class="item-note-panel-container">
    <div class="placeholder" v-if="noteItemId === ''">请选择项目</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-switch
              class="switch"
              v-model="editorEditableSwitchValue"
              active-text="编辑"
              inactive-text="只读"
              :disabled="readonly"
            />
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleSaveAsAttachmentButtonClicked"
            >
              另存为附件
            </el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="commit-button"
              type="primary"
              :disabled="operateButtonDisabled"
              @click="handleCommitButtonClicked"
            >
              <span class="unsaved-emphasis" v-if="editorContentChanged" />
              <span class="text">提交</span>
            </el-button>
            <el-button
              type="danger"
              :disabled="operateButtonDisabled"
              @click="handleResetButtonClicked"
            >
              重置
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              class="item icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <div class="editor-wrapper" tabindex="0" @keydown="handleHotKeyDown">
            <ckeditor
              v-model="editorContent"
              :config="config"
              :editor="editorClass"
              @ready="handleEditorReady"
            />
          </div>
        </template>
      </header-layout-panel>
    </div>
    <file-create-dialog
      v-model:visible="attachmentCreateDialogVisible"
      title="另存为附件"
      :loading="attachmentCreateDialogLoading"
      :filter="attachmentFileCreateDialogFilter"
      @onConfirmed="handleAttachmentCreateDialogConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import { type EditorConfig } from 'ckeditor5'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'

import { FamilyhelperEditor } from '@dwarfeng/familyhelper-ui-component-ckeditor/src/familyhelperEditor.ts'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import FileCreateDialog from '@/components/file/fileCreateDialog/FileCreateDialog.vue'

import { type FileCreateInfo } from '@/components/file/fileCreateDialog/types.ts'
import { useSpecifiedExtensionFileCreateDialog } from '@/components/file/fileCreateDialog/composables.ts'

import {
  downloadNoteFile,
  uploadNoteFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteItem.ts'
import { upload as uploadAttachmentFile } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/attachmentFile.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'ItemNotePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  noteItemId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onNoteItemNoteFileCommitted'): void
  (e: 'onNoteItemSaveAsAttachmentCompleted'): void
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const editorEditableSwitchValue = ref<boolean>(false)

const operateButtonDisabled = computed<boolean>(() => {
  return props.readonly || !editorEditableSwitchValue.value
})
const commitButtonWidth = computed<string>(() => {
  return `${editorContentChanged.value ? 70 : 60}px`
})

function handleSaveAsAttachmentButtonClicked(): void {
  attachmentCreateDialogVisible.value = true
}

function handleCommitButtonClicked(): void {
  commitNoteItemNoteFile()
}

function handleResetButtonClicked(): void {
  editorContent.value = editorBackupContent.value
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// -----------------------------------------------------------笔记查询-----------------------------------------------------------
watch(
  () => props.noteItemId,
  () => {
    handleNoteItemSearch()
  },
)

function handleNoteItemSearch(): void {
  if (props.noteItemId === '') {
    return
  }
  handleDownloadNoteItemNoteFile()
}

async function handleDownloadNoteItemNoteFile(): Promise<void> {
  loading.value += 1
  try {
    const blob: Blob = await downloadNoteFile({ long_id: props.noteItemId })
    const text: string = await blob.text()
    editorContent.value = text
    editorBackupContent.value = text
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleNoteItemSearch()
})

// -----------------------------------------------------------编辑器-----------------------------------------------------------
const editorInstance = ref<FamilyhelperEditor | null>(null)
const editorContent = ref('')
const editorBackupContent = ref<string>('')

const config = computed<EditorConfig>(() => {
  return {
    licenseKey: 'GPL',
  }
})
const editorClass = computed(() => {
  return FamilyhelperEditor
})
const editorContentChanged = computed<boolean>(() => {
  return editorContent.value !== editorBackupContent.value
})
const editorReadonly = computed<boolean>(() => {
  return props.readonly || !editorEditableSwitchValue.value
})
const editorTopDisplay = computed<'none' | 'block'>(() => {
  if (editorReadonly.value) {
    return 'none'
  } else {
    return 'block'
  }
})

watch(
  () => editorReadonly.value,
  (value) => {
    updateEditorReadonly(value)
  },
)

function handleEditorReady(instance: FamilyhelperEditor): void {
  editorInstance.value = instance
  updateEditorReadonly(editorReadonly.value)
  editorInstance.value.on(
    'change:isReadOnly',
    (_evt: unknown, _property: unknown, readonly: boolean) => {
      updateEditorReadonly(readonly)
    },
  )
}

function updateEditorReadonly(readonly: boolean): void {
  if (editorInstance.value === null) {
    return
  }
  if (readonly) {
    editorInstance.value.enableReadOnlyMode('item-note-panel')
  } else {
    editorInstance.value.disableReadOnlyMode('item-note-panel')
  }
}

// -----------------------------------------------------------热键处理-----------------------------------------------------------
const hotKeyCommitColdDown = ref<boolean>(false)
const hotKeyCommitTimeoutHandle = ref<number | null>(null)

function handleHotKeyDown(event: KeyboardEvent): void {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    handleCommitHotKeyDown()
  }
}

function handleCommitHotKeyDown(): void {
  if (hotKeyCommitColdDown.value) {
    return
  }
  hotKeyCommitColdDown.value = true
  commitNoteItemNoteFile()
  hotKeyCommitTimeoutHandle.value = setTimeout(() => {
    hotKeyCommitColdDown.value = false
    hotKeyCommitTimeoutHandle.value = null
  }, 1000)
}

onUnmounted(() => {
  if (hotKeyCommitTimeoutHandle.value !== null) {
    clearTimeout(hotKeyCommitTimeoutHandle.value)
  }
})

// -----------------------------------------------------------文件上传-----------------------------------------------------------
async function commitNoteItemNoteFile(): Promise<void> {
  loading.value += 1
  try {
    const blob: Blob = new Blob([editorContent.value], { type: 'text/plain' })
    const formData: FormData = new FormData()
    formData.append('file', blob, props.noteItemId)
    await resolveResponse(uploadNoteFile({ long_id: props.noteItemId }, formData))
    ElMessage({
      showClose: true,
      message: '笔记提交成功',
      type: 'success',
    })
    editorBackupContent.value = editorContent.value
    emit('onNoteItemNoteFileCommitted')
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------附件文件创建对话框-----------------------------------------------------------
const { visible: attachmentCreateDialogVisible, filter: attachmentFileCreateDialogFilter } =
  useSpecifiedExtensionFileCreateDialog('.rtf')
const attachmentCreateDialogLoading = ref<number>(0)

async function handleAttachmentCreateDialogConfirmed(info: FileCreateInfo): Promise<void> {
  attachmentCreateDialogLoading.value += 1
  try {
    const blob: Blob = new Blob([editorContent.value], { type: 'text/plain' })
    const formData: FormData = new FormData()
    formData.append('file', blob, info.name)
    await resolveResponse(uploadAttachmentFile({ long_id: props.noteItemId }, formData))
    ElMessage({
      showClose: true,
      message: '另存为附件成功',
      type: 'success',
    })
    emit('onNoteItemSaveAsAttachmentCompleted')
    attachmentCreateDialogVisible.value = false
  } finally {
    attachmentCreateDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
function noteItemSearch(): void {
  handleNoteItemSearch()
}

defineExpose({
  noteItemSearch,
})
</script>

<style scoped>
.item-note-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

.header-container .commit-button {
  width: v-bind(commitButtonWidth);
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.header-container .commit-button .unsaved-emphasis {
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  margin-left: -6px;
}

.editor-wrapper {
  height: 100%;
  width: 100%;
}

.editor-wrapper:focus {
  outline: none;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper :deep(.ck-editor) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper :deep(.ck-editor__top) {
  display: v-bind(editorTopDisplay);
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper :deep(.ck-sticky-panel__content) {
  border-bottom-width: 0 !important;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper :deep(.ck-editor__main) {
  height: 0;
  flex-grow: 1;
  margin-bottom: 8px;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper :deep(.ck-content) {
  height: 100%;
  box-sizing: border-box;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper :deep(.ck-sticky-panel__placeholder) {
  display: none !important;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper :deep(.ck-sticky-panel__content) {
  width: 100% !important;
  position: unset !important;
  top: 0 !important;
}
</style>
