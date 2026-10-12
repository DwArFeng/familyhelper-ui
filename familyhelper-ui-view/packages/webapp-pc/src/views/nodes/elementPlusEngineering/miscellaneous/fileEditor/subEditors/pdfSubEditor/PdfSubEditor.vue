<template>
  <div class="pdf-sub-editor-container">
    <placeholder-panel
      v-show="loading"
      :text="t('views.element_plus_engineering.miscellaneous.rendering_data')"
    />
    <framework-panel
      v-show="!loading"
      :doc="pdfDoc as NullablePDFDocumentProxy"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { markRaw, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { type PDFDocumentProxy } from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'

import FrameworkPanel from './FrameworkPanel.vue'

defineOptions({
  name: 'PdfSubEditor',
})

// region Props 定义

type Props = {
  baseBlob: Blob | null
  readonly: boolean
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'onContentChangeIndicatorChanged', value: boolean): void
}

defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region Blob 逻辑处理

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

// endregion

// region 暴露方法

function currentContent(): Blob | Promise<Blob> {
  throw new Error(
    t('views.element_plus_engineering.miscellaneous.unexpected_execution_contact_developer'),
  )
}

function fireCurrentContentCommitted(): void {
  throw new Error(
    t('views.element_plus_engineering.miscellaneous.unexpected_execution_contact_developer'),
  )
}

defineExpose({
  currentContent,
  fireCurrentContentCommitted,
})

// endregion

// region 编辑器

type NullablePDFDocumentProxy = PDFDocumentProxy | null

const loading = ref<number>(0)
const pdfDoc = ref<PDFDocumentProxy | null>(null)

// endregion
</script>

<style scoped>
.pdf-sub-editor-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
