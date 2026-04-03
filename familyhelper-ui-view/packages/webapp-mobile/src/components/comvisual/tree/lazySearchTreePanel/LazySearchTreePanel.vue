<template>
  <div class="lazy-search-tree-panel-container">
    <loading-overlay :loading="loading > 0" />
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <div class="flex-item expand search-bar">
            <transition name="path-indicator">
              <div
                v-show="pathIndicatorVisible"
                ref="pathIndicatorRef"
                class="path-indicator"
                :style="pathIndicatorStyle"
              >
                <div class="content-wrapper">
                  <div v-if="pathIndicatorLoading > 0" class="content">
                    <span>{{ pathIndicatorLoadingText }}</span>
                  </div>
                  <div v-else class="content">
                    <span>{{ pathIndicatorContent }}</span>
                  </div>
                </div>
              </div>
            </transition>
            <div class="search-input-wrap" @keydown.esc="closeDropdown">
              <input
                v-model="searchInputText"
                class="search-input"
                type="text"
                :placeholder="searchBarPlaceholder"
                autocomplete="off"
                @focus="onSearchFocus"
                @input="onSearchInput"
                @blur="onSearchBlur"
              />
              <div
                v-show="searchDropdownVisible"
                class="search-dropdown"
                role="listbox"
                @scroll="onDropdownScroll"
              >
                <div v-if="searchBarLoading > 0" class="search-dropdown-hint">
                  {{ searchBarLoadingText }}
                </div>
                <div v-else-if="searchBarOptions.length === 0" class="search-dropdown-hint">
                  没有数据
                </div>
                <native-button
                  v-else
                  v-for="(opt, idx) in searchBarOptions"
                  :key="itemKeyString(opt as CT) + '-' + idx"
                  bare
                  block
                  class="search-option"
                  role="option"
                  @mousedown.prevent="selectSearchOption(opt as CT)"
                  @mouseenter="onOptionHover(idx, $event)"
                >
                  <slot name="default" :node="null" :item="opt as CT">
                    <span>{{ searchOptionLabel(opt as CT) }}</span>
                  </slot>
                </native-button>
              </div>
            </div>
          </div>
          <native-button class="search-button" title="刷新" @click="handleRefresh">
            重置
          </native-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="scroll-bar" :key="renderTick">
          <div class="tree-panel" role="tree">
            <lazy-tree-node-row
              v-for="n in lazyTreeStore.rootNodes"
              :key="n.key"
              :node="n"
              :selected-key="selectedKey"
              :operate-area-visible="operateAreaVisible"
              :inspect-button-visible="inspectButtonVisible"
              :edit-button-visible="editButtonVisible"
              :delete-button-visible="deleteButtonVisible"
              @toggleExpand="onToggleExpand"
              @select="onNodeSelect"
              @operate-hover="(v: boolean) => (treeOperateAreaHover = v)"
              @item-inspect="
                (item: CT, node: NativeTreeNode<CT>) => handleOperateAreaItemInspect(item, node)
              "
              @item-edit="
                (item: CT, node: NativeTreeNode<CT>) => handleOperateAreaItemEdit(item, node)
              "
              @item-delete="
                (item: CT, node: NativeTreeNode<CT>) => handleOperateAreaItemDelete(item, node)
              "
            >
              <template v-slot:default="slotProps">
                <slot name="default" :node="slotProps.node" :item="slotProps.item" />
              </template>
              <template v-slot:operateArea="slotProps">
                <slot name="operateArea" v-bind="slotProps" />
              </template>
            </lazy-tree-node-row>
          </div>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, nextTick, onMounted, ref } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import LazyTreeNodeRow from './LazyTreeNodeRow.vue'
import { type NativeTreeNode } from './nativeLazyTree.ts'
import { LazyTreeStore } from './nativeLazyTree.ts'

import { type TreeNode } from '@/components/comvisual/tree/commons/types.ts'

defineOptions({
  name: 'LazySearchTreePanel',
})

