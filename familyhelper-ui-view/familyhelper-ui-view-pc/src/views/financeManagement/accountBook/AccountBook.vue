<template>
  <div class="account-book-container">
    <content-panel
      class="content-panel"
      :breadcrumb="['资金管理', '账本管理']"
    >
      <card-list-panel/>
    </content-panel>
  </div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import CardListPanel from '@/components/layout/CardListPanel.vue';

export default {
  name: 'AccountBook',
  components: { CardListPanel, ContentPanel },
};
</script>

<style scoped>
.account-book-container {
  width: 100%;
  height: 100%;
}
</style>
