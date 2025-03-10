<template>
  <div class="avatar-container" ref="avatarRef">
    <div class="avatar-wrapper" @click.stop="toggleDropdown">
      <svg class="avatar-icon" viewBox="0 0 24 24" width="22" height="22">
        <path
          fill="currentColor"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
        />
      </svg>
    </div>
    <Teleport to="body">
      <div v-show="dropdownVisible" class="dropdown-menu" :style="dropdownPosition">
        <div class="dropdown-item" @click.stop="handleCommand('welcome')">
          <span>首页</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item" @click.stop="handleCommand('logout')">
          <span>登出</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

import { ref, onMounted, onUnmounted, computed, type ComputedRef } from 'vue'

defineOptions({
  name: 'AvatarComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------状态处理-----------------------------------------------------------
const dropdownVisible = ref(false)
const avatarRef = ref<HTMLElement | null>(null)

const dropdownPosition: ComputedRef<Record<string, string>> = computed(() => {
  if (!avatarRef.value) {
    return {} as Record<string, string>
  }
  const rect = avatarRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
})

function toggleDropdown(event: MouseEvent) {
  event.stopPropagation()
  dropdownVisible.value = !dropdownVisible.value
}

function handleClickOutside(event: MouseEvent) {
  if (avatarRef.value && !avatarRef.value.contains(event.target as Node)) {
    dropdownVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// -----------------------------------------------------------下拉菜单命令处理-----------------------------------------------------------
function handleCommand(key: string) {
  dropdownVisible.value = false
  switch (key) {
    case 'welcome':
      handleWelcomeCommand()
      break
    case 'logout':
      handleLogoutCommand()
      break
    default:
  }
}

function handleWelcomeCommand(): void {
  const router = vim.ctx().router().vueRouter()
  router.push({ name: 'vim.layout' })
}

function handleLogoutCommand(): void {
  lnpStore
    .willLogout()
    .execute()
    .catch(() => {})
}
</script>

<style scoped>
.avatar-container {
  height: 100%;
}

.avatar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  box-sizing: content-box;
  transition: background 0.3s;
  cursor: pointer;
}

.avatar-wrapper:hover {
  background: rgba(0, 0, 0, 0.025);
}

.avatar-icon {
  width: 22px;
  height: 22px;
  color: #606266;
  transition: color 0.3s;
}

.avatar-wrapper:hover .avatar-icon {
  color: #409eff;
}

.dropdown-menu {
  height: auto;
  width: 100px;
  min-width: 120px;
  padding: 4px 0;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 15000;
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.dropdown-divider {
  height: 1px;
  margin: 4px 0;
  background-color: #e4e7ed;
}
</style>
