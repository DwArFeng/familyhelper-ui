<template>
  <div class="permission-group-container">
    <root-border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      west-width="350px"
      :header-visible="true"
      :west-visible="true"
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
            @click="handleShowEntityCreateDialogParent"
          >
            {{ t('views.element_plus_engineering.system_settings.create_permission_group') }}
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowEntityCreateDialogChild"
          >
            {{ t('views.element_plus_engineering.system_settings.create_child_permission_group') }}
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowEntityEditDialog"
          >
            {{ t('views.element_plus_engineering.system_settings.edit_permission_group') }}
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowPermissionAttachDialog"
          >
            {{ t('views.element_plus_engineering.system_settings.attach_permission_nodes') }}
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="permissionToUnattach.length === 0"
            @click="handleUnattachPermission"
          >
            {{ t('views.element_plus_engineering.system_settings.detach_permission_nodes') }}
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
        </div>
      </template>
      <template v-slot:west>
        <permission-group-tree-panel
          v-if="scopeId !== ''"
          ref="permissionGroupTreePanelRef"
          :scope-id="scopeId"
          @onCurrentChanged="handleTreeCurrentChanged"
          @onItemDelete="handleTreeItemDelete"
        />
        <placeholder-panel
          v-else
          :text="t('views.element_plus_engineering.system_settings.please_select_permission_scope')"
        />
      </template>
      <template v-slot:default>
        <permission-panel
          ref="permissionPanelRef"
          :permission-group-key="permissionGroupKey"
          :scope-id="scopeId"
          @onSelectionChanged="handlePermissionPanelSelectionChanged"
        />
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="entityMaintainDialogVisible"
      label-width="120px"
      :create-title="t('views.element_plus_engineering.system_settings.create_permission_group')"
      :edit-title="t('views.element_plus_engineering.system_settings.edit_permission_group')"
      :loading="entityMaintainDialogLoading"
      :mode="entityMaintainDialogMode"
      :item="entityMaintainDialogItem"
      :create-rules="entityMaintainDialogCreateRules"
      :edit-rules="entityMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleEntityCreate"
      @onItemEdit="handleEntityEdit"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.permission_group_id')"
        prop="permission_group_string_id"
      >
        <el-input
          v-model="entityMaintainDialogItem.permission_group_string_id"
          :placeholder="
            t('views.element_plus_engineering.system_settings.required_nonempty_unique')
          "
          :readonly="entityMaintainDialogMode !== 'CREATE'"
          @input="handlePermissionGroupIdInput"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.system_settings.name')" prop="name">
        <el-input
          v-model="entityMaintainDialogItem.name"
          :placeholder="t('views.element_plus_engineering.system_settings.required')"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.system_settings.remark')"
        prop="remark"
      >
        <el-input v-model="entityMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
    <permission-attach-dialog
      v-model:visible="permissionAttachDialogVisible"
      :scope-id="scopeId"
      :current-group-key="permissionGroupKey"
      @onConfirmed="handlePermissionAttachConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import PermissionScopeIndicator from '@/views/nodes/elementPlusEngineering/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import PermissionGroupTreePanel from './subPanels/PermissionGroupTreePanel.vue'
import PermissionPanel from './subPanels/PermissionPanel.vue'
import PermissionAttachDialog from './subDialogs/PermissionAttachDialog.vue'

import { useIdentityGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { type PermissionGroupKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/key.ts'
import { type DispPermissionGroup } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permissionGroup.ts'
import {
  create as createPermissionGroup,
  update as updatePermissionGroup,
  remove as removePermissionGroup,
  getDisp,
  exists,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permissionGroup.ts'
import { type DispPermission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { update as updatePermission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { resetAnalysis } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/reset.ts'
import { type TreeNode } from '@/components/elementPlusEngineering/tree/commons/types.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PermissionGroup',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 类型定义

type PermissionGroupTreeItem = DispPermissionGroup & { tree_node_key: string }

type EntityMaintainDialogItem = {
  permission_group_string_id: string
  parent_permission_group_string_id: string
  name: string
  remark: string
}

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 作用域
const scopeIndicatorValue = ref<Scope | null>(null)

const scopeId = computed<string>(() => {
  return scopeIndicatorValue.value === null ? '' : scopeIndicatorValue.value.key.string_id
})

watch(
  () => scopeIndicatorValue.value,
  () => {
    treeCurrentItem.value = null
    treeCurrentNode.value = null
    permissionToUnattach.value = []
    entityMaintainDialogVisible.value = false
    permissionAttachDialogVisible.value = false
  },
)

function handlePermissionScopeIndicatorChanged(value: Scope | null): void {
  scopeIndicatorValue.value = value
}

// endregion

// region 树当前项

const treeCurrentItem = ref<PermissionGroupTreeItem | null>(null)
const treeCurrentNode = ref<TreeNode<PermissionGroupTreeItem> | null>(null)

const permissionGroupKey = computed<PermissionGroupKey | null>(() => {
  if (treeCurrentItem.value === null) {
    return null
  }
  return treeCurrentItem.value.key
})

const permissionGroupTreePanelRef = useTemplateRef<
  ComponentExposed<typeof PermissionGroupTreePanel>
>('permissionGroupTreePanelRef')
const permissionPanelRef =
  useTemplateRef<ComponentExposed<typeof PermissionPanel>>('permissionPanelRef')

function handleTreeCurrentChanged(
  item: PermissionGroupTreeItem | null,
  node: TreeNode<PermissionGroupTreeItem> | null,
): void {
  treeCurrentItem.value = item
  treeCurrentNode.value = node
}

function handleTreeItemDelete(item: PermissionGroupTreeItem): void {
  handleEntityDelete(item)
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

// region 取消关联

const permissionToUnattach = ref<DispPermission[]>([])

function handlePermissionPanelSelectionChanged(selection: DispPermission[]): void {
  permissionToUnattach.value = selection
}

// endregion

// region MaintainDialog

const INITIAL_ENTITY_ITEM: EntityMaintainDialogItem = {
  permission_group_string_id: '',
  parent_permission_group_string_id: '',
  name: '',
  remark: '',
}

const {
  visible: entityMaintainDialogVisible,
  item: entityMaintainDialogItem,
  mode: entityMaintainDialogMode,
  showCreateDialog: showEntityCreateDialog,
  showEditDialog: showEntityEditDialog,
} = useIdentityGeneralMaintainDialog<EntityMaintainDialogItem>({ ...INITIAL_ENTITY_ITEM })

const entityMaintainDialogLoading = ref<number>(0)

function handlePermissionGroupIdInput(e: Event): void {
  const t = e.target as HTMLInputElement
  if (t) {
    entityMaintainDialogItem.value.permission_group_string_id = t.value.toLowerCase()
  }
}

function keyValidator(_rule: FormItemRule, value: string, callback: (err?: Error) => void): void {
  if (!value || value === '') {
    callback(
      new Error(t('views.element_plus_engineering.system_settings.permission_group_id_required')),
    )
    return
  }
  if (value === 'root') {
    callback(
      new Error(
        t('views.element_plus_engineering.system_settings.permission_group_id_cannot_be_root'),
      ),
    )
    return
  }
  if (scopeId.value === '') {
    callback(
      new Error(t('views.element_plus_engineering.system_settings.select_permission_scope_first')),
    )
    return
  }
  resolveResponse(exists(scopeId.value, value))
    .then((existsResult) => {
      if (existsResult) {
        callback(
          new Error(
            t('views.element_plus_engineering.system_settings.permission_group_id_already_exists'),
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

const entityMaintainDialogCreateRules = {
  permission_group_string_id: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.permission_group_id_required'),
      trigger: 'blur',
    },
    { validator: keyValidator, trigger: 'blur' },
  ],
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.name_required'),
      trigger: 'blur',
    },
  ],
}

const entityMaintainDialogEditRules = {
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.system_settings.name_required'),
      trigger: 'blur',
    },
  ],
}

const appendChild = ref<boolean>(false)

function handleShowEntityCreateDialogParent(): void {
  appendChild.value = false
  if (treeCurrentItem.value === null) {
    entityMaintainDialogItem.value.parent_permission_group_string_id = ''
  } else if (treeCurrentItem.value.root_flag) {
    entityMaintainDialogItem.value.parent_permission_group_string_id = ''
  } else if (treeCurrentItem.value.parent !== null) {
    entityMaintainDialogItem.value.parent_permission_group_string_id =
      treeCurrentItem.value.parent.key.permission_group_string_id
  } else {
    entityMaintainDialogItem.value.parent_permission_group_string_id = ''
  }
  showEntityCreateDialog()
}

function handleShowEntityCreateDialogChild(): void {
  appendChild.value = true
  if (treeCurrentItem.value === null) {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  entityMaintainDialogItem.value.parent_permission_group_string_id =
    treeCurrentItem.value.key.permission_group_string_id
  showEntityCreateDialog()
}

async function handleEntityCreate(item: EntityMaintainDialogItem): Promise<void> {
  entityMaintainDialogLoading.value += 1
  try {
    const scope = scopeIndicatorValue.value
    if (!scope) {
      throw new Error(
        t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
      )
    }
    const treePanel = permissionGroupTreePanelRef.value
    if (!treePanel) {
      throw new Error(
        t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
      )
    }
    const parentKey = item.parent_permission_group_string_id
      ? {
          scope_string_id: scopeId.value,
          permission_group_string_id: item.parent_permission_group_string_id,
        }
      : null
    const createInfo = {
      key: {
        scope_string_id: scopeId.value,
        permission_group_string_id: item.permission_group_string_id,
      },
      parent_key: parentKey,
      name: item.name,
      remark: item.remark,
    }
    const result = await resolveResponse(createPermissionGroup(createInfo))
    const disp = await resolveResponse(
      getDisp(result.key.scope_string_id, result.key.permission_group_string_id),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permission_group_created', {
        groupName: item.name,
      }),
      type: 'success',
    })
    if (!parentKey) {
      treePanel.appendRootPermissionGroup(disp)
    } else {
      const node = treeCurrentNode.value
      if (!node) {
        throw new Error(
          t(
            'views.element_plus_engineering.system_settings.unexpected_execution_contact_developer',
          ),
        )
      }
      if (appendChild.value) {
        treePanel.appendPermissionGroup(node, disp)
      } else {
        treePanel.insertAfterPermissionGroup(node, disp)
      }
    }
    entityMaintainDialogVisible.value = false
  } finally {
    entityMaintainDialogLoading.value -= 1
  }
}

function syncAnchorEntityFromTreeItem(item: PermissionGroupTreeItem): void {
  entityMaintainDialogItem.value = {
    permission_group_string_id: item.key.permission_group_string_id,
    parent_permission_group_string_id: item.parent
      ? item.parent.key.permission_group_string_id
      : '',
    name: item.name,
    remark: item.remark,
  }
}

function handleShowEntityEditDialog(): void {
  if (treeCurrentItem.value === null) {
    return
  }
  syncAnchorEntityFromTreeItem(treeCurrentItem.value)
  showEntityEditDialog(entityMaintainDialogItem.value)
}

function computeParentKeyForEdit(item: EntityMaintainDialogItem): PermissionGroupKey | null {
  const pid = item.parent_permission_group_string_id
  if (!pid || pid === '') {
    return null
  }
  return {
    scope_string_id: scopeId.value,
    permission_group_string_id: pid,
  }
}

async function handleEntityEdit(item: EntityMaintainDialogItem): Promise<void> {
  entityMaintainDialogLoading.value += 1
  try {
    const scope = scopeIndicatorValue.value
    if (!scope) {
      throw new Error(
        t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
      )
    }
    const treePanel = permissionGroupTreePanelRef.value
    if (!treePanel) {
      throw new Error(
        t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
      )
    }
    const parentKey = computeParentKeyForEdit(item)
    await resolveResponse(
      updatePermissionGroup({
        key: {
          scope_string_id: scopeId.value,
          permission_group_string_id: item.permission_group_string_id,
        },
        parent_key: parentKey,
        name: item.name,
        remark: item.remark,
      }),
    )
    const disp = await resolveResponse(getDisp(scopeId.value, item.permission_group_string_id))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permission_group_updated', {
        groupName: item.name,
      }),
      type: 'success',
    })
    treePanel.updatePermissionGroup(disp)
    entityMaintainDialogVisible.value = false
  } finally {
    entityMaintainDialogLoading.value -= 1
  }
}

