<template>
  <div class="pexp-panel-container">
    <placeholder-panel v-if="role === null" text="请选择角色" />
    <header-layout-panel v-else class="panel">
      <template v-slot:header>
        <div class="header-container">
          <el-button
            type="primary"
            :disabled="scopeId === ''"
            @click="handleShowPexpCreateMaintainDialog"
          >
            新建权限表达式
          </el-button>
          <el-button type="success" :disabled="scopeId === ''" @click="handlePexpSearch">
            刷新数据
          </el-button>
          <el-divider direction="vertical" />
          <permission-scope-indicator @onChanged="handlePermissionScopeIndicatorChanged" />
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesButtonDisabled"
            @click="handleApplyChanges"
          >
            应用变更
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="scopeId === ''" text="请选择权限作用域" />
        <table-panel
          v-else
          v-loading="pexpTableLoading"
          v-model:current-page="pexpTableCurrentPage"
          v-model:page-size="pexpTablePageSize"
          :item-count="pexpTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="pexpTableItems"
          @onPagingAttributeChanged="handlePexpTablePagingAttributeChanged"
          @onItemInspect="handleShowPexpInspectDialog"
          @onItemEdit="handleShowPexpEditDialog"
          @onItemDelete="handlePexpDelete"
        >
          <el-table-column prop="key.pexp_string_id" label="ID" show-overflow-tooltip />
          <el-table-column prop="content" label="表达式" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="pexpMaintainDialogVisible"
      :loading="pexpMaintainDialogLoading"
      :mode="pexpMaintainDialogMode"
      :item="pexpMaintainDialogItem"
      :create-rules="pexpMaintainDialogCreateRules"
      :edit-rules="pexpMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePexpCreate"
      @onItemEdit="handlePexpEdit"
    >
      <el-form-item
        label="表达式ID"
        prop="pexp_string_id"
        v-if="pexpMaintainDialogMode === 'CREATE'"
      >
        <el-input
          v-model="pexpMaintainDialogItem.pexp_string_id"
          placeholder="创建时填写，如: read"
          @input="handlePexpStringIdInput"
        />
      </el-form-item>
      <el-form-item label="表达式" prop="content">
        <el-input
          v-model="pexpMaintainDialogItem.content"
          :readonly="pexpMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="pexpMaintainDialogItem.remark"
          :readonly="pexpMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { computed, ref, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import PermissionScopeIndicator from '@/views/nodes/elementPlus/systemSettings/permissionScope/PermissionScopeIndicator.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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
  scope_string_id: string
  role_string_id: string
  pexp_string_id: string
  content: string
  remark: string
}

function pexpMaintainDialogItemMap(t: DispPexp): PexpMaintainDialogItem {
  return {
    scope_string_id: t.key.scope_string_id,
    role_string_id: t.key.role_string_id,
    pexp_string_id: t.key.pexp_string_id,
    content: t.content,
    remark: t.remark,
  }
}

const {
  visible: pexpMaintainDialogVisible,
  item: pexpMaintainDialogItem,
  mode: pexpMaintainDialogMode,
  showCreateDialog: showPexpCreateMaintainDialog,
  showEditDialog: showPexpEditMaintainDialog,
  showInspectDialog: showPexpInspectMaintainDialog,
} = useGeneralMaintainDialog<DispPexp, PexpMaintainDialogItem>(pexpMaintainDialogItemMap, {
  scope_string_id: '',
  role_string_id: '',
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

function pexpStringIdValidator(
  _rule: FormItemRule,
  value: string,
  callback: (err?: Error) => void,
): void {
  if (!value || value === '') {
    callback(new Error('表达式ID不能为空'))
    return
  }
  if (scopeId.value === '' || props.role === null) {
    callback(new Error('请先选择角色和权限作用域'))
    return
  }
  resolveResponse(pexpExists(scopeId.value, props.role.key.string_id, value))
    .then((existsResult) => {
      if (existsResult) {
        callback(new Error('表达式ID已存在'))
      } else {
        callback()
      }
    })
    .catch(() => {
      callback(new Error('校验失败'))
    })
}

const pexpMaintainDialogCreateRules = {
  pexp_string_id: [
    { required: true, message: '表达式ID不能为空', trigger: 'blur' },
    { validator: pexpStringIdValidator, trigger: 'blur' },
  ],
  content: [{ required: true, message: '表达式不能为空', trigger: 'blur' }],
}

const pexpMaintainDialogEditRules = {
  content: [{ required: true, message: '表达式不能为空', trigger: 'blur' }],
}

function handleShowPexpInspectDialog(item: DispPexp): void {
  showPexpInspectMaintainDialog(item)
}

function handleShowPexpCreateMaintainDialog(): void {
  if (props.role === null || scopeIndicatorValue.value === null) {
    return
  }
  showPexpCreateMaintainDialog()
}

function handleShowPexpEditDialog(item: DispPexp): void {
  showPexpEditMaintainDialog(item)
}

async function handlePexpCreate(item: PexpMaintainDialogItem): Promise<void> {
  if (props.role === null || scopeIndicatorValue.value === null) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  try {
    await ElMessageBox.confirm(
      '此操作将增加一条权限表达式。<br>' +
        '<div style="color: #b22222"><b>请务必保证权限表达式合法规范</b></div>' +
        '<b>不规范的权限表达式可能导致前端界面、后台出错，甚至崩溃！</b><br>' +
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
  const influencedFlag = await checkInfluenced(props.role.key.string_id)
  if (influencedFlag) {
    try {
      await ElMessageBox.confirm(
        '您似乎在添加一个您所属的角色的权限表达式。<br>' +
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
  pexpMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      createPexp({
        key: {
          scope_string_id: item.scope_string_id,
          role_string_id: item.role_string_id,
          pexp_string_id: item.pexp_string_id,
        },
        content: item.content,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '权限表达式创建成功',
      type: 'success',
    })
    pexpMaintainDialogVisible.value = false
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您添加了您所属的角色的权限表达式，账号将会注销，请重新登录',
        type: 'warning',
      })
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
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  try {
    await ElMessageBox.confirm(
      '此操作将修改本条权限表达式。<br>' +
        '<div style="color: #b22222"><b>请务必保证权限表达式合法规范</b></div>' +
        '<b>不规范的权限表达式可能导致前端界面、后台出错，甚至崩溃！</b><br>' +
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
  const influencedFlag = await checkInfluenced(item.role_string_id)
  if (influencedFlag) {
    try {
      await ElMessageBox.confirm(
        '您似乎在编辑一个您所属的角色的权限表达式。<br>' +
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
  pexpMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updatePexp({
        key: {
          scope_string_id: item.scope_string_id,
          role_string_id: item.role_string_id,
          pexp_string_id: item.pexp_string_id,
        },
        content: item.content,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '权限表达式编辑成功',
      type: 'success',
    })
    pexpMaintainDialogVisible.value = false
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您编辑了您所属的角色的权限表达式，账号将会注销，请重新登录',
        type: 'warning',
      })
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
  try {
    await ElMessageBox.confirm(
      '此操作将删除本条权限表达式。<br>' +
        '<b>删除权限表达式有可能导致角色意外提权！</b><br>' +
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
  const influencedFlag = await checkInfluenced(item.key.role_string_id)
  if (influencedFlag) {
    try {
      await ElMessageBox.confirm(
        '您似乎在编辑一个您所属的角色的权限表达式。<br>' +
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
    ElMessage({
      showClose: true,
      message: '权限表达式删除成功',
      type: 'success',
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您删除了您所属的角色的权限表达式，账号将会注销，请重新登录',
        type: 'warning',
      })
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
</style>
