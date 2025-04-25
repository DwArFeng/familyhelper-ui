<template>
  <div class="readme-container">
    <border-layout-panel class="border-layout-panel">
      <div class="main-container">
        <div class="placeholder">欢迎使用家庭助手，我们是幸福的一家人 （๑╹◡╹)ﾉ”</div>
      </div>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

defineOptions({
  name: 'WelcomeComponent',
})
</script>

<style scoped>
.readme-container {
  width: 100%;
  height: 100%;
}

.main-container {
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
