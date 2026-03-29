<template>
  <div class="native-form-item" :class="{ 'has-error': !!displayError }" :style="fieldStyle">
    <label v-if="label" class="native-form-item__label">{{ label }}</label>
    <div class="native-form-item__content">
      <slot name="default" />
    </div>
    <div v-if="displayError" class="native-form-item__error">{{ displayError }}</div>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, inject, onUnmounted, ref, watch } from 'vue'

import { NATIVE_FORM_CONTEXT_KEY, type NativeFormContext } from './context.ts'

defineOptions({
  name: 'NativeFormItem',
})

// region Props 定义

type Props = {
  /** model 键路径，如 a 或 a.b.0；参与整表校验时必填 */
  prop?: string
  label?: string
  /** 外部校验错误文案；非空时优先于 rules 校验结果展示 */
  error?: string
}

const props = defineProps<Props>()

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// endregion

// region 注入

const form = inject(NATIVE_FORM_CONTEXT_KEY, null) as NativeFormContext<CT> | null

// endregion

// region 状态

const validationError = ref<string | null>(null)

// endregion

// region 根节点样式

const fieldStyle = computed(() => {
  const w = form?.labelWidthCss ?? '80px'
  return { '--native-form-item-label-width': w } as Record<string, string>
})

const displayError = computed(() => {
  const ext = props.error
  if (ext != null && String(ext).trim() !== '') {
    return ext
  }
  return validationError.value
})

// endregion

// region 字段注册与生命周期

function setError(message: string | null): void {
  validationError.value = message
}

let unregister: (() => void) | null = null

watch(
  () => [form, props.prop] as const,
  () => {
    unregister?.()
    unregister = null
    if (form == null) {
      return
    }
    const prop = props.prop ?? ''
    unregister = form.registerField({ prop, setError })
  },
  { immediate: true },
)

onUnmounted(() => {
  unregister?.()
})

// endregion
</script>

<style scoped>
.native-form-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0 8px;
  margin-bottom: 12px;
  --native-form-item-label-width: 80px;
}

.native-form-item__label {
  flex: 0 0 var(--native-form-item-label-width);
  max-width: 100%;
  padding-top: 6px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.native-form-item__content {
  flex: 1 1 auto;
  min-width: 0;
}

.native-form-item.has-error .native-form-item__content :deep(input),
.native-form-item.has-error .native-form-item__content :deep(select),
.native-form-item.has-error .native-form-item__content :deep(textarea) {
  border-color: #f56c6c;
}

.native-form-item__error {
  width: 100%;
  margin-left: calc(var(--native-form-item-label-width) + 8px);
  font-size: 12px;
  color: #f56c6c;
}
</style>
