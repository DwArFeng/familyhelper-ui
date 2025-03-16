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

import type { ComponentExposed } from 'vue-component-type-helpers'

import LazySearchTreePanel from '@/components/tree/lazySerachTreePanel/LazySearchTreePanel.vue'
import { useOperableGeneralLazySearchTreePanel } from '@/components/tree/lazySerachTreePanel/composables.ts'

import type { TreeNode } from '@/components/tree/commons/types.ts'

import type { DispPermissionGroupTreeItem } from '../types.ts'

import type { DispPermissionGroup } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup.ts'
import {
  childForParentDisp,
  childForRootDisp,
  nameLikeDisp,
  pathFromRootDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup.ts'
import type { PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
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
    item: DispPermissionGroupTreeItem | null,
    node: TreeNode<DispPermissionGroupTreeItem> | null,
  ): void
  (
    e: 'onPermissionGroupInspect',
    item: DispPermissionGroupTreeItem,
    node: TreeNode<DispPermissionGroupTreeItem>,
  ): void
  (
    e: 'onPermissionGroupEdit',
    item: DispPermissionGroupTreeItem,
    node: TreeNode<DispPermissionGroupTreeItem>,
  ): void
  (
    e: 'onPermissionGroupDelete',
    item: DispPermissionGroupTreeItem,
    node: TreeNode<DispPermissionGroupTreeItem>,
  ): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Tree 逻辑处理-----------------------------------------------------------
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
  remove,
} = useOperableGeneralLazySearchTreePanel<DispPermissionGroup, DispPermissionGroupTreeItem>(
  dispPermissionGroupTreeDataMap,
  searchOptionCaller,
  loadRootCaller,
  loadChildCaller,
  queryPathCaller,
  treePanelRef,
)

function dispPermissionGroupTreeDataMap(t: DispPermissionGroup): DispPermissionGroupTreeItem {
  return {
    ...t,
    tree_node_key: t.key.string_id,
  }
}

function searchOptionCaller(pattern: string): Promise<DispPermissionGroup[]> {
  return lookupAllToList((pagingInfo) => nameLikeDisp(pattern, pagingInfo))
}

function loadRootCaller(): Promise<DispPermissionGroup[]> {
  return lookupAllToList((pagingInfo) => childForRootDisp(pagingInfo))
}

function loadChildCaller(ct: DispPermissionGroupTreeItem): Promise<DispPermissionGroup[]> {
  return lookupAllToList((pagingInfo) => childForParentDisp(ct.key, pagingInfo))
}

async function queryPathCaller(ct: DispPermissionGroupTreeItem): Promise<DispPermissionGroup[]> {
  const pagedData: PagedData<DispPermissionGroup> = await resolveResponse(pathFromRootDisp(ct.key))
  return pagedData.data
}

// -----------------------------------------------------------事件转发处理-----------------------------------------------------------
function handleCurrentChanged(
  item: DispPermissionGroupTreeItem | null,
  node: TreeNode<DispPermissionGroupTreeItem> | null,
) {
  emit('onCurrentChanged', item, node)
}

function handleItemInspect(
  item: DispPermissionGroupTreeItem,
  node: TreeNode<DispPermissionGroupTreeItem>,
) {
  emit('onPermissionGroupInspect', item, node)
}

function handleItemEdit(
  item: DispPermissionGroupTreeItem,
  node: TreeNode<DispPermissionGroupTreeItem>,
) {
  emit('onPermissionGroupEdit', item, node)
}

function handleItemDelete(
  item: DispPermissionGroupTreeItem,
  node: TreeNode<DispPermissionGroupTreeItem>,
) {
  emit('onPermissionGroupDelete', item, node)
}

// -----------------------------------------------------------树操作-----------------------------------------------------------
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
