<template>
<div class="my-profile-container">
  <content-panel
    class="content-panel"
    :breadcrumb="['我与家庭', '个人简介管理']"
  >
    <coming-soon/>
  </content-panel>
</div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import ComingSoon from '@/components/layout/ComingSoon.vue';

export default {
  name: 'MyProfile',
  components: { ComingSoon, ContentPanel },
};
</script>

<style scoped>
.my-profile-container {
  width: 100%;
  height: 100%;
}
</style>
