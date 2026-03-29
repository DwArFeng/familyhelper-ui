<template>
  <select class="native-select" :value="String(modelValue)" :disabled="disabled" @change="onChange">
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option v-for="opt in options" :key="String(opt.value)" :value="String(opt.value)">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
defineOptions({
  name: 'NativeSelect',
})

// region Props 定义

export type NativeSelectOption = {
  label: string
  value: string | number
}

type Props = {
  modelValue: string | number
  options: NativeSelectOption[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
})

// endregion

// region Emits 定义

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// endregion

// region 事件

function onChange(ev: Event): void {
  const raw = (ev.target as HTMLSelectElement).value
  const match = props.options.find((o) => String(o.value) === raw)
  if (match) {
    emit('update:modelValue', match.value)
  }
}

// endregion
</script>

<style scoped>
.native-select {
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  color: #606266;
  box-sizing: border-box;
}
</style>