// region Props 定义

type Props = {
  /**
   * 树节点标识字段。
   */
  keyField: keyof {
    [K in keyof CT as CT[K] extends string ? K : never]: unknown
  }
  /**
   * 树节点标签字段。
   */
  labelField: keyof {
    [K in keyof CT as CT[K] extends string ? K : never]: unknown
  }
  /**
   * 树节点是否为叶子节点字段。
   */
  isLeafField: keyof {
    [K in keyof CT as CT[K] extends boolean ? K : never]: unknown
  }
  /**
   * 树节点子节点字段。
   */
  childrenField?: keyof {
    [K in keyof CT as CT[K] extends CT[] ? K : never]: unknown
  }
  /**
   * 树节点标识字段。
   */
  disabledField?: keyof {
    [K in keyof CT as CT[K] extends boolean ? K : never]: unknown
  }

  searchBarPlaceholder?: string
  searchBarLoadingText?: string
  treeAccordion?: boolean
  inspectButtonVisible?: boolean
  editButtonVisible?: boolean
  deleteButtonVisible?: boolean
  operateAreaVisible?: boolean
  pathIndicatorLoadingText?: string
  pathIndicatorDelimiter?: string
  searchOptionHandler?: (pattern: string, accept: (result: CT[]) => void) => void
  loadRootHandler?: (accept: (result: CT[]) => void) => void
  loadChildHandler?: (item: CT, accept: (result: CT[]) => void) => void
  queryPathHandler?: (item: CT, accept: (result: CT[]) => void) => void
}

const props = withDefaults(defineProps<Props>(), {
  searchBarPlaceholder: '请输入名称',
  searchBarLoadingText: '正在加载',
  treeAccordion: false,
  inspectButtonVisible: true,
  editButtonVisible: true,
  deleteButtonVisible: true,
  operateAreaVisible: true,
  pathIndicatorLoadingText: '正在加载',
  pathIndicatorDelimiter: '/',
  searchOptionHandler: (_pattern, accept) => {
    accept([])
  },
  loadRootHandler: (accept: (result: CT[]) => void) => {
    accept([])
  },
  loadChildHandler: (_item, accept) => {
    accept([])
  },
  queryPathHandler: (_item, accept) => {
    accept([])
  },
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onItemInspect', item: CT, node: TreeNode<CT>): void
  (e: 'onItemEdit', item: CT, node: TreeNode<CT>): void
  (e: 'onItemDelete', item: CT, node: TreeNode<CT>): void
  (e: 'onCurrentChanged', current: CT | null, node: TreeNode<CT> | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region Slots 定义

type DefaultSlotProps = {
  node: TreeNode<CT> | null
  item: CT
}

type OperateAreaSlotProps = {
  node: TreeNode<CT>
  item: CT
  fireItemInspect: () => void
  fireItemEdit: () => void
  fireItemDelete: () => void
}

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: DefaultSlotProps) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operateArea?: (props: OperateAreaSlotProps) => any
}>()

// endregion

// region 加载与渲染

const loading = ref<number>(0)
const renderTick = ref(0)

function bumpRender(): void {
  renderTick.value += 1
}

// endregion

// region 树存储与 treeRef 兼容对象

const lazyTreeStore = new LazyTreeStore<CT>({
  keyField: props.keyField,
  labelField: props.labelField,
  isLeafField: props.isLeafField,
  treeAccordion: props.treeAccordion,
  loadChildHandler: (item, accept) => {
    props.loadChildHandler(item, accept)
  },
  onStructureChanged: bumpRender,
})

const treeRef = ref({
  get store() {
    return lazyTreeStore.store
  },
  setCurrentKey: (key?: string) => {
    lazyTreeStore.setCurrentKey(key)
    bumpRender()
  },
  getNode: (k: string | CT) => lazyTreeStore.getNode(k),
  getCurrentNode: () => lazyTreeStore.getCurrentData(),
  append: (item: CT, parent: TreeNode<CT>) => {
    lazyTreeStore.append(parent as NativeTreeNode<CT>, item)
    bumpRender()
  },
  insertBefore: (item: CT, refNode: TreeNode<CT>) => {
    lazyTreeStore.insertBefore(refNode as NativeTreeNode<CT>, item)
    bumpRender()
  },
  insertAfter: (item: CT, refNode: TreeNode<CT>) => {
    lazyTreeStore.insertAfter(refNode as NativeTreeNode<CT>, item)
    bumpRender()
  },
  remove: (item: CT) => {
    lazyTreeStore.remove(item)
    bumpRender()
  },
  update: (item: CT) => {
    lazyTreeStore.update(item)
    bumpRender()
  },
})

// endregion

// region 模板引用

const pathIndicatorRef = ref<HTMLElement | null>(null)
const pathIndicatorAnchorEl = ref<HTMLElement | null>(null)

// endregion

// region 搜索条

const searchBarLoading = ref<number>(0)
const searchBarValue = ref<CT | null>(null)
const searchBarOptions = ref<CT[]>([])
const searchDropdownVisible = ref<boolean>(false)
const searchBarScrollChangedFlag = ref<boolean>(false)
const searchInputText = ref<string>('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

function itemKeyString(item: CT): string {
  return String(item[props.keyField as keyof CT])
}

function searchOptionLabel(row: CT): string {
  return String(row[props.labelField as keyof CT])
}

function onSearchFocus(): void {
  updatePathIndicator()
}

function onSearchBlur(): void {
  setTimeout(() => {
    pathIndicatorAnchorIndex.value = -1
    searchDropdownVisible.value = false
    updatePathIndicator()
  }, 120)
}

function closeDropdown(): void {
  pathIndicatorAnchorIndex.value = -1
  searchDropdownVisible.value = false
  updatePathIndicator()
}

function onSearchInput(): void {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    handleSearchBarSearched(searchInputText.value.trim())
  }, 300)
}

