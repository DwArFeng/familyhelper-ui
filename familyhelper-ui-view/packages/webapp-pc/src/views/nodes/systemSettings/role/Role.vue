<template>
  <div class="role-container">
    <border-layout-panel
      class="border-layout-panel"
      east-width="45%"
      :header-visible="true"
      :east-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="showRoleCreateMaintainDialog"> 新建角色</el-button>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="roleTableCurrentRow === null"
            @click="showPexpCreateMaintainDialog"
          >
            新建权限表达式
          </el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleRoleSearch">刷新数据</el-button>
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
      <template v-slot:east>
        <table-panel
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
          <el-table-column prop="content" label="表达式" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </border-layout-panel>
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
          oninput="this.value = this.value.toLowerCase()"
          :readonly="roleMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="roleMaintainDialogItem.name"
          :readonly="roleMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="启用" prop="enabled" v-if="roleMaintainDialogMode !== 'CREATE'">
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
    <maintain-dialog
      v-model:visible="pexpMaintainDialogVisible"
      :loading="pexpMaintainDialogLoading"
      :mode="pexpMaintainDialogMode"
      :item="pexpMaintainDialogItem"
      :create-rules="pexpMaintainDialogRules"
      :edit-rules="pexpMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePexpCreate"
      @onItemEdit="handlePexpEdit"
    >
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

import { onMounted, ref, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import { type StringIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/role.ts'
import {
  all as allRole,
  exists as existsRole,
  insert as insertRole,
  remove as removeRole,
  update as updateRole,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/role.ts'
import { type Pexp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/pexp.ts'
import {
  childForRole as childPexpForRole,
  insert as insertPexp,
  remove as removePexp,
  update as updatePexp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/pexp.ts'
import { childForRole } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { lookupAllToList, lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'RoleComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------角色查询-----------------------------------------------------------
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
  const res = await lookupAllToList((pagingInfo) => childForRole(roleKey, pagingInfo))
  return res.some((a) => a.key.string_id === lnpStore.me)
}

onMounted(() => {
  handleRoleSearch()
})

// -----------------------------------------------------------角色表格处理-----------------------------------------------------------
const {
  currentPage: roleTableCurrentPage,
  pageSize: roleTablePageSize,
  itemCount: roleTableItemCount,
  items: roleTableItems,
  pagingInfo: roleTablePagingInfo,
  updateByLookup: updateRoleTableByLookup,
} = useIdentityBackendPagingTablePanel<Role>(15)
const roleTableLoading = ref<number>(0)
const roleTableCurrentRow = ref<Role | null>(null)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: Role, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((row as any)[column.property] as boolean) ? '是' : '否'
}

function handleRoleTablePagingAttributeChanged(): void {
  handleRoleSearch()
}

function handleRoleTableCurrentChanged(current: Role | null): void {
  roleTableCurrentRow.value = current
}

function handleShowRoleInspectDialog(item: Role): void {
  showRoleInspectMaintainDialog(item)
}

function handleShowRoleEditDialog(item: Role): void {
  showRoleEditMaintainDialog(item)
}

async function handleRoleDelete(item: Role): Promise<void> {
  const influencedFlag: boolean = await checkInfluenced(item.key)
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
      center: true,
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您删除了您所属的角色，账号将会注销，请重新登录',
        type: 'warning',
        center: true,
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

// -----------------------------------------------------------角色维护对话框处理-----------------------------------------------------------
type RoleMaintainDialogItem = {
  key_string_id: string
  name: string
  enabled: boolean
  remark: string
  original_enabled: boolean
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
  enabled: false,
  remark: '',
  original_enabled: false,
})
const roleMaintainDialogLoading = ref<number>(0)
const roleMaintainDialogKeyValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('角色不能为空'))
        return Promise.reject()
      }
      return resolveResponse(existsRole({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('角色已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const roleMaintainDialogCreateRules = ref({
  key_string_id: [
    { validator: roleMaintainDialogKeyValidator, trigger: 'blur' },
    {
      required: true,
      message: '角色不能为空',
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})
const roleMaintainDialogEditRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})

function roleMaintainDialogItemMap(t: Role): RoleMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    name: t.name,
    enabled: t.enabled,
    remark: t.remark,
    original_enabled: t.enabled,
  }
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
      center: true,
    })
    handleRoleSearch()
    roleMaintainDialogVisible.value = false
  } finally {
    roleMaintainDialogLoading.value -= 1
  }
}

async function handleRoleEdit(item: RoleMaintainDialogItem): Promise<void> {
  let influencedFlag: boolean = false
  if (item.original_enabled !== item.enabled) {
    influencedFlag = await checkInfluenced({ string_id: item.key_string_id })
    if (influencedFlag) {
      try {
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
      } catch {
        return
      }
    }
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
      center: true,
    })
    roleMaintainDialogVisible.value = false
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您改变了您所属的角色的启用状态，账号将会注销，请重新登录',
        type: 'warning',
        center: true,
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

// -----------------------------------------------------------权限表达式查询-----------------------------------------------------------
function handlePexpSearch(): void {
  handlePexpForRoleSearch()
}

