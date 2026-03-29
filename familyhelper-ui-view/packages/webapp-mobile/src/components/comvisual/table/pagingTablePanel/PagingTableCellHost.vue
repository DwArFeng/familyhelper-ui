<template>
  <component :is="vnode" />
</template>

<script setup lang="ts">
import { computed, h, isVNode, type VNodeChild } from 'vue'

// region Props 定义

const props = defineProps<{
  render: () => unknown
}>()

// endregion

// region VNode 计算

const vnode = computed(() => {
  const r = props.render()
  if (r == null || r === '') {
    return null
  }
  if (isVNode(r)) {
    return r
  }
  const plainClass = 'paging-table-cell-plain'
  if (typeof r === 'string' || typeof r === 'number') {
    return h('span', { class: plainClass }, String(r))
  }
  if (Array.isArray(r)) {
    return h('span', { class: plainClass }, r as VNodeChild[])
  }
  return h('span', { class: plainClass }, String(r))
})

// endregion
</script>
