<template>
  <el-breadcrumb class="breadcrumb-container" separator="/">
    <el-breadcrumb-item v-for="(item,index) in currentItemPath" :key="index">
      <vim-label :type="item.meta.display.labelType" :content="item.meta.display.labelContent"/>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { mapGetters } from 'vuex';

import VimLabel from '@/components/vim/VimLabel.vue';

// noinspection JSAnnotator
export default {
  name: 'Breadcrumb',
  components: { VimLabel },
  computed: {
    currentItemPath() {
      let anchorItem = this.currentItem;
      const currentItemPath = [];
      do {
        currentItemPath.splice(0, 0, anchorItem);
        anchorItem = this.parentItem(anchorItem.key);
      } while (anchorItem !== null);
      return currentItemPath;
    },
    ...mapGetters('vim', ['currentItem', 'parentItem']),
  },
};
</script>

<style scoped>
.breadcrumb-container {
  display: inline-block;
  font-size: 14px;
}

/*noinspection CssUnusedSymbol*/
.el-breadcrumb {
  margin-bottom: 0;
}
</style>
