<template>
  <div class="photo-sub-editor-container">
    <el-image class="image" fit="contain" :src="url" :preview-src-list="[url]" :z-index="10000" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

defineOptions({
  name: 'PhotoSubEditor',
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
  if (url.value) {
    window.URL.revokeObjectURL(url.value)
  }
  if (props.baseBlob === null) {
    return
  }
  url.value = window.URL.createObjectURL(props.baseBlob)
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
const url = ref<string | null>(null)

onUnmounted(() => {
  if (url.value) {
    window.URL.revokeObjectURL(url.value)
  }
})
</script>

<style scoped>
.photo-sub-editor-container {
  width: 100%;
  height: 100%;
}

.image {
  width: 100%;
  height: 100%;
}
</style>
