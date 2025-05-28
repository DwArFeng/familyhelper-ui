<template>
  <div class="asset-bom-container">
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
            :disabled="nonAssetCatalogSelected || readonly"
            @click="handleShowItemCreateDialogParent"
          >
            新建项目
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonAssetCatalogSelected || readonly || nonItemSelected"
            @click="handleShowItemCreateDialogChild"
          >
            新建子项目
          </el-button>
          <el-divider direction="vertical" />
          <asset-catalog-indicator
            mode="ASSET_BOM"
            @onChanged="handleAssetCatalogIndicatorChanged"
          />
        </div>
      </template>
      <template v-slot:west>
        <item-tree-panel
          ref="itemTreePanel"
          mode="ASSET_BOM"
          :asset-catalog-id="assetCatalogIndicatorValue?.key.long_id ?? ''"
          :readonly="readonly"
          @onCurrentChanged="handleItemTreeCurrentChanged"
          @onItemDelete="handleItemTreeItemDelete"
        />
      </template>
      <template v-slot:default>
        <item-edit-panel
          :item-id="itemTreeCurrentItem?.item?.key.long_id ?? ''"
          :readonly="readonly"
          :upsc="itemEditPanelUpsc"
          @onItemPropertyUpdated="handleItemPropertyUpdated"
        />
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="itemMaintainDialogVisible"
      label-width="100px"
      create-title="创建项目"
      :loading="itemMaintainDialogLoading"
      :mode="itemMaintainDialogMode"
      :item="itemMaintainDialogItem"
      :create-rules="itemMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleItemCreate"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="itemMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          class="asset-bom-select"
          v-model="itemMaintainDialogItem.type"
          placeholder="请选择"
        >
          <el-option
            v-for="item in itemTypeIndicators"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签" prop="label_string_ids">
        <el-select
          class="asset-bom-select"
          v-model="itemMaintainDialogItem.label_string_ids"
          placeholder="请选择"
          multiple
        >
          <el-option
            v-for="item in itemLabels"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生命周期" prop="life_cycle">
        <el-select
          class="asset-bom-select"
          v-model="itemMaintainDialogItem.life_cycle"
          placeholder="请选择"
        >
          <el-option
            v-for="item in itemLifeCycleIndicator"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="itemMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { type TreeNode } from '@/components/tree/commons/types.ts'
import { useCreateOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import AssetCatalogIndicator from '@/views/nodes/assetsManagement/assetCatalog/AssetCatalogIndicator.vue'

import ItemEditPanel from './ItemEditPanel.vue'
import ItemTreePanel from './subPanels/ItemTreePanel.vue'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type DispAssetCatalog } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/assetCatalog.ts'
import { type ItemTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemTypeIndicator.ts'
import { all as allItemTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemTypeIndicator.ts'
import { type ItemLabel } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemLabel.ts'
import { allExists as allLabelExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemLabel.ts'
import { all as allItemLabel } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemLabel.ts'
import {
  type DispItem,
  type ItemLifeCycle,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/item.ts'
import {
  create,
  inspectDisp,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/item.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupAllToList } from '@/util/lookup.ts'

defineOptions({
  name: 'AssetBom',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

function handleSearch(): void {
  handleItemTypeIndicatorAllSearch()
  handleItemLabelAllSearch()
}

async function handleItemTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    itemTypeIndicators.value = await lookupAllToList((pagingInfo) =>
      allItemTypeIndicator(pagingInfo),
    )
  } finally {
    loading.value -= 1
  }
}

async function handleItemLabelAllSearch(): Promise<void> {
  loading.value += 1
  try {
    itemLabels.value = await lookupAllToList((pagingInfo) => allItemLabel(pagingInfo))
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSearch()
})

// -----------------------------------------------------------属性计算-----------------------------------------------------------
const nonAssetCatalogSelected = computed<boolean>(() => {
  return assetCatalogIndicatorValue.value === null
})

const readonly = computed<boolean>(() => {
  if (assetCatalogIndicatorValue.value === null) {
    return true
  }
  return assetCatalogIndicatorValue.value.permission_level === 1
})

const nonItemSelected = computed<boolean>(() => {
  const item: ItemTreeItem | null = itemTreeCurrentItem.value
  return item === null
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const assetCatalogIndicatorValue = ref<DispAssetCatalog | null>(null)

function handleAssetCatalogIndicatorChanged(value: DispAssetCatalog | null): void {
  assetCatalogIndicatorValue.value = value
}

async function handleShowItemCreateDialogParent(): Promise<void> {
  // 同步对话框实体。
  itemTreeAppendChild.value = false
  // 如果没有选中节点，则节点为空。
  if (itemTreeCurrentItem.value === null) {
    itemMaintainDialogItem.value.parent_long_id = ''
  }
  // 否则执行对应的逻辑判断。
  else {
    // 如果当前的 Item 没有父节点（即自身是根节点元素），则节点为空。
    if (itemTreeCurrentItem.value.item.parent_key === null) {
      itemMaintainDialogItem.value.parent_long_id = ''
    }
    // 否则，节点为当前选中的节点。
    else {
      itemMaintainDialogItem.value.parent_long_id =
        itemTreeCurrentItem.value.item.parent_key.long_id
    }
  }
  // 显示对话框。
  showItemMaintainDialog()
  // 重新加载类型和标签数据。
  itemMaintainDialogLoading.value += 1
  try {
    itemTypeIndicators.value = await lookupAllToList((pagingInfo) =>
      allItemTypeIndicator(pagingInfo),
    )
    itemLabels.value = await lookupAllToList((pagingInfo) => allItemLabel(pagingInfo))
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

async function handleShowItemCreateDialogChild(): Promise<void> {
  // 同步对话框实体。
  itemTreeAppendChild.value = true
  // 此方法执行是，可以保证 noteTreeCurrentItem 一定是存在的，因此，直接赋值即可。
  if (!itemTreeCurrentItem.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  itemMaintainDialogItem.value.parent_long_id = itemTreeCurrentItem.value.item.key.long_id
  // 显示对话框。
  showItemMaintainDialog()
  // 重新加载类型和标签数据。
  itemMaintainDialogLoading.value += 1
  try {
    itemTypeIndicators.value = await lookupAllToList((pagingInfo) =>
      allItemTypeIndicator(pagingInfo),
    )
    itemLabels.value = await lookupAllToList((pagingInfo) => allItemLabel(pagingInfo))
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------项目树面板-----------------------------------------------------------
type ItemTreeItem = {
  tree_node_key: string
  name: string
  has_no_child: boolean
  item: DispItem
}

const itemTreeCurrentItem = ref<ItemTreeItem | null>(null)
const itemTreeCurrentNode = ref<TreeNode<ItemTreeItem> | null>(null)
const itemTreeAppendChild = ref<boolean>(false)

const itemTreePanelRef = useTemplateRef<ComponentExposed<typeof ItemTreePanel>>('itemTreePanel')

function handleItemTreeCurrentChanged(
  item: ItemTreeItem | null,
  node: TreeNode<ItemTreeItem> | null,
): void {
  // 赋值。
  itemTreeCurrentItem.value = item
  itemTreeCurrentNode.value = node
  // 同步维护对话框 bean。
  syncItemMaintainDialogItem(item?.item ?? null)
}

function syncItemMaintainDialogItem(item: DispItem | null): void {
  if (!item) {
    itemMaintainDialogItem.value.long_id = ''
    itemMaintainDialogItem.value.parent_long_id = ''
    itemMaintainDialogItem.value.name = ''
    itemMaintainDialogItem.value.label_string_ids = []
    itemMaintainDialogItem.value.type = ''
    itemMaintainDialogItem.value.life_cycle = 0
    itemMaintainDialogItem.value.remark = ''
  } else {
    itemMaintainDialogItem.value.long_id = item.key.long_id
    if (item.parent_key === null) {
      itemMaintainDialogItem.value.parent_long_id = ''
    } else {
      itemMaintainDialogItem.value.parent_long_id = item.parent_key.long_id
    }
    itemMaintainDialogItem.value.name = item.name
    itemMaintainDialogItem.value.label_string_ids = item.labels.map((label) => label.key.string_id)
    itemMaintainDialogItem.value.type = item.item_type
    itemMaintainDialogItem.value.life_cycle = item.life_cycle
    itemMaintainDialogItem.value.remark = item.remark
  }
}

async function handleItemTreeItemDelete(item: ItemTreeItem): Promise<void> {
  const st = item.item
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此项目，此项目的子项目将会一同被删除。<br>' +
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
    await remove(st.key)
    ElMessage({
      showClose: true,
      message: `项目 ${st.name} 删除成功`,
      type: 'success',
      center: true,
    })
    if (!itemTreePanelRef.value) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    itemTreePanelRef.value.remove(st)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------项目类型指示器-----------------------------------------------------------
const itemTypeIndicators = ref<ItemTypeIndicator[]>([])

// -----------------------------------------------------------项目标签-----------------------------------------------------------
const itemLabels = ref<ItemLabel[]>([])

// -----------------------------------------------------------项目生命周期指示器-----------------------------------------------------------
type ItemLifeCycleIndicator = {
  key: ItemLifeCycle
  label: string
}[]

const itemLifeCycleIndicator = ref<ItemLifeCycleIndicator>([
  { key: 0, label: '准备中' },
  { key: 1, label: '使用中' },
  { key: 2, label: '禁用中' },
  { key: 3, label: '已废弃' },
])

// -----------------------------------------------------------项目维护对话框-----------------------------------------------------------
type ItemMaintainDialogItem = {
  long_id: string
  parent_long_id: string
  label_string_ids: string[]
  name: string
  type: string
  life_cycle: ItemLifeCycle
  remark: string
}

const {
  visible: itemMaintainDialogVisible,
  item: itemMaintainDialogItem,
  mode: itemMaintainDialogMode,
  showDialog: showItemMaintainDialog,
} = useCreateOnlyMaintainDialog<ItemMaintainDialogItem>({
  long_id: '',
  parent_long_id: '',
  label_string_ids: [],
  name: '',
  type: '',
  life_cycle: 0,
  remark: '',
})
const itemMaintainDialogLabelExistsValidator: FormItemRule['validator'] = (
  _rule,
  value: string[],
  callback,
) => {
  if (value.length === 0) {
    callback()
    return
  }
  const keys = value.map((key) => ({ string_id: key }))
  resolveResponse(allLabelExists(keys))
    .then((res) => {
      if (!res) {
        callback(new Error('至少一个标签不存在'))
      } else {
        callback()
      }
    })
    .catch(() => {})
}
const itemMaintainDialogLoading = ref<number>(0)
const itemMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
  label_string_ids: [{ validator: itemMaintainDialogLabelExistsValidator, trigger: 'blur' }],
  type: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
  life_cycle: [{ required: true, message: '生命周期不能为空', trigger: 'blur' }],
})

async function handleItemCreate(item: ItemMaintainDialogItem): Promise<void> {
  itemMaintainDialogLoading.value += 1
  try {
    const assetCatalog: DispAssetCatalog | null = assetCatalogIndicatorValue.value
    if (!assetCatalog) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const itemTreePanel = itemTreePanelRef.value
    if (!itemTreePanel) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const _parentKey: LongIdKey | null = item.parent_long_id
      ? { long_id: item.parent_long_id }
      : null
    const _itemKey: LongIdKey = await resolveResponse(
      create({
        asset_catalog_key: assetCatalog.key,
        parent_key: _parentKey,
        label_keys: item.label_string_ids.map((key) => ({ string_id: key })),
        name: item.name,
        type: item.type,
        life_cycle: item.life_cycle,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `项目 ${item.name} 创建成功`,
      type: 'success',
      center: true,
    })
    const _item = await resolveResponse(inspectDisp(_itemKey))
    if (!_item.parent_key) {
      itemTreePanel.appendRoot(_item)
    } else {
      const _treeNode: TreeNode<ItemTreeItem> | null = itemTreeCurrentNode.value
      if (!_treeNode) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      if (itemTreeAppendChild.value) {
        itemTreePanel.append(_treeNode, _item)
      } else {
        itemTreePanel.insertAfter(_treeNode, _item)
      }
    }
    itemMaintainDialogVisible.value = false
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------项目编辑面板-----------------------------------------------------------
const UPSC_ITEM_EDIT_PANEL: string = 'ui_preference.pc.assert_management.assert_bom.item_edit_panel'

const itemEditPanelUpsc = computed<string>(() => {
  return UPSC_ITEM_EDIT_PANEL
})

async function handleItemPropertyUpdated(): Promise<void> {
  const _oldItem: DispItem | null = itemTreeCurrentItem.value?.item ?? null
  if (!_oldItem) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const _neoItem = await resolveResponse(inspectDisp(_oldItem.key))
    if (!itemTreePanelRef) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    itemTreePanelRef.value?.update(_neoItem)
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.asset-bom-container {
  width: 100%;
  height: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.asset-bom-select {
  width: 100%;
}
</style>
