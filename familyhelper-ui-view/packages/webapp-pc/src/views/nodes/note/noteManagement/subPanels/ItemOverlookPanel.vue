<template>
  <div class="item-overlook-panel-container">
    <div class="placeholder" v-if="noteItemId === ''">请选择项目</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="readonly" @click="handleShowNoteItemEditDialog">
              编辑属性
            </el-button>
            <el-button type="success" @click="handleNoteItemSearch">刷新数据</el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="item icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <title-layout-panel class="property-container" title="属性" bordered>
            <overlay-scrollbars-component class="scroll-bar">
              <el-form
                class="property-form"
                label-position="left"
                label-width="80px"
                inline
                :model="noteItemPropertyFormItem"
              >
                <el-form-item label="名称" style="width: 100%">
                  {{ noteItemPropertyFormItem.name }}
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  {{ noteItemPropertyFormItem.remark }}
                </el-form-item>
                <el-form-item label="创建时间" style="width: 33%">
                  {{ noteItemPropertyFormItem.formatted_created_date }}
                </el-form-item>
                <el-form-item label="编辑时间" style="width: 33%">
                  {{ noteItemPropertyFormItem.formatted_modified_date }}
                </el-form-item>
                <el-form-item label="查看时间" style="width: 33%">
                  {{ noteItemPropertyFormItem.formatted_inspected_date }}
                </el-form-item>
              </el-form>
            </overlay-scrollbars-component>
          </title-layout-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="noteItemMaintainDialogVisible"
      label-width="100px"
      edit-title="编辑项目"
      :loading="noteItemMaintainDialogLoading"
      :mode="noteItemMaintainDialogMode"
      :item="noteItemMaintainDialogItem"
      :edit-rules="noteItemMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemEdit="handleNoteItemEdit"
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
import { onMounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityEditOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type NoteItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteItem.ts'
import { inspect, update } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteItem.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'ItemOverlookPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  noteItemId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onNoteItemPropertyUpdated'): void
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------笔记项目查询-----------------------------------------------------------
watch(
  () => props.noteItemId,
  () => {
    handleNoteItemSearch()
  },
)

function handleNoteItemSearch(): void {
  if (props.noteItemId === '') {
    return
  }
  handleNoteItemInspectSearch()
}

async function handleNoteItemInspectSearch(): Promise<void> {
  loading.value += 1
  try {
    const noteItem: NoteItem = await resolveResponse(inspect({ long_id: props.noteItemId }))
    noteItemPropertyFormItem.value = {
      name: noteItem.name,
      remark: noteItem.remark,
      formatted_created_date: formatTimestamp(noteItem.created_date),
      formatted_modified_date: formatTimestamp(noteItem.modified_date),
      formatted_inspected_date: formatTimestamp(noteItem.inspected_date),
    }
    noteItemMaintainDialogItem.value = {
      long_id: noteItem.key.long_id,
      node_long_id: noteItem.node_key?.long_id ?? '',
      name: noteItem.name,
      remark: noteItem.remark,
    }
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleNoteItemSearch()
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowNoteItemEditDialog(): void {
  showNoteItemMaintainDialog(noteItemMaintainDialogItem.value)
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// -----------------------------------------------------------属性表单-----------------------------------------------------------
type NoteItemPropertyFormItem = {
  name: string
  remark: string
  formatted_created_date: string
  formatted_modified_date: string
  formatted_inspected_date: string
}

const noteItemPropertyFormItem = ref<NoteItemPropertyFormItem>({
  name: '',
  remark: '',
  formatted_created_date: '',
  formatted_modified_date: '',
  formatted_inspected_date: '',
})

// -----------------------------------------------------------笔记项目维护对话框-----------------------------------------------------------
type NoteItemMaintainDialogItem = {
  long_id: string
  node_long_id: string
  name: string
  remark: string
}

const {
  visible: noteItemMaintainDialogVisible,
  item: noteItemMaintainDialogItem,
  mode: noteItemMaintainDialogMode,
  showDialog: showNoteItemMaintainDialog,
} = useIdentityEditOnlyMaintainDialog<NoteItemMaintainDialogItem>({
  long_id: '',
  node_long_id: '',
  name: '',
  remark: '',
})
const noteItemMaintainDialogLoading = ref<number>(0)
const noteItemMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
})

async function handleNoteItemEdit(item: NoteItemMaintainDialogItem): Promise<void> {
  loading.value += 1
  try {
    const _nodeKey: LongIdKey | null =
      item.node_long_id === '' ? null : { long_id: item.node_long_id }
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        node_key: _nodeKey,
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '节点更新成功',
      type: 'success',
      center: true,
    })
    emit('onNoteItemPropertyUpdated')
    handleNoteItemSearch()
    noteItemMaintainDialogVisible.value = false
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
function noteItemSearch(): void {
  handleNoteItemSearch()
}

defineExpose({
  noteItemSearch,
})
</script>

<style scoped>
.item-overlook-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
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

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

.property-container {
  height: 100%;
  width: 100%;
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-container .property-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.property-container .property-form :deep(textarea) {
  padding: 0;
  border: none;
  font: unset;
  font-size: 14px;
  color: #303133;
}
</style>
