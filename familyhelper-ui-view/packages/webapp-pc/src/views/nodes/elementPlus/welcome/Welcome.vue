<template>
  <div class="welcome-container">
    <border-layout-panel class="border-layout-panel">
      <div class="main-container">
        <placeholder-panel text="欢迎使用家庭助手，我们是幸福的一家人 （๑╹◡╹)ﾉ”" />
      </div>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'

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
