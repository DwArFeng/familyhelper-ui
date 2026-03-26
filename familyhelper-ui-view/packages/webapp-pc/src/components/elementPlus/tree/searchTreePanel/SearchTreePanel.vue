<template>
  <!--suppress VueUnrecognizedDirective -->
  <div class="search-tree-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <div class="flex-item expand search-bar">
            <transition name="path-indicator">
              <div
                class="path-indicator"
                ref="pathIndicatorRef"
                v-show="pathIndicatorVisible"
                :style="pathIndicatorStyle"
              >
                <div class="content-wrapper">
                  <div class="content">
                    <el-icon>
                      <aim-icon />
                    </el-icon>
                    <span>{{ pathIndicatorContent }}</span>
                  </div>
                </div>
              </div>
            </transition>
            <el-select
              class="select"
              ref="searchBarRef"
              value-key="key"
              v-model="searchBarValue as object"
              filterable
              clearable
              :placeholder="searchBarPlaceholder"
              :popper-append-to-body="false"
              :filter-method="handleSearchBarSearched"
              @change="handleSearchBarChanged"
              @visible-change="handleSearchBarVisibleChanged"
              @popup-scroll="handleSelectPopupScrolled"
            >
              <el-option
                ref="searchBarOptionRefs"
                v-for="(item, index) in searchBarOptions"
                :key="index"
                :label="(item.bean as any)[labelField] as string"
                :value="item"
              >
                <slot name="default" :node="null" :item="item.bean">
                  <default-tree-default-slot :label="(item.bean as any)[labelField] as string" />
                </slot>
              </el-option>
            </el-select>
          </div>
        </div>
      </template>
      <template v-slot:default>
        <overlay-scrollbars-component class="scroll-bar">
          <el-tree
            class="tree-panel"
            ref="treeRef"
            :data="items"
            :props="treeProps"
            :accordion="treeAccordion"
            :expand-on-click-node="false"
            :check-on-click-node="true"
            :node-key="keyField as string"
            :highlight-current="true"
            @current-change="handleTreeCurrentChanged"
          >
            <template v-slot:default="{ node, data }">
              <div class="tree-node">
                <div class="tree-node-content">
                  <slot name="default" :node="node" :item="data">
                    <default-tree-default-slot :label="data[labelField]" />
                  </slot>
                </div>
                <div
                  class="tree-node-operate-area"
                  v-if="operateAreaVisible"
                  @mouseenter="treeOperateAreaHover = true"
                  @mouseleave="treeOperateAreaHover = false"
                >
                  <slot
                    name="operateArea"
                    :node="node"
                    :item="data"
                    :fireItemInspect="() => handleOperateAreaItemInspect(data, node)"
                    :fireItemEdit="() => handleOperateAreaItemEdit(data, node)"
                    :fireItemDelete="() => handleOperateAreaItemDelete(data, node)"
                  >
                    <default-tree-operate-area-slot
                      :node="node"
                      :item="data"
                      :inspectButtonVisible="inspectButtonVisible"
                      :editButtonVisible="editButtonVisible"
                      :deleteButtonVisible="deleteButtonVisible"
                      @onItemInspect="handleOperateAreaItemInspect"
                      @onItemEdit="handleOperateAreaItemEdit"
                      @onItemDelete="handleOperateAreaItemDelete"
                    />
                  </slot>
                </div>
              </div>
            </template>
          </el-tree>
        </overlay-scrollbars-component>
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { type Ref } from 'vue'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

import { ElOption, ElSelect, ElTree, type TreeOptionProps as ElTreeOptionProps } from 'element-plus'

import { Aim as AimIcon } from '@element-plus/icons-vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import DefaultTreeDefaultSlot from '@/components/elementPlus/tree/commons/DefaultTreeDefaultSlot.vue'
import DefaultTreeOperateAreaSlot from '@/components/elementPlus/tree/commons/DefaultTreeOperateAreaSlot.vue'

