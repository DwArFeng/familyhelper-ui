<template>
  <div class="account-security-container">
    <border-layout-panel :header-visible="headerVisible">
      <template v-slot:header>
        <div class="header-container">
          <account-selector class="item expand" v-model="accountSelectorUserId" />
        </div>
      </template>
      <template v-slot:default>
        <account-security-edit-panel
          :account-id="accountSecurityEditPanelAccountId"
          :readonly="accountSecurityEditPanelReadonly"
          :upsc="accountSecurityEditPanelUpsc"
        />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

import { computed, ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import AccountSelector from '@/views/items/systemSettings/account/AccountSelector.vue'

import AccountSecurityEditPanel from './AccountSecurityEditPanel.vue'

defineOptions({
  name: 'AccountSecurity',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------账户选择器-----------------------------------------------------------
const PERMISSION_HEADER_VISIBLE =
  'ui.pc.component_visible.system_setting.account_security.account_selector'

const accountSelectorUserId = ref<string>('')

const headerVisible = computed(() => lnpStore.hasPermission(PERMISSION_HEADER_VISIBLE))

// -----------------------------------------------------------账户编辑器-----------------------------------------------------------
const PERMISSION_SELF_MODIFIABLE = 'action.account_security.self_modifiable'
const PERMISSION_ALL_MODIFIABLE = 'action.account_security.all_modifiable'
const UPSC_ACCOUNT_SECURITY_EDIT_PANEL =
  'ui_preference.pc.system.account_security.account_security_edit_panel'

const accountSecurityEditPanelAccountId = computed(() => {
  // 如果有 PERMISSION_HEADER_VISIBLE 权限，返回用户选择器中的用户 ID。
  if (lnpStore.hasPermission(PERMISSION_HEADER_VISIBLE)) {
    return accountSelectorUserId.value
  }
  // 否则返回当前用户 ID。
  return lnpStore.me
})
const accountSecurityEditPanelReadonly = computed(() => {
  // 如果有 PERMISSION_ALL_MODIFIABLE 权限，返回 false。
  if (lnpStore.hasPermission(PERMISSION_ALL_MODIFIABLE)) {
    return false
  }
  // 如果有 PERMISSION_SELF_MODIFIABLE 权限，返回当前用户 ID 与用户选择器中的用户 ID 不相等。
  if (lnpStore.hasPermission(PERMISSION_SELF_MODIFIABLE)) {
    return !(accountSelectorUserId.value === lnpStore.me)
  }
  // 否则返回 true。
  return true
})
const accountSecurityEditPanelUpsc = computed(() => UPSC_ACCOUNT_SECURITY_EDIT_PANEL)
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
