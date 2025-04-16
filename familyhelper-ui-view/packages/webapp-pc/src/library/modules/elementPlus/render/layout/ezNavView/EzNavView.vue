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
          <el-icon
            class="prefix-icon"
            v-if="navigationEzNavStore.annotation(node.key) === 'affix'"
            :size="12"
          >
            <lock-icon />
          </el-icon>
          <el-icon
            class="prefix-icon"
            v-if="navigationEzNavStore.annotation(node.key) === 'pinned'"
            :size="12"
          >
            <link-icon />
          </el-icon>
          <span>{{ node.display.label }}</span>
          <el-icon
            class="close-icon"
            v-if="navigationEzNavStore.annotation(node.key) === 'active'"
            :size="12"
            @click.stop="handleRemove(node.key)"
          >
            <close-icon />
          </el-icon>
        </div>
      </div>
    </div>
    <ul
      v-if="contextmenu.visible"
      ref="contextmenuRef"
      class="contextmenu"
      tabindex="0"
      :style="{ left: contextmenu.left + 'px', top: contextmenu.top + 'px' }"
      @blur="closeMenu"
    >
      <li
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'active'"
        @click="handlePinContextMenuItemClicked"
      >
        固定
      </li>
      <li
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'pinned'"
        @click="handleUnpinContextMenuItemClicked"
      >
        解除固定
      </li>
      <li
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'pinned'"
        @click="handleUnpinAndCloseContextMenuItemClicked"
      >
        解除固定并清除
      </li>
      <li
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'active'"
        @click="handleRemoveNodeKeyContextMenuItemClicked"
      >
        清除
      </li>
      <li
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'active'"
        @click="handleClearOtherContextMenuItemClicked"
      >
        清除其它
      </li>
      <li
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) === 'active'"
        @click="handleClearActiveContextMenuItemClicked"
      >
        清除所有
      </li>
      <li
        v-if="navigationEzNavStore.annotation(contextmenu.nodeKey) !== 'affix'"
        @click="handleShowEditDialogContextMenuItemClicked"
      >
        调整顺序...
      </li>
      <li @click="handleNavigationContextMenuItemClicked">转到</li>
      <li
        v-if="lnpStore.hasPermission('action.eznav.pc.deep_clean')"
        @click="handleDeepCleanContextMenuItemClicked"
      >
        深度清理
      </li>
    </ul>
    <div v-if="contextmenu.visible" class="contextmenu-modal" />
    <el-dialog
      class="edit-dialog-container"
      ref="dialog"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="编辑快捷导航栏"
      top="6vh"
      width="40%"
      v-model="editDialogVisible"
      :close-on-click-modal="false"
      @keydown="handleEditDialogHotKeyDown"
    >
      <template #default>
        <div class="editor-container">
          <div class="editor-column">
            <span class="editor-title">固定标签</span>
            <draggable-component
              class="editor-dragger"
              item-key="key"
              :list="editorDialogPinnedNavigationNodes"
              :group="{ name: 'nav' }"
            >
              <!--suppress VueUnrecognizedSlot -->
              <template v-slot:item="{ element, index }">
                <div class="editor-nav-item" :key="element.key">
                  <editor-nav-bar
                    annotation="pinned"
                    :node="element"
                    @onDelete="handleEditorNodeDelete('pinned', index)"
                  />
                </div>
              </template>
            </draggable-component>
          </div>
          <div class="editor-column">
            <span class="editor-title">活动标签</span>
            <draggable-component
              class="editor-dragger"
              item-key="key"
              :list="editorDialogActiveNavigationNodes"
              :group="{ name: 'nav' }"
            >
              <!--suppress VueUnrecognizedSlot -->
              <template v-slot:item="{ element, index }">
                <div class="editor-nav-item" :key="element.key">
                  <editor-nav-bar
                    annotation="active"
                    :node="element"
                    @onDelete="handleEditorNodeDelete('active', index)"
                  />
                </div>
              </template>
            </draggable-component>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="footer-container">
          <el-button type="primary" @click="handleEditorConfirm"> 确定 </el-button>
          <el-button @click="editDialogVisible = false"> 取消 </el-button>
        </div>
      </template>
    </el-dialog>
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

import { ElMessageBox } from 'element-plus'

import { Lock as LockIcon, Link as LinkIcon, Close as CloseIcon } from '@element-plus/icons-vue'

import DraggableComponent from 'vuedraggable'

