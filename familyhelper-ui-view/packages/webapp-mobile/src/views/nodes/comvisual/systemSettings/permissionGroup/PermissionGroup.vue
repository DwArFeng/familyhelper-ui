<template>
  <div class="permission-group-container">
    <loading-overlay :loading="loading > 0" />
    <border-layout-panel
      class="border-layout-panel"
      west-width="350px"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
          <native-button
            kind="primary"
            :disabled="scopeIndicatorValue === null"
            @click="handleShowEntityCreateDialogParent"
          >
            新建权限组
          </native-button>
          <native-button
            kind="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowEntityCreateDialogChild"
          >
            新建子权限组
          </native-button>
          <span class="header-sep" aria-hidden="true" />
          <native-button
            kind="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowEntityEditDialog"
          >
            编辑权限组
          </native-button>
          <native-button
            kind="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowPermissionAttachDialog"
          >
            关联权限节点
          </native-button>
          <native-button
            kind="primary"
            :disabled="permissionToUnattach.length === 0"
            @click="handleUnattachPermission"
          >
            取消关联权限节点
          </native-button>
          <span class="header-sep" aria-hidden="true" />
          <permission-scope-indicator @on-changed="handlePermissionScopeIndicatorChanged" />
          <span class="header-sep" aria-hidden="true" />
          <native-button
            kind="primary"
            :disabled="applyChangesButtonDisabled"
            @click="handleApplyChanges"
          >
            应用变更
          </native-button>
        </div>
      </template>
      <template v-slot:west>
        <permission-group-tree-panel
          v-if="scopeId !== ''"
          ref="permissionGroupTreePanelRef"
          :scope-id="scopeId"
          @on-current-changed="handleTreeCurrentChanged"
          @on-item-delete="handleTreeItemDelete"
        />
        <placeholder-panel v-else text="请选择权限作用域" />
      </template>
      <template v-slot:default>
        <permission-panel
          ref="permissionPanelRef"
          :permission-group-key="permissionGroupKey"
          :scope-id="scopeId"
          @on-selection-changed="handlePermissionPanelSelectionChanged"
        />
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="entityMaintainDialogVisible"
      label-width="120px"
      create-title="创建权限组"
      edit-title="编辑权限组"
      :loading="entityMaintainDialogLoading"
      :mode="entityMaintainDialogMode"
      :item="entityMaintainDialogItem"
      :close-on-click-modal="false"
      @on-item-create="handleEntityCreate"
      @on-item-edit="handleEntityEdit"
    >
      <native-form-item label="权限组ID">
        <input
          v-model="entityMaintainDialogItem.permission_group_string_id"
          class="form-input"
          type="text"
          placeholder="必填，非空，不能重复"
          :readonly="entityMaintainDialogMode !== 'CREATE'"
          @input="handlePermissionGroupIdInput"
        />
      </native-form-item>
      <native-form-item label="名称">
        <input
          v-model="entityMaintainDialogItem.name"
          class="form-input"
          type="text"
          placeholder="必填"
        />
      </native-form-item>
      <native-form-item label="备注">
        <input v-model="entityMaintainDialogItem.remark" class="form-input" type="text" />
      </native-form-item>
    </maintain-dialog>
    <permission-attach-dialog
      v-model:visible="permissionAttachDialogVisible"
      :scope-id="scopeId"
      :current-group-key="permissionGroupKey"
      @on-confirmed="handlePermissionAttachConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'

import { useIdentityGeneralMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import PermissionScopeIndicator from '@/views/nodes/comvisual/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import PermissionAttachDialog from '@/views/nodes/comvisual/systemSettings/permissionGroup/subDialogs/PermissionAttachDialog.vue'
import PermissionGroupTreePanel from '@/views/nodes/comvisual/systemSettings/permissionGroup/subPanels/PermissionGroupTreePanel.vue'
import PermissionPanel from '@/views/nodes/comvisual/systemSettings/permissionGroup/subPanels/PermissionPanel.vue'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

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
import { type TreeNode } from '@/components/comvisual/tree/commons/types.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionGroup',
})

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
    const treePanel = permissionGroupTreePanelRef.value
    if (treePanel) {
      treePanel.refresh()
    }
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
    notifySuccess('变更应用成功！后台状态刷新中，请不要频繁点击')
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

const appendChild = ref<boolean>(false)

function handleShowEntityCreateDialogParent(): void {
  appendChild.value = false
  entityMaintainDialogItem.value = { ...INITIAL_ENTITY_ITEM }
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
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  entityMaintainDialogItem.value = {
    ...INITIAL_ENTITY_ITEM,
    parent_permission_group_string_id: treeCurrentItem.value.key.permission_group_string_id,
  }
  showEntityCreateDialog()
}

async function handleEntityCreate(item: EntityMaintainDialogItem): Promise<void> {
  if (!item.permission_group_string_id.trim()) {
    notifyWarning('权限组ID不能为空')
    return
  }
  if (item.permission_group_string_id === 'root') {
    notifyWarning('权限组ID不能取名为 root')
    return
  }
  if (!item.name.trim()) {
    notifyWarning('权限组名称不能为空')
    return
  }
  const existsResult = await resolveResponse(exists(scopeId.value, item.permission_group_string_id))
  if (existsResult) {
    notifyWarning('权限组ID已经存在')
    return
  }
  entityMaintainDialogLoading.value += 1
  try {
    const scope = scopeIndicatorValue.value
    if (!scope) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const treePanel = permissionGroupTreePanelRef.value
    if (!treePanel) {
      throw new Error('不应该执行到此处，请联系开发人员')
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
    notifySuccess(`权限组 ${item.name} 创建成功`)
    if (!parentKey) {
      treePanel.appendRootPermissionGroup(disp)
    } else {
      const node = treeCurrentNode.value
      if (!node) {
        throw new Error('不应该执行到此处，请联系开发人员')
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
  if (!item.name.trim()) {
    notifyWarning('权限组名称不能为空')
    return
  }
  entityMaintainDialogLoading.value += 1
  try {
    const scope = scopeIndicatorValue.value
    if (!scope) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const treePanel = permissionGroupTreePanelRef.value
    if (!treePanel) {
      throw new Error('不应该执行到此处，请联系开发人员')
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
    notifySuccess(`权限组 ${item.name} 更新成功`)
    treePanel.updatePermissionGroup(disp)
    entityMaintainDialogVisible.value = false
  } finally {
    entityMaintainDialogLoading.value -= 1
  }
}

async function handleEntityDelete(item: PermissionGroupTreeItem): Promise<void> {
  if (!window.confirm('此操作将永久删除此权限组，以及其子权限组。\n此操作不可恢复。\n是否继续?')) {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      removePermissionGroup({
        key: item.key,
      }),
    )
    notifySuccess(`权限组 ${item.name} 删除成功`)
    const treePanel = permissionGroupTreePanelRef.value
    if (!treePanel) {
      throw new Error('不应该执行到此处，请联系开发人员')
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
    notifySuccess(`成功添加 ${permissions.length} 个权限的关联`)
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
    notifySuccess(`成功解除 ${permissionToUnattach.value.length} 个权限的关联`)
    permissionPanelRef.value?.refresh()
  } finally {
    loading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.permission-group-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.border-layout-panel {
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  row-gap: 5px;
}

.header-sep {
  display: inline-block;
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: #dcdfe6;
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
</style>
