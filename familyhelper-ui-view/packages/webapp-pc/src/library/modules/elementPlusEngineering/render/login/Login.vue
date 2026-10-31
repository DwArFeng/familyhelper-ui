<template>
  <div class="page-login-container" v-cloak :style="backgroundImageStyle">
    <!--suppress HtmlUnknownAttribute -->
    <div
      class="login-panel"
      v-loading="loading"
      element-loading-background="var(--element-plus-engineering-login-loading-mask-background)"
    >
      <div class="login-banner">
        <span class="login-panel-text">{{
          t('library.element_plus_engineering.login.banner.author')
        }}</span>
        <div class="login-banner-actions">
          <span class="login-banner-github login-panel-text">{{
            t('library.element_plus_engineering.login.banner.github')
          }}</span>
          <el-dropdown
            class="login-banner-selector"
            trigger="click"
            :disabled="!themeStore.ready || themeStore.themeList.length === 0"
            @command="handleThemeChange"
          >
            <el-button
              class="login-banner-button"
              type="primary"
              :disabled="!themeStore.ready || themeStore.themeList.length === 0"
              :title="t('library.element_plus_engineering.theme_selector.placeholder')"
              :aria-label="t('library.element_plus_engineering.theme_selector.placeholder')"
            >
              <i class="iconfont login-banner-icon" aria-hidden="true">&#xffc7;</i>
            </el-button>
            <template v-slot:dropdown>
              <el-dropdown-menu class="login-selector-menu">
                <el-dropdown-item
                  v-for="item in themeStore.themeList"
                  :key="item.key"
                  class="login-selector-item"
                  :class="{ 'is-current': themeStore.theme === item.key }"
                  :command="item.key"
                >
                  <span class="login-selector-label">{{ item.label }}</span>
                  <el-icon
                    v-if="themeStore.theme === item.key"
                    class="login-selector-check"
                    aria-hidden="true"
                  >
                    <check-icon />
                  </el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown
            class="login-banner-selector"
            trigger="click"
            :disabled="!iahnStore.ready || iahnStore.localeList.length === 0"
            @command="handleLocaleChange"
          >
            <el-button
              class="login-banner-button"
              type="primary"
              :disabled="!iahnStore.ready || iahnStore.localeList.length === 0"
              :title="t('library.element_plus_engineering.locale_selector.placeholder')"
              :aria-label="t('library.element_plus_engineering.locale_selector.placeholder')"
            >
              <i class="iconfont login-banner-icon" aria-hidden="true">&#xffc8;</i>
            </el-button>
            <template v-slot:dropdown>
              <el-dropdown-menu class="login-selector-menu login-locale-menu">
                <el-dropdown-item
                  v-for="item in iahnStore.localeList"
                  :key="item.locale"
                  class="login-selector-item"
                  :class="{ 'is-current': iahnStore.locale === item.locale }"
                  :command="item.locale"
                >
                  <span class="login-selector-label" :lang="item.locale">{{ item.label }}</span>
                  <el-icon
                    v-if="iahnStore.locale === item.locale"
                    class="login-selector-check"
                    aria-hidden="true"
                  >
                    <check-icon />
                  </el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="login-header">
        <span class="login-header-title-chs">{{
          t('library.element_plus_engineering.login.title.primary')
        }}</span>
        <span class="login-header-title-en">{{
          t('library.element_plus_engineering.login.title.secondary')
        }}</span>
      </div>
      <el-form class="login-main" ref="formRef" :model="form" @keydown="handleHotKeyDown">
        <el-form-item class="login-main-input">
          <el-input
            v-model="form.id"
            :placeholder="t('library.element_plus_engineering.login.placeholder.id')"
          ></el-input>
        </el-form-item>
        <el-form-item class="login-main-input">
          <el-input
            v-model="form.password"
            :placeholder="t('library.element_plus_engineering.login.placeholder.password')"
            show-password
          ></el-input>
        </el-form-item>
        <div class="login-main-status">
          <span class="login-panel-text">{{
            t('library.element_plus_engineering.login.action.remember_password')
          }}</span>
          <span class="login-panel-text">{{
            t('library.element_plus_engineering.login.action.forgot_password')
          }}</span>
        </div>
      </el-form>
      <div class="login-placeholder" />
      <div class="login-footer">
        <el-button
          class="login-footer-button"
          type="primary"
          :disabled="form.id === '' || form.password === ''"
          @click="handleLogin"
        >
          {{ t('library.element_plus_engineering.login.action.login') }}
        </el-button>
        <span class="login-footer-register login-panel-text">{{
          t('library.element_plus_engineering.login.action.register')
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, reactive, ref } from 'vue'

import { useI18n } from 'vue-i18n'

import { type LnpStore } from '@/store/modules/lnp.ts'
import { type IahnStore } from '@/store/modules/iahn.ts'
import { type ThemeStore } from '@/store/modules/theme.ts'

import backgroundImg from '@/assets/img/login-background.jpg'

import { Check as CheckIcon } from '@element-plus/icons-vue'

defineOptions({
  name: 'LoginComponent',
})

// region I18n 引入

const { t } = useI18n()

// endregion

// region Store 引入

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')
const iahnStore = vim.ctx().store().vueStore<'iahn', IahnStore>('iahn')
const themeStore = vim.ctx().store().vueStore<'theme', ThemeStore>('theme')

// endregion

// region 主题切换逻辑

function handleThemeChange(theme: string): void {
  themeStore.setTheme(theme)
}

// endregion

// region 地区切换逻辑

function handleLocaleChange(locale: string): void {
  iahnStore.setLocale(locale)
}

// endregion

// region Loading 状态

const loading = ref<number>(0)

// endregion

// region +---------------------------背景样式处理

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

// endregion

// region 表单项处理

const form = reactive({
  id: '',
  password: '',
})

// endregion

// region 登录处理

function handleLogin(): void {
  if (!form.id || !form.password) {
    return
  }
  loading.value += 1
  lnpStore
    .willLogin({ account_key: { string_id: form.id }, password: form.password })
    .execute()
    .catch(() => {})
    .finally(() => {
      loading.value -= 1
    })
}

function handleHotKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
    handleLogin()
  }
}

