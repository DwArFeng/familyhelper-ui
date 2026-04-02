<template>
  <div class="default-tree-operate-area-slot-container">
    <span class="operate-actions">
      <native-link v-if="inspectButtonVisible" type="success" @click="handleItemInspect">
        查看
      </native-link>
      <native-link v-if="editButtonVisible" type="primary" @click="handleItemEdit">
        编辑
      </native-link>
      <native-link v-if="deleteButtonVisible" type="danger" @click="handleItemDelete">
        删除
      </native-link>
    </span>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'

import { type TreeNode } from './types.ts'

defineOptions({
  name: 'DefaultTreeOperateAreaSlot',
})

// region Props 定义

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

// endregion

// region Emits 定义

type Emits = {
  (event: 'onItemInspect', item: CT, node: TreeNode<CT>): void
  (event: 'onItemEdit', item: CT, node: TreeNode<CT>): void
  (event: 'onItemDelete', item: CT, node: TreeNode<CT>): void
}

const emit = defineEmits<Emits>()

// endregion

// region 事件处理

function handleItemInspect(): void {
  emit('onItemInspect', props.item, props.node)
}

function handleItemEdit(): void {
  emit('onItemEdit', props.item, props.node)
}

function handleItemDelete(): void {
  emit('onItemDelete', props.item, props.node)
}

// endregion
</script>

<style scoped>
.operate-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
