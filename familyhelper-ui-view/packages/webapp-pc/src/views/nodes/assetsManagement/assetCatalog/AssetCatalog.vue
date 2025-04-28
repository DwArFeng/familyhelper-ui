<template>
  <div class="asset-catalog-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleAssetCatalogSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-switch
            v-model="inspectAllSwitchValue"
            active-text="看所有的"
            inactive-text="看自己的"
            @change="handleAssetCatalogSearch"
          />
        </div>
      </template>
      <template v-slot:default>
        <card-panel
          v-loading="assetCatalogCardLoading"
          title-field="name"
          card-width="calc(20% - 18px)"
          :items="assetCatalogCardItems"
          :max-card="assetCatalogCardMaxCard"
          :show-contextmenu="true"
          :contextmenu-width="120"
          @onItemAdd="handleAssetCatalogToCreate"
        >
          <template v-slot:default="{ item }">
            <div class="asset-catalog-card-container">
              <div class="asset-catalog-property">
                <span class="iconfont asset-catalog-property-icon" style="color: black">
                  &#xfffa;
                </span>
                <span class="asset-catalog-property-text">
                  权限: {{ (item as AssetCatalogCardItem).formatted_permission_level }}
                </span>
              </div>
              <div class="asset-catalog-property">
                <span class="iconfont asset-catalog-property-icon" style="color: black">
                  &#xfffb;
                </span>
                <span class="asset-catalog-property-text">
                  所有者: {{ (item as AssetCatalogCardItem).owner_display_name }}
                </span>
              </div>
              <div class="asset-catalog-property">
                <span class="iconfont asset-catalog-property-icon" style="color: black">
                  &#xffe7;
                </span>
                <span class="asset-catalog-property-text">
                  项目总数: {{ (item as AssetCatalogCardItem).item_count }}
                </span>
              </div>
              <div class="asset-catalog-property">
                <span class="iconfont asset-catalog-property-icon" style="color: black">
                  &#xffef;
                </span>
                <span class="asset-catalog-property-text">
                  创建日期: {{ (item as AssetCatalogCardItem).formatted_created_date }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:header="{ item }">
            <el-button-group class="asset-catalog-control-button-group">
              <el-button
                class="card-button"
                :icon="EditPen"
                :disabled="item.permission_level !== 0"
                @click="handleItemToEdit(item as AssetCatalogCardItem)"
              />
              <el-button
                class="card-button"
                :icon="LockIcon"
                :disabled="item.permission_level !== 0"
                @click="handleItemToPermit(item as AssetCatalogCardItem)"
              />
              <el-button
                class="card-button"
                :icon="DeleteIcon"
                :disabled="item.permission_level !== 0"
                @click="handleItemToDelete(item as AssetCatalogCardItem)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ item, close }">
            <ul class="my-contextmenu">
              <li
                :class="{ disabled: (item as AssetCatalogCardItem).permission_level !== 0 }"
                @click="handleEditMenuItemClicked(item as AssetCatalogCardItem, close)"
              >
                编辑...
              </li>
              <li
                :class="{ disabled: (item as AssetCatalogCardItem).permission_level !== 0 }"
                @click="handlePermitMenuItemClicked(item as AssetCatalogCardItem, close)"
              >
                分配权限...
              </li>
              <li
                :class="{ disabled: (item as AssetCatalogCardItem).permission_level !== 0 }"
                @click="handleDeleteMenuItemClicked(item as AssetCatalogCardItem, close)"
              >
                删除...
              </li>
            </ul>
          </template>
        </card-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="assetCatalogMaintainDialogVisible"
      :loading="assetCatalogMaintainDialogLoading"
      :mode="assetCatalogMaintainDialogMode"
      :item="assetCatalogMaintainDialogItem"
      :create-rules="assetCatalogMaintainDialogRules"
      :edit-rules="assetCatalogMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleAssetCatalogCreate"
      @onItemEdit="handleAssetCatalogEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="assetCatalogMaintainDialogItem.name"
          :readonly="assetCatalogMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="assetCatalogMaintainDialogItem.remark"
          :readonly="assetCatalogMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <permit-maintain-dialog
      v-model:visible="permitMaintainDialogVisible"
      :asset-catalog-id="permitMaintainDialogAssetCatalogId"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon, EditPen, Lock as LockIcon } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import CardPanel from '@/components/card/cardPanel/CardPanel.vue'

