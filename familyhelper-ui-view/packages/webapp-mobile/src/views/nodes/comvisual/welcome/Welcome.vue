<template>
  <div class="welcome-container">
    <border-layout-panel class="border-layout-panel">
      <div class="main-container">
        <placeholder-panel text="欢迎使用 VIM 框架" />
      </div>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'

defineOptions({
  name: 'WelcomeComponent',
})
</script>

<style scoped>
.welcome-container {
  width: 100%;
  height: 100%;
}

.main-container {
  width: 100%;
  height: 100%;
}
</style>
