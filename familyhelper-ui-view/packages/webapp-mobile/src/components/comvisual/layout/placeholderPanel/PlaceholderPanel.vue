<template>
  <div class="placeholder-panel-container">{{ text }}</div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PlaceholderPanel',
})

// region Props 定义

type Props = {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '',
})

// endregion
</script>

<style scoped>
.placeholder-panel-container {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}
</style>
