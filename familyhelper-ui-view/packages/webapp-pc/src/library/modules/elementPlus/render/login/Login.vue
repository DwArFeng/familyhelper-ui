<template>
  <div class="page-forbidden-container" v-cloak :style="backgroundImageStyle">
    <!--suppress HtmlUnknownAttribute -->
    <div class="login-panel" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.1)">
      <div class="login-banner">
        <span class="login-panel-text">赵扶风开发制作</span>
        <span class="login-panel-text">github地址: https://github.com/</span>
      </div>
      <div class="login-header">
        <span class="login-header-title-chs">用户登录</span>
        <span class="login-header-title-en">User Login</span>
      </div>
      <el-form class="login-main" ref="formRef" :model="form" @keydown="handleHotKeyDown">
        <el-form-item class="login-main-input">
          <el-input v-model="form.id" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item class="login-main-input">
          <el-input v-model="form.password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <div class="login-main-status">
          <span class="login-panel-text">记住密码</span>
          <span class="login-panel-text">忘记密码?</span>
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
          登录
        </el-button>
        <span class="login-footer-register login-panel-text">没有账号?立即注册!</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, reactive, ref } from 'vue'

import { type LnpStore } from '@/store/modules/lnp.ts'

import backgroundImg from '@/assets/img/login-background.jpg'

defineOptions({
  name: 'LoginComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------Loading 状态-----------------------------------------------------------
const loading = ref<number>(0)

// --------------------------------+---------------------------背景样式处理-----------------------------------------------------------
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

// -----------------------------------------------------------表单项处理-----------------------------------------------------------
const form = reactive({
  id: '',
  password: '',
})

// -----------------------------------------------------------登录处理-----------------------------------------------------------
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
</script>

<style scoped>
.page-forbidden-container {
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}

.login-panel {
  background-color: rgba(128, 128, 128, 0.5);
  height: min(600px, 75%);
  width: min(800px, 75%);
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
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

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.login-header-title-chs {
  font-size: 64px;
  font-family: 微软雅黑, serif;
  color: #7bbdff;
  text-shadow: 0 0 8px black;
}

.login-header-title-en {
  font-size: 24px;
  font-family: 微软雅黑, serif;
  color: #7bbdff;
  text-shadow: 0 0 4px black;
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
  background: #7bbdff;
  border-color: #7bbdff;
}

.login-footer-register {
  width: 100%;
  text-align: right;
}

.login-panel-text {
  color: #7bbdff;
  text-shadow: 0 0 4px black;
}

.login-placeholder {
  flex-grow: 1;
}
</style>
