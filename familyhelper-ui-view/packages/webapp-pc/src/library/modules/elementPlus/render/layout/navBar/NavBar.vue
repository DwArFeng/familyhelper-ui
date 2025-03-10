<template>
  <div class="nav-bar-container">
    <hamburger class="nav-hamburger" />
    <breadcrumb class="nav-breadcrumb" />
    <div class="placeholder" />
    <digital-watch class="nav-digital-watch" />
    <div class="nav-button-group">
      <!--suppress JSUnresolvedVariable -->
      <icon-button
        class="nav-icon-button"
        :icon="elementPlusStore.fullScreen ? '\ufffd' : '\ufffc'"
        @click="handleToggleFullScreen"
      />
      <!--      <collapse-text-input theme="outline" size="32" fill="#9b9b9b" :strokeWidth="3"/>-->
    </div>
    <avatar class="nav-avatar" />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import type { ElementPlusStore } from '@/store/modules/elementPlus.ts'

import Hamburger from './Hamburger.vue'
import Breadcrumb from './Breadcrumb.vue'
import DigitalWatch from './DigitalWatch.vue'
import IconButton from './IconButton.vue'
import Avatar from './Avatar.vue'

defineOptions({
  name: 'NavBar',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const elementPlusStore = vim
  .ctx()
  .store()
  .vueStore<'element-plus', ElementPlusStore>('element-plus')

// -----------------------------------------------------------全屏切换逻辑处理-----------------------------------------------------------
function handleToggleFullScreen() {
  elementPlusStore.setFullScreen(!elementPlusStore.fullScreen)
}
</script>

<style scoped>
.nav-bar-container {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding-top: 2px;
  color: #889aa4;
}

.placeholder {
  width: 0;
  flex-grow: 1;
}

.nav-hamburger {
  height: 100%;
}

.nav-breadcrumb {
  margin-left: 8px;
}

.nav-button-group {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.nav-icon-button {
  height: 100%;
}

.nav-icon-button:first-child {
  margin-left: 12px;
}

.nav-icon-button:last-child {
  margin-right: 12px;
}

.nav-avatar {
  height: 100%;
  margin-right: 12px;
}
</style>
