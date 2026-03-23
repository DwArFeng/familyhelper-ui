<template>
  <maintain-dialog
    v-model:visible="dialogVisible"
    label-width="100px"
    create-title="注册用户"
    :loading="registerLoading"
    :mode="registerDialogMode"
    :item="registerDialogItem"
    :create-rules="registerDialogRules"
    :close-on-click-modal="false"
    @onItemCreate="handleRegister"
  >
    <el-form-item label="账户ID" prop="account_key_string_id">
      <el-input
        v-model="registerDialogItem.account_key_string_id"
        placeholder="必填"
        @input="handleAccountKeyStringIdInput"
      />
    </el-form-item>
    <el-form-item label="显示名称" prop="display_name">
      <el-input v-model="registerDialogItem.display_name" placeholder="必填" />
    </el-form-item>
    <el-form-item label="启用" prop="enabled">
      <el-switch v-model="registerDialogItem.enabled" active-text="启用" inactive-text="禁用" />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="registerDialogItem.remark" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input
        v-model="registerDialogItem.password"
        type="password"
        placeholder="必填"
        show-password
      />
    </el-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityCreateOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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
const registerDialogRules = ref({
  account_key_string_id: [{ required: true, message: '账户ID不能为空', trigger: 'blur' }],
  display_name: [{ required: true, message: '显示名称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
})

function handleAccountKeyStringIdInput(e: Event): void {
  const t = e.target as HTMLInputElement
  if (t) {
    registerDialogItem.value.account_key_string_id = t.value.toLowerCase()
  }
}

async function handleRegister(item: AccountRegisterDialogItem): Promise<void> {
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
    ElMessage({
      showClose: true,
      message: `用户 ${item.display_name}(${item.account_key_string_id}) 注册成功`,
      type: 'success',
    })
    dialogVisible.value = false
    emit('onRegistered')
  } finally {
    registerLoading.value -= 1
  }
}

// endregion
</script>
