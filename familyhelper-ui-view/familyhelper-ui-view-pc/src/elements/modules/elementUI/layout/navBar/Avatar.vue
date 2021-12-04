<template>
  <el-dropdown class="avatar-container" trigger="click" @command="handleCommand">
    <div class="avatar-wrapper">
        <avatar-panel
          class="avatar"
          render-mode="BY_ID"
          :size="40"
          :object-user-id="me"
          :placeholder-font-size="14"
        />
    </div>
    <el-dropdown-menu class="dropdown-menu" slot="dropdown">
      <el-dropdown-item command="welcome">
        <span style="display:block;">首页</span>
      </el-dropdown-item>
      <el-dropdown-item command="logout" divided>
        <span style="display:block;">登出</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import AvatarPanel from '@/components/avatar/AvatarPanel.vue';

// noinspection JSAnnotator
export default {
  name: 'Avatar',
  components: {
    AvatarPanel,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  methods: {
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
};
</script>

<style scoped>
.avatar-container{
}

.avatar-wrapper{
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  box-sizing: content-box;
  transition: background .3s;
}

.avatar-wrapper:hover{
  background: rgba(0, 0, 0, .025)
}

.avatar{
  cursor: pointer;
}
</style>
