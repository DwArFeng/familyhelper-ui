<template>
  <div class="file-edit-panel-container">
    <div v-if="type === ''" class="placeholder">请指定文件类型</div>
    <div v-else-if="id === ''" class="placeholder">请指定文件 ID</div>
    <div v-else-if="mode === ''" class="placeholder">请指定编辑器模式</div>
    <div v-else class="main-container" v-loading="loading">
      <div class="editor-header">
        <div class="file-indicator">
          <!--suppress JSUnresolvedVariable -->
          <i class="iconfont icon">{{ fileIndicatorIcon }}</i>
          <span>{{ fileName }}</span>
        </div>
        <div class="operate-area">
          <el-button
            v-if="fileIndicatorOperateButtonVisible"
            class="commit-button"
            type="primary"
            @click="handleCommitButtonClicked"
          >
            <span class="unsaved-emphasis" v-if="fileIndicatorContentChanged" />
            <span class="text">提交</span>
          </el-button>
          <el-button
            v-if="fileIndicatorOperateButtonVisible"
            type="danger"
            @click="handleResetButtonClicked"
          >
            重置
          </el-button>
        </div>
      </div>
      <el-divider />
      <div class="editor-body" tabindex="0" @keydown="handleHotKeyDown">
        <div class="placeholder" v-if="reading">正在加载文件，请稍候</div>
        <div class="sub-editor-wrapper" v-show="!reading">
          <pdf-sub-editor
            v-if="pdfSubEditorUsing"
            ref="pdfSubEditorRef"
            :base-blob="fileBaseBlob"
            :readonly="subEditorReadonly"
            @onContentChangeIndicatorChanged="handlePdfSubEditorContentChangeIndicatorChanged"
          />
          <photo-sub-editor
            v-else-if="photoSubEditorUsing"
            ref="photoSubEditorRef"
            :base-blob="fileBaseBlob"
            :readonly="subEditorReadonly"
            @onContentChangeIndicatorChanged="handlePhotoSubEditorContentChangeIndicatorChanged"
          />
          <rtf-sub-editor
            v-else-if="rtfSubEditorUsing"
            ref="rtfSubEditor"
            :base-blob="fileBaseBlob"
            :readonly="subEditorReadonly"
            @onContentChangeIndicatorChanged="handleRtfSubEditorContentChangeIndicatorChanged"
          />
          <txt-sub-editor
            v-else-if="txtSubEditorUsing"
            ref="txtSubEditor"
            :base-blob="fileBaseBlob"
            :readonly="subEditorReadonly"
            @onContentChangeIndicatorChanged="handleTxtSubEditorContentChangeIndicatorChanged"
          />
          <div class="placeholder" v-else>
            未能找到扩展名为 {{ fileExtension }} 的{{ mode === 'INSPECT' ? '查看器' : '编辑器' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import { ElMessage } from 'element-plus'

import PdfSubEditor from './subEditors/pdfSubEditor/PdfSubEditor.vue'
import PhotoSubEditor from './subEditors/photoSubEditor/PhotoSubEditor.vue'
import RtfSubEditor from './subEditors/rtfSubEditor/RtfSubEditor.vue'
import TxtSubEditor from './subEditors/txtSubEditor/TxtSubEditor.vue'

import { parseFileExtension } from '@dwarfeng/familyhelper-ui-component-util/src/util/file.ts'

import type { FileEditMode, FileEditType } from './type.ts'
import type { ExtensionInfo, SubEditor } from './extensionInfos.ts'
import { extensionInfo } from './extensionInfos.ts'
import type { FileHandler, InspectFileResult, UpdateFileResult } from './fileHandlers.ts'
import { fileHandler } from './fileHandlers.ts'

defineOptions({
  name: 'FileEditPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  type: FileEditType
  id: string
  mode: FileEditMode
}

const props = defineProps<Props>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)
const reading = ref<number>(0)

// -----------------------------------------------------------文件属性-----------------------------------------------------------
const fileName = ref<string>('')
const fileBaseBlob = ref<Blob | null>(null)

const fileExtension = computed<string>(() => {
  return parseFileExtension(fileName.value)
})

// -----------------------------------------------------------文件指示器-----------------------------------------------------------
const fileIndicatorIcon = computed<'\uffe3' | '\uffe4' | '\uffe5'>(() => {
  const _extension: string = parseFileExtension(fileName.value)
  const _extensionInfo: ExtensionInfo | null = extensionInfo(_extension)
  if (!_extensionInfo) {
    return '\uffe5'
  }
  if (_extensionInfo.actionLevel === 'INSPECT') {
    return '\uffe3'
  }
  return '\uffe4'
})

const fileIndicatorOperateButtonVisible = computed<boolean>(() => {
  const _extension: string = parseFileExtension(fileName.value)
  const _extensionInfo: ExtensionInfo | null = extensionInfo(_extension)
  if (!_extensionInfo) {
    return false
  }
  return _extensionInfo.actionLevel === 'EDIT' && props.mode === 'EDIT'
})

const fileIndicatorContentChanged = computed<boolean>(() => {
  // PDF。
  if (pdfSubEditorUsing.value) {
    return pdfSubEditorContentChangeIndicator.value
  }
  // PHOTO。
  else if (photoSubEditorUsing.value) {
    return photoSubEditorContentChangeIndicator.value
  }
  // RTF。
  else if (rtfSubEditorUsing.value) {
    return rtfSubEditorContentChangeIndicator.value
  }
  // TXT。
  else if (txtSubEditorUsing.value) {
    return txtSubEditorContentChangeIndicator.value
  }
  // UNKNOWN。
  return false
})

const fileIndicatorCommitButtonWidth = computed(() => {
  return `${fileIndicatorContentChanged.value ? 70 : 60}px`
})

function handleCommitButtonClicked(): void {
  commitFile()
}

function handleResetButtonClicked(): void {
  handleFileInspectSearch()
}

// -----------------------------------------------------------文件查询-----------------------------------------------------------
const watchedFileProps = computed(() => {
  return {
    type: props.type,
    id: props.id,
    mode: props.mode,
  }
})
watch(watchedFileProps, () => {
  handleFileSearch()
})

function handleFileSearch(): void {
  if (props.type === '' || props.id === '' || props.mode === '') {
    return
  }
  const _fileHandler: FileHandler | null = fileHandler(props.type)
  if (!_fileHandler) {
    return
  }
  handleFileInspectSearch()
}

async function handleFileInspectSearch(): Promise<void> {
  loading.value += 1
  reading.value += 1
  try {
    const _fileHandler: FileHandler | null = fileHandler(props.type)
    if (!_fileHandler) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    const res: InspectFileResult | Promise<InspectFileResult> = _fileHandler.inspectFile(props.id)
    let _inspectFileResult: InspectFileResult
    if (res instanceof Promise) {
      _inspectFileResult = await res
    } else {
      _inspectFileResult = res
    }
    fileName.value = _inspectFileResult.name
    fileBaseBlob.value = _inspectFileResult.blob
  } finally {
    reading.value -= 1
    loading.value -= 1
  }
}

onMounted(() => {
  handleFileSearch()
})

// -----------------------------------------------------------子编辑器-----------------------------------------------------------
const subEditorCurrent = computed<SubEditor | null>(() => {
  const _extension: string = parseFileExtension(fileName.value)
  const _extensionInfo: ExtensionInfo | null = extensionInfo(_extension)
  if (!_extensionInfo) {
    return null
  }
  return _extensionInfo.subEditor
})

const subEditorReadonly = computed<boolean>(() => {
  const _extension: string = parseFileExtension(fileName.value)
  const _extensionInfo: ExtensionInfo | null = extensionInfo(_extension)
  if (!_extensionInfo) {
    return true
  }
  if (props.mode === '' || props.mode === 'INSPECT') {
    return true
  }
  return !(props.mode === 'EDIT') || !(_extensionInfo.actionLevel === 'EDIT')
})

// -----------------------------------------------------------PDF 子编辑器-----------------------------------------------------------
const pdfSubEditorContentChangeIndicator = ref<boolean>(false)

const pdfSubEditorRef = useTemplateRef<InstanceType<typeof PdfSubEditor>>('pdfSubEditorRef')

const pdfSubEditorUsing = computed<boolean>(() => {
  return subEditorCurrent.value === 'PDF'
})

function handlePdfSubEditorContentChangeIndicatorChanged(value: boolean): void {
  pdfSubEditorContentChangeIndicator.value = value
}

// -----------------------------------------------------------PHOTO 子编辑器-----------------------------------------------------------
const photoSubEditorContentChangeIndicator = ref<boolean>(false)

const photoSubEditorRef = useTemplateRef<InstanceType<typeof PhotoSubEditor>>('photoSubEditorRef')

const photoSubEditorUsing = computed<boolean>(() => {
  return subEditorCurrent.value === 'PHOTO'
})

function handlePhotoSubEditorContentChangeIndicatorChanged(value: boolean): void {
  photoSubEditorContentChangeIndicator.value = value
}

// -----------------------------------------------------------RTF 子编辑器-----------------------------------------------------------
const rtfSubEditorContentChangeIndicator = ref<boolean>(false)

const rtfSubEditor = useTemplateRef<InstanceType<typeof RtfSubEditor>>('rtfSubEditor')

const rtfSubEditorUsing = computed<boolean>(() => {
  return subEditorCurrent.value === 'RTF'
})

function handleRtfSubEditorContentChangeIndicatorChanged(value: boolean): void {
  rtfSubEditorContentChangeIndicator.value = value
}

// -----------------------------------------------------------TXT 子编辑器-----------------------------------------------------------
const txtSubEditorContentChangeIndicator = ref<boolean>(false)

const txtSubEditor = useTemplateRef<InstanceType<typeof TxtSubEditor>>('txtSubEditor')

const txtSubEditorUsing = computed<boolean>(() => {
  return subEditorCurrent.value === 'TXT'
})

function handleTxtSubEditorContentChangeIndicatorChanged(value: boolean): void {
  txtSubEditorContentChangeIndicator.value = value
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
  commitFile()
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

// -----------------------------------------------------------文件提交-----------------------------------------------------------
function commitFile(): void {
  if (props.type === '' || props.id === '' || props.mode === '') {
    return
  }
  const _extension: string = parseFileExtension(fileName.value)
  const _extensionInfo: ExtensionInfo | null = extensionInfo(_extension)
  if (!_extensionInfo) {
    return
  }
  if (_extensionInfo.actionLevel !== 'EDIT') {
    return
  }
  if (subEditorReadonly.value) {
    return
  }
  const _fileHandler: FileHandler | null = fileHandler(props.type)
  if (!_fileHandler) {
    return
  }
  doCommitFile()
}

async function doCommitFile(): Promise<void> {
  loading.value += 1
  try {
    let subEditor:
      | InstanceType<typeof PdfSubEditor>
      | InstanceType<typeof PhotoSubEditor>
      | InstanceType<typeof RtfSubEditor>
      | InstanceType<typeof TxtSubEditor>
      | null
    if (pdfSubEditorUsing.value) {
      if (!pdfSubEditorRef.value) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      subEditor = pdfSubEditorRef.value
    } else if (photoSubEditorUsing.value) {
      if (!photoSubEditorRef.value) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      subEditor = photoSubEditorRef.value
    } else if (rtfSubEditorUsing.value) {
      if (!rtfSubEditor.value) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      subEditor = rtfSubEditor.value
    } else if (txtSubEditorUsing.value) {
      if (!txtSubEditor.value) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      subEditor = txtSubEditor.value
    } else {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    const blobRes: Blob | Promise<Blob> = subEditor.currentContent()
    let blob
    if (blobRes instanceof Promise) {
      blob = await blobRes
    } else {
      blob = blobRes
    }
    const _fileHandler: FileHandler | null = fileHandler(props.type)
    if (!_fileHandler) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    const resultRes: UpdateFileResult | Promise<UpdateFileResult> = _fileHandler.updateFile(
      props.id,
      blob,
      fileName.value,
    )
    let result: UpdateFileResult
    if (resultRes instanceof Promise) {
      result = await resultRes
    } else {
      result = resultRes
    }
    if (result.success) {
      ElMessage({
        showClose: true,
        message: result.message,
        type: 'success',
        center: true,
      })
      subEditor.fireCurrentContentCommitted()
    } else {
      ElMessage({
        showClose: true,
        message: result.message,
        type: 'error',
        center: true,
      })
    }
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.file-edit-panel-container {
  height: 100%;
  width: 100%;
  background: #ffffff;
}

.main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.main-container .el-divider {
  margin: 5px 0;
}

.main-container .editor-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.main-container .editor-header .file-indicator {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #606266;
}

.main-container .editor-header .icon {
  font-size: 32px;
  user-select: none;
}

.main-container .editor-header .operate-area {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.main-container .editor-header .operate-area .commit-button {
  width: v-bind(fileIndicatorCommitButtonWidth);
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.main-container .editor-header .commit-button .unsaved-emphasis {
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  margin-left: -6px;
}

.main-container .editor-body {
  height: 0;
  flex-grow: 1;
}

.main-container .editor-body:focus {
  outline: none;
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

.main-container .editor-body .sub-editor-wrapper {
  height: 100%;
  width: 100%;
}
</style>
