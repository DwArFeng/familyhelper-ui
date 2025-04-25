<template>
  <div class="note-book-container">
    <border-layout-panel class="border-layout-panel" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleNoteBookSearch"> 刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-switch
            v-model="inspectAllSwitchValue"
            active-text="看所有的"
            inactive-text="看自己的"
            @change="handleNoteBookSearch"
          />
          <el-divider direction="vertical" />
          <el-switch
            v-model="favoredOnlySwitchValue"
            active-text="只看收藏"
            inactive-text="看所有的"
            @change="handleNoteBookSearch"
          />
          <el-divider direction="vertical" />
          <el-input
            class="name-search-bar"
            v-model="nameSearchBarValue"
            clearable
            @keydown.enter="handleNoteBookSearch"
            @clear="handleNoteBookSearch"
          >
            <template v-slot:prepend>
              <span>笔记名称</span>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchButton" @click="handleNoteBookSearch" />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <card-panel
          v-loading="noteBookCardLoading"
          title-field="name"
          card-width="calc(20% - 18px)"
          :items="noteBookCardItems"
          :max-card="noteBookCardMaxCard"
          :show-contextmenu="true"
          :contextmenu-width="120"
          @onItemAdd="handleNoteBookToCreate"
        >
          <template v-slot:default="{ item }">
            <corner-light-panel
              class="note-book-card-container-wrapper"
              light-bevel-edge="40px"
              light-color="#E6A23C"
              :show-south-east="(item as NoteBookCardItem).favorite"
            >
              <div class="note-book-card-container">
                <div class="note-book-property">
                  <span class="iconfont note-book-property-icon" style="color: black">
                    &#xfffa;
                  </span>
                  <span class="note-book-property-text">
                    权限:
                    {{ parsePermissionLabel((item as NoteBookCardItem).permission_level ?? 1) }}
                  </span>
                </div>
                <div class="note-book-property">
                  <span class="iconfont note-book-property-icon" style="color: black">
                    &#xfffb;
                  </span>
                  <span class="note-book-property-text">
                    所有者: {{ (item as NoteBookCardItem).owner_account?.display_name ?? '' }}
                  </span>
                </div>
                <div class="note-book-property">
                  <span class="iconfont note-book-property-icon" style="color: black">
                    &#xffe7;
                  </span>
                  <span class="note-book-property-text">
                    项目总数: {{ (item as NoteBookCardItem).item_count }}
                  </span>
                </div>
                <div class="note-book-property">
                  <span class="iconfont note-book-property-icon" style="color: black">
                    &#xffef;
                  </span>
                  <span class="note-book-property-text">
                    最新更新日期:
                    {{ formatTimestamp((item as NoteBookCardItem).last_modified_date) }}
                  </span>
                </div>
              </div>
            </corner-light-panel>
          </template>
          <template v-slot:header="{ item }">
            <el-button-group class="note-book-control-button-group">
              <el-button
                class="card-button"
                :icon="EditPen"
                :disabled="item.permission_level !== 0"
                @click="handleItemToEdit(item as NoteBookCardItem)"
              />
              <el-button
                class="card-button"
                :icon="LockIcon"
                :disabled="item.permission_level !== 0"
                @click="handleItemToPermit(item as NoteBookCardItem)"
              />
              <el-button
                class="card-button"
                :icon="DeleteIcon"
                :disabled="item.permission_level !== 0"
                @click="handleItemToDelete(item as NoteBookCardItem)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ item, close }">
            <ul class="my-contextmenu">
              <li
                :class="{ disabled: (item as NoteBookCardItem).permission_level !== 0 }"
                @click="handleEditMenuItemClicked(item as NoteBookCardItem, close)"
              >
                编辑...
              </li>
              <li
                :class="{ disabled: (item as NoteBookCardItem).permission_level !== 0 }"
                @click="handlePermitMenuItemClicked(item as NoteBookCardItem, close)"
              >
                分配权限...
              </li>
              <li
                :class="{ disabled: (item as NoteBookCardItem).permission_level !== 0 }"
                @click="handleDeleteMenuItemClicked(item as NoteBookCardItem, close)"
              >
                删除...
              </li>
              <el-divider />
              <li @click="handleChangeFavoredMenuItemClicked(item as NoteBookCardItem, close)">
                收藏/取消收藏
              </li>
            </ul>
          </template>
        </card-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="noteBookMaintainDialogVisible"
      :loading="noteBookMaintainDialogLoading"
      :mode="noteBookMaintainDialogMode"
      :item="noteBookMaintainDialogItem"
      :create-rules="noteBookMaintainDialogRules"
      :edit-rules="noteBookMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleNoteBookCreate"
      @onItemEdit="handleNoteBookEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="noteBookMaintainDialogItem.name"
          :readonly="noteBookMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="noteBookMaintainDialogItem.remark"
          :readonly="noteBookMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="收藏" prop="favorite">
        <el-switch
          v-model="noteBookMaintainDialogItem.favorite"
          active-text="是"
          inactive-text="否"
          :disabled="noteBookMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <permit-maintain-dialog
      v-model:visible="permitMaintainDialogVisible"
      :note-book-id="permitMaintainDialogNoteBookId"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import {
  Delete as DeleteIcon,
  EditPen,
  Lock as LockIcon,
  Search as SearchButton,
} from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import CardPanel from '@/components/card/cardPanel/CardPanel.vue'
import CornerLightPanel from '@/components/layout/cornerLightPanel/CornerLightPanel.vue'

