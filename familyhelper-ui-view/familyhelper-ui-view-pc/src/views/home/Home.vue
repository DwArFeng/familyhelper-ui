<template>
  <el-container class="home-container">
    <el-header class="header-container" v-if="!partialFullScreen" height="80px">
      <div class="logo-container">
        <el-image
          style="width: 80px; height: 80px"
          :src="logoUrl"
        />
        <h2 class="title">家庭助手</h2>
      </div>
      <div class="link-container">
        <span class="a-span" @click="handleHelp">帮助</span>
        <span class="a-span" @click="handleLogout">注销</span>
      </div>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :style="{width:menuHide?'0px':'230px', backgroundColor:backgroundColor}">
        <overlay-scrollbars :options=scrollbarOption class="scroll-bar menu-container">
          <!-- 菜单 -->
          <el-menu
            ref="menu"
            text-color="#ffffff"
            active-text-color="#ffd04b"
            v-if="!menuHide"
            :background-color="backgroundColor"
            :router="true"
            :collapse-transition="false"
            :unique-opened="true"
          >
            <!-- 资金管理 -->
            <finance-manage-menu/>
            <!-- 系统设置 -->
            <system-settings-menu/>
          </el-menu>
        </overlay-scrollbars>
      </el-aside>
      <el-main class="main-container">
        <div class="tags-view-container">
          <tags-view
            :partial-full-screen.sync="partialFullScreen"
            :full-screen.sync="fullScreen"
            :menu-hide.sync="menuHide"
          />
        </div>
        <div class="router-container">
          <router-view></router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import screenfull from 'screenfull';

import TagsView from '@/views/home/TagsView.vue';
import SystemSettingsMenu from '@/views/home/SystemSettingsMenu.vue';
import FinanceManageMenu from '@/views/home/FinanceManageMenu.vue';

import loginFormHeaderImg from '@/assets/img/logo.png';

import { logout, postpone } from '@/api/system/login';

import resolveResponse from '@/util/response';

export default {
  name: 'Home',
  components: { FinanceManageMenu, SystemSettingsMenu, TagsView },
  comments: {
    TagsView,
  },
  watch: {
    fullScreen() {
      this.handleFullScreen();
    },
  },
  data() {
    return {
      scrollbarOption: {
        className: 'os-theme-light',
      },
      partialFullScreen: false,
      fullScreen: false,
      permissionSet: new Set(),
      permissionMeta: new Map(),
      logoUrl: loginFormHeaderImg,
      menuHide: false,
      loginKeeper: null,
      backgroundColor: '#2D3A4B',
    };
  },
  methods: {
    initKeepLogin() {
      this.loginKeeper = setInterval(() => {
        // noinspection JSUnresolvedVariable
        if (this.$ls.get('loginInfo') == null) {
          return;
        }
        const errorHandlerMap = new Map();
        errorHandlerMap.set(90, () => {
          this.$message({
            showClose: true,
            dangerouslyUseHTMLString: true,
            message: '<div style="text-align: center">登录状态异常，请重新登录</div>',
            type: 'error',
            center: true,
            duration: 2000,
          });
          // noinspection JSUnresolvedVariable
          this.$ls.remove('loginInfo');
          // noinspection JSUnresolvedVariable
          this.$ls.remove('permissionInfo');
          this.$router.push({ path: '/login' });
        });
        resolveResponse(this, postpone(), errorHandlerMap)
          .then((res) => {
            // noinspection JSUnresolvedVariable
            this.$ls.set('loginInfo', res);
          });
      }, 10000);
    },
    disposeKeepLogin() {
      if (this.loginKeeper == null) {
        return;
      }
      clearInterval(this.loginKeeper);
    },
    handleFullScreen() {
      if (this.fullScreen) {
        screenfull.request();
      } else {
        screenfull.exit();
      }
    },
    initFullScreen() {
      if (screenfull.isEnabled) {
        screenfull.on('change', this.fullScreenChange);
      }
    },
    disposeFullScreen() {
      if (screenfull.isEnabled) {
        screenfull.off('change', this.fullScreenChange);
      }
    },
    fullScreenChange() {
      this.fullScreen = screenfull.isFullscreen;
    },
    handleHelp() {
      this.$router.push('/home/readme');
    },
    handleLogout() {
      resolveResponse(this, logout())
        .then(() => {
          // noinspection JSUnresolvedVariable
          this.$ls.remove('loginInfo');
          // noinspection JSUnresolvedVariable
          this.$ls.remove('permissionInfo');
          this.$router.push({ path: '/login' });
        });
    },
  },
  mounted() {
    this.initKeepLogin();
    this.initFullScreen();
  },
  destroyed() {
    this.disposeKeepLogin();
    this.disposeFullScreen();
  },
};
</script>

<!--suppress HtmlDeprecatedAttribute -->
<style scoped>
.home-container {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.el-header {
  display: flex;
  justify-content: flex-start;
  background-color: #1c242d;
  color: #889aa4;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.el-aside {
  color: #889AA4;
  line-height: 200px;
  padding: 0;
  margin: 0;
  width: auto;
}

/*noinspection CssUnusedSymbol*/
.el-main {
  background-color: #FFFFFF;
  color: #889AA4;
}

/*noinspection CssUnusedSymbol*/
.el-menu {
  padding: 0;
  margin: 0;
  border-right: 0;
}

.title {
  text-align: left;
  font-size: 30px;
  margin: 0;
  padding: 0;
  vertical-align: center;
}

.header-container {
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
}

.logo-container {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.link-container {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding-bottom: 2px;
  box-sizing: border-box;
}

.link-container >>> .a-span:not(:last-child) {
  margin-right: 10px;
}

.a-span {
  font-size: 14px;
  text-decoration: underline;
  color: #FFFFFF;
  cursor: pointer;
}

.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.tags-view-container {
  height: 32px;
  width: 100%;
  box-sizing: border-box;
  background-color: #FFFFFF;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
}

.router-container {
  width: 100%;
  height: 0;
  box-sizing: border-box;
  flex-grow: 1;
  padding: 20px;
}
</style>
