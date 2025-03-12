<template>
  <div
    class="floaty-dialog-container"
    ref="containerRef"
    v-show="watchedVisible"
    :style="containerStyle"
  >
    <div class="frame" :key="key">
      <div class="title-bar" :style="titleBarStyle" @mousedown="handleStartMove">
        <div class="title-bar-item icon-area" v-if="iconVisible">
          <slot name="icon">
            <i class="iconfont" style="font-size: 20px; color: #495060">&#xffd3;</i>
          </slot>
        </div>
        <div class="title-bar-item title-area">
          <span>{{ title }}</span>
        </div>
        <div
          class="title-bar-item operate-area"
          @mouseenter="operateOverride = true"
          @mouseleave="operateOverride = false"
        >
          <el-button-group>
            <el-button class="button" v-if="dockStatus !== 0" type="info" @click="handleUndock">
              <i class="iconfont">&#xffd2;</i>
            </el-button>
            <el-button
              class="button"
              v-if="showOpacityButton"
              type="info"
              @click="handleShowContextMenu(2)"
            >
              <i class="iconfont">&#xffc9;</i>
            </el-button>
            <el-button
              class="button"
              v-if="showDockButton"
              type="info"
              @click="handleShowContextMenu(1)"
            >
              <i class="iconfont">&#xffd1;</i>
            </el-button>
            <el-button class="button" type="danger" @click="handleClose">
              <i class="iconfont">&#xffd0;</i>
            </el-button>
          </el-button-group>
        </div>
      </div>
      <div class="content-panel" :style="{ zIndex: zIndex }">
        <div
          class="content-panel-item content-panel-mask"
          v-show="showContentMask && adjustStatus === 1"
          :style="{ background: `rgba(255,255,255,${contentOpacity}%)` }"
        >
          <i class="iconfont">&#xffcb;</i>
        </div>
        <div
          class="content-panel-item content-panel-mask"
          v-show="showContentMask && adjustStatus === 2"
          :style="{ background: `rgba(255,255,255,${contentOpacity}%)` }"
        >
          <i class="iconfont">&#xffca;</i>
        </div>
        <!--suppress JSUnresolvedReference -->
        <div
          class="content-panel-item content-panel-body"
          v-show="!showContentMask || adjustStatus === 0"
          :style="{ opacity: `${contentOpacity}%` }"
        >
          <slot name="default">
            <div class="content-panel-placeholder">
              <i class="iconfont">&#xffd3;</i>
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
          <li class="iconfont" @click="handleDockTop">&#xffcf;</li>
          <li class="iconfont" @click="handleDockLeft">&#xffce;</li>
          <li class="iconfont" @click="handleDockBottom">&#xffcd;</li>
          <li class="iconfont" @click="handleDockRight">&#xffcc;</li>
        </ul>
      </div>
      <div
        class="contextmenu opacity"
        v-if="contextMenuStatus === 2"
        ref="opacityContextmenuRef"
        aria-modal="true"
        tabindex="0"
        style="transform: translateX(-30px)"
        @blur="mayCloseContextMenu"
      >
        <div class="slider">
          <el-slider
            v-model="contentOpacity"
            vertical
            height="80px"
            tabindex="-1"
            :show-tooltip="false"
            :min="0"
            :max="100"
            @change="handleContentOpacitySliderChanged"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

