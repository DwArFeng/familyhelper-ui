<template>
  <div class="pdf-sub-editor-container">
    <div v-show="loading" class="placeholder">正在渲染数据，请稍候...</div>
    <framework-panel
      v-show="!loading"
      :doc="pdfDoc as NullablePDFDocumentProxy"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { markRaw, onMounted, ref, watch } from 'vue'

import type { PDFDocumentProxy } from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist'

import FrameworkPanel from './FrameworkPanel.vue'

defineOptions({
  name: 'PdfSubEditor',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  baseBlob: Blob | null
  readonly: boolean
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onContentChangeIndicatorChanged', value: boolean): void
}

defineEmits<Emits>()

// -----------------------------------------------------------Blob 逻辑处理-----------------------------------------------------------
watch(
  () => props.baseBlob,
  () => {
    syncBlob()
  },
)

function syncBlob(): void {
  doSyncBlob()
}

async function doSyncBlob(): Promise<void> {
  loading.value += 1
  try {
    if (props.baseBlob === null) {
      pdfDoc.value = null
    } else {
      const arrayBuffer = await props.baseBlob.arrayBuffer()
      pdfDoc.value = markRaw(await pdfjsLib.getDocument(arrayBuffer).promise)
    }
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  syncBlob()
})

// -----------------------------------------------------------暴露方法-----------------------------------------------------------
function currentContent(): Blob | Promise<Blob> {
  throw new Error('不应该执行到此处, 请联系开发人员')
}

function fireCurrentContentCommitted(): void {
  throw new Error('不应该执行到此处, 请联系开发人员')
}

defineExpose({
  currentContent,
  fireCurrentContentCommitted,
})

// -----------------------------------------------------------编辑器-----------------------------------------------------------
type NullablePDFDocumentProxy = PDFDocumentProxy | null

const loading = ref<number>(0)
const pdfDoc = ref<PDFDocumentProxy | null>(null)
</script>

<style scoped>
.pdf-sub-editor-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
</style>
