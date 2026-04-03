<template>
  <!-- 占位锚点：父级 DOM 即为需覆盖的区域，不依赖父级 position。 -->
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

type EdgeRect = { left: number; top: number; right: number; bottom: number }

function rectFromDomRect(r: DOMRectReadOnly): EdgeRect {
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
}

function intersectEdgeRects(a: EdgeRect, b: EdgeRect): EdgeRect {
  return {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  }
}

function edgeRectToBox(r: EdgeRect): { left: number; top: number; width: number; height: number } {
  return {
    left: r.left,
    top: r.top,
    width: Math.max(0, r.right - r.left),
    height: Math.max(0, r.bottom - r.top),
  }
}

/** 滚动/裁剪容器在视口中的内侧可绘区域（与 overflow 裁剪一致） */
function getOverflowClipRect(el: HTMLElement): EdgeRect {
  const br = el.getBoundingClientRect()
  const left = br.left + el.clientLeft
  const top = br.top + el.clientTop
  return {
    left,
    top,
    right: left + el.clientWidth,
    bottom: top + el.clientHeight,
  }
}

function isOverflowClipping(cs: CSSStyleDeclaration): boolean {
  return cs.overflowX !== 'visible' || cs.overflowY !== 'visible'
}

/** 父元素在视口与各层 overflow 裁剪下的可见矩形（用于 fixed 叠加层，避免画出滚动区域外） */
function getVisibleRectForElement(el: HTMLElement): {
  left: number
  top: number
  width: number
  height: number
} {
  let rect = rectFromDomRect(el.getBoundingClientRect())
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const cs = getComputedStyle(node)
    if (isOverflowClipping(cs)) {
      rect = intersectEdgeRects(rect, getOverflowClipRect(node))
    }
    node = node.parentElement
  }
  const viewport: EdgeRect = {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  }
  rect = intersectEdgeRects(rect, viewport)
  return edgeRectToBox(rect)
}

function updateOverlayRect(): void {
  const anchor = anchorRef.value
  if (!anchor) {
    return
  }
  const parent = anchor.parentElement
  if (!parent || !(parent instanceof HTMLElement)) {
    return
  }
  const { left, top, width, height } = getVisibleRectForElement(parent)
  const cs = getComputedStyle(parent)
  const hidden = width === 0 || height === 0
  overlayStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: OVERLAY_Z_INDEX,
    borderRadius: cs.borderRadius,
    boxSizing: 'border-box',
    display: hidden ? 'none' : 'flex',
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
