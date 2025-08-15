<template>
  <div class="file-upload-dialog-container">
    <el-dialog
      v-model="watchedVisible"
      append-to-body
      destroy-on-close
      :title="title"
      :close-on-click-modal="false"
      @keydown.ctrl.enter="handleHotKeyDown"
    >
      <div
        class="editor-container"
        v-loading="loading"
        element-loading-text="作者偷懒没有做进度显示，长时间转圈是正常现象，请耐心等待"
      >
        <div class="item header">
          <file-selector
            :accept="accept"
            :multiple="true"
            :tester="tester"
            @onFileSelected="handleFileSelected"
          />
          <el-button
            type="danger"
            :disabled="files.length === 0"
            @click="handleClearFileButtonClicked"
            >清除文件</el-button
          >
        </div>
        <el-divider class="item" />
        <overlay-scrollbars-component class="scroll-bar body">
          <div class="file-detail" v-for="(file, index) in files" :key="index">
            <component class="file-item icon" :is="fileIndicatorIcon(file)" />
            <span class="file-item name">{{ file.name }}</span>
            <span class="file-item size">{{ wrappedFormatUnit(file.size) }}</span>
            <el-button
              class="file-item button"
              :icon="DeleteIcon"
              type="danger"
              @click="files.splice(index, 1)"
            />
          </div>
        </overlay-scrollbars-component>
        <span>温馨提示：请不要上传过大（超过40MB）的文件哦，会失败的</span>
      </div>
      <template v-slot:footer>
        <div>
          <el-button
            type="primary"
            :disabled="loading || files.length === 0"
            @click="handleConfirmButtonClicked"
          >
            确认
          </el-button>
          <el-button :disabled="loading" @click="handleCancelButtonClicked"> 取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { type VNode } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

import { Delete as DeleteIcon } from '@element-plus/icons-vue'

import FileSelector from '@/components/file/fileSelector/FileSelector.vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { useDisplayIconWithDefaults } from '@/composables/file'

import { type FileTester, type FileTestResult } from './types.ts'

import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'
import { parseFileExtension } from '@dwarfeng/familyhelper-ui-component-util/src/util/file.ts'

defineOptions({
  name: 'FileUploadDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible?: boolean
  title?: string
  accept?: string
  tester?: FileTester
  loading?: boolean | number
  targetKey?: unknown
}

const props = withDefaults(defineProps<Props>(), {
  title: '上传文件',
  accept: '',
  tester: () => true as FileTestResult,
  loading: false,
  targetKey: undefined,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', files: File[], callback: () => void): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = computed<boolean>(() => {
  if (typeof props.loading === 'number') {
    return props.loading > 0
  }
  return props.loading
})

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// -----------------------------------------------------------目标键处理-----------------------------------------------------------
watch(
  () => props.targetKey,
  () => {
    files.value = []
  },
)

// -----------------------------------------------------------逻辑处理-----------------------------------------------------------
const files = ref<File[]>([])

function fileIndicatorIcon(file: File): VNode {
  const indicator: unknown = parseFileExtension(file.name).toUpperCase()
  return useDisplayIconWithDefaults(indicator, { type: 'iconfont', content: '\uffe5' })
}

function wrappedFormatUnit(size: number): string {
  return formatUnit(size, dataSizePreset)
}

function handleFileSelected(_files: File[]): void {
  files.value.push(..._files)
}

function handleClearFileButtonClicked(): void {
  files.value = []
}

// -----------------------------------------------------------对话框处理-----------------------------------------------------------
function handleConfirmButtonClicked(): void {
  if (props.loading || files.value.length === 0) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const callback: () => void = () => {
    files.value = []
  }
  emit('onConfirmed', files.value, callback)
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (props.loading || files.value.length === 0) {
    return
  }
  const callback: () => void = () => {
    files.value = []
  }
  emit('onConfirmed', files.value, callback)
}
</script>

<style scoped>
.editor-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.editor-container .item {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.editor-container .el-divider {
  margin: 5px 0;
}

.editor-container .header {
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 5px;
}

.editor-container .body {
  height: 300px;
}

.file-detail {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 3px 0;
  margin-right: 10px;
}

.file-detail .file-item:not(:first-child) {
  margin-left: 10px;
}

.file-detail .icon {
  height: 32px;
  width: 32px;
  font-size: 32px;
  user-select: none;
}

.file-detail .name {
  flex-grow: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.file-detail .size {
  text-align: right;
  width: 95px;
}

.file-detail .button {
  padding: 7px;
}
</style>
