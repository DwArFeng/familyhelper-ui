<template>
  <div class="permission-scope-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handlePermissionScopeSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-input
            class="name-search-bar"
            v-model="nameSearchBarValue"
            clearable
            @keydown.enter="handlePermissionScopeSearch"
            @clear="handlePermissionScopeSearch"
          >
            <template v-slot:prepend>
              <span>作用域名称</span>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchButton" @click="handlePermissionScopeSearch" />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <card-panel
          v-loading="permissionScopeCardLoading"
          title-field="key_string_id"
          card-width="calc(20% - 18px)"
          :items="permissionScopeCardItems"
          :max-card="permissionScopeCardMaxCard"
          :show-contextmenu="true"
          :contextmenu-width="120"
          @onItemAdd="handlePermissionScopeToCreate"
        >
          <template v-slot:default="{ item }">
            <div class="permission-scope-card-container">
              <div class="permission-scope-property">
                <span class="iconfont permission-scope-property-icon" style="color: black">
                  &#xffee;
                </span>
                <span class="permission-scope-property-text">
                  名称: {{ (item as PermissionScopeCardItem).name }}
                </span>
              </div>
              <div class="permission-scope-property">
                <span class="iconfont permission-scope-property-icon" style="color: black">
                  &#xffee;
                </span>
                <span class="permission-scope-property-text">
                  备注: {{ (item as PermissionScopeCardItem).remark || '（无）' }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:header="{ item }">
            <el-button-group class="permission-scope-control-button-group">
              <el-button
                class="card-button"
                :icon="EditPen"
                @click="handleItemToEdit(item as PermissionScopeCardItem)"
              />
              <el-button
                class="card-button"
                :icon="DeleteIcon"
                @click="handleItemToDelete(item as PermissionScopeCardItem)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ item, close }">
            <ul class="my-contextmenu">
              <li @click="handleEditMenuItemClicked(item as PermissionScopeCardItem, close)">
                编辑...
              </li>
              <li @click="handleDeleteMenuItemClicked(item as PermissionScopeCardItem, close)">
                删除...
              </li>
            </ul>
          </template>
        </card-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="permissionScopeMaintainDialogVisible"
      :loading="permissionScopeMaintainDialogLoading"
      :mode="permissionScopeMaintainDialogMode"
      :item="permissionScopeMaintainDialogItem"
      :create-rules="permissionScopeMaintainDialogRules"
      :edit-rules="permissionScopeMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePermissionScopeCreate"
      @onItemEdit="handlePermissionScopeEdit"
    >
      <el-form-item label="标识" prop="key_string_id">
        <el-input
          v-model="permissionScopeMaintainDialogItem.key_string_id"
          :readonly="
            permissionScopeMaintainDialogMode === 'INSPECT' ||
            permissionScopeMaintainDialogMode === 'EDIT'
          "
          placeholder="创建时填写，如: user"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="permissionScopeMaintainDialogItem.name"
          :readonly="permissionScopeMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="permissionScopeMaintainDialogItem.remark"
          :readonly="permissionScopeMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon, EditPen, Search as SearchButton } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import CardPanel from '@/components/elementPlus/card/cardPanel/CardPanel.vue'

import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'
import { useGeneralCardPanel } from '@/components/elementPlus/card/cardPanel/composables.ts'

import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import {
  all,
  insert,
  remove,
  update,
  idLike,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionScope',
})

// region 头部面板

const nameSearchBarValue = ref<string>('')

// endregion

// region 权限作用域查询

function handlePermissionScopeSearch(): void {
  handlePermissionScopeSearchInternal()
}

async function handlePermissionScopeSearchInternal(): Promise<void> {
  permissionScopeCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => {
      if (nameSearchBarValue.value) {
        return idLike(nameSearchBarValue.value, pagingInfo)
      }
      return all(pagingInfo)
    })
    updatePermissionScopeCardByLookup(res)
  } finally {
    permissionScopeCardLoading.value -= 1
  }
}