// endregion
</script>

<style scoped>
.page-login-container {
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}

.login-panel {
  background-color: var(--element-plus-engineering-login-panel-background);
  height: min(600px, 75%);
  width: min(800px, 75%);
  border-radius: 5px;
  box-shadow: var(--el-box-shadow-dark);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 40px;
  box-sizing: border-box;
}

.login-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.el-form-item {
  margin-bottom: 10px;
}

.login-main-input {
  width: 100%;
}

.login-main-input ::v-deep(.el-input) {
  height: 40px;
}

.login-banner {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.login-banner-actions {
  min-width: 0;
  margin-left: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.login-banner-github {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

/*noinspection CssNoGenericFontName*/
.login-header-title-chs {
  font-size: var(--element-plus-engineering-font-size-login-title);
  font-family: var(--element-plus-engineering-font-family);
  color: var(--element-plus-engineering-login-accent-color);
  text-shadow: var(--element-plus-engineering-login-title-shadow);
}

/*noinspection CssNoGenericFontName*/
.login-header-title-en {
  font-size: var(--element-plus-engineering-font-size-login-subtitle);
  font-family: var(--element-plus-engineering-font-family);
  color: var(--element-plus-engineering-login-accent-color);
  text-shadow: var(--element-plus-engineering-login-subtitle-shadow);
}

.login-main-status {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.login-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-footer-button {
  width: 100%;
  height: 40px;
  border-radius: 25px;
  margin-bottom: 10px;
  background: var(--element-plus-engineering-login-accent-color);
  border-color: var(--element-plus-engineering-login-accent-color);
}

.login-banner-selector {
  flex-shrink: 0;
}

.login-banner-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.login-banner-icon {
  color: var(--element-plus-engineering-login-text-color);
  font-size: var(--el-font-size-large);
  line-height: 1;
}

.login-selector-menu {
  min-width: 160px;
}

.login-selector-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-selector-item.is-current {
  color: var(--el-color-primary);
  font-weight: var(--el-font-weight-primary);
}

.login-selector-label {
  min-width: 0;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-selector-check {
  flex-shrink: 0;
}

.login-footer-register {
  width: 100%;
  text-align: right;
}

.login-panel-text {
  color: var(--element-plus-engineering-login-accent-color);
  text-shadow: var(--element-plus-engineering-login-subtitle-shadow);
}

.login-placeholder {
  flex-grow: 1;
}
</style>
