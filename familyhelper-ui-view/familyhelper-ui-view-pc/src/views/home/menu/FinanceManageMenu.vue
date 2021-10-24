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
    <!-- 银行卡类型管理 -->
    <el-menu-item
      index="/home/finance-management/bank-card-type-indicator"
      v-if="permissionSet.has(permissionMeta.get('bank_card_type_indicator'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>银行卡类型管理</span>
      </template>
    </el-menu-item>
    <!-- 银行卡管理 -->
    <el-menu-item
      index="/home/finance-management/bank-card"
      v-if="permissionSet.has(permissionMeta.get('bank_card'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>银行卡管理</span>
      </template>
    </el-menu-item>
    <!-- 余额记录 -->
    <el-menu-item
      index="/home/finance-management/balance-record"
      v-if="permissionSet.has(permissionMeta.get('balance_record'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>余额记录</span>
      </template>
    </el-menu-item>
    <!-- 资金变更类型管理 -->
    <el-menu-item
      index="/home/finance-management/fund-change-type-indicator"
      v-if="permissionSet.has(permissionMeta.get('fund_change_type_indicator'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>资金变更类型管理</span>
      </template>
    </el-menu-item>
    <!-- 资金变更记录 -->
    <el-menu-item
      index="/home/finance-management/fund-change"
      v-if="permissionSet.has(permissionMeta.get('fund_change'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>资金变更记录</span>
      </template>
    </el-menu-item>
    <!-- 资金报告 -->
    <el-menu-item
      index="/home/finance-management/finance-report"
      v-if="permissionSet.has(permissionMeta.get('finance_report'))"
    >
      <template slot="title">
        <i class="el-icon-s-grid"></i>
        <span>资金报告</span>
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
      map.set('balance_record', 'ui.pc.menu_visible.finance_management.balance_record');
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
