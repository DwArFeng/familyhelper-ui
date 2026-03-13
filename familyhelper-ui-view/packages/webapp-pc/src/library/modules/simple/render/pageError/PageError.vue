<template>
  <div class="page-error-container">
    <error-panel>
      <template v-slot:default>
        <div class="error-content-container">
          <span class="error-header-title-chs">页面错误</span>
          <textarea
            class="error-message-container"
            v-model="pageErrorStore.errorText"
            readonly
          ></textarea>
        </div>
      </template>
    </error-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type PageErrorStore } from '@/store/modules/pageError.ts'

import ErrorPanel from '../error/ErrorPanel.vue'

defineOptions({
  name: 'PageError',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const pageErrorStore = vim.ctx().store().vueStore<'page-error', PageErrorStore>('page-error')
</script>

<style scoped>
.page-error-container {
  height: 100%;
  width: 100%;
}

.error-content-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-header-title-chs {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-family: 微软雅黑, serif;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
  margin-bottom: 20px;
}

.error-message-container {
  width: 100%;
  flex-grow: 1;
  height: 100%;
  background: #ffffff;
  font-size: 14px;
  font-family: 微软雅黑, serif;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  resize: none;
  box-sizing: border-box;
  line-height: 1.6;
  color: #606266;
}

.error-message-container:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
</style>
