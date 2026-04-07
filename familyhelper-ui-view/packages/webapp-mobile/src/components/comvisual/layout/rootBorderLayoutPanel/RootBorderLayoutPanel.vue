<template>
  <div
    ref="fullScreenTargetRef"
    class="root-border-layout-panel-container"
    :class="{ 'is-fullscreen': fullScreen }"
  >
    <div class="main-area">
      <!-- Header -->
      <div v-if="headerVictorIf" v-show="headerVictorShow" class="box-card box-card-header">
        <div class="box-card-body">
          <slot name="header" />
        </div>
      </div>
      <!-- Center Area -->
      <div class="center-area">
        <!-- West -->
        <div
          v-if="westVictorIf"
          v-show="westVictorShow"
          class="box-card box-card-west"
          :style="{ width: westWidth }"
        >
          <div class="box-card-body">
            <slot name="west" />
          </div>
        </div>
        <!-- Main -->
        <div class="box-card box-card-main">
          <div class="box-card-body">
            <slot name="default" />
          </div>
        </div>
        <!-- East -->
        <div
          v-if="eastVictorIf"
          v-show="eastVictorShow"
          class="box-card box-card-east"
          :style="{ width: eastWidth }"
        >
          <div class="box-card-body">
            <slot name="east" />
          </div>
        </div>
      </div>
      <!-- Footer -->
      <div v-if="footerVictorIf" v-show="footerVictorShow" class="box-card box-card-footer">
        <div class="box-card-body">
          <slot name="footer" />
        </div>
      </div>
    </div>
    <floaty-tool
      v-if="atLeastOneToolButtonVisible"
      :allowed-dock-statuses="floatyAllowedDockStatuses"
      :snap-distance="toolSnapDistance"
      :z-index="toolZIndex"
      :initial-dock-status="initialToolDockStatus"
      :initial-x="initialToolX"
      :initial-y="initialToolY"
    >
      <template #default="{ dockStatus }">
        <div
          class="root-floaty-tool__inner"
          :class="{ 'root-floaty-tool__inner--row': isDockHorizontal(dockStatus) }"
        >
          <native-button
            v-if="showNorthToolButton"
            class="root-floaty-tool__native-btn"
            size="small"
            square
            :kind="headerToolShownStatus ? 'primary' : 'default'"
            @click="toggleHeaderShown"
          >
            上
          </native-button>
          <native-button
            v-if="showWestToolButton"
            class="root-floaty-tool__native-btn"
            size="small"
            square
            :kind="westToolShownStatus ? 'primary' : 'default'"
            @click="toggleWestShown"
          >
            左
          </native-button>
          <native-button
            v-if="showEastToolButton"
            class="root-floaty-tool__native-btn"
            size="small"
            square
            :kind="eastToolShownStatus ? 'primary' : 'default'"
            @click="toggleEastShown"
          >
            右
          </native-button>
          <native-button
            v-if="showSouthToolButton"
            class="root-floaty-tool__native-btn"
            size="small"
            square
            :kind="footerToolShownStatus ? 'primary' : 'default'"
            @click="toggleFooterShown"
          >
            下
          </native-button>
          <native-button
            v-if="fullScreenToolVisible"
            class="root-floaty-tool__native-btn"
            size="small"
            square
            :kind="fullScreen ? 'primary' : 'default'"
            :aria-pressed="fullScreen"
            @click="toggleFullScreen"
          >
            全
          </native-button>
        </div>
      </template>
    </floaty-tool>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import screenfull from 'screenfull'

import FloatyTool from '@/components/comvisual/widget/floatyTool/FloatyTool.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'

import { type DockStatus } from '@/components/comvisual/widget/floatyTool/types.ts'

defineOptions({
  name: 'RootBorderLayoutPanel',
})

// region Props 定义

type Props = {
  breadcrumb?: string[]
  headerVisible?: boolean
  footerVisible?: boolean
  westVisible?: boolean
  eastVisible?: boolean
  westWidth?: string
  eastWidth?: string
  destroyHeaderOnHide?: boolean
  destroyFooterOnHide?: boolean
  destroyWestOnHide?: boolean
  destroyEastOnHide?: boolean
  northToolVisible?: boolean
  westToolVisible?: boolean
  eastToolVisible?: boolean
  southToolVisible?: boolean
  fullScreenToolVisible?: boolean
  toolSnapDistance?: number
  toolZIndex?: number
  initialToolDockStatus?: DockStatus
  initialToolX?: number
  initialToolY?: number
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumb: () => [],
  headerVisible: false,
  footerVisible: false,
  westVisible: false,
  eastVisible: false,
  westWidth: 'unset',
  eastWidth: 'unset',
  destroyHeaderOnHide: true,
  destroyFooterOnHide: true,
  destroyWestOnHide: true,
  destroyEastOnHide: true,
  northToolVisible: true,
  westToolVisible: true,
  eastToolVisible: true,
  southToolVisible: true,
  fullScreenToolVisible: true,
  toolSnapDistance: 20,
  toolZIndex: 500,
  initialToolDockStatus: 4,
  initialToolX: 100,
  initialToolY: -200,
})

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  header?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  west?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  east?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  footer?: (props: {}) => any
}>()

