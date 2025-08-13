<template>
  <div class="item-tree-panel-container">
    <div class="placeholder" v-if="assetCatalogId === ''">请选择资产目录</div>
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
        <template v-slot:operateArea="{ fireItemDelete }">
          <el-button class="button" type="danger" :icon="DeleteIcon" @click="fireItemDelete" />
        </template>
      </lazy-search-tree-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { Delete as DeleteIcon } from '@element-plus/icons-vue'

import LazySearchTreePanel from '@/components/tree/lazySerachTreePanel/LazySearchTreePanel.vue'

import { useOperableGeneralLazySearchTreePanel } from '@/components/tree/lazySerachTreePanel/composables.ts'

import { type TreeNode } from '@/components/tree/commons/types.ts'

import { type DispItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/item.ts'
import {
  childForParentDisp,
  childForAssetCatalogRootDisp,
  childForAssetCatalogNameLikeDisp,
  pathFromRootDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/item.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'
import { watch } from 'vue'

defineOptions({
  name: 'ItemTreePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  assetCatalogId: string
  mode?: 'ASSET_BOM' | 'GENERAL' | 'DEFAULT'
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
  readonly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onCurrentChanged', item: ItemTreeItem | null, node: TreeNode<ItemTreeItem> | null): void
  (e: 'onItemInspect', item: ItemTreeItem, node: TreeNode<ItemTreeItem>): void
  (e: 'onItemEdit', item: ItemTreeItem, node: TreeNode<ItemTreeItem>): void
  (e: 'onItemDelete', item: ItemTreeItem, node: TreeNode<ItemTreeItem>): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Tree 逻辑处理-----------------------------------------------------------
type ItemTreeItem = {
  tree_node_key: string
  name: string
  has_no_child: boolean
  item: DispItem
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
  remove,
} = useOperableGeneralLazySearchTreePanel<DispItem, ItemTreeItem>(
  dispItemTreeDataMap,
  searchOptionCaller,
  loadRootCaller,
  loadChildCaller,
  queryPathCaller,
  treePanelRef,
)

function dispItemTreeDataMap(t: DispItem): ItemTreeItem {
  return {
    tree_node_key: t.key.long_id,
    name: t.name,
    has_no_child: t.has_no_child,
    item: t,
  }
}

function searchOptionCaller(pattern: string): Promise<DispItem[]> {
  return lookupAllToList((pagingInfo) =>
    childForAssetCatalogNameLikeDisp({ long_id: props.assetCatalogId }, pattern, pagingInfo),
  )
}

function loadRootCaller(): Promise<DispItem[]> {
  return lookupAllToList((pagingInfo) =>
    childForAssetCatalogRootDisp({ long_id: props.assetCatalogId }, pagingInfo),
  )
}

function loadChildCaller(ct: ItemTreeItem): Promise<DispItem[]> {
  return lookupAllToList((pagingInfo) => childForParentDisp(ct.item.key, pagingInfo))
}

async function queryPathCaller(ct: ItemTreeItem): Promise<DispItem[]> {
  const pagedData: PagedData<DispItem> = await resolveResponse(pathFromRootDisp(ct.item.key))
  return pagedData.data
}

watch(
  () => props.assetCatalogId,
  () => {
    if (!treePanelRef.value) {
      return
    }
    treePanelRef.value.refresh()
  },
)

// -----------------------------------------------------------事件转发处理-----------------------------------------------------------
function handleCurrentChanged(
  item: ItemTreeItem | null,
  node: TreeNode<ItemTreeItem> | null,
): void {
  emit('onCurrentChanged', item, node)
}

function handleItemDelete(item: ItemTreeItem, node: TreeNode<ItemTreeItem>): void {
  emit('onItemDelete', item, node)
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
.item-tree-panel-container {
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

.button {
  height: 28px;
  width: 28px;
  padding: 7px;
}
</style>
