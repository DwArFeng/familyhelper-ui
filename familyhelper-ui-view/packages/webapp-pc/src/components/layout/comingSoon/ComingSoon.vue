<template>
  <div class="coming-soon-container placeholder">
    页面正在快马加鞭地开发中，很快就能见面 （๑╹◡╹)ﾉ”
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ComingSoon',
})
</script>

<style scoped>
.coming-soon-container {
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
