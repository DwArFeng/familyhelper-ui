<template>
  <div class="side-bar-container">
    <div class="scroll-bar">
      <nav class="menu">
        <sidebar-item
          v-for="node in navigationStore
            .getChildNodeInfos(null)
            .filter((f) => f.menu.shown)
            .sort((a, b) => a.index - b.index)"
          :key="node.key"
          :node="node"
          @select="handleMenuSelect"
        />
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type NavigationStore } from '@/store/modules/navigation.ts'
import { type NavigationNodeInfo } from '@/navigation/types.ts'

import SidebarItem from './SidebarItem.vue'

defineOptions({
  name: 'SideBar',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')

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

.scroll-bar {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.scroll-bar::-webkit-scrollbar {
  width: 6px;
}

.scroll-bar::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-bar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.menu {
  padding: 0;
  margin: 0;
  list-style: none;
  color: #ffffff;
}
</style>
