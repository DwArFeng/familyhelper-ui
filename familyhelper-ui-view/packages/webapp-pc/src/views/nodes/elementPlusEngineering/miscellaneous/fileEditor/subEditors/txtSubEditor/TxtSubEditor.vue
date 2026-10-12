<template>
  <div class="txt-sub-editor-container">
    <placeholder-panel
      v-show="loading"
      :text="t('views.element_plus_engineering.miscellaneous.rendering_data')"
    />
    <div v-show="!loading" class="editor">
      <el-input type="textarea" resize="none" v-model="content" :readonly="readonly" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'

defineOptions({
  name: 'TxtSubEditor',
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

const emit = defineEmits<Emits>()

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
      throw new Error(
        t('views.element_plus_engineering.miscellaneous.unexpected_execution_contact_developer'),
      )
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

// endregion

// region 暴露方法

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

// endregion

// region 编辑器

const loading = ref<number>(0)
const content = ref<string>('')
const backupContent = ref<string>('')

watch(content, () => {
  emit('onContentChangeIndicatorChanged', content.value !== backupContent.value)
})

// endregion
</script>

<style scoped>
.txt-sub-editor-container {
  width: 100%;
  height: 100%;
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
