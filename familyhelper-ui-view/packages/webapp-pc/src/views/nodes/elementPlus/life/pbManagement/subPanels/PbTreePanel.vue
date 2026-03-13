<template>
  <div class="pb-tree-panel">
    <div class="placeholder" v-if="pbSetKey === ''">请选择个人最佳集合</div>
    <div class="main-container" v-else>
      <lazy-search-tree-panel
        ref="treePanelRef"
        key-field="tree_node_key"
        label-field="name"
        is-leaf-field="has_no_child"
        accordion
        :operate-area-visible="!readonly"
        :inspect-button-visible="false"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :search-option-handler="searchOptionHandler"
        :load-root-handler="loadRootHandler"
        :load-child-handler="loadChildHandler"
        :query-path-handler="queryPathHandler"
        @onCurrentChanged="handleCurrentChanged"
        @onItemDelete="handleItemDelete"
      >
        <template v-slot:default="{ item }">
          <div class="item-container">
            <div class="icon-wrapper">
              <i class="iconfont">{{ operateAreaIconValue(item) }}</i>
            </div>
            <div class="label">{{ item.name }}</div>
          </div>
        </template>
        <template v-slot:operateArea="{ fireItemDelete }">
          <el-button class="button" type="danger" :icon="DeleteIcon" @click="fireItemDelete" />
        </template>
      </lazy-search-tree-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { Delete as DeleteIcon } from '@element-plus/icons-vue'

import LazySearchTreePanel from '@/components/elementPlus/tree/lazySerachTreePanel/LazySearchTreePanel.vue'

import { type HybridBean } from '@/components/elementPlus/tree/lazySerachTreePanel/types.ts'
import { useOperableHybridLazySearchTreePanel } from '@/components/elementPlus/tree/lazySerachTreePanel/composables.ts'

import { type TreeNode } from '@/components/elementPlus/tree/commons/types.ts'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type DispPbNode } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbNode.ts'
import {
  childForPbSetNameLikeDisp as childNodeForPbSetNameLike,
  childForPbSetRootDisp as childNodeForPbSetRoot,
  childForParentDisp as childNodeForParent,
  nodePathFromRootDisp as nodePathFromRoot,
  itemPathFromRootDisp as itemPathFromRoot,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbNode.ts'
import { type DispPbItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbItem.ts'
import {
  childForPbSetNameLikeDisp as childItemForPbNodeNameLike,
  childForPbSetRootDisp as childItemForPbSetRoot,
  childForPbNodeDisp as childItemForPbNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbItem.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PbTreePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  pbSetKey: string
  mode?: 'PB_MANAGEMENT' | 'DEFAULT'
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
  readonly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onCurrentChanged', item: PbTreeItem | null, node: TreeNode<PbTreeItem> | null): void
  (e: 'onEntityDelete', item: PbTreeItem, node: TreeNode<PbTreeItem>, accept: () => void): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Tree 展示处理-----------------------------------------------------------
function operateAreaIconValue(item: PbTreeItem): string {
  if (item.type === 'node') {
    return '\uffd6'
  }
  return '\uffd7'
}

// -----------------------------------------------------------Tree 逻辑处理-----------------------------------------------------------
type PbTreeItem = {
  tree_node_key: string
  type: 'node' | 'item'
  name: string
  has_no_child: boolean
  display_type: 0 | 1
  node?: DispPbNode
  item?: DispPbItem
}

const treePanelRef = useTemplateRef<ComponentExposed<typeof LazySearchTreePanel>>('treePanelRef')

const {
  searchOptionHandler,
  loadRootHandler,
  loadChildHandler,
  queryPathHandler,
  appendRoot,
  append,
  insertAfter,
  update,
} = useOperableHybridLazySearchTreePanel<DispPbNode | DispPbItem, PbTreeItem>(
  [
    { type: 'node', beanMap: pbTreeItemNodeMap },
    { type: 'item', beanMap: pbTreeItemItemMap },
  ],
  searchOptionCaller,
  loadRootCaller,
  loadChildCaller,
  queryPathCaller,
  treePanelRef,
)

function pbTreeItemNodeMap(t: DispPbNode | DispPbItem): PbTreeItem {
  const st = t as DispPbNode
  return {
    tree_node_key: `0_${st.key.long_id}`,
    type: 'node',
    name: st.name,
    has_no_child: st.has_no_child,
    display_type: 0,
    node: st,
  }
}

function pbTreeItemItemMap(t: DispPbNode | DispPbItem): PbTreeItem {
  const st = t as DispPbItem
  return {
    tree_node_key: `1_${st.key.long_id}`,
    type: 'item',
    name: st.name,
    has_no_child: true,
    display_type: 1,
    item: st,
  }
}

async function searchOptionCaller(pattern: string): Promise<HybridBean<DispPbNode | DispPbItem>[]> {
  // 如果 pbSetKey 为空字符串，则返回空数组。
  if (props.pbSetKey === '') {
    return []
  }
  // 如果 pattern 是空字符串，则返回空数组。
  if (pattern === '') {
    return []
  }
  // 查询个人最佳集合的子节点和子项目。
  const nodePromise = lookupAllToList((pagingInfo) =>
    childNodeForPbSetNameLike({ long_id: props.pbSetKey }, pattern, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'node', bean: t }))))
  const itemPromise = lookupAllToList((pagingInfo) =>
    childItemForPbNodeNameLike({ long_id: props.pbSetKey }, pattern, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'item', bean: t }))))
  const res = await Promise.all([nodePromise, itemPromise])
  // 返回结果。
  return [...res[0], ...res[1]]
}

