<template>
  <div class="pb-set-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handlePbSetSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-switch
            v-model="inspectAllSwitchValue"
            active-text="看所有的"
            inactive-text="看自己的"
            @change="handlePbSetSearch"
          />
        </div>
      </template>
      <template v-slot:default>
        <card-panel
          v-loading="pbSetCardLoading"
          title-field="name"
          card-width="calc(20% - 18px)"
          :items="pbSetCardItems"
          :max-card="pbSetCardMaxCard"
          :show-contextmenu="true"
          :contextmenu-width="110"
          @onItemAdd="handlePbSetToCreate"
        >
          <template v-slot:default="{ item }">
            <div class="pb-set-card-container">
              <div class="pb-set-property">
                <span class="iconfont pb-set-property-icon" style="color: black"> &#xfffa; </span>
                <span class="pb-set-property-text">
                  权限: {{ (item as PbSetCardItem).formatted_permission_level }}
                </span>
              </div>
              <div class="pb-set-property">
                <span class="iconfont pb-set-property-icon" style="color: black"> &#xfffb; </span>
                <span class="pb-set-property-text">
                  所有者: {{ (item as PbSetCardItem).owner_display_name }}
                </span>
              </div>
              <div class="pb-set-property">
                <span class="iconfont pb-set-property-icon" style="color: black"> &#xffe7; </span>
                <span class="pb-set-property-text">
                  项目总数: {{ (item as PbSetCardItem).item_count }}
                </span>
              </div>
              <div class="pb-set-property">
                <span class="iconfont pb-set-property-icon" style="color: black"> &#xffef; </span>
                <span class="pb-set-property-text">
                  最新记录日期: {{ (item as PbSetCardItem).formatted_last_recorded_date }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:header="{ item }">
            <el-button-group class="pb-set-control-button-group">
              <el-button
                class="card-button"
                :icon="EditPen"
                :disabled="item.permission_level !== 0"
                @click="handleItemToEdit(item as PbSetCardItem)"
              />
              <el-button
                class="card-button"
                :icon="LockIcon"
                :disabled="item.permission_level !== 0"
                @click="handleItemToPermit(item as PbSetCardItem)"
              />
              <el-button
                class="card-button"
                :icon="DeleteIcon"
                :disabled="item.permission_level !== 0"
                @click="handleItemToDelete(item as PbSetCardItem)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ item, close }">
            <ul class="my-contextmenu">
              <li
                :class="{ disabled: (item as PbSetCardItem).permission_level !== 0 }"
                @click="handleEditMenuItemClicked(item as PbSetCardItem, close)"
              >
                编辑...
              </li>
              <li
                :class="{ disabled: (item as PbSetCardItem).permission_level !== 0 }"
                @click="handlePermitMenuItemClicked(item as PbSetCardItem, close)"
              >
                分配权限...
              </li>
              <li
                :class="{ disabled: (item as PbSetCardItem).permission_level !== 0 }"
                @click="handleDeleteMenuItemClicked(item as PbSetCardItem, close)"
              >
                删除...
              </li>
            </ul>
          </template>
        </card-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="pbSetMaintainDialogVisible"
      :loading="pbSetMaintainDialogLoading"
      :mode="pbSetMaintainDialogMode"
      :item="pbSetMaintainDialogItem"
      :create-rules="pbSetMaintainDialogRules"
      :edit-rules="pbSetMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePbSetCreate"
      @onItemEdit="handlePbSetEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="pbSetMaintainDialogItem.name"
          :readonly="pbSetMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="pbSetMaintainDialogItem.remark"
          :readonly="pbSetMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <permit-maintain-dialog
      v-model:visible="permitMaintainDialogVisible"
      :pb-set-id="permitMaintainDialogPbSetId"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon, EditPen, Lock as LockIcon } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import CardPanel from '@/components/elementPlus/card/cardPanel/CardPanel.vue'

import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'
import { useGeneralCardPanel } from '@/components/elementPlus/card/cardPanel/composables.ts'

import PermitMaintainDialog from './subDialogs/PermitMaintainDialog.vue'

import {
  allOwnedDisp,
  allPermittedDisp,
  createPbSet,
  type DispPbSet,
  removePbSet,
  updatePbSet,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbSet.ts'
import { type PopbPermissionLevel } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/popb.ts'
import { lookupAllToList, lookupCount } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'PbSet',
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const inspectAllSwitchValue = ref<boolean>(true)

// -----------------------------------------------------------个人最佳集合查询-----------------------------------------------------------
function handlePbSetSearch(): void {
  if (inspectAllSwitchValue.value) {
    handlePbSetAllPermittedSearch()
  } else {
    handlePbSetAllOwnedSearch()
  }
}

async function handlePbSetAllPermittedSearch(): Promise<void> {
  pbSetCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allPermittedDisp(pagingInfo))
    updatePbSetCardByLookup(res)
  } finally {
    pbSetCardLoading.value -= 1
  }
}

async function handlePbSetAllOwnedSearch(): Promise<void> {
  pbSetCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allOwnedDisp(pagingInfo))
    updatePbSetCardByLookup(res)
  } finally {
    pbSetCardLoading.value -= 1
  }
}

onMounted(() => {
  handlePbSetSearch()
})

// -----------------------------------------------------------个人最佳集合卡片-----------------------------------------------------------
type PbSetCardItem = {
  name: string
  permission_level: PopbPermissionLevel | null
  formatted_permission_level: string
  owner_display_name: string
  item_count: number
  formatted_last_recorded_date: string
  pb_set: DispPbSet
}

