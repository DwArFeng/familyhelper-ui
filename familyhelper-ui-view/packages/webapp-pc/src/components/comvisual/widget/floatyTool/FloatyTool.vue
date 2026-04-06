<template>
  <div class="floaty-tool-container">
    <div class="floaty-tool" ref="containerRef" :style="floatyToolStyle">
      <div class="body-wrapper" @mousedown="handleStartMove">
        <slot name="default" :dock-status="dockStatus" :adjust-status="adjustStatus">
          <div></div>
        </slot>
      </div>
    </div>
    <div class="global-mask below" v-if="adjustStatus === 1" />
    <div class="global-mask above" v-if="adjustStatus === 2" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import {
  type AdjustStatus,
  type DockStatus,
  type DockStatusBottom,
  type DockStatusLeft,
  type DockStatusRight,
  type DockStatusTop,
} from './types.ts'

import { DEFAULT_ALLOWED_DOCK_STATUSES } from './constants.ts'

defineOptions({
  name: 'FloatyTool',
})

// region Props 定义

type Props = {
  allowedDockStatuses?: DockStatus[]
  snapDistance?: number
  initialDockStatus?: DockStatus
  initialX?: number
  initialY?: number
}

const props = withDefaults(defineProps<Props>(), {
  allowedDockStatuses: () => [...DEFAULT_ALLOWED_DOCK_STATUSES],
  snapDistance: 20,
  initialDockStatus: 4,
  initialX: 100,
  initialY: 100,
})

// endregion

// region Slots 定义

type DefaultSlotProps = {
  dockStatus: DockStatus
  adjustStatus: AdjustStatus
}

defineSlots<{
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: DefaultSlotProps) => any
}>()

// endregion

// region 显示参数

const x = ref<number>(props.initialX)
const y = ref<number>(props.initialY)
const dockStatus = ref<DockStatus>(props.initialDockStatus)

// endregion

// region 样式处理

const floatyToolStyle = computed(() => {
  return {
    left: `${x.value}px`,
    top: `${y.value}px`,
  }
})

// endregion

// region 移动计算

const SAFE_DISTANCE: number = 2

/** 自 mousedown 起指针位移小于该值（像素）时视为点击抖动，不进入拖拽。 */
const MOVE_SLOP_PX: number = 5
/** MOVE_SLOP_PX 的平方，用于避免计算平方根。 */
const MOVE_SLOP_SQ: number = MOVE_SLOP_PX * MOVE_SLOP_PX

const xCopy = ref<number>(0)
const yCopy = ref<number>(0)
const mouseXCopy = ref<number>(0)
const mouseYCopy = ref<number>(0)
const parentTop = ref<number>(0)
const parentLeft = ref<number>(0)
const parentHeight = ref<number>(0)
const parentWidth = ref<number>(0)
const containerHeight = ref<number>(0)
const containerWidth = ref<number>(0)

const adjustStatus = ref<AdjustStatus>(0)
const dragSlopPassed = ref<boolean>(false)

const containerRef = useTemplateRef<HTMLElement>('containerRef')

function normalizeAllowedDockStatuses(list: readonly DockStatus[] | undefined): DockStatus[] {
  const src = list ?? DEFAULT_ALLOWED_DOCK_STATUSES
  if (src.length === 0) {
    return [...DEFAULT_ALLOWED_DOCK_STATUSES]
  }
  return [...src]
}

function calculateDockStatus(
  pointerX: number,
  pointerY: number,
  parentTop: number,
  parentLeft: number,
  parentHeight: number,
  parentWidth: number,
  allowed: readonly DockStatus[],
  snapDistance: number,
): DockStatus {
  const allowedSet = new Set(allowed)
  const distanceToTop = Math.max(0, pointerY - parentTop)
  const distanceToLeft = Math.max(0, pointerX - parentLeft)
  const distanceToBottom = Math.max(0, parentTop + parentHeight - pointerY)
  const distanceToRight = Math.max(0, parentLeft + parentWidth - pointerX)
  const edgeDistances: Record<
    DockStatusTop | DockStatusLeft | DockStatusBottom | DockStatusRight,
    number
  > = {
    1: distanceToTop,
    2: distanceToLeft,
    3: distanceToBottom,
    4: distanceToRight,
  }
  const edgeStatuses = [1, 2, 3, 4] as const
  const edgeCandidates: { status: DockStatus; d: number }[] = []
  for (const status of edgeStatuses) {
    if (allowedSet.has(status)) {
      edgeCandidates.push({ status, d: edgeDistances[status] })
    }
  }
  const floatAllowed = allowedSet.has(0)
  if (edgeCandidates.length === 0) {
    if (!floatAllowed) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    return 0
  }
  let best = edgeCandidates[0]
  for (let i = 1; i < edgeCandidates.length; i++) {
    const cur = edgeCandidates[i]!
    if (cur.d < best.d) {
      best = cur
    } else if (cur.d === best.d && cur.status < best.status) {
      best = cur
    }
  }
  if (floatAllowed && best.d > snapDistance) {
    return 0
  }
  return best.status
}