import { type TreeNode } from '@/components/elementPlus/tree/commons/types.ts'
import { type Node } from 'element-plus/es/components/tree/src/model/node'

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
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: DefaultSlotProps) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operateArea?: (props: OperateAreaSlotProps) => any
}>()

// endregion

// region Tree 数据处理

watch(
  () => props.items,
  () => {
    // 重置搜索栏状态。
    searchBarValue.value = null
    searchBarOptions.value = []
    searchBarDropdownVisible.value = false
    searchBarScrollChangedFlag.value = false
    // 重置路径指示器状态。
    hidePathIndicator()
    pathIndicatorAnchorIndex.value = -1
    // 清空树的选中状态。
    setCurrent(null)
  },
  { deep: true },
)

// endregion

// region Tree 处理

const treeOperateAreaHover = ref<boolean>(false)

const treeProps = computed(() => {
  return {
    label: props.labelField,
    children: props.childrenField,
    disabled: props.disabledField,
  } as ElTreeOptionProps
})

const treeRef = useTemplateRef<InstanceType<typeof ElTree>>('treeRef')

// Element Plus 的 API 中，handleTreeCurrentChanged 的 _current 参数类型为 any，故忽略类型警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleTreeCurrentChanged(_current: any, _node: Node | null): void {
  // Element Plus emits (data, node) with generic Node types; accept any and cast internally.
  const current: CT | null = (_current as CT) ?? null
  const node: TreeNode<CT> | null = (_node as TreeNode<CT>) ?? null

  if (searchBarValue.value) {
    if (!current) {
      searchBarValue.value = null
      return
    } else {
      const selectKey: string = searchBarValue.value.key
      const treeKey: string = current[props.keyField] as string
      if (selectKey !== treeKey) {
        searchBarValue.value = null
      }
    }
  }
  if (!treeOperateAreaHover.value) {
    emit('onCurrentChanged', current, node)
  }
}

function getItem(key: string): CT {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const treeNode: TreeNode<CT> = treeRef.value.getNode(key) as TreeNode<CT>
  return treeNode.data
}

function getNode(key: string): TreeNode<CT> {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return treeRef.value.getNode(key) as TreeNode<CT>
}

function setCurrent(item: CT | null): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treeRef.value.setCurrentKey(item ? item[props.keyField] : undefined)
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
const searchBarDropdownVisible = ref<boolean>(false)
const searchBarScrollChangedFlag = ref<boolean>(false)

const searchBarRef = useTemplateRef<InstanceType<typeof ElSelect>>('searchBarRef')
const searchBarOptionRefs = useTemplateRef<InstanceType<typeof ElOption>[]>('searchBarOptionRefs')

