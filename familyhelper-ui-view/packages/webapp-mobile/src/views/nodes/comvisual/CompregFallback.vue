<template>
  <div class="compreg-fallback-container">
    <border-layout-panel class="border-layout-panel">
      <div class="main-container">
        <placeholder-panel
          text="当你看到这个页面的时候，意味着 router.component.key 没有正确配置"
        />
      </div>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
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
</style>
