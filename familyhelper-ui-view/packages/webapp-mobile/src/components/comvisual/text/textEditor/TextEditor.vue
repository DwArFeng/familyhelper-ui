<template>
  <div class="text-editor-container">
    <div class="text-editor-toolbar">
      <native-select
        v-model="modeValue"
        class="mode-select"
        :options="modeOptions"
        :disabled="readonly"
        :filterable="false"
        aria-label="文本模式"
      />
      <span class="text-length">长度：{{ modelValue.length }}</span>
      <native-button size="small" @click="handleCopy">复制</native-button>
    </div>
    <textarea
      v-model="modelValue"
      class="text-editor-textarea"
      :readonly="readonly"
      :style="{ minHeight: height }"
      spellcheck="false"
      aria-label="文本编辑器"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeSelect, {
  type NativeSelectOption,
} from '@/components/comvisual/form/nativeSelect/NativeSelect.vue'
import { notifyError, notifySuccess } from '@/library/modules/comvisual/util/nativeUi.ts'

defineOptions({
  name: 'TextEditor',
})

// region Props 定义

type Props = {
  modelValue: string
  readonly?: boolean
  mode?: 'plain' | 'json'
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  mode: 'plain',
  height: '180px',
})

// endregion

// region Emits 定义

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// endregion

// region 状态

const modelValue = ref(props.modelValue)
const modeValue = ref<'plain' | 'json'>(props.mode)

const modeOptions: NativeSelectOption[] = [{ value: 'plain', label: 'Text' }]

watch(
  () => props.modelValue,
  (value) => {
    modelValue.value = value
  },
)

watch(
  () => modelValue.value,
  (value) => {
    emit('update:modelValue', value)
  },
)

watch(
  () => props.mode,
  (value) => {
    modeValue.value = value
  },
)

// endregion

// region 文本操作

function handleCopy(): void {
  if (!navigator.clipboard) {
    notifyError('当前浏览器不支持复制文本')
    return
  }
  navigator.clipboard
    .writeText(modelValue.value)
    .then(() => notifySuccess('复制成功'))
    .catch(() => notifyError('复制失败'))
}

// endregion
</script>

<style scoped>
.text-editor-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 6px;
  box-sizing: border-box;
  background: #f5f7fa;
  gap: 6px;
}

.text-editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.mode-select {
  width: 110px;
}

.text-length {
  color: #909399;
  font-size: 13px;
}

.text-editor-textarea {
  width: 100%;
  height: 0;
  flex: 1;
  min-width: 0;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: none;
  box-sizing: border-box;
  font: inherit;
  line-height: 1.5;
  color: #303133;
  background: #fff;
}
</style>