function calculatePosition(current: number, min: number, max: number): number {
  // 如果 result 大于等于 min 且 result 小于等于 max，则返回 result。
  if (current >= min && current <= max) {
    return current
  }
  // 如果 result 小于 min，则返回 min。
  if (current < min) {
    return min
  }
  // 返回 max。
  return max
}

function initParams(): void {
  // 计算容器尺寸。
  const container = containerRef.value
  if (!container) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const containerBoundingClientRect = container.getBoundingClientRect()
  containerHeight.value = containerBoundingClientRect.height
  containerWidth.value = containerBoundingClientRect.width
  // 计算父元素尺寸。
  const parent = container.parentElement?.parentElement ?? document.body
  const parentBoundingClientRect = parent.getBoundingClientRect()
  parentTop.value = parentBoundingClientRect.top
  parentLeft.value = parentBoundingClientRect.left
  parentHeight.value = parentBoundingClientRect.height
  parentWidth.value = parentBoundingClientRect.width
  // 处理负数初始位置，负数位置的含义是相对于父元素右侧或底部的偏移。
  let initialX =
    props.initialX < 0
      ? parentLeft.value + parentWidth.value + props.initialX - containerWidth.value
      : parentLeft.value + props.initialX
  let initialY =
    props.initialY < 0
      ? parentTop.value + parentHeight.value + props.initialY - containerHeight.value
      : parentTop.value + props.initialY
  // 需要考虑负数绝对值大于 2 倍父元素尺寸的情况，此时将其视为无效的初始位置，重置为安全距离。
  if (initialX < parentLeft.value) {
    initialX = SAFE_DISTANCE
  }
  if (initialY < parentTop.value) {
    initialY = SAFE_DISTANCE
  }
  const allowed = normalizeAllowedDockStatuses(props.allowedDockStatuses)
  let nextDock = props.initialDockStatus
  if (!allowed.includes(nextDock)) {
    const first = allowed[0]
    if (first === undefined) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    nextDock = first
  }
  dockStatus.value = nextDock
  // 根据停靠状态计算位置。
  switch (dockStatus.value) {
    // 停靠状态：浮动。
    case 0:
      x.value = calculatePosition(
        initialX,
        SAFE_DISTANCE,
        parentWidth.value - containerWidth.value - SAFE_DISTANCE,
      )
      y.value = calculatePosition(
        initialY,
        SAFE_DISTANCE,
        parentHeight.value - containerHeight.value - SAFE_DISTANCE,
      )
      break
    // 停靠状态：顶部。
    case 1:
      x.value = calculatePosition(
        initialX,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE,
      )
      y.value = parentTop.value + SAFE_DISTANCE
      break
    // 停靠状态：左侧。
    case 2:
      x.value = parentLeft.value + SAFE_DISTANCE
      y.value = calculatePosition(
        initialY,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE,
      )
      break
    // 停靠状态：底部。
    case 3:
      x.value = calculatePosition(
        initialX,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE,
      )
      y.value = parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE
      break
    // 停靠状态：右侧。
    case 4:
      x.value = parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE
      y.value = calculatePosition(
        initialY,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE,
      )
      break
    // 停靠状态：错误。
    default:
      throw new Error('不应该执行到此处，请联系开发人员')
  }
}

