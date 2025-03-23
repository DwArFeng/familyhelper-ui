<template>
  <div class="title-layout-panel-container" :class="{ bordered: bordered }">
    <div class="title" :class="{ bordered: bordered }" v-if="title">{{ title }}</div>
    <div class="content" :class="{ bordered: bordered, expand: !applyContainerHeight }">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'TitleLayoutPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  title: string
  bordered?: boolean
  applyContainerHeight?: boolean
}

withDefaults(defineProps<Props>(), {
  bordered: false,
  applyContainerHeight: false,
})

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()
</script>

<style scoped>
.title-layout-panel-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.title-layout-panel-container.bordered {
  border: solid 1px #dcdfe6;
  border-radius: 4px;
}

.title {
  width: 100%;
  font-size: 14px;
  line-height: 30px;
  background: #f5f7fa;
  padding: 0 10px;
  box-sizing: border-box;
}

.title.bordered {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.content {
  width: 100%;
  padding: 3px 0;
  box-sizing: border-box;
}

.content.bordered {
  padding: 3px 10px;
}

/*noinspection CssUnusedSymbol*/
.content.expand {
  height: 0;
  flex-grow: 1;
}
</style>
