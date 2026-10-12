<template>
  <div class="pexp-panel-container">
    <placeholder-panel
      v-if="role === null"
      :text="t('views.element_plus_engineering.system_settings.please_select_role')"
    />
    <header-layout-panel v-else>
      <template v-slot:header>
        <div class="header-container">
          <el-button
            type="primary"
            :disabled="scopeId === ''"
            @click="handleShowPexpCreateMaintainDialog"
          >
            {{ t('views.element_plus_engineering.system_settings.create_permission_expression') }}
          </el-button>
          <el-button type="success" :disabled="scopeId === ''" @click="handlePexpSearch">
            {{ t('views.element_plus_engineering.system_settings.refresh_data') }}
          </el-button>
          <el-divider direction="vertical" />
          <permission-scope-indicator @onChanged="handlePermissionScopeIndicatorChanged" />
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesButtonDisabled"
            @click="handleApplyChanges"
          >
            {{ t('views.element_plus_engineering.system_settings.apply_changes') }}
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            class="icon-button"
            type="info"
            :disabled="scopeId === ''"
            @click="handleShowPermissionViewOfRoleInspectDialog"
          >
            {{ t('views.element_plus_engineering.system_settings.permission_view') }}
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
          <el-table-column
            prop="content"
            :label="t('views.element_plus_engineering.system_settings.expression')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="remark"
            :label="t('views.element_plus_engineering.system_settings.remark')"
            show-overflow-tooltip
          />
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
        :label="t('views.element_plus_engineering.system_settings.expression_id')"
        prop="pexp_string_id"
        v-if="pexpMaintainDialogMode === 'CREATE'"
      >
        <el-input
          v-model="pexpMaintainDialogItem.pexp_string_id"
          :placeholder="
            t('views.element_plus_engineering.system_settings.enter_when_creating_example_read')
          "
          @input="handlePexpStringIdInput"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.expression')"
        prop="content"
      >
        <el-input
          v-model="pexpMaintainDialogItem.content"
          :readonly="pexpMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.remark')"
        prop="remark"
      >
        <el-input
          v-model="pexpMaintainDialogItem.remark"
          :readonly="pexpMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
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

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import PermissionScopeIndicator from '@/views/nodes/elementPlusEngineering/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import PermissionViewOfRoleInspectDialog from '@/views/nodes/elementPlusEngineering/systemSettings/role/subDialogs/PermissionViewOfRoleInspectDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

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

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PexpPanel',
})

// region Props 定义

type Props = {
  role: Role | null
}

const props = defineProps<Props>()

// endregion

// region I18n 引入

const { t } = useI18n()

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
  showCreateDialog: showPexpCreateMaintainDialog,
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

function pexpStringIdValidator(
  _rule: FormItemRule,
  value: string,
  callback: (err?: Error) => void,
): void {
  if (!value || value === '') {
    callback(new Error(t('views.element_plus_engineering.system_settings.expression_id_required')))
    return
  }
  if (scopeId.value === '' || props.role === null) {
    callback(
      new Error(
        t('views.element_plus_engineering.system_settings.select_role_and_permission_scope_first'),
      ),
    )
    return
  }
  resolveResponse(pexpExists(scopeId.value, props.role.key.string_id, value))
    .then((existsResult) => {
      if (existsResult) {
        callback(
          new Error(
            t('views.element_plus_engineering.system_settings.expression_id_already_exists'),
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

const pexpMaintainDialogCreateRules = {
  pexp_string_id: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.expression_id_required'),
      trigger: 'blur',
    },
    { validator: pexpStringIdValidator, trigger: 'blur' },
  ],
  content: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.expression_required'),
      trigger: 'blur',
    },
  ],
}

const pexpMaintainDialogEditRules = {
  content: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.expression_required'),
      trigger: 'blur',
    },
  ],
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
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  try {
    await ElMessageBox.confirm(
      t(
        'views.element_plus_engineering.system_settings.create_permission_expression_confirmation',
      ) +
        t('views.element_plus_engineering.system_settings.permission_expression_validity_warning') +
        t('views.element_plus_engineering.system_settings.invalid_permission_expression_warning') +
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
  const influencedFlag = await checkInfluenced(props.role.key.string_id)
  if (influencedFlag) {
    try {
      await ElMessageBox.confirm(
        t(
          'views.element_plus_engineering.system_settings.adding_own_role_permission_expression_warning',
        ) +
          t(
            'views.element_plus_engineering.system_settings.logout_and_reassign_permissions_warning',
          ) +
          t('views.element_plus_engineering.system_settings.current_user_permission_loss_warning') +
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
  }
  pexpMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      createPexp({
        key: {
          scope_string_id: scopeIndicatorValue.value.key.string_id,
          role_string_id: props.role.key.string_id,
          pexp_string_id: item.pexp_string_id,
        },
        content: item.content,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permission_expression_created'),
      type: 'success',
    })
    pexpMaintainDialogVisible.value = false
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: t(
          'views.element_plus_engineering.system_settings.logout_after_adding_own_role_expression',
        ),
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
  if (props.role === null || scopeIndicatorValue.value === null) {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.system_settings.edit_permission_expression_confirmation') +
        t('views.element_plus_engineering.system_settings.permission_expression_validity_warning') +
        t('views.element_plus_engineering.system_settings.invalid_permission_expression_warning') +
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
  const influencedFlag = await checkInfluenced(props.role.key.string_id)
  if (influencedFlag) {
    try {
      await ElMessageBox.confirm(
        t(
          'views.element_plus_engineering.system_settings.editing_own_role_permission_expression_warning',
        ) +
          t(
            'views.element_plus_engineering.system_settings.logout_and_reassign_permissions_warning',
          ) +
          t('views.element_plus_engineering.system_settings.current_user_permission_loss_warning') +
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
  }
  pexpMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updatePexp({
        key: {
          scope_string_id: scopeIndicatorValue.value.key.string_id,
          role_string_id: props.role.key.string_id,
          pexp_string_id: item.pexp_string_id,
        },
        content: item.content,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permission_expression_updated'),
      type: 'success',
    })
    pexpMaintainDialogVisible.value = false
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: t(
          'views.element_plus_engineering.system_settings.logout_after_editing_own_role_expression',
        ),
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
      t(
        'views.element_plus_engineering.system_settings.delete_permission_expression_confirmation',
      ) +
        t(
          'views.element_plus_engineering.system_settings.delete_permission_expression_escalation_warning',
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
  const influencedFlag = await checkInfluenced(item.key.role_string_id)
  if (influencedFlag) {
    try {
      await ElMessageBox.confirm(
        t(
          'views.element_plus_engineering.system_settings.editing_own_role_permission_expression_warning',
        ) +
          t(
            'views.element_plus_engineering.system_settings.logout_and_reassign_permissions_warning',
          ) +
          t('views.element_plus_engineering.system_settings.current_user_permission_loss_warning') +
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
      message: t('views.element_plus_engineering.system_settings.permission_expression_deleted'),
      type: 'success',
    })
    if (influencedFlag) {
      ElMessage({
        showClose: true,
        message: t(
          'views.element_plus_engineering.system_settings.logout_after_deleting_own_role_expression',
        ),
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

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}
</style>
