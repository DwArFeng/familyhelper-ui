<template>
  <!--suppress VueUnrecognizedDirective -->
  <div class="lazy-search-tree-panel-container" v-loading="loading">
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
                  <div v-if="pathIndicatorLoading > 0" class="content">
                    <el-icon>
                      <loading-icon />
                    </el-icon>
                    <span>{{ pathIndicatorLoadingText }}</span>
                  </div>
                  <div v-else class="content">
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
              v-model="searchBarValue as object"
              filterable
              remote
              clearable
              :loading="searchBarLoading > 0"
              :placeholder="searchBarPlaceholder"
              :value-key="keyField as string"
              :popper-append-to-body="false"
              :remote-method="handleSearchBarSearched"
              :loading-text="searchBarLoadingText"
              @change="handleSearchBarChanged"
              @visible-change="handleSearchBarVisibleChanged"
              @popup-scroll="handleSelectPopupScrolled"
            >
              <el-option
                ref="searchBarOptionRefs"
                v-for="(item, index) in searchBarOptions"
                :key="index"
                :label="(item as any)[labelField] as string"
                :value="item"
              >
                <slot name="default" :node="null" :item="item">
                  <default-tree-default-slot :label="(item as any)[labelField] as string" />
                </slot>
              </el-option>
            </el-select>
          </div>
          <el-button class="flex-item search-button" :icon="RefreshIcon" @click="handleRefresh" />
        </div>
      </template>
      <template v-slot:default>
        <overlay-scrollbars-component class="scroll-bar">
          <el-tree
            class="tree-panel"
            ref="treeRef"
            lazy
            :data="treeRoot"
            :props="treeProps"
            :accordion="treeAccordion"
            :load="handleTreeLoad as LoadFunction"
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

import { type LoadFunction, type TreeOptionProps as ElTreeOptionProps } from 'element-plus'
import { ElOption, ElSelect, ElTree } from 'element-plus'

import {
  Aim as AimIcon,
  Loading as LoadingIcon,
  Refresh as RefreshIcon,
} from '@element-plus/icons-vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import DefaultTreeDefaultSlot from '@/components/tree/commons/DefaultTreeDefaultSlot.vue'
import DefaultTreeOperateAreaSlot from '@/components/tree/commons/DefaultTreeOperateAreaSlot.vue'

import { type TreeNode } from '@/components/tree/commons/types.ts'

