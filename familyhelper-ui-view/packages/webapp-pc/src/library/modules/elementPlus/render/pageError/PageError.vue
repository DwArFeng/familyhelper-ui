<template>
  <div class="page-error-container">
    <error-panel>
      <template v-slot:default>
        <div class="error-content-container">
          <span class="error-header-title-chs">页面错误</span>
          <el-input
            class="error-message-container"
            type="textarea"
            v-model="pageErrorStore.errorText"
            resize="none"
            readonly
          >
          </el-input>
        </div>
      </template>
    </error-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import type { PageErrorStore } from '@/store/modules/pageError.ts'

import ErrorPanel from '@/library/modules/elementPlus/render/error/ErrorPanel.vue'

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
  font-size: 58px;
  font-family: 微软雅黑, serif;
  color: #7bbdff;
  text-shadow: 0 0 8px black;
  margin-bottom: 10px;
}

.error-message-container {
  width: 100%;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.error-message-container :deep(.el-textarea__inner) {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-family: 微软雅黑, serif;
}
</style>
