<template>
  <div class="login-state-panel-container">
    <placeholder-panel
      v-if="accountId === ''"
      :text="t('views.element_plus_engineering.system_settings.please_select_account')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="readonly" @click="handleShowLoginDialog">
              {{ t('views.element_plus_engineering.system_settings.generate_credential') }}
            </el-button>
            <el-divider direction="vertical" />
            <div class="label">
              {{ t('views.element_plus_engineering.system_settings.login_type') }}
            </div>
            <el-select class="select" v-model="typeSelectorModel" @change="handleLoginStateSearch">
              <el-option
                v-for="item in typeSelectorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-divider direction="vertical" />
            <el-button type="success" @click="handleLoginStateSearch">{{
              t('views.element_plus_engineering.system_settings.refresh_data')
            }}</el-button>
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
                prop="key.string_id"
                :label="t('views.element_plus_engineering.system_settings.credential_id')"
                width="190px"
                show-overflow-tooltip
              />
              <el-table-column
                prop="expire_date"
                :label="t('views.element_plus_engineering.system_settings.expiration_time')"
                width="180px"
                show-overflow-tooltip
                :formatter="loginStateTableTimestampFormatter"
              />
              <el-table-column
                prop="generated_date"
                :label="t('views.element_plus_engineering.system_settings.created_time')"
                width="180px"
                show-overflow-tooltip
                :formatter="loginStateTableTimestampFormatter"
              />
              <el-table-column
                prop="type"
                :label="t('views.element_plus_engineering.system_settings.type')"
                width="60px"
                show-overflow-tooltip
                :formatter="loginStateTableTypeFormatter"
              />
              <el-table-column
                prop="remark"
                :label="t('views.element_plus_engineering.system_settings.remark')"
                show-overflow-tooltip
              />
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
                  :disabled="readonly || row.key.string_id === lnpStore.token"
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
                  {{ t('views.element_plus_engineering.system_settings.copy_primary_key') }}
                </li>
                <el-divider />
                <li
                  :class="{ disabled: readonly }"
                  @click="
                    handleLoginStateTableDeriveContextmenuClicked(row as LoginState, close, $event)
                  "
                >
                  {{ t('views.element_plus_engineering.system_settings.derive_ellipsis') }}
                </li>
                <li
                  :class="{ disabled: readonly || row.key.long_id === lnpStore.token }"
                  @click="
                    handleLoginStateTableLogoutContextmenuClicked(row as LoginState, close, $event)
                  "
                >
                  {{ t('views.element_plus_engineering.system_settings.delete_ellipsis') }}
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
      :title="t('views.element_plus_engineering.system_settings.generate_credential_by_login')"
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
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.account_password')"
            prop="password"
          >
            <el-input
              v-model="loginDialogFormModel.password"
              :placeholder="t('views.element_plus_engineering.system_settings.enter_password')"
              show-password
            />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.expiration_time')"
            prop="expire_date"
          >
            <el-date-picker
              class="short-bar"
              v-model="loginDialogFormModel.expire_date"
              type="datetime"
              :placeholder="
                t('views.element_plus_engineering.system_settings.select_expiration_time')
              "
              :shortcuts="dialogFormDatePickerShortcuts"
            />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.credential_remark')"
            prop="remark"
          >
            <el-input
              v-model="loginDialogFormModel.remark"
              :placeholder="t('views.element_plus_engineering.system_settings.enter_remark')"
            />
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
          {{ t('views.element_plus_engineering.system_settings.create') }}
        </el-button>
        <el-button
          :disabled="loginDialogFormLoading > 0"
          @click="handleLoginDialogCancelButtonClicked"
        >
          {{ t('views.element_plus_engineering.system_settings.cancel') }}
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      id="deriveDialog"
      v-model="deriveDialogVisible"
      append-to-body
      destroy-on-close
      :title="t('views.element_plus_engineering.system_settings.generate_credential_by_derivation')"
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
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.expiration_time')"
            prop="expire_date"
          >
            <el-date-picker
              class="short-bar"
              v-model="deriveDialogFormModel.expire_date"
              type="datetime"
              :placeholder="
                t('views.element_plus_engineering.system_settings.select_expiration_time')
              "
              :shortcuts="dialogFormDatePickerShortcuts"
            />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.credential_remark')"
            prop="remark"
          >
            <el-input
              v-model="deriveDialogFormModel.remark"
              :placeholder="t('views.element_plus_engineering.system_settings.enter_remark')"
            />
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
          {{ t('views.element_plus_engineering.system_settings.create') }}
        </el-button>
        <el-button
          :disabled="deriveDialogFormLoading > 0"
          @click="handleDeriveDialogCancelButtonClicked"
        >
          {{ t('views.element_plus_engineering.system_settings.cancel') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref, useTemplateRef, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElForm, ElMessage, ElMessageBox } from 'element-plus'
import { Delete as DeleteIcon, DocumentCopy as DocumentCopyIcon } from '@element-plus/icons-vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  type LoginState,
  type LoginStateType,
  childForAccount,
  childForAccountTypeEqualsDynamic,
  childForAccountTypeEqualsStatic,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/loginState.ts'
import {
  logout,
  staticLogin,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/access.ts'
import { staticDerive } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/derive.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'LoginStatePanel',
})

