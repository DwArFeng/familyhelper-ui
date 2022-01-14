<template>
  <div class="params-tab-panel-container">
    <coming-soon/>
  </div>
</template>

<script>
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';

export default {
  name: 'ParamsTabPanel',
  components: { ComingSoon },
};
</script>

<style scoped>
.params-tab-panel-container {
  height: 100%;
  width: 100%;
}
</style>
