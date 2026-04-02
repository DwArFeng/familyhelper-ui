<template>
  <div class="search-tree-panel-container">
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
                  <div class="content">
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
                <div v-if="searchBarOptions.length === 0" class="search-dropdown-hint">
                  没有数据
                </div>
                <native-button
                  v-else
                  v-for="(opt, idx) in searchBarOptions"
                  :key="opt.key + '-' + idx"
                  bare
                  block
                  class="search-option"
                  role="option"
                  @mousedown.prevent="selectSearchOption(opt)"
                  @mouseenter="onOptionHover(idx, $event)"
                >
                  <slot name="default" :node="null" :item="opt.bean">
                    <default-tree-default-slot :label="(opt.bean as any)[labelField] as string" />
                  </slot>
                </native-button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:default>
        <div class="scroll-bar">
          <div class="tree-panel" role="tree">
            <static-tree-node-row
              v-for="n in staticStore.rootNodes"
              :key="n.key"
              :node="n as StaticTreeNode<CT>"
              :selected-key="selectedKey"
              :disabled-field="disabledField"
              :operate-area-visible="operateAreaVisible"
              :inspect-button-visible="inspectButtonVisible"
              :edit-button-visible="editButtonVisible"
              :delete-button-visible="deleteButtonVisible"
              @toggleExpand="onToggleExpand"
              @select="onNodeSelect"
              @operate-hover="(v: boolean) => (treeOperateAreaHover = v)"
              @item-inspect="
                (item: CT, node: StaticTreeNode<CT>) => handleOperateAreaItemInspect(item, node)
              "
              @item-edit="
                (item: CT, node: StaticTreeNode<CT>) => handleOperateAreaItemEdit(item, node)
              "
              @item-delete="
                (item: CT, node: StaticTreeNode<CT>) => handleOperateAreaItemDelete(item, node)
              "
            >
              <template v-slot:default="slotProps">
                <slot name="default" :node="slotProps.node" :item="slotProps.item">
                  <default-tree-default-slot :label="slotProps.item[labelField] as string" />
                </slot>
              </template>
              <template v-slot:operateArea="slotProps">
                <slot name="operateArea" v-bind="slotProps">
                  <default-tree-operate-area-slot
                    :node="slotProps.node"
                    :item="slotProps.item"
                    :inspect-button-visible="inspectButtonVisible"
                    :edit-button-visible="editButtonVisible"
                    :delete-button-visible="deleteButtonVisible"
                    @onItemInspect="handleOperateAreaItemInspect"
                    @onItemEdit="handleOperateAreaItemEdit"
                    @onItemDelete="handleOperateAreaItemDelete"
                  />
                </slot>
              </template>
            </static-tree-node-row>
          </div>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { reactive, type Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import DefaultTreeDefaultSlot from '@/components/comvisual/tree/commons/DefaultTreeDefaultSlot.vue'
import DefaultTreeOperateAreaSlot from '@/components/comvisual/tree/commons/DefaultTreeOperateAreaSlot.vue'

import { type TreeNode } from '@/components/comvisual/tree/commons/types.ts'

import { StaticTreeStore, type StaticTreeNode } from './nativeStaticTree.ts'
import StaticTreeNodeRow from './StaticTreeNodeRow.vue'

defineOptions({
  name: 'SearchTreePanel',
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
   * 树节点子节点字段。
   */
  childrenField: keyof {
    [K in keyof CT as CT[K] extends CT[] ? K : never]: unknown
  }
  /**
   * 树节点禁用字段。
   */
  disabledField?: keyof {
    [K in keyof CT as CT[K] extends boolean ? K : never]: unknown
  }

  /**
   * 完整的树数据。
   */
  items: CT[]

  searchBarPlaceholder?: string
  treeAccordion?: boolean
  inspectButtonVisible?: boolean
  editButtonVisible?: boolean
  deleteButtonVisible?: boolean
  operateAreaVisible?: boolean
  pathIndicatorDelimiter?: string
  /**
   * 搜索过滤函数，接收搜索模式和节点数据，返回 true 表示匹配，false 表示不匹配。
   * 如果未提供，将使用默认的 labelField 模糊匹配。
   */
  searchFilterHandler?: (pattern: string, item: CT) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchBarPlaceholder: '请输入名称',
  treeAccordion: false,
  inspectButtonVisible: true,
  editButtonVisible: true,
  deleteButtonVisible: true,
  operateAreaVisible: true,
  pathIndicatorDelimiter: '/',
  searchFilterHandler: () => false,
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

// region 渲染与树存储

const staticStore = reactive(
  new StaticTreeStore<CT>({
    keyField: props.keyField,
    childrenField: props.childrenField,
    treeAccordion: props.treeAccordion,
    disabledField: props.disabledField,
  }),
)

const selectedKey = computed(() => staticStore.getCurrentKey())

// endregion

// region Tree 处理

const treeOperateAreaHover = ref<boolean>(false)

function nodeMap(): Record<string, TreeNode<CT>> {
  return staticStore.store.nodesMap as Record<string, TreeNode<CT>>
}

function onToggleExpand(node: StaticTreeNode<CT>): void {
  staticStore.toggleExpand(node)
}

function onNodeSelect(node: StaticTreeNode<CT>): void {
  staticStore.selectNodeData(node.data)
  if (searchBarValue.value) {
    const selectKey: string = searchBarValue.value.key
    const treeKey: string = node.data[props.keyField] as string
    if (selectKey !== treeKey) {
      searchBarValue.value = null
      searchInputText.value = ''
    }
  }
  if (!treeOperateAreaHover.value) {
    emit('onCurrentChanged', node.data, node as TreeNode<CT>)
  }
}

function getItem(key: string): CT {
  return staticStore.getItem(key)
}

function getNode(key: string): TreeNode<CT> {
  return staticStore.getNode(key) as TreeNode<CT>
}

function setCurrent(item: CT | null): void {
  staticStore.setCurrentKey(item ? (item[props.keyField] as string) : undefined)
}

defineExpose({
  getItem,
  getNode,
  setCurrent,
})

// endregion

// region 搜索处理

type PathBean = { key: string; bean: CT; path: CT[] }

const searchBarValue = ref<PathBean | null>(null)
const searchBarOptions = ref<PathBean[]>([]) as Ref<PathBean[]>
const searchDropdownVisible = ref<boolean>(false)
const searchBarScrollChangedFlag = ref<boolean>(false)
const searchInputText = ref<string>('')

function onSearchFocus(): void {
  if (searchBarOptions.value.length > 0) {
    searchDropdownVisible.value = true
  }
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
  handleSearchBarSearched(searchInputText.value.trim())
}

function handleSearchBarSearched(pattern: string): void {
  function performSearch(searchPattern: string): PathBean[] {
    if (searchPattern === '') {
      return []
    }
    const allNodesWithPath = collectAllNodesWithPath(props.items)
    return allNodesWithPath.filter((item) => props.searchFilterHandler(searchPattern, item.bean))
  }

  function collectAllNodesWithPath(data: CT[]): PathBean[] {
    const result: PathBean[] = []
    function traverse(list: CT[], currentPath: CT[]): void {
      for (const item of list) {
        const newPath = [...currentPath, item]
        result.push({ key: item[props.keyField] as string, bean: item, path: newPath })
        if (props.childrenField && item[props.childrenField]) {
          const children = item[props.childrenField] as CT[]
          if (Array.isArray(children) && children.length > 0) {
            traverse(children, newPath)
          }
        }
      }
    }
    traverse(data, [])
    return result
  }

  if (pattern === '') {
    searchBarOptions.value = []
    searchDropdownVisible.value = false
    return
  }
  nextTick(() => {
    searchBarOptions.value = performSearch(pattern)
    searchDropdownVisible.value = true
  })
}

function selectSearchOption(value: PathBean): void {
  searchBarValue.value = value
  searchInputText.value = String(value.bean[props.labelField])
  pathIndicatorAnchorIndex.value = -1
  searchDropdownVisible.value = false
  updatePathIndicator()
  handleSearchBarChanged(value)
}

function onDropdownScroll(): void {
  searchBarScrollChangedFlag.value = true
  updatePathIndicator()
}

function handleSearchBarChanged(value: PathBean): void {
  if (!value) {
    return
  }

  function mayCollapseOtherNode(path: CT[]): void {
    if (!props.treeAccordion) {
      return
    }
    const nm: Record<string, TreeNode<CT>> = nodeMap()
    path.forEach((item) => {
      const key: string = item[props.keyField] as string
      const node: TreeNode<CT> = nm[key]
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

  const path = value.path
  if (path.length === 0) {
    return
  }

  const nm: Record<string, TreeNode<CT>> = nodeMap()
  path.forEach((item) => {
    const key: string = item[props.keyField] as string
    const node: TreeNode<CT> = nm[key]
    if (node) {
      node.expand()
    }
  })
  const currentKey: string = value.bean[props.keyField] as string
  const currentNode: TreeNode<CT> = nm[currentKey]
  if (!currentNode) {
    return
  }
  const currentItem: CT = value.bean
  staticStore.setCurrentKey(currentKey)
  emit('onCurrentChanged', currentItem, currentNode)
  mayCollapseOtherNode(path)
}

// endregion

// region PathIndicator 处理

const pathIndicatorVisible = ref<boolean>(false)
const pathIndicatorAnchorIndex = ref<number>(-1)
const pathIndicatorContent = ref<string>('')
const pathIndicatorStyleTop = ref<number>(0)
const pathIndicatorStyleLeft = ref<number>(0)
const pathIndicatorStyleWidth = ref<number>(100)

const pathIndicatorRef = ref<HTMLElement | null>(null)
const pathIndicatorAnchorEl = ref<HTMLElement | null>(null)

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
  const option = searchBarOptions.value[pathIndicatorAnchorIndex.value]
  if (!option) {
    return
  }
  pathIndicatorVisible.value = true
  adjustPathIndicatorStyle()
  nextTick(() => {
    if (updateCountSnapshot !== pathIndicatorUpdateCount) {
      return
    }
    let pathString: string = props.pathIndicatorDelimiter
    option.path.forEach((item) => {
      pathString += item[props.labelField] + props.pathIndicatorDelimiter
    })
    pathIndicatorContent.value = pathString
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

// 必须在搜索栏、PathIndicator 的 ref 与 hidePathIndicator 定义之后再注册；
// immediate: true 会在 setup 同步阶段执行回调，否则触发“尚未初始化”引用错误。
watch(
  () => props.items,
  () => {
    searchBarValue.value = null
    searchBarOptions.value = []
    searchDropdownVisible.value = false
    searchBarScrollChangedFlag.value = false
    searchInputText.value = ''
    hidePathIndicator()
    pathIndicatorAnchorIndex.value = -1
    staticStore.setItems(props.items)
  },
  { deep: true, immediate: true },
)

watch(
  () => props.treeAccordion,
  (v) => {
    staticStore.setTreeAccordion(v)
  },
)

function onOptionHover(index: number, evt: MouseEvent): void {
  searchBarScrollChangedFlag.value = false
  pathIndicatorAnchorIndex.value = index
  pathIndicatorAnchorEl.value = evt.currentTarget as HTMLElement
  updatePathIndicator()
}

// endregion

// region 操作区域处理

function handleOperateAreaItemInspect(item: CT, node: TreeNode<CT>): void {
  emit('onItemInspect', item, node)
}

function handleOperateAreaItemEdit(item: CT, node: TreeNode<CT>): void {
  emit('onItemEdit', item, node)
}

function handleOperateAreaItemDelete(item: CT, node: TreeNode<CT>): void {
  emit('onItemDelete', item, node)
}

// endregion
</script>

<style scoped>
.search-tree-panel-container {
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

.search-bar .path-indicator .content-wrapper .content span:last-child {
  width: 0;
  flex-grow: 1;
  font-size: 12px;
  word-break: break-all;
}

.tree-panel {
  display: inline-block;
  min-width: 100%;
}

.scroll-bar {
  height: 100%;
  overflow: auto;
}
</style>
