<template>
  <el-dropdown class="avatar-container" trigger="click" @command="handleCommand">
    <template v-slot:default>
      <div class="avatar-wrapper">
        <el-badge class="item" :is-dot="notificationStore.unreadCount > 0">
          <avatar-panel
            class="avatar"
            render-mode="BY_ID"
            :size="40"
            :object-user-id="lnpStore.me"
            :placeholder-font-size="14"
          />
        </el-badge>
      </div>
    </template>
    <!--suppress VueUnrecognizedSlot -->
    <template v-slot:dropdown>
      <el-dropdown-menu class="dropdown-menu">
        <el-dropdown-item command="welcome">
          <span>首页</span>
        </el-dropdown-item>
        <el-dropdown-item command="notification" divided>
          <el-badge
            :class="notificationStyle"
            :value="notificationStore.unreadCount"
            :max="99"
            :hidden="notificationStore.unreadCount === 0"
          >
            <span>消息</span>
          </el-badge>
        </el-dropdown-item>
        <el-dropdown-item command="logout" divided>
          <span>登出</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed } from 'vue'

import { type NotificationStore } from '@/store/modules/notification.ts'
import { type LnpStore } from '@/store/modules/lnp.ts'

import AvatarPanel from '@/components/avatar/avatarPanel/AvatarPanel.vue'

defineOptions({
  name: 'AvatarComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const notificationStore = vim
  .ctx()
  .store()
  .vueStore<'notification', NotificationStore>('notification')
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// 通知处理。
const notificationStyle = computed(() => {
  if (notificationStore.unreadCount === 0) {
    return ''
  }
  if (notificationStore.unreadCount < 10) {
    return 'notify'
  }
  return 'long-notify'
})

// -----------------------------------------------------------下拉菜单命令处理-----------------------------------------------------------
function handleCommand(key: string): void {
  switch (key) {
    case 'welcome':
      handleWelcomeCommand()
      break
    case 'notification':
      handleNotificationCommand()
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

function handleNotificationCommand(): void {
  const router = vim.ctx().router().vueRouter()
  router.push({ name: 'notifyManagement.notification' })
}

function handleLogoutCommand(): void {
  lnpStore
    .willLogout()
    .execute()
    .catch(() => {})
}
</script>

<style scoped>
.avatar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  box-sizing: content-box;
  transition: background 0.3s;
}

.avatar-wrapper:hover {
  background: rgba(0, 0, 0, 0.025);
}

.avatar {
  cursor: pointer;
}

.dropdown-menu span {
  display: block;
}

/*noinspection CssUnusedSymbol*/
.dropdown-menu .notify {
  margin-top: 7px;
}

/*noinspection CssUnusedSymbol*/
.dropdown-menu .long-notify {
  margin-top: 7px;
  margin-right: 11px;
}
</style>
