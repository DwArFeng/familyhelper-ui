<template>
  <div class="project-container">
    <coming-soon/>
  </div>
</template>

<script>
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';

export default {
  name: 'Project',
  components: { ComingSoon },
};
</script>

<style scoped>
.project-container{
  height: 100%;
  width: 100%;
}
</style>
