<template>
  <div class="vertical-tabs" :class="{ 'is-nested': nested }">
    <div
      class="vertical-tabs__nav"
      role="tablist"
      :aria-orientation="nested ? 'horizontal' : 'vertical'"
    >
      <button
        v-for="pane in panes"
        :key="pane.name"
        type="button"
        class="vertical-tabs__tab"
        role="tab"
        :aria-selected="pane.name === modelValue"
        :tabindex="pane.name === modelValue ? 0 : -1"
        @click="select(pane.name)"
      >
        {{ pane.label }}
      </button>
    </div>
    <div class="vertical-tabs__content">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'

defineOptions({
  name: 'VerticalTabs',
})

// region Props 定义

export type VerticalTabPaneConfig = {
  name: string
  label: string
}

type Props = {
  modelValue: string
  panes: VerticalTabPaneConfig[]
  nested?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  nested: false,
})

// endregion

// region Emits 定义

const emit = defineEmits<{
  (e: 'update:modelValue', name: string): void
}>()

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// endregion

// region provide（供 VerticalTabPane 使用）

provide(
  'verticalTabsModelValue',
  computed(() => props.modelValue),
)

// endregion

// region 选择

function select(name: string): void {
  emit('update:modelValue', name)
}

// endregion
</script>

<style scoped>
.vertical-tabs {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.vertical-tabs.is-nested {
  flex-direction: column;
}

.vertical-tabs.is-nested .vertical-tabs__nav {
  flex-direction: row;
  flex: 0 0 auto;
  border-right: none;
  border-bottom: 1px solid #ebeef5;
}

.vertical-tabs__nav {
  flex: 0 0 140px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
  border-right: 1px solid #ebeef5;
  background: #fafafa;
}

.vertical-tabs__tab {
  margin: 0;
  padding: 10px 14px;
  border: none;
  border-right: 2px solid transparent;
  background: transparent;
  text-align: left;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.vertical-tabs__tab[aria-selected='true'] {
  color: #409eff;
  font-weight: 500;
  border-right-color: #409eff;
  background: #ecf5ff;
}

.vertical-tabs.is-nested .vertical-tabs__tab[aria-selected='true'] {
  border-right-color: transparent;
  border-bottom: 2px solid #409eff;
}

.vertical-tabs__content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 8px 12px;
  overflow: auto;
}
</style>
