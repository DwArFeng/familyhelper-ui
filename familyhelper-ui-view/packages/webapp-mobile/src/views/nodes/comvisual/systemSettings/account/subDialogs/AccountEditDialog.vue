<template>
  <maintain-dialog
    v-model:visible="dialogVisible"
    label-width="100px"
    edit-title="编辑用户"
    :loading="editLoading"
    :mode="editDialogMode"
    :item="editDialogItem"
    :close-on-click-modal="false"
    @on-item-edit="handleUpdate"
  >
    <native-form-item label="账户ID">
      <input
        v-model="editDialogItem.account_key_string_id"
        class="form-input"
        type="text"
        readonly
      />
    </native-form-item>
    <native-form-item label="显示名称">
      <input v-model="editDialogItem.display_name" class="form-input" type="text" />
    </native-form-item>
    <native-form-item label="启用">
      <native-switch v-model="editDialogItem.enabled" active-text="启用" inactive-text="禁用" />
    </native-form-item>
    <native-form-item label="备注">
      <input v-model="editDialogItem.remark" class="form-input" type="text" />
    </native-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeSwitch from '@/components/comvisual/form/nativeSwitch/NativeSwitch.vue'

import { useEditOnlyMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  type DispAccount,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

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

watch(
  () => [props.visible, props.initialItem] as const,
  ([visible, item]) => {
    if (visible && item) {
      editDialogItem.value = editDialogItemMap(item)
    }
  },
)

async function handleUpdate(item: AccountEditDialogItem): Promise<void> {
  if (!item.display_name.trim()) {
    notifyWarning('显示名称不能为空')
    return
  }
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
    notifySuccess('用户更新成功')
    dialogVisible.value = false
    emit('onUpdated')
  } finally {
    editLoading.value -= 1
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
