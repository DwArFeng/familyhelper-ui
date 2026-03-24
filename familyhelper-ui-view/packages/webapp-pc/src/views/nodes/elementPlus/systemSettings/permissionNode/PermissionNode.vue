<template>
  <div class="permission-node-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="header-button"
            type="primary"
            :disabled="scopeIndicatorValue === null"
            @click="handleShowPermissionCreateDialog"
          >
            新建权限
          </el-button>
          <el-button
            class="header-button"
            type="success"
            :disabled="scopeIndicatorValue === null"
            @click="handleSearch"
          >
            刷新数据
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
              <span>权限节点</span>
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
            应用变更
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="scopeId === ''" text="请选择权限作用域" />
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
              label="权限节点"
              show-overflow-tooltip
            />
            <el-table-column
              prop="group_key.permission_group_string_id"
              label="权限组"
              show-overflow-tooltip
            />
            <el-table-column prop="name" label="名称" show-overflow-tooltip />
            <el-table-column
              prop="level"
              label="等级"
              align="right"
              width="85"
              show-overflow-tooltip
            />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </template>
          <template v-slot:operateColumn="{ row }">
            <el-button-group class="operate-column">
              <el-button
                class="table-button"
                type="success"
                :icon="SearchIcon"
                title="查看"
                @click="handleShowPermissionInspectDialog(row as Permission)"
              />
              <el-button
                class="table-button"
                type="info"
                :icon="ViewIcon"
                title="查看用户视图"
                @click="handleShowUserViewOfPermissionInspectDialog(row as Permission)"
              />
              <el-button
                class="table-button"
                type="primary"
                :icon="EditPen"
                title="编辑"
                @click="handleShowPermissionEditDialog(row as Permission)"
              />
              <el-button
                class="table-button"
                type="danger"
                :icon="DeleteIcon"
                title="删除"
                @click="handlePermissionDelete(row as Permission)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row as Permission, close)">复制主键</li>
              <el-divider />
              <li @click="handleInspectContextmenuClicked(row as Permission, close)">查看...</li>
              <li @click="handleUserViewInspectContextmenuClicked(row as Permission, close)">
                查看用户视图...
              </li>
              <li @click="handleEditContextmenuClicked(row as Permission, close)">编辑...</li>
              <li @click="handleDeleteContextmenuClicked(row as Permission, close)">删除...</li>
            </ul>
          </template>
        </table-panel>
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
      :create-rules="permissionMaintainDialogCreateRules"
      :edit-rules="permissionMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePermissionCreate"
      @onItemEdit="handlePermissionEdit"
    >
      <el-form-item label="权限节点" prop="permission_string_id">
        <el-input
          v-model="permissionMaintainDialogItem.permission_string_id"
          placeholder="必填，非空，不能重复"
          :readonly="permissionMaintainDialogMode !== 'CREATE'"
          @input="handlePermissionStringIdInput"
        />
      </el-form-item>
      <el-form-item label="权限组ID" prop="group_key_string_id">
        <el-input
          v-model="permissionMaintainDialogItem.group_key_string_id"
          placeholder="选填"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="permissionMaintainDialogItem.name"
          placeholder="必填"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="等级" prop="level">
        <el-input-number
          class="form-input-number"
          v-model="permissionMaintainDialogItem.level"
          :min="0"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
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
import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import PermissionScopeIndicator from '@/views/nodes/elementPlus/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import UserViewOfPermissionInspectDialog from './subDialogs/UserViewOfPermissionInspectDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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
      '此操作将永久删除此权限节点。<br>' +
        '<div style="color: #b22222"><b>如果您不知道删除该节点后会产生什么后果，请不要进行操作！</b></div>' +
        '<b>错误的操作可能导致前端界面、后台出错，甚至崩溃！</b><br>是否继续?',
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
    await resolveResponse(removePermission({ key: item.key }))
    ElMessage({
      showClose: true,
      message: `权限节点 ${item.key.permission_string_id} 删除成功`,
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
    message: '复制成功',
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
    callback(new Error('权限节点不能为空'))
    return
  }
  if (scopeId.value === '') {
    callback(new Error('请先选择权限作用域'))
    return
  }
  resolveResponse(permissionExists(scopeId.value, value))
    .then((existsResult) => {
      if (existsResult) {
        callback(new Error('权限节点已经存在'))
      } else {
        callback()
      }
    })
    .catch(() => {
      callback(new Error('校验失败'))
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
    callback(new Error('请先选择权限作用域'))
    return
  }
  resolveResponse(permissionGroupExists(scopeId.value, value))
    .then((existsResult) => {
      if (!existsResult) {
        callback(new Error('权限组不存在'))
      } else {
        callback()
      }
    })
    .catch(() => {
      callback(new Error('校验失败'))
    })
}

const permissionMaintainDialogCreateRules = {
  permission_string_id: [
    { required: true, message: '权限节点不能为空', trigger: 'blur' },
    { validator: permissionStringIdValidator, trigger: 'blur' },
  ],
  group_key_string_id: [{ validator: permissionGroupStringIdValidator, trigger: 'blur' }],
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
}

const permissionMaintainDialogEditRules = {
  group_key_string_id: [{ validator: permissionGroupStringIdValidator, trigger: 'blur' }],
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
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
    throw new Error('不应该执行到此处，请联系开发人员')
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
      message: `权限节点 ${permissionStringId} 创建成功`,
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
    throw new Error('不应该执行到此处，请联系开发人员')
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
      message: `权限节点 ${item.permission_string_id} 更新成功`,
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
