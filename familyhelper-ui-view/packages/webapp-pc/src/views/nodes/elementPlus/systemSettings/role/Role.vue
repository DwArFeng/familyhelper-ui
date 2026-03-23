<template>
  <div class="role-container">
    <border-layout-panel>
      <coming-soon />
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import ComingSoon from '@/components/common/layout/comingSoon/ComingSoon.vue'
import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'

defineOptions({
  name: 'RoleComponent',
})
</script>

<style scoped>
.role-container {
  width: 100%;
  height: 100%;
}
</style>