// endregion

// region V-IF 处理

const headerVictorIf = computed(() => {
  if (!props.destroyHeaderOnHide) {
    return true
  }
  return props.headerVisible
})

const footerVictorIf = computed(() => {
  if (!props.destroyFooterOnHide) {
    return true
  }
  return props.footerVisible
})

const westVictorIf = computed(() => {
  if (!props.destroyWestOnHide) {
    return true
  }
  return props.westVisible
})

const eastVictorIf = computed(() => {
  if (!props.destroyEastOnHide) {
    return true
  }
  return props.eastVisible
})

// endregion

// region V-SHOW 处理

const headerVictorShow = computed(() => {
  if (!headerToolShownStatus.value) {
    return false
  }
  if (props.destroyHeaderOnHide) {
    return true
  }
  return props.headerVisible
})

const footerVictorShow = computed(() => {
  if (!footerToolShownStatus.value) {
    return false
  }
  if (props.destroyFooterOnHide) {
    return true
  }
  return props.footerVisible
})

const westVictorShow = computed(() => {
  if (!westToolShownStatus.value) {
    return false
  }
  if (props.destroyWestOnHide) {
    return true
  }
  return props.westVisible
})

const eastVictorShow = computed(() => {
  if (!eastToolShownStatus.value) {
    return false
  }
  if (props.destroyEastOnHide) {
    return true
  }
  return props.eastVisible
})

// endregion

// region 浮动工具显示处理

const atLeastOneToolButtonVisible = computed(() => {
  return (
    (props.northToolVisible && props.headerVisible) ||
    (props.westToolVisible && props.westVisible) ||
    (props.eastToolVisible && props.eastVisible) ||
    (props.southToolVisible && props.footerVisible) ||
    props.fullScreenToolVisible
  )
})

// endregion

// region 浮动工具样式处理

const floatyAllowedDockStatuses: DockStatus[] = [1, 2, 3, 4]

function isDockHorizontal(dockStatus: DockStatus): boolean {
  return dockStatus === 1 || dockStatus === 3
}

// endregion

// region 浮动工具四边处理

const headerToolShownStatus = ref(true)
const footerToolShownStatus = ref(true)
const westToolShownStatus = ref(true)
const eastToolShownStatus = ref(true)

const showNorthToolButton = computed(() => props.northToolVisible && props.headerVisible)
const showWestToolButton = computed(() => props.westToolVisible && props.westVisible)
const showEastToolButton = computed(() => props.eastToolVisible && props.eastVisible)
const showSouthToolButton = computed(() => props.southToolVisible && props.footerVisible)

function toggleHeaderShown(): void {
  headerToolShownStatus.value = !headerToolShownStatus.value
}

function toggleFooterShown(): void {
  footerToolShownStatus.value = !footerToolShownStatus.value
}

function toggleWestShown(): void {
  westToolShownStatus.value = !westToolShownStatus.value
}

function toggleEastShown(): void {
  eastToolShownStatus.value = !eastToolShownStatus.value
}

// endregion

// region 浮动工具全屏处理

const fullScreenTargetRef = useTemplateRef<HTMLElement>('fullScreenTargetRef')

const fullScreen = ref(false)

let escapeEventFlag = false

function fullScreenHandler(): void {
  if (escapeEventFlag) {
    escapeEventFlag = false
    return
  }
  const el = fullScreenTargetRef.value
  fullScreen.value = screenfull.isEnabled && el !== null && screenfull.element === el
}

async function toggleFullScreen(): Promise<void> {
  const el = fullScreenTargetRef.value
  if (!el) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (screenfull.isEnabled) {
    escapeEventFlag = true
    fullScreen.value = !fullScreen.value
    if (fullScreen.value) {
      await screenfull.request(el)
    } else {
      await screenfull.exit()
    }
  }
}

onMounted(() => {
  if (screenfull.isEnabled) {
    const el = fullScreenTargetRef.value
    fullScreen.value = el !== null && screenfull.element === el
    screenfull.on('change', fullScreenHandler)
  }
})

onBeforeUnmount(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', fullScreenHandler)
  }
})

// endregion
</script>

<style scoped>
.box-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #ffffff;
  color: #303133;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.box-card-body {
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  flex: 1 1 auto;
  min-height: 0;
}

.root-border-layout-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.root-border-layout-panel-container.is-fullscreen {
  background-color: #ffffff;
}

.main-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  box-sizing: border-box;
}

.center-area {
  height: 0;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

.box-card-header {
  margin-bottom: 5px;
}

.box-card-footer {
  margin-top: 5px;
}

.box-card-west {
  margin-right: 5px;
}

.box-card-east {
  margin-left: 5px;
}

.box-card-main {
  width: 0;
  flex-grow: 1;
}

.root-floaty-tool__inner {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 4px;
  min-width: 0;
}

.root-floaty-tool__inner--row {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.root-floaty-tool__native-btn) {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  padding: 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1;
}
</style>
