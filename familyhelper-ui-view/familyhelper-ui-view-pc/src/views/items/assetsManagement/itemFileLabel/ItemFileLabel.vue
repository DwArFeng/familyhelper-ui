<template>
  <div class="item-file-label-container">
    <border-layout-panel
      class="border-layout-panel"
    >
      <coming-soon/>
    </border-layout-panel>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';

export default {
  name: 'ItemFileLabel',
  components: { ComingSoon, BorderLayoutPanel },
};
</script>

<style scoped>
.item-file-label-container{
  width: 100%;
  height: 100%;
}
</style>
