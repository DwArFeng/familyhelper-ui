<template>
  <div class="header-layout-panel-container">
    <div class="header-container-wrapper">
      <slot name="header" />
    </div>
    <el-divider v-if="$slots.header" />
    <div class="main-container-wrapper" :class="{ expand: !applyContainerHeight }">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HeaderLayoutPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  applyContainerHeight?: boolean
}

withDefaults(defineProps<Props>(), {
  applyContainerHeight: false,
})

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  header?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()
</script>

<style scoped>
.header-layout-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.el-divider {
  margin: 5px 0;
}

.main-container-wrapper {
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.main-container-wrapper.expand {
  height: 0;
  flex-grow: 1;
}
</style>