function updateParams(): void {
  // 计算容器尺寸。
  const container = containerRef.value
  if (!container) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const containerBoundingClientRect = container.getBoundingClientRect()
  containerHeight.value = containerBoundingClientRect.height
  containerWidth.value = containerBoundingClientRect.width
  // 计算父元素尺寸。
  const parent = container.parentElement?.parentElement ?? document.body
  const parentBoundingClientRect = parent.getBoundingClientRect()
  parentTop.value = parentBoundingClientRect.top
  parentLeft.value = parentBoundingClientRect.left
  parentHeight.value = parentBoundingClientRect.height
  parentWidth.value = parentBoundingClientRect.width
  // 根据停靠状态计算位置。
  switch (dockStatus.value) {
    // 停靠状态：浮动。
    case 0:
      x.value = calculatePosition(
        x.value,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE,
      )
      y.value = calculatePosition(
        y.value,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE,
      )
      break
    // 停靠状态：顶部。
    case 1:
      x.value = calculatePosition(
        x.value,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE,
      )
      y.value = parentTop.value + SAFE_DISTANCE
      break
    // 停靠状态：左侧。
    case 2:
      x.value = parentLeft.value + SAFE_DISTANCE
      y.value = calculatePosition(
        y.value,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE,
      )
      break
    // 停靠状态：底部。
    case 3:
      x.value = calculatePosition(
        x.value,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE,
      )
      y.value = parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE
      break
    // 停靠状态：右侧。
    case 4:
      x.value = parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE
      y.value = calculatePosition(
        y.value,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE,
      )
      break
    // 停靠状态：错误。
    default:
      throw new Error('不应该执行到此处，请联系开发人员')
  }
}

function handleStartMove(event: MouseEvent): void {
  // 阻止默认事件、并阻止事件穿透。
  event.preventDefault()
  event.stopPropagation()
  // 设置初始的鼠标位置。
  mouseXCopy.value = event.clientX
  mouseYCopy.value = event.clientY
  // 设置位置副本。
  xCopy.value = x.value
  yCopy.value = y.value
  dragSlopPassed.value = false
  // 置位调整状态。
  adjustStatus.value = 1
  // 为 document 增加相关侦听。
  document.addEventListener('mousemove', handleMoving)
  document.addEventListener('mouseup', handleStopMove)
}

