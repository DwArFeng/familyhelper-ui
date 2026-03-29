<template>
  <div
    class="floaty-dialog-container"
    ref="containerRef"
    v-show="watchedVisible"
    :style="containerStyle"
  >
    <div class="frame" :key="key">
      <div class="title-bar" :style="titleBarStyle" @mousedown="handleStartMove">
        <div class="title-bar-item title-area">
          <span>{{ title }}</span>
        </div>
        <div
          class="title-bar-item operate-area"
          @mouseenter="operateOverride = true"
          @mouseleave="operateOverride = false"
        >
          <div class="title-bar-button-group" role="group" aria-label="窗口操作">
            <native-button
              v-if="dockStatus !== 0"
              size="small"
              bare
              @mousedown.stop
              @click="handleUndock"
            >
              浮动
            </native-button>
            <native-button
              v-if="showDockButton"
              size="small"
              bare
              @mousedown.stop
              @click="handleShowContextMenu(1)"
            >
              停靠
            </native-button>
            <native-button size="small" bare kind="danger" @mousedown.stop @click="handleClose">
              关闭
            </native-button>
          </div>
        </div>
      </div>
      <div class="content-panel" :style="{ zIndex: zIndex }">
        <div
          class="content-panel-item content-panel-mask"
          v-show="showContentMask && adjustStatus === 1"
        >
          <placeholder-panel text="移动" />
        </div>
        <div
          class="content-panel-item content-panel-mask"
          v-show="showContentMask && adjustStatus === 2"
        >
          <placeholder-panel text="调整" />
        </div>
        <div
          class="content-panel-item content-panel-body"
          v-show="!showContentMask || adjustStatus === 0"
        >
          <slot name="default">
            <div class="content-panel-placeholder">
              <span class="placeholder-text" aria-hidden="true">◇</span>
            </div>
          </slot>
        </div>
      </div>
    </div>
    <div>
      <div
        class="resize-item resize-bar-vertical"
        :style="resizeBarWestStyle"
        v-if="dockStatus === 0 || dockStatus === 4"
        @mousedown="handleStartResize($event, westResizingHandle)"
      />
      <div
        class="resize-item resize-bar-vertical"
        v-if="dockStatus === 0 || dockStatus === 2"
        :style="resizeBarEastStyle"
        @mousedown="handleStartResize($event, eastResizingHandle)"
      />
      <div
        class="resize-item resize-bar-horizontal"
        v-if="dockStatus === 0 || dockStatus === 3"
        :style="resizeBarNorthStyle"
        @mousedown="handleStartResize($event, northResizingHandle)"
      />
      <div
        class="resize-item resize-bar-horizontal"
        v-if="dockStatus === 0 || dockStatus === 1"
        :style="resizeBarSouthStyle"
        @mousedown="handleStartResize($event, southResizingHandle)"
      />
      <div
        class="resize-item resize-block-nwse"
        v-if="dockStatus === 0"
        :style="resizeBlockNorthWestStyle"
        @mousedown="handleStartResize($event, northWestResizingHandle)"
      />
      <div
        class="resize-item resize-block-nesw"
        v-if="dockStatus === 0"
        :style="resizeBlockNorthEastStyle"
        @mousedown="handleStartResize($event, northEastResizingHandle)"
      />
      <div
        class="resize-item resize-block-nesw"
        v-if="dockStatus === 0"
        :style="resizeBlockSouthWestStyle"
        @mousedown="handleStartResize($event, southWestResizingHandle)"
      />
      <div
        class="resize-item resize-block-nwse"
        v-if="dockStatus === 0"
        :style="resizeBlockSouthEastStyle"
        @mousedown="handleStartResize($event, southEastResizingHandle)"
      />
    </div>
    <div
      class="global-mask"
      v-if="adjustStatus !== 0 || contextMenuStatus !== 0"
      :style="{ cursor: maskCursor }"
    />
    <div>
      <div
        class="contextmenu dock"
        v-if="contextMenuStatus === 1"
        ref="dockContextmenuRef"
        aria-modal="true"
        tabindex="0"
        style="transform: translateX(-18px)"
        @blur="mayCloseContextMenu"
      >
        <ul class="contextmenu-body">
          <li @click="handleDockTop">顶</li>
          <li @click="handleDockLeft">左</li>
          <li @click="handleDockBottom">底</li>
          <li @click="handleDockRight">右</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'

