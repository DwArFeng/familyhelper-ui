<template>
  <header-layout-panel class="tab-inner structure-tab">
    <template v-slot:header>
      <div class="header-container wrap">
        <native-button kind="primary" @click="handleShowItemCreateParentMaintainDialog">
          新建节点
        </native-button>
        <native-button
          kind="primary"
          :disabled="structureTreeCurrent === null"
          @click="handleShowItemCreateChildMaintainDialog"
        >
          新建子节点
        </native-button>
        <native-button
          kind="primary"
          :disabled="structureTreeCurrent === null"
          @click="handleFormatIndex"
        >
          格式化索引
        </native-button>
        <native-button kind="success" @click="emitInspect">刷新数据</native-button>
      </div>
    </template>
    <template v-slot:default>
      <div class="structure-body">
        <search-tree-panel
          class="tree-panel"
          :key-field="structureTreeKeyField"
          :label-field="structureTreeLabelField"
          :children-field="structureTreeChildrenField"
          :items="structureTreeItems"
          :search-filter-handler="structureSearchFilter"
          @on-current-changed="handleItemTreeCurrentChanged"
          @on-item-inspect="handleShowItemInspectDialogFromTree"
          @on-item-edit="handleShowItemEditDialogFromTree"
          @on-item-delete="handleItemDeleteFromTree"
        />
        <div class="vertical-rule" />
        <div class="detail-panel">
          <placeholder-panel v-if="structureTreeCurrent === null" text="请选择导航节点" />
          <div v-else class="detail-form-wrap">
            <node-info-form
              :content="structurePanelContent"
              :fallback-key="structureTreeCurrent.data.name"
              @update:content="structurePanelContent = $event"
            />
          </div>
        </div>
      </div>
    </template>
  </header-layout-panel>
  <maintain-dialog
    v-model:visible="itemMaintainDialogVisible"
    label-width="160px"
    :create-title="itemMaintainDialogCreateType === 'parent' ? '创建节点' : '创建子节点'"
    edit-title="编辑节点"
    inspect-title="查看节点"
    :loading="itemMaintainDialogLoading > 0"
    :mode="itemMaintainDialogMode"
    :item="itemMaintainDialogItem"
    :close-on-click-modal="false"
    width="min(94vw, 1020px)"
    top="4vh"
    @on-item-create="handleItemCreate"
    @on-item-edit="handleItemEdit"
  >
    <native-form-item label="索引">
      <input
        v-model.number="itemMaintainDialogItem.index"
        class="dialog-input"
        type="number"
        min="0"
        step="1"
        :readonly="itemMaintainDialogMode === 'INSPECT'"
      />
    </native-form-item>
    <native-form-item label="名称">
      <input
        v-model="itemMaintainDialogItem.name"
        class="dialog-input"
        type="text"
        placeholder="必填"
        :readonly="itemMaintainDialogMode === 'INSPECT'"
      />
    </native-form-item>
    <native-form-item label="备注">
      <input
        v-model="itemMaintainDialogItem.remark"
        class="dialog-input"
        type="text"
        :readonly="itemMaintainDialogMode === 'INSPECT'"
      />
    </native-form-item>
    <node-info-form
      labelWidth="160px"
      :content="itemMaintainDialogItem.content"
      :fallback-key="itemMaintainDialogItem.name || 'node'"
      :readonly="itemMaintainDialogMode === 'INSPECT'"
      @update:content="itemMaintainDialogItem.content = $event"
    />
  </maintain-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import SearchTreePanel from '@/components/comvisual/tree/searchTreePanel/SearchTreePanel.vue'

import { type ManagedBean } from '@/components/comvisual/tree/searchTreePanel/types.ts'
import { useManagedSearchTreePanel } from '@/components/comvisual/tree/searchTreePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import NodeInfoForm from './NodeInfoForm.vue'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import {
  formatIndex,
  insertItem,
  type NavigationNodeInspectResult,
  type NavigationNodeInspectResultItem,
  removeItem,
  updateItem,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/navigationNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { SETTINGREPO_CATEGORY } from '../customNavigation.ts'

defineOptions({
  name: 'NavigationStructurePanel',
})

// region Props 定义

type Props = {
  navigationNode: NavigationNodeInspectResult | null
  selectedKey: string | null
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  inspect: []
  'loading-delta': [delta: number]
}

const emit = defineEmits<Emits>()

function emitInspect(): void {
  emit('inspect')
}

