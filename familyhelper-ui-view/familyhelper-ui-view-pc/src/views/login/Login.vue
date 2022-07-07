<template>
  <div class="page-forbidden-container" v-cloak :style="backgroundImageStyle">
    <div class="login-panel" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.1)">
      <div class="login-banner">
        <span class="login-panel-text">赵扶风开发制作</span>
        <span class="login-panel-text">github地址: https://github.com/</span>
      </div>
      <div class="login-header">
        <span class="login-header-title-chs">用户登录</span>
        <span class="login-header-title-en">User Login</span>
      </div>
      <el-form class="login-main" ref="form" :model="form" @keydown.native="handleHotKeyDown">
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
      <div class="login-placeholder"/>
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

<script>
import { mapActions } from 'vuex';

import backgroundImg from '@/assets/img/login-background.jpg';

// noinspection JSAnnotator
export default {
  name: 'Login',
  data() {
    return {
      backgroundImageStyle: {
        backgroundImage: `url(${backgroundImg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto 100%',
        backgroundPosition: 'center',
      },
      form: {
        id: '',
        password: '',
      },
      idError: false,
      passwordError: false,
      loading: false,
    };
  },
  mounted() {
    if (document.documentElement.clientWidth < document.documentElement.clientHeight) {
      this.backgroundImageStyle.backgroundSize = 'auto 100%';
    } else {
      this.backgroundImageStyle.backgroundSize = '100% auto';
    }
    window.onresize = () => {
      if (document.documentElement.clientWidth < document.documentElement.clientHeight) {
        this.backgroundImageStyle.backgroundSize = 'auto 100%';
      } else {
        this.backgroundImageStyle.backgroundSize = '100% auto';
      }
    };
  },
  methods: {
    handleLogin() {
      this.loading = true;
      if (!this.validate()) {
        this.loading = false;
        return;
      }
      this.login({ accountId: this.form.id, password: this.form.password })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    validate() {
      let validFlag = true;
      if (this.id === '') {
        this.idError = true;
        validFlag = false;
      } else {
        this.idError = false;
      }
      if (this.password === '') {
        this.passwordError = true;
        validFlag = false;
      } else {
        this.passwordError = false;
      }
      return validFlag;
    },
    handleHotKeyDown(event) {
      if (event.key === 'Enter' && event.shiftKey === false && event.altKey === false) {
        if (this.form.id === '' || this.form.password === '') {
          return;
        }
        this.handleLogin();
      }
    },
    ...mapActions('lnp', ['login']),
  },
};
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
  color: #7BBDFF;
  text-shadow: 0 0 8px black;
}

.login-header-title-en {
  font-size: 24px;
  font-family: 微软雅黑, serif;
  color: #7BBDFF;
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
  border-radius: 25px;
  margin-bottom: 10px;
  background: #7BBDFF;
  border-color: #7BBDFF;
}

.login-footer-register {
  width: 100%;
  text-align: right;
}

.login-panel-text {
  color: #7BBDFF;
  text-shadow: 0 0 4px black;
}

.login-placeholder {
  flex-grow: 1;
}
</style>
