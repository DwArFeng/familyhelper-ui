<template>
  <div class="default-tree-operate-area-slot-container">
    <el-button-group>
      <el-button
        class="tree-node-button"
        size="small"
        type="success"
        v-if="inspectButtonVisible"
        :icon="SearchIcon"
        @click="handleItemInspect"
      />
      <el-button
        class="tree-node-button"
        size="small"
        type="primary"
        :icon="EditPen"
        v-if="editButtonVisible"
        @click="handleItemEdit"
      />
      <el-button
        class="tree-node-button"
        type="danger"
        size="small"
        :icon="DeleteIcon"
        v-if="deleteButtonVisible"
        @click="handleItemDelete"
      />
    </el-button-group>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { Delete as DeleteIcon, EditPen, Search as SearchIcon } from '@element-plus/icons-vue'

import { type TreeNode } from './types.ts'

defineOptions({
  name: 'DefaultTreeOperateAreaSlot',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  inspectButtonVisible?: boolean
  editButtonVisible?: boolean
  deleteButtonVisible?: boolean
  node: TreeNode<CT>
  item: CT
}

const props = withDefaults(defineProps<Props>(), {
  inspectButtonVisible: true,
  editButtonVisible: true,
  deleteButtonVisible: true,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (event: 'onItemInspect', item: CT, node: TreeNode<CT>): void
  (event: 'onItemEdit', item: CT, node: TreeNode<CT>): void
  (event: 'onItemDelete', item: CT, node: TreeNode<CT>): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------事件处理-----------------------------------------------------------
function handleItemInspect(): void {
  emit('onItemInspect', props.item, props.node)
}

function handleItemEdit(): void {
  emit('onItemEdit', props.item, props.node)
}

function handleItemDelete(): void {
  emit('onItemDelete', props.item, props.node)
}
</script>

<style scoped>
.tree-node-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}
</style>
