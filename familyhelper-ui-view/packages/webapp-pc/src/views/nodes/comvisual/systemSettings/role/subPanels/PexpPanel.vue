<template>
  <div class="pexp-panel-container">
    <placeholder-panel v-if="role === null" text="请选择角色" />
    <template v-else>
      <loading-overlay :loading="pexpTableLoading > 0" />
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button
              kind="primary"
              :disabled="scopeId === ''"
              @click="handleShowPexpCreateMaintainDialog"
            >
              新建权限表达式
            </native-button>
            <native-button kind="success" :disabled="scopeId === ''" @click="handlePexpSearch">
              刷新数据
            </native-button>
            <vertical-divider />
            <permission-scope-indicator @on-changed="handlePermissionScopeIndicatorChanged" />
            <vertical-divider />
            <native-button
              kind="primary"
              :disabled="applyChangesButtonDisabled"
              @click="handleApplyChanges"
            >
              应用变更
            </native-button>
            <vertical-divider />
            <native-button
              kind="info"
              :disabled="scopeId === ''"
              @click="handleShowPermissionViewOfRoleInspectDialog"
            >
              权限视图
            </native-button>
          </div>
        </template>
        <template v-slot:default>
          <placeholder-panel v-if="scopeId === ''" text="请选择权限作用域" />
          <paging-table-panel
            v-else
            v-model:current-page="pexpTableCurrentPage"
            v-model:page-size="pexpTablePageSize"
            :item-count="pexpTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="pexpTableItems"
            @on-paging-attribute-changed="handlePexpTablePagingAttributeChanged"
            @on-item-inspect="handleShowPexpInspectDialog"
            @on-item-edit="handleShowPexpEditDialog"
            @on-item-delete="handlePexpDelete"
          >
            <paging-table-column label="ID" prop="key.pexp_string_id" :min-width="140" />
            <paging-table-column label="表达式" prop="content" :min-width="200" />
            <paging-table-column label="备注" prop="remark" :min-width="120" />
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </template>
    <maintain-dialog
      v-model:visible="pexpMaintainDialogVisible"
      :loading="pexpMaintainDialogLoading"
      :mode="pexpMaintainDialogMode"
      :item="pexpMaintainDialogItem"
      label-width="100px"
      create-title="新建权限表达式"
      edit-title="编辑权限表达式"
      inspect-title="查看权限表达式"
      :close-on-click-modal="false"
      @on-item-create="handlePexpCreate"
      @on-item-edit="handlePexpEdit"
    >
      <native-form-item v-if="pexpMaintainDialogMode === 'CREATE'" label="表达式ID">
        <input
          v-model="pexpMaintainDialogItem.pexp_string_id"
          class="form-input"
          type="text"
          placeholder="创建时填写，如: read"
          @input="handlePexpStringIdInput"
        />
      </native-form-item>
      <native-form-item label="表达式">
        <input
          v-model="pexpMaintainDialogItem.content"
          class="form-input"
          type="text"
          :readonly="pexpMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
      <native-form-item label="备注">
        <input
          v-model="pexpMaintainDialogItem.remark"
          class="form-input"
          type="text"
          :readonly="pexpMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
    </maintain-dialog>
    <permission-view-of-role-inspect-dialog
      v-model:visible="permissionViewOfRoleInspectDialogVisible"
      :role="role"
      :scope-id="scopeId"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { computed, ref, watch } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import VerticalDivider from '@/components/comvisual/form/divider/verticalDivider/VerticalDivider.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useGeneralMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import PermissionScopeIndicator from '@/views/nodes/comvisual/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import PermissionViewOfRoleInspectDialog from '@/views/nodes/comvisual/systemSettings/role/subDialogs/PermissionViewOfRoleInspectDialog.vue'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import { type Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/role.ts'
import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { type DispPexp } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/pexp.ts'
import {
  childForScopeChildForRoleDisp,
  create as createPexp,
  remove as removePexp,
  update as updatePexp,
  exists as pexpExists,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/pexp.ts'
import { childForRoleDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/roleUserRelation.ts'
import { resetAnalysis } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/reset.ts'
import { lookupAllToList, lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PexpPanel',
})

// region Props 定义

type Props = {
  role: Role | null
}

const props = defineProps<Props>()

// endregion

// region Store

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// endregion

// region 作用域

const scopeIndicatorValue = ref<Scope | null>(null)

const scopeId = computed<string>(() => {
  return scopeIndicatorValue.value === null ? '' : scopeIndicatorValue.value.key.string_id
})

function handlePermissionScopeIndicatorChanged(value: Scope | null): void {
  scopeIndicatorValue.value = value
}

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

// region 权限视图查看对话框

const permissionViewOfRoleInspectDialogVisible = ref<boolean>(false)

function handleShowPermissionViewOfRoleInspectDialog(): void {
  permissionViewOfRoleInspectDialogVisible.value = true
}

// endregion

// region 权限表达式表格

const {
  currentPage: pexpTableCurrentPage,
  pageSize: pexpTablePageSize,
  itemCount: pexpTableItemCount,
  items: pexpTableItems,
  pagingInfo: pexpTablePagingInfo,
  updateByLookup: updatePexpTableByLookup,
} = useIdentityBackendPagingTablePanel<DispPexp>(15)
const pexpTableLoading = ref<number>(0)

function handlePexpTablePagingAttributeChanged(): void {
  handlePexpSearch()
}

// endregion

// region 权限表达式查询

function handlePexpSearch(): void {
  if (props.role === null || scopeIndicatorValue.value === null) {
    return
  }
  handlePexpForRoleScopeSearch()
}

async function handlePexpForRoleScopeSearch(): Promise<void> {
  const roleKey = props.role?.key ?? null
  const scopeKey = scopeIndicatorValue.value?.key ?? null
  if (roleKey === null || scopeKey === null) {
    return
  }
  pexpTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForScopeChildForRoleDisp(scopeKey, roleKey, pagingInfo),
      pexpTablePagingInfo.value,
    )
    updatePexpTableByLookup(res)
  } finally {
    pexpTableLoading.value -= 1
  }
}

