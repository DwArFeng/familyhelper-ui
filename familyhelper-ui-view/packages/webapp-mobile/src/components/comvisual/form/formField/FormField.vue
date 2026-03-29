<template>
  <div class="form-field" :class="{ 'has-error': !!error }" :style="fieldStyle">
    <label v-if="label" class="form-field__label">{{ label }}</label>
    <div class="form-field__control">
      <slot />
    </div>
    <div v-if="error" class="form-field__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'FormField',
})

// region Props 定义

type Props = {
  label?: string
  error?: string
  labelWidth?: string
}

const props = defineProps<Props>()

// endregion

// region 样式变量

const fieldStyle = computed(() => {
  if (!props.labelWidth) {
    return undefined
  }
  return { '--form-field-label-width': props.labelWidth } as Record<string, string>
})

// endregion
</script>

<style scoped>
.form-field {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0 8px;
  margin-bottom: 12px;
  --form-field-label-width: 80px;
}

.form-field__label {
  flex: 0 0 var(--form-field-label-width);
  max-width: 100%;
  padding-top: 6px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.form-field__control {
  flex: 1 1 auto;
  min-width: 0;
}

.form-field.has-error .form-field__control :deep(input),
.form-field.has-error .form-field__control :deep(select),
.form-field.has-error .form-field__control :deep(textarea) {
  border-color: #f56c6c;
}

.form-field__error {
  width: 100%;
  margin-left: calc(var(--form-field-label-width) + 8px);
  font-size: 12px;
  color: #f56c6c;
}
</style>
