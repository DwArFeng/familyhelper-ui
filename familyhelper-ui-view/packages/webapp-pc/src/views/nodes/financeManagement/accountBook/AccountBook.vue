<template>
  <div class="account-book-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleAccountBookSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-switch
            v-model="inspectAllSwitchValue"
            active-text="看所有的"
            inactive-text="看自己的"
            @change="handleAccountBookSearch"
          />
        </div>
      </template>
      <template v-slot:default>
        <card-panel
          v-loading="accountBookCardLoading"
          title-field="name"
          card-width="calc(20% - 18px)"
          :items="accountBookCardItems"
          :max-card="accountBookCardMaxCard"
          :show-contextmenu="true"
          :contextmenu-width="120"
          @onItemAdd="handleAccountBookToCreate"
        >
          <template v-slot:default="{ item }">
            <div class="account-book-card-container">
              <div class="account-book-property">
                <span class="iconfont account-book-property-icon" style="color: black">
                  &#xfffa;
                </span>
                <span class="account-book-property-text">
                  权限: {{ (item as AccountBookCardItem).formatted_permission_level }}
                </span>
              </div>
              <div class="account-book-property">
                <span class="iconfont account-book-property-icon" style="color: black">
                  &#xfffb;
                </span>
                <span class="account-book-property-text">
                  所有者: {{ (item as AccountBookCardItem).owner_display_name }}
                </span>
              </div>
              <div class="account-book-property">
                <span class="iconfont account-book-property-icon" style="color: black">
                  &#xfff9;
                </span>
                <span class="account-book-property-text">
                  余额: {{ (item as AccountBookCardItem).total_value }}
                </span>
              </div>
              <div class="account-book-property">
                <span class="iconfont account-book-property-icon" style="color: black">
                  &#xffef;
                </span>
                <span class="account-book-property-text">
                  记录日期: {{ (item as AccountBookCardItem).formatted_last_recorded_date }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:header="{ item }">
            <el-button-group class="account-book-control-button-group">
              <el-button
                class="card-button"
                :icon="EditPen"
                :disabled="item.permission_level !== 0"
                @click="handleItemToEdit(item as AccountBookCardItem)"
              />
              <el-button
                class="card-button"
                :icon="HelpIcon"
                :disabled="item.permission_level !== 0"
                @click="handleItemToFunction(item as AccountBookCardItem)"
              />
              <el-button
                class="card-button"
                :icon="DeleteIcon"
                :disabled="item.permission_level !== 0"
                @click="handleItemToDelete(item as AccountBookCardItem)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ item, close }">
            <ul class="my-contextmenu">
              <li
                :class="{ disabled: (item as AccountBookCardItem).permission_level !== 0 }"
                @click="handleEditMenuItemClicked(item as AccountBookCardItem, close)"
              >
                编辑...
              </li>
              <li
                :class="{ disabled: (item as AccountBookCardItem).permission_level !== 0 }"
                @click="handleFunctionMenuItemClicked(item as AccountBookCardItem, close)"
              >
                分配权限...
              </li>
              <li
                :class="{ disabled: (item as AccountBookCardItem).permission_level !== 0 }"
                @click="handleDeleteMenuItemClicked(item as AccountBookCardItem, close)"
              >
                删除...
              </li>
            </ul>
          </template>
        </card-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="accountBookMaintainDialogVisible"
      :loading="accountBookMaintainDialogLoading"
      :mode="accountBookMaintainDialogMode"
      :item="accountBookMaintainDialogItem"
      :create-rules="accountBookMaintainDialogRules"
      :edit-rules="accountBookMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleAccountBookCreate"
      @onItemEdit="handleAccountBookEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="accountBookMaintainDialogItem.name"
          :readonly="accountBookMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="accountBookMaintainDialogItem.remark"
          :readonly="accountBookMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <function-maintain-dialog
      v-model:visible="functionMaintainDialogVisible"
      :account-book-id="functionMaintainDialogAccountBookId"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon, EditPen, Help as HelpIcon } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import CardPanel from '@/components/card/cardPanel/CardPanel.vue'

import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'
import { useGeneralCardPanel } from '@/components/card/cardPanel/composables.ts'

import FunctionMaintainDialog from './subDialogs/FunctionMaintainDialog.vue'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import {
  create,
  remove,
  update,
  allPermittedDisp,
  allOwnedDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { type PonbPermissionLevel } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/ponb.ts'
import { lookupAllToList, lookupCount } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'AccountBook',
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const inspectAllSwitchValue = ref<boolean>(false)

// -----------------------------------------------------------账本查询-----------------------------------------------------------
function handleAccountBookSearch(): void {
  if (inspectAllSwitchValue.value) {
    handleAccountBookAllPermittedSearch()
  } else {
    handleAccountBookAllOwnedSearch()
  }
}

async function handleAccountBookAllPermittedSearch(): Promise<void> {
  accountBookCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allPermittedDisp(pagingInfo))
    updateAccountBookCardByLookup(res)
  } finally {
    accountBookCardLoading.value -= 1
  }
}

async function handleAccountBookAllOwnedSearch(): Promise<void> {
  accountBookCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allOwnedDisp(pagingInfo))
    updateAccountBookCardByLookup(res)
  } finally {
    accountBookCardLoading.value -= 1
  }
}

onMounted(() => {
  handleAccountBookSearch()
})

// -----------------------------------------------------------账本卡片-----------------------------------------------------------
type AccountBookCardItem = {
  name: string
  permission_level: PonbPermissionLevel | null
  formatted_permission_level: string
  owner_display_name: string
  total_value: number
  formatted_last_recorded_date: string
  account_book: DispAccountBook
}