defineOptions({
  name: 'LazySearchTreePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
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

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onCurrentChanged', current: CT | null, node: TreeNode<CT> | null): void
  (e: 'onItemInspect', item: CT, node: TreeNode<CT>): void
  (e: 'onItemEdit', item: CT, node: TreeNode<CT>): void
  (e: 'onItemDelete', item: CT, node: TreeNode<CT>): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
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

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------初始化/重置逻辑-----------------------------------------------------------
function handleLoadRoot(): void {
  // 构造 accept 函数。
  const accept = (res: CT[]) => {
    treeRoot.value = []
    treeRoot.value.push(...res)
    loading.value -= 1
  }
  // 调用 loadRootHandler 加载根节点。
  loading.value += 1
  props.loadRootHandler(accept)
}

function handleRefresh(): void {
  searchBarValue.value = null
  searchBarOptions.value = []
  treeRoot.value = []
  handleLoadRoot()
  searchBarDropdownVisible.value = false
  updatePathIndicator()
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treeRef.value.setCurrentKey()
}

onMounted(() => {
  handleLoadRoot()
})

// -----------------------------------------------------------Tree 处理-----------------------------------------------------------
const treeRoot = ref<CT[]>([]) as Ref<CT[]>
const treeOperateAreaHover = ref<boolean>(false)

const treeProps = computed(() => {
  return {
    label: props.labelField,
    isLeaf: props.isLeafField,
    children: props.childrenField,
    disabled: props.disabledField,
  } as ElTreeOptionProps
})

const treeRef = useTemplateRef<InstanceType<typeof ElTree>>('treeRef')

function handleTreeLoad(node: TreeNode<CT>, resolve: (result: CT[]) => void): void {
  // 此方法不托管根节点的加载，因此如果判断是根节点，直接返回。
  if (node.level === 0) {
    return
  }
  // 调用 loadChildHandler 加载子节点。
  props.loadChildHandler(node.data, resolve)
}

function handleTreeCurrentChanged(current: CT, node: TreeNode<CT>): void {
  if (searchBarValue.value) {
    if (!current) {
      searchBarValue.value = null
      return
    } else {
      const selectKey: string = searchBarValue.value[props.keyField] as string
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

function appendRoot(item: CT): void {
  treeRoot.value.push(item)
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  nextTick(() => {
    if (!treeRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    if (
      treeRef.value.getCurrentNode() &&
      treeRef.value.getCurrentNode()[props.keyField] === item[props.keyField]
    ) {
      treeRef.value.setCurrentKey()
    }
    if (!treeRef.value.getCurrentNode()) {
      treeRef.value.setCurrentKey(item[props.keyField])
    }
  })
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
  // 判断更新的项目是否是当前选中的节点对应的项目。
  // 如果更新的是当前选中的节点对应的项目，则需要触发 onCurrentChanged 事件，
  // 使得组件的使用方可以获取到最新的当前选中节点。
  let emitOnCurrentChangedFlag: boolean = false
  if (
    treeRef.value.getCurrentNode() &&
    treeRef.value.getCurrentNode()[props.keyField] === item[props.keyField]
  ) {
    emitOnCurrentChangedFlag = true
  }
  // 节点数据更新。
  const treeNode: TreeNode<CT> = treeRef.value.getNode(item) as TreeNode<CT>
  treeNode.data = item
  // 如果需要触发 onCurrentChanged 事件，则触发。
  if (emitOnCurrentChangedFlag) {
    emit('onCurrentChanged', item, treeNode)
  }
}

function remove(item: CT): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treeRef.value.remove(item)
}

function setCurrent(item: CT): void {
  if (!treeRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treeRef.value.setCurrentKey(item[props.keyField])
}

function refresh(): void {
  handleRefresh()
}

defineExpose({
  getItem,
  getNode,
  appendRoot,
  append,
  insertBefore,
  insertAfter,
  update,
  remove,
  setCurrent,
  refresh,
})

// -----------------------------------------------------------SearchBar 处理-----------------------------------------------------------
const searchBarLoading = ref<number>(0)
const searchBarValue = ref<CT | null>(null)
const searchBarOptions = ref<CT[]>([]) as Ref<CT[]>
const searchBarDropdownVisible = ref<boolean>(false)
const searchBarScrollChangedFlag = ref<boolean>(false)

const searchBarRef = useTemplateRef<InstanceType<typeof ElSelect>>('searchBarRef')
const searchBarOptionRefs = useTemplateRef<InstanceType<typeof ElOption>[]>('searchBarOptionRefs')

function handleSearchBarSearched(pattern: string): void {
  // 如果 pattern 是空字符串，不进行搜索。
  if (pattern === '') {
    searchBarOptions.value = []
    return
  }
  // 构造 accept 函数。
  const accept = (res: CT[]) => {
    searchBarOptions.value = []
    searchBarOptions.value.push(...res)
    searchBarLoading.value -= 1
  }
  // 调用 searchOptionHandler 加载搜索选项。
  searchBarLoading.value += 1
  props.searchOptionHandler(pattern, accept)
}

function handleSearchBarVisibleChanged(visible: boolean): void {
  searchBarDropdownVisible.value = visible
  updatePathIndicator()
}

function handleSearchBarChanged(value: CT): void {
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

  // 构造 accept 函数。
  const accept = (path: CT[]) => {
    // 获取树的节点映射。
    const nm: Record<string, TreeNode<CT>> = nodeMap()
    // 定义 offset 变量，用于记录第一个没被加载的节点的索引。
    let offset: number = 0
    // 遍历查询得到的路径，确认节点是否被加载，获取第一个没被加载的节点的索引。
    for (; offset < path.length; offset += 1) {
      // 获取节点的 identifier。
      const key: string = path[offset][props.keyField]
      // 如果节点没有被加载，跳出循环。
      if (!nm[key]) {
        break
      }
      // 如果节点被加载，但 loaded 为 false，跳出循环。
      if (!nm[key].loaded) {
        break
      }
    }
    // 如果 offset 等于 path.length，说明所有节点都被加载。
    if (offset === path.length) {
      // 遍历查询得到的路径，展开所有节点。
      path.forEach((item) => {
        const key: string = item[props.keyField]
        const node: TreeNode<CT> = nm[key]
        node.expand()
      })
      // 定义中间变量。
      const currentKey: string = value[props.keyField]
      const currentNode: TreeNode<CT> = nm[currentKey]
      const currentItem: CT = currentNode.data
      // 选中 value 对应的节点。
      if (!treeRef.value) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      treeRef.value.setCurrentKey(currentKey)
      // 发送 onCurrentChanged 事件。
      emit('onCurrentChanged', currentItem, currentNode)
      // 如果 accordion 为 true，收起其他节点。
      mayCollapseOtherNode(path)
      // 复位加载状态。
      loading.value -= 1
      // 返回。
      return
    }
    // 获取 index 到 res.length 的剩余元素数量。
    let remainCount: number = path.length - offset
    // 定义 childInfos 变量，用于存储未被加载的所有节点。
    const childInfos: { key: string; children: CT[] }[] = []
    // 构造 accept 函数的构造函数。
    const acceptProvider = (index: number) => (children: CT[]) => {
      // 向 childInfo 中添加节点信息，并减少 remain 的值。
      childInfos[index - offset] = { key: path[index][props.keyField], children }
      remainCount -= 1
      // 如果 remainCount 大于 0，说明还有子节点没有被加载，不进行操作。
      if (remainCount > 0) {
        return
      }
      // 如果 remainCount 等于 0，说明所有子节点都被加载。
      // 将加载的子节点添加到其父节点中。
      childInfos.forEach((childInfo) => {
        const node: TreeNode<CT> = nm[childInfo.key]
        // 将节点设置为已加载。
        node.loaded = true
        // 清除旧的子节点数据。
        node.childNodes = []
        // 将子节点添加到父节点中。
        childInfo.children.forEach((child) => {
          append(node, child)
        })
      })
      // 展开节点。
      path.forEach((item) => {
        const key: string = item[props.keyField]
        const node: TreeNode<CT> = nm[key]
        node.expand()
      })
      // 定义中间变量。
      const currentKey: string = value[props.keyField]
      const currentNode: TreeNode<CT> = nm[currentKey]
      const currentItem: CT = currentNode.data
      // 选中 value 对应的节点。
      if (!treeRef.value) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      treeRef.value.setCurrentKey(currentKey)
      // 发送 onCurrentChanged 事件。
      emit('onCurrentChanged', currentItem, currentNode)
      // 如果 accordion 为 true，收起其他节点。
      mayCollapseOtherNode(path)
      // 复位加载状态。
      loading.value -= 1
    }
    // 从 offset 遍历到 res.length，查询未被加载的所有节点。
    for (let index: number = offset; index < path.length; index += 1) {
      // 构造 accept 函数。
      const accept = acceptProvider(index)
      // 调用 loadChildHandler 加载子节点。
      props.loadChildHandler(path[index], accept)
    }
  }
  // 置位加载标记。
  loading.value += 1
  // 调用 queryPathHandler 查询路径。
  props.queryPathHandler(value, accept)
}

function handleSelectPopupScrolled(): void {
  if (hoverIndexHackTriggeredFlag) {
    hoverIndexHackTriggeredFlag = false
    return
  }
  searchBarScrollChangedFlag.value = true
  updatePathIndicator()
}

// -----------------------------------------------------------PathIndicator 处理-----------------------------------------------------------
const pathIndicatorLoading = ref<number>(0)
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
  }, 500)
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
  // 设置 pathIndicator 加载状态。
  pathIndicatorLoading.value += 1
  // 设置 pathIndicator 的显示状态。
  pathIndicatorVisible.value = true
  // 调整 pathIndicator 的位置以及尺寸。
  adjustPathIndicatorStyle()
  // 调用 queryPathHandler 查询路径。
  // 此处使用 any 不可避免，故屏蔽相关检查。

  new Promise((resolve: (result: CT[]) => void) => {
    props.queryPathHandler(option, (result) => {
      resolve(result)
    })
  })
    .then((paths) => {
      // 如果 updateCountSnapshot 不等于 pathIndicatorUpdateCount，说明 pathIndicator 已经更新。
      if (updateCountSnapshot !== pathIndicatorUpdateCount) {
        // 返回。
        return Promise.resolve()
      } else {
        // 定义路径字符串。
        let pathString: string = props.pathIndicatorDelimiter
        // 拼接路径字符串。
        paths.forEach((item) => {
          pathString += item[props.labelField] + props.pathIndicatorDelimiter
        })
        pathString += option[props.labelField]
        // 设置 pathIndicator 内容。
        pathIndicatorContent.value = pathString
        // 返回。
        return Promise.resolve()
      }
    })
    .finally(() => {
      // 设置 pathIndicator 加载状态。
      pathIndicatorLoading.value -= 1
    })
    .then(() => {
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

// -----------------------------------------------------------操作区域处理-----------------------------------------------------------
function handleOperateAreaItemInspect(item: CT, node: TreeNode<CT>): void {
  emit('onItemInspect', item, node)
}

function handleOperateAreaItemEdit(item: CT, node: TreeNode<CT>): void {
  emit('onItemEdit', item, node)
}

function handleOperateAreaItemDelete(item: CT, node: TreeNode<CT>): void {
  emit('onItemDelete', item, node)
}
</script>

<style scoped>
.lazy-search-tree-panel-container {
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

.search-button {
  height: 32px;
  width: 32px;
  padding: 12px;
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
