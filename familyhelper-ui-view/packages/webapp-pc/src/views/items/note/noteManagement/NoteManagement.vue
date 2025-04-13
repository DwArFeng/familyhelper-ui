<template>
  <div class="note-management-container">
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
            :disabled="nonNoteBookSelected || readonly"
            @click="handleShowNodeCreateDialogParent"
          >
            新建节点
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonNoteBookSelected || readonly || nonNoteNodeSelected"
            @click="handleShowNodeCreateDialogChild"
          >
            新建子节点
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonNoteBookSelected || readonly"
            @click="handleShowItemCreateDialogParent"
          >
            新建项目
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonNoteBookSelected || readonly || nonNoteNodeSelected"
            @click="handleShowItemCreateDialogChild"
          >
            新建子项目
          </el-button>
          <el-divider direction="vertical" />
          <note-book-indicator mode="NOTE_MANAGEMENT" @onChanged="handleNoteBookIndicatorChanged" />
        </div>
      </template>
      <template v-slot:west>
        <note-tree-panel
          ref="noteTreePanelRef"
          :note-book-id="noteBookIndicatorValue?.key.long_id ?? ''"
          :readonly="readonly"
          @onCurrentChanged="handleNoteTreeCurrentChanged"
          @onItemDelete="handleNoteTreeItemDelete"
        />
      </template>
      <template v-slot:default>
        <div class="placeholder" v-show="noteTreeCurrentItem === null">请选择节点或项目</div>
        <node-edit-panel
          v-show="noteTreeCurrentItem !== null && noteTreeCurrentItem.type === 'node'"
          :note-node-id="noteTreeCurrentItem?.node?.key.long_id ?? ''"
          :readonly="readonly"
          @onNoteNodePropertyUpdated="handleNoteNodePropertyUpdated"
        />
        <item-edit-panel
          v-show="noteTreeCurrentItem !== null && noteTreeCurrentItem.type === 'item'"
          :note-item-id="noteTreeCurrentItem?.item?.key.long_id ?? ''"
          :readonly="readonly"
          :upsc="itemEditPanelUpsc"
          @onNoteItemPropertyUpdated="handleNoteItemPropertyUpdated"
        />
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="noteNodeMaintainDialogVisible"
      label-width="100px"
      create-title="创建节点"
      :loading="noteNodeMaintainDialogLoading"
      :mode="noteNodeMaintainDialogMode"
      :item="noteNodeMaintainDialogItem"
      :create-rules="noteNodeMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleNoteNodeCreate"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="noteNodeMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="noteNodeMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
    <maintain-dialog
      v-model:visible="noteItemMaintainDialogVisible"
      label-width="100px"
      create-title="创建项目"
      :loading="noteItemMaintainDialogLoading"
      :mode="noteItemMaintainDialogMode"
      :item="noteItemMaintainDialogItem"
      :create-rules="noteItemMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleNoteItemCreate"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="noteItemMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="noteItemMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import type { ComponentExposed } from 'vue-component-type-helpers'

