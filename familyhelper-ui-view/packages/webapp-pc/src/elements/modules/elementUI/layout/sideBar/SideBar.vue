<template>
  <div class="side-bar-container">
    <overlay-scrollbars class="scroll-bar" :options=scrollBar.options>
      <!--suppress JSUnresolvedVariable -->
      <el-menu
        text-color="#ffffff"
        active-text-color="#ffd04b"
        v-if="isMenuVisible"
        :background-color="menu.backgroundColor"
        :router="false"
        :collapse-transition="false"
        :unique-opened="true"
        @select="handleMenuSelect"
      >
        <!--suppress JSUnresolvedFunction -->
        <sidebar-item
          v-for="item in childItems(null).filter(f=>f.meta.menu.shown)"
          :key="item.key"
          :item="item"
        />
      </el-menu>
    </overlay-scrollbars>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import SidebarItem from './SidebarItem.vue';

// noinspection JSAnnotator
export default {
  name: 'SideBar',
  components: { SidebarItem },
  computed: {
    ...mapGetters('vim', ['state', 'childItems', 'item']),
    ...mapGetters('elements', ['isMenuVisible']),
  },
  data() {
    return {
      scrollBar: {
        options: {
          className: 'os-theme-light',
        },
      },
      menu: {
        backgroundColor: '#2D3A4B',
      },
    };
  },
  methods: {
    handleMenuSelect(index) {
      const item = this.item(index);
      if (item.meta.router.required) {
        this.$router.push({ name: index });
      }
    },
  },
};
</script>

<style scoped>
.side-bar-container {
  height: 100%;
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.el-menu {
  padding: 0;
  margin: 0;
  border-right: 0;
}
</style>