const { items: accountBookCardItems, updateByLookup: updateAccountBookCardByLookup } =
  useGeneralCardPanel<DispAccountBook, AccountBookCardItem>(accountBookCardItemMap)
const accountBookCardLoading = ref<number>(0)
const accountBookCardMaxCard = ref<number>(1000)

function accountBookCardItemMap(t: DispAccountBook): AccountBookCardItem {
  function formatPermissionLevel(permissionLevel: PonbPermissionLevel | null): string {
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
    total_value: t.total_value,
    formatted_last_recorded_date: formatTimestamp(t.last_recorded_date ?? 0),
    account_book: t,
  }
}

async function handleAccountBookToCreate(): Promise<void> {
  accountBookCardLoading.value += 1
  try {
    const count: number = await lookupCount((pagingInfo) => allOwnedDisp(pagingInfo))
    const maxCard: number = accountBookCardMaxCard.value
    if (count > maxCard) {
      await ElMessageBox.alert(
        `您创建了过多的账本，每个人创建账本的最大数量不应超过 ${maxCard} 个！<br>` +
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
    showAccountBookCreateMaintainDialog()
  } finally {
    accountBookCardLoading.value -= 1
  }
}

function handleEditMenuItemClicked(item: AccountBookCardItem, close: () => void): void {
  close()
  handleItemToEdit(item)
}

async function handleItemToEdit(item: AccountBookCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此账本的所有者，无权编辑该账本！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  showAccountBookEditMaintainDialog(item.account_book)
}

function handleFunctionMenuItemClicked(item: AccountBookCardItem, close: () => void): void {
  close()
  handleItemToFunction(item)
}

async function handleItemToFunction(item: AccountBookCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此账本的所有者，无权编辑该账本的功能！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  handleShowFunctionMaintainDialog(item.account_book)
}

function handleShowFunctionMaintainDialog(item: DispAccountBook): void {
  functionMaintainDialogAccountBookId.value = item.key.long_id
  functionMaintainDialogVisible.value = true
}

function handleDeleteMenuItemClicked(item: AccountBookCardItem, close: () => void): void {
  close()
  handleItemToDelete(item)
}

async function handleItemToDelete(item: AccountBookCardItem): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此账本的所有者，无权删除该账本！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  await handleAccountBookDelete(item.account_book)
}

async function handleAccountBookDelete(item: DispAccountBook): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此账本。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  accountBookCardLoading.value += 1
  try {
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: `账本 ${item.name} 删除成功`,
      type: 'success',
    })
    handleAccountBookSearch()
  } finally {
    accountBookCardLoading.value -= 1
  }
}

// function handleChangeFavoredMenuItemClicked(item: AccountBookCardItem, close: () => void): void {
//   close()
//   handleAccountBookChangeFavored(item.note_book)
// }
//
// async function handleAccountBookChangeFavored(item: DispAccountBook): Promise<void> {
//   accountBookCardLoading.value += 1
//   try {
//     await resolveResponse(changeFavored({ note_book_key: item.key }))
//     ElMessage({
//       showClose: true,
//       message: `账本 ${item.name} 收藏状态修改成功`,
//       type: 'success',
//       center: true,
//     })
//     handleAccountBookSearch()
//   } finally {
//     accountBookCardLoading.value -= 1
//   }
// }

// -----------------------------------------------------------账本维护对话框-----------------------------------------------------------
type AccountBookMaintainDialogItem = {
  key_long_id: string
  name: string
  remark: string
}

const {
  visible: accountBookMaintainDialogVisible,
  item: accountBookMaintainDialogItem,
  mode: accountBookMaintainDialogMode,
  showCreateDialog: showAccountBookCreateMaintainDialog,
  showEditDialog: showAccountBookEditMaintainDialog,
} = useGeneralMaintainDialog<DispAccountBook, AccountBookMaintainDialogItem>(
  accountBookMaintainDialogItemMap,
  {
    key_long_id: '',
    name: '',
    remark: '',
  },
)
const accountBookMaintainDialogLoading = ref<number>(0)
const accountBookMaintainDialogRules = ref({
  name: [{ required: true, message: '账本名称不能为空', trigger: 'blur' }],
})

function accountBookMaintainDialogItemMap(t: DispAccountBook): AccountBookMaintainDialogItem {
  return {
    key_long_id: t.key.long_id,
    name: t.name,
    remark: t.remark,
  }
}

async function handleAccountBookCreate(item: AccountBookMaintainDialogItem): Promise<void> {
  accountBookMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      create({
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `账本 ${item.name} 创建成功`,
      type: 'success',
    })
    accountBookMaintainDialogVisible.value = false
    handleAccountBookSearch()
  } finally {
    accountBookMaintainDialogLoading.value -= 1
  }
}

async function handleAccountBookEdit(item: AccountBookMaintainDialogItem): Promise<void> {
  accountBookMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        account_book_key: { long_id: item.key_long_id },
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `账本 ${item.name} 更新成功`,
      type: 'success',
    })
    accountBookMaintainDialogVisible.value = false
    handleAccountBookSearch()
  } finally {
    accountBookMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------功能维护对话框-----------------------------------------------------------
const functionMaintainDialogVisible = ref<boolean>(false)
const functionMaintainDialogAccountBookId = ref<string>('')
</script>

<style scoped>
.account-book-container {
  width: 100%;
  height: 100%;
}

.account-book-card-container {
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

.account-book-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.account-book-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.account-book-property-text {
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

.account-book-control-button-group {
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

/*noinspection CssUnusedSymbol*/
.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}
</style>
