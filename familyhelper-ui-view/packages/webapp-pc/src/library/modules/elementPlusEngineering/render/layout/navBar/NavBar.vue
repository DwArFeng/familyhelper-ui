<template>
  <div class="nav-bar-container">
    <hamburger class="nav-hamburger" />
    <breadcrumb class="nav-breadcrumb" />
    <div class="placeholder" />
    <digital-watch class="nav-digital-watch" />
    <div class="nav-button-group">
      <!--suppress JSUnresolvedVariable -->
      <icon-button class="nav-icon-button" :icon="'\uffc7'" @click="handleShowThemeSelectDialog" />
      <icon-button class="nav-icon-button" :icon="'\uffc8'" @click="handleShowI18nSelectDialog" />
      <icon-button
        class="nav-icon-button"
        :icon="elementPlusStore.fullScreen ? '\ufffd' : '\ufffc'"
        @click="handleToggleFullScreen"
      />
    </div>
    <avatar class="nav-avatar" />
    <theme-select-dialog v-model:visible="themeSelectDialogVisible" />
    <i18n-select-dialog v-model:visible="i18nSelectDialogVisible" />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { ref } from 'vue'

import { type ElementPlusStore } from '@/store/modules/elementPlus.ts'

import Hamburger from './Hamburger.vue'
import Breadcrumb from './Breadcrumb.vue'
import DigitalWatch from './DigitalWatch.vue'
import IconButton from './IconButton.vue'
import Avatar from './Avatar.vue'
import ThemeSelectDialog from './ThemeSelectDialog.vue'
import I18nSelectDialog from './I18nSelectDialog.vue'

defineOptions({
  name: 'NavBar',
})

// region Store 引入

const elementPlusStore = vim
  .ctx()
  .store()
  .vueStore<'element-plus', ElementPlusStore>('element-plus')

// endregion

// region 主题选择对话框处理

const themeSelectDialogVisible = ref<boolean>(false)

function handleShowThemeSelectDialog(): void {
  themeSelectDialogVisible.value = true
}

// endregion

// region 国际化选择对话框处理

const i18nSelectDialogVisible = ref<boolean>(false)

function handleShowI18nSelectDialog(): void {
  i18nSelectDialogVisible.value = true
}

// endregion

// region 全屏切换逻辑处理

function handleToggleFullScreen(): void {
  elementPlusStore.setFullScreen(!elementPlusStore.fullScreen)
}

// endregion
</script>

<style scoped>
.nav-bar-container {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  background-color: var(--element-plus-engineering-navbar-background);
  box-shadow: var(--element-plus-engineering-navbar-shadow);
  padding-top: 2px;
  color: var(--element-plus-engineering-navbar-text-color);
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
