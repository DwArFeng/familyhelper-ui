<template>
  <div v-if="nodePermitted">
    <div class="submenu" v-if="hasChild">
      <div class="submenu-title" @click="toggleSubmenu">
        <span class="menu-icon">
          <svg viewBox="0 0 1024 1024" width="16" height="16">
            <path
              fill="currentColor"
              d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56z"
            />
          </svg>
        </span>
        <span class="menu-text">{{ props.node.display.label }}</span>
        <span class="submenu-arrow" :class="{ 'is-open': isOpen }">▶</span>
      </div>
      <div class="submenu-content" v-show="isOpen">
        <sidebar-item
          v-for="subNode in children.filter((f) => f.menu.shown)"
          :key="subNode.key"
          :node="subNode"
          @select="handleSelect"
        />
      </div>
    </div>
    <div v-else class="menu-item" @click="handleSelect(props.node.key)">
      <span class="menu-icon">
        <svg viewBox="0 0 1024 1024" width="16" height="16">
          <path
            fill="currentColor"
            d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z"
          />
        </svg>
      </span>
      <span class="menu-text">{{ props.node.display.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import type { NavigationNodeInfo } from '@/navigation/types.ts'
import type { NavigationStore } from '@/store/modules/navigation.ts'
import type { LnpStore } from '@/store/modules/lnp.ts'

import { computed, ref } from 'vue'

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  node: NavigationNodeInfo
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
const emit = defineEmits<{
  select: [nodeKey: string]
}>()

// -----------------------------------------------------------主节点处理-----------------------------------------------------------
const nodePermitted = computed<boolean>(() => {
  if (props.node.permission.required) {
    const mayPermissionNode: string | undefined = props.node.permission.node
    if (!mayPermissionNode) {
      return false
    }
    return lnpStore.hasPermission(mayPermissionNode)
  }
  return true
})

// -----------------------------------------------------------子节点处理-----------------------------------------------------------
const hasChild = computed<boolean>(() => {
  return navigationStore.getChildNodeInfos(props.node.key).length > 0
})

const children = computed<Readonly<NavigationNodeInfo[]>>(() => {
  return navigationStore.getChildNodeInfos(props.node.key)
})

// -----------------------------------------------------------子菜单处理-----------------------------------------------------------
const isOpen = ref(false)

function toggleSubmenu() {
  isOpen.value = !isOpen.value
}

// -----------------------------------------------------------选择处理-----------------------------------------------------------
function handleSelect(nodeKey: string) {
  emit('select', nodeKey)
}
</script>

<style scoped>
.submenu,
.menu-item {
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submenu-title,
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.submenu-title:hover,
.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.menu-text {
  flex: 1;
}

.submenu-arrow {
  font-size: 12px;
  transition: transform 0.3s;
}

.submenu-arrow.is-open {
  transform: rotate(90deg);
}

.submenu-content {
  padding-left: 16px;
}
</style>
