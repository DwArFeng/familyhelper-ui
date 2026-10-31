<template>
  <div class="side-bar-container">
    <div v-if="logoVisible" class="sidebar-logo-container" :style="sidebarLogoContainerStyle">
      <img class="sidebar-logo-image" :src="logoObjectUrl ?? undefined" alt="" />
    </div>
    <overlay-scrollbars-component class="scroll-bar" :options="scrollBarOptions">
      <el-menu
        :router="false"
        :collapse-transition="false"
        :unique-opened="true"
        @select="handleMenuSelect"
      >
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

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { type CustomizeStore } from '@/store/modules/customize.ts'
import { type NavigationStore } from '@/store/modules/navigation.ts'

import {
  readElementPlusEngineeringCustomizeSidebarLogoConfig,
  readElementPlusEngineeringCustomizeSidebarLogoContainerBackground,
  resolveElementPlusEngineeringCustomizeSidebarLogoUrl,
  revokeElementPlusEngineeringCustomizeObjectUrl,
} from '@/library/modules/elementPlusEngineering/util/customize.ts'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import SidebarItem from './SidebarItem.vue'
import { type NodeInfo } from '@/navigation/types.ts'

defineOptions({
  name: 'SideBar',
})

// region Store 引入

const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')

// endregion

// region 侧栏 Logo 定制

const customizeStore = vim.ctx().store().vueStore<'customize', CustomizeStore>('customize')

const logoVisible = ref<boolean>(false)
const logoObjectUrl = ref<string | null>(null)

const sidebarLogoContainerStyle = computed(() => {
  void customizeStore.customizeItem
  const readValue = (key: string): string | null => customizeStore.customizeValue(key).value
  return {
    backgroundColor: readElementPlusEngineeringCustomizeSidebarLogoContainerBackground(readValue),
  }
})

let sidebarLogoObjectUrl: string | null = null
let sidebarLogoLoadGeneration = 0

async function reloadSidebarLogo(): Promise<void> {
  const generation = ++sidebarLogoLoadGeneration
  const readValue = (key: string): string | null => customizeStore.customizeValue(key).value
  const config = readElementPlusEngineeringCustomizeSidebarLogoConfig(readValue)
  const resolvedUrl = await resolveElementPlusEngineeringCustomizeSidebarLogoUrl(config)
  if (generation !== sidebarLogoLoadGeneration) {
    revokeElementPlusEngineeringCustomizeObjectUrl(resolvedUrl)
    return
  }
  revokeElementPlusEngineeringCustomizeObjectUrl(sidebarLogoObjectUrl)
  sidebarLogoObjectUrl = resolvedUrl
  logoObjectUrl.value = resolvedUrl
  logoVisible.value = resolvedUrl !== null
}

watch(
  () => customizeStore.customizeItem,
  () => {
    void reloadSidebarLogo()
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  void reloadSidebarLogo()
})

onBeforeUnmount(() => {
  sidebarLogoLoadGeneration += 1
  revokeElementPlusEngineeringCustomizeObjectUrl(sidebarLogoObjectUrl)
  sidebarLogoObjectUrl = null
  logoObjectUrl.value = null
  logoVisible.value = false
})

// endregion

// region 滚动条处理

const scrollBarOptions = {
  scrollbars: {
    theme: 'os-theme-light',
  },
}

// endregion

// region 选择事件处理

function handleMenuSelect(nodeKey: string): void {
  const nodeInfo: Readonly<NodeInfo> | null = navigationStore.getNodeInfo(nodeKey)
  if (!nodeInfo) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (nodeInfo.router.required) {
    vim.ctx().router().vueRouter().push({ name: nodeInfo.key })
  }
}

// endregion
</script>

<style scoped>
.side-bar-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo-container {
  flex-shrink: 0;
  width: 100%;
  max-height: 84px;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.sidebar-logo-image {
  width: 100%;
  max-height: 84px;
  margin: 0;
  padding: 0;
  object-fit: contain;
  display: block;
}

.scroll-bar {
  flex-grow: 1;
  min-height: 0;
}

/*noinspection CssUnusedSymbol*/
.el-menu {
  --el-menu-text-color: var(--element-plus-engineering-sidebar-text-color);
  --el-menu-active-color: var(--element-plus-engineering-sidebar-active-text-color);
  --el-menu-bg-color: var(--element-plus-engineering-sidebar-background);
  padding: 0;
  margin: 0;
  border-right: 0;
}
</style>
