<template>
  <div class="static-tree-node-row">
    <div
      class="tree-node-line"
      :class="{ 'is-current': isCurrent, 'is-disabled': rowDisabled }"
      :style="{ paddingLeft: indentPx + 'px' }"
      role="treeitem"
      :aria-expanded="node.isLeaf ? undefined : node.expanded"
      @click="handleRowClick"
    >
      <native-button
        v-if="!node.isLeaf"
        bare
        square
        size="small"
        class="expander"
        :aria-label="node.expanded ? '收起' : '展开'"
        @click.stop="emitToggleExpand"
      >
        {{ node.expanded ? '−' : '+' }}
      </native-button>
      <span v-else class="expander-placeholder" />
      <div class="tree-node-content">
        <slot name="default" :node="node" :item="node.data" />
      </div>
      <div
        v-if="operateAreaVisible"
        class="tree-node-operate-area"
        @mouseenter="emitOperateHover(true)"
        @mouseleave="emitOperateHover(false)"
        @click.stop
      >
        <slot
          name="operateArea"
          :node="node"
          :item="node.data"
          :fire-itemInspect="() => $emit('itemInspect', node.data, node)"
          :fire-itemEdit="() => $emit('itemEdit', node.data, node)"
          :fire-itemDelete="() => $emit('itemDelete', node.data, node)"
        />
      </div>
    </div>
    <div v-if="node.expanded && !node.isLeaf" class="tree-children" role="group">
      <static-tree-node-row
        v-for="c in node.childNodes"
        :key="c.key"
        :node="c"
        :selected-key="selectedKey"
        :disabled-field="disabledField"
        :operate-area-visible="operateAreaVisible"
        :inspect-button-visible="inspectButtonVisible"
        :edit-button-visible="editButtonVisible"
        :delete-button-visible="deleteButtonVisible"
        @toggleExpand="$emit('toggleExpand', $event)"
        @select="$emit('select', $event)"
        @operateHover="$emit('operateHover', $event)"
        @itemInspect="(_item: CT, _node: StaticTreeNode<CT>) => $emit('itemInspect', _item, _node)"
        @itemEdit="(_item: CT, _node: StaticTreeNode<CT>) => $emit('itemEdit', _item, _node)"
        @itemDelete="(_item: CT, _node: StaticTreeNode<CT>) => $emit('itemDelete', _item, _node)"
      >
        <template v-slot:default="slotProps">
          <slot name="default" v-bind="slotProps" />
        </template>
        <template v-slot:operateArea="slotProps">
          <slot name="operateArea" v-bind="slotProps" />
        </template>
      </static-tree-node-row>
    </div>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed } from 'vue'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'

import { type StaticTreeNode } from './nativeStaticTree.ts'

defineOptions({
  name: 'StaticTreeNodeRow',
})

// region Props 定义

type Props = {
  node: StaticTreeNode<CT>
  selectedKey: string | null
  disabledField?: keyof {
    [K in keyof CT as CT[K] extends boolean ? K : never]: unknown
  }
  operateAreaVisible?: boolean
  inspectButtonVisible?: boolean
  editButtonVisible?: boolean
  deleteButtonVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  operateAreaVisible: true,
  inspectButtonVisible: true,
  editButtonVisible: true,
  deleteButtonVisible: true,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'toggleExpand', node: StaticTreeNode<CT>): void
  (e: 'select', node: StaticTreeNode<CT>): void
  (e: 'operateHover', value: boolean): void
  (e: 'itemInspect', item: CT, node: StaticTreeNode<CT>): void
  (e: 'itemEdit', item: CT, node: StaticTreeNode<CT>): void
  (e: 'itemDelete', item: CT, node: StaticTreeNode<CT>): void
}

const emit = defineEmits<Emits>()

// endregion

// region Slots 定义

type DefaultSlotProps = {
  node: StaticTreeNode<CT>
  item: CT
}

type OperateAreaSlotProps = {
  node: StaticTreeNode<CT>
  item: CT
  fireItemInspect: () => void
  fireItemEdit: () => void
  fireItemDelete: () => void
}

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: DefaultSlotProps) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operateArea?: (props: OperateAreaSlotProps) => any
}>()

// endregion

// region 展示

const indentPx = computed(() => Math.max(0, props.node.level - 1) * 16 + 4)

const isCurrent = computed(() => props.selectedKey !== null && props.selectedKey === props.node.key)

const rowDisabled = computed(() => {
  if (!props.disabledField) {
    return false
  }
  return !!props.node.data[props.disabledField]
})

// endregion

// region 事件

function emitToggleExpand(): void {
  emit('toggleExpand', props.node)
}

function handleRowClick(): void {
  if (rowDisabled.value) {
    return
  }
  emit('select', props.node)
}

function emitOperateHover(v: boolean): void {
  emit('operateHover', v)
}

// endregion
</script>

<style scoped>
.static-tree-node-row {
  width: 100%;
}

.tree-node-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 28px;
  cursor: pointer;
  box-sizing: border-box;
}

.tree-node-line.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.tree-node-line.is-current {
  background: #ecf5ff;
}

.expander {
  flex-shrink: 0;
  margin-right: 4px;
}

.expander-placeholder {
  display: inline-block;
  width: 22px;
  margin-right: 4px;
}

.tree-node-content {
  flex: 1;
  min-width: 0;
}

.tree-node-operate-area {
  flex-shrink: 0;
}

.tree-children {
  width: 100%;
}
</style>
