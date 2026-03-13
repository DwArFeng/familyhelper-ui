<template>
  <div class="login-container" v-cloak :style="backgroundImageStyle">
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

// -----------------------------------------------------------登录表单-----------------------------------------------------------
const username = ref<string>('')
const password = ref<string>('')

function handleLogin(): void {
  lnpStore
    .willLogin({ account_key: { string_id: username.value }, password: password.value })
    .execute()
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
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
}

button:hover {
  background-color: #0056b3;
}
</style>
