<template>
  <div class="node-overlook-panel-container">
    <div class="placeholder" v-if="noteNodeId === ''">请选择节点</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="readonly" @click="handleShowNoteNodeEditDialog">
              编辑属性
            </el-button>
            <el-button type="success" @click="handleNoteNodeSearch">刷新数据</el-button>
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
                :model="noteNodePropertyFormItem"
              >
                <el-form-item label="名称" style="width: 100%">
                  {{ noteNodePropertyFormItem.name }}
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  {{ noteNodePropertyFormItem.remark }}
                </el-form-item>
              </el-form>
            </overlay-scrollbars-component>
          </title-layout-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="noteNodeMaintainDialogVisible"
      label-width="100px"
      edit-title="编辑节点"
      :loading="noteNodeMaintainDialogLoading"
      :mode="noteNodeMaintainDialogMode"
      :item="noteNodeMaintainDialogItem"
      :edit-rules="noteNodeMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemEdit="handleNoteNodeEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="noteNodeMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="noteNodeMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityEditOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import type { LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import type { NoteNode } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteNode.ts'
import { inspect, update } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteNode.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'NodeOverlookPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  noteNodeId: string
  readonly: boolean
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onNoteNodePropertyUpdated'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------笔记节点查询-----------------------------------------------------------
watch(
  () => props.noteNodeId,
  () => {
    handleNoteNodeSearch()
  },
)

function handleNoteNodeSearch(): void {
  if (props.noteNodeId === '') {
    return
  }
  handleNoteNodeInspectSearch()
}

async function handleNoteNodeInspectSearch(): Promise<void> {
  loading.value += 1
  try {
    const noteNode: NoteNode = await resolveResponse(inspect({ long_id: props.noteNodeId }))
    noteNodePropertyFormItem.value = {
      name: noteNode.name,
      remark: noteNode.remark,
    }
    noteNodeMaintainDialogItem.value = {
      long_id: noteNode.key.long_id,
      parent_long_id: noteNode.parent_key?.long_id ?? '',
      name: noteNode.name,
      remark: noteNode.remark,
    }
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleNoteNodeSearch()
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowNoteNodeEditDialog(): void {
  showNoteNodeMaintainDialog(noteNodeMaintainDialogItem.value)
}

// -----------------------------------------------------------属性表单-----------------------------------------------------------
type NoteNodePropertyFormItem = {
  name: string
  remark: string
}

const noteNodePropertyFormItem = ref<NoteNodePropertyFormItem>({
  name: '',
  remark: '',
})

// -----------------------------------------------------------笔记节点维护对话框-----------------------------------------------------------
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
} = useIdentityEditOnlyMaintainDialog<NoteNodeMaintainDialogItem>({
  long_id: '',
  parent_long_id: '',
  name: '',
  remark: '',
})
const noteNodeMaintainDialogLoading = ref<number>(0)
const noteNodeMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
})

async function handleNoteNodeEdit(item: NoteNodeMaintainDialogItem): Promise<void> {
  loading.value += 1
  try {
    const _parentKey: LongIdKey | null =
      item.parent_long_id === '' ? null : { long_id: item.parent_long_id }
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        parent_key: _parentKey,
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
    emit('onNoteNodePropertyUpdated')
    handleNoteNodeSearch()
    noteNodeMaintainDialogVisible.value = false
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.node-overlook-panel-container {
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
