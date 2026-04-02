<template>
  <div class="default-tree-default-slot-container">
    <div class="label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DefaultTreeDefaultSlot',
})

// region Props 定义

type Props = {
  label: string
}

defineProps<Props>()

// endregion
</script>

<style scoped>
.default-tree-default-slot-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.label {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 14px;
  font-family: Arial, sans-serif;
}
</style>
