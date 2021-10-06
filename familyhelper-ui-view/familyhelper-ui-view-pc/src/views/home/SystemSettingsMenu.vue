<template>
  <el-submenu
    index="system_settings"
    v-if="permissionSet.has(permissionMeta.get('system_settings'))"
  >
    <template slot="title">
      <i class="el-icon-menu"></i>
      <span>系统设置</span>
    </template>
    <!-- 权限节点设置 -->
    <el-menu-item
      index="/home/system-setting/permission-node"
      v-if="permissionSet.has(permissionMeta.get('permission_node'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>权限节点设置</span>
      </template>
    </el-menu-item>
    <!-- 权限分组设置 -->
    <el-menu-item
      index="/home/system-setting/permission-group"
      v-if="permissionSet.has(permissionMeta.get('permission_group'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>权限分组设置</span>
      </template>
    </el-menu-item>
    <!-- 角色管理 -->
    <el-menu-item
      index="/home/system/role-management"
      v-if="permissionSet.has(permissionMeta.get('role_management'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>角色管理</span>
      </template>
    </el-menu-item>
    <!-- 部门管理 -->
    <el-menu-item
      index="/home/system/department-management"
      v-if="permissionSet.has(permissionMeta.get('department_management'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>部门管理</span>
      </template>
    </el-menu-item>
    <!-- 用户管理 -->
    <el-menu-item
      index="/home/system/user-management"
      v-if="permissionSet.has(permissionMeta.get('user_management'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>用户管理</span>
      </template>
    </el-menu-item>
    <!-- 密码修改 -->
    <el-menu-item
      index="/home/system/password-update"
      v-if="permissionSet.has(permissionMeta.get('password_update'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>密码修改</span>
      </template>
    </el-menu-item>
  </el-submenu>
</template>

<script>
import syncPermission from '@/util/permission';

export default {
  name: 'SystemSettingsMenu',
  data() {
    return {
      permissionSet: new Set(),
      permissionMeta: new Map(),
    };
  },
  methods: {
    buildPermissionMeta() {
      const map = new Map();
      map.set('system_settings', 'ui.pc.menu_visible.system_settings');
      map.set('permission_node', 'ui.pc.menu_visible.system_settings.permission_node');
      map.set('permission_group', 'ui.pc.menu_visible.system_settings.permission_group');
      map.set('user_management', 'ui.pc.menu_visible.system_settings.user_management');
      map.set('role_management', 'ui.pc.menu_visible.system_settings.role_management');
      map.set('department_management', 'ui.pc.menu_visible.system_settings.department_management');
      map.set('password_update', 'ui.pc.menu_visible.system_settings.password_update');
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
