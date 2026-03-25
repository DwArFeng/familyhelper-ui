<template>
  <div class="border-layout-panel-container">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'BorderLayoutPanel',
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
