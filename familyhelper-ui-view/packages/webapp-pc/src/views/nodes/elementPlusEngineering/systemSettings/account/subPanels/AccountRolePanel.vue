<template>
  <div class="account-role-panel-container">
    <placeholder-panel
      v-if="accountId === ''"
      :text="t('views.element_plus_engineering.system_settings.please_select_user')"
    />
    <div v-else class="main-container">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="handleShowAttachDialog">
              {{ t('views.element_plus_engineering.system_settings.add_role') }}
            </el-button>
            <el-button type="success" @click="handleSearch">{{
              t('views.element_plus_engineering.system_settings.refresh_data')
            }}</el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesButtonDisabled"
              @click="handleApplyChanges"
            >
              {{ t('views.element_plus_engineering.system_settings.apply_changes') }}
            </el-button>
            <el-divider direction="vertical" />
            <el-button type="info" @click="handleShowPermissionViewOfUserInspectDialog">
              {{ t('views.element_plus_engineering.system_settings.permission_view') }}
            </el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            v-loading="roleUserRelationTableLoading"
            v-model:current-page="roleUserRelationTableCurrentPage"
            v-model:page-size="roleUserRelationTablePageSize"
            :item-count="roleUserRelationTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="roleUserRelationTableItems"
            :highlight-current-row="true"
            @onPagingAttributeChanged="handleRoleUserRelationTablePagingAttributeChanged"
            @onItemInspect="handleShowRoleUserRelationInspectDialog"
            @onItemEdit="handleShowRoleUserRelationEditDialog"
            @onItemDelete="handleRemoveRoleUserRelation"
          >
            <el-table-column
              prop="role.key.string_id"
              :label="t('views.element_plus_engineering.system_settings.role_id')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="role.name"
              :label="t('views.element_plus_engineering.system_settings.role_name')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="enabled"
              :label="t('views.element_plus_engineering.system_settings.enabled')"
              :formatter="enabledFormatter"
              show-overflow-tooltip
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.system_settings.remark')"
              show-overflow-tooltip
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="roleUserRelationMaintainDialogVisible"
      :edit-title="t('views.element_plus_engineering.system_settings.edit_role_user_relation')"
      :inspect-title="
        t('views.element_plus_engineering.system_settings.inspect_role_user_relation')
      "
      :loading="roleUserRelationMaintainDialogLoading"
      :mode="roleUserRelationMaintainDialogMode"
      :item="roleUserRelationMaintainDialogItem"
      :edit-rules="roleUserRelationMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemEdit="handleRoleUserRelationEdit"
    >
      <el-form-item
        v-if="roleUserRelationMaintainDialogMode === 'INSPECT'"
        :label="t('views.element_plus_engineering.system_settings.role_id')"
        prop="key_role_string_id"
      >
        <el-input v-model="roleUserRelationMaintainDialogItem.key_role_string_id" readonly />
      </el-form-item>
      <el-form-item
        v-if="roleUserRelationMaintainDialogMode === 'INSPECT'"
        :label="t('views.element_plus_engineering.system_settings.role_name')"
        prop="role_name"
      >
        <el-input v-model="roleUserRelationMaintainDialogItem.role_name" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.enabled')"
        prop="enabled"
      >
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="roleUserRelationMaintainDialogItem.enabled"
          :active-text="t('views.element_plus_engineering.system_settings.enabled')"
          :inactive-text="t('views.element_plus_engineering.system_settings.disabled')"
          :disabled="roleUserRelationMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.remark')"
        prop="remark"
      >
        <el-input
          v-model="roleUserRelationMaintainDialogItem.remark"
          :readonly="roleUserRelationMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <account-role-attach-dialog
      v-model:visible="accountRoleAttachDialogVisible"
      :account-id="accountId"
      @onAttached="handleRoleAttached"
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

import { ElMessage, ElMessageBox } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

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

import { useI18n } from 'vue-i18n'

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

// region I18n 引入

const { t } = useI18n()

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
    ElMessage({
      showClose: true,
      message: t(
        'views.element_plus_engineering.system_settings.changes_applied_backend_refreshing',
      ),
      type: 'success',
    })
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: DispRoleUserRelation, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean)
    ? t('views.element_plus_engineering.system_settings.yes')
    : t('views.element_plus_engineering.system_settings.no')
}

function handleRoleUserRelationTablePagingAttributeChanged(): void {
  handleSearch()
}

async function handleRemoveRoleUserRelation(relation: DispRoleUserRelation): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.system_settings.detach_user_role_confirmation', {
        roleName: relation.role.name,
        roleId: relation.role.key.string_id,
      }),
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
  const influencedFlag = props.accountId === lnpStore.me
  if (influencedFlag) {
    try {
      await ElMessageBox.confirm(
        t('views.element_plus_engineering.system_settings.detaching_own_role_warning') +
          t(
            'views.element_plus_engineering.system_settings.logout_and_reassign_permissions_warning',
          ) +
          t('views.element_plus_engineering.system_settings.current_user_permission_loss_warning') +
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
  }
  roleUserRelationTableLoading.value += 1
  try {
    await resolveResponse(
      removeRoleUserRelation(relation.key.role_string_id, relation.key.user_string_id),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.role_detached', {
        roleName: relation.role.name,
      }),
      type: 'success',
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: t(
          'views.element_plus_engineering.system_settings.logout_after_detaching_own_role',
        ),
        type: 'warning',
      })
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
const roleUserRelationMaintainDialogEditRules = ref({
  remark: [],
})

function handleShowRoleUserRelationInspectDialog(item: DispRoleUserRelation): void {
  showRoleUserRelationInspectMaintainDialog(item)
}

function handleShowRoleUserRelationEditDialog(item: DispRoleUserRelation): void {
  showRoleUserRelationEditMaintainDialog(item)
}

async function handleRoleUserRelationEdit(item: RoleUserRelationMaintainDialogItem): Promise<void> {
  const influencedFlag = props.accountId === lnpStore.me
  try {
    if (influencedFlag) {
      await ElMessageBox.confirm(
        t('views.element_plus_engineering.system_settings.changing_own_role_relation_warning') +
          t(
            'views.element_plus_engineering.system_settings.logout_and_reassign_permissions_warning',
          ) +
          t('views.element_plus_engineering.system_settings.current_user_permission_loss_warning') +
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
    } else {
      await ElMessageBox.confirm(
        t('views.element_plus_engineering.system_settings.update_role_user_relation_confirmation'),
        t('views.element_plus_engineering.system_settings.prompt'),
        {
          confirmButtonText: t('views.element_plus_engineering.system_settings.confirm'),
          cancelButtonText: t('views.element_plus_engineering.system_settings.cancel'),
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        },
      )
    }
  } catch {
    return
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
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.role_user_relation_updated', {
        roleName: item.role_name,
        roleId: item.key_role_string_id,
      }),
      type: 'success',
    })
    roleUserRelationMaintainDialogVisible.value = false
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: t(
          'views.element_plus_engineering.system_settings.logout_after_changing_own_role_relation',
        ),
        type: 'warning',
      })
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
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.roles_attached', {
        roleCount: roles.length,
      }),
      type: 'success',
    })
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

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

.focusable-switch:focus {
  outline: none;
}
</style>