function emitLoadingDelta(delta: number): void {
  emit('loading-delta', delta)
}

// endregion

// region 结构树类型

type NavigationNodeInspectResultPlainItem = {
  key: LongIdKey
  parent_item_key: LongIdKey | null
  index: number
  name: string
  content: string
  remark: string
}

type NavigationNodeStructureDialogItem = {
  item_key: LongIdKey | null
  parent_item_key: LongIdKey | null
  index: number
  name: string
  content: string
  remark: string
}

type StructureTreeItem = {
  children: NavigationNodeInspectResultItem[]
}

// endregion

// region 结构树 composable 与同步

function navigationNodeInspectResultPlainItemDataMap(
  t: NavigationNodeInspectResultItem,
): NavigationNodeInspectResultPlainItem {
  return {
    key: t.key,
    parent_item_key: t.parent_item_key,
    index: t.index,
    name: t.name,
    content: t.content,
    remark: t.remark,
  }
}

const structureTreeItem = ref<StructureTreeItem>({ children: [] })

const {
  keyField: structureTreeKeyField,
  labelField: structureTreeLabelField,
  childrenField: structureTreeChildrenField,
  items: structureTreeItems,
  updateByLookup: structureTreeUpdateByLookup,
} = useManagedSearchTreePanel<
  NavigationNodeInspectResultItem,
  NavigationNodeInspectResultPlainItem
>(
  (t) => t.key.long_id,
  (t) => t.name,
  navigationNodeInspectResultPlainItemDataMap,
  (t) => t.children,
  null,
)

function syncStructureTreeItem(): void {
  if (!props.navigationNode) {
    structureTreeItem.value = { children: [] }
  } else {
    structureTreeItem.value = { children: props.navigationNode.children ?? [] }
  }
  structureTreeUpdateByLookup(structureTreeItem.value.children)
}

watch(() => props.navigationNode, syncStructureTreeItem, { immediate: true })

function structureSearchFilter(
  pattern: string,
  item: ManagedBean<NavigationNodeInspectResultPlainItem>,
): boolean {
  return item.label.toLowerCase().includes(pattern.toLowerCase())
}

// endregion

// region 结构树选中与右侧内容

const structureTreeCurrent = ref<ManagedBean<NavigationNodeInspectResultPlainItem> | null>(null)

const structurePanelContent = ref<string>('')

function handleItemTreeCurrentChanged(
  current: ManagedBean<NavigationNodeInspectResultPlainItem> | null,
): void {
  nextTick(() => {
    structureTreeCurrent.value = current
    structurePanelContent.value = current?.data.content ?? ''
  })
}

// endregion

// region 节点维护对话框

const itemMaintainDialogLoading = ref(0)
const {
  visible: itemMaintainDialogVisible,
  item: itemMaintainDialogItem,
  mode: itemMaintainDialogMode,
  showCreateDialog: showItemMaintainDialogCreateDialog,
  showEditDialog: showItemMaintainDialogEditDialog,
  showInspectDialog: showItemMaintainDialogInspectDialog,
} = useGeneralMaintainDialog<
  NavigationNodeInspectResultPlainItem,
  NavigationNodeStructureDialogItem
>(navigationNodeStructureDialogItemMap, {
  item_key: null,
  parent_item_key: null,
  index: 0,
  name: '',
  content: '',
  remark: '',
})

const itemMaintainDialogCreateType = ref<'parent' | 'child'>('parent')

function navigationNodeStructureDialogItemMap(
  t: NavigationNodeInspectResultPlainItem,
): NavigationNodeStructureDialogItem {
  return {
    item_key: t.key,
    parent_item_key: t.parent_item_key,
    index: t.index,
    name: t.name,
    content: t.content,
    remark: t.remark,
  }
}

function handleShowItemCreateParentMaintainDialog(): void {
  itemMaintainDialogCreateType.value = 'parent'
  itemMaintainDialogItem.value.parent_item_key =
    structureTreeCurrent.value?.data.parent_item_key ?? null
  showItemMaintainDialogCreateDialog()
}

function handleShowItemCreateChildMaintainDialog(): void {
  itemMaintainDialogCreateType.value = 'child'
  const cur = structureTreeCurrent.value
  if (!cur) {
    notifyWarning('请选择父节点')
    return
  }
  itemMaintainDialogItem.value.parent_item_key = cur.data.key
  showItemMaintainDialogCreateDialog()
}

