<template>
  <div class="permission-node-container">
    <loading-overlay :loading="loading > 0" />
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <native-button
            kind="primary"
            :disabled="scopeIndicatorValue === null"
            @click="handleShowPermissionCreateDialog"
          >
            新建权限
          </native-button>
          <native-button
            kind="success"
            :disabled="scopeIndicatorValue === null"
            @click="handleSearch"
          >
            刷新数据
          </native-button>
          <span class="header-sep" aria-hidden="true" />
          <permission-scope-indicator @on-changed="handlePermissionScopeIndicatorChanged" />
          <span class="header-sep" aria-hidden="true" />
          <span class="search-label">权限节点</span>
          <input
            v-model="idSearchBarValue"
            class="search-input"
            type="text"
            :disabled="scopeIndicatorValue === null"
            placeholder="输入后回车或点搜索"
            @keydown.enter="handleSearch"
          />
          <native-button
            kind="primary"
            :disabled="scopeIndicatorValue === null"
            @click="handleSearch"
          >
            搜索
          </native-button>
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
      <template v-slot:default>
        <placeholder-panel v-if="scopeId === ''" text="请选择权限作用域" />
        <paging-table-panel
          v-else
          v-model:current-page="permissionTableCurrentPage"
          v-model:page-size="permissionTablePageSize"
          :item-count="permissionTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="permissionTableItems"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="206"
          @on-paging-attribute-changed="handlePagingAttributeChanged"
        >
          <template v-slot:default>
            <paging-table-column label="权限节点" prop="key.permission_string_id" />
            <paging-table-column
              label="权限组"
              prop="group_key.permission_group_string_id"
              :min-width="140"
            />
            <paging-table-column label="名称" prop="name" :min-width="120" />
            <paging-table-column
              label="等级"
              prop="level"
              :width="72"
              align="right"
              header-class="th-num"
              cell-class="th-num"
            />
            <paging-table-column label="备注" prop="remark" :min-width="100" />
          </template>
          <template v-slot:operateColumn="{ row }">
            <span class="operate-actions">
              <native-link
                type="primary"
                @click="handleShowPermissionInspectDialog(row as Permission)"
              >
                查看
              </native-link>
              <native-link
                type="info"
                @click="handleShowUserViewOfPermissionInspectDialog(row as Permission)"
              >
                用户视图
              </native-link>
              <native-link
                type="primary"
                @click="handleShowPermissionEditDialog(row as Permission)"
              >
                编辑
              </native-link>
              <native-link type="danger" @click="handlePermissionDelete(row as Permission)">
                删除
              </native-link>
              <native-link type="primary" @click="handleCopyKey(row as Permission)">
                复制主键
              </native-link>
            </span>
          </template>
        </paging-table-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="permissionMaintainDialogVisible"
      label-width="120px"
      create-title="创建权限"
      edit-title="编辑权限"
      inspect-title="查看权限"
      :loading="permissionMaintainDialogLoading"
      :mode="permissionMaintainDialogMode"
      :item="permissionMaintainDialogItem"
      :close-on-click-modal="false"
      @on-item-create="handlePermissionCreate"
      @on-item-edit="handlePermissionEdit"
    >
      <native-form-item label="权限节点">
        <input
          v-model="permissionMaintainDialogItem.permission_string_id"
          class="form-input"
          type="text"
          placeholder="必填，非空，不能重复"
          :readonly="permissionMaintainDialogMode !== 'CREATE'"
          @input="handlePermissionStringIdInput"
        />
      </native-form-item>
      <native-form-item label="权限组ID">
        <input
          v-model="permissionMaintainDialogItem.group_key_string_id"
          class="form-input"
          type="text"
          placeholder="选填"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
      <native-form-item label="名称">
        <input
          v-model="permissionMaintainDialogItem.name"
          class="form-input"
          type="text"
          placeholder="必填"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
      <native-form-item label="等级">
        <input
          v-model.number="permissionMaintainDialogItem.level"
          class="form-input"
          type="number"
          min="0"
          step="1"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
      <native-form-item label="备注">
        <input
          v-model="permissionMaintainDialogItem.remark"
          class="form-input"
          type="text"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
    </maintain-dialog>
    <user-view-of-permission-inspect-dialog
      v-model:visible="userViewOfPermissionInspectDialogVisible"
      :permission="userViewOfPermissionInspectDialogPermission"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useGeneralMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import PermissionScopeIndicator from '@/views/nodes/comvisual/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import UserViewOfPermissionInspectDialog from '@/views/nodes/comvisual/systemSettings/permissionNode/subDialogs/UserViewOfPermissionInspectDialog.vue'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

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