import { ElMessage, ElMessageBox } from 'element-plus'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import type { TreeNode } from '@/components/tree/commons/types.ts'
import { useCreateOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import NoteBookIndicator from '@/views/items/note/noteBook/NoteBookIndicator.vue'

import NodeEditPanel from './NodeEditPanel.vue'
import ItemEditPanel from './ItemEditPanel.vue'
import NoteTreePanel from './subPanels/NoteTreePanel.vue'

import type { LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import type { DispNoteBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/NoteBook.ts'
import type { DispNoteNode } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteNode.ts'
import {
  create as createNoteNode,
  inspectDisp as inspectDispNoteNode,
  remove as removeNoteNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/NoteNode.ts'
import type { DispNoteItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteItem.ts'
import {
  create as createNoteItem,
  inspectDisp as inspectDispNoteItem,
  remove as removeNoteItem,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/NoteItem.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'NoteManagement',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------属性计算-----------------------------------------------------------
const nonNoteBookSelected = computed<boolean>(() => {
  return noteBookIndicatorValue.value === null
})

const readonly = computed<boolean>(() => {
  if (noteBookIndicatorValue.value === null) {
    return true
  }
  return noteBookIndicatorValue.value.permission_level === 1
})

const nonNoteNodeSelected = computed<boolean>(() => {
  const item: NoteTreeItem | null = noteTreeCurrentItem.value
  if (!item) {
    return true
  }
  return item.type !== 'node'
})

const nodeItemSelected = computed<boolean>(() => {
  const item: NoteTreeItem | null = noteTreeCurrentItem.value
  if (!item) {
    return false
  }
  return item.type === 'item'
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const noteBookIndicatorValue = ref<DispNoteBook | null>(null)

function handleNoteBookIndicatorChanged(value: DispNoteBook | null): void {
  noteBookIndicatorValue.value = value
}

// -----------------------------------------------------------笔记本树面板-----------------------------------------------------------
type NoteTreeItem = {
  tree_node_key: string
  type: 'node' | 'item'
  name: string
  has_no_child: boolean
  node?: DispNoteNode
  item?: DispNoteItem
}

const noteTreeCurrentItem = ref<NoteTreeItem | null>(null)
const noteTreeCurrentNode = ref<TreeNode<NoteTreeItem> | null>(null)
const noteTreeAppendChild = ref<boolean>(false)

const noteTreePanelRef = useTemplateRef<ComponentExposed<typeof NoteTreePanel>>('noteTreePanelRef')

function handleNoteTreeCurrentChanged(
  item: NoteTreeItem | null,
  node: TreeNode<NoteTreeItem> | null,
): void {
  // 赋值。
  noteTreeCurrentItem.value = item
  noteTreeCurrentNode.value = node
  // 同步维护对话框 bean。
  syncMaintainDialogItem(item)
}

function syncMaintainDialogItem(item: NoteTreeItem | null): void {
  if (!item) {
    return
  }
  if (item.type === 'node') {
    if (!item.node) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    syncNoteNodeMaintainDialogItem(item.node)
  } else {
    if (!item.item) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    syncNoteItemMaintainDialogItem(item.item)
  }
}

function syncNoteNodeMaintainDialogItem(node: DispNoteNode): void {
  noteNodeMaintainDialogItem.value.long_id = node.key.long_id
  if (node.parent_key === null) {
    noteNodeMaintainDialogItem.value.parent_long_id = ''
  } else {
    noteNodeMaintainDialogItem.value.parent_long_id = node.parent_key.long_id
  }
  noteNodeMaintainDialogItem.value.name = node.name
  noteNodeMaintainDialogItem.value.remark = node.remark
}

function syncNoteItemMaintainDialogItem(item: DispNoteItem): void {
  noteItemMaintainDialogItem.value.long_id = item.key.long_id
  if (item.node_key === null) {
    noteItemMaintainDialogItem.value.node_long_id = ''
  } else {
    noteItemMaintainDialogItem.value.node_long_id = item.node_key.long_id
  }
  noteItemMaintainDialogItem.value.name = item.name
  noteItemMaintainDialogItem.value.remark = item.remark
}

function handleNoteTreeItemDelete(item: NoteTreeItem): void {
  if (item.type === 'node') {
    handleNoteNodeDelete(item)
  } else {
    handleNoteItemDelete(item)
  }
}

async function handleNoteNodeDelete(item: NoteTreeItem): Promise<void> {
  if (!item.node) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const st: DispNoteNode = item.node
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
    await resolveResponse(removeNoteNode(st.key))
    ElMessage({
      showClose: true,
      message: `节点 ${st.name} 删除成功`,
      type: 'success',
      center: true,
    })
    if (!noteTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    noteTreePanelRef.value.remove(item)
  } finally {
    loading.value -= 1
  }
}

async function handleNoteItemDelete(item: NoteTreeItem): Promise<void> {
  if (!item.item) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const st: DispNoteItem = item.item
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
    await resolveResponse(removeNoteItem(st.key))
    ElMessage({
      showClose: true,
      message: `项目 ${st.name} 删除成功`,
      type: 'success',
      center: true,
    })
    if (!noteTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    noteTreePanelRef.value.remove(item)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------节点维护对话框-----------------------------------------------------------
type NoteNodeMaintainDialogItem = {
  long_id: string
  parent_long_id: string
  name: string
  remark: string
}

const {
  visible: noteNodeMaintainDialogVisible,
  item: noteNodeMaintainDialogItem,
  mode: noteNodeMaintainDialogMode,
  showDialog: showNoteNodeMaintainDialog,
} = useCreateOnlyMaintainDialog<NoteNodeMaintainDialogItem>({
  long_id: '',
  parent_long_id: '',
  name: '',
  remark: '',
})
const noteNodeMaintainDialogLoading = ref<number>(0)
const noteNodeMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
})

function handleShowNodeCreateDialogParent(): void {
  noteTreeAppendChild.value = false
  // 如果没有选中节点，则父节点为空。
  if (noteTreeCurrentItem.value === null) {
    noteNodeMaintainDialogItem.value.parent_long_id = ''
  }
  // 否则，如果选择的是 NoteItem，则执行对应的逻辑判断。
  else if (nodeItemSelected.value) {
    if (!noteTreeCurrentItem.value.item) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 如果当前的 NoteItem 没有父节点（即自身是根节点元素），则父节点为空。
    if (noteTreeCurrentItem.value.item.node_key === null) {
      noteNodeMaintainDialogItem.value.parent_long_id = ''
    }
    // 否则，父节点为当前选中元素的父节点。
    else {
      noteNodeMaintainDialogItem.value.parent_long_id =
        noteTreeCurrentItem.value.item.node_key.long_id
    }
  }
  // 否则，仅剩选择的时 NoteNode 一种可能，执行对应的逻辑判断。
  else {
    if (!noteTreeCurrentItem.value.node) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 如果当前的 NoteNode 没有父节点（即自身是根节点元素），则父节点为空。
    if (noteTreeCurrentItem.value.node.parent_key === null) {
      noteNodeMaintainDialogItem.value.parent_long_id = ''
    }
    // 否则，父节点为当前选中元素的父节点。
    else {
      noteNodeMaintainDialogItem.value.parent_long_id =
        noteTreeCurrentItem.value.node.parent_key.long_id
    }
  }
  showNoteNodeMaintainDialog()
}

function handleShowNodeCreateDialogChild(): void {
  noteTreeAppendChild.value = true
  // 此方法执行是，可以保证 noteTreeCurrentItem 一定是存在的，且是 NoteNode 类型。
  // 因此，直接赋值即可。
  if (!noteTreeCurrentItem.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (!noteTreeCurrentItem.value.node) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  noteNodeMaintainDialogItem.value.parent_long_id = noteTreeCurrentItem.value.node.key.long_id
  showNoteNodeMaintainDialog()
}

async function handleNoteNodeCreate(item: NoteNodeMaintainDialogItem): Promise<void> {
  noteNodeMaintainDialogLoading.value += 1
  try {
    const noteBook: DispNoteBook | null = noteBookIndicatorValue.value
    if (!noteBook) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const noteTreePanel = noteTreePanelRef.value
    if (!noteTreePanel) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const _parentKey = item.parent_long_id ? { long_id: item.parent_long_id } : null
    const _key: LongIdKey = await resolveResponse(
      createNoteNode({
        book_key: noteBook.key,
        parent_key: _parentKey,
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `节点 ${item.name} 创建成功`,
      type: 'success',
      center: true,
    })
    const _noteNode: DispNoteNode = await resolveResponse(inspectDispNoteNode(_key))
    if (!_noteNode.parent_key) {
      noteTreePanel.appendRootNoteNode(_noteNode)
    } else {
      const _treeNode: TreeNode<NoteTreeItem> | null = noteTreeCurrentNode.value
      if (!_treeNode) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      if (noteTreeAppendChild.value) {
        noteTreePanel.appendNoteNode(_treeNode, _noteNode)
      } else {
        noteTreePanel.insertAfterNoteNode(_treeNode, _noteNode)
      }
    }
    noteNodeMaintainDialogVisible.value = false
  } finally {
    noteNodeMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------项目维护对话框-----------------------------------------------------------
type NoteItemMaintainDialogItem = {
  long_id: string
  node_long_id: string
  name: string
  remark: string
}

const UPSC_ITEM_EDIT_PANEL: string = 'ui_preference.pc.note.note_management.item_edit_panel'

const {
  visible: noteItemMaintainDialogVisible,
  item: noteItemMaintainDialogItem,
  mode: noteItemMaintainDialogMode,
  showDialog: showNoteItemMaintainDialog,
} = useCreateOnlyMaintainDialog<NoteItemMaintainDialogItem>({
  long_id: '',
  node_long_id: '',
  name: '',
  remark: '',
})
const noteItemMaintainDialogLoading = ref<number>(0)
const noteItemMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
})

const itemEditPanelUpsc = computed<string>(() => {
  return UPSC_ITEM_EDIT_PANEL
})

function handleShowItemCreateDialogParent(): void {
  noteTreeAppendChild.value = false
  // 如果没有选中节点，则节点为空。
  if (noteTreeCurrentItem.value === null) {
    noteItemMaintainDialogItem.value.node_long_id = ''
  }
  // 否则，如果选择的是 NoteItem，则执行对应的逻辑判断。
  else if (nodeItemSelected.value) {
    if (!noteTreeCurrentItem.value.item) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 如果当前的 NoteItem 没有父节点（即自身是根节点元素），则节点为空。
    if (noteTreeCurrentItem.value.item.node_key === null) {
      noteItemMaintainDialogItem.value.node_long_id = ''
    }
    // 否则，节点为当前选中元素的父节点。
    else {
      noteItemMaintainDialogItem.value.node_long_id =
        noteTreeCurrentItem.value.item.node_key.long_id
    }
  }
  // 否则，仅剩选择的时 NoteNode 一种可能，执行对应的逻辑判断。
  else {
    if (!noteTreeCurrentItem.value.node) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 如果当前的 NoteNode 没有父节点（即自身是根节点元素），则节点为空。
    if (noteTreeCurrentItem.value.node.parent_key === null) {
      noteItemMaintainDialogItem.value.node_long_id = ''
    }
    // 否则，节点为当前选中元素的父节点。
    else {
      noteItemMaintainDialogItem.value.node_long_id =
        noteTreeCurrentItem.value.node.parent_key.long_id
    }
  }
  showNoteItemMaintainDialog()
}

function handleShowItemCreateDialogChild(): void {
  noteTreeAppendChild.value = true
  // 此方法执行是，可以保证 noteTreeCurrentItem 一定是存在的，且是 NoteNode 类型。
  // 因此，直接赋值即可。
  if (!noteTreeCurrentItem.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (!noteTreeCurrentItem.value.node) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  noteItemMaintainDialogItem.value.node_long_id = noteTreeCurrentItem.value.node.key.long_id
  showNoteItemMaintainDialog()
}

async function handleNoteItemCreate(item: NoteItemMaintainDialogItem): Promise<void> {
  noteItemMaintainDialogLoading.value += 1
  try {
    const noteBook: DispNoteBook | null = noteBookIndicatorValue.value
    if (!noteBook) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const noteTreePanel = noteTreePanelRef.value
    if (!noteTreePanel) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const _nodeKey = item.node_long_id ? { long_id: item.node_long_id } : null
    const _key: LongIdKey = await resolveResponse(
      createNoteItem({
        book_key: noteBook.key,
        node_key: _nodeKey,
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `节点 ${item.name} 创建成功`,
      type: 'success',
      center: true,
    })
    const _noteItem: DispNoteItem = await resolveResponse(inspectDispNoteItem(_key))
    if (!_noteItem.node_key) {
      noteTreePanel.appendRootNoteItem(_noteItem)
    } else {
      const _treeNode: TreeNode<NoteTreeItem> | null = noteTreeCurrentNode.value
      if (!_treeNode) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      if (noteTreeAppendChild.value) {
        noteTreePanel.appendNoteItem(_treeNode, _noteItem)
      } else {
        noteTreePanel.insertAfterNoteItem(_treeNode, _noteItem)
      }
    }
    noteItemMaintainDialogVisible.value = false
  } finally {
    noteItemMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------节点编辑面板-----------------------------------------------------------
async function handleNoteNodePropertyUpdated(): Promise<void> {
  const oldNode: DispNoteNode | null = noteTreeCurrentItem.value?.node ?? null
  if (!oldNode) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const neoNode = await resolveResponse(inspectDispNoteNode(oldNode.key))
    if (!noteTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    noteTreePanelRef.value.updateNoteNode(neoNode)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------项目编辑面板-----------------------------------------------------------
async function handleNoteItemPropertyUpdated(): Promise<void> {
  const oldItem: DispNoteItem | null = noteTreeCurrentItem.value?.item ?? null
  if (!oldItem) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const neoItem = await resolveResponse(inspectDispNoteItem(oldItem.key))
    if (!noteTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    noteTreePanelRef.value.updateNoteItem(neoItem)
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.note-management-container {
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
</style>
