<template>
  <div class="page-forbidden-container">
    <error-panel>
      <template v-slot:default>
        <div class="error-content-container">
          <span class="error-header-title-chs">{{
            t('library.element_plus_engineering.page_forbidden.title')
          }}</span>
          <el-input
            class="error-message-container"
            type="textarea"
            :model-value="t('library.element_plus_engineering.page_forbidden.text')"
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
  name: 'PageForbidden',
})

// region I18n 引入

const { t } = useI18n()

// endregion
</script>

<style scoped>
.page-forbidden-container {
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

/*noinspection CssNoGenericFontName*/
.error-header-title-chs {
  font-size: var(--element-plus-engineering-font-size-error-title);
  font-family: var(--element-plus-engineering-font-family);
  color: var(--element-plus-engineering-error-title-color);
  text-shadow: var(--element-plus-engineering-error-title-shadow);
  margin-bottom: 10px;
}

.error-message-container {
  width: 100%;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol,CssNoGenericFontName*/
.error-message-container :deep(.el-textarea__inner) {
  height: 100%;
  background: var(--element-plus-engineering-error-text-background);
  font-size: var(--el-font-size-base);
  font-family: var(--element-plus-engineering-font-family);
}
</style>
