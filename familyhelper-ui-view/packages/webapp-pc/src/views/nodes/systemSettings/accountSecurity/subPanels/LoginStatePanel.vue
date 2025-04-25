<template>
  <div class="login-state-panel-container">
    <div class="placeholder" v-if="accountId === ''">请选择账号</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="readonly" @click="handleShowLoginDialog">
              生成凭证
            </el-button>
            <el-divider direction="vertical" />
            <div class="label">登录类型:</div>
            <el-select class="select" v-model="typeSelectorModel" @change="handleLoginStateSearch">
              <el-option
                v-for="item in typeSelectorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-divider direction="vertical" />
            <el-button type="success" @click="handleLoginStateSearch">刷新数据</el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="item icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="loginStateTableCurrentPage"
            v-model:page-size="loginStateTablePageSize"
            :item-count="loginStateTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="loginStateTableItems"
            :operate-column-width="84"
            :show-contextmenu="true"
            :contextmenu-width="100"
            :row-class-name="loginStateTableRowClassName"
            @onPagingAttributeChanged="handleLoginStatePagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.long_id"
                label="凭证ID"
                width="190px"
                show-overflow-tooltip
              />
              <el-table-column
                prop="expire_date"
                label="过期时间"
                width="180px"
                show-overflow-tooltip
                :formatter="loginStateTableTimestampFormatter"
              />
              <el-table-column
                prop="generated_date"
                label="生成时间"
                width="180px"
                show-overflow-tooltip
                :formatter="loginStateTableTimestampFormatter"
              />
              <el-table-column
                prop="type"
                label="类型"
                width="60px"
                show-overflow-tooltip
                :formatter="loginStateTableTypeFormatter"
              />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
            <template v-slot:operateColumn="{ row }">
              <el-button-group class="operate-column">
                <el-button
                  class="table-button"
                  type="warning"
                  :disabled="readonly"
                  :icon="DocumentCopyIcon"
                  @click="handleLoginStateTableDeriveButtonClicked(row as LoginState)"
                />
                <el-button
                  class="table-button"
                  type="danger"
                  :disabled="readonly || row.key.long_id === lnpStore.token"
                  :icon="DeleteIcon"
                  @click="handleLoginStateTableLogoutButtonClicked(row as LoginState)"
                />
              </el-button-group>
            </template>
            <template v-slot:contextmenu="{ row, close }">
              <ul class="my-contextmenu">
                <li
                  @click="handleLoginStateTableKeyCopyContextmenuClicked(row as LoginState, close)"
                >
                  复制主键
                </li>
                <el-divider />
                <li
                  :class="{ disabled: readonly }"
                  @click="
                    handleLoginStateTableDeriveContextmenuClicked(row as LoginState, close, $event)
                  "
                >
                  派生...
                </li>
                <li
                  :class="{ disabled: readonly || row.key.long_id === lnpStore.token }"
                  @click="
                    handleLoginStateTableLogoutContextmenuClicked(row as LoginState, close, $event)
                  "
                >
                  删除...
                </li>
              </ul>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <el-dialog
      id="loginDialog"
      v-model="loginDialogVisible"
      append-to-body
      destroy-on-close
      title="生成凭证（通过登录）"
      :close-on-click-modal="false"
      @keydown.ctrl.enter="handleLoginDialogHotKeyDown"
      @closed="handleLoginDialogClosed"
    >
      <template v-slot:default>
        <el-form
          class="login-form"
          ref="loginFormRef"
          label-position="right"
          label-width="85px"
          v-loading="loginDialogFormLoading"
          :model="loginDialogFormModel"
          :rules="loginDialogFormRule"
          :validate-on-rule-change="false"
          @submit.prevent
        >
          <el-form-item label="账号密码" prop="password">
            <el-input
              v-model="loginDialogFormModel.password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="过期时间" prop="expire_date">
            <el-date-picker
              class="short-bar"
              v-model="loginDialogFormModel.expire_date"
              type="datetime"
              placeholder="选择过期时间"
              :shortcuts="dialogFormDatePickerShortcuts"
            />
          </el-form-item>
          <el-form-item label="凭证备注" prop="remark">
            <el-input v-model="loginDialogFormModel.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <el-button
          type="primary"
          v-if="!readonly"
          :disabled="loginDialogFormLoading > 0"
          @click="handleLoginDialogConfirmButtonClicked"
        >
          创建
        </el-button>
        <el-button
          :disabled="loginDialogFormLoading > 0"
          @click="handleLoginDialogCancelButtonClicked"
        >
          取消
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      id="deriveDialog"
      v-model="deriveDialogVisible"
      append-to-body
      destroy-on-close
      title="生成凭证（通过派生）"
      :close-on-click-modal="false"
      @keydown.ctrl.enter="handleDeriveDialogHotKeyDown"
      @closed="handleDeriveDialogClosed"
    >
      <template v-slot:default>
        <el-form
          class="derive-form"
          ref="deriveFormRef"
          label-position="right"
          label-width="85px"
          v-loading="deriveDialogFormLoading"
          :model="deriveDialogFormModel"
          :rules="deriveDialogFormRule"
          :validate-on-rule-change="false"
          @submit.prevent
        >
          <el-form-item label="过期时间" prop="expire_date">
            <el-date-picker
              class="short-bar"
              v-model="deriveDialogFormModel.expire_date"
              type="datetime"
              placeholder="选择过期时间"
              :shortcuts="dialogFormDatePickerShortcuts"
            />
          </el-form-item>
          <el-form-item label="凭证备注" prop="remark">
            <el-input v-model="deriveDialogFormModel.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <el-button
          type="primary"
          v-if="!readonly"
          :disabled="deriveDialogFormLoading > 0"
          @click="handleDeriveDialogConfirmButtonClicked"
        >
          创建
        </el-button>
        <el-button
          :disabled="deriveDialogFormLoading > 0"
          @click="handleDeriveDialogCancelButtonClicked"
        >
          取消
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref, useTemplateRef, watch } from 'vue'

