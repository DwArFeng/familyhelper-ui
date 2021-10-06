<template>
  <el-submenu
    index="finance_management"
    v-if="permissionSet.has(permissionMeta.get('finance_management'))"
  >
    <template slot="title">
      <i class="el-icon-menu"></i>
      <span>资金管理</span>
    </template>
    <!-- 账本管理 -->
    <el-menu-item
      index="/home/finance-management/account-book"
      v-if="permissionSet.has(permissionMeta.get('account_book'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>账本管理</span>
      </template>
    </el-menu-item>
    <!-- 角色管理 -->
    <el-menu-item
      index="/home/system/role-managementr"
      v-if="permissionSet.has(permissionMeta.get('role_managementr'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>角色管理</span>
      </template>
    </el-menu-item>
    <!-- 部门管理 -->
    <el-menu-item
      index="/home/system/department-managementr"
      v-if="permissionSet.has(permissionMeta.get('department_managementr'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>部门管理</span>
      </template>
    </el-menu-item>
    <!-- 用户管理 -->
    <el-menu-item
      index="/home/system/user-managementr"
      v-if="permissionSet.has(permissionMeta.get('user_managementr'))"
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
  name: 'FinanceManagementMenu',
  data() {
    return {
      permissionSet: new Set(),
      permissionMeta: new Map(),
    };
  },
  methods: {
    buildPermissionMeta() {
      const map = new Map();
      map.set('finance_management', 'ui.pc.menu_visible.finance_management');
      map.set('account_book', 'ui.pc.menu_visible.finance_management.account_book');
      map.set('user_managementr', 'ui.pc.menu_visible.system_settings.user_managementr');
      map.set('role_managementr', 'ui.pc.menu_visible.system_settings.role_managementr');
      map.set('department_managementr', 'ui.pc.menu_visible.system_settings.department_managementr');
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
