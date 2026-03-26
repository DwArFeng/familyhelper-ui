<template>
  <div class="pb-management-container">
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
            :disabled="nonPbSetSelected || readonly"
            @click="handleShowNodeCreateDialogParent"
          >
            新建节点
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonPbSetSelected || readonly || nonPbNodeSelected"
            @click="handleShowNodeCreateDialogChild"
          >
            新建子节点
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonPbSetSelected || readonly"
            @click="handleShowItemCreateDialogParent"
          >
            新建项目
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonPbSetSelected || readonly || nonPbNodeSelected"
            @click="handleShowItemCreateDialogChild"
          >
            新建子项目
          </el-button>
          <el-divider direction="vertical" />
          <pb-set-indicator mode="PB_MANAGEMENT" @onChanged="handlePbSetChanged" />
        </div>
      </template>
      <template v-slot:west>
        <pb-tree-panel
          ref="pbManagementTreePanelRef"
          :pb-set-key="pbSetIndicatorValue?.key.long_id ?? ''"
          :readonly="readonly"
          @onCurrentChanged="handlePbTreeCurrentChanged"
          @onEntityDelete="handlePbTreeItemDelete"
        />
      </template>
      <template v-slot:default>
        <div class="placeholder" v-show="pbTreeCurrentItem === null">请选择节点或项目</div>
        <node-edit-panel
          v-show="pbTreeCurrentItem !== null && pbTreeCurrentItem.type === 'node'"
          :node-id="pbTreeCurrentItem?.node?.key.long_id ?? ''"
          :readonly="readonly"
          @onNodePropertyUpdated="handlePbNodePropertyUpdated"
        />
        <item-edit-panel
          v-show="pbTreeCurrentItem !== null && pbTreeCurrentItem.type === 'item'"
          :item-id="pbTreeCurrentItem?.item?.key.long_id ?? ''"
          :readonly="readonly"
          @onItemPropertyUpdated="handlePbItemPropertyUpdated"
        />
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="pbNodeMaintainDialogVisible"
      label-width="100px"
      inspect-title="查看节点"
      create-title="创建节点"
      edit-title="编辑节点"
      :loading="pbNodeMaintainDialogLoading"
      :mode="pbNodeMaintainDialogMode"
      :item="pbNodeMaintainDialogItem"
      :create-rules="pbNodeMaintainDialogRules"
      :edit-rules="pbNodeMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePbNodeCreate"
      @onItemEdit="handlePbNodeEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="pbNodeMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="pbNodeMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
    <maintain-dialog
      v-model:visible="pbItemMaintainDialogVisible"
      label-width="100px"
      inspect-title="查看项目"
      create-title="创建项目"
      edit-title="编辑项目"
      :loading="pbItemMaintainDialogLoading"
      :mode="pbItemMaintainDialogMode"
      :item="pbItemMaintainDialogItem"
      :create-rules="pbItemMaintainDialogRules"
      :edit-rules="pbItemMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePbItemCreate"
      @onItemEdit="handlePbItemEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="pbItemMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input v-model="pbItemMaintainDialogItem.unit" placeholder="数据单位" />
      </el-form-item>
      <el-form-item label="比较" prop="comparator">
        <el-select
          class="asset-bom-select"
          v-model="pbItemMaintainDialogItem.comparator"
          placeholder="请选择"
        >
          <el-option
            v-for="option in comparatorOptions"
            :key="option.key"
            :label="option.label"
            :value="option.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="pbItemMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { ElMessage, ElMessageBox } from 'element-plus'

import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useCreateOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type TreeNode } from '@/components/elementPlus/tree/commons/types.ts'

import PbSetIndicator from '@/views/nodes/elementPlus/life/pbSet/PbSetIndicator.vue'

