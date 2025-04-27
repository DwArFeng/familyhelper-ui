<template>
  <div class="note-tree-panel">
    <div class="placeholder" v-if="noteBookId === ''">请选择笔记本</div>
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

import LazySearchTreePanel from '@/components/tree/lazySerachTreePanel/LazySearchTreePanel.vue'

import { type HybridBean } from '@/components/tree/lazySerachTreePanel/types.ts'
import { useOperableHybridLazySearchTreePanel } from '@/components/tree/lazySerachTreePanel/composables.ts'

import { type TreeNode } from '@/components/tree/commons/types.ts'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type DispNoteNode } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteNode.ts'
import {
  childForNoteBookNameLikeDisp as noteNodeChildForNoteBookNameLikeDisp,
  childForNoteBookRootDisp as noteNodeChildForNoteBookRootDisp,
  childForParentDisp as noteNodeChildForParentDisp,
  itemPathFromRootDisp,
  nodePathFromRootDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteNode.ts'
import { type DispNoteItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteItem.ts'
import {
  childForNoteBookNameLikeDisp as noteItemChildForNoteBookNameLikeDisp,
  childForNoteBookRootDisp as noteItemChildForNoteBookRootDisp,
  childForNoteNodeDisp as noteItemChildForNoteNodeDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteItem.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'NoteTreePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  noteBookId: string
  mode?: 'NOTE_MANAGEMENT' | 'DEFAULT'
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
  readonly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onCurrentChanged', item: NoteTreeItem | null, node: TreeNode<NoteTreeItem> | null): void
  (e: 'onItemDelete', item: NoteTreeItem, node: TreeNode<NoteTreeItem>): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Tree 展示处理-----------------------------------------------------------
function operateAreaIconValue(item: NoteTreeItem): string {
  // noinspection JSUnresolvedReference
  if (item.type === 'node') {
    return '\uffd6'
  }
  return '\uffd7'
}

// -----------------------------------------------------------Tree 逻辑处理-----------------------------------------------------------
type NoteTreeItem = {
  tree_node_key: string
  type: 'node' | 'item'
  name: string
  has_no_child: boolean
  node?: DispNoteNode
  item?: DispNoteItem
}

const treePanelRef = useTemplateRef<ComponentExposed<typeof LazySearchTreePanel>>('treePanelRef')

const {
  searchOptionHandler,
  loadRootHandler,
  loadChildHandler,
  queryPathHandler,
  appendRoot,
  append,
  insertBefore,
  insertAfter,
  update,
} = useOperableHybridLazySearchTreePanel<DispNoteNode | DispNoteItem, NoteTreeItem>(
  [
    { type: 'node', beanMap: noteTreeItemNodeMap },
    { type: 'item', beanMap: noteTreeItemItemMap },
  ],
  searchOptionCaller,
  loadRootCaller,
  loadChildCaller,
  queryPathCaller,
  treePanelRef,
)

function noteTreeItemNodeMap(t: DispNoteNode | DispNoteItem): NoteTreeItem {
  const st = t as DispNoteNode
  return {
    tree_node_key: `node_${st.key.long_id}`,
    type: 'node',
    name: st.name,
    has_no_child: st.has_no_child,
    node: st,
  }
}

function noteTreeItemItemMap(t: DispNoteNode | DispNoteItem): NoteTreeItem {
  const st = t as DispNoteItem
  return {
    tree_node_key: `item_${st.key.long_id}`,
    type: 'item',
    name: st.name,
    has_no_child: true,
    item: st,
  }
}

async function searchOptionCaller(
  pattern: string,
): Promise<HybridBean<DispNoteNode | DispNoteItem>[]> {
  // 如果 noteBookKey 为空字符串，则返回空数组。
  if (props.noteBookId === '') {
    return []
  }
  // 如果 pattern 是空字符串，则返回空数组。
  if (pattern === '') {
    return []
  }
  // 查询笔记本的子节点和子项目。
  const nodePromise = lookupAllToList((pagingInfo) =>
    noteNodeChildForNoteBookNameLikeDisp({ long_id: props.noteBookId }, pattern, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'node', bean: t }))))
  const itemPromise = lookupAllToList((pagingInfo) =>
    noteItemChildForNoteBookNameLikeDisp({ long_id: props.noteBookId }, pattern, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'item', bean: t }))))
  const res = await Promise.all([nodePromise, itemPromise])
  // 返回结果。
  return [...res[0], ...res[1]]
}

async function loadRootCaller(): Promise<HybridBean<DispNoteNode | DispNoteItem>[]> {
  // 如果 noteBookKey 为空字符串，则返回空数组。
  if (props.noteBookId === '') {
    return []
  }
  // 查询笔记本的根节点和根项目。
  const nodePromise = lookupAllToList((pagingInfo) =>
    noteNodeChildForNoteBookRootDisp({ long_id: props.noteBookId }, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'node', bean: t }))))
  const itemPromise = lookupAllToList((pagingInfo) =>
    noteItemChildForNoteBookRootDisp({ long_id: props.noteBookId }, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'item', bean: t }))))
  const res = await Promise.all([nodePromise, itemPromise])
  // 返回结果。
  return [...res[0], ...res[1]]
}

