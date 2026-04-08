<template>
  <div class="account-security-container">
    <root-border-layout-panel
      :header-visible="headerVisible"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
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
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { computed, ref } from 'vue'

import RootBorderLayoutPanel from '@/components/comvisual/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import AccountSelector from '@/views/nodes/comvisual/systemSettings/account/AccountSelector.vue'

import AccountSecurityEditPanel from './AccountSecurityEditPanel.vue'

defineOptions({
  name: 'AccountSecurity',
})

// region Store 引入

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// endregion

// region 账户选择器

const PERMISSION_HEADER_VISIBLE =
  'ui.mobile;ui.mobile.component_visible.system_settings.account_security.account_selector'

const accountSelectorUserId = ref<string>('')

const headerVisible = computed(() => lnpStore.hasPermission(PERMISSION_HEADER_VISIBLE))

// endregion

// region 账户编辑器

const PERMISSION_SELF_MODIFIABLE = 'action;action.account_security.self_modifiable'
const PERMISSION_ALL_MODIFIABLE = 'action;action.account_security.all_modifiable'
const UPSC_ACCOUNT_SECURITY_EDIT_PANEL =
  'ui_preference.mobile.system.account_security.account_security_edit_panel'

const accountSecurityEditPanelAccountId = computed(() => {
  if (lnpStore.hasPermission(PERMISSION_HEADER_VISIBLE)) {
    return accountSelectorUserId.value
  }
  return lnpStore.me
})
const accountSecurityEditPanelReadonly = computed(() => {
  if (lnpStore.hasPermission(PERMISSION_ALL_MODIFIABLE)) {
    return false
  }
  if (lnpStore.hasPermission(PERMISSION_SELF_MODIFIABLE)) {
    return !(accountSelectorUserId.value === lnpStore.me)
  }
  return true
})
const accountSecurityEditPanelUpsc = computed(() => UPSC_ACCOUNT_SECURITY_EDIT_PANEL)

// endregion
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
