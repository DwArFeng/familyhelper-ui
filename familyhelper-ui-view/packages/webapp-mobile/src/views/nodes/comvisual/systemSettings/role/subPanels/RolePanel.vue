<template>
  <div class="role-panel-container">
    <loading-overlay :loading="roleTableLoading > 0" />
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="primary" @click="handleShowRoleCreateMaintainDialog">
            新建角色
          </native-button>
          <native-button kind="success" @click="handleRoleSearch">刷新数据</native-button>
          <vertical-divider />
          <native-button
            kind="primary"
            :disabled="applyChangesButtonDisabled"
            @click="handleApplyChanges"
          >
            应用变更
          </native-button>
        </div>
      </template>
      <template v-slot:default>
        <paging-table-panel
          v-model:current-page="roleTableCurrentPage"
          v-model:page-size="roleTablePageSize"
          :item-count="roleTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="roleTableItems"
          :highlight-current-row="true"
          :row-key="roleRowKey"
          @on-paging-attribute-changed="handleRoleTablePagingAttributeChanged"
          @on-current-changed="handleRoleTableCurrentChanged"
          @on-item-inspect="handleShowRoleInspectDialog"
          @on-item-edit="handleShowRoleEditDialog"
          @on-item-delete="handleRoleDelete"
        >
          <paging-table-column label="角色ID" prop="key.string_id" :min-width="140" />
          <paging-table-column label="显示名称" prop="name" :min-width="120" />
          <paging-table-column label="启用" :min-width="72">
            <template v-slot:default="{ row }">
              {{ row.enabled ? '是' : '否' }}
            </template>
          </paging-table-column>
          <paging-table-column label="备注" prop="remark" :min-width="120" />
        </paging-table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="roleMaintainDialogVisible"
      :loading="roleMaintainDialogLoading"
      :mode="roleMaintainDialogMode"
      :item="roleMaintainDialogItem"
      label-width="100px"
      create-title="新建角色"
      edit-title="编辑角色"
      inspect-title="查看角色"
      :close-on-click-modal="false"
      @on-item-create="handleRoleCreate"
      @on-item-edit="handleRoleEdit"
    >
      <native-form-item label="角色ID">
        <input
          v-model="roleMaintainDialogItem.key_string_id"
          class="form-input"
          type="text"
          :readonly="roleMaintainDialogMode !== 'CREATE'"
          @input="handleKeyStringIdInput"
        />
      </native-form-item>
      <native-form-item label="名称">
        <input
          v-model="roleMaintainDialogItem.name"
          class="form-input"
          type="text"
          :readonly="roleMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
      <native-form-item v-if="roleMaintainDialogMode !== 'CREATE'" label="启用">
        <native-switch
          v-model="roleMaintainDialogItem.enabled"
          active-text="启用"
          inactive-text="禁用"
          :disabled="roleMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
      <native-form-item label="备注">
        <input
          v-model="roleMaintainDialogItem.remark"
          class="form-input"
          type="text"
          :readonly="roleMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeSwitch from '@/components/comvisual/form/nativeSwitch/NativeSwitch.vue'
import VerticalDivider from '@/components/comvisual/form/divider/verticalDivider/VerticalDivider.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useGeneralMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import { type StringIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/role.ts'
import {
  all as allRole,
  insert as insertRole,
  remove as removeRole,
  update as updateRole,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/role.ts'
import { childForRoleDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/roleUserRelation.ts'
import { resetAnalysis } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/reset.ts'
import { lookupAllToList, lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'RolePanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', current: Role | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region Store

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// endregion

// region 应用变更

const applyChangesButtonDisabled = ref<boolean>(false)

async function handleApplyChanges(): Promise<void> {
  applyChangesButtonDisabled.value = true
  try {
    await resolveResponse(resetAnalysis())
    notifySuccess('变更应用成功！后台状态刷新中，请不要频繁点击')
  } finally {
    setTimeout(() => {
      applyChangesButtonDisabled.value = false
    }, 3000)
  }
}

// endregion

// region 角色表格

function roleRowKey(row: Role): string {
  return row.key.string_id
}

const {
  currentPage: roleTableCurrentPage,
  pageSize: roleTablePageSize,
  itemCount: roleTableItemCount,
  items: roleTableItems,
  pagingInfo: roleTablePagingInfo,
  updateByLookup: updateRoleTableByLookup,
} = useIdentityBackendPagingTablePanel<Role>(15)
const roleTableLoading = ref<number>(0)

function handleRoleTablePagingAttributeChanged(): void {
  handleRoleSearch()
}

function handleRoleTableCurrentChanged(current: Role | null): void {
  emit('onCurrentChanged', current)
}

// endregion

// region 角色查询

function handleRoleSearch(): void {
  handleRoleAllSearch()
}

async function handleRoleAllSearch(): Promise<void> {
  roleTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allRole(pagingInfo),
      roleTablePagingInfo.value,
    )
    updateRoleTableByLookup(res)
  } finally {
    roleTableLoading.value -= 1
  }
}

async function checkInfluenced(roleKey: StringIdKey): Promise<boolean> {
  const res = await lookupAllToList((pagingInfo) => childForRoleDisp(roleKey, pagingInfo))
  return res.some((r) => r.user.key.string_id === lnpStore.me)
}

// endregion

// region 角色维护对话框

type RoleMaintainDialogItem = {
  key_string_id: string
  name: string
  enabled: boolean
  remark: string
}

function roleMaintainDialogItemMap(t: Role): RoleMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    name: t.name,
    enabled: t.enabled,
    remark: t.remark,
  }
}

