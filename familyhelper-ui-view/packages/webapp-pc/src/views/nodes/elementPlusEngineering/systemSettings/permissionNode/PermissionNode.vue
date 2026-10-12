<template>
  <div class="permission-node-container">
    <root-border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null"
            @click="handleShowPermissionCreateDialog"
          >
            {{ t('views.element_plus_engineering.system_settings.create_permission') }}
          </el-button>
          <el-button
            class="header-button"
            type="success"
            :disabled="scopeIndicatorValue === null"
            @click="handleSearch"
          >
            {{ t('views.element_plus_engineering.system_settings.refresh_data') }}
          </el-button>
          <el-divider direction="vertical" />
          <permission-scope-indicator @onChanged="handlePermissionScopeIndicatorChanged" />
          <el-divider direction="vertical" />
          <el-input
            class="id-search-bar"
            v-model="idSearchBarValue"
            clearable
            :disabled="scopeIndicatorValue === null"
            @keydown.enter="handleSearch"
            @clear="handleSearch"
          >
            <template v-slot:prepend>
              <span>{{ t('views.element_plus_engineering.system_settings.permission_node') }}</span>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleSearch" />
            </template>
          </el-input>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesButtonDisabled"
            @click="handleApplyChanges"
          >
            {{ t('views.element_plus_engineering.system_settings.apply_changes') }}
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <placeholder-panel
          v-if="scopeId === ''"
          :text="t('views.element_plus_engineering.system_settings.please_select_permission_scope')"
        />
        <table-panel
          v-else
          class="table"
          v-model:current-page="permissionTableCurrentPage"
          v-model:page-size="permissionTablePageSize"
          :item-count="permissionTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="permissionTableItems"
          :operate-column-width="156"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
          @onItemDelete="handlePermissionDelete"
        >
          <template v-slot:default>
            <el-table-column
              prop="key.permission_string_id"
              :label="t('views.element_plus_engineering.system_settings.permission_node')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="group_key.permission_group_string_id"
              :label="t('views.element_plus_engineering.system_settings.permission_group')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="name"
              :label="t('views.element_plus_engineering.system_settings.name')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="level"
              :label="t('views.element_plus_engineering.system_settings.level')"
              align="right"
              width="85"
              show-overflow-tooltip
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
                type="success"
                :icon="SearchIcon"
                :title="t('views.element_plus_engineering.system_settings.inspect')"
                @click="handleShowPermissionInspectDialog(row as Permission)"
              />
              <el-button
                class="table-button"
                type="info"
                :icon="ViewIcon"
                :title="t('views.element_plus_engineering.system_settings.inspect_user_view')"
                @click="handleShowUserViewOfPermissionInspectDialog(row as Permission)"
              />
              <el-button
                class="table-button"
                type="primary"
                :icon="EditPen"
                :title="t('views.element_plus_engineering.system_settings.edit')"
                @click="handleShowPermissionEditDialog(row as Permission)"
              />
              <el-button
                class="table-button"
                type="danger"
                :icon="DeleteIcon"
                :title="t('views.element_plus_engineering.system_settings.delete')"
                @click="handlePermissionDelete(row as Permission)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row as Permission, close)">
                {{ t('views.element_plus_engineering.system_settings.copy_primary_key') }}
              </li>
              <el-divider />
              <li @click="handleInspectContextmenuClicked(row as Permission, close)">
                {{ t('views.element_plus_engineering.system_settings.inspect_ellipsis') }}
              </li>
              <li @click="handleUserViewInspectContextmenuClicked(row as Permission, close)">
                {{ t('views.element_plus_engineering.system_settings.inspect_user_view_ellipsis') }}
              </li>
              <li @click="handleEditContextmenuClicked(row as Permission, close)">
                {{ t('views.element_plus_engineering.system_settings.edit_ellipsis') }}
              </li>
              <li @click="handleDeleteContextmenuClicked(row as Permission, close)">
                {{ t('views.element_plus_engineering.system_settings.delete_ellipsis') }}
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="permissionMaintainDialogVisible"
      label-width="120px"
      :create-title="t('views.element_plus_engineering.system_settings.create_permission')"
      :edit-title="t('views.element_plus_engineering.system_settings.edit_permission')"
      :inspect-title="t('views.element_plus_engineering.system_settings.inspect_permission')"
      :loading="permissionMaintainDialogLoading"
      :mode="permissionMaintainDialogMode"
      :item="permissionMaintainDialogItem"
      :create-rules="permissionMaintainDialogCreateRules"
      :edit-rules="permissionMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePermissionCreate"
      @onItemEdit="handlePermissionEdit"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.permission_node')"
        prop="permission_string_id"
      >
        <el-input
          v-model="permissionMaintainDialogItem.permission_string_id"
          :placeholder="
            t('views.element_plus_engineering.system_settings.required_nonempty_unique')
          "
          :readonly="permissionMaintainDialogMode !== 'CREATE'"
          @input="handlePermissionStringIdInput"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.permission_group_id')"
        prop="group_key_string_id"
      >
        <el-input
          v-model="permissionMaintainDialogItem.group_key_string_id"
          :placeholder="t('views.element_plus_engineering.system_settings.optional')"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.system_settings.name')" prop="name">
        <el-input
          v-model="permissionMaintainDialogItem.name"
          :placeholder="t('views.element_plus_engineering.system_settings.required')"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.system_settings.level')" prop="level">
        <el-input-number
          class="form-input-number"
          v-model="permissionMaintainDialogItem.level"
          :min="0"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.remark')"
        prop="remark"
      >
        <el-input
          v-model="permissionMaintainDialogItem.remark"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <user-view-of-permission-inspect-dialog
      v-model:visible="userViewOfPermissionInspectDialogVisible"
      :permission="userViewOfPermissionInspectDialogPermission"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  Search as SearchIcon,
  View as ViewIcon,
  EditPen,
  Delete as DeleteIcon,
} from '@element-plus/icons-vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import PermissionScopeIndicator from '@/views/nodes/elementPlusEngineering/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import UserViewOfPermissionInspectDialog from './subDialogs/UserViewOfPermissionInspectDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import {
  create as createPermission,
  update as updatePermission,
  remove as removePermission,
  exists as permissionExists,
  childForScopeDisp,
  childForScopePermissionStringIdLike,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { exists as permissionGroupExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permissionGroup.ts'
import { resetAnalysis } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/reset.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PermissionNode',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 类型定义

type PermissionMaintainDialogItem = {
  permission_string_id: string
  group_key_string_id: string
  name: string
  remark: string
  level: number
}

// endregion

// region 加载逻辑

const loading = ref<number>(0)

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

// region 搜索逻辑

function handleSearch(): void {
  if (scopeId.value === '') {
    return
  }
  loading.value += 1
  const pattern = idSearchBarValue.value.trim()
  const lookupHandler =
    pattern === ''
      ? (p: { page: number; rows: number }) => childForScopeDisp({ string_id: scopeId.value }, p)
      : (p: { page: number; rows: number }) =>
          childForScopePermissionStringIdLike({ string_id: scopeId.value }, pattern, p)
  lookupWithAdjustPage(lookupHandler, permissionTablePagingInfo.value)
    .then(updatePermissionTableByLookup)
    .finally(() => {
      loading.value -= 1
    })
}

onMounted(() => {
  if (scopeId.value !== '') {
    handleSearch()
  }
})

// endregion

// region 作用域

const scopeIndicatorValue = ref<Scope | null>(null)

const scopeId = computed<string>(() => {
  return scopeIndicatorValue.value === null ? '' : scopeIndicatorValue.value.key.string_id
})

function handlePermissionScopeIndicatorChanged(value: Scope | null): void {
  scopeIndicatorValue.value = value
}

watch(
  () => scopeIndicatorValue.value,
  (newVal) => {
    permissionMaintainDialogVisible.value = false
    if (newVal !== null) {
      handleSearch()
    }
  },
)

// endregion

// region 搜索栏

const idSearchBarValue = ref<string>('')

// endregion

// region 表格逻辑

const {
  currentPage: permissionTableCurrentPage,
  pageSize: permissionTablePageSize,
  itemCount: permissionTableItemCount,
  items: permissionTableItems,
  pagingInfo: permissionTablePagingInfo,
  updateByLookup: updatePermissionTableByLookup,
} = useIdentityBackendPagingTablePanel<Permission>(15)

function handlePagingAttributeChanged(): void {
  handleSearch()
}

async function handlePermissionDelete(item: Permission): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.system_settings.delete_permission_node_confirmation') +
        t(
          'views.element_plus_engineering.system_settings.delete_permission_node_unknown_consequences_warning',
        ) +
        t('views.element_plus_engineering.system_settings.dangerous_operation_confirmation'),
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
    await resolveResponse(removePermission({ key: item.key }))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permission_node_deleted', {
        permissionId: item.key.permission_string_id,
      }),
      type: 'success',
    })
    handleSearch()
  } finally {
    loading.value -= 1
  }
}

