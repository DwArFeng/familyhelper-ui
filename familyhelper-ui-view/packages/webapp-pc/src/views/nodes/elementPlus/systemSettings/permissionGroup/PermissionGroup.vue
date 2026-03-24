<template>
  <div class="permission-group-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      west-width="350px"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null"
            @click="handleShowEntityCreateDialogParent"
          >
            新建权限组
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowEntityCreateDialogChild"
          >
            新建子权限组
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowEntityEditDialog"
          >
            编辑权限组
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null || treeCurrentItem === null"
            @click="handleShowPermissionAttachDialog"
          >
            关联权限节点
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="permissionToUnattach.length === 0"
            @click="handleUnattachPermission"
          >
            取消关联权限节点
          </el-button>
          <el-divider direction="vertical" />
          <permission-scope-indicator @onChanged="handlePermissionScopeIndicatorChanged" />
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
      <template v-slot:west>
        <permission-group-tree-panel
          v-if="scopeId !== ''"
          ref="permissionGroupTreePanelRef"
          :scope-id="scopeId"
          @onCurrentChanged="handleTreeCurrentChanged"
          @onItemDelete="handleTreeItemDelete"
        />
        <placeholder-panel v-else text="请选择权限作用域" />
      </template>
      <template v-slot:default>
        <permission-panel
          ref="permissionPanelRef"
          :permission-group-key="permissionGroupKey"
          :scope-id="scopeId"
          @onSelectionChanged="handlePermissionPanelSelectionChanged"
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
      :create-rules="entityMaintainDialogCreateRules"
      :edit-rules="entityMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleEntityCreate"
      @onItemEdit="handleEntityEdit"
    >
      <el-form-item label="权限组ID" prop="permission_group_string_id">
        <el-input
          v-model="entityMaintainDialogItem.permission_group_string_id"
          placeholder="必填，非空，不能重复"
          :readonly="entityMaintainDialogMode !== 'CREATE'"
          @input="handlePermissionGroupIdInput"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="entityMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
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
import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import PermissionScopeIndicator from '@/views/nodes/elementPlus/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import PermissionGroupTreePanel from './subPanels/PermissionGroupTreePanel.vue'
import PermissionPanel from './subPanels/PermissionPanel.vue'
import PermissionAttachDialog from './subDialogs/PermissionAttachDialog.vue'

import { useIdentityGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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
import { type TreeNode } from '@/components/elementPlus/tree/commons/types.ts'
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
    callback(new Error('权限组ID不能为空'))
    return
  }
  if (value === 'root') {
    callback(new Error('权限组ID不能取名为root'))
    return
  }
  if (scopeId.value === '') {
    callback(new Error('请先选择权限作用域'))
    return
  }
  resolveResponse(exists(scopeId.value, value))
    .then((existsResult) => {
      if (existsResult) {
        callback(new Error('权限组ID已经存在'))
      } else {
        callback()
      }
    })
    .catch(() => {
      callback(new Error('校验失败'))
    })
}

const entityMaintainDialogCreateRules = {
  permission_group_string_id: [
    { required: true, message: '权限组ID不能为空', trigger: 'blur' },
    { validator: keyValidator, trigger: 'blur' },
  ],
  name: [{ required: true, message: '权限组名称不能为空', trigger: 'blur' }],
}

const entityMaintainDialogEditRules = {
  name: [{ required: true, message: '权限组名称不能为空', trigger: 'blur' }],
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
    throw new Error('不应该执行到此处，请联系开发人员')
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
    ElMessage({
      showClose: true,
      message: `权限组 ${item.name} 创建成功`,
      type: 'success',
    })
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
    ElMessage({
      showClose: true,
      message: `权限组 ${item.name} 更新成功`,
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
      '此操作将永久删除此权限组，以及其子权限组。<br><b>此操作不可恢复</b><br>是否继续?',
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
    await resolveResponse(
      removePermissionGroup({
        key: item.key,
      }),
    )
    ElMessage({
      showClose: true,
      message: `权限组 ${item.name} 删除成功`,
      type: 'success',
    })
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
    ElMessage({
      showClose: true,
      message: `成功添加 ${permissions.length} 个权限的关联`,
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
      message: `成功解除 ${permissionToUnattach.value.length} 个权限的关联`,
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