function handleShowItemEditDialogFromTree(
  item: ManagedBean<NavigationNodeInspectResultPlainItem>,
): void {
  showItemMaintainDialogEditDialog(item.data)
}

function handleShowItemInspectDialogFromTree(
  item: ManagedBean<NavigationNodeInspectResultPlainItem>,
): void {
  showItemMaintainDialogInspectDialog(item.data)
}

// endregion

// region 结构树 CRUD 与格式化

function navigationArgs(): string[] | null {
  const k = props.selectedKey
  return k === null ? null : ['custom', k]
}

async function handleItemCreate(item: NavigationNodeStructureDialogItem): Promise<void> {
  const args = navigationArgs()
  if (args === null) {
    return
  }
  if (!item.name.trim()) {
    notifyWarning('名称不能为空')
    return
  }
  let parentItemKey: LongIdKey | null
  if (itemMaintainDialogCreateType.value === 'parent') {
    parentItemKey = structureTreeCurrent.value?.data.parent_item_key ?? null
  } else {
    parentItemKey = structureTreeCurrent.value?.data.key ?? null
  }
  itemMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insertItem({
        category: SETTINGREPO_CATEGORY,
        args,
        parent_item_key: parentItemKey,
        index: item.index,
        name: item.name.trim(),
        content: item.content,
        remark: item.remark.trim(),
      }),
    )
    itemMaintainDialogVisible.value = false
    notifySuccess(`导航节点 ${item.name.trim()} 创建成功`)
    emitInspect()
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

async function handleItemEdit(item: NavigationNodeStructureDialogItem): Promise<void> {
  const args = navigationArgs()
  if (args === null || !item.item_key) {
    return
  }
  if (!item.name.trim()) {
    notifyWarning('名称不能为空')
    return
  }
  itemMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updateItem({
        category: SETTINGREPO_CATEGORY,
        args,
        item_key: item.item_key,
        parent_item_key: item.parent_item_key,
        index: item.index,
        name: item.name.trim(),
        content: item.content,
        remark: item.remark.trim(),
      }),
    )
    itemMaintainDialogVisible.value = false
    notifySuccess(`导航节点 ${item.name.trim()} 更新成功`)
    emitInspect()
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

async function handleItemDeleteFromTree(
  item: ManagedBean<NavigationNodeInspectResultPlainItem>,
): Promise<void> {
  if (
    !window.confirm(
      '此操作将永久删除该导航节点（含其子节点）。\n' +
        '如果您不知道删除后会产生什么后果，请不要进行操作！\n' +
        '错误的操作可能导致前端界面或导航结构异常。\n' +
        '是否继续?',
    )
  ) {
    return
  }
  const args = navigationArgs()
  if (args === null) {
    return
  }
  emitLoadingDelta(1)
  try {
    await resolveResponse(
      removeItem({
        category: SETTINGREPO_CATEGORY,
        args,
        item_key: item.data.key,
      }),
    )
    structureTreeCurrent.value = null
    structurePanelContent.value = ''
    notifySuccess(`导航节点 ${item.data.name} 删除成功`)
    emitInspect()
  } finally {
    emitLoadingDelta(-1)
  }
}

async function handleFormatIndex(): Promise<void> {
  const cur = structureTreeCurrent.value
  const args = navigationArgs()
  if (!cur || args === null) {
    notifyWarning('请选择节点')
    return
  }
  emitLoadingDelta(1)
  try {
    await resolveResponse(
      formatIndex({
        category: SETTINGREPO_CATEGORY,
        args,
        parent_item_key: cur.data.parent_item_key,
      }),
    )
    notifySuccess(`导航节点 ${cur.data.name} 的同级索引已格式化`)
    emitInspect()
  } finally {
    emitLoadingDelta(-1)
  }
}

// endregion
</script>

<style scoped>
.tab-inner {
  height: 100%;
  min-height: 0;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.header-container.wrap {
  flex-wrap: wrap;
}

.structure-body {
  display: flex;
  flex-direction: row;
  height: 100%;
  min-height: 280px;
  gap: 0;
}

.tree-panel {
  width: min(380px, 42%);
  flex-shrink: 0;
  min-height: 0;
}

.vertical-rule {
  width: 1px;
  background: #e4e7ed;
  margin: 0 8px;
  flex-shrink: 0;
}

.detail-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.detail-form-wrap {
  padding: 4px 4px 12px;
}

.dialog-input {
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