async function handleCopyKeyContextmenuClicked(row: Permission, close: () => void): Promise<void> {
  const keyStr = `${row.key.scope_string_id}&${row.key.permission_string_id}`
  await navigator.clipboard.writeText(keyStr)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.system_settings.copy_succeeded'),
    type: 'success',
  })
  close()
}

function handleInspectContextmenuClicked(row: Permission, close: () => void): void {
  close()
  handleShowPermissionInspectDialog(row)
}

function handleUserViewInspectContextmenuClicked(row: Permission, close: () => void): void {
  close()
  handleShowUserViewOfPermissionInspectDialog(row)
}

const userViewOfPermissionInspectDialogVisible = ref<boolean>(false)
const userViewOfPermissionInspectDialogPermission = ref<Permission | null>(null)

function handleShowUserViewOfPermissionInspectDialog(item: Permission): void {
  userViewOfPermissionInspectDialogPermission.value = item
  userViewOfPermissionInspectDialogVisible.value = true
}

function handleEditContextmenuClicked(row: Permission, close: () => void): void {
  close()
  handleShowPermissionEditDialog(row)
}

function handleDeleteContextmenuClicked(row: Permission, close: () => void): void {
  close()
  handlePermissionDelete(row)
}

// endregion

// region 维护对话框

const INITIAL_PERMISSION_MAINTAIN_DIALOG_ITEM: PermissionMaintainDialogItem = {
  permission_string_id: '',
  group_key_string_id: '',
  name: '',
  remark: '',
  level: 0,
}

