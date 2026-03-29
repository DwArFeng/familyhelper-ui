<template>
  <label class="native-checkbox" :class="{ 'is-disabled': disabled }">
    <input type="checkbox" :checked="modelValue" :disabled="disabled" @change="onChange" />
    <span v-if="label" class="native-checkbox__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
defineOptions({
  name: 'NativeCheckbox',
})

// region Props 定义

type Props = {
  modelValue: boolean
  label?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
})

// endregion

// region Emits 定义

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// endregion

// region 事件

function onChange(ev: Event): void {
  emit('update:modelValue', (ev.target as HTMLInputElement).checked)
}

// endregion
</script>

<style scoped>
.native-checkbox {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.native-checkbox.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
