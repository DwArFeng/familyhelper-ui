<template>
  <div class="tags-view-container">
    <div class="menu-control-container">
      <el-tooltip
        class="item"
        effect="dark"
        placement="top"
        :content="watchedMenuHide ? '显示菜单' : '隐藏菜单'"
        :open-delay="1000"
      >
        <i
          class="icon-button"
          :class="{'el-icon-arrow-left':!watchedMenuHide, 'el-icon-arrow-right':watchedMenuHide}"
          @click="handleMenuHide"
        />
      </el-tooltip>
    </div>
    <div class="placeholder"></div>
    <div class="user-timer-container">
      <div class="timer-container">{{ currentTime }}</div>
      <div class="welcome-container">您好:</div>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          {{ id }}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="logout">注销</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="view-control-container">
      <el-tooltip
        class="item"
        effect="dark"
        placement="top"
        :content="partialFullScreen ? '局部最小化' : '局部最大化'"
        :open-delay="1000"
      >
        <i class="iconfont left-side-icon icon-button" @click="handlePartialFullScreen">
          {{
            /* eslint-disable-next-line */
            partialFullScreen ? '&#xffff;' : '&#xfffe;'
          }}
        </i>
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        placement="top"
        :content="fullScreen ? '退出全屏' : '全屏'"
        :open-delay="1000"
      >
        <i class="iconfont icon-button" @click="handleFullScreen">
          {{ fullScreen ? '&#xfffd;' : '&#xfffc;' }}
        </i>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { pad } from '@/util/number';
import { logout } from '@/api/system/login';
import resolveResponse from '@/util/response';

export default {
  name: 'TagsView',
  props: {
    partialFullScreen: {
      type: [Boolean],
      default: false,
    },
    fullScreen: {
      type: [Boolean],
      default: false,
    },
    menuHide: {
      type: [Boolean],
      default: false,
    },
  },
  watch: {
    partialFullScreen(value) {
      this.watchedPartialFullScreen = value;
    },
    fullScreen(value) {
      this.watchedFullScreen = value;
    },
    menuHide(value) {
      this.watchedMenuHide = value;
    },
  },
  data() {
    return {
      currentTime: '00:00:00',
      timer: null,
      id: '',
      watchedPartialFullScreen: this.partialFullScreen,
      watchedFullScreen: this.fullScreen,
      watchedMenuHide: this.menuHide,
    };
  },
  methods: {
    updateTimer() {
      const myDate = new Date(); // 实例一个时间对象；
      this.currentTime = `${pad(myDate.getHours(), 2)}:${pad(myDate.getMinutes(), 2)}:${pad(myDate.getSeconds(), 2)}`;
    },
    initTimer() {
      this.timer = setInterval(() => {
        this.updateTimer();
      }, 250);
    },
    disposeTimer() {
      clearInterval(this.timer);
      this.timer = null;
    },
    updateId() {
      // noinspection JSUnresolvedVariable
      this.id = this.$ls.get('loginInfo').account_id;
    },
    handleCommand(command) {
      switch (command) {
        case 'logout':
          this.handleLogout();
          break;
        default:
          break;
      }
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
    handleMenuHide() {
      this.watchedMenuHide = !this.watchedMenuHide;
      this.$emit('update:menuHide', this.watchedMenuHide);
    },
    handlePartialFullScreen() {
      this.watchedPartialFullScreen = !this.watchedPartialFullScreen;
      this.$emit('update:partialFullScreen', this.watchedPartialFullScreen);
    },
    handleFullScreen() {
      this.watchedFullScreen = !this.watchedFullScreen;
      this.$emit('update:fullScreen', this.watchedFullScreen);
    },
  },
  mounted() {
    this.updateTimer();
    this.updateId();
    this.initTimer();
  },
  destroyed() {
    this.disposeTimer();
  },
};
</script>

<style scoped>
.tags-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  padding: 0 20px;
  align-items: center;
  justify-content: center;
}

.view-control-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  width: 0;
  flex-grow: 1;
}

.user-timer-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.timer-container {
  margin-right: 10px;
}

.welcome-container {
  font-size: 14px;
  margin-right: 3px;
}

.view-control-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left-side-icon {
  margin-right: 3px;
}

.icon-button {
  cursor: pointer;
  font-size: 14px;
}
</style>
