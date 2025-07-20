<template>
  <div class="login-container">
    <div class="login-cloak" v-show="!loginBackgroundStore.ready">
      <div class="placeholder">正在加载，请稍候...</div>
    </div>
    <div
      class="login-main-container"
      v-show="loginBackgroundStore.ready"
      :style="backgroundImageStyle"
    >
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'
import { type LoginBackgroundStore } from '@/store/modules/loginBackground.ts'

import { reactive, ref, watch, onMounted } from 'vue'

import backgroundImg from '@/assets/img/login-background.jpg'

defineOptions({
  name: 'LoginComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')
const loginBackgroundStore = vim
  .ctx()
  .store()
  .vueStore<'login-background', LoginBackgroundStore>('login-background')

// -----------------------------------------------------------登录表单-----------------------------------------------------------
const username = ref<string>('')
const password = ref<string>('')

// --------------------------------+---------------------------背景样式处理-----------------------------------------------------------
const backgroundImageStyle = reactive({
  backgroundImage: `url(${loginBackgroundStore.ready ? loginBackgroundStore.backgroundUrl : backgroundImg})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
})

watch(
  () => loginBackgroundStore.backgroundUrl,
  (value) => {
    backgroundImageStyle.backgroundImage = `url(${value})`
  },
)

onMounted(() => {
  // 移动端适配背景图片尺寸
  if (window.innerWidth < window.innerHeight) {
    backgroundImageStyle.backgroundSize = 'auto 100%'
  } else {
    backgroundImageStyle.backgroundSize = '100% auto'
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth < window.innerHeight) {
      backgroundImageStyle.backgroundSize = 'auto 100%'
    } else {
      backgroundImageStyle.backgroundSize = '100% auto'
    }
  })
})

function handleLogin(): void {
  lnpStore
    .willLogin({ account_key: { string_id: username.value }, password: password.value })
    .execute()
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100%;
  background-color: #ffffff;
}

.login-cloak {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.login-main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

form {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  width: 90%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button:hover {
  background-color: #0056b3;
}

button:active {
  transform: translateY(1px);
}
</style>