// region Props 定义

type Props = {
  accountId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region Store 引入

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

type TypeSelectorModelType = 'all' | 'dynamic' | 'static'
type TypeSelectorOptionType = { value: TypeSelectorModelType; label: string }

const typeSelectorModel = ref<TypeSelectorModelType>('all')
const typeSelectorOptions = ref<TypeSelectorOptionType[]>([
  {
    value: 'all',
    label: t('views.element_plus_engineering.system_settings.all'),
  },
  {
    value: 'dynamic',
    label: t('views.element_plus_engineering.system_settings.dynamic'),
  },
  {
    value: 'static',
    label: t('views.element_plus_engineering.system_settings.static'),
  },
])

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 登录状态搜索

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
      throw new Error(
        t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
      )
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

// endregion

// region 登录状态表格

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
      return t('views.element_plus_engineering.system_settings.dynamic')
    case 10:
      return t('views.element_plus_engineering.system_settings.static')
    default:
      return t('views.element_plus_engineering.system_settings.unknown_parenthesized')
  }
}

function loginStateTableRowClassName({ row }: { row: LoginState }): string {
  return row.key.string_id === lnpStore.token ? 'current-token' : ''
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
  await navigator.clipboard.writeText(row.key.string_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.system_settings.copy_succeeded'),
    type: 'success',
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
  if (props.readonly || row.key.string_id === lnpStore.token) {
    event.preventDefault()
    return
  }
  close()
  handleLoginStateLogout(row)
}

async function handleLoginStateLogout(row: LoginState): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.system_settings.delete_login_state_confirmation') +
        t(
          'views.element_plus_engineering.system_settings.delete_credential_forced_logout_warning',
        ) +
        t('views.element_plus_engineering.system_settings.delete_credential_third_party_warning') +
        t(
          'views.element_plus_engineering.system_settings.delete_login_state_unknown_consequences_warning_prefix',
        ) +
        t(
          'views.element_plus_engineering.system_settings.delete_login_state_unknown_consequences_warning_suffix',
        ) +
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
  loading.value += 1
  try {
    await resolveResponse(logout({ login_state_key: row.key }))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.login_state_deleted', {
        loginStateId: row.key.string_id,
      }),
      type: 'success',
    })
    handleLoginStateSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 对话框公共方法

type DialogFormDatePickerShortcut = {
  text: string
  value: () => Date
}

const dialogExpireDateValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  // 不能为空。
  if (!value) {
    callback(
      new Error(t('views.element_plus_engineering.system_settings.expiration_time_required')),
    )
  }
  // 大于当前时间。
  if (value <= new Date()) {
    callback(
      new Error(t('views.element_plus_engineering.system_settings.expiration_time_must_be_future')),
    )
  }
  // 通过验证。
  callback()
}

const dialogFormDatePickerShortcuts = ref<DialogFormDatePickerShortcut[]>([
  {
    text: t('views.element_plus_engineering.system_settings.one_day_later'),
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.system_settings.one_week_later'),
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.system_settings.one_month_later'),
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 30)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.system_settings.one_year_later'),
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000 * 24 * 365)
      return date
    },
  },
])

// endregion

// region 登录对话框

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
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.expiration_time_required'),
      trigger: 'change',
    },
    { validator: dialogExpireDateValidator, trigger: 'blur' },
  ],
  remark: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.meaningful_remark_required'),
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
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
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
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
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
      message: t('views.element_plus_engineering.system_settings.login_state_created', {
        loginStateId: res.login_state_key.string_id,
      }),
      type: 'success',
    })
    loginDialogVisible.value = false
    handleLoginStateSearch()
  } finally {
    loginDialogFormLoading.value -= 1
  }
}

// endregion

// region 派生对话框

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
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.expiration_time_required'),
      trigger: 'change',
    },
    { validator: dialogExpireDateValidator, trigger: 'blur' },
  ],
  remark: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.meaningful_remark_required'),
      trigger: 'change',
    },
  ],
})

const deriveFormRef = useTemplateRef<InstanceType<typeof ElForm>>('deriveFormRef')

function handleShowDeriveDialog(row: LoginState): void {
  deriveDialogVisible.value = true
  deriveDialogFormModel.value.token = row.key.string_id
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
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
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
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
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
        login_state_key: { string_id: deriveDialogFormModel.value.token },
        expire_date: expireDate,
        remark: deriveDialogFormModel.value.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.login_state_derived', {
        token: deriveDialogFormModel.value.token,
      }),
      type: 'success',
    })
    deriveDialogVisible.value = false
    handleLoginStateSearch()
  } finally {
    deriveDialogFormLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.login-state-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
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
