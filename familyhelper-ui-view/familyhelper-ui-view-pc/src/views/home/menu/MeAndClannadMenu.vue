<template>
  <el-submenu
    index="me_and_clannad"
    v-if="permissionSet.has(permissionMeta.get('me_and_clannad'))"
  >
    <template slot="title">
      <i class="el-icon-menu"></i>
      <span>我与家庭</span>
    </template>
    <!-- 个人信息 -->
    <el-menu-item
      index="/home/finance-management/account-book"
      v-if="permissionSet.has(permissionMeta.get('account_book'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>个人信息</span>
      </template>
    </el-menu-item>
    <!-- 性别类型设置 -->
    <el-menu-item
      index="/home/me-and-clannad/gender-type-indicator"
      v-if="permissionSet.has(permissionMeta.get('gender_type_indicator'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>性别类型设置</span>
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
      map.set('account_book', 'ui.pc.menu_visible.finance_management.account_book');
      map.set('gender_type_indicator', 'ui.pc.menu_visible.me_and_clannad.gender_type_indicator');
      map.set('bank_card_type_indicator', 'ui.pc.menu_visible.finance_management.bank_card_type_indicator');
      map.set('bank_card', 'ui.pc.menu_visible.finance_management.bank_card');
      map.set('fund_change_type_indicator', 'ui.pc.menu_visible.finance_management.fund_change_type_indicator');
      map.set('fund_change', 'ui.pc.menu_visible.finance_management.fund_change');
      map.set('finance_report', 'ui.pc.menu_visible.finance_management.finance_report');
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