import type { FormItemRule } from 'element-plus'
import { ElForm, ElMessage, ElMessageBox } from 'element-plus'
import { Delete as DeleteIcon, DocumentCopy as DocumentCopyIcon } from '@element-plus/icons-vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import type {
  LoginState,
  LoginStateType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginState.ts'
import {
  childForAccount,
  childForAccountTypeEqualsDynamic,
  childForAccountTypeEqualsStatic,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginState.ts'
import {
  logout,
  staticLogin,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/login.ts'
import { staticDerive } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/derive.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'LoginStatePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
type TypeSelectorModelType = 'all' | 'dynamic' | 'static'
type TypeSelectorOptionType = { value: TypeSelectorModelType; label: string }

const typeSelectorModel = ref<TypeSelectorModelType>('all')
const typeSelectorOptions = ref<TypeSelectorOptionType[]>([
  { value: 'all', label: '全部' },
  { value: 'dynamic', label: '动态' },
  { value: 'static', label: '静态' },
])

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// -----------------------------------------------------------登录状态搜索-----------------------------------------------------------
function handleLoginStateSearch(): void {
  if (!props.accountId) {
    return
  }
  switch (typeSelectorModel.value) {
    case 'all':
      handleLoginStateAllSearch()
      break
    case 'dynamic':
      handleLoginStateDynamicSearch()
      break
    case 'static':
      handleLoginStateStaticSearch()
      break
    default:
      throw new Error('不应该执行到此处，请联系开发人员')
  }
}

async function handleLoginStateAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pageInfo) => childForAccount({ string_id: props.accountId }, pageInfo),
      loginStateTablePagingInfo.value,
    )
    updateLoginStateTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleLoginStateDynamicSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pageInfo) => childForAccountTypeEqualsDynamic({ string_id: props.accountId }, pageInfo),
      loginStateTablePagingInfo.value,
    )
    updateLoginStateTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleLoginStateStaticSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pageInfo) => childForAccountTypeEqualsStatic({ string_id: props.accountId }, pageInfo),
      loginStateTablePagingInfo.value,
    )
    updateLoginStateTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.accountId,
  () => {
    handleLoginStateSearch()
  },
)

onMounted(() => {
  handleLoginStateSearch()
})

// -----------------------------------------------------------登录状态表格-----------------------------------------------------------
const {
  currentPage: loginStateTableCurrentPage,
  pageSize: loginStateTablePageSize,
  itemCount: loginStateTableItemCount,
  items: loginStateTableItems,
  pagingInfo: loginStateTablePagingInfo,
  updateByLookup: updateLoginStateTableByLookup,
} = useIdentityBackendPagingTablePanel<LoginState>(15)

