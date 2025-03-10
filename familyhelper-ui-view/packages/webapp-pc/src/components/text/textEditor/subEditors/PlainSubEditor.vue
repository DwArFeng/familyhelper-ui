<template>
  <div class="plain-sub-editor-container">
    <el-input
      class="el-input"
      v-model="watchedModelValue"
      type="textarea"
      resize="none"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

defineOptions({
  name: 'PlainSubEditor',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  modelValue: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:modelValue', value: string): void
}

const emits = defineEmits<Emits>()

// -----------------------------------------------------------值处理逻辑-----------------------------------------------------------
const watchedModelValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    watchedModelValue.value = value
  },
)

watch(
  () => watchedModelValue.value,
  (value) => {
    emits('update:modelValue', value)
  },
)

onMounted(() => {
  watchedModelValue.value = props.modelValue
})
</script>

<style scoped>
.plain-sub-editor-container {
  height: 100%;
  width: 100%;
}

.el-input {
  height: 100%;
  width: 100%;
}

.el-input :deep(textarea) {
  height: 100%;
  width: 100%;
}
</style>
