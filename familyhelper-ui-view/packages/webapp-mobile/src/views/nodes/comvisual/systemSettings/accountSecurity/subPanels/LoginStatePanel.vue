<template>
  <div class="login-state-panel-container">
    <placeholder-panel v-if="accountId === ''" text="请选择账号" />
    <div v-else class="main-container">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="primary" :disabled="readonly" @click="handleShowLoginDialog">
              生成凭证
            </native-button>
            <span class="header-sep" aria-hidden="true" />
            <span class="label">登录类型:</span>
            <select
              v-model="typeSelectorModel"
              class="type-select"
              @change="handleLoginStateSearch"
            >
              <option v-for="item in typeSelectorOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <span class="header-sep" aria-hidden="true" />
            <native-button kind="success" @click="handleLoginStateSearch">刷新数据</native-button>
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
            class="table"
            v-model:current-page="loginStateTableCurrentPage"
            v-model:page-size="loginStateTablePageSize"
            :item-count="loginStateTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="loginStateTableItems"
            :operate-column-visible="false"
            :highlight-current-row="false"
            :row-key="loginStateRowKey"
            :operate-column-width="200"
            @on-paging-attribute-changed="handleLoginStatePagingAttributeChanged"
          >
            <template v-slot:default>
              <paging-table-column
                label=""
                :width="40"
                :resizable="false"
                header-class="col-mark"
                cell-class="col-mark"
              >
                <template v-slot:header>&nbsp;</template>
                <template v-slot:default="{ row }">
                  {{ row.key.string_id === lnpStore.token ? '*' : '' }}
                </template>
              </paging-table-column>
              <paging-table-column label="凭证ID" :min-width="200">
                <template v-slot:default="{ row }">
                  <span :class="{ 'is-current-token': row.key.string_id === lnpStore.token }">
                    {{ row.key.string_id }}
                  </span>
                </template>
              </paging-table-column>
              <paging-table-column label="过期时间" :min-width="160">
                <template v-slot:default="{ row }">
                  {{ formatTimestamp(row.expire_date) }}
                </template>
              </paging-table-column>
              <paging-table-column label="生成时间" :min-width="160">
                <template v-slot:default="{ row }">
                  {{ formatTimestamp(row.generated_date) }}
                </template>
              </paging-table-column>
              <paging-table-column label="类型" :min-width="100">
                <template v-slot:default="{ row }">
                  {{ formatLoginStateType(row.type) }}
                </template>
              </paging-table-column>
              <paging-table-column label="备注" prop="remark" :min-width="120" />
            </template>
            <template v-slot:operateColumn="{ row }">
              <span class="operate-actions">
                <native-link size="small" type="primary" @click="handleCopyKey(row)">
                  复制
                </native-link>
                <native-link
                  size="small"
                  type="primary"
                  :disabled="readonly"
                  @click="handleShowDeriveDialog(row)"
                >
                  派生
                </native-link>
                <native-link
                  size="small"
                  type="danger"
                  :disabled="readonly || row.key.string_id === lnpStore.token"
                  @click="handleLoginStateLogout(row)"
                >
                  删除
                </native-link>
              </span>
            </template>
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </div>
    <modal-dialog
      v-model:visible="loginDialogVisible"
      title="生成凭证（通过登录）"
      :close-on-click-modal="false"
    >
      <loading-overlay :loading="loginDialogFormLoading > 0" />
      <form class="dialog-form" @submit.prevent="handleLoginDialogConfirmButtonClicked">
        <native-form :model="loginDialogFormModel" label-width="85px">
          <native-form-item label="账号密码">
            <input
              v-model="loginDialogFormModel.password"
              class="form-input"
              type="password"
              placeholder="请输入密码"
              autocomplete="current-password"
            />
          </native-form-item>
          <native-form-item label="过期时间" :error="loginExpireError">
            <date-time-input v-model="loginDialogFormModel.expire_iso" />
            <div class="shortcut-row">
              <native-link
                v-for="s in expireShortcuts"
                :key="s.label"
                size="small"
                type="primary"
                @click="loginDialogFormModel.expire_iso = s.iso()"
              >
                {{ s.label }}
              </native-link>
            </div>
          </native-form-item>
          <native-form-item label="凭证备注">
            <input
              v-model="loginDialogFormModel.remark"
              class="form-input"
              type="text"
              placeholder="请输入备注"
            />
          </native-form-item>
        </native-form>
      </form>
      <template v-slot:footer>
        <native-button
          v-if="!readonly"
          kind="primary"
          :disabled="loginDialogFormLoading > 0"
          @click="handleLoginDialogConfirmButtonClicked"
        >
          创建
        </native-button>
        <native-button :disabled="loginDialogFormLoading > 0" @click="loginDialogVisible = false">
          取消
        </native-button>
      </template>
    </modal-dialog>
    <modal-dialog
      v-model:visible="deriveDialogVisible"
      title="生成凭证（通过派生）"
      :close-on-click-modal="false"
    >
      <loading-overlay :loading="deriveDialogFormLoading > 0" />
      <form class="dialog-form" @submit.prevent="handleDeriveDialogConfirmButtonClicked">
        <native-form :model="deriveDialogFormModel" label-width="85px">
          <native-form-item label="过期时间" :error="deriveExpireError">
            <date-time-input v-model="deriveDialogFormModel.expire_iso" />
            <div class="shortcut-row">
              <native-link
                v-for="s in expireShortcuts"
                :key="'d-' + s.label"
                size="small"
                type="primary"
                @click="deriveDialogFormModel.expire_iso = s.iso()"
              >
                {{ s.label }}
              </native-link>
            </div>
          </native-form-item>
          <native-form-item label="凭证备注">
            <input
              v-model="deriveDialogFormModel.remark"
              class="form-input"
              type="text"
              placeholder="请输入备注"
            />
          </native-form-item>
        </native-form>
      </form>
      <template v-slot:footer>
        <native-button
          v-if="!readonly"
          kind="primary"
          :disabled="deriveDialogFormLoading > 0"
          @click="handleDeriveDialogConfirmButtonClicked"
        >
          创建
        </native-button>
        <native-button :disabled="deriveDialogFormLoading > 0" @click="deriveDialogVisible = false">
          取消
        </native-button>
      </template>
    </modal-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { computed, onMounted, ref, watch } from 'vue'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'
