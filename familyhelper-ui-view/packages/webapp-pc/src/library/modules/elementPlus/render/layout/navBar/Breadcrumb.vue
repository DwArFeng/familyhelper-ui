<template>
  <el-breadcrumb class="breadcrumb-container" separator="/">
    <el-breadcrumb-item v-for="(node, index) in currentNodePath" :key="index">
      <span>{{ node.display.label }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type NavigationStore } from '@/store/modules/navigation.ts'

import { computed } from 'vue'
import { type NavigationNodeInfo } from '@/navigation/types.ts'

defineOptions({
  name: 'BreadcrumbComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')

// -----------------------------------------------------------节点处理-----------------------------------------------------------
const currentNodePath = computed<NavigationNodeInfo[]>(() => {
  // 获取当前节点路径。
  let anchorNode: NavigationNodeInfo | null = navigationStore.getNodeInfo(
    navigationStore.currentNodeKey,
  )
  const currentNodePathList: NavigationNodeInfo[] = []
  // 使用循环获取当前节点路径。
  while (anchorNode) {
    currentNodePathList.splice(0, 0, anchorNode)
    if (anchorNode && anchorNode.parentKey) {
      anchorNode = navigationStore.getNodeInfo(anchorNode.parentKey)
    } else {
      anchorNode = null
    }
  }
  // 返回结果。
  return currentNodePathList
})
</script>

<style scoped>
.breadcrumb-container {
  display: inline-block;
  font-size: 14px;
}

/*noinspection CssUnusedSymbol*/
.el-breadcrumb {
  margin-bottom: 0;
}
</style>
