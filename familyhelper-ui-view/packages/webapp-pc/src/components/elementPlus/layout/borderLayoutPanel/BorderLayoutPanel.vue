<template>
  <div class="border-layout-panel-container">
    <div class="main-area">
      <!-- Header -->
      <el-card
        v-if="headerVictorIf"
        v-show="headerVictorShow"
        class="box-card-header"
        body-style="height: 100%; padding: 15px; box-sizing:border-box"
      >
        <slot name="header" />
      </el-card>
      <!-- Center Area -->
      <div class="center-area">
        <!-- West -->
        <el-card
          v-if="westVictorIf"
          v-show="westVictorShow"
          class="box-card-west"
          body-style="height: 100%; padding: 15px; box-sizing:border-box"
          :style="{ width: westWidth }"
        >
          <slot name="west" />
        </el-card>
        <!-- Main -->
        <el-card
          class="box-card-main"
          body-style="height: 100%; padding: 15px; box-sizing:border-box"
        >
          <slot name="default" />
        </el-card>
        <!-- East -->
        <el-card
          v-if="eastVictorIf"
          v-show="eastVictorShow"
          class="box-card-east"
          body-style="height: 100%; padding: 15px; box-sizing:border-box"
          :style="{ width: eastWidth }"
        >
          <slot name="east" />
        </el-card>
      </div>
      <!-- Footer -->
      <el-card
        v-if="footerVictorIf"
        v-show="footerVictorShow"
        class="box-card-footer"
        body-style="height: 100%; padding: 15px; box-sizing:border-box"
      >
        <slot name="footer" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'BorderLayoutPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
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
})

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
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

// -----------------------------------------------------------V-IF 处理-----------------------------------------------------------
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

// -----------------------------------------------------------V-SHOW 处理-----------------------------------------------------------
const headerVictorShow = computed(() => {
  if (props.destroyHeaderOnHide) {
    return true
  }
  return props.headerVisible
})

const footerVictorShow = computed(() => {
  if (props.destroyFooterOnHide) {
    return true
  }
  return props.footerVisible
})

const westVictorShow = computed(() => {
  if (props.destroyWestOnHide) {
    return true
  }
  return props.westVisible
})

const eastVictorShow = computed(() => {
  if (props.destroyEastOnHide) {
    return true
  }
  return props.eastVisible
})
</script>

<style scoped>
.border-layout-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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
</style>
