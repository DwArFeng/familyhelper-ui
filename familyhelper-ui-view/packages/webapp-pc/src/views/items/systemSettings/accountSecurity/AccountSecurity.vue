<template>
  <div class="account-security-container">
    <border-layout-panel :header-visible="headerVisible">
      <template v-slot:header>
        <div class="header-container">
          <account-selector class="item expand" v-model="accountSelector.userId"/>
        </div>
      </template>
      <template v-slot:default>
        <account-security-edit-panel
          :account-id="accountSecurityEditPanel.accountId"
          :readonly="accountSecurityEditPanel.readonly"
          :upsc="accountSecurityEditPanel.upsc"
        />
      </template>
    </border-layout-panel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import AccountSelector from '@/views/items/systemSettings/account/AccountSelector.vue';
import AccountSecurityEditPanel
from '@/views/items/systemSettings/accountSecurity/AccountSecurityEditPanel.vue';

const HEADER_VISIBLE_PERMISSION = 'ui.pc.component_visible.system_setting.account_security.account_selector';
const SELF_MODIFIABLE_PERMISSION = 'action.account_security.self_modifiable';
const ALL_MODIFIABLE_PERMISSION = 'action.account_security.all_modifiable';

// noinspection JSAnnotator
export default {
  name: 'AccountSecurity',
  components: { AccountSecurityEditPanel, AccountSelector, BorderLayoutPanel },
  computed: {
    headerVisible() {
      return this.hasPermission(HEADER_VISIBLE_PERMISSION);
    },
    accountId() {
      // 如果有 HEADER_VISIBLE_PERMISSION 权限，返回用户选择器中的用户 ID。
      if (this.hasPermission(HEADER_VISIBLE_PERMISSION)) {
        return this.accountSelector.userId;
      }
      // 否则返回当前用户 ID。
      return this.me;
    },
    readonly() {
      // 如果有 ALL_MODIFIABLE_PERMISSION 权限，返回 false。
      if (this.hasPermission(ALL_MODIFIABLE_PERMISSION)) {
        return false;
      }
      // 如果有 SELF_MODIFIABLE_PERMISSION 权限，返回当前用户 ID 与用户选择器中的用户 ID 不相等。
      if (this.hasPermission(SELF_MODIFIABLE_PERMISSION)) {
        return !(this.accountId === this.me);
      }
      // 否则返回 true。
      return true;
    },
    ...mapGetters('lnp', ['hasPermission', 'me']),
  },
  watch: {
    'accountSelector.userId': {
      handler(val) {
        if (val) {
          this.accountSecurityEditPanel.accountId = val;
        }
      },
      immediate: true,
    },
    accountId(val) {
      this.accountSecurityEditPanel.accountId = val;
    },
    readonly(val) {
      this.accountSecurityEditPanel.readonly = val;
    },
  },
  data() {
    return {
      accountSelector: {
        userId: '',
      },
      accountSecurityEditPanel: {
        accountId: '',
        readonly: true,
        upsc: 'ui_preference.pc.system.account_security.account_security_edit_panel',
      },
    };
  },
  methods: {
    syncProps() {
      this.accountSecurityEditPanel.accountId = this.accountId;
      this.accountSecurityEditPanel.readonly = this.readonly;
    },
  },
  mounted() {
    this.syncProps();
  },
};
</script>

<style scoped>
.account-security-container {
  height: 100%;
  width: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.header-container .item:not(:last-child) {
  margin-right: 5px;
}

.header-container .item.expand {
  width: 0;
  flex-grow: 1;
}
</style>