import DateTimeInput from '@/components/comvisual/form/dateTimeInput/DateTimeInput.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

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
  { value: 'all', label: '全部' },
  { value: 'dynamic', label: '动态' },
  { value: 'static', label: '静态' },
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

function loginStateRowKey(row: LoginState): string {
  return row.key.string_id
}

function handleLoginStatePagingAttributeChanged(): void {
  handleLoginStateSearch()
}

function formatLoginStateType(type: LoginStateType): string {
  switch (type) {
    case 0:
      return '动态'
    case 10:
      return '静态'
    default:
      return '（未知）'
  }
}

async function handleCopyKey(row: unknown): Promise<void> {
  const r = row as LoginState
  try {
    await navigator.clipboard.writeText(r.key.string_id)
    notifySuccess('复制成功')
  } catch {
    notifyWarning('复制失败')
  }
}

function handleShowDeriveDialog(row: unknown): void {
  const r = row as LoginState
  deriveDialogFormModel.value.token = r.key.string_id
  deriveDialogFormModel.value.expire_iso = defaultExpireIsoOneDay()
  deriveDialogFormModel.value.remark = ''
  deriveDialogVisible.value = true
}

async function handleLoginStateLogout(row: unknown): Promise<void> {
  const r = row as LoginState
  const ok = window.confirm(
    '此操作将永久删除此登录凭证。删除凭证可能会导致使用该凭证的用户强制下线，同时会导致使用该凭证的第三方应用无法继续使用。如果您不知道删除该登录凭证后会产生什么后果，请不要进行操作。是否继续？',
  )
  if (!ok) {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(logout({ login_state_key: r.key }))
    notifySuccess(`登录凭证 ${r.key.string_id} 删除成功`)
    handleLoginStateSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 对话框公共方法

function defaultExpireIsoOneDay(): string {
  const d = new Date()
  d.setTime(d.getTime() + 3600 * 1000 * 24)
  return d.toISOString()
}

const expireShortcuts = computed(() => [
  {
    label: '一天后',
    iso: () => {
      const d = new Date()
      d.setTime(d.getTime() + 3600 * 1000 * 24)
      return d.toISOString()
    },
  },
  {
    label: '一周后',
    iso: () => {
      const d = new Date()
      d.setTime(d.getTime() + 3600 * 1000 * 24 * 7)
      return d.toISOString()
    },
  },
  {
    label: '一月后',
    iso: () => {
      const d = new Date()
      d.setTime(d.getTime() + 3600 * 1000 * 24 * 30)
      return d.toISOString()
    },
  },
  {
    label: '一年后',
    iso: () => {
      const d = new Date()
      d.setTime(d.getTime() + 3600 * 1000 * 24 * 365)
      return d.toISOString()
    },
  },
])

// endregion

// region 登录对话框

type LoginDialogFormModel = {
  password: string
  remark: string
  expire_iso: string
}

const loginDialogVisible = ref<boolean>(false)
const loginDialogFormLoading = ref<number>(0)
const loginDialogFormModel = ref<LoginDialogFormModel>({
  password: '',
  remark: '',
  expire_iso: '',
})

const loginExpireError = ref<string>('')

function handleShowLoginDialog(): void {
  loginDialogFormModel.value.password = ''
  loginDialogFormModel.value.remark = ''
  loginDialogFormModel.value.expire_iso = defaultExpireIsoOneDay()
  loginExpireError.value = ''
  loginDialogVisible.value = true
}

async function handleLoginDialogConfirmButtonClicked(): Promise<void> {
  loginExpireError.value = ''
  if (!loginDialogFormModel.value.password) {
    notifyWarning('请输入密码')
    return
  }
  if (!loginDialogFormModel.value.remark.trim()) {
    notifyWarning('备注不能为空，请填写有意义的内容，以便于维护')
    return
  }
  const expireMs = loginDialogFormModel.value.expire_iso
    ? new Date(loginDialogFormModel.value.expire_iso).getTime()
    : NaN
  if (!loginDialogFormModel.value.expire_iso || Number.isNaN(expireMs)) {
    loginExpireError.value = '过期时间不能为空'
    return
  }
  if (expireMs <= Date.now()) {
    loginExpireError.value = '过期时间必须大于当前时间'
    return
  }
  loginDialogFormLoading.value += 1
  try {
    const res = await resolveResponse(
      staticLogin({
        account_key: { string_id: props.accountId },
        password: loginDialogFormModel.value.password,
        expire_date: expireMs,
        remark: loginDialogFormModel.value.remark,
        extra_params: {},
      }),
    )
    notifySuccess(`登录凭证成功，凭证ID为 ${res.login_state_key.string_id}`)
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
  remark: string
  expire_iso: string
}
const deriveDialogVisible = ref<boolean>(false)
const deriveDialogFormLoading = ref<number>(0)
const deriveDialogFormModel = ref<DeriveDialogFormModel>({
  token: '',
  remark: '',
  expire_iso: '',
})
const deriveExpireError = ref<string>('')

async function handleDeriveDialogConfirmButtonClicked(): Promise<void> {
  deriveExpireError.value = ''
  if (!deriveDialogFormModel.value.remark.trim()) {
    notifyWarning('备注不能为空，请填写有意义的内容，以便于维护')
    return
  }
  const expireMs = deriveDialogFormModel.value.expire_iso
    ? new Date(deriveDialogFormModel.value.expire_iso).getTime()
    : NaN
  if (!deriveDialogFormModel.value.expire_iso || Number.isNaN(expireMs)) {
    deriveExpireError.value = '过期时间不能为空'
    return
  }
  if (expireMs <= Date.now()) {
    deriveExpireError.value = '过期时间必须大于当前时间'
    return
  }
  deriveDialogFormLoading.value += 1
  try {
    await resolveResponse(
      staticDerive({
        login_state_key: { string_id: deriveDialogFormModel.value.token },
        expire_date: expireMs,
        remark: deriveDialogFormModel.value.remark,
      }),
    )
    notifySuccess(`登录凭证 ${deriveDialogFormModel.value.token} 派生成功`)
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
  position: relative;
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

.label {
  color: #606266;
  font-size: 14px;
}

.type-select {
  width: 110px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.table {
  min-height: 0;
}

.is-current-token {
  font-weight: bold;
}

.operate-actions {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.dialog-form {
  min-width: 280px;
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

.shortcut-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
</style>
