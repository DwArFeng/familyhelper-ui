<template>
  <div class="account-role-panel-container">
    <placeholder-panel v-if="accountId === ''" text="请选择用户" />
    <div v-else class="main-container">
      <loading-overlay :loading="roleUserRelationTableLoading > 0" />
      <header-layout-panel class="panel">
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="primary" @click="handleShowAttachDialog">添加角色</native-button>
            <native-button kind="success" @click="handleSearch">刷新数据</native-button>
            <span class="header-sep" aria-hidden="true" />
            <native-button
              kind="primary"
              :disabled="applyChangesButtonDisabled"
              @click="handleApplyChanges"
            >
              应用变更
            </native-button>
            <span class="header-sep" aria-hidden="true" />
            <native-button kind="info" @click="handleShowPermissionViewOfUserInspectDialog"
              >权限视图</native-button
            >
            <span class="header-spacer" />
            <native-button
              v-if="mode === 'DEFAULT'"
              title="弹出"
              @click="handlePanelFloatyButtonClicked"
            >
              弹出
            </native-button>
          </div>
        </template>
        <template v-slot:default>
          <paging-table-panel
            v-model:current-page="roleUserRelationTableCurrentPage"
            v-model:page-size="roleUserRelationTablePageSize"
            :item-count="roleUserRelationTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="roleUserRelationTableItems"
            :highlight-current-row="true"
            :row-key="roleUserRelationRowKey"
            :inspect-button-visible="true"
            :edit-button-visible="true"
            :delete-button-visible="true"
            @on-paging-attribute-changed="handleRoleUserRelationTablePagingAttributeChanged"
            @on-item-inspect="handleShowRoleUserRelationInspectDialog"
            @on-item-edit="handleShowRoleUserRelationEditDialog"
            @on-item-delete="handleRemoveRoleUserRelation"
          >
            <paging-table-column label="角色ID" prop="role.key.string_id" :min-width="140" />
            <paging-table-column label="角色名称" prop="role.name" :min-width="120" />
            <paging-table-column label="启用" :min-width="72">
              <template v-slot:default="{ row }">
                {{ row.enabled ? '是' : '否' }}
              </template>
            </paging-table-column>
            <paging-table-column label="备注" prop="remark" :min-width="120" />
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="roleUserRelationMaintainDialogVisible"
      label-width="100px"
      edit-title="编辑角色用户关联"
      inspect-title="查看角色用户关联"
      :loading="roleUserRelationMaintainDialogLoading"
      :mode="roleUserRelationMaintainDialogMode"
      :item="roleUserRelationMaintainDialogItem"
      :close-on-click-modal="false"
      @on-item-edit="handleRoleUserRelationEdit"
    >
      <native-form-item v-if="roleUserRelationMaintainDialogMode === 'INSPECT'" label="角色ID">
        <input
          v-model="roleUserRelationMaintainDialogItem.key_role_string_id"
          class="form-input"
          type="text"
          readonly
        />
      </native-form-item>
      <native-form-item v-if="roleUserRelationMaintainDialogMode === 'INSPECT'" label="角色名称">
        <input
          v-model="roleUserRelationMaintainDialogItem.role_name"
          class="form-input"
          type="text"
          readonly
        />
      </native-form-item>
      <native-form-item label="启用">
        <native-switch
          v-model="roleUserRelationMaintainDialogItem.enabled"
          active-text="启用"
          inactive-text="禁用"
          :disabled="roleUserRelationMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
      <native-form-item label="备注">
        <input
          v-model="roleUserRelationMaintainDialogItem.remark"
          class="form-input"
          type="text"
          :readonly="roleUserRelationMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
    </maintain-dialog>
    <account-role-attach-dialog
      v-model:visible="accountRoleAttachDialogVisible"
      :account-id="accountId"
      @on-attached="handleRoleAttached"
    />
    <permission-view-of-user-inspect-dialog
      v-model:visible="permissionViewOfUserInspectDialogVisible"
      :account-id="accountId"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeSwitch from '@/components/comvisual/form/nativeSwitch/NativeSwitch.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useGeneralMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import { useBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  type DispRoleUserRelation,
  childForUserDisp,
  insert as insertRoleUserRelation,
  update as updateRoleUserRelation,
  remove as removeRoleUserRelation,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/roleUserRelation.ts'
