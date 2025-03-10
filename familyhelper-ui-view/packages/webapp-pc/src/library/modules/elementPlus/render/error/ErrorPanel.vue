<template>
  <div class="error-panel-container" v-cloak :style="backgroundImageStyle">
    <div class="error-panel">
      <div class="home-button-container">
        <el-tooltip effect="dark" content="点此返回主页" placement="right">
          <el-button
            class="home-button"
            type="primary"
            :icon="HomeFilled"
            @click="handleBackToHomeButtonClicked"
          />
        </el-tooltip>
      </div>
      <div class="slot-container">
        <slot name="default" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, reactive } from 'vue'

import { HomeFilled } from '@element-plus/icons-vue'

import backgroundImg from '@/assets/img/error-background.jpg'

defineOptions({
  name: 'ErrorPanel',
})

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// -----------------------------------------------------------背景样式处理-----------------------------------------------------------
const backgroundImageStyle = reactive({
  backgroundImage: `url(${backgroundImg})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'auto 100%',
  backgroundPosition: 'center',
})

onMounted(() => {
  if (document.documentElement.clientWidth < document.documentElement.clientHeight) {
    backgroundImageStyle.backgroundSize = 'auto 100%'
  } else {
    backgroundImageStyle.backgroundSize = '100% auto'
  }
  window.onresize = () => {
    if (document.documentElement.clientWidth < document.documentElement.clientHeight) {
      backgroundImageStyle.backgroundSize = 'auto 100%'
    } else {
      backgroundImageStyle.backgroundSize = '100% auto'
    }
  }
})

// -----------------------------------------------------------方法定义-----------------------------------------------------------
function handleBackToHomeButtonClicked(): void {
  vim.ctx().router().vueRouter().push({ name: 'vim.layout' })
}
</script>

<style scoped>
.error-panel-container {
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}

.error-panel {
  position: relative;
  background-color: rgba(225, 225, 225, 0.5);
  height: min(768px, 85%);
  width: min(1024px, 85%);
  border-radius: 5px;
  box-shadow: 2px 2px 5px #808080;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 40px;
  box-sizing: border-box;
}

.slot-container {
  position: relative;
  z-index: 1;
  flex-grow: 1;
  width: 100%;
  height: 100%;
}

.home-button-container {
  height: 32px;
  width: 32px;
  position: absolute;
  z-index: 2;
  left: 40px;
  top: 25px;
}

.home-button {
  padding: 8px;
}
</style>