function handleSearchBarSearched(pattern: string): void {
  if (pattern === '') {
    searchBarOptions.value = []
    return
  }
  const accept = (res: CT[]) => {
    searchBarOptions.value = [...res]
    searchBarLoading.value -= 1
  }
  searchBarLoading.value += 1
  searchDropdownVisible.value = true
  props.searchOptionHandler(pattern, accept)
}

function selectSearchOption(value: CT): void {
  searchBarValue.value = value
  searchInputText.value = String(value[props.labelField])
  pathIndicatorAnchorIndex.value = -1
  searchDropdownVisible.value = false
  updatePathIndicator()
  handleSearchBarChanged(value)
}

function onDropdownScroll(): void {
  searchBarScrollChangedFlag.value = true
  updatePathIndicator()
}

// endregion

// region PathIndicator

const pathIndicatorLoading = ref<number>(0)
const pathIndicatorVisible = ref<boolean>(false)
const pathIndicatorAnchorIndex = ref<number>(-1)
const pathIndicatorContent = ref<string>('')
const pathIndicatorStyleTop = ref<number>(0)
const pathIndicatorStyleLeft = ref<number>(0)
const pathIndicatorStyleWidth = ref<number>(100)

let pathIndicatorUpdateCount: number = 0
let pathIndicatorTimer: ReturnType<typeof setTimeout> | null = null

const pathIndicatorStyle = computed(() => ({
  top: `${pathIndicatorStyleTop.value}px`,
  left: `${pathIndicatorStyleLeft.value}px`,
  width: `${pathIndicatorStyleWidth.value}px`,
}))

const shouldPathIndicatorHide = computed(
  () =>
    pathIndicatorAnchorIndex.value === -1 ||
    !searchDropdownVisible.value ||
    searchBarScrollChangedFlag.value,
)

function updatePathIndicator(): void {
  hidePathIndicator()
  if (shouldPathIndicatorHide.value) {
    return
  }
  pathIndicatorTimer = setTimeout(() => {
    if (shouldPathIndicatorHide.value) {
      return
    }
    showPathIndicator()
  }, 500)
}

