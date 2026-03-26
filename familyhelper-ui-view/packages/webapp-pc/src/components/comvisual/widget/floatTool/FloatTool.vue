<template>
  <div class="floaty-tool-container">
    <div class="floaty-tool" ref="containerRef" :style="floatyToolStype">
      <div class="body-wrapper" @mousedown="handleStartMove">
        <slot name="default"><div></div></slot>
      </div>
    </div>
    <div class="global-mask below" v-if="adjustStatus === 1" />
    <div class="global-mask above" v-if="adjustStatus === 2" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import { type DockStatus } from './types.ts'

defineOptions({
  name: 'FloatTool',
})

// region Props 定义

type Props = {
  height?: string
  width?: string
  allowFloat?: boolean
  snapDistance?: number
  initialX?: number
  initialY?: number
  initialDockStatus?: DockStatus
}

const props = withDefaults(defineProps<Props>(), {
  height: '45px',
  width: '45px',
  allowFloat: false,
  snapDistance: 20,
  initialX: 100,
  initialY: 100,
  initialDockStatus: 4,
})

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// endregion

// region 显示参数

const x = ref<number>(props.initialX)
const y = ref<number>(props.initialY)
const dockStatus = ref<DockStatus>(props.initialDockStatus)

// endregion

// region 样式处理

const floatyToolStype = computed(() => {
  return {
    height: props.height,
    width: props.width,
    left: `${x.value}px`,
    top: `${y.value}px`,
  }
})

// endregion

// region 移动计算

const SAFE_DISTANCE: number = 2

const xCopy = ref<number>(0)
const yCopy = ref<number>(0)
const mouseXCopy = ref<number>(0)
const mouseYCopy = ref<number>(0)
const parentTop = ref<number>(0)
const parentLeft = ref<number>(0)
const parentHeight = ref<number>(0)
const parentWidth = ref<number>(0)

/*
 * adjustStatus 代码含义:
 *   0: 没有调整。
 *   1: 正在鼠标按下。
 *   2: 正在移动。
 */
const adjustStatus = ref<0 | 1 | 2>(0)