const { items: pbSetCardItems, updateByLookup: updatePbSetCardByLookup } = useGeneralCardPanel<
  DispPbSet,
  PbSetCardItem
>(pbSetCardItemMap)
const pbSetCardLoading = ref<number>(0)
const pbSetCardMaxCard = ref<number>(1000)

function pbSetCardItemMap(t: DispPbSet): PbSetCardItem {
  function formatPermissionLevel(permissionLevel: PopbPermissionLevel | null): string {
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
    formatted_last_recorded_date: t.last_recorded_date
      ? formatTimestamp(t.last_recorded_date)
      : '（无）',
    pb_set: t,
  }
}

async function handlePbSetToCreate(): Promise<void> {
  pbSetCardLoading.value += 1
  try {
    const count: number = await lookupCount((pagingInfo) => allOwnedDisp(pagingInfo))
    const maxCard: number = pbSetCardMaxCard.value
    if (count >= maxCard) {
      await ElMessageBox.alert(
        `您创建了过多的个人最佳集合，每个人创建个人最佳集合的最大数量不应超过 ${maxCard} 个！<br>` +
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
    showPbSetCreateMaintainDialog()
  } finally {
    pbSetCardLoading.value -= 1
  }
}

function handleEditMenuItemClicked(item: PbSetCardItem, close: () => void): void {
  close()
  handleItemToEdit(item)
}

async function handleItemToEdit(item: PbSetCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此个人最佳集合的所有者，无权编辑该个人最佳集合！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  showPbSetEditMaintainDialog(item.pb_set)
}

function handlePermitMenuItemClicked(item: PbSetCardItem, close: () => void): void {
  close()
  handleItemToPermit(item)
}

async function handleItemToPermit(item: PbSetCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert(
      '您不是此个人最佳集合的所有者，无权分配该个人最佳集合的权限！',
      '权限不足',
      {
        confirmButtonText: '确定',
        type: 'warning',
        customClass: 'custom-message-box__w500',
      },
    )
    return
  }
  handleShowPermitMaintainDialog(item.pb_set)
}

function handleShowPermitMaintainDialog(item: DispPbSet): void {
  permitMaintainDialogPbSetId.value = item.key.long_id
  permitMaintainDialogVisible.value = true
}

function handleDeleteMenuItemClicked(item: PbSetCardItem, close: () => void): void {
  close()
  handleItemToDelete(item)
}

async function handleItemToDelete(item: PbSetCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此个人最佳集合的所有者，无权删除该个人最佳集合！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  await handlePbSetDelete(item.pb_set)
}

async function handlePbSetDelete(item: DispPbSet): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此个人最佳集合。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  pbSetCardLoading.value += 1
  try {
    await resolveResponse(removePbSet(item.key))
    ElMessage({
      showClose: true,
      message: `个人最佳集合 ${item.name} 删除成功`,
      type: 'success',
    })
    handlePbSetSearch()
  } finally {
    pbSetCardLoading.value -= 1
  }
}

// -----------------------------------------------------------个人最佳集合维护对话框-----------------------------------------------------------
type PbSetMaintainDialogItem = {
  key_long_id: string
  name: string
  remark: string
}

const {
  visible: pbSetMaintainDialogVisible,
  item: pbSetMaintainDialogItem,
  mode: pbSetMaintainDialogMode,
  showCreateDialog: showPbSetCreateMaintainDialog,
  showEditDialog: showPbSetEditMaintainDialog,
} = useGeneralMaintainDialog<DispPbSet, PbSetMaintainDialogItem>(pbSetMaintainDialogItemMap, {
  key_long_id: '',
  name: '',
  remark: '',
})
const pbSetMaintainDialogLoading = ref<number>(0)
const pbSetMaintainDialogRules = ref({
  name: [{ required: true, message: '个人最佳集合名称不能为空', trigger: 'blur' }],
})

function pbSetMaintainDialogItemMap(t: DispPbSet): PbSetMaintainDialogItem {
  return {
    key_long_id: t.key.long_id,
    name: t.name,
    remark: t.remark,
  }
}

async function handlePbSetCreate(item: PbSetMaintainDialogItem): Promise<void> {
  pbSetMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      createPbSet({
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `个人最佳集合 ${item.name} 创建成功`,
      type: 'success',
    })
    pbSetMaintainDialogVisible.value = false
    handlePbSetSearch()
  } finally {
    pbSetMaintainDialogLoading.value -= 1
  }
}

async function handlePbSetEdit(item: PbSetMaintainDialogItem): Promise<void> {
  pbSetMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updatePbSet({
        pb_set_key: { long_id: item.key_long_id },
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `个人最佳集合 ${item.name} 更新成功`,
      type: 'success',
    })
    pbSetMaintainDialogVisible.value = false
    handlePbSetSearch()
  } finally {
    pbSetMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------权限维护对话框-----------------------------------------------------------
const permitMaintainDialogVisible = ref<boolean>(false)
const permitMaintainDialogPbSetId = ref<string>('')
</script>

<style scoped>
.pb-set-container {
  width: 100%;
  height: 100%;
}

.pb-set-card-container {
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

.pb-set-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.pb-set-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.pb-set-property-text {
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

.pb-set-control-button-group {
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

/*noinspection CssUnusedSymbol*/
.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}
</style>