onMounted(() => {
  handlePermissionScopeSearch()
})

// endregion

// region 权限作用域卡片

type PermissionScopeCardItem = {
  name: string
  key_string_id: string
  remark: string
  scope: Scope
}

const { items: permissionScopeCardItems, updateByLookup: updatePermissionScopeCardByLookup } =
  useGeneralCardPanel<Scope, PermissionScopeCardItem>(permissionScopeCardItemMap)
const permissionScopeCardLoading = ref<number>(0)
const permissionScopeCardMaxCard = ref<number>(1000)

function permissionScopeCardItemMap(t: Scope): PermissionScopeCardItem {
  return {
    name: t.name,
    key_string_id: t.key.string_id,
    remark: t.remark,
    scope: t,
  }
}

function handlePermissionScopeToCreate(): void {
  showPermissionScopeCreateMaintainDialog()
}

function handleEditMenuItemClicked(item: PermissionScopeCardItem, close: () => void): void {
  close()
  handleItemToEdit(item)
}

function handleItemToEdit(item: PermissionScopeCardItem): void {
  showPermissionScopeEditMaintainDialog(item.scope)
}

function handleDeleteMenuItemClicked(item: PermissionScopeCardItem, close: () => void): void {
  close()
  handleItemToDelete(item)
}

async function handleItemToDelete(item: PermissionScopeCardItem): Promise<void> {
  await handlePermissionScopeDelete(item.scope)
}

async function handlePermissionScopeDelete(item: Scope): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此权限作用域。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  permissionScopeCardLoading.value += 1
  try {
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: `权限作用域 ${item.name} 删除成功`,
      type: 'success',
    })
    handlePermissionScopeSearch()
  } finally {
    permissionScopeCardLoading.value -= 1
  }
}

// endregion

// region 权限作用域维护对话框

type PermissionScopeMaintainDialogItem = {
  key_string_id: string
  name: string
  remark: string
}

const {
  visible: permissionScopeMaintainDialogVisible,
  item: permissionScopeMaintainDialogItem,
  mode: permissionScopeMaintainDialogMode,
  showCreateDialog: showPermissionScopeCreateMaintainDialog,
  showEditDialog: showPermissionScopeEditMaintainDialog,
} = useGeneralMaintainDialog<Scope, PermissionScopeMaintainDialogItem>(
  permissionScopeMaintainDialogItemMap,
  {
    key_string_id: '',
    name: '',
    remark: '',
  },
)
const permissionScopeMaintainDialogLoading = ref<number>(0)
const permissionScopeMaintainDialogRules = ref({
  key_string_id: [{ required: true, message: '标识不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})

function permissionScopeMaintainDialogItemMap(t: Scope): PermissionScopeMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    name: t.name,
    remark: t.remark,
  }
}

async function handlePermissionScopeCreate(item: PermissionScopeMaintainDialogItem): Promise<void> {
  permissionScopeMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: { string_id: item.key_string_id },
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `权限作用域 ${item.name} 创建成功`,
      type: 'success',
    })
    permissionScopeMaintainDialogVisible.value = false
    handlePermissionScopeSearch()
  } finally {
    permissionScopeMaintainDialogLoading.value -= 1
  }
}

async function handlePermissionScopeEdit(item: PermissionScopeMaintainDialogItem): Promise<void> {
  permissionScopeMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { string_id: item.key_string_id },
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `权限作用域 ${item.name} 更新成功`,
      type: 'success',
    })
    permissionScopeMaintainDialogVisible.value = false
    handlePermissionScopeSearch()
  } finally {
    permissionScopeMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.permission-scope-container {
  width: 100%;
  height: 100%;
}

.permission-scope-card-container {
  width: 100%;
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.permission-scope-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.permission-scope-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.permission-scope-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .name-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .name-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.permission-scope-control-button-group {
  display: flex;
}

.card-button {
  height: 28px;
  width: 28px;
  padding: 7px;
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
</style>
