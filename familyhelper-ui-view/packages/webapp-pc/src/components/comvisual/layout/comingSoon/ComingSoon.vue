<template>
  <div class="coming-soon-container">
    <placeholder-panel text="页面正在快马加鞭地开发中，很快就能见面 （๑╹◡╹)ﾉ”" />
  </div>
</template>

<script setup lang="ts">
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'

defineOptions({
  name: 'ComingSoon',
})
</script>

<style scoped>
.coming-soon-container {
  width: 100%;
  height: 100%;
}
</style>