function handleLoginStatePagingAttributeChanged(): void {
  handleLoginStateSearch()
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loginStateTableTimestampFormatter(row: LoginState, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loginStateTableTypeFormatter(row: LoginState, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const type: LoginStateType = (row as any)[column.property] as LoginStateType
  switch (type) {
    case 0:
      return '动态'
    case 10:
      return '静态'
    default:
      return '（未知）'
  }
}

function loginStateTableRowClassName({ row }: { row: LoginState }): string {
  return row.key.long_id === lnpStore.token ? 'current-token' : ''
}

function handleLoginStateTableDeriveButtonClicked(row: LoginState): void {
  handleShowDeriveDialog(row)
}

function handleLoginStateTableDeriveContextmenuClicked(
  row: LoginState,
  close: () => void,
  event: MouseEvent,
): void {
  if (props.readonly) {
    event.preventDefault()
    return
  }
  close()
  handleShowDeriveDialog(row)
}

async function handleLoginStateTableKeyCopyContextmenuClicked(
  row: LoginState,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({
    showClose: true,
    message: '复制成功',
    type: 'success',
    center: true,
  })
}

function handleLoginStateTableLogoutButtonClicked(row: LoginState): void {
  handleLoginStateLogout(row)
}

function handleLoginStateTableLogoutContextmenuClicked(
  row: LoginState,
  close: () => void,
  event: MouseEvent,
): void {
  if (props.readonly || row.key.long_id === lnpStore.token) {
    event.preventDefault()
    return
  }
  close()
  handleLoginStateLogout(row)
}

async function handleLoginStateLogout(row: LoginState): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此登录凭证。<br>' +
        '删除凭证可能会导致使用该凭证的用户强制下线。<br>' +
        '同时会导致使用该凭证的第三方应用无法继续使用。<br>' +
        '<div style="color: #b22222"><b>如果您不知道删除该登录凭证后会产生什么后果，' +
        '请不要进行操作！</b></div>' +
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
  loading.value += 1
  try {
    await resolveResponse(logout(row.key))
    ElMessage({
      showClose: true,
      message: `登录凭证 ${row.key.long_id} 删除成功`,
      type: 'success',
      center: true,
    })
    handleLoginStateSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------对话框公共方法-----------------------------------------------------------
type DialogFormDatePickerShortcut = {
  text: string
  value: () => Date
}

const dialogExpireDateValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  // 不能为空。
  if (!value) {
    callback(new Error('过期时间不能为空'))
  }
  // 大于当前时间。
  if (value <= new Date()) {
    callback(new Error('过期时间必须大于当前时间'))
  }
  // 通过验证。
  callback()
}

const dialogFormDatePickerShortcuts = ref<DialogFormDatePickerShortcut[]>([
  {
    text: '一天后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: '一周后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
      return date
    },
  },
  {
    text: '一月后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 30)
      return date
    },
  },
  {
    text: '一年后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 365)
      return date
    },
  },
])

// -----------------------------------------------------------登录对话框-----------------------------------------------------------
type LoginDialogFormModel = {
  password: string
  expire_date: number | null
  remark: ''
}

const loginDialogVisible = ref<boolean>(false)
const loginDialogFormLoading = ref<number>(0)
const loginDialogFormModel = ref<LoginDialogFormModel>({
  password: '',
  expire_date: null,
  remark: '',
})
const loginDialogFormRule = ref({
  expire_date: [
    { required: true, message: '过期时间不能为空', trigger: 'change' },
    { validator: dialogExpireDateValidator, trigger: 'blur' },
  ],
  remark: [
    {
      required: true,
      message: '备注不能为空，请填写有意义的内容，以便于维护',
      trigger: 'change',
    },
  ],
})

const loginFormRef = useTemplateRef<InstanceType<typeof ElForm>>('loginFormRef')

function handleShowLoginDialog(): void {
  loginDialogVisible.value = true
}

function handleLoginDialogClosed(): void {
  handleResetLoginDialogFormModel()
}

function handleLoginDialogCancelButtonClicked(): void {
  loginDialogVisible.value = false
  handleResetLoginDialogFormModel()
}

function handleResetLoginDialogFormModel(): void {
  loginDialogFormModel.value.password = ''
  loginDialogFormModel.value.expire_date = null
  loginDialogFormModel.value.remark = ''
}

