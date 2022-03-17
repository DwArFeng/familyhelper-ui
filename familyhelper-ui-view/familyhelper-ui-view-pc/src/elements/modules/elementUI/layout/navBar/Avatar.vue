<template>
  <el-dropdown class="avatar-container" trigger="click" @command="handleCommand">
    <div class="avatar-wrapper">
      <el-badge class="item" :is-dot="notification.unreadCount > 0">
        <avatar-panel
          class="avatar"
          render-mode="BY_ID"
          :size="40"
          :object-user-id="me"
          :placeholder-font-size="14"
        />
      </el-badge>
    </div>
    <el-dropdown-menu class="dropdown-menu" slot="dropdown">
      <el-dropdown-item command="welcome">
        <span>首页</span>
      </el-dropdown-item>
      <el-dropdown-item command="notification" divided>
        <el-badge
          :class="notificationStyle"
          :value="notification.unreadCount"
          :max="99"
          :hidden="notification.unreadCount === 0"
        >
          <span>消息</span>
        </el-badge>
      </el-dropdown-item>
      <el-dropdown-item command="logout" divided>
        <span>登出</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import AvatarPanel from '@/components/avatar/AvatarPanel.vue';

import { childForUserUnread } from '@/api/clannad/notification';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'Avatar',
  components: {
    AvatarPanel,
  },
  computed: {
    notificationStyle() {
      if (this.notification.unreadCount === 0) {
        return '';
      }
      if (this.notification.unreadCount < 10) {
        return 'notify';
      }
      return 'long-notify';
    },
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      notification: {
        unreadCount: 0,
        timer: null,
      },
    };
  },
  methods: {
    updateNotification() {
      resolveResponse(childForUserUnread(this.me, 0, 0))
        .then((res) => {
          this.notification.unreadCount = res.count;
        });
    },
    handleCommand(key) {
      switch (key) {
        case 'welcome':
          this.$router.push({ name: 'vim' });
          break;
        case 'logout':
          this.logout();
          break;
        default:
      }
    },
    ...mapActions('lnp', ['logout']),
  },
  mounted() {
    this.updateNotification();
    this.notification.timer = setInterval(() => { this.updateNotification(); }, 30000);
  },
  beforeDestroy() {
    clearInterval(this.notification.timer);
  },
};
</script>

<style scoped>
.avatar-container {
}

.avatar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  box-sizing: content-box;
  transition: background .3s;
}

.avatar-wrapper:hover {
  background: rgba(0, 0, 0, .025)
}

.avatar {
  cursor: pointer;
}

.dropdown-menu span {
  display: block;
}

/*noinspection CssUnusedSymbol*/
.dropdown-menu .notify {
  margin-top: 7px;
}

/*noinspection CssUnusedSymbol*/
.dropdown-menu .long-notify {
  margin-top: 7px;
  margin-right: 11px;
}
</style>
