<template>
  <el-submenu
    index="me_and_clannad"
    v-if="permissionSet.has(permissionMeta.get('me_and_clannad'))"
  >
    <template slot="title">
      <i class="el-icon-menu"></i>
      <span>我与家庭</span>
    </template>
    <!-- 个人简介管理 -->
    <el-menu-item
      index="/home/me-and-clannad/my-profile"
      v-if="permissionSet.has(permissionMeta.get('my_profile'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>个人简介管理</span>
      </template>
    </el-menu-item>
    <!-- 简介类型管理 -->
    <el-menu-item
      index="/home/me-and-clannad/profile-type-indicator"
      v-if="permissionSet.has(permissionMeta.get('profile_type_indicator'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>简介类型管理</span>
      </template>
    </el-menu-item>
    <!-- 个人相册管理 -->
    <el-menu-item
      index="/home/me-and-clannad/my-album"
      v-if="permissionSet.has(permissionMeta.get('my_album'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>个人相册管理</span>
      </template>
    </el-menu-item>
    <!-- 家庭简介 -->
    <el-menu-item
      index="/home/me-and-clannad/clannad-profile"
      v-if="permissionSet.has(permissionMeta.get('clannad_profile'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>家庭简介</span>
      </template>
    </el-menu-item>
    <!-- 家庭相册 -->
    <el-menu-item
      index="/home/me-and-clannad/clannad-album"
      v-if="permissionSet.has(permissionMeta.get('clannad_album'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>家庭相册</span>
      </template>
    </el-menu-item>
    <!-- 家人称呼管理 -->
    <el-menu-item
      index="/home/me-and-clannad/clannad-call"
      v-if="permissionSet.has(permissionMeta.get('clannad_call'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>家人称呼管理</span>
      </template>
    </el-menu-item>
  </el-submenu>
</template>

<script>
import syncPermission from '@/util/permission';

export default {
  name: 'MeAndClannadMenu',
  data() {
    return {
      permissionSet: new Set(),
      permissionMeta: new Map(),
    };
  },
  methods: {
    buildPermissionMeta() {
      const map = new Map();
      map.set('me_and_clannad', 'ui.pc.menu_visible.me_and_clannad');
      map.set('my_profile', 'ui.pc.menu_visible.me_and_clannad.my_profile');
      map.set('profile_type_indicator', 'ui.pc.menu_visible.me_and_clannad.profile_type_indicator');
      map.set('my_album', 'ui.pc.menu_visible.me_and_clannad.my_album');
      map.set('clannad_profile', 'ui.pc.menu_visible.me_and_clannad.clannad_profile');
      map.set('clannad_album', 'ui.pc.menu_visible.me_and_clannad.clannad_album');
      map.set('clannad_call', 'ui.pc.menu_visible.me_and_clannad.clannad_call');
      this.$set(this.$data, 'permissionMeta', map);
    },
  },
  mounted() {
    this.buildPermissionMeta();
    syncPermission(this.$data, 'permissionSet');
  },
};
</script>

<style scoped>
</style>
