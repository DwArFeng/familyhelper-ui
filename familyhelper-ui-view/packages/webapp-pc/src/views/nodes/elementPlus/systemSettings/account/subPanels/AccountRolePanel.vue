<template>
  <div class="account-role-panel-container">
    <placeholder-panel v-if="accountId === ''" text="请选择用户" />
    <div v-else class="main-container">
      <header-layout-panel class="panel">
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="handleShowAttachDialog"> 添加角色 </el-button>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesButtonDisabled"
              @click="handleApplyChanges"
            >
              应用变更
            </el-button>
            <el-divider direction="vertical" />
            <el-button type="info" @click="handleShowPermissionViewOfUserInspectDialog">
              权限视图
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
            <el-table-column prop="role.key.string_id" label="角色ID" show-overflow-tooltip />
            <el-table-column prop="role.name" label="角色名称" show-overflow-tooltip />
            <el-table-column
              prop="enabled"
              label="启用"
              :formatter="enabledFormatter"
              show-overflow-tooltip
            />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="roleUserRelationMaintainDialogVisible"
      edit-title="编辑角色用户关联"
      inspect-title="查看角色用户关联"
      :loading="roleUserRelationMaintainDialogLoading"
      :mode="roleUserRelationMaintainDialogMode"
      :item="roleUserRelationMaintainDialogItem"
      :edit-rules="roleUserRelationMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemEdit="handleRoleUserRelationEdit"
    >
      <el-form-item
        v-if="roleUserRelationMaintainDialogMode === 'INSPECT'"
        label="角色ID"
        prop="key_role_string_id"
      >
        <el-input v-model="roleUserRelationMaintainDialogItem.key_role_string_id" readonly />
      </el-form-item>
      <el-form-item
        v-if="roleUserRelationMaintainDialogMode === 'INSPECT'"
        label="角色名称"
        prop="role_name"
      >
        <el-input v-model="roleUserRelationMaintainDialogItem.role_name" readonly />
      </el-form-item>
      <el-form-item label="启用" prop="enabled">
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="roleUserRelationMaintainDialogItem.enabled"
          active-text="启用"
          inactive-text="禁用"
          :disabled="roleUserRelationMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
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
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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
    ElMessage({
      showClose: true,
      message: '变更应用成功！后台状态刷新中，请不要频繁点击',
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
  return ((row as Record<string, unknown>)[column.property] as boolean) ? '是' : '否'
}

function handleRoleUserRelationTablePagingAttributeChanged(): void {
  handleSearch()
}

async function handleRemoveRoleUserRelation(relation: DispRoleUserRelation): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `此操作将移除用户关联的角色 ${relation.role.name}(${relation.role.key.string_id})。<br>是否继续?`,
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
  const influencedFlag = props.accountId === lnpStore.me
  if (influencedFlag) {
    try {
      await ElMessageBox.confirm(
        '您似乎在移除您自己的角色关联。<br>' +
          '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据其余的角色重新分配权限</b></div>' +
          '<b>您有可能失去系统的部分权限，且可能无法自行恢复</b><br>' +
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
  }
  roleUserRelationTableLoading.value += 1
  try {
    await resolveResponse(
      removeRoleUserRelation(relation.key.role_string_id, relation.key.user_string_id),
    )
    ElMessage({
      showClose: true,
      message: `角色 ${relation.role.name} 已移除`,
      type: 'success',
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您移除了您自己的角色关联，账号将会注销，请重新登录',
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
        '您似乎在改变一个您所属的角色关联。<br>' +
          '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据其余的角色重新分配权限</b></div>' +
          '<b>您有可能失去系统的部分权限，且可能无法自行恢复</b><br>' +
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
    } else {
      await ElMessageBox.confirm('此操作将更新此角色用户关联。<br>是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      })
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
      message: `角色用户关联 ${item.role_name}(${item.key_role_string_id}) 更新成功`,
      type: 'success',
    })
    roleUserRelationMaintainDialogVisible.value = false
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您改变了您所属的角色关联，账号将会注销，请重新登录',
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
      message: `已成功添加 ${roles.length} 个角色`,
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

.panel {
  flex: 1;
  min-height: 0;
}

/*noinspection CssUnusedSymbol*/
.panel :deep(.main-container-wrapper) {
  min-height: 0;
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