function permissionMaintainDialogItemMap(t: Permission): PermissionMaintainDialogItem {
  return {
    permission_string_id: t.key.permission_string_id,
    group_key_string_id: t.group_key?.permission_group_string_id ?? '',
    name: t.name,
    remark: t.remark,
    level: t.level,
  }
}

const {
  visible: permissionMaintainDialogVisible,
  item: permissionMaintainDialogItem,
  mode: permissionMaintainDialogMode,
  showCreateDialog: showPermissionCreateMaintainDialog,
  showEditDialog: showPermissionEditMaintainDialog,
  showInspectDialog: showPermissionInspectMaintainDialog,
} = useGeneralMaintainDialog<Permission, PermissionMaintainDialogItem>(
  permissionMaintainDialogItemMap,
  { ...INITIAL_PERMISSION_MAINTAIN_DIALOG_ITEM },
)

const permissionMaintainDialogLoading = ref<number>(0)

function handlePermissionStringIdInput(e: Event): void {
  const t = e.target as HTMLInputElement
  if (t) {
    permissionMaintainDialogItem.value.permission_string_id = t.value.toLowerCase()
  }
}

function permissionStringIdValidator(
  _rule: FormItemRule,
  value: string,
  callback: (err?: Error) => void,
): void {
  if (!value || value === '') {
    callback(
      new Error(t('views.element_plus_engineering.system_settings.permission_node_required')),
    )
    return
  }
  if (scopeId.value === '') {
    callback(
      new Error(t('views.element_plus_engineering.system_settings.select_permission_scope_first')),
    )
    return
  }
  resolveResponse(permissionExists(scopeId.value, value))
    .then((existsResult) => {
      if (existsResult) {
        callback(
          new Error(
            t('views.element_plus_engineering.system_settings.permission_node_already_exists'),
          ),
        )
      } else {
        callback()
      }
    })
    .catch(() => {
      callback(new Error(t('views.element_plus_engineering.system_settings.validation_failed')))
    })
}

