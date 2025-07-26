<template>
  <el-dialog
    class="image-upload-crop-dialog-container"
    v-model="watchedVisible"
    append-to-body
    destroy-on-close
    :title="title"
    :width="`${cropperWidth + 85}px`"
    :close-on-click-modal="false"
    @open="handleOpen"
    @closed="handleClosed"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <div class="cropper-container" v-loading="loading">
      <div class="item header">
        <file-selector
          accept="image/jpeg, image/png"
          :multiple="false"
          :tester="fileSelectorFileTester"
          @onFileSelected="handleFileSelected"
        />
      </div>
      <el-divider class="item" />
      <image-cropper
        class="item image-cropper"
        ref="imageCropperRef"
        :output-size="outputSize"
        :cropper-height="cropperHeight"
        :cropper-width="cropperWidth"
        :crop-box-height="cropBoxHeight"
        :crop-box-width="cropBoxWidth"
        :image-url="imageUrl ?? ''"
        :enlarge="enlarge"
      />
    </div>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading || imageUrl === null || imageFileName === null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </el-button>
        <el-button :disabled="loading" @click="handleCancelButtonClicked">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, useTemplateRef, onUnmounted } from 'vue'

import { type FileTester } from '@/components/file/fileSelector/types.ts'
import FileSelector from '@/components/file/fileSelector/FileSelector.vue'
import ImageCropper from '@/components/image/imageCropper/ImageCropper.vue'

import { type ImageSelectCropInfo } from './types.ts'

defineOptions({
  name: 'ImageUploadCropDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  title?: string
  outputSize?: number
  cropperWidth?: number
  cropperHeight?: number
  cropBoxWidth?: number
  cropBoxHeight?: number
  enlarge?: number
  loading?: boolean | number
}

const props = withDefaults(defineProps<Props>(), {
  title: '选择并编辑图片',
  outputSize: 1,
  cropperWidth: 400,
  cropperHeight: 300,
  cropBoxWidth: 400,
  cropBoxHeight: 300,
  enlarge: 1,
  loading: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', info: ImageSelectCropInfo): void
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

// -----------------------------------------------------------显示处理-----------------------------------------------------------
function handleOpen(): void {
  if (imageUrl.value === null) {
    return
  }
  window.URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  imageFileName.value = null
}

function handleClosed(): void {
  if (imageUrl.value === null) {
    return
  }
  window.URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  imageFileName.value = null
}

// -----------------------------------------------------------文件选择器-----------------------------------------------------------
const fileSelectorFileTester = computed<FileTester>(() => {
  return (file: File) => {
    if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(file.name)) {
      return {
        passed: false,
        message: '图片类型要求：jpeg、jpg、png',
      }
    } else {
      return true
    }
  }
})

function handleFileSelected(files: File[]): void {
  if (files.length === 0) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (imageUrl.value !== null) {
    window.URL.revokeObjectURL(imageUrl.value)
  }
  const file = files[0]
  imageUrl.value = window.URL.createObjectURL(file)
  imageFileName.value = file.name
}

// -----------------------------------------------------------图片编辑器-----------------------------------------------------------
const imageUrl = ref<string | null>(null)
const imageFileName = ref<string | null>(null)

const imageCropperRef = useTemplateRef<InstanceType<typeof ImageCropper>>('imageCropperRef')

onUnmounted(() => {
  if (imageUrl.value === null) {
    return
  }
  window.URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  imageFileName.value = null
})

// -----------------------------------------------------------确认逻辑-----------------------------------------------------------
async function handleConfirmButtonClicked(): Promise<void> {
  if (!imageUrl.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (!imageFileName.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const _blobPromise: Promise<Blob> = new Promise((resolve) => {
    if (!imageCropperRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    imageCropperRef.value.getCropBlob((blob) => {
      resolve(blob)
    })
  })
  const _blob: Blob = await _blobPromise
  emit('onConfirmed', { blob: _blob, name: imageFileName.value })
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

async function handleHotKeyDown(): Promise<void> {
  if (props.loading || imageUrl.value === null || imageFileName.value === null) {
    return
  }
  const _blobPromise: Promise<Blob> = new Promise((resolve) => {
    if (!imageCropperRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    imageCropperRef.value.getCropBlob((blob) => {
      resolve(blob)
    })
  })
  const _blob: Blob = await _blobPromise
  emit('onConfirmed', { blob: _blob, name: imageFileName.value })
}
</script>

<style scoped>
.cropper-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.cropper-container .item {
  width: 100%;
}

.cropper-container .header {
  display: block;
}

/*noinspection CssUnusedSymbol*/
.cropper-container .el-divider {
  margin: 5px 0;
}
</style>