function showPathIndicator(): void {
  function adjustPathIndicatorStyle(): void {
    const optEl = pathIndicatorAnchorEl.value
    if (!optEl || !pathIndicatorRef.value) {
      return
    }
    const rect = optEl.getBoundingClientRect()
    nextTick(() => {
      if (!pathIndicatorRef.value) {
        return
      }
      pathIndicatorStyleTop.value = rect.top - 2 - pathIndicatorRef.value.offsetHeight
      pathIndicatorStyleLeft.value = rect.left + 10
      pathIndicatorStyleWidth.value = Math.max(40, optEl.offsetWidth - 20)
    })
  }

  const updateCountSnapshot: number = ++pathIndicatorUpdateCount
  const option: CT = searchBarOptions.value[pathIndicatorAnchorIndex.value] as CT
  if (!option) {
    return
  }
  pathIndicatorLoading.value += 1
  pathIndicatorVisible.value = true
  adjustPathIndicatorStyle()

  new Promise<CT[]>((resolve) => {
    props.queryPathHandler(option, (result) => resolve(result))
  })
    .then((paths) => {
      if (updateCountSnapshot !== pathIndicatorUpdateCount) {
        return Promise.resolve()
      }
      let pathString: string = props.pathIndicatorDelimiter
      paths.forEach((item) => {
        pathString += String(item[props.labelField as keyof CT]) + props.pathIndicatorDelimiter
      })
      pathString += searchOptionLabel(option)
      pathIndicatorContent.value = pathString
      return Promise.resolve()
    })
    .finally(() => {
      pathIndicatorLoading.value -= 1
    })
    .then(() => {
      adjustPathIndicatorStyle()
    })
}

function hidePathIndicator(): void {
  pathIndicatorVisible.value = false
  if (pathIndicatorTimer) {
    clearTimeout(pathIndicatorTimer)
    pathIndicatorTimer = null
  }
}

function onOptionHover(index: number, evt: MouseEvent): void {
  searchBarScrollChangedFlag.value = false
  pathIndicatorAnchorIndex.value = index
  pathIndicatorAnchorEl.value = evt.currentTarget as HTMLElement
  updatePathIndicator()
}

// endregion

// region 搜索选中后的路径展开

function handleSearchBarChanged(value: CT): void {
  if (!value) {
    return
  }

  function nodeMap(): Record<string, TreeNode<CT>> {
    return treeRef.value.store.nodesMap as Record<string, TreeNode<CT>>
  }

  function mayCollapseOtherNode(path: CT[]): void {
    if (!props.treeAccordion) {
      return
    }
    const nm = nodeMap()
    path.forEach((item) => {
      const key: string = itemKeyString(item)
      const node = nm[key] as NativeTreeNode<CT>
      const id: number = node.id
      if (!node.parent) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      const siblings: TreeNode<CT>[] = node.parent.childNodes
      siblings.forEach((sibling) => {
        if (sibling.id !== id) {
          sibling.collapse()
        }
      })
    })
  }

  const accept = (path: CT[]) => {
    const nm = nodeMap()
    let offset = 0
    for (; offset < path.length; offset += 1) {
      const key: string = itemKeyString(path[offset])
      if (!nm[key]) {
        break
      }
      if (!nm[key].loaded) {
        break
      }
    }
    if (offset === path.length) {
      path.forEach((item) => {
        const key: string = itemKeyString(item)
        const node = nm[key] as NativeTreeNode<CT>
        node.expand()
      })
      const currentKey: string = itemKeyString(value)
      const currentNode: TreeNode<CT> = nm[currentKey]
      const currentItem: CT = currentNode.data
      lazyTreeStore.selectNodeData(currentItem)
      bumpRender()
      emit('onCurrentChanged', currentItem, currentNode)
      mayCollapseOtherNode(path)
      loading.value -= 1
      return
    }
    let remainCount: number = path.length - offset
    const childInfos: { key: string; children: CT[] }[] = []
    const acceptProvider = (index: number) => (children: CT[]) => {
      childInfos[index - offset] = { key: itemKeyString(path[index]), children }
      remainCount -= 1
      if (remainCount > 0) {
        return
      }
      childInfos.forEach((childInfo) => {
        const node = nm[childInfo.key] as NativeTreeNode<CT>
        node.loaded = true
        node.childNodes = []
        childInfo.children.forEach((child) => {
          append(node, child)
        })
      })
      path.forEach((item) => {
        const key: string = itemKeyString(item)
        const node = nm[key] as NativeTreeNode<CT>
        node.expand()
      })
      const currentKey: string = itemKeyString(value)
      const currentNode: TreeNode<CT> = nm[currentKey]
      const currentItem: CT = currentNode.data
      lazyTreeStore.selectNodeData(currentItem)
      bumpRender()
      emit('onCurrentChanged', currentItem, currentNode)
      mayCollapseOtherNode(path)
      loading.value -= 1
    }
    for (let index = offset; index < path.length; index += 1) {
      const acc = acceptProvider(index)
      props.loadChildHandler(path[index], acc)
    }
  }

  loading.value += 1
  props.queryPathHandler(value, accept)
}