import PbTreePanel from './subPanels/PbTreePanel.vue'
import NodeEditPanel from './NodeEditPanel.vue'
import ItemEditPanel from './ItemEditPanel.vue'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type DispPbSet } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbSet.ts'
import { type DispPbNode } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbNode.ts'
import {
  createPbNode as createNode,
  inspectDisp as inspectNode,
  updatePbNode as updateNode,
  removePbNode as removeNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbNode.ts'
import {
  type DispPbItem,
  type PbItemComparator,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbItem.ts'
import {
  createPbItem as createItem,
  inspectDisp as inspectItem,
  updatePbItem as updateItem,
  removePbItem as removeItem,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbItem.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PbManagement',
})

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 属性计算

const nonPbSetSelected = computed<boolean>(() => {
  return pbSetIndicatorValue.value === null
})

const readonly = computed<boolean>(() => {
  if (pbSetIndicatorValue.value === null) {
    return true
  }
  return pbSetIndicatorValue.value.permission_level === 1
})

const nonPbNodeSelected = computed<boolean>(() => {
  const item: PbTreeItem | null = pbTreeCurrentItem.value
  if (!item) {
    return true
  }
  return item.type !== 'node'
})

// endregion

// region 头部面板

const pbSetIndicatorValue = ref<DispPbSet | null>(null)

function handlePbSetChanged(value: DispPbSet | null): void {
  pbSetIndicatorValue.value = value
}

// endregion

// region 个人最佳树面板

type PbTreeItem = {
  tree_node_key: string
  type: 'node' | 'item'
  name: string
  has_no_child: boolean
  display_type: 0 | 1
  node?: DispPbNode
  item?: DispPbItem
}

const pbTreeCurrentItem = ref<PbTreeItem | null>(null)
const pbTreeCurrentNode = ref<TreeNode<PbTreeItem> | null>(null)
const pbTreeAppendChild = ref<boolean>(false)

const pbManagementTreePanelRef = useTemplateRef<ComponentExposed<typeof PbTreePanel>>(
  'pbManagementTreePanelRef',
)

function handlePbTreeCurrentChanged(
  item: PbTreeItem | null,
  node: TreeNode<PbTreeItem> | null,
): void {
  // 赋值。
  pbTreeCurrentItem.value = item
  pbTreeCurrentNode.value = node
  // 同步维护对话框 bean。
  syncMaintainDialogItem(item)
}

function syncMaintainDialogItem(item: PbTreeItem | null): void {
  if (!item) {
    return
  }
  if (item.type === 'node') {
    if (!item.node) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    syncPbNodeMaintainDialogItem(item.node)
  } else {
    if (!item.item) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    syncPbItemMaintainDialogItem(item.item)
  }
}

function syncPbNodeMaintainDialogItem(node: DispPbNode): void {
  pbNodeMaintainDialogItem.value.long_id = node.key.long_id
  if (node.parent_key === null) {
    pbNodeMaintainDialogItem.value.parent_long_id = ''
  } else {
    pbNodeMaintainDialogItem.value.parent_long_id = node.parent_key.long_id
  }
  pbNodeMaintainDialogItem.value.name = node.name
  pbNodeMaintainDialogItem.value.remark = node.remark
}

function syncPbItemMaintainDialogItem(item: DispPbItem): void {
  pbItemMaintainDialogItem.value.long_id = item.key.long_id
  if (item.node_key === null) {
    pbItemMaintainDialogItem.value.node_long_id = ''
  } else {
    pbItemMaintainDialogItem.value.node_long_id = item.node_key.long_id
  }
  pbItemMaintainDialogItem.value.name = item.name
  pbItemMaintainDialogItem.value.unit = item.unit
  pbItemMaintainDialogItem.value.comparator = item.comparator ?? 0
  pbItemMaintainDialogItem.value.remark = item.remark
}

function handlePbTreeItemDelete(
  item: PbTreeItem,
  node: TreeNode<PbTreeItem>,
  accept: () => void,
): void {
  if (item.type === 'node') {
    handlePbNodeDelete(item, node, accept)
  } else {
    handlePbItemDelete(item, node, accept)
  }
}

async function handlePbNodeDelete(
  item: PbTreeItem,
  _node: TreeNode<PbTreeItem>,
  accept: () => void,
): Promise<void> {
  if (!item.node) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const st: DispPbNode = item.node
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此节点，此节点的子节点将会一同被删除。<br>' +
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
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(removeNode(st.key))
    ElMessage({
      showClose: true,
      message: `节点 ${st.name} 删除成功`,
      type: 'success',
    })
    accept()
  } finally {
    loading.value -= 1
  }
}

