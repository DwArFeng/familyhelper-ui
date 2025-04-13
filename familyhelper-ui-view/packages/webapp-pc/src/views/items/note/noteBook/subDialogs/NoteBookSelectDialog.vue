<template>
  <el-dialog
    class="note-book-select-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    destroy-on-close
    title="选择笔记本"
    top="8vh"
    width="80%"
    :close-on-click-modal="false"
    @open="handleOpen"
    @closed="handleClosed"
    @keydown="handleHotKeyDown"
  >
    <header-layout-panel class="body-wrapper">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleNoteBookSearch"> 刷新数据</el-button>
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
              <el-button :icon="SearchIcon" @click="handleNoteBookSearch" />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <div class="body-container">
          <card-panel
            class="card-list-container"
            v-loading="noteBookCardLoading"
            title-field="name"
            card-width="calc(20% - 18px)"
            select-mode="SINGLE"
            :items="noteBookCardItems"
            :max-card="noteBookCardMaxCard"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :add-button-visible="false"
            :show-contextmenu="false"
            @onSelectionChanged="handleNoteBookCardSelectionChanged"
          >
            <template v-slot:default="{ item }">
              <!--suppress JSUnresolvedReference -->
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
          </card-panel>
          <el-checkbox v-model="setToDefaultCheckboxValue">设为默认</el-checkbox>
        </div>
      </template>
    </header-layout-panel>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button
          type="primary"
          :disabled="confirmButtonDisabled"
          @click="handleConfirmButtonClicked"
        >
          确定
        </el-button>
        <el-button @click="handleCancelButtonClicked"> 取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import CardPanel from '@/components/card/cardPanel/CardPanel.vue'
import CornerLightPanel from '@/components/layout/cornerLightPanel/CornerLightPanel.vue'

import { useGeneralCardPanel } from '@/components/card/cardPanel/composables.ts'

import type { DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import type { DispNoteBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteBook.ts'
import { userPermittedWithConditionDisplayDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteBook.ts'
import type { PonbPermissionLevel } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/ponb.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'NoteBookSelectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  mode?: 'NOTE_MANAGEMENT' | 'DEFAULT'
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', noteBook: DispNoteBook, setToDefault: boolean): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// -----------------------------------------------------------显示处理-----------------------------------------------------------
function handleOpen(): void {
  noteBookSelection.value = []
  setToDefaultCheckboxValue.value = false
  handleNoteBookSearch()
}

function handleClosed(): void {
  noteBookSelection.value = []
}

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const favoredOnlySwitchValue = ref<boolean>(false)
const nameSearchBarValue = ref<string>('')

// -----------------------------------------------------------笔记本查询-----------------------------------------------------------
function handleNoteBookSearch(): void {
  handleNoteBookAllPermittedSearch()
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

onMounted(() => {
  handleNoteBookSearch()
})

// -----------------------------------------------------------笔记本卡片-----------------------------------------------------------
type NoteBookCardItem = {
  name: string
  remark: string
  created_date: number
  item_count: number
  last_modified_date: number
  last_inspected_date: number
  favorite: boolean
  owner_account: DispAccount | null
  permission_level: PonbPermissionLevel | null
  note_book: DispNoteBook
}

const { items: noteBookCardItems, updateByLookup: updateNoteBookCardByLookup } =
  useGeneralCardPanel<DispNoteBook, NoteBookCardItem>(noteBookCardItemMap)
const noteBookCardLoading = ref<number>(0)
const noteBookCardMaxCard = ref<number>(1000)
const noteBookSelection = ref<NoteBookCardItem[]>([])

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
    name: t.name,
    remark: t.remark,
    created_date: t.created_date,
    item_count: t.item_count,
    last_modified_date: t.last_modified_date,
    last_inspected_date: t.last_inspected_date,
    favorite: t.favorite,
    owner_account: t.owner_account,
    permission_level: t.permission_level,
    note_book: t,
  }
}

function handleNoteBookCardSelectionChanged(selection: NoteBookCardItem[]): void {
  noteBookSelection.value = selection
}

// -----------------------------------------------------------确认逻辑-----------------------------------------------------------
const setToDefaultCheckboxValue = ref<boolean>(false)

const confirmButtonDisabled = computed<boolean>(() => {
  return noteBookSelection.value.length === 0
})

function handleConfirmButtonClicked(): void {
  if (noteBookSelection.value.length === 0) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const noteBook: NoteBookCardItem = noteBookSelection.value[0]
  emit('onConfirmed', noteBook.note_book, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (noteBookSelection.value.length === 0) {
    return
  }
  const noteBook: NoteBookCardItem = noteBookSelection.value[0]
  emit('onConfirmed', noteBook.note_book, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.note-book-select-dialog-container :deep(.el-dialog) {
  margin-bottom: 0 !important;
}

.body-wrapper {
  height: 650px;
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

.body-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-list-container {
  width: 100%;
  height: 0;
  flex-grow: 1;
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
</style>