import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'
import { useGeneralCardPanel } from '@/components/card/cardPanel/composables.ts'

import PermitMaintainDialog from './subDialogs/PermitMaintainDialog.vue'

import { type DispAssetCatalog } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/assetCatalog.ts'
import {
  create,
  remove,
  update,
  allOwnedDisp,
  allPermittedDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/assetCatalog.ts'
import { type PoacPermissionLevel } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/poac.ts'
import { lookupAllToList, lookupCount } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { userOwned } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteBook.ts'

defineOptions({
  name: 'AssetCatalog',
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const inspectAllSwitchValue = ref<boolean>(false)

// -----------------------------------------------------------资产目录查询-----------------------------------------------------------
function handleAssetCatalogSearch(): void {
  if (inspectAllSwitchValue.value) {
    handleAssetCatalogAllPermittedSearch()
  } else {
    handleAssetCatalogAllOwnedSearch()
  }
}

async function handleAssetCatalogAllPermittedSearch(): Promise<void> {
  assetCatalogCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allPermittedDisp(pagingInfo))
    updateAssetCatalogCardByLookup(res)
  } finally {
    assetCatalogCardLoading.value -= 1
  }
}

async function handleAssetCatalogAllOwnedSearch(): Promise<void> {
  assetCatalogCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allOwnedDisp(pagingInfo))
    updateAssetCatalogCardByLookup(res)
  } finally {
    assetCatalogCardLoading.value -= 1
  }
}

onMounted(() => {
  handleAssetCatalogSearch()
})

// -----------------------------------------------------------资产目录卡片-----------------------------------------------------------
type AssetCatalogCardItem = {
  name: string
  permission_level: PoacPermissionLevel | null
  formatted_permission_level: string
  owner_display_name: string
  item_count: number
  formatted_created_date: string
  asset_catalog: DispAssetCatalog
}

const { items: assetCatalogCardItems, updateByLookup: updateAssetCatalogCardByLookup } =
  useGeneralCardPanel<DispAssetCatalog, AssetCatalogCardItem>(assetCatalogCardItemMap)
const assetCatalogCardLoading = ref<number>(0)
const assetCatalogCardMaxCard = ref<number>(1000)

function assetCatalogCardItemMap(t: DispAssetCatalog): AssetCatalogCardItem {
  function formatPermissionLevel(permissionLevel: PoacPermissionLevel | null): string {
    switch (permissionLevel) {
      case 0:
        return '所有者'
      case 1:
        return '访客'
      default:
        return '未知'
    }
  }

  return {
    name: t.name,
    permission_level: t.permission_level,
    formatted_permission_level: formatPermissionLevel(t.permission_level),
    owner_display_name: t.owner_account?.display_name ?? '未知',
    item_count: t.item_count,
    formatted_created_date: formatTimestamp(t.created_date),
    asset_catalog: t,
  }
}

async function handleAssetCatalogToCreate(): Promise<void> {
  assetCatalogCardLoading.value += 1
  try {
    const count: number = await lookupCount((pagingInfo) => userOwned(pagingInfo))
    const maxCard: number = assetCatalogCardMaxCard.value
    if (count > maxCard) {
      await ElMessageBox.alert(
        `您创建了过多的资产目录，每个人创建资产目录的最大数量不应超过 ${maxCard} 个！<br>` +
          `${maxCard}个应该够用了QwQ`,
        {
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true,
          type: 'warning',
          customClass: 'custom-message-box__w500',
        },
      )
      return
    }
    showAssetCatalogCreateMaintainDialog()
  } finally {
    assetCatalogCardLoading.value -= 1
  }
}

