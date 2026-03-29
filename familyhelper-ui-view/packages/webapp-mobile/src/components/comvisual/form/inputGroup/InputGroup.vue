<template>
  <div class="input-group">
    <div v-if="$slots.prepend" class="input-group__prepend">
      <slot name="prepend" />
    </div>
    <div class="input-group__main">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'InputGroup',
})

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  prepend?: (props: {}) => any
}>()

// endregion
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  min-height: 32px;
}

.input-group__prepend {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-right: none;
  border-radius: 4px 0 0 4px;
  background: #f5f7fa;
  font-size: 14px;
}

.input-group__main {
  flex: 1;
  min-width: 0;
}

.input-group__main :deep(input),
.input-group__main :deep(select) {
  width: 100%;
  height: 100%;
  min-height: 32px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 0 4px 4px 0;
  padding: 0 10px;
  font-size: 14px;
}
</style>
