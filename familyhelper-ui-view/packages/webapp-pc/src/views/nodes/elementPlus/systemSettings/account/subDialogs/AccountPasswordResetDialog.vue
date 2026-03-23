<template>
  <maintain-dialog
    v-model:visible="dialogVisible"
    label-width="100px"
    create-title="重置密码"
    :loading="resetLoading"
    :mode="resetDialogMode"
    :item="resetDialogItem"
    :create-rules="resetDialogRules"
    :create-confirm-button-label="'确定'"
    :close-on-click-modal="false"
    @onItemCreate="handleReset"
  >
    <el-form-item label="新密码" prop="new_password">
      <el-input
        v-model="resetDialogItem.new_password"
        type="password"
        placeholder="必填"
        show-password
      />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirm_password">
      <el-input
        v-model="resetDialogItem.confirm_password"
        type="password"
        placeholder="必填"
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

import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityCreateOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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

const validateConfirmPassword = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
): void => {
  if (value !== resetDialogItem.value.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetDialogRules = ref({
  new_password: [{ required: true, message: '新密码不能为空', trigger: 'blur' }],
  confirm_password: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
})

async function handleReset(item: AccountPasswordResetDialogItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '您在重置账户的密码。<br>' +
        '<div style="color: #b22222"><b>能力越大，责任越大，请尊重他人隐私</b></div>' +
        '是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
      message: '密码重置成功',
      type: 'success',
    })
    if (props.accountId === lnpStore.me) {
      ElMessage({
        showClose: true,
        message: '由于您重置了您自己的密码，账号将会注销，请重新登录',
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