function append(target: TreeNode<CT>, item: CT): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (target.loaded) {
    treeRef.value.append(item, target)
  }
  nextTick(() => {
    target.isLeaf = false
  })
}

// endregion

// region 树交互

const treeOperateAreaHover = ref<boolean>(false)

const selectedKey = computed(() => lazyTreeStore.getCurrentKey())

function onToggleExpand(node: NativeTreeNode<CT>): void {
  lazyTreeStore.toggleExpand(node)
  bumpRender()
}

function onNodeSelect(node: NativeTreeNode<CT>): void {
  lazyTreeStore.selectNodeData(node.data)
  bumpRender()
  if (searchBarValue.value) {
    const selectKey = itemKeyString(searchBarValue.value)
    const treeKey = itemKeyString(node.data)
    if (selectKey !== treeKey) {
      searchBarValue.value = null
    }
  }
  if (!treeOperateAreaHover.value) {
    emit('onCurrentChanged', node.data, node as TreeNode<CT>)
  }
}

// endregion

// region 根加载与刷新

function handleLoadRoot(): void {
  const accept = (res: CT[]) => {
    lazyTreeStore.setRootData(res)
    loading.value -= 1
  }
  loading.value += 1
  props.loadRootHandler(accept)
}

function handleRefresh(): void {
  searchBarValue.value = null
  searchInputText.value = ''
  searchBarOptions.value = []
  lazyTreeStore.setRootData([])
  handleLoadRoot()
  pathIndicatorAnchorIndex.value = -1
  searchDropdownVisible.value = false
  updatePathIndicator()
  treeRef.value.setCurrentKey()
}

onMounted(() => {
  handleLoadRoot()
})

// endregion

// region 操作区

function handleOperateAreaItemInspect(item: CT, node: NativeTreeNode<CT>): void {
  emit('onItemInspect', item, node as TreeNode<CT>)
}

function handleOperateAreaItemEdit(item: CT, node: NativeTreeNode<CT>): void {
  emit('onItemEdit', item, node as TreeNode<CT>)
}

function handleOperateAreaItemDelete(item: CT, node: NativeTreeNode<CT>): void {
  emit('onItemDelete', item, node as TreeNode<CT>)
}

// endregion

// region 对外 API

function getItem(key: string): CT {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return treeRef.value.getNode(key).data
}

function getNode(keyOrData: string | CT): TreeNode<CT> {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return treeRef.value.getNode(keyOrData) as TreeNode<CT>
}

