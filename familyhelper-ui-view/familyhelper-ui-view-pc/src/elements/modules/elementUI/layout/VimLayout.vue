<template>
  <div class="vim-container">
    <side-bar class="vim-side-bar" v-if="isMenuVisible"/>
    <div class="vim-main-container">
      <nav-bar :class="!ezNavVisible ? 'bottom-shadow' : ''"/>
      <ez-nav-view :class="ezNavVisible ? 'bottom-shadow' : '' " v-if="ezNavVisible"/>
      <div class="router-container">
        <keep-alive>
          <router-view/>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import NavBar from './navBar/NavBar.vue';
import EzNavView from './ezNavView/EzNavView.vue';
import SideBar from './sideBar/SideBar.vue';

// noinspection JSAnnotator
export default {
  name: 'VimLayout',
  components: {
    SideBar,
    EzNavView,
    NavBar,
  },
  computed: {
    ezNavVisible() {
      return this.$vim.addons.ezNav.enabled;
    },
    ...mapGetters('elements', ['isMenuVisible']),
  },
};
</script>

<style scoped>
.vim-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.vim-side-bar {
  color: #889AA4;
  background-color: #2D3A4B;
  width: 230px;
  padding: 0;
  margin: 0;
}

.vim-main-container {
  height: 100%;
  width: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: #FFFFFF;
  color: #889AA4;
}

.router-container {
  width: 100%;
  height: 0;
  box-sizing: border-box;
  flex-grow: 1;
  padding: 20px;
}

/*noinspection CssUnusedSymbol*/
.bottom-shadow{
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
}
</style>