defineOptions({
  name: 'FloatyDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible?: boolean
  iconVisible?: boolean
  title?: string
  minHeight?: number
  minWidth?: number
  zIndex?: number
  showContentMask?: boolean
  destroyContentOnClose?: boolean
  showDockButton?: boolean
  showOpacityButton?: boolean
  initialX?: number
  initialY?: number
  initialHeight?: number
  initialWidth?: number
  initialDockStatus?: 0 | 1 | 2 | 3 | 4
  initialContentOpacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  iconVisible: false,
  title: '',
  minHeight: 175,
  minWidth: 140,
  zIndex: 3000,
  showContentMask: false,
  destroyContentOnClose: false,
  showDockButton: false,
  showOpacityButton: false,
  initialX: 100,
  initialY: 100,
  initialHeight: 175,
  initialWidth: 140,
  initialDockStatus: 0,
  initialContentOpacity: 100,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onVisualFieldAdjusted', visualField: VisualField): void
  (e: 'onClosed'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  icon?: (props: {}) => any
}>()

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
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
  emit('onClosed')
}

// -----------------------------------------------------------显示参数-----------------------------------------------------------
const x = ref<number>(props.initialX)
const y = ref<number>(props.initialY)
const height = ref<number>(props.initialHeight)
const width = ref<number>(props.initialWidth)
const dockStatus = ref<0 | 1 | 2 | 3 | 4>(props.initialDockStatus)
const contentOpacity = ref<number>(props.initialContentOpacity)

type VisualField = {
  x: number
  y: number
  height: number
  width: number
  /*
   * dockStatus 代码含义:
   *   0: 没有停靠。
   *   1: 上侧停靠。
   *   2: 左侧停靠。
   *   3: 下侧停靠。
   *   4: 右侧停靠。
   */
  dockStatus: 0 | 1 | 2 | 3 | 4
  contentOpacity: number
}

const visualField = computed<VisualField>(() => {
  return {
    x: x.value,
    y: y.value,
    height: height.value,
    width: width.value,
    dockStatus: dockStatus.value,
    contentOpacity: contentOpacity.value,
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
  contentOpacity.value = props.initialContentOpacity
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
    if (width.value > value) {
      width.value = value
      emit('onVisualFieldAdjusted', visualField.value)
    }
  },
)

// -----------------------------------------------------------样式处理-----------------------------------------------------------
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

// -----------------------------------------------------------移动/尺寸调整计算-----------------------------------------------------------
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
const opacityContextmenuRef = useTemplateRef<HTMLElement>('opacityContextmenuRef')

let anchorResizeHandle: (dX: number, dY: number) => void = () => {}

function handleStartMove(event: MouseEvent): void {
  // 如果窗口正在停靠，则不执行移动动作。
  if (dockStatus.value !== 0) {
    return
  }
  // 如果用户正在操作操作按钮区域，则停止移动操作。
  if (operateOverride.value) {
    return
  }
  // 阻止默认事件、并阻止事件穿透。
  event.preventDefault()
  event.stopPropagation()
  // 设置初始的鼠标位置。
  mouseXCopy.value = event.clientX
  mouseYCopy.value = event.clientY
  // 设置位置副本。
  xCopy.value = x.value
  yCopy.value = y.value
  // 设置蒙版的鼠标样式。
  maskCursor.value = inspectCursorStyle(event)
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
    if (adjustStatus.value !== 1) {
      return
    }
    // 计算鼠标移动增量，将增量应用到元素的位置属性中。
    x.value = event.clientX - mouseXCopy.value + xCopy.value
    y.value = event.clientY - mouseYCopy.value + yCopy.value
    // 计算边界。
    const minLeft = -containerRef.value.clientWidth + 20
    const maxLeft = document.body.clientWidth - 20
    const minTop = 0
    const maxTop = document.body.clientHeight - 40
    // 元素位置与边界坐标比较，并根据情况取值。
    x.value = Math.max(x.value, minLeft)
    x.value = Math.min(x.value, maxLeft)
    y.value = Math.max(y.value, minTop)
    y.value = Math.min(y.value, maxTop)
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
  // 根据条件抛出事件。
  if (positionCopyEquals()) {
    return
  }
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleStartResize(
  event: MouseEvent,
  resizeHandle: (dX: number, dy: number) => void,
): void {
  // 阻止默认事件、并阻止事件穿透。
  event.preventDefault()
  event.stopPropagation()
  // 设置锚点调整尺寸句柄。
  anchorResizeHandle = resizeHandle
  // 设置初始的鼠标位置。
  mouseXCopy.value = event.clientX
  mouseYCopy.value = event.clientY
  // 设置位置副本。
  xCopy.value = x.value
  yCopy.value = y.value
  // 设置尺寸副本。
  heightCopy.value = height.value
  widthCopy.value = width.value
  // 设置蒙版的鼠标样式。
  maskCursor.value = inspectCursorStyle(event)
  // 置位调整状态。
  adjustStatus.value = 2
  // 为 document 增加相关侦听。
  document.addEventListener('mousemove', handleResizing)
  document.addEventListener('mouseup', handleStopResize)
}

function handleResizing(event: MouseEvent): void {
  // 阻止默认事件、并阻止事件穿透。
  event.preventDefault()
  event.stopPropagation()
  // 应用动画帧处理移动动作。
  requestAnimationFrame(() => {
    // 该方法在动作帧中执行，因此存在滞后性，有可能在用户松开鼠标后执行。
    // 如果窗口没有调整尺寸，则直接退出。
    if (adjustStatus.value !== 2) {
      return
    }
    // 计算鼠标移动增量。
    const dX = event.clientX - mouseXCopy.value
    const dY = event.clientY - mouseYCopy.value
    // 调用锚点句柄处理调整尺寸细节。
    anchorResizeHandle(dX, dY)
  })
}

function handleStopResize(event: MouseEvent): void {
  // 阻止默认事件、并阻止事件穿透。
  event.preventDefault()
  event.stopPropagation()
  // 复位调整状态。
  adjustStatus.value = 0
  // 为 document 移除相关侦听。
  document.removeEventListener('mousemove', handleResizing)
  document.removeEventListener('mouseup', handleStopResize)
  // 根据条件抛出事件。
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
  // 将增量应用到元素的位置属性中。
  x.value = xCopy.value + dX
  width.value = widthCopy.value - dX
  // 计算极限值。
  const maxLeft = xCopy.value + widthCopy.value - 20
  const minWidth = props.minWidth
  // 元素位置、尺寸与极限值比较，并根据情况取值。
  x.value = Math.min(x.value, maxLeft)
  width.value = Math.max(width.value, minWidth)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eastResizingHandle(dX: number, _dY: number): void {
  // 将增量应用到元素的位置属性中。
  width.value = widthCopy.value + dX
  // 计算极限值。
  const minWidth = props.minWidth
  // 元素位置、尺寸与极限值比较，并根据情况取值。
  width.value = Math.max(width.value, minWidth)
}

function northResizingHandle(_dX: number, dY: number): void {
  // 将增量应用到元素的位置属性中。
  y.value = yCopy.value + dY
  height.value = heightCopy.value - dY
  // 计算极限值。
  const minTop = 0
  const maxTop = yCopy.value + heightCopy.value - props.minHeight
  const minHeight = props.minHeight
  const maxHeight = yCopy.value + heightCopy.value
  // 元素位置、尺寸与极限值比较，并根据情况取值。
  y.value = Math.min(y.value, maxTop)
  y.value = Math.max(y.value, minTop)
  height.value = Math.min(height.value, maxHeight)
  height.value = Math.max(height.value, minHeight)
}

function southResizingHandle(_dX: number, dY: number): void {
  // 将增量应用到元素的位置属性中。
  height.value = heightCopy.value + dY
  // 计算极限值。
  const minHeight = props.minHeight
  // 元素位置、尺寸与极限值比较，并根据情况取值。
  height.value = Math.max(height.value, minHeight)
}

function northWestResizingHandle(dX: number, dY: number): void {
  // 代理两个边的尺寸调整句柄。
  westResizingHandle(dX, dY)
  northResizingHandle(dX, dY)
}

function northEastResizingHandle(dX: number, dY: number): void {
  // 代理两个边的尺寸调整句柄。
  eastResizingHandle(dX, dY)
  northResizingHandle(dX, dY)
}

function southWestResizingHandle(dX: number, dY: number): void {
  // 代理两个边的尺寸调整句柄。
  westResizingHandle(dX, dY)
  southResizingHandle(dX, dY)
}

function southEastResizingHandle(dX: number, dY: number): void {
  // 代理两个边的尺寸调整句柄。
  eastResizingHandle(dX, dY)
  southResizingHandle(dX, dY)
}

// -----------------------------------------------------------上下文菜单-----------------------------------------------------------
/*
 * contextMenuStatus 代码含义:
 *   0: 未弹出菜单。
 *   1: 停靠选择菜单。
 *   2: 组件透明度调整菜单。
 */
const contextMenuStatus = ref<0 | 1 | 2>(0)

function handleShowContextMenu(status: 0 | 1 | 2): void {
  maskCursor.value = 'auto'
  contextMenuStatus.value = status
  nextTick(() => {
    if (status === 1) {
      if (!dockContextmenuRef.value) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      dockContextmenuRef.value.focus()
    } else if (status === 2) {
      if (!opacityContextmenuRef.value) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      opacityContextmenuRef.value.focus()
    }
  })
}

function handleContentOpacitySliderChanged(): void {
  // 关闭菜单。
  doCloseContextMenu()
  // 抛出事件。
  emit('onVisualFieldAdjusted', visualField.value)
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
  } else if (contextMenuStatus.value == 2) {
    if (!opacityContextmenuRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    if (opacityContextmenuRef.value.contains(event.relatedTarget as HTMLElement)) {
      return
    }
  }
  doCloseContextMenu()
}

function doCloseContextMenu(): void {
  contextMenuStatus.value = 0
}

// -----------------------------------------------------------停靠-----------------------------------------------------------
const backupX = ref<number>(0)
const backupY = ref<number>(0)
const backupHeight = ref<number>(0)
const backupWidth = ref<number>(0)

function handleDockTop(): void {
  // 如果窗口之前是未停靠状态，则备份视觉字段。
  if (dockStatus.value === 0) {
    backupVisualField()
  }
  // 位置及尺寸变更。
  x.value = 0
  y.value = 0
  width.value = document.body.clientWidth
  // 设置停靠状态。
  dockStatus.value = 1
  // 关闭菜单。
  doCloseContextMenu()
  // 抛出事件。
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleDockLeft(): void {
  // 如果窗口之前是停靠状态，则备份视觉字段。
  if (dockStatus.value === 0) {
    backupVisualField()
  }
  // 位置及尺寸变更。
  x.value = 0
  y.value = 0
  height.value = document.body.clientHeight
  // 设置停靠状态。
  dockStatus.value = 2
  // 关闭菜单。
  doCloseContextMenu()
  // 抛出事件。
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleDockBottom(): void {
  // 如果窗口之前是未停靠状态，则备份视觉字段。
  if (dockStatus.value === 0) {
    backupVisualField()
  }
  // 位置及尺寸变更。
  x.value = 0
  y.value = document.body.clientHeight - heightCopy.value
  height.value = heightCopy.value
  // 设置停靠状态。
  dockStatus.value = 3
  // 关闭菜单。
  doCloseContextMenu()
  // 抛出事件。
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleDockRight(): void {
  // 如果窗口之前是未停靠状态，则备份视觉字段。
  if (dockStatus.value === 0) {
    backupVisualField()
  }
  // 位置及尺寸变更。
  x.value = document.body.clientWidth - widthCopy.value
  y.value = 0
  height.value = document.body.clientHeight
  // 设置停靠状态。
  dockStatus.value = 4
  // 关闭菜单。
  doCloseContextMenu()
  // 抛出事件。
  emit('onVisualFieldAdjusted', visualField.value)
}

function handleUndock(): void {
  // 复位操作区域复写标记。
  operateOverride.value = false
  // 如果窗口之前是停靠状态，则恢复视觉字段。
  if (dockStatus.value !== 0) {
    resumeVisualField()
  }
  // 元素位置与边界坐标比较，并根据情况取值。
  x.value = Math.min(x.value, document.body.clientWidth - 20)
  y.value = Math.min(y.value, document.body.clientHeight - 40)
  // 保证尺寸不小于最小尺寸。
  height.value = Math.max(height.value, props.minHeight)
  width.value = Math.max(width.value, props.minWidth)
  // 设置停靠状态。
  dockStatus.value = 0
  // 关闭菜单。
  doCloseContextMenu()
  // 抛出事件。
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

// -----------------------------------------------------------全局（窗体）尺寸检测-----------------------------------------------------------
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
}

.content-panel-mask {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.content-panel-mask i {
  user-select: none;
  color: #bfbfbf;
  font-size: 64px;
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

.content-panel-placeholder i {
  user-select: none;
  color: #bfbfbf;
  font-size: 64px;
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

.icon-area {
  width: 21px;
  user-select: none;
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

.operate-area .button {
  height: 20px;
  padding: 2px 5px;
}

.operate-area .button i {
  font-size: 14px;
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
  padding: 1px 4px;
  cursor: pointer;
  font-size: 20px;
  text-align: center;
  color: #495060;
}

.contextmenu.dock li:hover {
  background: #eee;
}

.contextmenu.opacity .slider {
  width: 60px;
  margin: 5px 0 0;
  padding: 17px 0;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/*noinspection CssUnusedSymbol*/
.contextmenu.opacity :deep(.el-slider__button) {
  height: 12px;
  width: 12px;
}
</style>
