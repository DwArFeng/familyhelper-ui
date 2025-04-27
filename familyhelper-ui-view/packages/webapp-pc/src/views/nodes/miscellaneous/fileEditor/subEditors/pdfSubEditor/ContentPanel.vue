<template>
  <div class="content-panel-container" ref="contentPanelRef">
    <overlay-scrollbars-component class="scroll-bar">
      <canvas ref="contentCanvasRef" />
    </overlay-scrollbars-component>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import { type PDFDocumentProxy, type PDFPageProxy } from 'pdfjs-dist'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

defineOptions({
  name: 'ContentPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  doc: PDFDocumentProxy | null
  currentPage: number
  contentScale: number
  readonly: boolean
}

const props = defineProps<Props>()

// -----------------------------------------------------------逻辑处理-----------------------------------------------------------
const contentPanelResizeObserver = new ResizeObserver(() => {
  updateContentCanvasStyle()
})

const contentCanvasStyleLeft = ref<number>(0)

const contentPanelRef = useTemplateRef<HTMLDivElement>('contentPanelRef')
const contentCanvasRef = useTemplateRef<HTMLCanvasElement>('contentCanvasRef')

const pdfRenderWatchingData = computed(() => {
  return {
    pdfDoc: props.doc,
    pdfCurrentPage: props.currentPage,
  }
})

watch(pdfRenderWatchingData, () => {
  renderPage()
})

function renderPage(): void {
  if (props.doc === null) {
    cleanupPage()
  } else {
    doRenderPage()
  }
}

function cleanupPage(): void {
  const contentCanvas: HTMLCanvasElement | null = contentCanvasRef.value
  if (!contentCanvas) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const contentCanvasContext = contentCanvas.getContext('2d')
  if (!contentCanvasContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  contentCanvasContext.clearRect(0, 0, contentCanvas.width, contentCanvas.height)
}

async function doRenderPage(): Promise<void> {
  if (!props.doc) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const contentCanvas: HTMLCanvasElement | null = contentCanvasRef.value
  if (!contentCanvas) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  let actualPage: number
  if (props.currentPage < 0) {
    actualPage = 0
  } else if (props.currentPage >= props.doc.numPages) {
    actualPage = props.doc.numPages - 1
  } else {
    actualPage = props.currentPage
  }
  const pdfPage: PDFPageProxy = await props.doc.getPage(actualPage + 1)
  const pdfPageViewPort = pdfPage.getViewport({ scale: props.contentScale })
  const contentCanvasContext = contentCanvas.getContext('2d')
  if (!contentCanvasContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  // 清除画布中原先的内容。
  contentCanvasContext.clearRect(0, 0, contentCanvas.width, contentCanvas.height)
  // 根据视口调整画布大小。
  contentCanvas.width = pdfPageViewPort.width
  contentCanvas.height = pdfPageViewPort.height
  // 渲染新内容。
  const renderContext = {
    canvasContext: contentCanvasContext,
    viewport: pdfPageViewPort,
  }
  await pdfPage.render(renderContext).promise
  // 更新 contentCanvas 样式。
  updateContentCanvasStyle()
}

function updateContentCanvasStyle(): void {
  // 获取组件引用。
  const pdfContentContainer: HTMLDivElement | null = contentPanelRef.value
  if (!pdfContentContainer) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const contentCanvas: HTMLCanvasElement | null = contentCanvasRef.value
  if (!contentCanvas) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  // 如果 contentCanvas 的宽度大于 pdfContentContainer 的宽度，则 contentCanvas 的 left 为 0。
  if (contentCanvas.width > pdfContentContainer.clientWidth) {
    contentCanvasStyleLeft.value = 0
  }
  // 如果 contentCanvas 的宽度小于 pdfContentContainer 的宽度，
  // 则 contentCanvas 的 left 为 pdfContentContainer 的宽度减去 contentCanvas 的宽度的一半。
  else {
    contentCanvasStyleLeft.value = (pdfContentContainer.clientWidth - contentCanvas.width) / 2
  }
}

onMounted(() => {
  const pdfContentContainer: HTMLDivElement | null = contentPanelRef.value
  if (!pdfContentContainer) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  contentPanelResizeObserver.observe(pdfContentContainer)
})

onUnmounted(() => {
  const pdfContentContainer: HTMLDivElement | null = contentPanelRef.value
  if (!pdfContentContainer) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  contentPanelResizeObserver.unobserve(pdfContentContainer)
})
</script>

<style scoped>
.content-panel-container {
  height: 100%;
  width: 100%;
}

.content-panel-container canvas {
  position: relative;
  left: v-bind(contentCanvasStyleLeft + 'px');
}
</style>