async function handlePbItemDelete(
  item: PbTreeItem,
  _node: TreeNode<PbTreeItem>,
  accept: () => void,
): Promise<void> {
  if (!item.item) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const st: DispPbItem = item.item
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此项目。<br>' + '<b>此操作不可恢复</b><br>' + '是否继续?',
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
    await resolveResponse(removeItem(st.key))
    ElMessage({
      showClose: true,
      message: `项目 ${st.name} 删除成功`,
      type: 'success',
    })
    accept()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 节点维护对话框

type PbNodeMaintainDialogItem = {
  long_id: string
  parent_long_id: string
  name: string
  remark: string
}

const {
  visible: pbNodeMaintainDialogVisible,
  item: pbNodeMaintainDialogItem,
  mode: pbNodeMaintainDialogMode,
  showDialog: showPbNodeMaintainDialog,
} = useCreateOnlyMaintainDialog<PbNodeMaintainDialogItem>({
  long_id: '',
  parent_long_id: '',
  name: '',
  remark: '',
})
const pbNodeMaintainDialogLoading = ref<number>(0)
const pbNodeMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
})

function handleShowNodeCreateDialogParent(): void {
  pbTreeAppendChild.value = false
  // 如果没有选中节点，则父节点为空。
  if (pbTreeCurrentItem.value === null) {
    pbNodeMaintainDialogItem.value.parent_long_id = ''
  }
  // 否则，如果选择的是 PbItem，则执行对应的逻辑判断。
  else if (pbTreeCurrentItem.value.type === 'item') {
    if (!pbTreeCurrentItem.value.item) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 如果当前的 PbItem 没有父节点（即自身是根节点元素），则父节点为空。
    if (pbTreeCurrentItem.value.item.node_key === null) {
      pbNodeMaintainDialogItem.value.parent_long_id = ''
    }
    // 否则，父节点为当前选中元素的父节点。
    else {
      pbNodeMaintainDialogItem.value.parent_long_id = pbTreeCurrentItem.value.item.node_key.long_id
    }
  }
  // 否则，仅剩选择的时 PbNode 一种可能，执行对应的逻辑判断。
  else {
    if (!pbTreeCurrentItem.value.node) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 如果当前的 PbNode 没有父节点（即自身是根节点元素），则父节点为空。
    if (pbTreeCurrentItem.value.node.parent_key === null) {
      pbNodeMaintainDialogItem.value.parent_long_id = ''
    }
    // 否则，父节点为当前选中元素的父节点。
    else {
      pbNodeMaintainDialogItem.value.parent_long_id =
        pbTreeCurrentItem.value.node.parent_key.long_id
    }
  }
  showPbNodeMaintainDialog()
}

