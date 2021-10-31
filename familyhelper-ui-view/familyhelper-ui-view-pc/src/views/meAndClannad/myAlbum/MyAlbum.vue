<template>
<div class="my-album-container">
  <content-panel
    class="content-panel"
    :breadcrumb="['我与家庭', '个人相册管理']"
  >
    <coming-soon/>
  </content-panel>
</div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import ComingSoon from '@/components/layout/ComingSoon.vue';

export default {
  name: 'MyAlbum',
  components: { ComingSoon, ContentPanel },
};
</script>

<style scoped>
.my-album-container {
  width: 100%;
  height: 100%;
}
</style>
