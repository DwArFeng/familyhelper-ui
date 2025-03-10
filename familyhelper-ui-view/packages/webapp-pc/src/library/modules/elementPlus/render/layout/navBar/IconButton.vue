<template>
  <div class="nav-button-container" @click="handleClick">
    <i class="iconfont icon-button">
      {{ props.icon }}
    </i>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'IconButton',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'click'): void
}

const emit = defineEmits<Emits>()

// 事件处理。
function handleClick() {
  emit('click')
}
</script>

<style scoped>
.nav-button-container {
  cursor: pointer;
  outline: none;
  user-select: none;
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.nav-button-container:hover {
  background: rgba(0, 0, 0, 0.025);
}

.icon-button {
  font-size: 16px;
}
</style>
