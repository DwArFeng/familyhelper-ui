<template>
  <div class="error-panel-container" v-cloak :style="backgroundImageStyle">
    <div class="error-panel">
      <div class="home-button-container">
        <button class="home-button" title="点此返回主页" @click="handleBackToHomeButtonClicked">
          <svg class="home-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor"
              d="M512 128 128 447.936V896h256V640h256v256h256V447.936L512 128z"
            />
          </svg>
        </button>
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
  background-color: #f5f7fa;
}

.error-panel {
  position: relative;
  background-color: #ffffff;
  height: min(768px, 85%);
  width: min(1024px, 85%);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
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
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.home-button:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

.home-button:active {
  background-color: #d9ecff;
  border-color: #409eff;
  color: #409eff;
}

.home-icon {
  width: 16px;
  height: 16px;
  color: #909399;
  transition: color 0.2s ease;
}
</style>