function handleLoginDialogHotKeyDown(): void {
  const loginForm = loginFormRef.value
  if (!loginForm) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loginForm.validate((accept) => {
    if (accept) {
      handleLoginConfirm()
    }
  })
}

function handleLoginDialogConfirmButtonClicked(): void {
  const loginForm = loginFormRef.value
  if (!loginForm) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loginForm.validate((accept) => {
    if (accept) {
      handleLoginConfirm()
    }
  })
}

async function handleLoginConfirm(): Promise<void> {
  const expireDate: number | null = loginDialogFormModel.value.expire_date
  if (expireDate === null) {
    return
  }
  loginDialogFormLoading.value += 1
  try {
    const res = await resolveResponse(
      staticLogin({
        account_key: { string_id: props.accountId },
        password: loginDialogFormModel.value.password,
        expire_date: expireDate,
        remark: loginDialogFormModel.value.remark,
        extra_params: {},
      }),
    )
    ElMessage({
      showClose: true,
      message: `登录凭证成功，凭证ID为 ${res.token}`,
      type: 'success',
      center: true,
    })
    loginDialogVisible.value = false
    handleLoginStateSearch()
  } finally {
    loginDialogFormLoading.value -= 1
  }
}

// -----------------------------------------------------------派生对话框-----------------------------------------------------------
type DeriveDialogFormModel = {
  token: string
  expire_date: number | null
  remark: ''
}
const deriveDialogVisible = ref<boolean>(false)
const deriveDialogFormLoading = ref<number>(0)
const deriveDialogFormModel = ref<DeriveDialogFormModel>({
  token: '',
  expire_date: null,
  remark: '',
})
const deriveDialogFormRule = ref({
  expire_date: [
    { required: true, message: '过期时间不能为空', trigger: 'change' },
    { validator: dialogExpireDateValidator, trigger: 'blur' },
  ],
  remark: [
    {
      required: true,
      message: '备注不能为空，请填写有意义的内容，以便于维护',
      trigger: 'change',
    },
  ],
})

const deriveFormRef = useTemplateRef<InstanceType<typeof ElForm>>('deriveFormRef')

function handleShowDeriveDialog(row: LoginState): void {
  deriveDialogVisible.value = true
  deriveDialogFormModel.value.token = row.key.long_id
}

function handleDeriveDialogClosed(): void {
  handleResetDeriveDialogFormModel()
}

function handleDeriveDialogCancelButtonClicked(): void {
  deriveDialogVisible.value = false
  handleResetDeriveDialogFormModel()
}

function handleResetDeriveDialogFormModel(): void {
  deriveDialogFormModel.value.token = ''
  deriveDialogFormModel.value.expire_date = null
  deriveDialogFormModel.value.remark = ''
}

function handleDeriveDialogHotKeyDown(): void {
  const deriveForm = deriveFormRef.value
  if (!deriveForm) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  deriveForm.validate((accept) => {
    if (accept) {
      handleDeriveConfirm()
    }
  })
}

function handleDeriveDialogConfirmButtonClicked(): void {
  const deriveForm = deriveFormRef.value
  if (!deriveForm) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  deriveForm.validate((accept) => {
    if (accept) {
      handleDeriveConfirm()
    }
  })
}

async function handleDeriveConfirm(): Promise<void> {
  const expireDate: number | null = deriveDialogFormModel.value.expire_date
  if (expireDate === null) {
    return
  }
  deriveDialogFormLoading.value += 1
  try {
    await resolveResponse(
      staticDerive({
        login_state_key: { long_id: deriveDialogFormModel.value.token },
        expire_date: expireDate,
        remark: deriveDialogFormModel.value.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `登录凭证 ${deriveDialogFormModel.value.token} 派生成功`,
      type: 'success',
      center: true,
    })
    deriveDialogVisible.value = false
    handleLoginStateSearch()
  } finally {
    deriveDialogFormLoading.value -= 1
  }
}
</script>

<style scoped>
.login-state-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
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

.header-container .label {
  color: #606266;
  margin-right: 10px;
  font-size: 14px;
  font-family: 微软雅黑, serif;
}

.header-container .select {
  width: 110px;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

.table .table-button {
  padding: 7px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.current-token) {
  font-weight: bold;
}

.my-contextmenu {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.my-contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
  user-select: none;
}

.my-contextmenu li:hover {
  background: #eee;
}

/*noinspection CssUnusedSymbol*/
.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}

.login-form .short-bar {
  width: 200px;
}
</style>
