<template>
  <div class="compreg-fallback-container">
    <border-layout-panel class="border-layout-panel">
      <div class="main-container">
        <div class="placeholder">
          当你看到这个页面的时候，意味着 router.component.key 没有正确配置
        </div>
      </div>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'

defineOptions({
  name: 'CompregFallbackComponent',
})
</script>

<style scoped>
.compreg-fallback-container {
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
