<template>
  <div class="ez-nav-container" ref="rootRef">
    <div class="router-link-container-wrapper">
      <div class="loading" v-if="navigationEzNavStore.loading > 0">
        <span>正在加载，请稍候...</span>
        <div class="deep-clean-panel">
          <span>加载失败？</span>
          <span class="span-link" @click="deepCleanWithoutPrompt">点击此处</span>
          <span>进行深度清理</span>
        </div>
      </div>
      <div class="router-link-container" v-else>
        <div
          class="ez-nav-item"
          ref="routerLinkRef"
          :class="navigationStore.isCurrentNode(node.key) ? 'active' : ''"
          v-for="node in navigationEzNavStore.navigationNodes"
          :key="node.key"
          @click="handleNavigation(node.key)"
          @contextmenu.prevent="openMenu(node.key, $event)"
        >
          <span class="prefix-icon" v-if="navigationEzNavStore.annotation(node.key) === 'affix'">
            <svg viewBox="0 0 1024 1024" width="12" height="12">
              <path
                fill="currentColor"
                d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240z m460 600H232V536h560v304z"
              />
            </svg>
          </span>
          <span class="prefix-icon" v-if="navigationEzNavStore.annotation(node.key) === 'pinned'">
            <svg viewBox="0 0 1024 1024" width="12" height="12">
              <path
                fill="currentColor"
                d="M574 665.4a8.03 8.03 0 0 0-11.3 0L446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3l-39.8-39.8a8.03 8.03 0 0 0-11.3 0L191.4 526.5c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3L574 665.4zm258.6-474c-84.6-84.6-221.5-84.6-306 0L410.3 307.6a8.03 8.03 0 0 0 0 11.3l39.7 39.7c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204L665.3 562.6a8.03 8.03 0 0 0 0 11.3l39.8 39.8c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c84.5-84.6 84.5-221.5 0-306.1z"
              />
            </svg>
          </span>
          <span>{{ node.display.label }}</span>
          <span
            class="close-icon"
            v-if="navigationEzNavStore.annotation(node.key) === 'active'"
            @click.stop="handleRemove(node.key)"
          >
            <svg viewBox="0 0 1024 1024" width="12" height="12">
              <path
                fill="currentColor"
                d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
    <div
      class="contextmenu"
      v-if="contextmenu.visible"
      ref="contextmenuRef"
      tabindex="0"
      :style="{ left: contextmenu.left + 'px', top: contextmenu.top + 'px' }"
      @blur="closeMenu"
    >
      <div
        class="contextmenu-item"
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'active'"
        @click="handlePinContextMenuItemClicked"
      >
        固定
      </div>
      <div
        class="contextmenu-item"
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'pinned'"
        @click="handleUnpinContextMenuItemClicked"
      >
        解除固定
      </div>
      <div
        class="contextmenu-item"
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'pinned'"
        @click="handleUnpinAndCloseContextMenuItemClicked"
      >
        解除固定并清除
      </div>
      <div
        class="contextmenu-item"
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'active'"
        @click="handleRemoveNodeKeyContextMenuItemClicked"
      >
        清除
      </div>
      <div
        class="contextmenu-item"
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'active'"
        @click="handleClearOtherContextMenuItemClicked"
      >
        清除其它
      </div>
      <div
        class="contextmenu-item"
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'active'"
        @click="handleClearActiveContextMenuItemClicked"
      >
        清除所有
      </div>
      <div class="contextmenu-item" @click="handleNavigationContextMenuItemClicked">转到</div>
      <div
        class="contextmenu-item"
        v-if="lnpStore.hasPermission('action.eznav.mobile.deep_clean')"
        @click="handleDeepCleanContextMenuItemClicked"
      >
        深度清理
      </div>
    </div>
    <div v-if="contextmenu.visible" class="contextmenu-modal" />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import type { NavigationEzNavStore } from '@/store/modules/navigationEzNav.ts'
import type { NavigationStore } from '@/store/modules/navigation.ts'
import type { NavigationNodeInfo } from '@/navigation/types.ts'
import type { LnpStore } from '@/store/modules/lnp.ts'

import { ref, onMounted, onUnmounted, nextTick } from 'vue'

import type { RouteLocationRaw } from 'vue-router'