function appendRoot(item: CT): void {
  lazyTreeStore.appendRoot(item)
  bumpRender()
  nextTick(() => {
    if (!treeRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    const _treeCurrentNode = treeRef.value.getCurrentNode()
    if (_treeCurrentNode && itemKeyString(_treeCurrentNode) === itemKeyString(item)) {
      treeRef.value.setCurrentKey()
    }
    if (!treeRef.value.getCurrentNode()) {
      treeRef.value.setCurrentKey(itemKeyString(item))
    }
    bumpRender()
  })
}

function appendNode(target: TreeNode<CT>, item: CT): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (target.loaded) {
    treeRef.value.append(item, target)
  }
  nextTick(() => {
    target.isLeaf = false
    bumpRender()
  })
}

function insertBefore(target: TreeNode<CT>, item: CT): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treeRef.value.insertBefore(item, target)
}

function insertAfter(target: TreeNode<CT>, item: CT): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treeRef.value.insertAfter(item, target)
}

function update(item: CT): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  let emitOnCurrentChangedFlag = false
  const _treeCurrentNode = lazyTreeStore.getCurrentData()
  if (_treeCurrentNode && itemKeyString(_treeCurrentNode) === itemKeyString(item)) {
    emitOnCurrentChangedFlag = true
  }
  treeRef.value.update(item)
  if (emitOnCurrentChangedFlag) {
    const treeNode: TreeNode<CT> = treeRef.value.getNode(item) as TreeNode<CT>
    emit('onCurrentChanged', item, treeNode)
  }
}

function remove(item: CT): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treeRef.value.remove(item)
  bumpRender()
}

function setCurrent(item: CT | null): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (!item) {
    treeRef.value.setCurrentKey()
    bumpRender()
    return
  }
  treeRef.value.setCurrentKey(itemKeyString(item))
  bumpRender()
}

function refresh(): void {
  handleRefresh()
}

defineExpose({
  getItem,
  getNode,
  appendRoot,
  append: appendNode,
  insertBefore,
  insertAfter,
  update,
  remove,
  setCurrent,
  refresh,
})

// endregion
</script>

<style scoped>
.lazy-search-tree-panel-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.header-container .flex-item.expand {
  flex-grow: 1;
}

.header-container .flex-item:not(:last-child) {
  margin-right: 5px;
}

.search-bar {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.search-input-wrap {
  position: relative;
  width: 100%;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.search-dropdown {
  position: absolute;
  z-index: 5000;
  left: 0;
  right: 0;
  top: 100%;
  margin-top: 2px;
  max-height: 280px;
  overflow: auto;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-option {
  padding: 8px 10px;
  font-size: 14px;
  text-align: left;
}

.search-option:hover {
  background: #f5f7fa !important;
}

.search-dropdown-hint {
  padding: 8px 10px;
  font-size: 13px;
  color: #909399;
}

.search-bar .path-indicator {
  box-sizing: border-box;
  position: fixed;
  z-index: 6000;
  padding: 2px 0;
  color: #606266;
  background: white;
  border: solid 1px #dcdfe6;
  pointer-events: none;
}

/*noinspection CssUnusedSymbol*/
.path-indicator-enter-active {
  transition: opacity 0.3s;
}

/*noinspection CssUnusedSymbol*/
.path-indicator-leave-active {
  transition: none;
}

/*noinspection CssUnusedSymbol*/
.path-indicator-enter-to,
.path-indicator-leave-from {
  opacity: 1;
}

/*noinspection CssUnusedSymbol*/
.path-indicator-enter-from,
.path-indicator-leave-to {
  opacity: 0;
}

.search-bar .path-indicator .content-wrapper {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  padding: 0 10px;
}

.search-bar .path-indicator .content-wrapper .content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.search-bar .path-indicator .content-wrapper .content span {
  width: 0;
  flex-grow: 1;
  font-size: 12px;
  word-break: break-all;
}

.search-button {
  min-width: 32px;
}

.scroll-bar {
  height: 100%;
  overflow: auto;
}

.tree-panel {
  display: inline-block;
  min-width: 100%;
}
</style>
