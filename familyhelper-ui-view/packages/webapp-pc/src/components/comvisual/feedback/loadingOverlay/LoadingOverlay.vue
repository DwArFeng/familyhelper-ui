<template>
  <!-- 占位锚点：父级 DOM 即为需覆盖的区域，不依赖父级 position -->
  <div ref="anchorRef" class="loading-overlay-anchor" aria-hidden="true" />
  <Teleport to="body">
    <div
      v-if="active"
      class="loading-overlay"
      :style="overlayStyle"
      aria-busy="true"
      aria-live="polite"
    >
      <span class="loading-overlay__text">{{ text }}</span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

defineOptions({
  name: 'LoadingOverlay',
})

// region Props 定义

type Props = {
  /** 与 v-loading 计数用法一致：大于 0 时显示；或 boolean */
  loading?: boolean | number
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  text: '加载中...',
})

// endregion

// region 显示状态

const active = computed(() => {
  if (typeof props.loading === 'number') {
    return props.loading > 0
  }
  return props.loading
})

// endregion

// region 覆盖区域（fixed + 父级 getBoundingClientRect）

const anchorRef = ref<HTMLElement | null>(null)
const overlayStyle = ref<Record<string, string>>({})

let resizeObserver: ResizeObserver | null = null

const OVERLAY_Z_INDEX = '3000'

function updateOverlayRect(): void {
  const anchor = anchorRef.value
  if (!anchor) {
    return
  }
  const parent = anchor.parentElement
  if (!parent || !(parent instanceof HTMLElement)) {
    return
  }
  const r = parent.getBoundingClientRect()
  const cs = getComputedStyle(parent)
  overlayStyle.value = {
    position: 'fixed',
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    zIndex: OVERLAY_Z_INDEX,
    borderRadius: cs.borderRadius,
    boxSizing: 'border-box',
  }
}

function addOverlayListeners(): void {
  removeOverlayListeners()
  window.addEventListener('resize', updateOverlayRect)
  window.addEventListener('scroll', updateOverlayRect, true)
  const parent = anchorRef.value?.parentElement
  if (parent) {
    resizeObserver = new ResizeObserver(() => {
      updateOverlayRect()
    })
    resizeObserver.observe(parent)
  }
}

function removeOverlayListeners(): void {
  window.removeEventListener('resize', updateOverlayRect)
  window.removeEventListener('scroll', updateOverlayRect, true)
  if (resizeObserver !== null) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

watch(
  active,
  async (show) => {
    if (show) {
      await nextTick()
      updateOverlayRect()
      addOverlayListeners()
    } else {
      removeOverlayListeners()
    }
  },
  { immediate: true },
)

// endregion

// region 生命周期

onUnmounted(() => {
  removeOverlayListeners()
})

// endregion
</script>

<style scoped>
.loading-overlay-anchor {
  display: none;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.65);
  pointer-events: all;
}

.loading-overlay__text {
  font-size: 14px;
  color: #606266;
  user-select: none;
}
</style>
