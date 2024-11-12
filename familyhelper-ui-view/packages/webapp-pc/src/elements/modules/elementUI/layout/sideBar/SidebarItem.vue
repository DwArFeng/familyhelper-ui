<template>
  <div v-if="itemPermitted">
    <!--suppress JSUnresolvedReference -->
    <el-submenu :index="item.key" v-if="hasChild">
      <template v-slot:title>
        <!--suppress JSUnresolvedReference -->
        <vim-icon :type="item.meta.display.iconType" :content="item.meta.display.iconContent"/>
        <!--suppress JSUnresolvedReference -->
        <vim-label :type="item.meta.display.labelType" :content="item.meta.display.labelContent"/>
      </template>
      <!--suppress JSUnresolvedReference -->
      <sidebar-item
        v-for="subItem in childItems(item.key).filter(f=>f.meta.menu.shown)"
        :key="subItem.key"
        :item="subItem"
      />
    </el-submenu>
    <!--suppress JSUnresolvedReference -->
    <el-menu-item :index="item.key" v-else>
      <!--suppress JSUnresolvedReference -->
      <vim-icon :type="item.meta.display.iconType" :content="item.meta.display.iconContent"/>
      <!--suppress JSUnresolvedReference -->
      <vim-label :type="item.meta.display.labelType" :content="item.meta.display.labelContent"/>
    </el-menu-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import VimIcon from '@/components/vim/VimIcon.vue';
import VimLabel from '@/components/vim/VimLabel.vue';

// noinspection JSAnnotator
export default {
  name: 'SidebarItem',
  components: { VimIcon, VimLabel },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    itemPermitted() {
      if (this.item.meta.permission.required) {
        return this.hasPermission(this.item.meta.permission.node);
      }
      return true;
    },
    hasChild() {
      return this.childItems(this.item.key).length > 0;
    },
    ...mapGetters('lnp', ['hasPermission']),
    ...mapGetters('vim', ['childItems']),
  },
  mounted() {
  },
};
</script>
