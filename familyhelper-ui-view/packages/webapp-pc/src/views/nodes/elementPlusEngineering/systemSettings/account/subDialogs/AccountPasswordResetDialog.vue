<template>
  <maintain-dialog
    v-model:visible="dialogVisible"
    label-width="100px"
    :create-title="t('views.element_plus_engineering.system_settings.reset_password')"
    :loading="resetLoading"
    :mode="resetDialogMode"
    :item="resetDialogItem"
    :create-rules="resetDialogRules"
    :create-confirm-button-label="t('views.element_plus_engineering.system_settings.confirm')"
    :close-on-click-modal="false"
    @onItemCreate="handleReset"
  >
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.new_password')"
      prop="new_password"
    >
      <el-input
        v-model="resetDialogItem.new_password"
        type="password"
        :placeholder="t('views.element_plus_engineering.system_settings.required')"
        show-password
      />
    </el-form-item>
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.confirm_password')"
      prop="confirm_password"
    >
      <el-input
        v-model="resetDialogItem.confirm_password"
        type="password"
        :placeholder="t('views.element_plus_engineering.system_settings.required')"
        show-password
      />
    </el-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { computed, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityCreateOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { resetPassword } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

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

// region I18n 引入

const { t } = useI18n()

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

const validateConfirmPassword = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
): void => {
  if (value !== resetDialogItem.value.new_password) {
    callback(new Error(t('views.element_plus_engineering.system_settings.passwords_do_not_match')))
  } else {
    callback()
  }
}

const resetDialogRules = ref({
  new_password: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.new_password_required'),
      trigger: 'blur',
    },
  ],
  confirm_password: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.confirm_password_required'),
      trigger: 'blur',
    },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
})

async function handleReset(item: AccountPasswordResetDialogItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.system_settings.resetting_account_password_warning') +
        t('views.element_plus_engineering.system_settings.privacy_responsibility_warning') +
        t('views.element_plus_engineering.system_settings.continue_confirmation'),
      t('views.element_plus_engineering.system_settings.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.system_settings.confirm'),
        cancelButtonText: t('views.element_plus_engineering.system_settings.cancel'),
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      },
    )
  } catch {
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
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.password_reset_succeeded'),
      type: 'success',
    })
    if (props.accountId === lnpStore.me) {
      ElMessage({
        showClose: true,
        message: t(
          'views.element_plus_engineering.system_settings.logout_after_resetting_own_password',
        ),
        type: 'warning',
      })
      await lnpStore.willFireKick().execute()
    } else {
      emit('onReset')
    }
  } finally {
    dialogVisible.value = false
    resetLoading.value -= 1
  }
}

// endregion
</script>