function permissionGroupStringIdValidator(
  _rule: FormItemRule,
  value: string,
  callback: (err?: Error) => void,
): void {
  if (!value || value === '') {
    callback()
    return
  }
  if (scopeId.value === '') {
    callback(
      new Error(t('views.element_plus_engineering.system_settings.select_permission_scope_first')),
    )
    return
  }
  resolveResponse(permissionGroupExists(scopeId.value, value))
    .then((existsResult) => {
      if (!existsResult) {
        callback(
          new Error(t('views.element_plus_engineering.system_settings.permission_group_not_found')),
        )
      } else {
        callback()
      }
    })
    .catch(() => {
      callback(new Error(t('views.element_plus_engineering.system_settings.validation_failed')))
    })
}

const permissionMaintainDialogCreateRules = {
  permission_string_id: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.permission_node_required'),
      trigger: 'blur',
    },
    { validator: permissionStringIdValidator, trigger: 'blur' },
  ],
  group_key_string_id: [{ validator: permissionGroupStringIdValidator, trigger: 'blur' }],
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.permission_name_required'),
      trigger: 'blur',
    },
  ],
}

const permissionMaintainDialogEditRules = {
  group_key_string_id: [{ validator: permissionGroupStringIdValidator, trigger: 'blur' }],
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.permission_name_required'),
      trigger: 'blur',
    },
  ],
}

function handleShowPermissionCreateDialog(): void {
  showPermissionCreateMaintainDialog()
}

function handleShowPermissionEditDialog(item: Permission): void {
  showPermissionEditMaintainDialog(item)
}

function handleShowPermissionInspectDialog(item: Permission): void {
  showPermissionInspectMaintainDialog(item)
}

async function handlePermissionCreate(item: PermissionMaintainDialogItem): Promise<void> {
  const scope = scopeIndicatorValue.value
  if (!scope) {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  permissionMaintainDialogLoading.value += 1
  try {
    const permissionStringId = item.permission_string_id.toLowerCase()
    const groupKey =
      item.group_key_string_id.trim() === ''
        ? null
        : {
            scope_string_id: scopeId.value,
            permission_group_string_id: item.group_key_string_id.trim(),
          }
    await resolveResponse(
      createPermission({
        key: {
          scope_string_id: scopeId.value,
          permission_string_id: permissionStringId,
        },
        group_key: groupKey,
        name: item.name,
        remark: item.remark,
        level: item.level,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permission_node_created', {
        permissionId: permissionStringId,
      }),
      type: 'success',
    })
    handleSearch()
    permissionMaintainDialogVisible.value = false
  } finally {
    permissionMaintainDialogLoading.value -= 1
  }
}

async function handlePermissionEdit(item: PermissionMaintainDialogItem): Promise<void> {
  const scope = scopeIndicatorValue.value
  if (!scope) {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  permissionMaintainDialogLoading.value += 1
  try {
    const groupKey =
      item.group_key_string_id.trim() === ''
        ? null
        : {
            scope_string_id: scopeId.value,
            permission_group_string_id: item.group_key_string_id.trim(),
          }
    await resolveResponse(
      updatePermission({
        key: {
          scope_string_id: scopeId.value,
          permission_string_id: item.permission_string_id,
        },
        group_key: groupKey,
        name: item.name,
        remark: item.remark,
        level: item.level,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permission_node_updated', {
        permissionId: item.permission_string_id,
      }),
      type: 'success',
    })
    handleSearch()
    permissionMaintainDialogVisible.value = false
  } finally {
    permissionMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.permission-node-container {
  height: 100%;
  width: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

.header-button {
  margin-right: 0;
}

.id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}

.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.form-input-number {
  width: 200px;
}
</style>