const {
  visible: roleMaintainDialogVisible,
  item: roleMaintainDialogItem,
  mode: roleMaintainDialogMode,
  showCreateDialog: showRoleCreateMaintainDialogBase,
  showEditDialog: showRoleEditMaintainDialog,
  showInspectDialog: showRoleInspectMaintainDialog,
} = useGeneralMaintainDialog<Role, RoleMaintainDialogItem>(roleMaintainDialogItemMap, {
  key_string_id: '',
  name: '',
  enabled: true,
  remark: '',
})

const roleMaintainDialogLoading = ref<number>(0)

function handleKeyStringIdInput(e: Event): void {
  const t = e.target as HTMLInputElement
  if (t) {
    roleMaintainDialogItem.value.key_string_id = t.value.toLowerCase()
  }
}

function handleShowRoleInspectDialog(item: Role): void {
  showRoleInspectMaintainDialog(item)
}

function handleShowRoleCreateMaintainDialog(): void {
  showRoleCreateMaintainDialogBase()
}

function handleShowRoleEditDialog(item: Role): void {
  showRoleEditMaintainDialog(item)
}

async function handleRoleCreate(item: RoleMaintainDialogItem): Promise<void> {
  if (!item.key_string_id.trim()) {
    notifyWarning('角色ID不能为空')
    return
  }
  if (!item.name.trim()) {
    notifyWarning('名称不能为空')
    return
  }
  roleMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insertRole({
        key: { string_id: item.key_string_id },
        name: item.name,
        enabled: item.enabled,
        remark: item.remark,
      }),
    )
    notifySuccess(`角色 ${item.name}(${item.key_string_id}) 创建成功`)
    roleMaintainDialogVisible.value = false
    handleRoleSearch()
  } finally {
    roleMaintainDialogLoading.value -= 1
  }
}

async function handleRoleEdit(item: RoleMaintainDialogItem): Promise<void> {
  if (!item.name.trim()) {
    notifyWarning('名称不能为空')
    return
  }
  const influencedFlag = await checkInfluenced({ string_id: item.key_string_id })
  let msg = '此操作将更新此角色。\n是否继续?'
  if (influencedFlag) {
    msg =
      '您似乎在改变一个您所属的角色。\n如果继续，您将会被注销，并且根据其余的角色重新分配权限。\n您有可能失去系统的部分权限，且可能无法自行恢复。\n是否继续?'
  }
  if (!window.confirm(msg)) {
    return
  }
  roleMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updateRole({
        key: { string_id: item.key_string_id },
        name: item.name,
        enabled: item.enabled,
        remark: item.remark,
      }),
    )
    notifySuccess(`角色 ${item.name}(${item.key_string_id}) 更新成功`)
    roleMaintainDialogVisible.value = false
    if (influencedFlag) {
      notifyWarning('由于您改变了您所属的角色的启用状态，账号将会注销，请重新登录')
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handleRoleSearch()
  } finally {
    roleMaintainDialogLoading.value -= 1
  }
}

async function handleRoleDelete(item: Role): Promise<void> {
  const influencedFlag = await checkInfluenced(item.key)
  let msg = '此操作将永久删除此角色。\n该操作将会影响所有属于该角色的用户的权限！\n是否继续?'
  if (influencedFlag) {
    msg =
      '您似乎在删除一个您所属的角色。\n如果继续，您将会被注销，并且根据其余的角色重新分配权限。\n是否继续?'
  }
  if (!window.confirm(msg)) {
    return
  }
  roleTableLoading.value += 1
  try {
    await resolveResponse(removeRole(item.key))
    notifySuccess(`角色 ${item.name}(${item.key.string_id}) 删除成功`)
    if (influencedFlag) {
      notifyWarning('由于您删除了您所属的角色，账号将会注销，请重新登录')
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handleRoleSearch()
  } finally {
    roleTableLoading.value -= 1
  }
}

// endregion

// region 生命周期

onMounted(() => {
  handleRoleSearch()
})

// endregion
</script>

<style scoped>
.role-panel-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

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
