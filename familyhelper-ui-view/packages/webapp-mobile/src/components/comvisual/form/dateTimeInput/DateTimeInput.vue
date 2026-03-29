<template>
  <input
    class="date-time-input"
    type="datetime-local"
    :value="localValue"
    :disabled="disabled"
    :step="stepSeconds"
    @input="onInput"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'DateTimeInput',
})

// region Props 定义

type Props = {
  /** 与后端一致的 ISO 字符串或空 */
  modelValue: string
  disabled?: boolean
  /** input step（秒），默认 60 */
  stepSeconds?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  stepSeconds: 60,
})

// endregion

// region Emits 定义

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// endregion

// region 值转换

function isoToDatetimeLocal(iso: string): string {
  if (!iso) {
    return ''
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return ''
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`
}

function datetimeLocalToIso(local: string): string {
  if (!local) {
    return ''
  }
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) {
    return ''
  }
  return d.toISOString()
}

const localValue = computed(() => isoToDatetimeLocal(props.modelValue))

// endregion

// region 事件

function onInput(ev: Event): void {
  const v = (ev.target as HTMLInputElement).value
  emit('update:modelValue', datetimeLocalToIso(v))
}

// endregion
</script>

<style scoped>
.date-time-input {
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;
  max-width: 280px;
}
</style>
