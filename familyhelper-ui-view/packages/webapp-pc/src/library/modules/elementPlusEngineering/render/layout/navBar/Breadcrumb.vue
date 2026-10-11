<template>
  <el-breadcrumb class="breadcrumb-container" separator="/">
    <el-breadcrumb-item v-for="(node, index) in currentNodePath" :key="index">
      <span>{{ parseLabel(node.display, t) }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type NavigationStore } from '@/store/modules/navigation.ts'

import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

import { type NodeInfo } from '@/navigation/types.ts'

import { parseLabel } from '@/library/modules/elementPlusEngineering/util/display.ts'

defineOptions({
  name: 'BreadcrumbComponent',
})

// region I18n 引入

const { t } = useI18n()

// endregion

// region Store 引入

const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')

// endregion

// region 节点处理

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

// endregion
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
