<template>
<div class="clannad-album-container">
  <content-panel
    class="content-panel"
    :breadcrumb="['我与家庭', '家庭相册']"
  >
    <coming-soon/>
  </content-panel>
</div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import ComingSoon from '@/components/layout/ComingSoon.vue';

export default {
  name: 'ClannadAlbum',
  components: { ComingSoon, ContentPanel },
};
</script>

<style scoped>
.clannad-album-container{
  width: 100%;
  height: 100%;
}
</style>
