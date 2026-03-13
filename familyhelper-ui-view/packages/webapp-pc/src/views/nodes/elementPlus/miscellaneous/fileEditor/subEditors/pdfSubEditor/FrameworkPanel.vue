<template>
  <div class="framework-panel-container">
    <div class="header">
      <header-panel v-model:current-page="currentPage" :pages="pages" :readonly="readonly" />
    </div>
    <div class="body">
      <content-panel
        :doc="doc"
        :current-page="currentPage"
        :content-scale="contentScale"
        :readonly="readonly"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { type PDFDocumentProxy } from 'pdfjs-dist'

import HeaderPanel from './HeaderPanel.vue'
import ContentPanel from './ContentPanel.vue'

defineOptions({
  name: 'FrameworkPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  doc: PDFDocumentProxy | null
  readonly: boolean
}

const props = defineProps<Props>()

// -----------------------------------------------------------逻辑处理-----------------------------------------------------------
const currentPage = ref<number>(0)
const pages = ref<number>(0)
const contentScale = ref<number>(2)

watch(
  () => props.doc,
  (value) => {
    if (value === null) {
      currentPage.value = 0
      pages.value = 0
    } else {
      currentPage.value = 0
      pages.value = value.numPages
    }
  },
)
</script>

<style scoped>
.framework-panel-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.header {
  width: 100%;
}

.body {
  height: 0;
  flex-grow: 1;
  width: 100%;
}
</style>
