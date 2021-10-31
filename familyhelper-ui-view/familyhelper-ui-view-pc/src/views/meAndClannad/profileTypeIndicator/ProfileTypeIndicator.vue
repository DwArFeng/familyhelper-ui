<template>
<div class="profile-type-indicator-container">
  <content-panel
    class="content-panel"
    :breadcrumb="['我与家庭', '简介类型管理']"
  >
    <coming-soon/>
  </content-panel>
</div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import ComingSoon from '@/components/layout/ComingSoon.vue';

export default {
  name: 'ProfileTypeIndicator',
  components: { ComingSoon, ContentPanel },
};
</script>

<style scoped>
.profile-type-indicator-container{
  width: 100%;
  height: 100%;
}
</style>
