<template>
  <div class="txt-sub-editor-container">
    <div v-show="loading" class="placeholder">正在渲染数据，请稍候...</div>
    <div v-show="!loading" class="editor">
      <el-input type="textarea" resize="none" v-model="content" :readonly="readonly" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

defineOptions({
  name: 'TxtSubEditor',
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

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Blob 逻辑处理-----------------------------------------------------------
watch(
  () => props.baseBlob,
  () => {
    syncBlob()
  },
)

function syncBlob(): void {
  if (props.baseBlob === null) {
    content.value = ''
    backupContent.value = ''
  }
  doSyncBlob()
}

async function doSyncBlob(): Promise<void> {
  loading.value += 1
  try {
    if (props.baseBlob === null) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    const text: string = await props.baseBlob.text()
    content.value = text
    backupContent.value = text
    emit('onContentChangeIndicatorChanged', false)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  syncBlob()
})

// -----------------------------------------------------------暴露方法-----------------------------------------------------------
function currentContent(): Blob | Promise<Blob> {
  return new Blob([content.value], { type: 'text/plain' })
}

function fireCurrentContentCommitted(): void {
  backupContent.value = content.value
  emit('onContentChangeIndicatorChanged', false)
}

defineExpose({
  currentContent,
  fireCurrentContentCommitted,
})

// -----------------------------------------------------------编辑器-----------------------------------------------------------
const loading = ref<number>(0)
const content = ref<string>('')
const backupContent = ref<string>('')

watch(content, () => {
  emit('onContentChangeIndicatorChanged', content.value !== backupContent.value)
})
</script>

<style scoped>
.txt-sub-editor-container {
  width: 100%;
  height: 100%;
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

.editor {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.editor :deep(.el-textarea) {
  width: 100%;
  height: 100%;
}

.editor :deep(textarea) {
  width: 100%;
  height: 100%;
}
</style>
