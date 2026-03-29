<template>
  <div class="permission-group-tree-panel-container">
    <placeholder-panel v-if="scopeId === ''" text="请选择权限作用域" />
    <div v-else class="main-container">
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
        @on-current-changed="handleCurrentChanged"
        @on-item-delete="handleItemDelete"
      >
        <template v-slot:default="{ item }">
          <div class="item-container">
            <div class="label">{{ item.name }}</div>
          </div>
        </template>
        <template v-slot:operateArea="{ fireItemDelete }">
          <native-button size="small" kind="danger" plain @click="fireItemDelete"
            >删除</native-button
          >
        </template>
      </lazy-search-tree-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import LazySearchTreePanel from '@/components/comvisual/tree/lazySearchTreePanel/LazySearchTreePanel.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'

import { useOperableGeneralLazySearchTreePanel } from '@/components/comvisual/tree/lazySearchTreePanel/composables.ts'

import { type TreeNode } from '@/components/comvisual/tree/commons/types.ts'

import { type DispPermissionGroup } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permissionGroup.ts'
import {
  childForScopeRootDisp,
  childForParentDisp,
  nameLikeDisp,
  pathFromRootDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permissionGroup.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionGroupTreePanel',
})

// region Props 定义

type Props = {
  scopeId: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// endregion

// region Emits 定义

type PermissionGroupTreeItem = DispPermissionGroup & { tree_node_key: string }

type Emits = {
  (
    e: 'onCurrentChanged',
    item: PermissionGroupTreeItem | null,
    node: TreeNode<PermissionGroupTreeItem> | null,
  ): void
  (e: 'onItemDelete', item: PermissionGroupTreeItem, node: TreeNode<PermissionGroupTreeItem>): void
}

const emit = defineEmits<Emits>()

// endregion

// region Tree 逻辑处理

function beanMap(d: DispPermissionGroup): PermissionGroupTreeItem {
  return {
    ...d,
    tree_node_key: `${d.key.scope_string_id}::${d.key.permission_group_string_id}`,
  }
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
  remove,
} = useOperableGeneralLazySearchTreePanel<DispPermissionGroup, PermissionGroupTreeItem>(
  beanMap,
  searchOptionCaller,
  loadRootCaller,
  loadChildCaller,
  queryPathCaller,
  treePanelRef,
)

async function searchOptionCaller(pattern: string): Promise<DispPermissionGroup[]> {
  if (props.scopeId === '' || pattern === '') {
    return []
  }
  const list = await lookupAllToList((p) => nameLikeDisp(pattern, p))
  return list.filter((r) => r.key.scope_string_id === props.scopeId)
}

async function loadRootCaller(): Promise<DispPermissionGroup[]> {
  if (props.scopeId === '') {
    return []
  }
  return lookupAllToList((p) => childForScopeRootDisp({ string_id: props.scopeId }, p))
}

async function loadChildCaller(item: PermissionGroupTreeItem): Promise<DispPermissionGroup[]> {
  if (props.scopeId === '') {
    return []
  }
  return lookupAllToList((p) => childForParentDisp(item.key, p))
}

async function queryPathCaller(item: PermissionGroupTreeItem): Promise<DispPermissionGroup[]> {
  if (props.scopeId === '') {
    return []
  }
  const paged = await resolveResponse(pathFromRootDisp(item.key))
  return paged.data
}

watch(
  () => props.scopeId,
  () => {
    if (!treePanelRef.value) {
      return
    }
    treePanelRef.value.refresh()
  },
)

// endregion

// region 事件转发处理

function handleCurrentChanged(
  item: PermissionGroupTreeItem | null,
  node: TreeNode<PermissionGroupTreeItem> | null,
): void {
  emit('onCurrentChanged', item, node)
}

function handleItemDelete(
  item: PermissionGroupTreeItem,
  node: TreeNode<PermissionGroupTreeItem>,
): void {
  emit('onItemDelete', item, node)
}

// endregion

// region 树操作

function appendRootPermissionGroup(perm: DispPermissionGroup): void {
  appendRoot(perm)
}

function appendPermissionGroup(
  nodeRef: TreeNode<PermissionGroupTreeItem>,
  perm: DispPermissionGroup,
): void {
  append(nodeRef, perm)
}

function insertAfterPermissionGroup(
  nodeRef: TreeNode<PermissionGroupTreeItem>,
  perm: DispPermissionGroup,
): void {
  insertAfter(nodeRef, perm)
}

function updatePermissionGroup(perm: DispPermissionGroup): void {
  update(perm)
}

function removePermissionGroup(item: PermissionGroupTreeItem): void {
  if (!treePanelRef.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  remove(item)
}

function refresh(): void {
  if (!treePanelRef.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  treePanelRef.value.refresh()
}

defineExpose({
  appendRootPermissionGroup,
  appendPermissionGroup,
  insertAfterPermissionGroup,
  updatePermissionGroup,
  removePermissionGroup,
  refresh,
})

// endregion
</script>

<style scoped>
.permission-group-tree-panel-container {
  height: 100%;
  width: 100%;
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

.label {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 14px;
  font-family: Arial, sans-serif;
}

.label:before {
  content: '权限组: ';
  font-size: 14px;
  font-family: Arial, sans-serif;
  font-weight: 600;
}
</style>
