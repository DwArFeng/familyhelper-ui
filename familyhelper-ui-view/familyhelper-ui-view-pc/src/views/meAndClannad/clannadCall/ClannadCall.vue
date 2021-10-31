<template>
<div class="clannad-call-container">
  <content-panel
    class="content-panel"
    :breadcrumb="['我与家庭', '家人称呼管理']"
  >
    <coming-soon/>
  </content-panel>
</div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import ComingSoon from '@/components/layout/ComingSoon.vue';

export default {
  name: 'ClannadCall',
  components: { ComingSoon, ContentPanel },
};
</script>

<style scoped>
.clannad-call-container {
  width: 100%;
  height: 100%;
}
</style>
