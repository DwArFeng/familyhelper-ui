<template>
  <div class="navigation-node-edit-panel-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="概览" name="overlook">
        <header-layout-panel class="overlook-container">
          <template v-slot:header>
            <div class="header-container">
              <el-button type="primary" :disabled="readonly" @click="handleShowNodeMaintainDialog">
                编辑属性
              </el-button>
              <el-button type="success" @click="handleInspect">刷新数据</el-button>
            </div>
          </template>
          <template v-slot:default>
            <el-form
              class="property-form"
              label-position="left"
              label-width="40px"
              inline
              :model="navigationNodeOverlookPropertyFormItem"
            >
              <el-form-item label="总数" style="width: 100%">
                {{ navigationNodeOverlookPropertyFormItem.count }}
              </el-form-item>
              <el-form-item class="expand" label="内容" style="width: 100%">
                <text-editor readonly v-model="navigationNodeOverlookPropertyFormItem.content" />
              </el-form-item>
            </el-form>
          </template>
        </header-layout-panel>
      </el-tab-pane>
      <el-tab-pane label="结构" name="structure">
        <header-layout-panel class="structure-container">
          <template v-slot:header>
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowItemCreateParentMaintainDialog"
            >
              新建节点
            </el-button>
            <el-button
              type="primary"
              :disabled="readonly || !structureTreeCurrent"
              @click="handleShowItemCreateChildMaintainDialog"
            >
              新建子节点
            </el-button>
            <el-button
              type="primary"
              :disabled="readonly || !structureTreeCurrent"
              @click="handleFormatIndex"
            >
              格式化索引
            </el-button>
            <el-button type="success" @click="handleInspect">刷新数据</el-button>
          </template>
          <template v-slot:default>
            <div class="structure-container-body">
              <search-tree-panel
                class="flex-item tree-container"
                ref="structureTreePanelRef"
                :key-field="structureTreeKeyField"
                :label-field="structureTreeLabelField"
                :children-field="structureTreeChildrenField"
                :items="structureTreeItems"
                :inspect-button-visible="false"
                :search-filter-handler="
                  (pattern, item) => item.label.toLowerCase().includes(pattern.toLowerCase())
                "
                @onCurrentChanged="handleItemTreeCurrentChanged"
                @onItemEdit="handleShowItemEditDialog"
                @onItemDelete="handleItemDelete"
              >
                <template v-slot:operateArea="{ fireItemEdit, fireItemDelete }">
                  <el-button-group>
                    <el-button
                      class="button"
                      type="primary"
                      :icon="EditPen"
                      :disabled="readonly"
                      @click="fireItemEdit"
                    />
                    <el-button
                      class="button"
                      type="danger"
                      :icon="DeleteIcon"
                      :disabled="readonly"
                      @click="fireItemDelete"
                    />
                  </el-button-group>
                </template>
              </search-tree-panel>
              <el-divider direction="vertical" />
              <div class="flex-item expand">
                <div class="placeholder" v-if="!structureTreeCurrent">请选择导航节点</div>
                <el-form
                  class="property-form"
                  v-else
                  label-position="left"
                  label-width="40px"
                  inline
                  :model="structureTreeCurrent.data"
                >
                  <el-form-item label="索引" style="width: 100%">
                    {{ structureTreeCurrent.data.index }}
                  </el-form-item>
                  <el-form-item label="名称" style="width: 100%">
                    {{ structureTreeCurrent.data.name }}
                  </el-form-item>
                  <el-form-item class="expand" label="内容" style="width: 100%">
                    <text-editor
                      class="text-editor"
                      readonly
                      v-model="structureTreeCurrent.data.content"
                    />
                  </el-form-item>
                  <el-form-item label="备注" style="width: 100%">
                    {{ structureTreeCurrent.data.remark }}
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </template>
        </header-layout-panel>
      </el-tab-pane>
    </el-tabs>
    <maintain-dialog
      v-model:visible="nodeMaintainDialogVisible"
      label-width="100px"
      edit-title="编辑节点属性"
      :loading="nodeMaintainDialogLoading"
      :mode="nodeMaintainDialogMode"
      :item="nodeMaintainDialogItem"
      :close-on-click-modal="false"
      @onItemEdit="handleNodeEdit"
    >
      <el-form-item label="内容" prop="content">
        <text-editor class="form-text-editor" v-model="nodeMaintainDialogItem.content" />
      </el-form-item>
    </maintain-dialog>
    <maintain-dialog
      top="9vh"
      v-model:visible="itemMaintainDialogVisible"
      label-width="100px"
      :create-title="itemMaintainDialogCreateType === 'parent' ? '创建节点' : '创建子节点'"
      :loading="itemMaintainDialogLoading"
      :mode="itemMaintainDialogMode"
      :item="itemMaintainDialogItem"
      :create-rules="itemMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleItemCreate"
      @onItemEdit="handleItemEdit"
    >
      <el-form-item label="索引" prop="index">
        <el-input-number
          class="form-input-number"
          v-model="itemMaintainDialogItem.index"
          :min="0"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="itemMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <text-editor class="form-text-editor" v-model="itemMaintainDialogItem.content" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="itemMaintainDialogItem.remark" placeholder="必填" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import { Delete as DeleteIcon, EditPen } from '@element-plus/icons-vue'