function handleEditMenuItemClicked(item: AssetCatalogCardItem, close: () => void): void {
  close()
  handleItemToEdit(item)
}

async function handleItemToEdit(item: AssetCatalogCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此笔记本的所有者，无权编辑该笔记本！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  showAssetCatalogEditMaintainDialog(item.asset_catalog)
}

function handlePermitMenuItemClicked(item: AssetCatalogCardItem, close: () => void): void {
  close()
  handleItemToPermit(item)
}

async function handleItemToPermit(item: AssetCatalogCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此笔记本的所有者，无权分配该笔记本的权限！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  handleShowPermitMaintainDialog(item.asset_catalog)
}

function handleShowPermitMaintainDialog(item: DispAssetCatalog): void {
  permitMaintainDialogAssetCatalogId.value = item.key.long_id
  permitMaintainDialogVisible.value = true
}

function handleDeleteMenuItemClicked(item: AssetCatalogCardItem, close: () => void): void {
  close()
  handleItemToDelete(item)
}

async function handleItemToDelete(item: AssetCatalogCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此笔记本的所有者，无权删除该笔记本！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  await handleAssetCatalogDelete(item.asset_catalog)
}

async function handleAssetCatalogDelete(item: DispAssetCatalog): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此笔记本。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  assetCatalogCardLoading.value += 1
  try {
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: `笔记本 ${item.name} 删除成功`,
      type: 'success',
      center: true,
    })
    handleAssetCatalogSearch()
  } finally {
    assetCatalogCardLoading.value -= 1
  }
}

// -----------------------------------------------------------资产目录维护对话框-----------------------------------------------------------
type AssetCatalogMaintainDialogItem = {
  key_long_id: string
  name: string
  remark: string
}

const {
  visible: assetCatalogMaintainDialogVisible,
  item: assetCatalogMaintainDialogItem,
  mode: assetCatalogMaintainDialogMode,
  showCreateDialog: showAssetCatalogCreateMaintainDialog,
  showEditDialog: showAssetCatalogEditMaintainDialog,
} = useGeneralMaintainDialog<DispAssetCatalog, AssetCatalogMaintainDialogItem>(
  assetCatalogMaintainDialogItemMap,
  {
    key_long_id: '',
    name: '',
    remark: '',
  },
)
const assetCatalogMaintainDialogLoading = ref<number>(0)
const assetCatalogMaintainDialogRules = ref({
  name: [{ required: true, message: '资产目录名称不能为空', trigger: 'blur' }],
})

function assetCatalogMaintainDialogItemMap(t: DispAssetCatalog): AssetCatalogMaintainDialogItem {
  return {
    key_long_id: t.key.long_id,
    name: t.name,
    remark: t.remark,
  }
}

async function handleAssetCatalogCreate(item: AssetCatalogMaintainDialogItem): Promise<void> {
  assetCatalogMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      create({
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `资产目录 ${item.name} 创建成功`,
      type: 'success',
      center: true,
    })
    assetCatalogMaintainDialogVisible.value = false
    handleAssetCatalogSearch()
  } finally {
    assetCatalogMaintainDialogLoading.value -= 1
  }
}

async function handleAssetCatalogEdit(item: AssetCatalogMaintainDialogItem): Promise<void> {
  assetCatalogMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        asset_catalog_key: { long_id: item.key_long_id },
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `资产目录 ${item.name} 更新成功`,
      type: 'success',
      center: true,
    })
    assetCatalogMaintainDialogVisible.value = false
    handleAssetCatalogSearch()
  } finally {
    assetCatalogMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------权限维护对话框-----------------------------------------------------------
const permitMaintainDialogVisible = ref<boolean>(false)
const permitMaintainDialogAssetCatalogId = ref<string>('')
</script>

<style scoped>
.asset-catalog-container {
  width: 100%;
  height: 100%;
}

.asset-catalog-card-container {
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

.asset-catalog-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.asset-catalog-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.asset-catalog-property-text {
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

.asset-catalog-control-button-group {
  display: flex;
}

.card-button {
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

.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}
</style>
