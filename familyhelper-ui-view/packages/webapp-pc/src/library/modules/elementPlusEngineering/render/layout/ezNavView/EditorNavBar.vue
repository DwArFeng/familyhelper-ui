<template>
  <div class="editor-nav-bar-container">
    <span>{{ parseLabel(props.node.display, t) }}</span>
    <el-icon class="close-icon" @mouseup="handleDelete">
      <delete-icon />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { type NodeInfo } from '@/navigation/types.ts'

import { useI18n } from 'vue-i18n'

import { Delete as DeleteIcon } from '@element-plus/icons-vue'

import { parseLabel } from '@/library/modules/elementPlusEngineering/util/display.ts'

defineOptions({
  name: 'EditorNavBar',
})

// region Props 定义

type Props = {
  node: NodeInfo
  annotation: string
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'onDelete'): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 事件处理

function handleDelete(): void {
  emit('onDelete')
}

// endregion
</script>

<style scoped>
.editor-nav-bar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: move;
  height: 28px;
  line-height: 26px;
  border: 1px solid var(--element-plus-engineering-ez-nav-border-color);
  color: var(--element-plus-engineering-ez-nav-text-color);
  background: var(--element-plus-engineering-ez-nav-background);
  font-size: var(--element-plus-engineering-font-size-small);
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
  font-size: var(--element-plus-engineering-font-size-base);
  color: var(--el-color-danger);
  cursor: pointer;
}

.close-icon:hover {
  background: var(--element-plus-engineering-menu-hover-background);
}
</style>