import SearchTreePanel from '@/components/elementPlus/tree/searchTreePanel/SearchTreePanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/elementPlus/text/textEditor/TextEditor.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { type ManagedBean } from '@/components/elementPlus/tree/searchTreePanel/types.ts'
import { useOperableManagedSearchTreePanel } from '@/components/elementPlus/tree/searchTreePanel/composables.ts'

import {
  useEditOnlyMaintainDialog,
  useGeneralMaintainDialog,
} from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import {
  formatIndex,
  insertItem,
  type NavigationNodeInspectResult,
  type NavigationNodeInspectResultItem,
  operateInspect,
  removeItem,
  updateItem,
  updateNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/navigationNode.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'NavigationNodeSubEditPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  category: string | null
  args: string[] | null
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------Props 处理-----------------------------------------------------------
const settingNodeInvalid = computed(() => {
  return props.category === null || props.args === null
})

watch(
  () => props.category,
  () => {
    handlePropsUpdate()
  },
)

watch(
  () => props.args,
  () => {
    handlePropsUpdate()
  },
)

onMounted(() => {
  handlePropsUpdate()
})

function handlePropsUpdate(): void {
  handleInspect()
}

// -----------------------------------------------------------编辑器数据-----------------------------------------------------------
const navigationNode = ref<NavigationNodeInspectResult | null>(null)

function handleInspect(): void {
  handleInspectNavigationNode()
}

async function handleInspectNavigationNode(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const navigationNodeInspectResult: NavigationNodeInspectResult | null = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    if (!navigationNodeInspectResult) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    navigationNode.value = navigationNodeInspectResult
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------Tab 页-----------------------------------------------------------
type TabsActiveName = 'overlook' | 'structure'

const tabsActiveName = ref<TabsActiveName>('overlook')

// -----------------------------------------------------------概览-----------------------------------------------------------
type NavigationNodeOverlookPropertyFormItem = {
  count: number
  content: string
}

type NavigationNodeOverlookDialogItem = {
  content: string
}

const navigationNodeOverlookPropertyFormItem = ref<NavigationNodeOverlookPropertyFormItem>({
  count: 0,
  content: '',
})
const nodeMaintainDialogLoading = ref<number>(0)
const {
  visible: nodeMaintainDialogVisible,
  item: nodeMaintainDialogItem,
  mode: nodeMaintainDialogMode,
  showDialog: showNodeMaintainDialog,
} = useEditOnlyMaintainDialog<
  NavigationNodeOverlookPropertyFormItem,
  NavigationNodeOverlookDialogItem
>(navigationNodeOverlookDialogItemMap, {
  content: '',
})

watch(
  () => navigationNode.value,
  () => {
    syncNavigationNodePropertyFormItem()
  },
)

onMounted(() => {
  syncNavigationNodePropertyFormItem()
})

function syncNavigationNodePropertyFormItem(): void {
  if (!navigationNode.value) {
    navigationNodeOverlookPropertyFormItem.value = {
      count: 0,
      content: '',
    }
  } else {
    navigationNodeOverlookPropertyFormItem.value = {
      count: navigationNode.value.count,
      content: navigationNode.value.content,
    }
  }
}

function navigationNodeOverlookDialogItemMap(
  t: NavigationNodeOverlookPropertyFormItem,
): NavigationNodeOverlookDialogItem {
  return {
    content: t.content,
  }
}

function handleShowNodeMaintainDialog(): void {
  showNodeMaintainDialog(navigationNodeOverlookPropertyFormItem.value)
}

async function handleNodeEdit(item: NavigationNodeOverlookDialogItem): Promise<void> {
  nodeMaintainDialogLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      updateNode({
        category: props.category,
        args: props.args,
        content: item.content,
      }),
    )
    ElMessage({
      showClose: true,
      message: '导航节点属性更新成功',
      type: 'success',
    })
    handleInspect()
    nodeMaintainDialogVisible.value = false
  } finally {
    nodeMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------结构-----------------------------------------------------------
type StructureTreeItem = {
  children: NavigationNodeInspectResultItem[]
}

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

const structureTreePanelRef =
  useTemplateRef<ComponentExposed<typeof SearchTreePanel>>('structureTreePanelRef')

const structureTreeItem = ref<StructureTreeItem>({ children: [] })
const {
  keyField: structureTreeKeyField,
  labelField: structureTreeLabelField,
  childrenField: structureTreeChildrenField,
  items: structureTreeItems,
  updateByLookup: structureTreeUpdateByLookup,
} = useOperableManagedSearchTreePanel<
  NavigationNodeInspectResultItem,
  NavigationNodeInspectResultPlainItem
>(
  (t) => t.key.long_id,
  (t) => t.name,
  navigationNodeInspectResultPlainItemDataMap,
  (t) => t.children,
  null,
  structureTreePanelRef,
)
const structureTreeCurrent = ref<ManagedBean<NavigationNodeInspectResultPlainItem> | null>(null)
const itemMaintainDialogLoading = ref<number>(0)
const {
  visible: itemMaintainDialogVisible,
  item: itemMaintainDialogItem,
  mode: itemMaintainDialogMode,
  showCreateDialog: showItemMaintainDialogCreateDialog,
  showEditDialog: showItemMaintainDialogEditDialog,
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
const itemIndexValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (itemMaintainDialogCreateType.value === 'parent') {
        const treeCurrent: ManagedBean<NavigationNodeInspectResultPlainItem> | null =
          structureTreeCurrent.value
        if (!treeCurrent?.parent) {
          // 判断根节点 index 是否冲突。
          for (const sibling of structureTreeItem.value.children) {
            if (sibling.index === res) {
              callback(new Error('索引值冲突'))
              return Promise.reject()
            }
          }
        } else {
          // 判断同级节点 index 是否冲突。
          for (const sibling of treeCurrent?.parent.children) {
            if (sibling.key === treeCurrent.key) {
              continue
            }
            if (sibling.data.index === res) {
              callback(new Error('索引值冲突'))
              return Promise.reject()
            }
          }
        }
      } else if (itemMaintainDialogCreateType.value === 'child') {
        if (!structureTreeCurrent.value) {
          throw new Error('不应该执行到此处，请联系开发人员')
        }
        const treeCurrent: ManagedBean<NavigationNodeInspectResultPlainItem> =
          structureTreeCurrent.value
        // 判断子节点 index 是否冲突。
        for (const sibling of treeCurrent.children) {
          if (sibling.data.index === res) {
            callback(new Error('索引值冲突'))
            return Promise.reject()
          }
        }
      } else {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const itemMaintainDialogRules = ref({
  index: [{ validator: itemIndexValidator, trigger: 'change' }],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})
const itemMaintainDialogCreateType = ref<'parent' | 'child'>('parent')

watch(
  () => navigationNode.value,
  () => {
    syncStructureTreeItem()
  },
)

onMounted(() => {
  syncStructureTreeItem()
})

function syncStructureTreeItem(): void {
  if (!navigationNode.value) {
    structureTreeItem.value = { children: [] }
  } else {
    structureTreeItem.value = { children: navigationNode.value.children }
  }
  structureTreeUpdateByLookup(structureTreeItem.value.children)
}

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

function handleItemTreeCurrentChanged(
  current: ManagedBean<NavigationNodeInspectResultPlainItem> | null,
): void {
  nextTick(() => {
    structureTreeCurrent.value = current
  })
}

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
  showItemMaintainDialogCreateDialog()
}

function handleShowItemCreateChildMaintainDialog(): void {
  itemMaintainDialogCreateType.value = 'child'
  showItemMaintainDialogCreateDialog()
}

async function handleItemCreate(item: NavigationNodeStructureDialogItem): Promise<void> {
  itemMaintainDialogLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    let parentItemKey: LongIdKey | null
    if (itemMaintainDialogCreateType.value === 'parent') {
      parentItemKey = structureTreeCurrent.value?.data.parent_item_key ?? null
    } else if (itemMaintainDialogCreateType.value === 'child') {
      if (!structureTreeCurrent.value) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      parentItemKey = structureTreeCurrent.value.data.key
    } else {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      insertItem({
        category: props.category,
        args: props.args,
        parent_item_key: parentItemKey,
        index: item.index,
        name: item.name,
        content: item.content,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '导航条目更新成功',
      type: 'success',
    })
    handleInspect()
    itemMaintainDialogVisible.value = false
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

function handleShowItemEditDialog(item: ManagedBean<NavigationNodeInspectResultPlainItem>): void {
  showItemMaintainDialogEditDialog(item.data)
}

async function handleItemEdit(item: NavigationNodeStructureDialogItem): Promise<void> {
  itemMaintainDialogLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    if (!item.item_key) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      updateItem({
        category: props.category,
        args: props.args,
        item_key: item.item_key,
        parent_item_key: item.parent_item_key,
        index: item.index,
        name: item.name,
        content: item.content,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '导航条目更新成功',
      type: 'success',
    })
    if (!structureTreeCurrent.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    handleInspect()
    itemMaintainDialogVisible.value = false
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

async function handleItemDelete(
  item: ManagedBean<NavigationNodeInspectResultPlainItem>,
): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此导航节点。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  itemMaintainDialogLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    if (!item.data.key) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      removeItem({
        category: props.category,
        args: props.args,
        item_key: item.data.key,
      }),
    )
    ElMessage({
      showClose: true,
      message: '导航条目删除成功',
      type: 'success',
    })
    handleInspect()
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

async function handleFormatIndex(): Promise<void> {
  itemMaintainDialogLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    if (!structureTreeCurrent.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const parentItemKey: LongIdKey | null = structureTreeCurrent.value.data.parent_item_key
    await resolveResponse(
      formatIndex({
        category: props.category,
        args: props.args,
        parent_item_key: parentItemKey,
      }),
    )
    ElMessage({
      showClose: true,
      message: '导航节点索引格式化成功',
      type: 'success',
    })
    handleInspect()
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.navigation-node-edit-panel-container {
  height: 100%;
  width: 100%;
}

.tabs-panel {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tabs__content) {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tab-pane) {
  height: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.property-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.property-form .expand {
  height: 0;
  flex-grow: 1;
}

.property-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item:not(:last-child)) {
  margin-bottom: 5px;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.structure-container-body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.structure-container-body .el-divider--vertical {
  height: 100%;
  margin: 0 8px;
}

.structure-container-body .flex-item {
  height: 100%;
}

.structure-container-body .flex-item.expand {
  width: 0;
  flex-grow: 1;
}

.structure-container-body .tree-container {
  width: 400px;
}

.structure-container-body .tree-container .button {
  height: 28px;
  width: 28px;
  padding: 7px;
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

.form-text-editor {
  height: 500px;
}

.form-text-editor {
  height: 500px;
}

.form-input-number {
  width: 200px;
}
</style>
