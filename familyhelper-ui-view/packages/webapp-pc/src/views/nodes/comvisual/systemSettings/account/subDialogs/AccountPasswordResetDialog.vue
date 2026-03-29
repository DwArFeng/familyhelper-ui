<template>
  <maintain-dialog
    v-model:visible="dialogVisible"
    label-width="100px"
    create-title="重置密码"
    :loading="resetLoading"
    :mode="resetDialogMode"
    :item="resetDialogItem"
    :create-confirm-button-label="'确定'"
    :close-on-click-modal="false"
    @on-item-create="handleReset"
  >
    <native-form-item label="新密码">
      <input
        v-model="resetDialogItem.new_password"
        class="form-input"
        type="password"
        placeholder="必填"
        autocomplete="new-password"
      />
    </native-form-item>
    <native-form-item label="确认密码">
      <input
        v-model="resetDialogItem.confirm_password"
        class="form-input"
        type="password"
        placeholder="必填"
        autocomplete="new-password"
      />
    </native-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { computed, ref, watch } from 'vue'

import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'

import { useIdentityCreateOnlyMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import { resetPassword } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'AccountPasswordResetDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  accountId: string
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onReset'): void
}

const emit = defineEmits<Emits>()

// endregion

// region Store 引入

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// endregion

// region 对话框可见性

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

watch(
  () => props.visible,
  (value) => {
    if (value) {
      resetDialogItem.value = {
        new_password: '',
        confirm_password: '',
      }
    }
  },
)

// endregion

// region 重置密码对话框

type AccountPasswordResetDialogItem = {
  new_password: string
  confirm_password: string
}

const { item: resetDialogItem, mode: resetDialogMode } =
  useIdentityCreateOnlyMaintainDialog<AccountPasswordResetDialogItem>({
    new_password: '',
    confirm_password: '',
  })

const resetLoading = ref<number>(0)

async function handleReset(item: AccountPasswordResetDialogItem): Promise<void> {
  if (!item.new_password) {
    notifyWarning('新密码不能为空')
    return
  }
  if (item.new_password !== item.confirm_password) {
    notifyWarning('两次输入的密码不一致')
    return
  }
  const ok = window.confirm('您在重置账户的密码。能力越大，责任越大，请尊重他人隐私。是否继续？')
  if (!ok) {
    return
  }
  resetLoading.value += 1
  try {
    await resolveResponse(
      resetPassword({
        account_key: { string_id: props.accountId },
        new_password: item.new_password,
      }),
    )
    notifySuccess('密码重置成功')
    dialogVisible.value = false
    if (props.accountId === lnpStore.me) {
      notifyWarning('由于您重置了您自己的密码，账号将会注销，请重新登录')
      await lnpStore.willFireKick().execute()
    } else {
      emit('onReset')
    }
  } finally {
    resetLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.form-input {
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
}
</style>
