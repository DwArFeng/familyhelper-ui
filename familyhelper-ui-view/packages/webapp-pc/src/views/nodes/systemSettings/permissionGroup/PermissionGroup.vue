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
            @click="handleShowPermissionGroupMaintainCreateDialogParentButtonClicked"
          >
            新建权限组
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            @click="handleShowPermissionGroupMaintainCreateDialogChildButtonClicked"
          >
            新建子权限组
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="permissionGroupId === ''"
            @click="handleShowPermissionToAttachDialog"
          >
            关联权限节点
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="permissionAttachDialogPermissionToDetach.length === 0"
            @click="handleHeaderDetachPermissionButtonClicked"
          >
            取消关联权限节点
          </el-button>
        </div>
      </template>
      <template v-slot:west>
        <permission-group-tree-panel
          ref="permissionGroupTreePanelRef"
          mode="PERMISSION_GROUP"
          @onCurrentChanged="handlePermissionGroupTreeCurrentChanged"
          @onPermissionGroupEdit="handleShowPermissionGroupMaintainEditDialog"
          @onPermissionGroupDelete="handlePermissionGroupDelete"
        />
      </template>
      <template v-slot:default>
        <div class="center-container-wrapper">
          <div class="placeholder" v-if="permissionGroupId === ''">请选择权限组</div>
          <div class="center-container" v-else>
            <header-layout-panel>
              <template v-slot:header>
                <el-form class="detail-form" label-position="left" label-width="80px" inline>
                  <el-form-item label="权限组ID" style="width: 50%">
                    {{ permissionGroupTreeSelectionItem?.key_string_id ?? '' }}
                  </el-form-item>
                  <el-form-item label="父权限组ID" style="width: 50%">
                    {{
                      permissionGroupTreeSelectionItem?.parent_key_string_id
                        ? permissionGroupTreeSelectionItem?.parent_key_string_id
                        : '(根节点)'
                    }}
                  </el-form-item>
                  <el-form-item label="名称" style="width: 50%">
                    {{ permissionGroupTreeSelectionItem?.name ?? '' }}
                  </el-form-item>
                  <el-form-item label="备注" style="width: 50%">
                    {{ permissionGroupTreeSelectionItem?.remark ?? '' }}
                  </el-form-item>
                </el-form>
              </template>
              <template v-slot:default>
                <table-panel
                  class="permission-table-panel"
                  v-loading="permissionTableLoading"
                  v-model:page-size="permissionTablePageSize"
                  v-model:current-page="permissionTableCurrentPage"
                  :item-count="permissionTableItemCount"
                  :page-sizes="[1, 15, 20, 30, 50]"
                  :items="permissionTableItems"
                  :operate-column-visible="false"
                  :show-contextmenu="true"
                  :contextmenu-width="100"
                  @onPagingAttributeChanged="handlePermissionToDetachTablePagingAttributeChanged"
                  @onSelectionChanged="handlePermissionToDetachTableSelectionChanged"
                >
                  <template v-slot:default>
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="key.string_id" label="权限节点" show-overflow-tooltip />
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
                      <li
                        @click="
                          handlePermissionTableCopyKeyContextmenuClicked(row as Permission, close)
                        "
                      >
                        复制主键
                      </li>
                    </ul>
                  </template>
                </table-panel>
              </template>
            </header-layout-panel>
          </div>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      label-width="120px"
      v-model:visible="permissionGroupMaintainDialogVisible"
      :loading="permissionGroupMaintainDialogLoading"
      :mode="permissionGroupMaintainDialogMode"
      :item="permissionGroupMaintainDialogItem"
      :create-rules="permissionGroupMaintainDialogCreateRules"
      :edit-rules="permissionGroupMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePermissionGroupCreate"
      @onItemEdit="handlePermissionGroupEdit"
    >
      <el-form-item label="权限组ID" prop="key_string_id">
        <el-input
          v-model="permissionGroupMaintainDialogItem.key_string_id"
          oninput="this.value = this.value.toLowerCase()"
          placeholder="必填，非空，不能重复"
          :readonly="permissionGroupMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="permissionGroupMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="permissionGroupMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
    <el-dialog
      class="permission-attach-dialog"
      v-model="permissionAttachDialogVisible"
      append-to-body
      destroy-on-close
      title="关联权限节点"
      top="5vh"
      width="80%"
      :close-on-click-modal="false"
      @open="handlePermissionAttachDialogOpen"
      @keydown.ctrl.enter="handlePermissionAttachDialogAttachPermission"
    >
      <table-panel
        class="permission-to-attach-table-panel"
        v-loading="permissionToAttachTableLoading"
        v-model:page-size="permissionToAttachTablePageSize"
        v-model:current-page="permissionToAttachTableCurrentPage"
        :item-count="permissionToAttachTableItemCount"
        :page-sizes="[1, 15, 20, 30, 50]"
        :items="permissionToAttachTableItems"
        :inspect-button-visible="false"
        :edit-button-visible="false"
        :delete-button-visible="false"
        @onPagingAttributeChanged="handlePermissionToAttachTablePagingAttributeChanged"
        @onSelectionChanged="handlePermissionToAttachTableSelectionChanged"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="key.string_id" label="权限节点" show-overflow-tooltip />
        <el-table-column prop="name" label="名称" show-overflow-tooltip />
        <el-table-column prop="level" label="等级" align="right" width="85" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      </table-panel>
      <template v-slot:footer>
        <div class="footer-container">
          <el-button
            type="primary"
            :disabled="permissionAttachDialogPermissionToAttach.length === 0"
            @click="handlePermissionAttachDialogAttachPermission"
          >
            关联
          </el-button>
          <el-button @click="permissionAttachDialogVisible = false"> 取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { type TreeNode } from '@/components/tree/commons/types.ts'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'