function handleShowNodeCreateDialogChild(): void {
  pbTreeAppendChild.value = true
  // 此方法执行是，可以保证 pbTreeCurrentItem 一定是存在的，且是 PbNode 类型。
  // 因此，直接赋值即可。
  if (!pbTreeCurrentItem.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (!pbTreeCurrentItem.value.node) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  pbNodeMaintainDialogItem.value.parent_long_id = pbTreeCurrentItem.value.node.key.long_id
  showPbNodeMaintainDialog()
}

async function handlePbNodeCreate(item: PbNodeMaintainDialogItem): Promise<void> {
  pbNodeMaintainDialogLoading.value += 1
  try {
    const pbSet: DispPbSet | null = pbSetIndicatorValue.value
    if (!pbSet) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const pbTreePanel = pbManagementTreePanelRef.value
    if (!pbTreePanel) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const _parentKey: LongIdKey | null = item.parent_long_id
      ? { long_id: item.parent_long_id }
      : null
    const _key: LongIdKey = await resolveResponse(
      createNode({
        set_key: pbSet.key,
        parent_key: _parentKey,
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `节点 ${item.name} 创建成功`,
      type: 'success',
    })
    const _pbNode: DispPbNode = await resolveResponse(inspectNode(_key))
    if (!_pbNode.parent_key) {
      pbTreePanel.appendRootPbNode(_pbNode)
    } else {
      const _treeNode: TreeNode<PbTreeItem> | null = pbTreeCurrentNode.value
      if (!_treeNode) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      if (pbTreeAppendChild.value) {
        pbTreePanel.appendPbNode(_treeNode, _pbNode)
      } else {
        pbTreePanel.insertPbNodeAfter(_treeNode, _pbNode)
      }
    }
    pbNodeMaintainDialogVisible.value = false
  } finally {
    pbNodeMaintainDialogLoading.value -= 1
  }
}

async function handlePbNodeEdit(item: PbNodeMaintainDialogItem): Promise<void> {
  pbNodeMaintainDialogLoading.value += 1
  try {
    const _parentKey: LongIdKey | null = item.parent_long_id
      ? { long_id: item.parent_long_id }
      : null
    await resolveResponse(
      updateNode({
        key: { long_id: item.long_id },
        parent_key: _parentKey,
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `节点 ${item.name} 更新成功`,
      type: 'success',
    })
    const _pbNode: DispPbNode = await resolveResponse(inspectNode({ long_id: item.long_id }))
    if (!pbManagementTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    pbManagementTreePanelRef.value.updatePbNode(_pbNode)
    pbNodeMaintainDialogVisible.value = false
  } finally {
    pbNodeMaintainDialogLoading.value -= 1
  }
}

// endregion

// region 项目维护对话框

type PbItemMaintainDialogItem = {
  long_id: string
  node_long_id: string
  name: string
  unit: string
  comparator: PbItemComparator
  remark: string
}

const {
  visible: pbItemMaintainDialogVisible,
  item: pbItemMaintainDialogItem,
  mode: pbItemMaintainDialogMode,
  showDialog: showPbItemMaintainDialog,
} = useCreateOnlyMaintainDialog<PbItemMaintainDialogItem>({
  long_id: '',
  node_long_id: '',
  name: '',
  unit: '',
  comparator: 0,
  remark: '',
})
const pbItemMaintainDialogLoading = ref<number>(0)
const pbItemMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
})

const comparatorOptions = [
  { key: 0, label: '越高越好' },
  { key: 1, label: '越低越好' },
]

function handleShowItemCreateDialogParent(): void {
  pbTreeAppendChild.value = false
  // 如果没有选中节点，则节点为空。
  if (pbTreeCurrentItem.value === null) {
    pbItemMaintainDialogItem.value.node_long_id = ''
  }
  // 否则，如果选择的是 PbItem，则执行对应的逻辑判断。
  else if (pbTreeCurrentItem.value.type === 'item') {
    if (!pbTreeCurrentItem.value.item) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 如果当前的 PbItem 没有父节点（即自身是根节点元素），则节点为空。
    if (pbTreeCurrentItem.value.item.node_key === null) {
      pbItemMaintainDialogItem.value.node_long_id = ''
    }
    // 否则，节点为当前选中元素的父节点。
    else {
      pbItemMaintainDialogItem.value.node_long_id = pbTreeCurrentItem.value.item.node_key.long_id
    }
  }
  // 否则，仅剩选择的时 PbNode 一种可能，执行对应的逻辑判断。
  else {
    if (!pbTreeCurrentItem.value.node) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 如果当前的 PbNode 没有父节点（即自身是根节点元素），则节点为空。
    if (pbTreeCurrentItem.value.node.parent_key === null) {
      pbItemMaintainDialogItem.value.node_long_id = ''
    }
    // 否则，节点为当前选中元素的父节点。
    else {
      pbItemMaintainDialogItem.value.node_long_id = pbTreeCurrentItem.value.node.parent_key.long_id
    }
  }
  showPbItemMaintainDialog()
}

function handleShowItemCreateDialogChild(): void {
  pbTreeAppendChild.value = true
  // 此方法执行时，可以保证 pbTreeCurrentItem 一定是存在的，且是 PbNode 类型。
  // 因此，直接赋值即可。
  if (!pbTreeCurrentItem.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (!pbTreeCurrentItem.value.node) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  pbItemMaintainDialogItem.value.node_long_id = pbTreeCurrentItem.value.node.key.long_id
  showPbItemMaintainDialog()
}

async function handlePbItemCreate(item: PbItemMaintainDialogItem): Promise<void> {
  pbItemMaintainDialogLoading.value += 1
  try {
    const pbSet: DispPbSet | null = pbSetIndicatorValue.value
    if (!pbSet) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const pbTreePanel = pbManagementTreePanelRef.value
    if (!pbTreePanel) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const _nodeKey: LongIdKey | null = item.node_long_id ? { long_id: item.node_long_id } : null
    const _key: LongIdKey = await resolveResponse(
      createItem({
        set_key: pbSet.key,
        node_key: _nodeKey,
        name: item.name,
        unit: item.unit,
        comparator: item.comparator,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `项目 ${item.name} 创建成功`,
      type: 'success',
    })
    const _pbItem: DispPbItem = await resolveResponse(inspectItem(_key))
    if (!_pbItem.node_key) {
      pbTreePanel.appendRootPbItem(_pbItem)
    } else {
      const _treeNode: TreeNode<PbTreeItem> | null = pbTreeCurrentNode.value
      if (!_treeNode) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      if (pbTreeAppendChild.value) {
        pbTreePanel.appendPbItem(_treeNode, _pbItem)
      } else {
        pbTreePanel.insertPbItemAfter(_treeNode, _pbItem)
      }
    }
    pbItemMaintainDialogVisible.value = false
  } finally {
    pbItemMaintainDialogLoading.value -= 1
  }
}

async function handlePbItemEdit(item: PbItemMaintainDialogItem): Promise<void> {
  pbItemMaintainDialogLoading.value += 1
  try {
    const _nodeKey: LongIdKey | null = item.node_long_id ? { long_id: item.node_long_id } : null
    await resolveResponse(
      updateItem({
        key: { long_id: item.long_id },
        node_key: _nodeKey,
        name: item.name,
        unit: item.unit,
        comparator: item.comparator,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `项目 ${item.name} 更新成功`,
      type: 'success',
    })
    const _pbItem: DispPbItem = await resolveResponse(inspectItem({ long_id: item.long_id }))
    if (!pbManagementTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    pbManagementTreePanelRef.value.updatePbItem(_pbItem)
    pbItemMaintainDialogVisible.value = false
  } finally {
    pbItemMaintainDialogLoading.value -= 1
  }
}

// endregion

// region 节点编辑面板

async function handlePbNodePropertyUpdated(): Promise<void> {
  const oldNode: DispPbNode | null = pbTreeCurrentItem.value?.node ?? null
  if (!oldNode) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const neoNode = await resolveResponse(inspectNode(oldNode.key))
    if (!pbManagementTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    pbManagementTreePanelRef.value.updatePbNode(neoNode)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 项目编辑面板

async function handlePbItemPropertyUpdated(): Promise<void> {
  const oldItem: DispPbItem | null = pbTreeCurrentItem.value?.item ?? null
  if (!oldItem) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const neoItem = await resolveResponse(inspectItem(oldItem.key))
    if (!pbManagementTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    pbManagementTreePanelRef.value.updatePbItem(neoItem)
  } finally {
    loading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.pb-management-container {
  height: 100%;
  width: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
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

.asset-bom-select {
  width: 100%;
}
</style>