import EditorNavBar from './EditorNavBar.vue'

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
function handleRemove(nodeKey: string) {
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

function handleCloseDefault() {
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
function openMenu(nodeKey: string, e: MouseEvent) {
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

function handleShowEditDialogContextMenuItemClicked(): void {
  closeMenu()
  handleShowEditDialog()
}

// -----------------------------------------------------------编辑对话框-----------------------------------------------------------

const editDialogVisible = ref<boolean>(false)
const editorDialogPinnedNavigationNodes = ref<NavigationNodeInfo[]>([])
const editorDialogActiveNavigationNodes = ref<NavigationNodeInfo[]>([])

function handleShowEditDialog(): void {
  // 数据初始化。
  editorDialogPinnedNavigationNodes.value = []
  editorDialogActiveNavigationNodes.value = []
  navigationEzNavStore.pinnedNodeKeys.forEach((key) => {
    const mayNode: NavigationNodeInfo | null = navigationStore.getNodeInfo(key)
    if (mayNode) {
      editorDialogPinnedNavigationNodes.value.push(mayNode)
    }
  })
  navigationEzNavStore.activeNodeKeys.forEach((key) => {
    const mayNode: NavigationNodeInfo | null = navigationStore.getNodeInfo(key)
    if (mayNode) {
      editorDialogActiveNavigationNodes.value.push(mayNode)
    }
  })
  // 显示对话框。
  editDialogVisible.value = true
}

function handleDeepCleanContextMenuItemClicked(): void {
  closeMenu()
  deepClean()
}

function handleNavigationContextMenuItemClicked(): void {
  closeMenu()
  handleNavigation(contextmenu.value.nodeKey)
}

function handleEditorConfirm() {
  navigationEzNavStore.setPinnedNodeKeys(
    editorDialogPinnedNavigationNodes.value.map((node) => node.key),
  )
  navigationEzNavStore.setActiveNodeKeys(
    editorDialogActiveNavigationNodes.value.map((node) => node.key),
  )
  editDialogVisible.value = false
}

function handleEditDialogHotKeyDown(event: KeyboardEvent): void {
  if (!editDialogVisible.value) {
    return
  }
  if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
    handleEditorConfirm()
  }
}

function handleEditorNodeDelete(annotation: string, index: number): void {
  if (annotation === 'pinned') {
    editorDialogPinnedNavigationNodes.value.splice(index, 1)
  } else {
    editorDialogActiveNavigationNodes.value.splice(index, 1)
  }
}

// 深度清理。
function deepClean(): void {
  ElMessageBox.confirm(
    '该操作将会清空您所有与导航栏相关的缓存的数据。<br>' +
      '<b>这将使您的导航栏全部清空，包括固定导航栏与活动导航栏</b><br>' +
      '是否继续?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    },
  )
    .then(() => navigationEzNavStore.clearAll())
    .then(() => {
      vim.ctx().router().vueRouter().push({ name: 'vim.layout' })
    })
    .catch(() => {})
}

// 添加快捷键监听。
function addHotKeyListener() {
  document.body.addEventListener('keydown', handleHotKeyDown)
}

function removeHotKeyListener() {
  document.body.removeEventListener('keydown', handleHotKeyDown)
}

function handleHotKeyDown($event: KeyboardEvent) {
  // ctrl + alt + leftArrow
  if ($event.key === 'ArrowLeft' && $event.ctrlKey && $event.altKey) {
    mayBackward()
  }
  // ctrl + alt + rightArrow
  if ($event.key === 'ArrowRight' && $event.ctrlKey && $event.altKey) {
    mayForward()
  }
}

function mayBackward() {
  if (navigationEzNavStore.loading > 0) {
    return
  }
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
  color: var(--el-color-primary);
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

/*noinspection CssUnusedSymbol*/
.ez-nav-item.active {
  background-color: #42b983;
  color: #fff;
  border-color: #42b983;
}

/*noinspection CssUnusedSymbol*/
.ez-nav-item span {
  user-select: none;
}

.prefix-icon {
  width: 14px;
  height: 14px;
  vertical-align: 2px;
  border-radius: 50%;
  text-align: center;
}

.prefix-icon:before {
  display: inline-block;
  vertical-align: -3px;
}

.close-icon {
  width: 14px;
  height: 14px;
  vertical-align: 2px;
  border-radius: 50%;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  transform-origin: 100% 50%;
}

.close-icon:before {
  display: inline-block;
  vertical-align: -3px;
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
  border-width: 1px;
  border-style: solid;
  border-color: #7f7f7f;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
}

.contextmenu:focus {
  outline: none;
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background: #eee;
}

.contextmenu-modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 2999;
}

/*noinspection CssUnusedSymbol*/
.edit-dialog-container :deep(.el-dialog) {
  margin-bottom: 0 !important;
}

.editor-container {
  height: 600px;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.editor-column {
  height: 100%;
  width: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.editor-column:first-child {
  margin-right: 15px;
}

.editor-title {
  font-size: 16px;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
  user-select: none;
  margin-bottom: 5px;
  padding-left: 2px;
}

.editor-dragger {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.editor-nav-item:not(:first-child) {
  margin-top: 2px;
}
</style>
