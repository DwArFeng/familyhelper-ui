<template>
  <maintain-dialog
    v-model:visible="dialogVisible"
    label-width="100px"
    :edit-title="t('views.element_plus_engineering.system_settings.edit_user')"
    :loading="editLoading"
    :mode="editDialogMode"
    :item="editDialogItem"
    :edit-rules="editDialogRules"
    :close-on-click-modal="false"
    @onItemEdit="handleUpdate"
  >
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.account_id')"
      prop="account_key_string_id"
    >
      <el-input v-model="editDialogItem.account_key_string_id" readonly />
    </el-form-item>
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.display_name')"
      prop="display_name"
    >
      <el-input v-model="editDialogItem.display_name" />
    </el-form-item>
    <el-form-item
      :label="t('views.element_plus_engineering.system_settings.enabled')"
      prop="enabled"
    >
      <el-switch
        v-model="editDialogItem.enabled"
        :active-text="t('views.element_plus_engineering.system_settings.enabled')"
        :inactive-text="t('views.element_plus_engineering.system_settings.disabled')"
      />
    </el-form-item>
    <el-form-item :label="t('views.element_plus_engineering.system_settings.remark')" prop="remark">
      <el-input v-model="editDialogItem.remark" />
    </el-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useEditOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  type DispAccount,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AccountEditDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  accountId: string
  initialItem: DispAccount | null
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onUpdated'): void
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

// endregion

// region 编辑对话框

type AccountEditDialogItem = {
  account_key_string_id: string
  display_name: string
  enabled: boolean
  remark: string
}

function editDialogItemMap(t: DispAccount): AccountEditDialogItem {
  return {
    account_key_string_id: t.key.string_id,
    display_name: t.display_name,
    enabled: t.enabled,
    remark: t.remark,
  }
}

const { item: editDialogItem, mode: editDialogMode } = useEditOnlyMaintainDialog<
  DispAccount,
  AccountEditDialogItem
>(editDialogItemMap, {
  account_key_string_id: '',
  display_name: '',
  enabled: false,
  remark: '',
})

const editLoading = ref<number>(0)
const editDialogRules = ref({
  display_name: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.display_name_required'),
      trigger: 'blur',
    },
  ],
})

watch(
  () => [props.visible, props.initialItem] as const,
  ([visible, item]) => {
    if (visible && item) {
      editDialogItem.value = editDialogItemMap(item)
    }
  },
)

async function handleUpdate(item: AccountEditDialogItem): Promise<void> {
  editLoading.value += 1
  try {
    await resolveResponse(
      update({
        account_key: { string_id: item.account_key_string_id },
        display_name: item.display_name,
        enabled: item.enabled,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.user_updated'),
      type: 'success',
    })
    dialogVisible.value = false
    emit('onUpdated')
  } finally {
    editLoading.value -= 1
  }
}

// endregion
</script>
