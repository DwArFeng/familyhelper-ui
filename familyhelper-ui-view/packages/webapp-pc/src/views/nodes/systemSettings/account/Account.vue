<template>
  <div class="account-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <table-panel
        v-model:current-page="accountTableCurrentPage"
        v-model:page-size="accountTablePageSize"
        highlight-current-row
        :item-count="accountTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="accountTableItems"
        @onPagingAttributeChanged="handleAccountPagingAttributeChanged"
        @onCurrentChanged="handleAccountCurrentChanged"
        @onItemInspect="handleShowAccountInspectMaintainDialog"
        @onItemEdit="handleShowAccountEditMaintainDialog"
        @onItemDelete="handleAccountDelete"
      >
        <el-table-column prop="key.string_id" label="账户ID" show-overflow-tooltip />
        <el-table-column prop="name" label="显示名称" show-overflow-tooltip />
        <el-table-column
          prop="enabled"
          label="启用"
          :formatter="enabledFormatter"
          show-overflow-tooltip
        />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="showAccountCreateMaintainDialog"> 注册账户</el-button>
          <el-button
            type="primary"
            :disabled="accountTableCurrentRow === null"
            @click="handleShowRoleAssignDialog"
          >
            分配角色
          </el-button>
          <el-button
            type="primary"
            :disabled="accountTableCurrentRow === null"
            @click="handleShowPasswordResetDialog"
          >
            重置密码
          </el-button>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="accountMaintainDialogVisible"
      create-title="注册"
      create-confirm-button-label="注册"
      :loading="accountMaintainDialogLoading"
      :mode="accountMaintainDialogMode"
      :item="accountMaintainDialogItem"
      :create-rules="accountMaintainDialogCreateRules"
      :edit-rules="accountMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleAccountRegister"
      @onItemEdit="handleAccountEdit"
    >
      <el-form-item label="账户ID" prop="key_string_id">
        <el-input
          v-model="accountMaintainDialogItem.key_string_id"
          oninput="this.value = this.value.toLowerCase()"
          :readonly="accountMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="accountMaintainDialogItem.name"
          :readonly="accountMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="启用" prop="enabled" v-if="accountMaintainDialogMode !== 'CREATE'">
        <el-switch
          class="focusable-switch"
          v-model="accountMaintainDialogItem.enabled"
          tabindex="0"
          active-text="启用"
          inactive-text="禁用"
          :disabled="accountMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="accountMaintainDialogItem.remark"
          :readonly="accountMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="初始密码" prop="password" v-if="accountMaintainDialogMode === 'CREATE'">
        <el-input v-model="accountMaintainDialogItem.password" show-password />
      </el-form-item>
      <el-form-item
        label="确认密码"
        prop="password_confirm"
        v-if="accountMaintainDialogMode === 'CREATE'"
      >
        <el-input v-model="accountMaintainDialogItem.password_confirm" show-password />
      </el-form-item>
    </maintain-dialog>
    <el-dialog
      class="role-assign-dialog-container"
      ref="roleAssignDialogRef"
      v-model="roleAssignDialogVisible"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="角色分配"
      :close-on-click-modal="false"
      @opened="handleRoleAssignDialogOpened"
      @keydown.ctrl.enter="handleResetRoleRelation"
    >
      <el-transfer
        class="transfer"
        v-model="roleAssignDialogSelectedRoleIds"
        :titles="['待选角色', '已选角色']"
        :props="roleAssignDialogProps"
        :data="roleAssignDialogAllRoles"
      >
      </el-transfer>
      <template v-slot:footer>
        <div class="dialog-footer-container">
          <el-button type="primary" @click="handleResetRoleRelation"> 确定</el-button>
          <el-button @click="handleCancelRoleRelation"> 取消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      class="password-reset-dialog-container"
      ref="passwordResetDialogRef"
      v-model="passwordResetDialogVisible"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="密码重置"
      :close-on-click-modal="false"
      @opened="handlePasswordResetDialogOpened"
      @keydown.ctrl.enter="handleResetPassword"
    >
      <el-form
        ref="passwordResetFormRef"
        label-width="80px"
        :model="passwordResetDialogModel"
        :rules="passwordResetDialogRules"
        :validate-on-rule-change="false"
        @submit.prevent
      >
        <el-form-item label="重置密码" prop="password">
          <el-input v-model="passwordResetDialogModel.password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="password_confirm">
          <el-input v-model="passwordResetDialogModel.password_confirm" show-password />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer-container">
          <el-button type="primary" @click="handleResetPassword"> 确定</el-button>
          <el-button @click="handleCancelResetPassword"> 取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref, useTemplateRef } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElDialog, ElForm, ElMessage, ElMessageBox } from 'element-plus'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import { type Account } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import {
  all as allAccount,
  exists,
  register,
  remove,
  resetPassword,
  resetRoleRelation,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { type Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/role.ts'
import {
  all as allRole,
  childForAccount as childRoleForAccount,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/role.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupAllToList, lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'AccountComponent',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------账户搜索-----------------------------------------------------------
function handleAccountSearch(): void {
  lookupAllAccount()
}

function lookupAllAccount(): void {
  loading.value += 1
  lookupWithAdjustPage((pagingInfo) => allAccount(pagingInfo), accountTablePagingInfo.value)
    .then(updateAccountTableByLookup)
    .catch(() => {})
    .finally(() => {
      loading.value -= 1
    })
}

onMounted(() => {
  handleAccountSearch()
})

// -----------------------------------------------------------账户表格处理-----------------------------------------------------------
const {
  currentPage: accountTableCurrentPage,
  pageSize: accountTablePageSize,
  itemCount: accountTableItemCount,
  items: accountTableItems,
  pagingInfo: accountTablePagingInfo,
  updateByLookup: updateAccountTableByLookup,
} = useIdentityBackendPagingTablePanel<Account>(15)
const accountTableCurrentRow = ref<Account | null>(null)

function handleAccountPagingAttributeChanged(): void {
  handleAccountSearch()
}

function handleAccountCurrentChanged(current: Account | null): void {
  accountTableCurrentRow.value = current
}

function handleShowAccountInspectMaintainDialog(item: Account): void {
  showAccountInspectMaintainDialog(item)
}

function handleShowAccountEditMaintainDialog(item: Account): void {
  showAccountEditMaintainDialog(item)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: Account, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((row as any)[column.property] as boolean) ? '是' : '否'
}

async function handleAccountDelete(item: Account): Promise<void> {
  const accountIdToDelete: string = item.key.string_id
  const nameToDelete: string = item.name
  if (accountIdToDelete === lnpStore.me) {
    try {
      await ElMessageBox.confirm(
        '您似乎在删除您自己。<br>' +
          '<div style="color: #b22222"><b>如果继续，您将会被注销，并且会永远失去该账号</b></div>' +
          '<b>您有将会失去此账号的全部数据，且无法恢复</b><br>' +
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
  } else {
    try {
      await ElMessageBox.confirm(
        `您似乎在删除 ${nameToDelete}(${accountIdToDelete})。<br>` +
          '<b>该账号的所有者将会失去此账号的全部数据，且无法恢复</b><br>' +
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
  loading.value += 1
  try {
    await resolveResponse(remove({ string_id: accountIdToDelete }))
    ElMessage({
      showClose: true,
      message: `账户 ${nameToDelete}(${accountIdToDelete}) 删除成功`,
      type: 'success',
    })
    if (accountIdToDelete === lnpStore.me) {
      ElMessage({
        showClose: true,
        message: '由于您删除了您自己，账号将会注销，请重新登录',
        type: 'warning',
      })
      await lnpStore.willFireKick().execute()
      return
    }
    handleAccountSearch()
  } catch {
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------账户维护对话框处理-----------------------------------------------------------
type AccountMaintainDialogItem = {
  key_string_id: string
  name: string
  enabled: boolean
  remark: string
  password: string
  password_confirm: string
}

const {
  visible: accountMaintainDialogVisible,
  item: accountMaintainDialogItem,
  mode: accountMaintainDialogMode,
  showCreateDialog: showAccountCreateMaintainDialog,
  showEditDialog: showAccountEditMaintainDialog,
  showInspectDialog: showAccountInspectMaintainDialog,
} = useGeneralMaintainDialog<Account, AccountMaintainDialogItem>(accountMaintainDialogItemMap, {
  key_string_id: '',
  name: '',
  enabled: false,
  remark: '',
  password: '',
  password_confirm: '',
})
const accountMaintainDialogLoading = ref<number>(0)
const accountMaintainDialogKeyValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('账户不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('账户已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const accountMaintainDialogPasswordConfirmValidator: FormItemRule['validator'] = (
  _rule,
  _value,
  callback,
) => {
  if (
    accountMaintainDialogItem.value.password !== accountMaintainDialogItem.value.password_confirm
  ) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}
const accountMaintainDialogCreateRules = ref({
  key_string_id: [
    {
      validator: accountMaintainDialogKeyValidator,
      trigger: 'blur',
    },
    { required: true, message: '账户不能为空', trigger: 'blur' },
  ],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  password_confirm: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: accountMaintainDialogPasswordConfirmValidator, trigger: 'blur' },
  ],
})
const accountMaintainDialogEditRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})

function accountMaintainDialogItemMap(t: Account): AccountMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    name: t.name,
    enabled: t.enabled,
    remark: t.remark,
    password: '',
    password_confirm: '',
  }
}

function handleAccountRegister(): void {
  accountMaintainDialogLoading.value += 1
  resolveResponse(
    register({
      account_key: { string_id: accountMaintainDialogItem.value.key_string_id },
      display_name: accountMaintainDialogItem.value.name,
      enabled: accountMaintainDialogItem.value.enabled,
      remark: accountMaintainDialogItem.value.remark,
      password: accountMaintainDialogItem.value.password,
    }),
  )
    .then(() => {
      ElMessage({
        showClose: true,
        message: `账户 ${accountMaintainDialogItem.value.name} 创建成功`,
        type: 'success',
      })
    })
    .then(() => {
      handleAccountSearch()
    })
    .then(() => {
      accountMaintainDialogItem.value.password = ''
      accountMaintainDialogItem.value.password_confirm = ''
      accountMaintainDialogVisible.value = false
    })
    .catch(() => {})
    .finally(() => {
      accountMaintainDialogLoading.value -= 1
    })
}

async function handleAccountEdit(): Promise<void> {
  const accountIdToEdit: string = accountMaintainDialogItem.value.key_string_id
  const accountEnabledToEdit: boolean = accountMaintainDialogItem.value.enabled
  if (accountIdToEdit === lnpStore.me && !accountEnabledToEdit) {
    try {
      await ElMessageBox.confirm(
        '您似乎在禁用您自己。<br>' +
          '<div style="color: #b22222"><b>如果继续，您将会被注销，并且无法继续登录</b></div>' +
          '<b>您有可能完全失去该账号的使用权，且无法自行恢复</b><br>' +
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
  accountMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        account_key: { string_id: accountMaintainDialogItem.value.key_string_id },
        display_name: accountMaintainDialogItem.value.name,
        enabled: accountMaintainDialogItem.value.enabled,
        remark: accountMaintainDialogItem.value.remark,
      }),
    )
    const accountId: string = accountMaintainDialogItem.value.key_string_id
    const name: string = accountMaintainDialogItem.value.name
    ElMessage({
      showClose: true,
      message: `账户 ${name}(${accountId}) 更新成功`,
      type: 'success',
    })
    if (accountId === lnpStore.me && !accountEnabledToEdit) {
      ElMessage({
        showClose: true,
        message: '由于您禁用了您自己，账号将会注销，请重新登录',
        type: 'warning',
      })
      await lnpStore.willFireKick().execute()
      return
    }
    handleAccountSearch()
    accountMaintainDialogVisible.value = false
  } catch {
  } finally {
    accountMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------角色分配对话框处理-----------------------------------------------------------
const roleAssignDialogVisible = ref<boolean>(false)
const roleAssignDialogAllRoles = ref<(Role & { key_string_id: string })[]>([])
const roleAssignDialogSelectedRoleIds = ref<string[]>([])
const roleAssignDialogProps = ref({
  key: 'key_string_id',
  label: 'name',
})

const roleAssignDialogRef = useTemplateRef<InstanceType<typeof ElDialog>>('roleAssignDialogRef')

function handleShowRoleAssignDialog(): void {
  const currentAccount: Account | null = accountTableCurrentRow.value
  if (!currentAccount) {
    return
  }
  lookupAllToList((pagingInfo) => allRole(pagingInfo))
    .then((res) => {
      roleAssignDialogAllRoles.value = res.map((role) => ({
        ...role,
        key_string_id: role.key.string_id,
      }))
    })
    .then(() =>
      lookupAllToList((pagingInfo) => childRoleForAccount(currentAccount.key, pagingInfo)),
    )
    .then((res) => {
      roleAssignDialogSelectedRoleIds.value = res.map((role) => role.key.string_id)
    })
    .then(() => {
      roleAssignDialogVisible.value = true
    })
}

function handleRoleAssignDialogOpened(): void {
  const roleAssignDialog = roleAssignDialogRef.value
  if (!roleAssignDialog) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  roleAssignDialog.dialogContentRef.$el.focus()
}

async function handleResetRoleRelation(): Promise<void> {
  if (!accountTableCurrentRow.value) {
    return
  }
  const accountIdToEdit: string = accountTableCurrentRow.value.key.string_id
  if (accountIdToEdit === lnpStore.me) {
    try {
      await ElMessageBox.confirm(
        '您似乎在更改您自己的角色。<br>' +
          '<div style="color: #b22222"><b>如果继续，您将会被注销，并且根据新设定的角色重新分配权限</b></div>' +
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
  loading.value += 1
  try {
    await resolveResponse(
      resetRoleRelation(
        { string_id: accountIdToEdit },
        roleAssignDialogSelectedRoleIds.value.map((roleId) => ({ string_id: roleId })),
      ),
    )
    const accountId: string = accountTableCurrentRow.value.key.string_id
    const name: string = accountTableCurrentRow.value.name
    ElMessage({
      showClose: true,
      message: `账户 ${name}(${accountId}) 角色更新成功`,
      type: 'success',
    })
    if (accountId === lnpStore.me) {
      ElMessage({
        showClose: true,
        message: '由于您更改了您自己的角色，账号将会注销，请重新登录',
        type: 'warning',
      })
      await lnpStore.willFireKick().execute()
      return
    }
    roleAssignDialogVisible.value = false
  } catch {
  } finally {
    loading.value -= 1
  }
}

function handleCancelRoleRelation(): void {
  roleAssignDialogVisible.value = false
}

// -----------------------------------------------------------密码重置对话框处理-----------------------------------------------------------
type PasswordResetDialogModel = {
  password: string
  password_confirm: string
}

const passwordResetDialogVisible = ref<boolean>(false)
const passwordResetDialogModel = ref<PasswordResetDialogModel>({
  password: '',
  password_confirm: '',
})
const passwordResetDialogPasswordConfirmValidator: FormItemRule['validator'] = (
  _rule,
  _value,
  callback,
) => {
  if (passwordResetDialogModel.value.password !== passwordResetDialogModel.value.password_confirm) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}
const passwordResetDialogRules = ref({
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  password_confirm: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: passwordResetDialogPasswordConfirmValidator, trigger: 'blur' },
  ],
})

const passwordResetDialogRef =
  useTemplateRef<InstanceType<typeof ElDialog>>('passwordResetDialogRef')
const passwordResetFormRef = useTemplateRef<InstanceType<typeof ElForm>>('passwordResetFormRef')

function handleShowPasswordResetDialog(): void {
  passwordResetDialogModel.value.password = ''
  passwordResetDialogModel.value.password_confirm = ''
  passwordResetDialogVisible.value = true
}

function handlePasswordResetDialogOpened(): void {
  const passwordResetDialog = passwordResetDialogRef.value
  if (!passwordResetDialog) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  passwordResetDialog.dialogContentRef.$el.focus()
}

async function handleResetPassword(): Promise<void> {
  const passwordResetForm = passwordResetFormRef.value
  if (!passwordResetForm) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  try {
    await passwordResetForm.validate()
  } catch {
    return
  }
  try {
    await ElMessageBox.confirm(
      '您在重置账户的密码。<br>' +
        '<div style="color: #b22222"><b>能力越大，责任越大，请尊重他人隐私</b></div>' +
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
  const currentAccount: Account | null = accountTableCurrentRow.value
  if (!currentAccount) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const accountIdToEdit: string = currentAccount.key.string_id
  const newPassword: string = passwordResetDialogModel.value.password
  loading.value += 1
  try {
    await resolveResponse(
      resetPassword({
        account_key: { string_id: accountIdToEdit },
        new_password: newPassword,
      }),
    )
    const accountId: string = currentAccount.key.string_id
    const name: string = currentAccount.name
    ElMessage({
      showClose: true,
      message: `账户 ${name}(${accountId}) 密码重置成功`,
      type: 'success',
    })
    if (accountIdToEdit === lnpStore.me) {
      ElMessage({
        showClose: true,
        message: '由于您重置了您自己的密码，账号将会注销，请重新登录',
        type: 'warning',
      })
      await lnpStore.willFireKick().execute()
      return
    }
  } catch {
  } finally {
    passwordResetDialogModel.value.password = ''
    passwordResetDialogModel.value.password_confirm = ''
    passwordResetDialogVisible.value = false
    loading.value -= 1
  }
}

function handleCancelResetPassword(): void {
  passwordResetDialogVisible.value = false
}
</script>

<style scoped>
.account-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.role-assign-dialog-container .transfer {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

/*noinspection CssUnusedSymbol*/
.role-assign-dialog-container :deep(.el-dialog__body) {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}

.dialog-footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.focusable-switch:focus {
  outline: none;
}
</style>
