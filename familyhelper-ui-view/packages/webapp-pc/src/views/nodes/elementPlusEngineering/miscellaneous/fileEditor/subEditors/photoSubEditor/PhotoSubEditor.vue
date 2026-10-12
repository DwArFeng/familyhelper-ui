<template>
  <div class="photo-sub-editor-container">
    <el-image
      class="image"
      fit="contain"
      preview-teleported
      :src="url"
      :preview-src-list="[url]"
      :z-index="10000"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PhotoSubEditor',
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

const url = ref<string | null>(null)

onUnmounted(() => {
  if (url.value) {
    window.URL.revokeObjectURL(url.value)
  }
})

// endregion
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