import { type Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/role.ts'
import { resetAnalysis } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/reset.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import AccountRoleAttachDialog from '../subDialogs/AccountRoleAttachDialog.vue'
import PermissionViewOfUserInspectDialog from '../subDialogs/PermissionViewOfUserInspectDialog.vue'

defineOptions({
  name: 'AccountRolePanel',
})

// region Props 定义

type Props = {
  accountId: string
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
  (e: 'onRoleDataUpdated'): void
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

// region 角色用户关联列表查询

function handleSearch(): void {
  if (props.accountId === '') {
    return
  }
  handleChildForUserSearch()
}

async function handleChildForUserSearch(): Promise<void> {
  if (props.accountId === '') {
    return
  }
  roleUserRelationTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForUserDisp({ string_id: props.accountId }, pagingInfo),
      roleUserRelationTablePagingInfo.value,
    )
    updateRoleUserRelationTableByLookup(res)
  } finally {
    roleUserRelationTableLoading.value -= 1
  }
}

watch(
  () => props.accountId,
  () => {
    handleSearch()
  },
)

onMounted(() => {
  handleSearch()
})

// endregion

// region 角色用户关联表格

const {
  currentPage: roleUserRelationTableCurrentPage,
  pageSize: roleUserRelationTablePageSize,
  itemCount: roleUserRelationTableItemCount,
  items: roleUserRelationTableItems,
  pagingInfo: roleUserRelationTablePagingInfo,
  updateByLookup: updateRoleUserRelationTableByLookup,
} = useBackendPagingTablePanel<DispRoleUserRelation, DispRoleUserRelation>((r) => r, 15)
const roleUserRelationTableLoading = ref<number>(0)

function roleUserRelationRowKey(row: DispRoleUserRelation): string {
  return `${row.key.role_string_id}\u0000${row.key.user_string_id}`
}

function handleRoleUserRelationTablePagingAttributeChanged(): void {
  handleSearch()
}

