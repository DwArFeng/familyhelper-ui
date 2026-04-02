<template>
  <div v-show="active" class="native-tab-pane" role="tabpanel" :aria-hidden="!active">
    <slot name="default" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from 'vue'

import { NATIVE_TABS_CONTEXT_KEY, type NativeTabPaneItem } from './context.ts'

defineOptions({
  name: 'NativeTabPane',
})

// region Props 定义

type Props = {
  name: string
  label: string
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

// region 注册与显示

const tabs = inject(NATIVE_TABS_CONTEXT_KEY, null)

const active = computed(() => tabs?.modelValue.value === props.name)

watch(
  () => ({ name: props.name, label: props.label }) satisfies NativeTabPaneItem,
  (next, prev) => {
    if (!tabs) {
      return
    }
    if (prev !== undefined && prev.name !== next.name) {
      tabs.unregisterPane(prev.name)
    }
    tabs.registerPane(next)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  tabs?.unregisterPane(props.name)
})

// endregion
</script>

<style scoped>
.native-tab-pane {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
