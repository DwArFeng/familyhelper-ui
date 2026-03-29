<template>
  <div v-show="active" class="vertical-tab-pane" role="tabpanel" :aria-hidden="!active">
    <slot name="default" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue'

defineOptions({
  name: 'VerticalTabPane',
})

// region Props 定义

type Props = {
  name: string
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

// region 显示

const modelValue = inject<ComputedRef<string> | undefined>('verticalTabsModelValue')

const active = computed(() => modelValue?.value === props.name)

// endregion
</script>

<style scoped>
.vertical-tab-pane {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
