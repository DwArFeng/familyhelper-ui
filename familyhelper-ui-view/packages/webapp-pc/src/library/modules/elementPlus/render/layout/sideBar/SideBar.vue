<template>
  <div class="side-bar-container">
    <overlay-scrollbars-component class="scroll-bar" :options="scrollBarOptions">
      <!--suppress JSUnresolvedVariable -->
      <el-menu
        text-color="#ffffff"
        active-text-color="#ffd04b"
        :background-color="menuBackgroundColor"
        :router="false"
        :collapse-transition="false"
        :unique-opened="true"
        @select="handleMenuSelect"
      >
        <!--suppress JSUnresolvedFunction -->
        <sidebar-item
          v-for="node in navigationStore
            .getChildNodeInfos(null)
            .filter((f) => f.menu.shown)
            .sort((a, b) => a.index - b.index)"
          :key="node.key"
          :node="node"
        />
      </el-menu>
    </overlay-scrollbars-component>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type NavigationStore } from '@/store/modules/navigation.ts'

import { ref } from 'vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import SidebarItem from './SidebarItem.vue'
import { type NavigationNodeInfo } from '@/navigation/types.ts'

defineOptions({
  name: 'SideBar',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')

// -----------------------------------------------------------滚动条处理-----------------------------------------------------------
const scrollBarOptions = ref({
  scrollbars: {
    theme: 'os-theme-light',
  },
})

// -----------------------------------------------------------菜单处理-----------------------------------------------------------
const menuBackgroundColor = ref('#2D3A4B')

// -----------------------------------------------------------选择事件处理-----------------------------------------------------------
function handleMenuSelect(nodeKey: string): void {
  const nodeInfo: Readonly<NavigationNodeInfo> | null = navigationStore.getNodeInfo(nodeKey)
  if (!nodeInfo) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (nodeInfo.router.required) {
    vim.ctx().router().vueRouter().push({ name: nodeInfo.key })
  }
}
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