import { type DockStatus, type VisualField } from './types.ts'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'

defineOptions({
  name: 'FloatyDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  title?: string
  minHeight?: number
  minWidth?: number
  zIndex?: number
  showContentMask?: boolean
  destroyContentOnClose?: boolean
  showDockButton?: boolean
  initialX?: number
  initialY?: number
  initialHeight?: number
  initialWidth?: number
  initialDockStatus?: DockStatus
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  minHeight: 175,
  minWidth: 140,
  zIndex: 3000,
  showContentMask: false,
  destroyContentOnClose: false,
  showDockButton: false,
  initialX: 100,
  initialY: 100,
  initialHeight: 175,
  initialWidth: 140,
  initialDockStatus: 0,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onVisualFieldAdjusted', visualField: VisualField): void
  (e: 'onClosed'): void
}

const emit = defineEmits<Emits>()

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// endregion

// region 可见性处理

const watchedVisible = ref<boolean>(props.visible)
const key = ref<number>(0)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
    if (value) {
      addBodyResizeListener()
    } else {
      removeBodyResizeListener()
    }
    if (props.destroyContentOnClose) {
      key.value += 1
    }
    restoreInitialValue()
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

function handleClose(): void {
  watchedVisible.value = false
  operateOverride.value = false
  nextTick(() => {
    emit('onClosed')
  })
}

// endregion

// region 显示参数

const x = ref<number>(props.initialX)
const y = ref<number>(props.initialY)
const height = ref<number>(props.initialHeight)
const width = ref<number>(props.initialWidth)
const dockStatus = ref<0 | 1 | 2 | 3 | 4>(props.initialDockStatus)

const visualField = computed<VisualField>(() => {
  return {
    x: x.value,
    y: y.value,
    height: height.value,
    width: width.value,
    dockStatus: dockStatus.value,
  }
})

function revalidateVisualField(): boolean {
  const oldPositionX = x.value
  const oldPositionY = y.value
  const oldSizeHeight = height.value
  const oldSizeWidth = width.value
  switch (dockStatus.value) {
    case 0:
      x.value = Math.min(x.value, document.body.clientWidth - 20)
      y.value = Math.min(y.value, document.body.clientHeight - 40)
      height.value = Math.max(height.value, props.minHeight)
      width.value = Math.max(width.value, props.minWidth)
      break
    case 1:
      x.value = 0
      y.value = 0
      height.value = Math.max(height.value, props.minHeight)
      width.value = document.body.clientWidth
      break
    case 2:
      x.value = 0
      y.value = 0
      height.value = document.body.clientHeight
      width.value = Math.max(width.value, props.minWidth)
      break
    case 3:
      x.value = 0
      y.value = document.body.clientHeight - height.value
      height.value = Math.max(height.value, props.minHeight)
      width.value = document.body.clientWidth
      break
    case 4:
      x.value = document.body.clientWidth - width.value
      y.value = 0
      height.value = document.body.clientHeight
      width.value = Math.max(width.value, props.minWidth)
      break
    default:
      break
  }
  if (oldPositionX !== x.value) {
    return true
  }
  if (oldPositionY !== y.value) {
    return true
  }
  if (oldSizeHeight !== height.value) {
    return true
  }
  return oldSizeWidth !== width.value
}

function revalidateVisualFieldAndEmit(): void {
  if (!revalidateVisualField()) {
    return
  }
  emit('onVisualFieldAdjusted', visualField.value)
}

function restoreInitialValue(): void {
  x.value = props.initialX
  y.value = props.initialY
  height.value = props.initialHeight
  width.value = props.initialWidth
  dockStatus.value = props.initialDockStatus
}

onMounted(() => {
  restoreInitialValue()
  revalidateVisualFieldAndEmit()
})

watch(
  () => props.minHeight,
  (value) => {
    if (height.value < value) {
      height.value = value
      emit('onVisualFieldAdjusted', visualField.value)
    }
  },
)

watch(
  () => props.minWidth,
  (value) => {
    if (width.value < value) {
      width.value = value
      emit('onVisualFieldAdjusted', visualField.value)
    }
  },
)

// endregion

// region 样式处理

const maskCursor = ref<string>('auto')

const containerStyle = computed(() => {
  return {
    height: `${height.value}px`,
    width: `${width.value}px`,
    left: `${x.value}px`,
    top: `${y.value}px`,
    zIndex: props.zIndex,
  }
})

const titleBarStyle = computed(() => {
  return {
    cursor: dockStatus.value === 0 ? 'move' : 'auto',
    zIndex: props.zIndex + 1,
  }
})

const resizeBarWestStyle = computed(() => {
  return {
    height: `${height.value}px`,
    left: '0',
    transform: 'translateX(-50%)',
    zIndex: props.zIndex + 9,
  }
})

const resizeBarEastStyle = computed(() => {
  return {
    height: `${height.value}px`,
    right: '0',
    transform: 'translateX(50%)',
    zIndex: props.zIndex + 9,
  }
})

const resizeBarNorthStyle = computed(() => {
  return {
    width: `${width.value}px`,
    top: '0',
    transform: 'translateY(-50%)',
    zIndex: props.zIndex + 9,
  }
})

const resizeBarSouthStyle = computed(() => {
  return {
    width: `${width.value}px`,
    bottom: '0',
    transform: 'translateY(50%)',
    zIndex: props.zIndex + 9,
  }
})

const resizeBlockNorthWestStyle = computed(() => {
  return {
    top: 0,
    left: 0,
    transform: 'translate(-50%,-50%)',
    zIndex: props.zIndex + 10,
  }
})

const resizeBlockNorthEastStyle = computed(() => {
  return {
    top: 0,
    right: 0,
    transform: 'translate(50%,-50%)',
    zIndex: props.zIndex + 10,
  }
})

const resizeBlockSouthWestStyle = computed(() => {
  return {
    bottom: 0,
    left: 0,
    transform: 'translate(-50%,50%)',
    zIndex: props.zIndex + 10,
  }
})

const resizeBlockSouthEastStyle = computed(() => {
  return {
    bottom: 0,
    right: 0,
    transform: 'translate(50%,50%)',
    zIndex: props.zIndex + 10,
  }
})

function inspectCursorStyle(event: MouseEvent): string {
  return window.getComputedStyle(event.target as Element, '::after').getPropertyValue('cursor')
}

// endregion

// region 移动/尺寸调整计算

const xCopy = ref<number>(0)
const yCopy = ref<number>(0)
const heightCopy = ref<number>(0)
const widthCopy = ref<number>(0)
const mouseXCopy = ref<number>(0)
const mouseYCopy = ref<number>(0)
const operateOverride = ref<boolean>(false)

/*
 * adjustStatus 代码含义:
 *   0: 没有调整。
 *   1: 正在移动。
 *   2: 正在调整尺寸。
 */
const adjustStatus = ref<0 | 1 | 2>(0)

const containerRef = useTemplateRef<HTMLElement>('containerRef')
const dockContextmenuRef = useTemplateRef<HTMLElement>('dockContextmenuRef')

let anchorResizeHandle: (dX: number, dY: number) => void = () => {}

function handleStartMove(event: MouseEvent): void {
  if (dockStatus.value !== 0) {
    return
  }
  if (operateOverride.value) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  mouseXCopy.value = event.clientX
  mouseYCopy.value = event.clientY
  xCopy.value = x.value
  yCopy.value = y.value
  maskCursor.value = inspectCursorStyle(event)
  adjustStatus.value = 1
  document.addEventListener('mousemove', handleMoving)
  document.addEventListener('mouseup', handleStopMove)
}

function handleMoving(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  requestAnimationFrame(() => {
    if (!containerRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    if (adjustStatus.value !== 1) {
      return
    }
    x.value = event.clientX - mouseXCopy.value + xCopy.value
    y.value = event.clientY - mouseYCopy.value + yCopy.value
    const minLeft = -containerRef.value.clientWidth + 20
    const maxLeft = document.body.clientWidth - 20
    const minTop = 0
    const maxTop = document.body.clientHeight - 40
    x.value = Math.max(x.value, minLeft)
    x.value = Math.min(x.value, maxLeft)
    y.value = Math.max(y.value, minTop)
    y.value = Math.min(y.value, maxTop)
  })
}

function handleStopMove(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  adjustStatus.value = 0
  document.removeEventListener('mousemove', handleMoving)
  document.removeEventListener('mouseup', handleStopMove)
  if (positionCopyEquals()) {
    return
  }
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleStartResize(
  event: MouseEvent,
  resizeHandle: (dX: number, dy: number) => void,
): void {
  event.preventDefault()
  event.stopPropagation()
  anchorResizeHandle = resizeHandle
  mouseXCopy.value = event.clientX
  mouseYCopy.value = event.clientY
  xCopy.value = x.value
  yCopy.value = y.value
  heightCopy.value = height.value
  widthCopy.value = width.value
  maskCursor.value = inspectCursorStyle(event)
  adjustStatus.value = 2
  document.addEventListener('mousemove', handleResizing)
  document.addEventListener('mouseup', handleStopResize)
}

function handleResizing(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  requestAnimationFrame(() => {
    if (adjustStatus.value !== 2) {
      return
    }
    const dX = event.clientX - mouseXCopy.value
    const dY = event.clientY - mouseYCopy.value
    anchorResizeHandle(dX, dY)
  })
}

function handleStopResize(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  adjustStatus.value = 0
  document.removeEventListener('mousemove', handleResizing)
  document.removeEventListener('mouseup', handleStopResize)
  if (positionCopyEquals() && sizeCopyEquals()) {
    return
  }
  emit('onVisualFieldAdjusted', visualField.value)
}

function positionCopyEquals(): boolean {
  return x.value === xCopy.value && y.value === yCopy.value
}

function sizeCopyEquals(): boolean {
  return height.value === heightCopy.value && width.value === widthCopy.value
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function westResizingHandle(dX: number, _dY: number): void {
  x.value = xCopy.value + dX
  width.value = widthCopy.value - dX
  const maxLeft = xCopy.value + widthCopy.value - 20
  const minWidth = props.minWidth
  x.value = Math.min(x.value, maxLeft)
  width.value = Math.max(width.value, minWidth)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eastResizingHandle(dX: number, _dY: number): void {
  width.value = widthCopy.value + dX
  const minWidth = props.minWidth
  width.value = Math.max(width.value, minWidth)
}

function northResizingHandle(_dX: number, dY: number): void {
  y.value = yCopy.value + dY
  height.value = heightCopy.value - dY
  const minTop = 0
  const maxTop = yCopy.value + heightCopy.value - props.minHeight
  const minHeight = props.minHeight
  const maxHeight = yCopy.value + heightCopy.value
  y.value = Math.min(y.value, maxTop)
  y.value = Math.max(y.value, minTop)
  height.value = Math.min(height.value, maxHeight)
  height.value = Math.max(height.value, minHeight)
}

function southResizingHandle(_dX: number, dY: number): void {
  height.value = heightCopy.value + dY
  const minHeight = props.minHeight
  height.value = Math.max(height.value, minHeight)
}

function northWestResizingHandle(dX: number, dY: number): void {
  westResizingHandle(dX, dY)
  northResizingHandle(dX, dY)
}

function northEastResizingHandle(dX: number, dY: number): void {
  eastResizingHandle(dX, dY)
  northResizingHandle(dX, dY)
}

function southWestResizingHandle(dX: number, dY: number): void {
  westResizingHandle(dX, dY)
  southResizingHandle(dX, dY)
}

function southEastResizingHandle(dX: number, dY: number): void {
  eastResizingHandle(dX, dY)
  southResizingHandle(dX, dY)
}

// endregion

// region 上下文菜单

/*
 * contextMenuStatus 代码含义:
 *   0: 未弹出菜单。
 *   1: 停靠选择菜单。
 */
const contextMenuStatus = ref<0 | 1>(0)

function handleShowContextMenu(status: 0 | 1): void {
  maskCursor.value = 'auto'
  contextMenuStatus.value = status
  nextTick(() => {
    if (status === 1) {
      if (!dockContextmenuRef.value) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      dockContextmenuRef.value.focus()
    }
  })
}

function mayCloseContextMenu(event: FocusEvent): void {
  if (!event) {
    contextMenuStatus.value = 0
    return
  }
  if (contextMenuStatus.value == 0) {
    return
  } else if (contextMenuStatus.value == 1) {
    if (!dockContextmenuRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    if (dockContextmenuRef.value.contains(event.relatedTarget as HTMLElement)) {
      return
    }
  }
  doCloseContextMenu()
}

function doCloseContextMenu(): void {
  contextMenuStatus.value = 0
}

// endregion

// region 停靠

const backupX = ref<number>(0)
const backupY = ref<number>(0)
const backupHeight = ref<number>(0)
const backupWidth = ref<number>(0)

function handleDockTop(): void {
  if (dockStatus.value === 0) {
    backupVisualField()
  }
  x.value = 0
  y.value = 0
  width.value = document.body.clientWidth
  dockStatus.value = 1
  doCloseContextMenu()
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleDockLeft(): void {
  if (dockStatus.value === 0) {
    backupVisualField()
  }
  x.value = 0
  y.value = 0
  height.value = document.body.clientHeight
  dockStatus.value = 2
  doCloseContextMenu()
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleDockBottom(): void {
  if (dockStatus.value === 0) {
    backupVisualField()
  }
  x.value = 0
  y.value = document.body.clientHeight - heightCopy.value
  height.value = heightCopy.value
  dockStatus.value = 3
  doCloseContextMenu()
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleDockRight(): void {
  if (dockStatus.value === 0) {
    backupVisualField()
  }
  x.value = document.body.clientWidth - widthCopy.value
  y.value = 0
  height.value = document.body.clientHeight
  dockStatus.value = 4
  doCloseContextMenu()
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleUndock(): void {
  operateOverride.value = false
  if (dockStatus.value !== 0) {
    resumeVisualField()
  }
  x.value = Math.min(x.value, document.body.clientWidth - 20)
  y.value = Math.min(y.value, document.body.clientHeight - 40)
  height.value = Math.max(height.value, props.minHeight)
  width.value = Math.max(width.value, props.minWidth)
  dockStatus.value = 0
  doCloseContextMenu()
  emit('onVisualFieldAdjusted', visualField.value)
}

function backupVisualField(): void {
  backupX.value = x.value
  backupY.value = y.value
  backupHeight.value = height.value
  backupWidth.value = width.value
}

function resumeVisualField(): void {
  x.value = backupX.value
  y.value = backupY.value
  height.value = backupHeight.value
  width.value = backupWidth.value
}

// endregion

// region 全局（窗体）尺寸检测

let bodyResizeObserver: ResizeObserver | null = null
let resizeTimeout: number = 0

function addBodyResizeListener(): void {
  if (bodyResizeObserver !== null) {
    return
  }
  bodyResizeObserver = new ResizeObserver(() => {
    if (!revalidateVisualField()) {
      return
    }
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      emit('onVisualFieldAdjusted', visualField.value)
    }, 300)
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
.floaty-dialog-container {
  position: fixed;
}

.frame {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: 4px;
  border-width: 2px;
  border-style: solid;
  border-color: #d8dce5;
}

.title-bar {
  height: 32px;
  width: 100%;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 5px 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);
}

.title-bar-item {
  height: 100%;
}

.title-bar-item:not(:last-child) {
  margin-right: 5px;
}

.content-panel {
  height: 0;
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;
}

.content-panel-item {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
}

.content-panel-mask {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.content-panel-body {
  overflow: hidden;
  border-style: solid;
  border-width: 8px;
  border-color: #ffffff;
}

.content-panel-placeholder {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.placeholder-text {
  user-select: none;
  color: #bfbfbf;
  font-size: 2rem;
}

.resize-item {
  position: absolute;
}

.resize-item.resize-bar-vertical {
  width: 12px;
  top: 0;
  cursor: ew-resize;
}

.resize-item.resize-bar-horizontal {
  height: 12px;
  left: 0;
  cursor: ns-resize;
}

.resize-item.resize-block-nwse {
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.resize-item.resize-block-nesw {
  width: 16px;
  height: 16px;
  cursor: nesw-resize;
}

.global-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
}

.title-area {
  width: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-area span {
  color: #495060;
  user-select: none;
  font-size: 14px;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.operate-area {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-bar-button-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.contextmenu {
  position: absolute;
  top: 27px;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: auto;
  z-index: 100000;
}

.contextmenu:focus {
  outline: none;
}

.contextmenu.dock ul {
  width: 60px;
  margin: 5px 0 0;
  padding: 5px 0;
  box-sizing: border-box;
  list-style-type: none;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  background: #f5f7fa;
}

.contextmenu.dock li {
  margin: 0;
  padding: 4px 6px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  color: #495060;
}

.contextmenu.dock li:hover {
  background: #eee;
}
</style>
