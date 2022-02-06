<template>
  <div class="task-container">
    <coming-soon/>
  </div>
</template>

<script>
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';

export default {
  name: 'Task',
  components: { ComingSoon },
};
</script>

<style scoped>
.task-container {
  height: 100%;
  width: 100%;
}
</style>