watch(
  () => [props.role, scopeIndicatorValue.value] as const,
  ([role, scope]) => {
    if (role === null || scope === null) {
      return
    }
    handlePexpSearch()
  },
)

// endregion

// region checkInfluenced

async function checkInfluenced(roleId: string): Promise<boolean> {
  const res = await lookupAllToList((pagingInfo) =>
    childForRoleDisp({ string_id: roleId }, pagingInfo),
  )
  return res.some((r) => r.user.key.string_id === lnpStore.me)
}

// endregion

// region 权限表达式维护对话框

type PexpMaintainDialogItem = {
  pexp_string_id: string
  content: string
  remark: string
}

function pexpMaintainDialogItemMap(t: DispPexp): PexpMaintainDialogItem {
  return {
    pexp_string_id: t.key.pexp_string_id,
    content: t.content,
    remark: t.remark,
  }
}

const {
  visible: pexpMaintainDialogVisible,
  item: pexpMaintainDialogItem,
  mode: pexpMaintainDialogMode,
  showCreateDialog: showPexpCreateMaintainDialogBase,
  showEditDialog: showPexpEditMaintainDialog,
  showInspectDialog: showPexpInspectMaintainDialog,
} = useGeneralMaintainDialog<DispPexp, PexpMaintainDialogItem>(pexpMaintainDialogItemMap, {
  pexp_string_id: '',
  content: '',
  remark: '',
})

const pexpMaintainDialogLoading = ref<number>(0)

function handlePexpStringIdInput(e: Event): void {
  const t = e.target as HTMLInputElement
  if (t) {
    pexpMaintainDialogItem.value.pexp_string_id = t.value.toLowerCase()
  }
}

function handleShowPexpInspectDialog(item: DispPexp): void {
  showPexpInspectMaintainDialog(item)
}

function handleShowPexpCreateMaintainDialog(): void {
  if (props.role === null || scopeIndicatorValue.value === null) {
    return
  }
  showPexpCreateMaintainDialogBase()
}

function handleShowPexpEditDialog(item: DispPexp): void {
  showPexpEditMaintainDialog(item)
}

