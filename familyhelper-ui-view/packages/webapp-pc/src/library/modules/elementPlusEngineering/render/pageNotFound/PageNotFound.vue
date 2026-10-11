<template>
  <div class="page-not-found-container">
    <error-panel>
      <template v-slot:default>
        <div class="error-content-container">
          <span class="error-header-title-chs">{{
            t('library.element_plus_engineering.page_not_found.title')
          }}</span>
          <el-input
            class="error-message-container"
            type="textarea"
            :model-value="t('library.element_plus_engineering.page_not_found.text')"
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
import { useI18n } from 'vue-i18n'

import ErrorPanel from '@/library/modules/elementPlusEngineering/render/error/ErrorPanel.vue'

defineOptions({
  name: 'PageNotFound',
})

// region I18n 引入

const { t } = useI18n()

// endregion
</script>

<style scoped>
.page-not-found-container {
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