defineOptions({
  name: 'EzNavView',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const navigationEzNavStore = vim
  .ctx()
  .store()
  .vueStore<'navigation-ez-nav', NavigationEzNavStore>('navigation-ez-nav')
const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------急救操作-----------------------------------------------------------

function deepCleanWithoutPrompt(): void {
  Promise.resolve()
    .then(() => navigationEzNavStore.clearAll())
    .then(() => {
      vim.ctx().router().vueRouter().push({ name: 'vim.layout' })
    })
    .catch(() => {})
}

// -----------------------------------------------------------Router Link 常规操作-----------------------------------------------------------
// 导航处理。
function handleNavigation(nodeKey: string): void {
  const { params, query } = navigationEzNavStore.nodeMeta(nodeKey)
  const location = { name: nodeKey, params, query } as RouteLocationRaw
  vim.ctx().router().vueRouter().push(location)
}

// 删除处理。
function handleRemove(nodeKey: string): void {
  // 在导航栏中删除 nodeKey。
  navigationEzNavStore.removeNodeKey(nodeKey)

  // 获取 nodeKey 对应的元数据，分析关闭行为。
  const nodeInfo: NavigationNodeInfo | null = navigationStore.getNodeInfo(nodeKey)
  if (!nodeInfo) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const closedActionType: string = nodeInfo.ezNav.closedBehavior?.type ?? 'none'

  // 根据不同的行为执行不同的退出动作。
  navigationEzNavStore.setBacking(navigationEzNavStore.backing + 1)
  switch (closedActionType) {
    case 'back':
      handleCloseBack(nodeKey)
      break
    case 'default':
      handleCloseDefault()
      break
    case 'none':
    default:
      break
  }
  navigationEzNavStore.setBacking(navigationEzNavStore.backing - 1)
}

function handleCloseBack(nodeKey: string): void {
  const backNodeKey: string = navigationEzNavStore.nodeBack(nodeKey)
  const { params, query } = navigationEzNavStore.nodeMeta(backNodeKey)
  const location = { name: backNodeKey, params, query } as RouteLocationRaw
  vim.ctx().router().vueRouter().push(location)
}

function handleCloseDefault(): void {
  vim.ctx().router().vueRouter().push({ name: vim.ctx().navigation().setting.defaultNavigationKey })
}

// -----------------------------------------------------------Router Link 菜单操作-----------------------------------------------------------
type ContextMenu = {
  visible: boolean
  left: number
  top: number
  nodeKey: string
}

const contextmenu = ref<ContextMenu>({
  visible: false,
  left: 0,
  top: 0,
  nodeKey: '',
})

const contextmenuRef = ref()
const routerLinkRef = ref()
const rootRef = ref()

// 打开菜单。
function openMenu(nodeKey: string, e: MouseEvent): void {
  contextmenu.value.nodeKey = nodeKey

  const menuMinWidth: number = 120
  const boundingClientRect = rootRef.value.getBoundingClientRect()
  const offsetLeft = boundingClientRect.left
  const offsetWidth = rootRef.value.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth // left boundary
  const left = e.clientX - offsetLeft + 15 // 15: margin right

  if (left > maxLeft) {
    contextmenu.value.left = maxLeft
  } else {
    contextmenu.value.left = left
  }

  const offsetTop = boundingClientRect.top // container margin left
  contextmenu.value.top = e.clientY - offsetTop

  contextmenu.value.visible = true

  nextTick(() => {
    contextmenuRef.value.focus()
  })
}

function closeMenu(): void {
  contextmenu.value.visible = false
}

function handlePinContextMenuItemClicked(): void {
  closeMenu()
  navigationEzNavStore.pin(contextmenu.value.nodeKey)
}

function handleUnpinContextMenuItemClicked(): void {
  closeMenu()
  navigationEzNavStore.unpin(contextmenu.value.nodeKey)
}

function handleUnpinAndCloseContextMenuItemClicked(): void {
  closeMenu()
  navigationEzNavStore.unpin(contextmenu.value.nodeKey)
  navigationEzNavStore.removeNodeKey(contextmenu.value.nodeKey)
}

function handleRemoveNodeKeyContextMenuItemClicked(): void {
  closeMenu()
  navigationEzNavStore.removeNodeKey(contextmenu.value.nodeKey)
}

function handleClearOtherContextMenuItemClicked(): void {
  closeMenu()
  navigationEzNavStore.clearActive()
  navigationEzNavStore.pushNodeKey(contextmenu.value.nodeKey)
}

function handleClearActiveContextMenuItemClicked(): void {
  closeMenu()
  navigationEzNavStore.clearActive()
}

function handleNavigationContextMenuItemClicked(): void {
  closeMenu()
  handleNavigation(contextmenu.value.nodeKey)
}

function handleDeepCleanContextMenuItemClicked(): void {
  closeMenu()
  if (
    confirm(
      '该操作将会清空您所有与导航栏相关的缓存的数据。\n这将使您的导航栏全部清空，包括固定导航栏与活动导航栏\n是否继续?',
    )
  ) {
    navigationEzNavStore.clearAll()
    vim.ctx().router().vueRouter().push({ name: 'vim.layout' })
  }
}

// -----------------------------------------------------------快捷键处理-----------------------------------------------------------
function addHotKeyListener(): void {
  document.body.addEventListener('keydown', handleHotKeyDown)
}

function removeHotKeyListener(): void {
  document.body.removeEventListener('keydown', handleHotKeyDown)
}

function handleHotKeyDown($event: KeyboardEvent): void {
  // ctrl + alt + leftArrow
  if ($event.key === 'ArrowLeft' && $event.ctrlKey && $event.altKey) {
    mayBackward()
  }
  // ctrl + alt + rightArrow
  if ($event.key === 'ArrowRight' && $event.ctrlKey && $event.altKey) {
    mayForward()
  }
}

function mayBackward(): void {
  if (navigationEzNavStore.loading > 0) {
    return
  }
  const index = currentIndex()
  if (index < 0) {
    return
  }
  if (index === 0) {
    return
  }
  jumpToIndex(index - 1)
}

function mayForward(): void {
  if (navigationEzNavStore.loading > 0) {
    return
  }
  const index = currentIndex()
  if (index < 0) {
    return
  }
  if (index === navigationEzNavStore.navigationNodes.length - 1) {
    return
  }
  jumpToIndex(index + 1)
}

function currentIndex(): number {
  const navigationNodeKeys: string[] = navigationEzNavStore.navigationNodes.map((node) => node.key)
  return navigationNodeKeys.indexOf(navigationStore.currentNodeKey)
}

function jumpToIndex(index: number): void {
  const nodeKey: string = navigationEzNavStore.navigationNodes[index].key
  const { params, query } = navigationEzNavStore.nodeMeta(nodeKey)
  const location = { name: nodeKey, params, query } as RouteLocationRaw
  vim.ctx().router().vueRouter().push(location)
}

onMounted(() => {
  addHotKeyListener()
})

onUnmounted(() => {
  removeHotKeyListener()
})
</script>

<style scoped>
.ez-nav-container {
  height: fit-content;
  width: 100%;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  border-bottom: 1px solid #e4e7ed;
  z-index: 99;
}

.router-link-container-wrapper {
  width: 100%;
  min-height: 32px;
}

.router-link-container-wrapper .loading {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0 14px;
  padding: 1px 0;
  line-height: 30px;
  font-size: 14px;
  user-select: none;
}

.router-link-container-wrapper .loading .deep-clean-panel {
  display: inline-block;
}

.router-link-container-wrapper .loading .deep-clean-panel .span-link {
  color: #409eff;
  cursor: pointer;
  margin: 0 4px;
}

.router-link-container-wrapper .loading .deep-clean-panel .span-link:hover {
  text-decoration: underline;
}

.router-link-container {
  height: fit-content;
  width: fit-content;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: flex-end;
  box-sizing: border-box;
  margin: 0 14px;
  padding: 1px 0;
}

.ez-nav-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  border: 1px solid #d8dce5;
  color: #495060;
  background: #fff;
  padding: 0 8px;
  font-size: 12px;
  white-space: nowrap;
  margin: 1px 1px;
  column-gap: 4px;
}

.ez-nav-item.active {
  background-color: #42b983;
  color: #fff;
  border-color: #42b983;
}

.ez-nav-item span {
  user-select: none;
}

.prefix-icon {
  width: 14px;
  height: 14px;
  vertical-align: 2px;
  border-radius: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  width: 14px;
  height: 14px;
  vertical-align: 2px;
  border-radius: 50%;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  transform-origin: 100% 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon:hover {
  background-color: #b4bccc;
  color: #fff;
}

.contextmenu {
  width: 120px;
  min-width: 120px;
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  font-size: 12px;
  font-weight: 400;
  color: #333;
}

.contextmenu:focus {
  outline: none;
}

.contextmenu-item {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.contextmenu-item:hover {
  background: #f5f7fa;
}

.contextmenu-modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 2999;
}
</style>