async function handlePexpCreate(item: PexpMaintainDialogItem): Promise<void> {
  if (props.role === null || scopeIndicatorValue.value === null) {
    return
  }
  if (
    !window.confirm(
      '此操作将增加一条权限表达式。\n请务必保证权限表达式合法规范；不规范的权限表达式可能导致前端界面、后台出错，甚至崩溃。\n是否继续?',
    )
  ) {
    return
  }
  if (!item.pexp_string_id.trim()) {
    notifyWarning('表达式ID不能为空')
    return
  }
  if (!item.content.trim()) {
    notifyWarning('表达式不能为空')
    return
  }
  const existsResult = await resolveResponse(
    pexpExists(scopeId.value, props.role.key.string_id, item.pexp_string_id),
  )
  if (existsResult) {
    notifyWarning('表达式ID已存在')
    return
  }
  const influencedFlag = await checkInfluenced(props.role.key.string_id)
  if (influencedFlag) {
    if (
      !window.confirm(
        '您似乎在添加一个您所属的角色的权限表达式。\n如果继续，您将会被注销，并且根据其余的角色重新分配权限。\n是否继续?',
      )
    ) {
      return
    }
  }
  pexpMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      createPexp({
        key: {
          scope_string_id: scopeId.value,
          role_string_id: props.role.key.string_id,
          pexp_string_id: item.pexp_string_id,
        },
        content: item.content,
        remark: item.remark,
      }),
    )
    notifySuccess('权限表达式创建成功')
    pexpMaintainDialogVisible.value = false
    if (influencedFlag) {
      notifyWarning('由于您添加了您所属的角色的权限表达式，账号将会注销，请重新登录')
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handlePexpSearch()
  } finally {
    pexpMaintainDialogLoading.value -= 1
  }
}

async function handlePexpEdit(item: PexpMaintainDialogItem): Promise<void> {
  if (props.role === null) {
    return
  }
  if (
    !window.confirm(
      '此操作将修改本条权限表达式。\n请务必保证权限表达式合法规范；不规范的权限表达式可能导致前端界面、后台出错，甚至崩溃。\n是否继续?',
    )
  ) {
    return
  }
  if (!item.content.trim()) {
    notifyWarning('表达式不能为空')
    return
  }
  const influencedFlag = await checkInfluenced(props.role.key.string_id)
  if (influencedFlag) {
    if (
      !window.confirm(
        '您似乎在编辑一个您所属的角色的权限表达式。\n如果继续，您将会被注销，并且根据其余的角色重新分配权限。\n是否继续?',
      )
    ) {
      return
    }
  }
  pexpMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updatePexp({
        key: {
          scope_string_id: scopeId.value,
          role_string_id: props.role.key.string_id,
          pexp_string_id: item.pexp_string_id,
        },
        content: item.content,
        remark: item.remark,
      }),
    )
    notifySuccess('权限表达式编辑成功')
    pexpMaintainDialogVisible.value = false
    if (influencedFlag) {
      notifyWarning('由于您编辑了您所属的角色的权限表达式，账号将会注销，请重新登录')
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handlePexpSearch()
  } finally {
    pexpMaintainDialogLoading.value -= 1
  }
}

async function handlePexpDelete(item: DispPexp): Promise<void> {
  if (
    !window.confirm(
      '此操作将删除本条权限表达式。\n删除权限表达式有可能导致角色意外提权！\n是否继续?',
    )
  ) {
    return
  }
  const influencedFlag = await checkInfluenced(item.key.role_string_id)
  if (influencedFlag) {
    if (
      !window.confirm(
        '您似乎在删除一个您所属的角色的权限表达式。\n如果继续，您将会被注销，并且根据其余的角色重新分配权限。\n是否继续?',
      )
    ) {
      return
    }
  }
  pexpTableLoading.value += 1
  try {
    await resolveResponse(
      removePexp({
        key: {
          scope_string_id: item.key.scope_string_id,
          role_string_id: item.key.role_string_id,
          pexp_string_id: item.key.pexp_string_id,
        },
      }),
    )
    notifySuccess('权限表达式删除成功')
    if (influencedFlag) {
      notifyWarning('由于您删除了您所属的角色的权限表达式，账号将会注销，请重新登录')
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handlePexpSearch()
  } finally {
    pexpTableLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.pexp-panel-container {
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
  row-gap: 5px;
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