async function handlePexpForRoleSearch(): Promise<void> {
  const roleKey: StringIdKey | null = roleTableCurrentRow.value?.key ?? null
  if (roleKey === null) {
    return
  }
  pexpTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childPexpForRole(roleKey, pagingInfo),
      pexpTablePagingInfo.value,
    )
    updatePexpTableByLookup(res)
  } finally {
    pexpTableLoading.value -= 1
  }
}

watch(roleTableCurrentRow, (value) => {
  if (value === null) {
    return
  }
  handlePexpSearch()
})

// -----------------------------------------------------------权限表达式表格处理-----------------------------------------------------------
const {
  currentPage: pexpTableCurrentPage,
  pageSize: pexpTablePageSize,
  itemCount: pexpTableItemCount,
  items: pexpTableItems,
  pagingInfo: pexpTablePagingInfo,
  updateByLookup: updatePexpTableByLookup,
} = useIdentityBackendPagingTablePanel<Pexp>(15)
const pexpTableLoading = ref<number>(0)

function handlePexpTablePagingAttributeChanged(): void {
  handlePexpSearch()
}

async function handlePexpDelete(item: Pexp): Promise<void> {
  const roleKey: StringIdKey | null = item.role_key
  if (!roleKey) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
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
  const influencedFlag: boolean = await checkInfluenced(roleKey)
  if (influencedFlag) {
    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          ElMessageBox.confirm(
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
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        }, 300)
      })
    } catch {
      return
    }
  }
  pexpTableLoading.value += 1
  try {
    await resolveResponse(removePexp(item.key))
    ElMessage({
      showClose: true,
      message: '权限表达式删除成功',
      type: 'success',
      center: true,
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您删除了您所属的角色的权限表达式，账号将会注销，请重新登录',
        type: 'warning',
        center: true,
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

// -----------------------------------------------------------权限表达式维护对话框处理-----------------------------------------------------------
type PexpMaintainDialogItem = {
  key_long_id: string
  role_key_string_id: string
  content: string
  remark: string
}

const {
  visible: pexpMaintainDialogVisible,
  item: pexpMaintainDialogItem,
  mode: pexpMaintainDialogMode,
  showCreateDialog: showPexpCreateMaintainDialog,
  showEditDialog: showPexpEditMaintainDialog,
  showInspectDialog: showPexpInspectMaintainDialog,
} = useGeneralMaintainDialog<Pexp, PexpMaintainDialogItem>(pexpMaintainDialogItemMap, {
  key_long_id: '',
  role_key_string_id: '',
  content: '',
  remark: '',
})
const pexpMaintainDialogLoading = ref<number>(0)
const pexpMaintainDialogRules = ref({
  content: [{ required: true, message: '表达式不能为空', trigger: 'blur' }],
})

function pexpMaintainDialogItemMap(t: Pexp): PexpMaintainDialogItem {
  return {
    key_long_id: t.key?.long_id ?? '',
    role_key_string_id: t.role_key?.string_id ?? '',
    content: t.content,
    remark: t.remark,
  }
}

function handleShowPexpInspectDialog(item: Pexp): void {
  showPexpInspectMaintainDialog(item)
}

function handleShowPexpEditDialog(item: Pexp): void {
  showPexpEditMaintainDialog(item)
}

async function handlePexpCreate(item: PexpMaintainDialogItem): Promise<void> {
  const roleKey: StringIdKey | null = roleTableCurrentRow.value?.key ?? null
  if (!roleKey) {
    return
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
  const influencedFlag: boolean = await checkInfluenced(roleKey)
  if (influencedFlag) {
    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          ElMessageBox.confirm(
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
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        }, 300)
      })
    } catch {
      return
    }
  }
  pexpMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insertPexp({
        key: null,
        role_key: roleKey,
        content: item.content,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '权限表达式创建成功',
      type: 'success',
      center: true,
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您改变了您所属的角色的启用状态，账号将会注销，请重新登录',
        type: 'warning',
        center: true,
      })
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handlePexpSearch()
    pexpMaintainDialogVisible.value = false
  } finally {
    pexpMaintainDialogLoading.value -= 1
  }
}

async function handlePexpEdit(item: PexpMaintainDialogItem): Promise<void> {
  const roleKey: StringIdKey | null =
    item.role_key_string_id === '' ? null : { string_id: item.role_key_string_id }
  if (!roleKey) {
    return
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
  const influencedFlag: boolean = await checkInfluenced(roleKey)
  if (influencedFlag) {
    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          ElMessageBox.confirm(
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
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        }, 300)
      })
    } catch {
      return
    }
  }
  pexpMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updatePexp({
        key: { long_id: item.key_long_id },
        role_key: roleKey,
        content: item.content,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '权限表达式编辑成功',
      type: 'success',
      center: true,
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: '由于您编辑了您所属的角色的权限表达式，账号将会注销，请重新登录',
        type: 'warning',
        center: true,
      })
      lnpStore
        .willFireKick()
        .execute()
        .catch(() => {})
      return
    }
    handlePexpSearch()
    pexpMaintainDialogVisible.value = false
  } finally {
    pexpMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.role-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.focusable-switch:focus {
  outline: none;
}
</style>
