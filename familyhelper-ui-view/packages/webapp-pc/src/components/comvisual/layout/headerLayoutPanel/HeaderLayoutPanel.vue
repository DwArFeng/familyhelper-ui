<template>
  <div class="header-layout-panel-container">
    <div class="header-container-wrapper">
      <slot name="header" />
    </div>
    <div v-if="$slots.header" class="header-divider" role="separator" />
    <div class="main-container-wrapper" :class="{ expand: !applyContainerHeight }">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HeaderLayoutPanel',
})

// region Props 定义

type Props = {
  applyContainerHeight?: boolean
}

withDefaults(defineProps<Props>(), {
  applyContainerHeight: false,
})

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  header?: (props: {}) => any
}>()

// endregion
</script>

<style scoped>
.header-layout-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.header-container-wrapper {
  flex-shrink: 0;
}

.header-divider {
  flex-shrink: 0;
  height: 1px;
  margin: 5px 0;
  border: none;
  background: #dcdfe6;
}

.main-container-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.main-container-wrapper.expand {
  flex-grow: 1;
}
</style>