async function loadChildCaller(
  ct: NoteTreeItem,
): Promise<HybridBean<DispNoteNode | DispNoteItem>[]> {
  // 如果 noteBookKey 为空字符串，则返回空数组。
  if (props.noteBookId === '') {
    return []
  }
  // 如果 display_type 为 'item' 开头，说明是项目，没有子节点，返回空数组。
  if (ct.type === 'item') {
    return []
  }
  const nodeKey: LongIdKey | null = ct.node?.key ?? null
  if (!nodeKey) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  // 查询节点的子节点和子项目。
  const nodePromise = lookupAllToList((pagingInfo) =>
    noteNodeChildForParentDisp(nodeKey, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'node', bean: t }))))
  const itemPromise = lookupAllToList((pagingInfo) =>
    noteItemChildForNoteNodeDisp(nodeKey, pagingInfo),
  ).then((res) => Promise.resolve(res.map((t) => ({ type: 'item', bean: t }))))
  const res = await Promise.all([nodePromise, itemPromise])
  // 返回结果。
  return [...res[0], ...res[1]]
}

async function queryPathCaller(
  ct: NoteTreeItem,
): Promise<HybridBean<DispNoteNode | DispNoteItem>[]> {
  // 如果 noteBookKey 为空字符串，则返回空数组。
  if (props.noteBookId === '') {
    return []
  }
  // 判断 display_type 的类型，分别调用不同的接口。
  let promise: Promise<HybridBean<DispNoteNode | DispNoteItem>[]>
  if (ct.type === 'node') {
    const nodeKey: LongIdKey | null = ct.node?.key ?? null
    if (!nodeKey) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    promise = resolveResponse(nodePathFromRootDisp(nodeKey)).then((res) =>
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
    promise = resolveResponse(itemPathFromRootDisp(itemKey)).then((res) =>
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
  () => props.noteBookId,
  () => {
    if (!treePanelRef.value) {
      return
    }
    treePanelRef.value.refresh()
  },
)

// -----------------------------------------------------------事件转发处理-----------------------------------------------------------
function handleCurrentChanged(
  item: NoteTreeItem | null,
  node: TreeNode<NoteTreeItem> | null,
): void {
  emit('onCurrentChanged', item, node)
}

function handleItemDelete(item: NoteTreeItem, node: TreeNode<NoteTreeItem>): void {
  emit('onItemDelete', item, node)
}

// -----------------------------------------------------------树操作-----------------------------------------------------------
function appendRootNoteNode(noteNode: DispNoteNode): void {
  appendRoot({ type: 'node', bean: noteNode })
}

function appendRootNoteItem(noteItem: DispNoteItem): void {
  appendRoot({ type: 'item', bean: noteItem })
}

function appendNoteNode(nodeRef: TreeNode<NoteTreeItem>, noteNode: DispNoteNode): void {
  append(nodeRef, { type: 'node', bean: noteNode })
}

function appendNoteItem(nodeRef: TreeNode<NoteTreeItem>, noteItem: DispNoteItem): void {
  append(nodeRef, { type: 'item', bean: noteItem })
}

function insertBeforeNoteNode(nodeRef: TreeNode<NoteTreeItem>, noteNode: DispNoteNode): void {
  insertBefore(nodeRef, { type: 'node', bean: noteNode })
}

function insertBeforeNoteItem(nodeRef: TreeNode<NoteTreeItem>, noteItem: DispNoteItem): void {
  insertBefore(nodeRef, { type: 'item', bean: noteItem })
}

function insertAfterNoteNode(nodeRef: TreeNode<NoteTreeItem>, noteNode: DispNoteNode): void {
  insertAfter(nodeRef, { type: 'node', bean: noteNode })
}

function insertAfterNoteItem(nodeRef: TreeNode<NoteTreeItem>, noteItem: DispNoteItem): void {
  insertAfter(nodeRef, { type: 'item', bean: noteItem })
}

function updateNoteNode(noteNode: DispNoteNode): void {
  update({ type: 'node', bean: noteNode })
}

function updateNoteItem(noteItem: DispNoteItem): void {
  update({ type: 'item', bean: noteItem })
}

function remove(treeItem: NoteTreeItem): void {
  if (!treePanelRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treePanelRef.value.remove(treeItem)
}

defineExpose({
  appendRootNoteNode,
  appendRootNoteItem,
  appendNoteNode,
  appendNoteItem,
  insertBeforeNoteNode,
  insertBeforeNoteItem,
  insertAfterNoteNode,
  insertAfterNoteItem,
  updateNoteNode,
  updateNoteItem,
  remove,
})
</script>

<style scoped>
.note-tree-panel {
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
