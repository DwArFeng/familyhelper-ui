<template>
  <div class="hamburger-container" @click="toggleClick">
    <svg
      :class="{ 'is-active': elementPlusStore.menuVisible }"
      class="hamburger"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
    >
      <path
        d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0
      4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4
      0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6
      8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6
      8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4
      381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type ElementPlusStore } from '@/store/modules/elementPlus.ts'

defineOptions({
  name: 'HamburgerComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const elementPlusStore = vim
  .ctx()
  .store()
  .vueStore<'element-plus', ElementPlusStore>('element-plus')

// -----------------------------------------------------------菜单可视化处理-----------------------------------------------------------
function toggleClick(): void {
  elementPlusStore.setMenuVisible(!elementPlusStore.menuVisible)
}
</script>

<style scoped>
.hamburger-container {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;
  padding: 0 15px;
}

.hamburger-container:hover {
  background: rgba(0, 0, 0, 0.025);
}

.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

.hamburger.is-active {
  transform: rotate(180deg);
}
</style>