import { useTreeSelection } from '@/components/tree/commons/composables.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import PermissionGroupTreePanel from './subPanels/PermissionGroupTreePanel.vue'

import { type StringIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import {
  type DispPermissionGroup,
  type PermissionGroup,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup.ts'
import {
  exists as existsPermissionGroup,
  insert as insertPermissionGroup,
  inspectDisp as inspectPermissionGroupDisp,
  remove as removePermissionGroup,
  update as updatePermissionGroup,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup.ts'
import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permission.ts'
import {
  childForGroup as permissionChildForGroup,
  update as updatePermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permission.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionGroup',
})

// -----------------------------------------------------------Loading 逻辑处理-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------Header 处理-----------------------------------------------------------
function handleHeaderDetachPermissionButtonClicked(): void {
  const groupKey: StringIdKey | null =
    permissionGroupTreeSelectionItem.value?.permission_group.key ?? null
  if (!groupKey) {
    return
  }
  const promises: Promise<null>[] = []
  permissionAttachDialogPermissionToDetach.value.forEach((permission) => {
    promises.push(
      resolveResponse(
        updatePermission({
          key: permission.key,
          group_key: null,
          name: permission.name,
          remark: permission.remark,
          level: permission.level,
        }),
      ),
    )
  })
  loading.value += 1
  Promise.all(promises)
    .then((res) => {
      ElMessage({
        showClose: true,
        message: `成功解除 ${res.length} 个权限的关联`,
        type: 'success',
        center: true,
      })
    })
    .then(() => {
      if (groupKey) {
        return lookupWithAdjustPage(
          (pagingInfo) => permissionChildForGroup(groupKey, pagingInfo),
          permissionTablePagingInfo.value,
        ).then(updatePermissionTableByLookup)
      }
      return Promise.resolve()
    })
    .then(() => {
      permissionAttachDialogVisible.value = false
    })
    .catch(() => {})
    .finally(() => {
      loading.value -= 1
    })
}

function handleShowPermissionGroupMaintainCreateDialogParentButtonClicked(): void {
  permissionGroupAppendChild.value = false
  showPermissionGroupMaintainCreateDialog()
}

function handleShowPermissionGroupMaintainCreateDialogChildButtonClicked(): void {
  permissionGroupAppendChild.value = true
  showPermissionGroupMaintainCreateDialog()
}

// -----------------------------------------------------------PermissionGroupMaintainDialog 处理-----------------------------------------------------------
type PermissionGroupMaintainDialogItem = {
  key_string_id: string
  parent_key_string_id: string
  name: string
  remark: string
}

const {
  visible: permissionGroupMaintainDialogVisible,
  item: permissionGroupMaintainDialogItem,
  mode: permissionGroupMaintainDialogMode,
  showCreateDialog: showPermissionGroupMaintainCreateDialog,
  showEditDialog: showPermissionGroupMaintainEditDialog,
} = useGeneralMaintainDialog<PermissionGroup, PermissionGroupMaintainDialogItem>(
  permissionGroupMaintainDialogItemMap,
  {
    key_string_id: '',
    parent_key_string_id: '',
    name: '',
    remark: '',
  },
)
const permissionGroupMaintainDialogLoading = ref<number>(0)

function permissionGroupMaintainDialogItemMap(
  t: PermissionGroup,
): PermissionGroupMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    parent_key_string_id: t.parent_key?.string_id ?? '',
    name: t.name,
    remark: t.remark,
  }
}

const permissionGroupKeyValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('权限组ID不能为空'))
        return Promise.reject()
      }
      return Promise.resolve(value)
    })
    .then((res) => {
      if (res === 'root') {
        callback(new Error('权限组ID不能取名为root'))
        return Promise.reject()
      }
      return resolveResponse(existsPermissionGroup({ string_id: value }))
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

const permissionGroupAppendChild = ref<boolean>(false)
const permissionGroupMaintainDialogCreateRules = ref({
  key_string_id: [
    { validator: permissionGroupKeyValidator, trigger: 'blur' },
    {
      required: true,
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: '权限组名称不能为空', trigger: 'blur' }],
})
const permissionGroupMaintainDialogEditRules = ref({
  name: [{ required: true, message: '权限组名称不能为空', trigger: 'blur' }],
})

function handlePermissionGroupCreate(item: PermissionGroupMaintainDialogItem): void {
  const _appendChild: boolean = permissionGroupAppendChild.value
  let _parent_key: StringIdKey | null
  if (_appendChild) {
    _parent_key = permissionGroupTreeSelectionItem.value?.permission_group.key ?? null
  } else {
    _parent_key = permissionGroupTreeSelectionItem.value?.permission_group.parent_key ?? null
  }
  const _treeNode = permissionGroupTreeSelectionNode.value
  const _treePanel = permissionGroupTreePanelRef.value
  if (!_treePanel) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  permissionGroupMaintainDialogLoading.value += 1
  resolveResponse(
    insertPermissionGroup({
      key: { string_id: item.key_string_id },
      parent_key: _parent_key,
      name: item.name,
      remark: item.remark,
    }),
  )
    .then((res) => {
      ElMessage({
        showClose: true,
        message: `权限组 ${res.string_id} 创建成功`,
        type: 'success',
        center: true,
      })
      return Promise.resolve(res)
    })
    .then((res) => resolveResponse(inspectPermissionGroupDisp(res)))
    .then((res) => {
      if (!_treeNode) {
        _treePanel.appendRoot(res)
      } else {
        if (_appendChild) {
          _treePanel.append(_treeNode, res)
        } else {
          _treePanel.insertAfter(_treeNode, res)
        }
      }
      return Promise.resolve()
    })
    .then(() => {
      permissionGroupMaintainDialogVisible.value = false
    })
    .catch(() => {})
    .finally(() => {
      permissionGroupMaintainDialogLoading.value -= 1
    })
}

function handlePermissionGroupEdit(item: PermissionGroupMaintainDialogItem): void {
  const _key: StringIdKey = { string_id: item.key_string_id }
  const _parentKey: StringIdKey | null =
    item.parent_key_string_id === '' ? null : { string_id: item.parent_key_string_id }
  const _treePanel = permissionGroupTreePanelRef.value
  if (!_treePanel) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  permissionGroupMaintainDialogLoading.value += 1
  resolveResponse(
    updatePermissionGroup({
      key: _key,
      parent_key: _parentKey,
      name: item.name,
      remark: item.remark,
    }),
  )
    .then((res) => {
      ElMessage({
        showClose: true,
        message: `权限组 ${_key.string_id} 更新成功`,
        type: 'success',
        center: true,
      })
      return Promise.resolve(res)
    })
    .then(() => resolveResponse(inspectPermissionGroupDisp(_key)))
    .then((res) => {
      _treePanel.update(res)
      return Promise.resolve()
    })
    .then(() => {
      permissionGroupMaintainDialogVisible.value = false
    })
    .catch(() => {})
    .finally(() => {
      permissionGroupMaintainDialogLoading.value -= 1
    })
}

// -----------------------------------------------------------PermissionGroupTree 处理-----------------------------------------------------------
type PermissionGroupTreeItem = {
  tree_node_key: string
  key_string_id: string
  parent_key_string_id: string
  name: string
  remark: string
  has_no_child: boolean
  permission_group: DispPermissionGroup
}

const { item: permissionGroupTreeSelectionItem, node: permissionGroupTreeSelectionNode } =
  useTreeSelection<PermissionGroupTreeItem>()

const permissionGroupId = computed(() => {
  if (permissionGroupTreeSelectionItem.value) {
    return permissionGroupTreeSelectionItem.value.permission_group.key.string_id
  }
  return ''
})

const permissionGroupTreePanelRef = useTemplateRef<
  ComponentExposed<typeof PermissionGroupTreePanel>
>('permissionGroupTreePanelRef')

function handlePermissionGroupTreeCurrentChanged(
  data: PermissionGroupTreeItem | null,
  node: TreeNode<PermissionGroupTreeItem> | null,
): void {
  permissionGroupTreeSelectionItem.value = data
  permissionGroupTreeSelectionNode.value = node
  if (!data) {
    return
  }
  permissionTableLoading.value += 1
  lookupWithAdjustPage(
    (pagingInfo) => permissionChildForGroup(data.permission_group.key, pagingInfo),
    permissionTablePagingInfo.value,
  )
    .then(updatePermissionTableByLookup)
    .catch(() => {})
    .finally(() => {
      permissionTableLoading.value -= 1
    })
}

function handleShowPermissionGroupMaintainEditDialog(data: PermissionGroupTreeItem): void {
  showPermissionGroupMaintainEditDialog(data.permission_group)
}

function handlePermissionGroupDelete(data: PermissionGroupTreeItem): void {
  const _treePanel = permissionGroupTreePanelRef.value
  if (!_treePanel) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  ElMessageBox.confirm(
    '此操作将永久删除此权限节点，以及其子权限节点。<br>' +
      '<b>此操作不可恢复</b><br>' +
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
    .then(() => Promise.resolve())
    .catch(() => Promise.reject())
    .then(() => resolveResponse(removePermissionGroup(data.permission_group.key, true)))
    .then(() => {
      ElMessage({
        showClose: true,
        message: `权限组 ${data.permission_group.key.string_id} 删除成功`,
        type: 'success',
        center: true,
      })
      return Promise.resolve()
    })
    .then(() => {
      _treePanel.remove(data)
    })
    .then(() => {
      permissionGroupTreeSelectionItem.value = null
      permissionGroupTreeSelectionNode.value = null
    })
    .catch(() => {})
}

// -----------------------------------------------------------PermissionTable 处理-----------------------------------------------------------
const {
  currentPage: permissionTableCurrentPage,
  pageSize: permissionTablePageSize,
  itemCount: permissionTableItemCount,
  items: permissionTableItems,
  pagingInfo: permissionTablePagingInfo,
  updateByLookup: updatePermissionTableByLookup,
} = useIdentityBackendPagingTablePanel<Permission>(15)
const permissionTableLoading = ref<number>(0)

function handlePermissionToDetachTablePagingAttributeChanged(): void {
  const groupKey: StringIdKey | null =
    permissionGroupTreeSelectionItem.value?.permission_group.key ?? null
  if (!groupKey) {
    return
  }
  permissionTableLoading.value += 1
  lookupWithAdjustPage(
    (pagingInfo) => permissionChildForGroup(groupKey, pagingInfo),
    permissionTablePagingInfo.value,
  )
    .then(updatePermissionTableByLookup)
    .catch(() => {})
    .finally(() => {
      permissionTableLoading.value -= 1
    })
}

function handlePermissionToDetachTableSelectionChanged(selection: Permission[]): void {
  permissionAttachDialogPermissionToDetach.value = selection
}

// -----------------------------------------------------------PermissionToAttachDialog 处理-----------------------------------------------------------
const permissionAttachDialogVisible = ref<boolean>(false)
const permissionAttachDialogPermissionToAttach = ref<Permission[]>([])
const permissionAttachDialogPermissionToDetach = ref<Permission[]>([])

function handleShowPermissionToAttachDialog(): void {
  permissionAttachDialogVisible.value = true
}

const {
  currentPage: permissionToAttachTableCurrentPage,
  pageSize: permissionToAttachTablePageSize,
  itemCount: permissionToAttachTableItemCount,
  items: permissionToAttachTableItems,
  updateByLookup: updatePermissionToAttachTableByLookup,
  pagingInfo: permissionToAttachTablePagingInfo,
} = useIdentityBackendPagingTablePanel<Permission>(15)
const permissionToAttachTableLoading = ref<number>(0)

function handlePermissionAttachDialogOpen(): void {
  permissionAttachDialogPermissionToAttach.value = []
  permissionToAttachTableLoading.value += 1
  lookupWithAdjustPage(
    (pagingInfo) => permissionChildForGroup(null, pagingInfo),
    permissionToAttachTablePagingInfo.value,
  )
    .then(updatePermissionToAttachTableByLookup)
    .catch(() => {})
    .finally(() => {
      permissionToAttachTableLoading.value -= 1
    })
}

function handlePermissionToAttachTablePagingAttributeChanged(): void {
  lookupWithAdjustPage(
    (pagingInfo) => permissionChildForGroup(null, pagingInfo),
    permissionToAttachTablePagingInfo.value,
  ).then(updatePermissionToAttachTableByLookup)
}

function handlePermissionToAttachTableSelectionChanged(selection: Permission[]): void {
  permissionAttachDialogPermissionToAttach.value = selection
}

function handlePermissionAttachDialogAttachPermission(): void {
  const groupKey: StringIdKey | null =
    permissionGroupTreeSelectionItem.value?.permission_group.key ?? null
  if (!groupKey) {
    return
  }
  const promises: Promise<null>[] = []
  permissionAttachDialogPermissionToAttach.value.forEach((permission) => {
    promises.push(
      resolveResponse(
        updatePermission({
          key: permission.key,
          group_key: groupKey,
          name: permission.name,
          remark: permission.remark,
          level: permission.level,
        }),
      ),
    )
  })
  permissionToAttachTableLoading.value += 1
  Promise.all(promises)
    .then((res) => {
      ElMessage({
        showClose: true,
        message: `成功添加 ${res.length} 个权限的关联`,
        type: 'success',
        center: true,
      })
    })
    .then(() => {
      permissionAttachDialogVisible.value = false
    })
    .catch(() => {})
    .finally(() => {
      permissionToAttachTableLoading.value -= 1
    })
    .then(() => {
      permissionTableLoading.value += 1
      if (groupKey) {
        return lookupWithAdjustPage(
          (pagingInfo) => permissionChildForGroup(groupKey, pagingInfo),
          permissionTablePagingInfo.value,
        ).then(updatePermissionTableByLookup)
      }
      return Promise.resolve()
    })
    .catch(() => {})
    .finally(() => {
      permissionTableLoading.value -= 1
    })
}

function handlePermissionTableCopyKeyContextmenuClicked(row: Permission, close: () => void): void {
  close()
  navigator.clipboard.writeText(row.key.string_id).then(() => {
    ElMessage({
      showClose: true,
      message: '复制成功',
      type: 'success',
      center: true,
    })
  })
}
</script>

<style scoped>
.permission-group-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.center-container-wrapper {
  width: 100%;
  height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.center-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.detail-form {
  display: flex;
  flex-wrap: wrap;
}

.detail-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.detail-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.detail-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

.permission-table-panel {
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.permission-attach-dialog :deep(.el-dialog) {
  margin-bottom: 0 !important;
}

.permission-to-attach-table-panel {
  height: 70vh;
}
</style>
