<template>
  <div class="rtf-sub-editor-container">
    <div v-show="loading" class="placeholder">正在渲染数据，请稍候...</div>
    <div v-show="!loading" class="editor">
      <ckeditor v-model="content" :config="config" :editor="editorClass" @ready="handleReady" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import type { EditorConfig } from 'ckeditor5'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'

import { FamilyhelperEditor } from '@dwarfeng/familyhelper-ui-component-ckeditor/src/familyhelperEditor.ts'

defineOptions({
  name: 'RtfSubEditor',
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
const instance = ref<FamilyhelperEditor | null>(null)
const content = ref('')
const backupContent = ref<string>('')

const config = computed<EditorConfig>(() => {
  return {
    licenseKey: 'GPL',
  }
})
const editorClass = computed(() => {
  return FamilyhelperEditor
})
const editorTopDisplay = computed<'none' | 'block'>(() => {
  if (props.readonly) {
    return 'none'
  } else {
    return 'block'
  }
})

watch(
  () => props.readonly,
  (value) => {
    updateReadonly(value)
  },
)

watch(content, () => {
  emit('onContentChangeIndicatorChanged', content.value !== backupContent.value)
})

function handleReady(i: FamilyhelperEditor): void {
  instance.value = i
  updateReadonly(props.readonly)
  instance.value.on('change:isReadOnly', (_evt: unknown, _property: unknown, readonly: boolean) => {
    updateReadonly(readonly)
  })
}

function updateReadonly(readonly: boolean): void {
  if (instance.value === null) {
    return
  }
  if (readonly) {
    instance.value.enableReadOnlyMode('rtf-sub-editor')
  } else {
    instance.value.disableReadOnlyMode('rtf-sub-editor')
  }
}
</script>

<style scoped>
.rtf-sub-editor-container {
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
.editor :deep(.ck-editor) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.editor :deep(.ck-editor__top) {
  display: v-bind(editorTopDisplay);
}

/*noinspection CssUnusedSymbol*/
.editor :deep(.ck-editor__main) {
  height: 0;
  flex-grow: 1;
  margin-bottom: 8px;
}

/*noinspection CssUnusedSymbol*/
.editor :deep(.ck-content) {
  height: 100%;
  box-sizing: border-box;
}
</style>
