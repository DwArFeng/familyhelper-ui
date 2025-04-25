<template>
  <div class="welcome-container">
    <div class="placeholder">欢迎使用 VIM 框架</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WelcomeComponent',
})
</script>

<style scoped>
.welcome-container {
  width: 100%;
  height: 100%;
}

.placeholder {
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
