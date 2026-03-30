<template>
  <div class="permission-scope-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="success" @click="handlePermissionScopeSearch">
            刷新数据
          </native-button>
          <span class="header-sep" aria-hidden="true" />
          <div class="name-search-bar">
            <span class="name-search-prepend">作用域名称</span>
            <input
              v-model="nameSearchBarValue"
              type="text"
              class="name-search-input"
              @keydown.enter="handlePermissionScopeSearch"
            />
            <native-button attach-end @click="handlePermissionScopeSearch">搜索</native-button>
          </div>
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
        <div class="card-panel-wrap">
          <loading-overlay :loading="permissionScopeCardLoading > 0" />
          <card-panel
            title-field="key_string_id"
            card-width="calc(20% - 18px)"
            :items="permissionScopeCardItems"
            :max-card="permissionScopeCardMaxCard"
            @on-item-add="handlePermissionScopeToCreate"
          >
            <template v-slot:default="{ item }">
              <div class="permission-scope-card-container">
                <div class="permission-scope-property">
                  <span class="permission-scope-property-text">
                    名称: {{ (item as PermissionScopeCardItem).name }}
                  </span>
                </div>
                <div class="permission-scope-property">
                  <span class="permission-scope-property-text">
                    备注: {{ (item as PermissionScopeCardItem).remark || '（无）' }}
                  </span>
                </div>
              </div>
            </template>
            <template v-slot:header="{ item }">
              <div class="permission-scope-control-button-group">
                <native-link
                  size="small"
                  type="primary"
                  @click="handleItemToEdit(item as PermissionScopeCardItem)"
                >
                  编辑
                </native-link>
                <native-link
                  size="small"
                  type="danger"
                  @click="handleItemToDelete(item as PermissionScopeCardItem)"
                >
                  删除
                </native-link>
              </div>
            </template>
          </card-panel>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="permissionScopeMaintainDialogVisible"
      :loading="permissionScopeMaintainDialogLoading"
      :mode="permissionScopeMaintainDialogMode"
      :item="permissionScopeMaintainDialogItem"
      :close-on-click-modal="false"
      create-title="新建权限作用域"
      edit-title="编辑权限作用域"
      inspect-title="查看权限作用域"
      @on-item-create="handlePermissionScopeCreate"
      @on-item-edit="handlePermissionScopeEdit"
    >
      <native-form-item label="标识" :error="fieldErrors.key_string_id">
        <input
          v-model="permissionScopeMaintainDialogItem.key_string_id"
          type="text"
          class="native-input"
          :readonly="
            permissionScopeMaintainDialogMode === 'INSPECT' ||
            permissionScopeMaintainDialogMode === 'EDIT'
          "
          placeholder="创建时填写，如: user"
        />
      </native-form-item>
      <native-form-item label="名称" :error="fieldErrors.name">
        <input
          v-model="permissionScopeMaintainDialogItem.name"
          type="text"
          class="native-input"
          :readonly="permissionScopeMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
      <native-form-item label="备注" :error="fieldErrors.remark">
        <input
          v-model="permissionScopeMaintainDialogItem.remark"
          type="text"
          class="native-input"
          :readonly="permissionScopeMaintainDialogMode === 'INSPECT'"
        />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import CardPanel from '@/components/comvisual/card/cardPanel/CardPanel.vue'
import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'

import { useGeneralCardPanel } from '@/components/comvisual/card/cardPanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import {
  all,
  insert,
  remove,
  update,
  idLike,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { resetAnalysis } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/reset.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionScope',
})

// region 头部面板

const nameSearchBarValue = ref<string>('')
const applyChangesButtonDisabled = ref<boolean>(false)

async function handleApplyChanges(): Promise<void> {
  applyChangesButtonDisabled.value = true
  try {
    await resolveResponse(resetAnalysis())
    window.alert('变更应用成功！后台状态刷新中，请不要频繁点击')
  } finally {
    setTimeout(() => {
      applyChangesButtonDisabled.value = false
    }, 3000)
  }
}

// endregion

// region 权限作用域查询

function handlePermissionScopeSearch(): void {
  void handlePermissionScopeSearchInternal()
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
  clearFieldErrors()
  showPermissionScopeCreateMaintainDialog()
}

function handleItemToEdit(item: PermissionScopeCardItem): void {
  clearFieldErrors()
  showPermissionScopeEditMaintainDialog(item.scope)
}

async function handleItemToDelete(item: PermissionScopeCardItem): Promise<void> {
  await handlePermissionScopeDelete(item.scope)
}

async function handlePermissionScopeDelete(item: Scope): Promise<void> {
  if (!window.confirm('此操作将永久删除此权限作用域。\n是否继续?')) {
    return
  }
  permissionScopeCardLoading.value += 1
  try {
    await resolveResponse(remove(item.key))
    window.alert(`权限作用域 ${item.name} 删除成功`)
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

const fieldErrors = reactive({
  key_string_id: '',
  name: '',
  remark: '',
})

function clearFieldErrors(): void {
  fieldErrors.key_string_id = ''
  fieldErrors.name = ''
  fieldErrors.remark = ''
}

function permissionScopeMaintainDialogItemMap(t: Scope): PermissionScopeMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    name: t.name,
    remark: t.remark,
  }
}

function validateMaintain(item: PermissionScopeMaintainDialogItem): boolean {
  clearFieldErrors()
  let ok = true
  if (!item.key_string_id.trim()) {
    fieldErrors.key_string_id = '标识不能为空'
    ok = false
  }
  if (!item.name.trim()) {
    fieldErrors.name = '名称不能为空'
    ok = false
  }
  return ok
}

async function handlePermissionScopeCreate(item: PermissionScopeMaintainDialogItem): Promise<void> {
  if (!validateMaintain(item)) {
    return
  }
  permissionScopeMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: { string_id: item.key_string_id },
        name: item.name,
        remark: item.remark,
      }),
    )
    window.alert(`权限作用域 ${item.name} 创建成功`)
    permissionScopeMaintainDialogVisible.value = false
    handlePermissionScopeSearch()
  } finally {
    permissionScopeMaintainDialogLoading.value -= 1
  }
}

async function handlePermissionScopeEdit(item: PermissionScopeMaintainDialogItem): Promise<void> {
  if (!validateMaintain(item)) {
    return
  }
  permissionScopeMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { string_id: item.key_string_id },
        name: item.name,
        remark: item.remark,
      }),
    )
    window.alert(`权限作用域 ${item.name} 更新成功`)
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

.border-layout-panel {
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
  flex-wrap: wrap;
  gap: 8px;
}

.header-sep {
  width: 1px;
  height: 20px;
  background: #dcdfe6;
}

.name-search-bar {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 400px;
  max-width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.name-search-prepend {
  flex-shrink: 0;
  padding: 0 10px;
  display: flex;
  align-items: center;
  font-size: 14px;
  background: #f5f7fa;
  border-right: 1px solid #dcdfe6;
}

.name-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  padding: 0 8px;
  font-size: 14px;
}

.name-search-input:focus {
  outline: none;
}

.permission-scope-control-button-group {
  display: flex;
  gap: 4px;
}

.card-panel-wrap {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 0;
}

.native-input {
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.native-input:read-only {
  background: #f5f7fa;
}
</style>
