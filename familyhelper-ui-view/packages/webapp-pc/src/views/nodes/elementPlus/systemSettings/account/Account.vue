<template>
  <div class="account-container">
    <border-layout-panel class="border-layout-panel" west-width="35%" :west-visible="true">
      <template v-slot:west>
        <user-list-panel ref="userListPanelRef" @onCurrentChanged="handleUserListCurrentChanged" />
      </template>
      <template v-slot:default>
        <placeholder-panel v-show="currentAccount === null" text="请选择用户" />
        <account-edit-panel
          v-show="currentAccount !== null"
          :account-id="currentAccount?.key.string_id ?? ''"
          :upsc="UPSC_ACCOUNT_EDIT_PANEL"
          @onAccountPropertyUpdated="handleAccountPropertyUpdated"
        />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import { type Account } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'

import UserListPanel from './subPanels/UserListPanel.vue'
import AccountEditPanel from './subPanels/AccountEditPanel.vue'

const UPSC_ACCOUNT_EDIT_PANEL = 'ui_preference.pc.system_settings.account.account_edit_panel'

defineOptions({
  name: 'AccountComponent',
})

// region 用户列表当前选中

const currentAccount = ref<Account | null>(null)
const userListPanelRef = useTemplateRef<ComponentExposed<typeof UserListPanel>>('userListPanelRef')

function handleUserListCurrentChanged(account: Account | null): void {
  currentAccount.value = account
}

// endregion

// region 账户属性更新

function handleAccountPropertyUpdated(): void {
  userListPanelRef.value?.refresh()
}

// endregion
</script>

<style scoped>
.account-container {
  width: 100%;
  height: 100%;
}
</style>
