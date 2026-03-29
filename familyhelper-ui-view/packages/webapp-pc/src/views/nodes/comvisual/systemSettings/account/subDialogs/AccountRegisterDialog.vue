<template>
  <maintain-dialog
    v-model:visible="dialogVisible"
    label-width="100px"
    create-title="注册用户"
    :loading="registerLoading"
    :mode="registerDialogMode"
    :item="registerDialogItem"
    :close-on-click-modal="false"
    @on-item-create="handleRegister"
  >
    <native-form-item label="账户ID">
      <input
        v-model="registerDialogItem.account_key_string_id"
        class="form-input"
        type="text"
        placeholder="必填"
        @input="handleAccountKeyStringIdInput"
      />
    </native-form-item>
    <native-form-item label="显示名称">
      <input
        v-model="registerDialogItem.display_name"
        class="form-input"
        type="text"
        placeholder="必填"
      />
    </native-form-item>
    <native-form-item label="启用">
      <native-switch v-model="registerDialogItem.enabled" active-text="启用" inactive-text="禁用" />
    </native-form-item>
    <native-form-item label="备注">
      <input v-model="registerDialogItem.remark" class="form-input" type="text" />
    </native-form-item>
    <native-form-item label="密码">
      <input
        v-model="registerDialogItem.password"
        class="form-input"
        type="password"
        placeholder="必填"
        autocomplete="new-password"
      />
    </native-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeSwitch from '@/components/comvisual/form/nativeSwitch/NativeSwitch.vue'

import { useIdentityCreateOnlyMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import { register } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'AccountRegisterDialog',
})

// region Props 定义

type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onRegistered'): void
}

const emit = defineEmits<Emits>()

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
      registerDialogItem.value = {
        account_key_string_id: '',
        display_name: '',
        enabled: true,
        remark: '',
        password: '',
      }
    }
  },
)

// endregion

// region 注册对话框

type AccountRegisterDialogItem = {
  account_key_string_id: string
  display_name: string
  enabled: boolean
  remark: string
  password: string
}

const { item: registerDialogItem, mode: registerDialogMode } =
  useIdentityCreateOnlyMaintainDialog<AccountRegisterDialogItem>({
    account_key_string_id: '',
    display_name: '',
    enabled: true,
    remark: '',
    password: '',
  })

const registerLoading = ref<number>(0)

function handleAccountKeyStringIdInput(e: Event): void {
  const t = e.target as HTMLInputElement
  if (t) {
    registerDialogItem.value.account_key_string_id = t.value.toLowerCase()
  }
}

async function handleRegister(item: AccountRegisterDialogItem): Promise<void> {
  if (!item.account_key_string_id.trim()) {
    notifyWarning('账户ID不能为空')
    return
  }
  if (!item.display_name.trim()) {
    notifyWarning('显示名称不能为空')
    return
  }
  if (!item.password) {
    notifyWarning('密码不能为空')
    return
  }
  registerLoading.value += 1
  try {
    await resolveResponse(
      register({
        account_key: { string_id: item.account_key_string_id },
        display_name: item.display_name,
        enabled: item.enabled,
        remark: item.remark,
        password: item.password,
      }),
    )
    notifySuccess(`用户 ${item.display_name}(${item.account_key_string_id}) 注册成功`)
    dialogVisible.value = false
    emit('onRegistered')
  } finally {
    registerLoading.value -= 1
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