function handleSearchBarSearched(pattern: string): void {
  /**
   * 执行前端搜索，返回匹配的节点列表。
   */
  function performSearch(pattern: string): PathBean[] {
    // 如果 pattern 是空字符串，返回空数组。
    if (pattern === '') {
      return []
    }
    // 收集所有节点及其路径。
    const allNodesWithPath = collectAllNodesWithPath(props.items)
    // 使用 searchFilterHandler 进行过滤。
    return allNodesWithPath.filter((item) => props.searchFilterHandler(pattern, item.bean))
  }

  /**
   * 递归遍历树，收集所有节点及其路径。
   */
  function collectAllNodesWithPath(data: CT[]): PathBean[] {
    const result: PathBean[] = []
    function traverse(items: CT[], currentPath: CT[]): void {
      for (const item of items) {
        const newPath = [...currentPath, item]
        result.push({ key: item[props.keyField], bean: item, path: newPath })
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

  // 如果 pattern 是空字符串，显示所有选项（但实际应该为空，因为用户没有输入）。
  if (pattern === '') {
    searchBarOptions.value = []
    return
  }
  // 执行搜索。
  // 使用 nextTick 确保在下一个 tick 更新，避免阻塞 UI。
  nextTick(() => {
    searchBarOptions.value = performSearch(pattern)
  })
}

function handleSearchBarVisibleChanged(visible: boolean): void {
  searchBarDropdownVisible.value = visible
  updatePathIndicator()
}

function handleSearchBarChanged(value: PathBean): void {
  // 如果未选中任何值，不进行操作。
  if (!value) {
    return
  }

  /**
   * 用比较 hack 的方式获取树的节点映射。
   */
  function nodeMap(): Record<string, TreeNode<CT>> {
    if (!treeRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    return treeRef.value.store.nodesMap as Record<string, TreeNode<CT>>
  }

  function mayCollapseOtherNode(path: CT[]): void {
    // 如果 accordion 为 false，不进行操作。
    if (!props.treeAccordion) {
      return
    }
    // 获取树的节点映射。
    const nm: Record<string, TreeNode<CT>> = nodeMap()
    path.forEach((item) => {
      // 获取节点的 identifier。
      const key: string = item[props.keyField]
      // 获取节点。
      const node: TreeNode<CT> = nm[key]
      // 获取节点的 id。
      const id: number = node.id
      // 获取该节点的所有兄弟节点。
      if (!node.parent) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      const siblings: TreeNode<CT>[] = node.parent.childNodes
      // 遍历兄弟节点，收起所有不是当前节点的节点。
      siblings.forEach((sibling) => {
        if (sibling.id !== id) {
          sibling.collapse()
        }
      })
    })
  }

  // 使用 value 中的路径。
  const path = value.path
  if (path.length === 0) {
    return
  }

  // 获取树的节点映射。
  const nm: Record<string, TreeNode<CT>> = nodeMap()
  // 展开路径中的所有节点。
  path.forEach((item) => {
    const key: string = item[props.keyField]
    const node: TreeNode<CT> = nm[key]
    if (node) {
      node.expand()
    }
  })
  // 定义中间变量。
  const currentKey: string = value.bean[props.keyField]
  const currentNode: TreeNode<CT> = nm[currentKey]
  if (!currentNode) {
    return
  }
  const currentItem: CT = value.bean
  // 选中 value 对应的节点。
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treeRef.value.setCurrentKey(currentKey)
  // 发送 onCurrentChanged 事件。
  emit('onCurrentChanged', currentItem, currentNode)
  // 如果 accordion 为 true，收起其他节点。
  mayCollapseOtherNode(path)
}

function handleSelectPopupScrolled(): void {
  if (hoverIndexHackTriggeredFlag) {
    hoverIndexHackTriggeredFlag = false
    return
  }
  searchBarScrollChangedFlag.value = true
  updatePathIndicator()
}

// endregion

// region PathIndicator 处理

const pathIndicatorVisible = ref<boolean>(false)
const pathIndicatorAnchorIndex = ref<number>(-1)
const pathIndicatorContent = ref<string>('')
const pathIndicatorStyleTop = ref<number>(0)
const pathIndicatorStyleLeft = ref<number>(0)
const pathIndicatorStyleWidth = ref<number>(100)

const pathIndicatorRef = useTemplateRef<HTMLElement>('pathIndicatorRef')

let pathIndicatorUpdateCount: number = 0
let pathIndicatorTimer: number | null = null
let hoverIndexHackTriggeredFlag: boolean = false

const pathIndicatorStyle = computed(() => ({
  top: `${pathIndicatorStyleTop.value}px`,
  left: `${pathIndicatorStyleLeft.value}px`,
  width: `${pathIndicatorStyleWidth.value}px`,
}))

const shouldPathIndicatorHide = computed(
  () =>
    pathIndicatorAnchorIndex.value === -1 ||
    !searchBarDropdownVisible.value ||
    searchBarScrollChangedFlag.value,
)

function updatePathIndicator(): void {
  // 首先隐藏 pathIndicator。
  hidePathIndicator()
  // 如果 pathIndicator 不应该可见，不进行操作（即不显示 pathIndicator）。
  if (shouldPathIndicatorHide.value) {
    return
  }
  // 设置延迟防抖，并在延迟结束后显示 pathIndicator。
  pathIndicatorTimer = setTimeout(() => {
    // 经过延时后，pathIndicator 的状态可能会发生变化，应再次判断。
    if (shouldPathIndicatorHide.value) {
      return
    }
    showPathIndicator()
  }, 500) as unknown as number
}

function showPathIndicator(): void {
  function adjustPathIndicatorStyle(): void {
    // 获取指定的索引对应的 searchBarOptionEl。
    if (!searchBarOptionRefs.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    const searchBarOptionEl: HTMLElement =
      searchBarOptionRefs.value[pathIndicatorAnchorIndex.value].$el
    // 获取 searchBarOptionEl 的位置，作为参考位置。
    const searchBarTop: number = searchBarOptionEl.getBoundingClientRect().top
    const searchBarLeft: number = searchBarOptionEl.getBoundingClientRect().left
    // 调整 pathIndicator 的位置以及尺寸。
    if (!pathIndicatorRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    // 下一 Tick 执行，以确保 pathIndicatorRef 已经挂载。
    nextTick(() => {
      if (!pathIndicatorRef.value) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      pathIndicatorStyleTop.value = searchBarTop - 2 - pathIndicatorRef.value.offsetHeight
      pathIndicatorStyleLeft.value = searchBarLeft + 10
      pathIndicatorStyleWidth.value = searchBarOptionEl.offsetWidth - 20
    })
  }

  // updateCountSnapshot 用于记录当前的更新次数。
  const updateCountSnapshot = ++pathIndicatorUpdateCount
  // 获取 searchBar 的 option。
  const option = searchBarOptions.value[pathIndicatorAnchorIndex.value]
  if (!option) {
    return
  }
  // 设置 pathIndicator 的显示状态。
  pathIndicatorVisible.value = true
  // 调整 pathIndicator 的位置以及尺寸。
  adjustPathIndicatorStyle()
  // 使用 option 中的路径。
  nextTick(() => {
    // 如果 updateCountSnapshot 不等于 pathIndicatorUpdateCount，说明 pathIndicator 已经更新。
    if (updateCountSnapshot !== pathIndicatorUpdateCount) {
      return
    }
    // 定义路径字符串。
    let pathString: string = props.pathIndicatorDelimiter
    // 拼接路径字符串。
    option.path.forEach((item) => {
      pathString += item[props.labelField] + props.pathIndicatorDelimiter
    })
    // 设置 pathIndicator 内容。
    pathIndicatorContent.value = pathString
    // 调整 pathIndicator 的位置以及尺寸。
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

// 使用 hack 的方式，监听 searchBar 的 states.hoveringIndex 属性，以此实现对 searchBar 下拉框 hover 索引的监听。
onMounted(() => {
  const searchBarRefValue = searchBarRef.value
  if (!searchBarRefValue) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  watch(
    () => searchBarRefValue.states.hoveringIndex,
    (value) => {
      searchBarScrollChangedFlag.value = false
      pathIndicatorAnchorIndex.value = value
      updatePathIndicator()
      hoverIndexHackTriggeredFlag = true
    },
  )
})

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

.search-bar .path-indicator i {
  margin-right: 5px;
  font-size: 14px;
}

.search-bar .path-indicator .content-wrapper .content span {
  width: 0;
  flex-grow: 1;
  font-size: 12px;
  word-break: break-all;
}

.select {
  height: 100%;
  width: 100%;
}

.select :deep(input) {
  cursor: text;
}

.tree-panel {
  display: inline-block;
  min-width: 100%;
}

/*noinspection CssUnusedSymbol*/
.tree-panel :deep(.el-tree-node__content) {
  height: 100%;
  margin-bottom: 2px;
}

.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
}

.tree-node-content {
  height: 100%;
  width: 0;
  flex-grow: 1;
}

.tree-node-operate-area {
  height: 100%;
}
</style>
