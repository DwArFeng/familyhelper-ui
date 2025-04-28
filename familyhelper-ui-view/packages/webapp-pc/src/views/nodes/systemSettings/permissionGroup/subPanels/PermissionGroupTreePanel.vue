<template>
  <div class="permission-group-tree-panel-container">
    <lazy-search-tree-panel
      ref="treePanelRef"
      key-field="tree_node_key"
      label-field="name"
      is-leaf-field="has_no_child"
      accordion
      :inspect-button-visible="false"
      :search-option-handler="searchOptionHandler"
      :load-root-handler="loadRootHandler"
      :load-child-handler="loadChildHandler"
      :query-path-handler="queryPathHandler"
      @onCurrentChanged="handleCurrentChanged"
      @onItemInspect="handleItemInspect"
      @onItemEdit="handleItemEdit"
      @onItemDelete="handleItemDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import LazySearchTreePanel from '@/components/tree/lazySerachTreePanel/LazySearchTreePanel.vue'
import { useOperableGeneralLazySearchTreePanel } from '@/components/tree/lazySerachTreePanel/composables.ts'

import { type TreeNode } from '@/components/tree/commons/types.ts'

import { type DispPermissionGroup } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup.ts'
import {
  childForParentDisp,
  childForRootDisp,
  nameLikeDisp,
  pathFromRootDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionGroupTreePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  mode?: 'PERMISSION_GROUP' | 'GENERAL' | 'DEFAULT' | 'DRIVER_SETTING'
}

withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (
    e: 'onCurrentChanged',
    item: PermissionGroupTreeItem | null,
    node: TreeNode<PermissionGroupTreeItem> | null,
  ): void
  (
    e: 'onPermissionGroupInspect',
    item: PermissionGroupTreeItem,
    node: TreeNode<PermissionGroupTreeItem>,
  ): void
  (
    e: 'onPermissionGroupEdit',
    item: PermissionGroupTreeItem,
    node: TreeNode<PermissionGroupTreeItem>,
  ): void
  (
    e: 'onPermissionGroupDelete',
    item: PermissionGroupTreeItem,
    node: TreeNode<PermissionGroupTreeItem>,
  ): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Tree 逻辑处理-----------------------------------------------------------
type PermissionGroupTreeItem = {
  tree_node_key: string
  key_string_id: string
  parent_key_string_id: string
  name: string
  remark: string
  has_no_child: boolean
  permission_group: DispPermissionGroup
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
} = useOperableGeneralLazySearchTreePanel<DispPermissionGroup, PermissionGroupTreeItem>(
  dispPermissionGroupTreeDataMap,
  searchOptionCaller,
  loadRootCaller,
  loadChildCaller,
  queryPathCaller,
  treePanelRef,
)

function dispPermissionGroupTreeDataMap(t: DispPermissionGroup): PermissionGroupTreeItem {
  return {
    tree_node_key: t.key.string_id,
    key_string_id: t.key.string_id,
    parent_key_string_id: t.parent_key?.string_id ?? '',
    name: t.name,
    remark: t.remark,
    has_no_child: t.has_no_child,
    permission_group: t,
  }
}

function searchOptionCaller(pattern: string): Promise<DispPermissionGroup[]> {
  return lookupAllToList((pagingInfo) => nameLikeDisp(pattern, pagingInfo))
}

function loadRootCaller(): Promise<DispPermissionGroup[]> {
  return lookupAllToList((pagingInfo) => childForRootDisp(pagingInfo))
}

function loadChildCaller(ct: PermissionGroupTreeItem): Promise<DispPermissionGroup[]> {
  return lookupAllToList((pagingInfo) => childForParentDisp(ct.permission_group.key, pagingInfo))
}

async function queryPathCaller(ct: PermissionGroupTreeItem): Promise<DispPermissionGroup[]> {
  const pagedData: PagedData<DispPermissionGroup> = await resolveResponse(
    pathFromRootDisp(ct.permission_group.key),
  )
  return pagedData.data
}

// -----------------------------------------------------------事件转发处理-----------------------------------------------------------
function handleCurrentChanged(
  item: PermissionGroupTreeItem | null,
  node: TreeNode<PermissionGroupTreeItem> | null,
): void {
  emit('onCurrentChanged', item, node)
}

function handleItemInspect(
  item: PermissionGroupTreeItem,
  node: TreeNode<PermissionGroupTreeItem>,
): void {
  emit('onPermissionGroupInspect', item, node)
}

function handleItemEdit(
  item: PermissionGroupTreeItem,
  node: TreeNode<PermissionGroupTreeItem>,
): void {
  emit('onPermissionGroupEdit', item, node)
}

function handleItemDelete(
  item: PermissionGroupTreeItem,
  node: TreeNode<PermissionGroupTreeItem>,
): void {
  emit('onPermissionGroupDelete', item, node)
}

// -----------------------------------------------------------树操作-----------------------------------------------------------
function remove(treeItem: PermissionGroupTreeItem): void {
  if (!treePanelRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  treePanelRef.value.remove(treeItem)
}

defineExpose({
  appendRoot,
  append,
  insertBefore,
  insertAfter,
  update,
  remove,
})
</script>

<style scoped>
.permission-group-tree-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