async function loadRootCaller(): Promise<HybridBean<DispPbNode | DispPbItem>[]> {
  // 如果 pbSetKey 为空字符串，则返回空数组。
  if (props.pbSetKey === '') {
    return []
  }
  // 查询个人最佳集合的根节点和根项目。
  const nodePromise = lookupAllToList((pagingInfo) =>
    childNodeForPbSetRoot({ long_id: props.pbSetKey }, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'node', bean: t }))))
  const itemPromise = lookupAllToList((pagingInfo) =>
    childItemForPbSetRoot({ long_id: props.pbSetKey }, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'item', bean: t }))))
  const res = await Promise.all([nodePromise, itemPromise])
  // 返回结果。
  return [...res[0], ...res[1]]
}

async function loadChildCaller(ct: PbTreeItem): Promise<HybridBean<DispPbNode | DispPbItem>[]> {
  // 如果 pbSetKey 为空字符串，则返回空数组。
  if (props.pbSetKey === '') {
    return []
  }
  // 如果 type 为 'item'，说明是项目，没有子节点，返回空数组。
  if (ct.type === 'item') {
    return []
  }
  const nodeKey: LongIdKey | null = ct.node?.key ?? null
  if (!nodeKey) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  // 查询节点的子节点和子项目。
  const nodePromise = lookupAllToList((pagingInfo) => childNodeForParent(nodeKey, pagingInfo)).then(
    (res) => Promise.resolve(res.map((t) => ({ type: 'node', bean: t }))),
  )
  const itemPromise = lookupAllToList((pagingInfo) => childItemForPbNode(nodeKey, pagingInfo)).then(
    (res) => Promise.resolve(res.map((t) => ({ type: 'item', bean: t }))),
  )
  const res = await Promise.all([nodePromise, itemPromise])
  // 返回结果。
  return [...res[0], ...res[1]]
}

async function queryPathCaller(ct: PbTreeItem): Promise<HybridBean<DispPbNode | DispPbItem>[]> {
  // 如果 pbSetKey 为空字符串，则返回空数组。
  if (props.pbSetKey === '') {
    return []
  }
  // 判断 type 的类型，分别调用不同的接口。
  let promise: Promise<HybridBean<DispPbNode | DispPbItem>[]>
  if (ct.type === 'node') {
    const nodeKey: LongIdKey | null = ct.node?.key ?? null
    if (!nodeKey) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    promise = resolveResponse(nodePathFromRoot(nodeKey)).then((res) =>
      Promise.resolve(
        res.data.map((t) => ({
          type: 'node',
          bean: t,
        })),
      ),
    )
  } else {
    const itemKey: LongIdKey | null = ct.item?.key ?? null
    if (!itemKey) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    promise = resolveResponse(itemPathFromRoot(itemKey)).then((res) =>
      Promise.resolve(
        res.data.map((t) => ({
          type: 'node',
          bean: t,
        })),
      ),
    )
  }
  // 返回结果。
  return await promise
}

watch(
  () => props.pbSetKey,
  () => {
    if (!treePanelRef.value) {
      return
    }
    treePanelRef.value.refresh()
  },
)

// -----------------------------------------------------------事件转发处理-----------------------------------------------------------
function handleCurrentChanged(item: PbTreeItem | null, node: TreeNode<PbTreeItem> | null): void {
  emit('onCurrentChanged', item, node)
}

function handleItemDelete(item: PbTreeItem, node: TreeNode<PbTreeItem>): void {
  const accept = () => {
    if (!treePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    treePanelRef.value.remove(item)
  }
  emit('onEntityDelete', item, node, accept)
}

// -----------------------------------------------------------树操作-----------------------------------------------------------
function appendRootPbNode(pbNode: DispPbNode): void {
  appendRoot({ type: 'node', bean: pbNode })
}

function appendRootPbItem(pbItem: DispPbItem): void {
  appendRoot({ type: 'item', bean: pbItem })
}

function appendPbNode(nodeRef: TreeNode<PbTreeItem>, pbNode: DispPbNode): void {
  append(nodeRef, { type: 'node', bean: pbNode })
}

function appendPbItem(nodeRef: TreeNode<PbTreeItem>, pbItem: DispPbItem): void {
  append(nodeRef, { type: 'item', bean: pbItem })
}

function insertPbNodeAfter(nodeRef: TreeNode<PbTreeItem>, pbNode: DispPbNode): void {
  insertAfter(nodeRef, { type: 'node', bean: pbNode })
}

function insertPbItemAfter(nodeRef: TreeNode<PbTreeItem>, pbItem: DispPbItem): void {
  insertAfter(nodeRef, { type: 'item', bean: pbItem })
}

function updatePbNode(pbNode: DispPbNode): void {
  update({ type: 'node', bean: pbNode })
}

function updatePbItem(pbItem: DispPbItem): void {
  update({ type: 'item', bean: pbItem })
}

function remove(treeItem: PbTreeItem): void {
  if (!treePanelRef.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  treePanelRef.value.remove(treeItem)
}

defineExpose({
  appendRootPbNode,
  appendRootPbItem,
  appendPbNode,
  appendPbItem,
  insertPbNodeAfter,
  insertPbItemAfter,
  updatePbNode,
  updatePbItem,
  remove,
})
</script>

<style scoped>
.pb-tree-panel {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
}

.item-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.label {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 14px;
  font-family: Arial, sans-serif;
}

.icon-wrapper {
  margin-right: 5px;
}

.icon-wrapper .iconfont {
  font-size: 18px;
}
</style>
