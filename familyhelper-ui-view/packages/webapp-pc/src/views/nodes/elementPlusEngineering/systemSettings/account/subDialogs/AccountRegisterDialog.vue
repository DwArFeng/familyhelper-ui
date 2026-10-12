<template>
  <maintain-dialog
    v-model:visible="dialogVisible"
    label-width="100px"
    :create-title="t('views.element_plus_engineering.system_settings.register_user')"
    :loading="registerLoading"
    :mode="registerDialogMode"
    :item="registerDialogItem"
    :create-rules="registerDialogRules"
    :close-on-click-modal="false"
    @onItemCreate="handleRegister"
  >
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.account_id')"
      prop="account_key_string_id"
    >
      <el-input
        v-model="registerDialogItem.account_key_string_id"
        :placeholder="t('views.element_plus_engineering.system_settings.required')"
        @input="handleAccountKeyStringIdInput"
      />
    </el-form-item>
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.display_name')"
      prop="display_name"
    >
      <el-input
        v-model="registerDialogItem.display_name"
        :placeholder="t('views.element_plus_engineering.system_settings.required')"
      />
    </el-form-item>
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.enabled')"
      prop="enabled"
    >
      <el-switch
        v-model="registerDialogItem.enabled"
        :active-text="t('views.element_plus_engineering.system_settings.enabled')"
        :inactive-text="t('views.element_plus_engineering.system_settings.disabled')"
      />
    </el-form-item>
    <el-form-item :label="t('views.element_plus_engineering.system_settings.remark')" prop="remark">
      <el-input v-model="registerDialogItem.remark" />
    </el-form-item>
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.password')"
      prop="password"
    >
      <el-input
        v-model="registerDialogItem.password"
        type="password"
        :placeholder="t('views.element_plus_engineering.system_settings.required')"
        show-password
      />
    </el-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityCreateOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { register } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

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

// region I18n 引入

const { t } = useI18n()

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
  account_key_string_id: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.account_id_required'),
      trigger: 'blur',
    },
  ],
  display_name: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.display_name_required'),
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.password_required'),
      trigger: 'blur',
    },
  ],
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
      message: t('views.element_plus_engineering.system_settings.user_registered', {
        displayName: item.display_name,
        accountId: item.account_key_string_id,
      }),
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
