<template>
  <div class="role-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowRoleCreateMaintainDialog">
            新建角色
          </el-button>
          <el-button type="success" @click="handleRoleSearch">刷新数据</el-button>
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
        <table-panel
          v-loading="roleTableLoading"
          v-model:current-page="roleTableCurrentPage"
          v-model:page-size="roleTablePageSize"
          :item-count="roleTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="roleTableItems"
          :highlight-current-row="true"
          @onPagingAttributeChanged="handleRoleTablePagingAttributeChanged"
          @onCurrentChanged="handleRoleTableCurrentChanged"
          @onItemInspect="handleShowRoleInspectDialog"
          @onItemEdit="handleShowRoleEditDialog"
          @onItemDelete="handleRoleDelete"
        >
          <el-table-column prop="key.string_id" label="角色ID" show-overflow-tooltip />
          <el-table-column prop="name" label="显示名称" show-overflow-tooltip />
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
    <maintain-dialog
      v-model:visible="roleMaintainDialogVisible"
      :loading="roleMaintainDialogLoading"
      :mode="roleMaintainDialogMode"
      :item="roleMaintainDialogItem"
      :create-rules="roleMaintainDialogCreateRules"
      :edit-rules="roleMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleRoleCreate"
      @onItemEdit="handleRoleEdit"
    >
      <el-form-item label="角色ID" prop="key_string_id">
        <el-input
          v-model="roleMaintainDialogItem.key_string_id"
          @input="handleKeyStringIdInput"
          :readonly="roleMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="roleMaintainDialogItem.name"
          :readonly="roleMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="启用" prop="enabled">
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="roleMaintainDialogItem.enabled"
          active-text="启用"
          inactive-text="禁用"
          :disabled="roleMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="roleMaintainDialogItem.remark"
          :readonly="roleMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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

// region 角色表格

const {
  currentPage: roleTableCurrentPage,
  pageSize: roleTablePageSize,
  itemCount: roleTableItemCount,
  items: roleTableItems,
  pagingInfo: roleTablePagingInfo,
  updateByLookup: updateRoleTableByLookup,
} = useIdentityBackendPagingTablePanel<Role>(15)
const roleTableLoading = ref<number>(0)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: Role, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean) ? '是' : '否'
}

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
  showCreateDialog: showRoleCreateMaintainDialog,
  showEditDialog: showRoleEditMaintainDialog,
  showInspectDialog: showRoleInspectMaintainDialog,
} = useGeneralMaintainDialog<Role, RoleMaintainDialogItem>(roleMaintainDialogItemMap, {
  key_string_id: '',
  name: '',
  enabled: true,
  remark: '',
})

const roleMaintainDialogLoading = ref<number>(0)
const roleMaintainDialogCreateRules = ref({
  key_string_id: [{ required: true, message: '角色ID不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})
const roleMaintainDialogEditRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})

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
  showRoleCreateMaintainDialog()
}

function handleShowRoleEditDialog(item: Role): void {
  showRoleEditMaintainDialog(item)
}

async function handleRoleCreate(item: RoleMaintainDialogItem): Promise<void> {
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
    ElMessage({
      showClose: true,
      message: `角色 ${item.name}(${item.key_string_id}) 创建成功`,
      type: 'success',
    })
    roleMaintainDialogVisible.value = false
    handleRoleSearch()
  } finally {
    roleMaintainDialogLoading.value -= 1
  }
}

async function handleRoleEdit(item: RoleMaintainDialogItem): Promise<void> {
  const influencedFlag = await checkInfluenced({ string_id: item.key_string_id })
  try {
    if (influencedFlag) {
      await ElMessageBox.confirm(
        '您似乎在改变一个您所属的角色的启用状态。<br>' +
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
      await ElMessageBox.confirm('此操作将更新此角色。<br>是否继续?', '提示', {
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
    ElMessage({
      showClose: true,
      message: `角色 ${item.name}(${item.key_string_id}) 更新成功`,
      type: 'success',
    })
    roleMaintainDialogVisible.value = false
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您改变了您所属的角色的启用状态，账号将会注销，请重新登录',
        type: 'warning',
      })
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
  try {
    if (influencedFlag) {
      await ElMessageBox.confirm(
        '您似乎在改变一个您所属的角色的启用状态。<br>' +
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
      await ElMessageBox.confirm(
        '此操作将永久删除此角色。<br>' +
          '<b>该操作将会影响所有属于该角色的用户的权限！</b><br>' +
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
    }
  } catch {
    return
  }
  roleTableLoading.value += 1
  try {
    await resolveResponse(removeRole(item.key))
    ElMessage({
      showClose: true,
      message: `角色 ${item.name}(${item.key.string_id}) 删除成功`,
      type: 'success',
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您删除了您所属的角色，账号将会注销，请重新登录',
        type: 'warning',
      })
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

.focusable-switch:focus {
  outline: none;
}
</style>
