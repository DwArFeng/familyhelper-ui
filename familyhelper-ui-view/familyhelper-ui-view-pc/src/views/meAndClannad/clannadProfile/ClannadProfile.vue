<template>
<div class="clannad-profile-container">
  <content-panel
    class="content-panel"
    :breadcrumb="['我与家庭', '家庭简介']"
  >
    <coming-soon/>
  </content-panel>
</div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import ComingSoon from '@/components/layout/ComingSoon.vue';

export default {
  name: 'ClannadProfile',
  components: { ComingSoon, ContentPanel },
};
</script>

<style scoped>
.clannad-profile-container {
  width: 100%;
  height: 100%;
}
</style>