import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'
import { useGeneralCardPanel } from '@/components/card/cardPanel/composables.ts'

import PermitMaintainDialog from './subDialogs/PermitMaintainDialog.vue'

import type { LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import type { DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import type { DispNoteBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/NoteBook.ts'
import {
  changeFavored,
  create,
  remove,
  update,
  userOwned,
  userOwnedWithConditionDisplayDisp,
  userPermittedWithConditionDisplayDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/NoteBook.ts'
import type { PonbPermissionLevel } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/Ponb.ts'
import { lookupAllToList, lookupCount } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'NoteBook',
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const inspectAllSwitchValue = ref<boolean>(false)
const favoredOnlySwitchValue = ref<boolean>(false)
const nameSearchBarValue = ref<string>('')

// -----------------------------------------------------------笔记本查询-----------------------------------------------------------
function handleNoteBookSearch(): void {
  if (inspectAllSwitchValue.value) {
    handleNoteBookAllPermittedSearch()
  } else {
    handleNoteBookAllOwnedSearch()
  }
}

async function handleNoteBookAllPermittedSearch(): Promise<void> {
  noteBookCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) =>
      userPermittedWithConditionDisplayDisp(
        nameSearchBarValue.value,
        favoredOnlySwitchValue.value,
        pagingInfo,
      ),
    )
    updateNoteBookCardByLookup(res)
  } finally {
    noteBookCardLoading.value -= 1
  }
}

async function handleNoteBookAllOwnedSearch(): Promise<void> {
  noteBookCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) =>
      userOwnedWithConditionDisplayDisp(
        nameSearchBarValue.value,
        favoredOnlySwitchValue.value,
        pagingInfo,
      ),
    )
    updateNoteBookCardByLookup(res)
  } finally {
    noteBookCardLoading.value -= 1
  }
}

onMounted(() => {
  handleNoteBookSearch()
})

// -----------------------------------------------------------笔记本卡片-----------------------------------------------------------
type NoteBookCardItem = {
  key: LongIdKey
  name: string
  remark: string
  created_date: number
  item_count: number
  last_modified_date: number
  last_inspected_date: number
  owner_account: DispAccount | null
  permission_level: PonbPermissionLevel | null
  favorite: boolean
}

const { items: noteBookCardItems, updateByLookup: updateNoteBookCardByLookup } =
  useGeneralCardPanel<DispNoteBook, NoteBookCardItem>(noteBookCardItemMap)
const noteBookCardLoading = ref<number>(0)
const noteBookCardMaxCard = ref<number>(1000)

function parsePermissionLabel(permissionLevel: PonbPermissionLevel): string {
  switch (permissionLevel) {
    case 0:
      return '所有者'
    case 1:
      return '访客'
    default:
      return '（未知）'
  }
}

function noteBookCardItemMap(t: DispNoteBook): NoteBookCardItem {
  return {
    key: t.key,
    name: t.name,
    remark: t.remark,
    created_date: t.created_date,
    item_count: t.item_count,
    last_modified_date: t.last_modified_date,
    last_inspected_date: t.last_inspected_date,
    owner_account: t.owner_account,
    permission_level: t.permission_level,
    favorite: t.favorite,
  }
}

async function handleNoteBookToCreate(): Promise<void> {
  noteBookCardLoading.value += 1
  try {
    const count: number = await lookupCount((pagingInfo) => userOwned(pagingInfo))
    const maxCard: number = noteBookCardMaxCard.value
    if (count > maxCard) {
      await ElMessageBox.alert(
        `您创建了过多的笔记本，每个人创建笔记本的最大数量不应超过 ${maxCard} 个！<br>` +
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
    showNoteBookCreateMaintainDialog()
  } finally {
    noteBookCardLoading.value -= 1
  }
}

function handleEditMenuItemClicked(item: DispNoteBook, close: () => void): void {
  close()
  handleItemToEdit(item)
}

async function handleItemToEdit(item: DispNoteBook): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此笔记本的所有者，无权编辑该笔记本！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  showNoteBookEditMaintainDialog(item)
}

function handlePermitMenuItemClicked(item: DispNoteBook, close: () => void): void {
  close()
  handleItemToPermit(item)
}

async function handleItemToPermit(item: DispNoteBook): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此笔记本的所有者，无权分配该笔记本的权限！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  permitMaintainDialogNoteBookId.value = item.key.long_id
  permitMaintainDialogVisible.value = true
}

