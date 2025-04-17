<template>
  <div class="editor-nav-bar-container">
    <!--suppress JSUnresolvedReference -->
    <span>{{ props.node.display.label }}</span>
    <el-icon class="close-icon" @mouseup="handleDelete">
      <delete-icon />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { Delete as DeleteIcon } from '@element-plus/icons-vue'
import type { NavigationNodeInfo } from '@/navigation/types.ts'

defineOptions({
  name: 'EditorNavBar',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  node: NavigationNodeInfo
  annotation: string
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onDelete'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------事件处理-----------------------------------------------------------
function handleDelete(): void {
  emit('onDelete')
}
</script>

<style scoped>
.editor-nav-bar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: move;
  height: 28px;
  line-height: 26px;
  border: 1px solid #d8dce5;
  color: #495060;
  background: #fff;
  font-size: 12px;
  white-space: nowrap;
  padding: 0 4px;
}

.editor-nav-bar-container span {
  width: 0;
  flex-grow: 1;
  user-select: none;
}

.close-icon {
  text-align: center;
  font-size: 14px;
  color: #f56c6c;
  cursor: pointer;
}

.close-icon:hover {
  background: #eeeeee;
}
</style>
