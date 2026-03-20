<template>
  <div class="breadcrumb-container">
    <div class="breadcrumb">
      <span v-for="(node, index) in currentNodePath" :key="index" class="breadcrumb-item">
        <span class="breadcrumb-text">{{ node.display[visualizerKey].label }}</span>
        <span v-if="index < currentNodePath.length - 1" class="breadcrumb-separator">/</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type NavigationStore } from '@/store/modules/navigation.ts'

import { computed } from 'vue'
import { type NodeInfo } from '@/navigation/types.ts'

defineOptions({
  name: 'BreadcrumbComponent',
})

// -----------------------------------------------------------Router 引入-----------------------------------------------------------
const router = vim.ctx().router().vueRouter()

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')

// -----------------------------------------------------------可视化键处理-----------------------------------------------------------
const visualizerKey = computed<string>(
  () => (router.currentRoute.value.meta.visualizerKey as string) ?? '',
)

// -----------------------------------------------------------节点处理-----------------------------------------------------------
const currentNodePath = computed<NodeInfo[]>(() => {
  // 获取当前节点路径。
  let anchorNode: NodeInfo | null = navigationStore.getNodeInfo(navigationStore.currentNodeKey)
  const currentNodePathList: NodeInfo[] = []
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

.breadcrumb {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-text {
  color: #606266;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #c0c4cc;
}

.breadcrumb-item:last-child .breadcrumb-text {
  color: #303133;
  font-weight: 500;
}
</style>
