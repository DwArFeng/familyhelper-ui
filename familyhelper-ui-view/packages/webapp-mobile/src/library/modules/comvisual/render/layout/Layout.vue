<template>
  <div class="layout-container">
    <side-bar class="side-bar" />
    <div class="main-container">
      <nav-bar />
      <ez-nav-view />
      <div class="router-container">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './sideBar/SideBar.vue'
import NavBar from './navBar/NavBar.vue'
import EzNavView from './ezNavView/EzNavView.vue'

defineOptions({
  name: 'LayoutComponent',
})
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.side-bar {
  color: #889aa4;
  background-color: #2d3a4b;
  width: 230px;
  padding: 0;
  margin: 0;
}

.main-container {
  height: 100%;
  width: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: #ffffff;
}

.router-container {
  width: 100%;
  height: 0;
  box-sizing: border-box;
  flex-grow: 1;
  padding: 20px;
  color: unset;
}

/*noinspection CssUnusedSymbol*/
.bottom-shadow {
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);
}
</style>
