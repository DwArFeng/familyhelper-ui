<template>
  <el-dropdown class="avatar-container" trigger="click" @command="handleCommand">
    <div class="avatar-wrapper">
      <el-badge class="item" :is-dot="unreadCount > 0">
        <avatar-panel
          class="avatar"
          render-mode="BY_ID"
          :size="40"
          :object-user-id="me"
          :placeholder-font-size="14"
        />
      </el-badge>
    </div>
    <template v-slot:dropdown>
      <el-dropdown-menu class="dropdown-menu">
        <el-dropdown-item command="welcome">
          <span>首页</span>
        </el-dropdown-item>
        <el-dropdown-item command="notification" divided>
          <el-badge
            :class="notificationStyle"
            :value="unreadCount"
            :max="99"
            :hidden="unreadCount === 0"
          >
            <span>消息</span>
          </el-badge>
        </el-dropdown-item>
        <el-dropdown-item command="logout" divided>
          <span>登出</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import AvatarPanel from '@/components/avatar/AvatarPanel.vue';

// noinspection JSAnnotator
export default {
  name: 'Avatar',
  components: {
    AvatarPanel,
  },
  computed: {
    notificationStyle() {
      if (this.unreadCount === 0) {
        return '';
      }
      if (this.unreadCount < 10) {
        return 'notify';
      }
      return 'long-notify';
    },
    ...mapGetters('lnp', ['me']),
    ...mapGetters('notification', ['unreadCount']),
  },
  methods: {
    handleCommand(key) {
      switch (key) {
        case 'welcome':
          this.$router.push({ name: 'vim' });
          break;
        case 'notification':
          this.$router.push({ name: 'notifyManagement.notification' });
          break;
        case 'logout':
          this.logout();
          break;
        default:
      }
    },
    ...mapActions('lnp', ['logout']),
  },
};
</script>

<style scoped>
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