function handleMoving(event: MouseEvent): void {
  // 阻止默认事件、并阻止事件穿透。
  event.preventDefault()
  event.stopPropagation()
  // 应用动画帧处理移动动作。
  requestAnimationFrame(() => {
    if (!containerRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 该方法在动作帧中执行，因此存在滞后性，有可能在用户松开鼠标后执行。
    // 如果窗口没有移动，则直接退出。
    if (adjustStatus.value === 0) {
      return
    }
    if (!dragSlopPassed.value) {
      const dx = event.clientX - mouseXCopy.value
      const dy = event.clientY - mouseYCopy.value
      if (dx * dx + dy * dy < MOVE_SLOP_SQ) {
        adjustStatus.value = 1
        return
      }
      dragSlopPassed.value = true
    }
    adjustStatus.value = 2
    // 计算推断位置。
    const xInfer: number = event.clientX - mouseXCopy.value + xCopy.value
    const yInfer: number = event.clientY - mouseYCopy.value + yCopy.value
    // 计算容器尺寸。
    const container = containerRef.value
    if (!container) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const containerBoundingClientRect = container.getBoundingClientRect()
    containerHeight.value = containerBoundingClientRect.height
    containerWidth.value = containerBoundingClientRect.width
    // 计算父元素尺寸。
    const parent = container.parentElement?.parentElement ?? document.body
    const parentBoundingClientRect = parent.getBoundingClientRect()
    parentTop.value = parentBoundingClientRect.top
    parentLeft.value = parentBoundingClientRect.left
    parentHeight.value = parentBoundingClientRect.height
    parentWidth.value = parentBoundingClientRect.width
    const allowed = normalizeAllowedDockStatuses(props.allowedDockStatuses)
    // 计算停靠状态（按指针相对父矩形各边距离，避免插槽尺寸变化导致选边抖动）。
    dockStatus.value = calculateDockStatus(
      event.clientX,
      event.clientY,
      parentTop.value,
      parentLeft.value,
      parentHeight.value,
      parentWidth.value,
      allowed,
      props.snapDistance,
    )
    // 根据停靠状态计算位置。
    switch (dockStatus.value) {
      // 停靠状态：浮动。
      case 0:
        x.value = calculatePosition(
          xInfer,
          parentLeft.value + SAFE_DISTANCE,
          parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE,
        )
        y.value = calculatePosition(
          yInfer,
          parentTop.value + SAFE_DISTANCE,
          parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE,
        )
        break
      // 停靠状态：顶部。
      case 1:
        x.value = calculatePosition(
          xInfer,
          parentLeft.value + SAFE_DISTANCE,
          parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE,
        )
        y.value = parentTop.value + SAFE_DISTANCE
        break
      // 停靠状态：左侧。
      case 2:
        x.value = parentLeft.value + SAFE_DISTANCE
        y.value = calculatePosition(
          yInfer,
          parentTop.value + SAFE_DISTANCE,
          parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE,
        )
        break
      // 停靠状态：底部。
      case 3:
        x.value = calculatePosition(
          xInfer,
          parentLeft.value + SAFE_DISTANCE,
          parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE,
        )
        y.value = parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE
        break
      // 停靠状态：右侧。
      case 4:
        x.value = parentLeft.value + parentWidth.value - containerWidth.value - SAFE_DISTANCE
        y.value = calculatePosition(
          yInfer,
          parentTop.value + SAFE_DISTANCE,
          parentTop.value + parentHeight.value - containerHeight.value - SAFE_DISTANCE,
        )
        break
      // 停靠状态：错误。
      default:
        throw new Error('不应该执行到此处，请联系开发人员')
    }
  })
}

function handleStopMove(event: MouseEvent): void {
  // 阻止默认事件、并阻止事件穿透。
  event.preventDefault()
  event.stopPropagation()
  // 复位调整状态。
  adjustStatus.value = 0
  dragSlopPassed.value = false
  // 为 document 移除相关侦听。
  document.removeEventListener('mousemove', handleMoving)
  document.removeEventListener('mouseup', handleStopMove)
}

watch(
  () => props.allowedDockStatuses,
  () => {
    const allowed = normalizeAllowedDockStatuses(props.allowedDockStatuses)
    if (!allowed.includes(dockStatus.value)) {
      const first = allowed[0]
      if (first === undefined) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      dockStatus.value = first
    }
    updateParams()
  },
  { deep: true },
)

// endregion

// region 布局父级尺寸与位置检测

let parentLayoutResizeObserver: ResizeObserver | null = null
let containerResizeObserver: ResizeObserver | null = null

function addParentLayoutResizeListener(): void {
  function getParent(): HTMLElement {
    const container = containerRef.value
    if (!container) {
      return document.body
    }
    return (container.parentElement?.parentElement ?? document.body) as HTMLElement
  }

  if (parentLayoutResizeObserver !== null) {
    return
  }
  const parent = getParent()
  parentLayoutResizeObserver = new ResizeObserver(() => {
    const parent = getParent()
    if (!parent.checkVisibility()) {
      return
    }
    if (
      parent.offsetTop === parentTop.value &&
      parent.offsetLeft === parentLeft.value &&
      parent.clientHeight === parentHeight.value &&
      parent.clientWidth === parentWidth.value
    ) {
      return
    }
    updateParams()
  })
  parentLayoutResizeObserver.observe(parent)
}

function removeParentLayoutResizeListener(): void {
  if (parentLayoutResizeObserver === null) {
    return
  }
  parentLayoutResizeObserver.disconnect()
  parentLayoutResizeObserver = null
}

function addContainerResizeListener(): void {
  function getContainer(): HTMLElement {
    const container = containerRef.value
    if (!container) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    return container
  }

  if (containerResizeObserver !== null) {
    return
  }
  const container = getContainer()
  containerResizeObserver = new ResizeObserver(() => {
    const container = getContainer()
    if (!container.checkVisibility()) {
      return
    }
    if (
      container.clientHeight === containerHeight.value &&
      container.clientWidth === containerWidth.value
    ) {
      return
    }
    updateParams()
  })
  containerResizeObserver.observe(container)
}

function removeContainerResizeListener(): void {
  if (containerResizeObserver === null) {
    return
  }
  containerResizeObserver.disconnect()
  containerResizeObserver = null
}

onMounted(() => {
  initParams()
  addParentLayoutResizeListener()
  addContainerResizeListener()
})

onUnmounted(() => {
  removeParentLayoutResizeListener()
  removeContainerResizeListener()
})

// endregion
</script>

<style scoped>
.floaty-tool-container {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10000;
  pointer-events: none;
  touch-action: none;
}

.floaty-tool {
  position: fixed;
  width: max-content;
  height: max-content;
  border-radius: 8px;
  user-select: none;
  box-sizing: border-box;
  padding: 6px 4px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.35);
  opacity: 0.55;
  transition:
    opacity 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
  z-index: 100;
  touch-action: none;
  pointer-events: all;
}

.floaty-tool:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.96);
  pointer-events: all;
}

.global-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: all;
}

.global-mask.below {
  z-index: 90;
}

.global-mask.above {
  z-index: 110;
}
</style>
