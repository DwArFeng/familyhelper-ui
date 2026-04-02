<template>
  <div class="native-tabs" :class="rootClass">
    <div class="native-tabs__nav" role="tablist" :aria-orientation="navAriaOrientation">
      <button
        v-for="pane in panes"
        :key="pane.name"
        type="button"
        class="native-tabs__tab"
        role="tab"
        :aria-selected="pane.name === modelValue"
        :tabindex="pane.name === modelValue ? 0 : -1"
        @click="select(pane.name)"
      >
        {{ pane.label }}
      </button>
    </div>
    <div class="native-tabs__content">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, type Ref } from 'vue'

import {
  NATIVE_TABS_CONTEXT_KEY,
  type NativeTabPaneItem,
  type NativeTabPosition,
} from './context.ts'

defineOptions({
  name: 'NativeTabs',
})

export type { NativeTabPosition } from './context.ts'

// region Props 定义

type Props = {
  modelValue: string
  tabPosition?: NativeTabPosition
}

const props = withDefaults(defineProps<Props>(), {
  tabPosition: 'left',
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

// region 注册 pane

const panes: Ref<NativeTabPaneItem[]> = ref([])

function registerNativeTabPane(pane: NativeTabPaneItem): void {
  const list = panes.value
  const idx = list.findIndex((p) => p.name === pane.name)
  if (idx >= 0) {
    list[idx] = { ...pane }
    panes.value = [...list]
  } else {
    panes.value = [...list, pane]
  }
}

function unregisterNativeTabPane(name: string): void {
  panes.value = panes.value.filter((p) => p.name !== name)
}

provide(NATIVE_TABS_CONTEXT_KEY, {
  modelValue: computed(() => props.modelValue),
  registerPane: registerNativeTabPane,
  unregisterPane: unregisterNativeTabPane,
})

// endregion

// region 布局 class

const rootClass = computed(() => `native-tabs--tab-position-${props.tabPosition}`)

const navAriaOrientation = computed(() =>
  props.tabPosition === 'left' || props.tabPosition === 'right' ? 'vertical' : 'horizontal',
)

// endregion

// region 选择

function select(name: string): void {
  emit('update:modelValue', name)
}

// endregion
</script>

<style scoped>
.native-tabs {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.native-tabs--tab-position-left {
  flex-direction: row;
}

.native-tabs--tab-position-right {
  flex-direction: row-reverse;
}

.native-tabs--tab-position-top {
  flex-direction: column;
}

.native-tabs--tab-position-bottom {
  flex-direction: column-reverse;
}

.native-tabs__nav {
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
  background: #fafafa;
}

.native-tabs--tab-position-left .native-tabs__nav,
.native-tabs--tab-position-right .native-tabs__nav {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  flex: 0 0 140px;
  width: 140px;
}

.native-tabs--tab-position-top .native-tabs__nav,
.native-tabs--tab-position-bottom .native-tabs__nav {
  flex: 0 0 auto;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: auto;
  padding: 0 8px;
  box-sizing: border-box;
}

.native-tabs--tab-position-left .native-tabs__nav {
  border: none;
  border-right: 1px solid #ebeef5;
}

.native-tabs--tab-position-right .native-tabs__nav {
  border: none;
  border-left: 1px solid #ebeef5;
}

.native-tabs--tab-position-top .native-tabs__nav {
  border: none;
  border-bottom: 1px solid #ebeef5;
}

.native-tabs--tab-position-bottom .native-tabs__nav {
  border: none;
  border-top: 1px solid #ebeef5;
}

.native-tabs__tab {
  margin: 0;
  padding: 10px 14px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.native-tabs--tab-position-left .native-tabs__tab {
  text-align: left;
  border: none;
  border-right: 2px solid transparent;
}

.native-tabs--tab-position-right .native-tabs__tab {
  text-align: right;
  border: none;
  border-left: 2px solid transparent;
}

.native-tabs--tab-position-top .native-tabs__tab {
  flex: 0 0 auto;
  width: auto;
  max-width: none;
  text-align: center;
  border: none;
  border-bottom: 2px solid transparent;
}

.native-tabs--tab-position-bottom .native-tabs__tab {
  flex: 0 0 auto;
  width: auto;
  max-width: none;
  text-align: center;
  border: none;
  border-top: 2px solid transparent;
}

.native-tabs--tab-position-left .native-tabs__tab[aria-selected='true'] {
  color: #409eff;
  font-weight: 500;
  border-right-color: #409eff;
  background: #ecf5ff;
}

.native-tabs--tab-position-right .native-tabs__tab[aria-selected='true'] {
  color: #409eff;
  font-weight: 500;
  border-left-color: #409eff;
  background: #ecf5ff;
}

.native-tabs--tab-position-top .native-tabs__tab[aria-selected='true'] {
  color: #409eff;
  font-weight: 500;
  border-bottom-color: #409eff;
  background: #ecf5ff;
}

.native-tabs--tab-position-bottom .native-tabs__tab[aria-selected='true'] {
  color: #409eff;
  font-weight: 500;
  border-top-color: #409eff;
  background: #ecf5ff;
}

.native-tabs__content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 8px 12px;
  overflow: auto;
}
</style>
