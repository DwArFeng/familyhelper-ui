<template>
  <div class="layout-container">
    <side-bar class="side-bar" v-if="elementPlusStore.menuVisible" />
    <div class="main-container">
      <nav-bar :class="!ezNavVisible ? 'bottom-shadow' : ''" />
      <ez-nav-view :class="ezNavVisible ? 'bottom-shadow' : ''" v-if="ezNavVisible" />
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
import vim from '@/vim'

import { type ElementPlusStore } from '@/store/modules/elementPlus.ts'

import { computed } from 'vue'

import SideBar from './sideBar/SideBar.vue'
import NavBar from './navBar/NavBar.vue'
import EzNavView from './ezNavView/EzNavView.vue'

defineOptions({
  name: 'LayoutComponent',
})

// region Store 引入

const elementPlusStore = vim
  .ctx()
  .store()
  .vueStore<'element-plus', ElementPlusStore>('element-plus')

// endregion

// region NavBar 样式处理

const ezNavVisible = computed<boolean>(() => vim.ctx().navigation().setting.ezNavEnabled)

// endregion
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.side-bar {
  color: var(--element-plus-engineering-sidebar-text-color);
  background-color: var(--element-plus-engineering-sidebar-background);
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
  background-color: var(--element-plus-engineering-workbench-background);
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
  border-bottom: 1px solid var(--element-plus-engineering-navbar-border-color);
  box-shadow: var(--element-plus-engineering-panel-shadow);
}
</style>