const containerRef = useTemplateRef<HTMLElement>('containerRef')

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
  const containerHeight = container.clientHeight
  const containerWidth = container.clientWidth
  // 计算父元素尺寸。
  const parent = container.parentElement?.parentElement ?? document.body
  parentTop.value = parent.offsetTop
  parentLeft.value = parent.offsetLeft
  parentHeight.value = parent.clientHeight
  parentWidth.value = parent.clientWidth
  // 处理负数初始位置，负数位置的含义是相对于父元素右侧或底部的偏移。
  let initialX =
    props.initialX < 0
      ? parentLeft.value + parentWidth.value + props.initialX - containerWidth
      : parentLeft.value + props.initialX
  let initialY =
    props.initialY < 0
      ? parentTop.value + parentHeight.value + props.initialY - containerHeight
      : parentTop.value + props.initialY
  // 需要考虑负数绝对值大于 2 倍父元素尺寸的情况，此时将其视为无效的初始位置，重置为安全距离。
  if (initialX < parentLeft.value) {
    initialX = SAFE_DISTANCE
  }
  if (initialY < parentTop.value) {
    initialY = SAFE_DISTANCE
  }
  // 计算停靠状态。
  dockStatus.value = props.initialDockStatus
  // 根据停靠状态计算位置。
  switch (dockStatus.value) {
    // 停靠状态：浮动。
    case 0:
      x.value = calculatePosition(
        initialX,
        SAFE_DISTANCE,
        parentWidth.value - containerWidth - SAFE_DISTANCE,
      )
      y.value = calculatePosition(
        initialY,
        SAFE_DISTANCE,
        parentHeight.value - containerHeight - SAFE_DISTANCE,
      )
      break
    // 停靠状态：顶部。
    case 1:
      x.value = calculatePosition(
        initialX,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE,
      )
      y.value = parentTop.value + SAFE_DISTANCE
      break
    // 停靠状态：左侧。
    case SAFE_DISTANCE:
      x.value = parentLeft.value + SAFE_DISTANCE
      y.value = calculatePosition(
        initialY,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE,
      )
      break
    // 停靠状态：底部。
    case 3:
      x.value = calculatePosition(
        initialX,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE,
      )
      y.value = parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE
      break
    // 停靠状态：右侧。
    case 4:
      x.value = parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE
      y.value = calculatePosition(
        initialY,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE,
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
  const containerHeight = container.clientHeight
  const containerWidth = container.clientWidth
  // 计算父元素尺寸。
  const parent = container.parentElement?.parentElement ?? document.body
  parentTop.value = parent.offsetTop
  parentLeft.value = parent.offsetLeft
  parentHeight.value = parent.clientHeight
  parentWidth.value = parent.clientWidth
  // 根据停靠状态计算位置。
  switch (dockStatus.value) {
    // 停靠状态：浮动。
    case 0:
      x.value = calculatePosition(
        x.value,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE,
      )
      y.value = calculatePosition(
        y.value,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE,
      )
      break
    // 停靠状态：顶部。
    case 1:
      x.value = calculatePosition(
        x.value,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE,
      )
      y.value = parentTop.value + SAFE_DISTANCE
      break
    // 停靠状态：左侧。
    case SAFE_DISTANCE:
      x.value = parentLeft.value + SAFE_DISTANCE
      y.value = calculatePosition(
        y.value,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE,
      )
      break
    // 停靠状态：底部。
    case 3:
      x.value = calculatePosition(
        x.value,
        parentLeft.value + SAFE_DISTANCE,
        parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE,
      )
      y.value = parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE
      break
    // 停靠状态：右侧。
    case 4:
      x.value = parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE
      y.value = calculatePosition(
        y.value,
        parentTop.value + SAFE_DISTANCE,
        parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE,
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
  // 置位调整状态。
  adjustStatus.value = 1
  // 为 document 增加相关侦听。
  document.addEventListener('mousemove', handleMoving)
  document.addEventListener('mouseup', handleStopMove)
}

function handleMoving(event: MouseEvent): void {
  function calculateDockStatus(
    inferX: number,
    inferY: number,
    containerHeight: number,
    containerWidth: number,
    parentTop: number,
    parentLeft: number,
    parentHeight: number,
    parentWidth: number,
  ): DockStatus {
    // 顶部，左侧，底部，右侧的距离。
    const distanceToTop = Math.max(0, inferY - parentTop)
    const distanceToLeft = Math.max(0, inferX - parentLeft)
    const distanceToBottom = Math.max(0, parentHeight - containerHeight - inferY + parentTop)
    const distanceToRight = Math.max(0, parentWidth - containerWidth - inferX + parentLeft)
    // 计算距离最小的边。
    const minDistance = Math.min(distanceToTop, distanceToLeft, distanceToBottom, distanceToRight)
    // 如果距离最小的边大于吸附距离，且允许浮动，则返回浮动状态。
    if (minDistance > props.snapDistance && props.allowFloat) {
      return 0
    }
    // 根据距离最小的边返回对应的停靠状态。
    switch (minDistance) {
      case distanceToTop:
        return 1
      case distanceToLeft:
        return 2
      case distanceToBottom:
        return 3
      case distanceToRight:
        return 4
      // 该情况理论上不应该发生，但为了代码健壮性，仍然进行处理。
      default:
        throw new Error('不应该执行到此处，请联系开发人员')
    }
  }

  // 阻止默认事件、并阻止事件穿透。
  event.preventDefault()
  event.stopPropagation()
  // 置位调整状态。
  adjustStatus.value = 2
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
    // 计算推断位置。
    const xInfer: number = event.clientX - mouseXCopy.value + xCopy.value
    const yInfer: number = event.clientY - mouseYCopy.value + yCopy.value
    // 计算容器尺寸。
    const container = containerRef.value
    if (!container) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const containerHeight = container.clientHeight
    const containerWidth = container.clientWidth
    // 计算父元素尺寸。
    const parent = container.parentElement?.parentElement ?? document.body
    parentTop.value = parent.offsetTop
    parentLeft.value = parent.offsetLeft
    parentHeight.value = parent.clientHeight
    parentWidth.value = parent.clientWidth
    // 计算停靠状态。
    dockStatus.value = calculateDockStatus(
      xInfer,
      yInfer,
      containerHeight,
      containerWidth,
      parentTop.value,
      parentLeft.value,
      parentHeight.value,
      parentWidth.value,
    )
    // 根据停靠状态计算位置。
    switch (dockStatus.value) {
      // 停靠状态：浮动。
      case 0:
        x.value = calculatePosition(
          xInfer,
          parentLeft.value + SAFE_DISTANCE,
          parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE,
        )
        y.value = calculatePosition(
          yInfer,
          parentTop.value + SAFE_DISTANCE,
          parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE,
        )
        break
      // 停靠状态：顶部。
      case 1:
        x.value = calculatePosition(
          xInfer,
          parentLeft.value + SAFE_DISTANCE,
          parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE,
        )
        y.value = parentTop.value + SAFE_DISTANCE
        break
      // 停靠状态：左侧。
      case SAFE_DISTANCE:
        x.value = parentLeft.value + SAFE_DISTANCE
        y.value = calculatePosition(
          yInfer,
          parentTop.value + SAFE_DISTANCE,
          parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE,
        )
        break
      // 停靠状态：底部。
      case 3:
        x.value = calculatePosition(
          xInfer,
          parentLeft.value + SAFE_DISTANCE,
          parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE,
        )
        y.value = parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE
        break
      // 停靠状态：右侧。
      case 4:
        x.value = parentLeft.value + parentWidth.value - containerWidth - SAFE_DISTANCE
        y.value = calculatePosition(
          yInfer,
          parentTop.value + SAFE_DISTANCE,
          parentTop.value + parentHeight.value - containerHeight - SAFE_DISTANCE,
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
  // 为 document 移除相关侦听。
  document.removeEventListener('mousemove', handleMoving)
  document.removeEventListener('mouseup', handleStopMove)
}

watch(
  () => [props.height, props.width],
  () => {
    updateParams()
  },
)

onMounted(() => {
  initParams()
})

// endregion

// region 全局（窗体）尺寸检测

let bodyResizeObserver: ResizeObserver | null = null

function addBodyResizeListener(): void {
  if (bodyResizeObserver !== null) {
    return
  }
  bodyResizeObserver = new ResizeObserver(() => {
    function parentSizeChanged(): boolean {
      const container = containerRef.value
      if (!container) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      const parent = container.parentElement?.parentElement ?? document.body
      return (
        parent.offsetTop !== parentTop.value ||
        parent.offsetLeft !== parentLeft.value ||
        parent.clientHeight !== parentHeight.value ||
        parent.clientWidth !== parentWidth.value
      )
    }
    if (!parentSizeChanged()) {
      return
    }
    updateParams()
  })
  bodyResizeObserver.observe(document.body)
}

function removeBodyResizeListener(): void {
  if (bodyResizeObserver === null) {
    return
  }
  bodyResizeObserver.unobserve(document.body)
  bodyResizeObserver = null
}

onMounted(() => {
  addBodyResizeListener()
})

onUnmounted(() => {
  removeBodyResizeListener()
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

.body-wrapper {
  width: 100%;
  height: 100%;
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