function handleDeleteMenuItemClicked(item: DispNoteBook, close: () => void): void {
  close()
  handleItemToDelete(item)
}

async function handleItemToDelete(item: DispNoteBook): Promise<void> {
  if (item.permission_level !== 0) {
    await ElMessageBox.alert('您不是此笔记本的所有者，无权删除该笔记本！', '权限不足', {
      confirmButtonText: '确定',
      type: 'warning',
      customClass: 'custom-message-box__w500',
    })
    return
  }
  await handleNoteBookDelete(item)
}

async function handleNoteBookDelete(item: DispNoteBook): Promise<void> {
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
  noteBookCardLoading.value += 1
  try {
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: `笔记本 ${item.name} 删除成功`,
      type: 'success',
      center: true,
    })
    handleNoteBookSearch()
  } finally {
    noteBookCardLoading.value -= 1
  }
}

function handleChangeFavoredMenuItemClicked(item: DispNoteBook, close: () => void): void {
  close()
  handleNoteBookChangeFavored(item)
}

async function handleNoteBookChangeFavored(item: DispNoteBook): Promise<void> {
  noteBookCardLoading.value += 1
  try {
    await resolveResponse(changeFavored({ note_book_key: item.key }))
    ElMessage({
      showClose: true,
      message: `笔记本 ${item.name} 收藏状态修改成功`,
      type: 'success',
      center: true,
    })
    handleNoteBookSearch()
  } finally {
    noteBookCardLoading.value -= 1
  }
}

// -----------------------------------------------------------笔记本维护对话框-----------------------------------------------------------
type NoteBookMaintainDialogItem = {
  key_long_id: string
  name: string
  remark: string
  favorite: boolean
}

const {
  visible: noteBookMaintainDialogVisible,
  item: noteBookMaintainDialogItem,
  mode: noteBookMaintainDialogMode,
  showCreateDialog: showNoteBookCreateMaintainDialog,
  showEditDialog: showNoteBookEditMaintainDialog,
} = useGeneralMaintainDialog<DispNoteBook, NoteBookMaintainDialogItem>(
  noteBookMaintainDialogItemMap,
  {
    key_long_id: '',
    name: '',
    remark: '',
    favorite: false,
  },
)
const noteBookMaintainDialogLoading = ref<number>(0)
const noteBookMaintainDialogRules = ref({
  name: [{ required: true, message: '笔记本名称不能为空', trigger: 'blur' }],
})

function noteBookMaintainDialogItemMap(t: DispNoteBook): NoteBookMaintainDialogItem {
  return {
    key_long_id: t.key.long_id,
    name: t.name,
    remark: t.remark,
    favorite: t.favorite,
  }
}

async function handleNoteBookCreate(item: NoteBookMaintainDialogItem): Promise<void> {
  noteBookMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      create({
        name: item.name,
        remark: item.remark,
        favorite: item.favorite,
      }),
    )
    ElMessage({
      showClose: true,
      message: `笔记本 ${item.name} 创建成功`,
      type: 'success',
      center: true,
    })
    noteBookMaintainDialogVisible.value = false
    handleNoteBookSearch()
  } finally {
    noteBookMaintainDialogLoading.value -= 1
  }
}

async function handleNoteBookEdit(item: NoteBookMaintainDialogItem): Promise<void> {
  noteBookMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        note_book_key: { long_id: item.key_long_id },
        name: item.name,
        remark: item.remark,
        favorite: item.favorite,
      }),
    )
    ElMessage({
      showClose: true,
      message: `笔记本 ${item.name} 更新成功`,
      type: 'success',
      center: true,
    })
    noteBookMaintainDialogVisible.value = false
    handleNoteBookSearch()
  } finally {
    noteBookMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------权限维护对话框-----------------------------------------------------------
const permitMaintainDialogVisible = ref<boolean>(false)
const permitMaintainDialogNoteBookId = ref<string>('')
</script>

<style scoped>
.note-book-container {
  width: 100%;
  height: 100%;
}

.note-book-card-container-wrapper {
  width: 100%;
  height: 100%;
}

.note-book-card-container {
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

.note-book-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.note-book-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.note-book-property-text {
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

.header-container .name-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .name-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.note-book-control-button-group {
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

/*noinspection CssUnusedSymbol*/
.my-contextmenu .el-divider--horizontal {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
