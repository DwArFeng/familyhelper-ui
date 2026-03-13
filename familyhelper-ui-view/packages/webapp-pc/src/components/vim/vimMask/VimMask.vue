<template>
  <div class="vim-mask placeholder">
    <div>Powered by VIM 5</div>
    <div>第 5 代前端框架</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'VimMask',
})
</script>

<style scoped>
.vim-mask {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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
