<template>
  <div class="permission-node-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button class="insert-button" type="primary" @click="handleShowItemCreateDialog">
            新建权限
          </el-button>
          <el-button type="success" @click="handleSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-input
            class="id-search-bar"
            v-model="idSearchBarValue"
            clearable
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
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="permissionTableCurrentPage"
          v-model:page-size="permissionTablePageSize"
          :item-count="permissionTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="permissionTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
          @onItemInspect="handleShowPermissionInspectDialog"
          @onItemEdit="handleShowPermissionEditDialog"
          @onItemDelete="handlePermissionDelete"
        >
          <template v-slot:default>
            <el-table-column prop="key.string_id" label="权限节点" show-overflow-tooltip />
            <el-table-column prop="group_key.string_id" label="权限组" show-overflow-tooltip />
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
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row as Permission, close)">复制主键</li>
              <el-divider />
              <li @click="handleInspectContextmenuClicked(row as Permission, close)">查看...</li>
              <li @click="handleEditContextmenuClicked(row as Permission, close)">编辑...</li>
              <li @click="handleDeleteContextmenuClicked(row as Permission, close)">删除...</li>
            </ul>
          </template>
        </table-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="permissionMaintainDialogVisible"
      :loading="permissionMaintainDialogLoading"
      :mode="permissionMaintainDialogMode"
      :item="permissionMaintainDialogItem"
      :create-rules="permissionMaintainDialogCreateRules"
      :edit-rules="permissionMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePermissionCreate"
      @onItemEdit="handlePermissionEdit"
    >
      <el-form-item label="权限节点" prop="key_string_id">
        <el-input
          v-model="permissionMaintainDialogItem.key_string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="permissionMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="权限组ID" prop="group_key_string_id">
        <el-input
          v-model="permissionMaintainDialogItem.group_key_string_id"
          :readonly="permissionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="permissionMaintainDialogItem.name"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import { type StringIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permission.ts'
import {
  all,
  exists,
  idLike,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permission'
import { exists as permissionGroupExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'PermissionNode',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const idSearchBarValue = ref<string>('')

function handleShowItemCreateDialog(): void {
  showPermissionCreateMaintainDialog()
}

// -----------------------------------------------------------权限搜索-----------------------------------------------------------
function handleSearch(): void {
  if (idSearchBarValue.value === '') {
    handleSearchLookupAll()
  } else {
    handleSearchLookupIdLike()
  }
}

async function handleSearchLookupAll(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      permissionTablePagingInfo.value,
    )
    updatePermissionTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleSearchLookupIdLike(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => idLike(idSearchBarValue.value, pagingInfo),
      permissionTablePagingInfo.value,
    )
    updatePermissionTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSearch()
})

// -----------------------------------------------------------权限表格处理-----------------------------------------------------------
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

function handleShowPermissionInspectDialog(item: Permission): void {
  showPermissionInspectMaintainDialog(item)
}

function handleShowPermissionEditDialog(item: Permission): void {
  showPermissionEditMaintainDialog(item)
}

async function handlePermissionDelete(item: Permission): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此权限节点。<br>' +
        '<div style="color: #b22222"><b>如果您不知道删除该节点后会产生什么后果，' +
        '请不要进行操作！</b></div>' +
        '<b>错误的操作可能导致前端界面、后台出错，甚至崩溃！</b><br>' +
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
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: `权限节点 ${item.key.string_id} 删除成功`,
      type: 'success',
      center: true,
    })
    handleSearch()
  } finally {
    loading.value -= 1
  }
}

async function handleCopyKeyContextmenuClicked(row: Permission, close: () => void): Promise<void> {
  await navigator.clipboard.writeText(row.key.string_id)
  ElMessage({
    showClose: true,
    message: '复制成功',
    type: 'success',
    center: true,
  })
  close()
}

function handleInspectContextmenuClicked(row: Permission, close: () => void): void {
  close()
  handleShowPermissionInspectDialog(row)
}

function handleEditContextmenuClicked(row: Permission, close: () => void): void {
  close()
  handleShowPermissionEditDialog(row)
}

function handleDeleteContextmenuClicked(row: Permission, close: () => void): void {
  close()
  handlePermissionDelete(row)
}

// -----------------------------------------------------------维护对话框-----------------------------------------------------------
type PermissionMaintainDialogItem = {
  key_string_id: string
  group_key_string_id: string
  name: string
  remark: string
  level: number
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
  {
    key_string_id: '',
    group_key_string_id: '',
    name: '',
    remark: '',
    level: 0,
  },
)
const permissionMaintainDialogLoading = ref<number>(0)
const permissionKeyValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('权限节点不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('权限节点已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const permissionGroupKeyValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        return Promise.resolve(true)
      }
      return resolveResponse(permissionGroupExists({ string_id: res }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('权限组节点不存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const permissionMaintainDialogCreateRules = ref({
  key_string_id: [{ validator: permissionKeyValidator, trigger: 'blur' }],
  group_key_string_id: [{ validator: permissionGroupKeyValidator, trigger: 'blur' }],
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})
const permissionMaintainDialogEditRules = ref({
  group_key_string_id: [{ validator: permissionGroupKeyValidator, trigger: 'blur' }],
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})

function permissionMaintainDialogItemMap(t: Permission): PermissionMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    group_key_string_id: t.group_key?.string_id ?? '',
    name: t.name,
    remark: t.remark,
    level: t.level,
  }
}

async function handlePermissionCreate(item: PermissionMaintainDialogItem): Promise<void> {
  permissionMaintainDialogLoading.value += 1
  try {
    const groupKey: StringIdKey | null =
      item.group_key_string_id === '' ? null : { string_id: item.group_key_string_id }
    await resolveResponse(
      insert({
        key: { string_id: item.key_string_id },
        group_key: groupKey,
        name: item.name,
        remark: item.remark,
        level: item.level,
      }),
    )
    ElMessage({
      showClose: true,
      message: `权限节点 ${item.key_string_id} 创建成功`,
      type: 'success',
      center: true,
    })
    handleSearch()
    permissionMaintainDialogVisible.value = false
  } finally {
    permissionMaintainDialogLoading.value -= 1
  }
}

async function handlePermissionEdit(item: PermissionMaintainDialogItem): Promise<void> {
  permissionMaintainDialogLoading.value += 1
  try {
    const groupKey: StringIdKey | null =
      item.group_key_string_id === '' ? null : { string_id: item.group_key_string_id }
    await resolveResponse(
      update({
        key: { string_id: item.key_string_id },
        group_key: groupKey,
        name: item.name,
        remark: item.remark,
        level: item.level,
      }),
    )
    ElMessage({
      showClose: true,
      message: `权限节点 ${item.key_string_id} 更新成功`,
      type: 'success',
      center: true,
    })
    handleSearch()
    permissionMaintainDialogVisible.value = false
  } finally {
    permissionMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.permission-node-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
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

.form-input-number {
  width: 200px;
}
</style>