defineOptions({
  name: 'PermissionNode',
})

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
    notifySuccess('变更应用成功！后台状态刷新中，请不要频繁点击')
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
  if (
    !window.confirm(
      '此操作将永久删除此权限节点。\n如果您不知道删除该节点后会产生什么后果，请不要进行操作！\n错误的操作可能导致前端界面、后台出错，甚至崩溃！\n是否继续?',
    )
  ) {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(removePermission({ key: item.key }))
    notifySuccess(`权限节点 ${item.key.permission_string_id} 删除成功`)
    handleSearch()
  } finally {
    loading.value -= 1
  }
}

async function handleCopyKey(row: Permission): Promise<void> {
  const keyStr = `${row.key.scope_string_id}&${row.key.permission_string_id}`
  try {
    await navigator.clipboard.writeText(keyStr)
    notifySuccess('复制成功')
  } catch {
    notifyWarning('复制失败')
  }
}

const userViewOfPermissionInspectDialogVisible = ref<boolean>(false)
const userViewOfPermissionInspectDialogPermission = ref<Permission | null>(null)

function handleShowUserViewOfPermissionInspectDialog(item: Permission): void {
  userViewOfPermissionInspectDialogPermission.value = item
  userViewOfPermissionInspectDialogVisible.value = true
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

function handleShowPermissionCreateDialog(): void {
  permissionMaintainDialogItem.value = { ...INITIAL_PERMISSION_MAINTAIN_DIALOG_ITEM }
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
    return
  }
  if (!item.permission_string_id.trim()) {
    notifyWarning('权限节点不能为空')
    return
  }
  if (!item.name.trim()) {
    notifyWarning('权限名称不能为空')
    return
  }
  const pid = item.permission_string_id.toLowerCase()
  const existsResult = await resolveResponse(permissionExists(scopeId.value, pid))
  if (existsResult) {
    notifyWarning('权限节点已经存在')
    return
  }
  if (item.group_key_string_id.trim() !== '') {
    const g = await resolveResponse(
      permissionGroupExists(scopeId.value, item.group_key_string_id.trim()),
    )
    if (!g) {
      notifyWarning('权限组不存在')
      return
    }
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
      createPermission({
        key: {
          scope_string_id: scopeId.value,
          permission_string_id: pid,
        },
        group_key: groupKey,
        name: item.name,
        remark: item.remark,
        level: item.level,
      }),
    )
    notifySuccess(`权限节点 ${pid} 创建成功`)
    handleSearch()
    permissionMaintainDialogVisible.value = false
  } finally {
    permissionMaintainDialogLoading.value -= 1
  }
}

async function handlePermissionEdit(item: PermissionMaintainDialogItem): Promise<void> {
  const scope = scopeIndicatorValue.value
  if (!scope) {
    return
  }
  if (!item.name.trim()) {
    notifyWarning('权限名称不能为空')
    return
  }
  if (item.group_key_string_id.trim() !== '') {
    const g = await resolveResponse(
      permissionGroupExists(scopeId.value, item.group_key_string_id.trim()),
    )
    if (!g) {
      notifyWarning('权限组不存在')
      return
    }
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
    notifySuccess(`权限节点 ${item.permission_string_id} 更新成功`)
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

.search-label {
  font-size: 14px;
  color: #606266;
}

.search-input {
  width: min(280px, 100%);
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
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

.operate-actions {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
