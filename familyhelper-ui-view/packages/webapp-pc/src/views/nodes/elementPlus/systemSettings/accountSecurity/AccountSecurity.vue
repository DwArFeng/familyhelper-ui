<template>
  <div class="account-security-container">
    <border-layout-panel>
      <coming-soon />
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import ComingSoon from '@/components/comvisual/layout/comingSoon/ComingSoon.vue'
import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'

defineOptions({
  name: 'AccountSecurity',
})
</script>

<style scoped>
.account-security-container {
  width: 100%;
  height: 100%;
}
</style>