async function handleRemoveRoleUserRelation(relation: DispRoleUserRelation): Promise<void> {
  const ok1 = window.confirm(
    `此操作将移除用户关联的角色 ${relation.role.name}(${relation.role.key.string_id})。是否继续？`,
  )
  if (!ok1) {
    return
  }
  const influencedFlag = props.accountId === lnpStore.me
  if (influencedFlag) {
    const ok2 = window.confirm(
      '您似乎在移除您自己的角色关联。如果继续，您将会被注销，并且根据其余的角色重新分配权限；您有可能失去系统的部分权限，且可能无法自行恢复。是否继续？',
    )
    if (!ok2) {
      return
    }
  }
  roleUserRelationTableLoading.value += 1
  try {
    await resolveResponse(
      removeRoleUserRelation(relation.key.role_string_id, relation.key.user_string_id),
    )
    notifySuccess(`角色 ${relation.role.name} 已移除`)
    if (influencedFlag) {
      notifyWarning('由于您移除了您自己的角色关联，账号将会注销，请重新登录')
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handleSearch()
    emit('onRoleDataUpdated')
  } finally {
    roleUserRelationTableLoading.value -= 1
  }
}

// endregion

// region 角色用户关联维护对话框

type RoleUserRelationMaintainDialogItem = {
  key_role_string_id: string
  key_user_string_id: string
  role_name: string
  enabled: boolean
  remark: string
}

function roleUserRelationMaintainDialogItemMap(
  t: DispRoleUserRelation,
): RoleUserRelationMaintainDialogItem {
  return {
    key_role_string_id: t.key.role_string_id,
    key_user_string_id: t.key.user_string_id,
    role_name: t.role.name,
    enabled: t.enabled,
    remark: t.remark,
  }
}

const {
  visible: roleUserRelationMaintainDialogVisible,
  item: roleUserRelationMaintainDialogItem,
  mode: roleUserRelationMaintainDialogMode,
  showEditDialog: showRoleUserRelationEditMaintainDialog,
  showInspectDialog: showRoleUserRelationInspectMaintainDialog,
} = useGeneralMaintainDialog<DispRoleUserRelation, RoleUserRelationMaintainDialogItem>(
  roleUserRelationMaintainDialogItemMap,
  {
    key_role_string_id: '',
    key_user_string_id: '',
    role_name: '',
    enabled: true,
    remark: '',
  },
)

const roleUserRelationMaintainDialogLoading = ref<number>(0)

function handleShowRoleUserRelationInspectDialog(item: DispRoleUserRelation): void {
  showRoleUserRelationInspectMaintainDialog(item)
}

function handleShowRoleUserRelationEditDialog(item: DispRoleUserRelation): void {
  showRoleUserRelationEditMaintainDialog(item)
}

async function handleRoleUserRelationEdit(item: RoleUserRelationMaintainDialogItem): Promise<void> {
  const influencedFlag = props.accountId === lnpStore.me
  if (influencedFlag) {
    const ok = window.confirm(
      '您似乎在改变一个您所属的角色关联。如果继续，您将会被注销，并且根据其余的角色重新分配权限；您有可能失去系统的部分权限，且可能无法自行恢复。是否继续？',
    )
    if (!ok) {
      return
    }
  } else {
    const ok = window.confirm('此操作将更新此角色用户关联。是否继续？')
    if (!ok) {
      return
    }
  }
  roleUserRelationMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updateRoleUserRelation({
        key: {
          role_string_id: item.key_role_string_id,
          user_string_id: item.key_user_string_id,
        },
        enabled: item.enabled,
        remark: item.remark,
      }),
    )
    notifySuccess(`角色用户关联 ${item.role_name}(${item.key_role_string_id}) 更新成功`)
    roleUserRelationMaintainDialogVisible.value = false
    if (influencedFlag) {
      notifyWarning('由于您改变了您所属的角色关联，账号将会注销，请重新登录')
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handleSearch()
    emit('onRoleDataUpdated')
  } finally {
    roleUserRelationMaintainDialogLoading.value -= 1
  }
}

// endregion

// region 角色用户关联连接对话框

const accountRoleAttachDialogVisible = ref<boolean>(false)
const permissionViewOfUserInspectDialogVisible = ref<boolean>(false)

function handleShowPermissionViewOfUserInspectDialog(): void {
  permissionViewOfUserInspectDialogVisible.value = true
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

function handleShowAttachDialog(): void {
  accountRoleAttachDialogVisible.value = true
}

async function handleRoleAttached(roles: Role[]): Promise<void> {
  if (roles.length === 0 || props.accountId === '') {
    return
  }
  roleUserRelationTableLoading.value += 1
  try {
    await Promise.all(
      roles.map((role) =>
        resolveResponse(
          insertRoleUserRelation({
            key: {
              role_string_id: role.key.string_id,
              user_string_id: props.accountId,
            },
            enabled: true,
            remark: '',
          }),
        ),
      ),
    )
    notifySuccess(`已成功添加 ${roles.length} 个角色`)
    handleSearch()
    emit('onRoleDataUpdated')
  } finally {
    roleUserRelationTableLoading.value -= 1
  }
}

// endregion

// region 方法暴露

function roleSearch(): void {
  handleSearch()
}

defineExpose({
  roleSearch,
})

// endregion
</script>

<style scoped>
.account-role-panel-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.main-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.panel {
  flex: 1;
  min-height: 0;
}

.panel :deep(.main-container-wrapper) {
  min-height: 0;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.header-sep {
  display: inline-block;
  width: 1px;
  height: 18px;
  background: #dcdfe6;
}

.header-spacer {
  flex: 1;
  min-width: 8px;
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
</style>