async function handleEntityDelete(item: PermissionGroupTreeItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.system_settings.delete_permission_group_confirmation'),
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
    await resolveResponse(
      removePermissionGroup({
        key: item.key,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permission_group_deleted', {
        groupName: item.name,
      }),
      type: 'success',
    })
    const treePanel = permissionGroupTreePanelRef.value
    if (!treePanel) {
      throw new Error(
        t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
      )
    }
    treePanel.removePermissionGroup(item)
    treeCurrentItem.value = null
    treeCurrentNode.value = null
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 关联权限

const permissionAttachDialogVisible = ref<boolean>(false)

function handleShowPermissionAttachDialog(): void {
  permissionAttachDialogVisible.value = true
}

async function handlePermissionAttachConfirmed(permissions: DispPermission[]): Promise<void> {
  if (treeCurrentItem.value === null) {
    return
  }
  loading.value += 1
  try {
    const groupKey = treeCurrentItem.value.key
    const promises = permissions.map((p) =>
      resolveResponse(
        updatePermission({
          key: p.key,
          group_key: groupKey,
          name: p.name,
          remark: p.remark,
          level: p.level,
        }),
      ),
    )
    await Promise.all(promises)
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permissions_attached', {
        permissionCount: permissions.length,
      }),
      type: 'success',
    })
    permissionPanelRef.value?.refresh()
  } finally {
    loading.value -= 1
  }
}

async function handleUnattachPermission(): Promise<void> {
  if (permissionToUnattach.value.length === 0) {
    return
  }
  loading.value += 1
  try {
    const promises = permissionToUnattach.value.map((p) =>
      resolveResponse(
        updatePermission({
          key: p.key,
          group_key: null,
          name: p.name,
          remark: p.remark,
          level: p.level,
        }),
      ),
    )
    await Promise.all(promises)
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.permissions_detached', {
        permissionCount: permissionToUnattach.value.length,
      }),
      type: 'success',
    })
    permissionPanelRef.value?.refresh()
  } finally {
    loading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.permission-group-container {
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
</style>
