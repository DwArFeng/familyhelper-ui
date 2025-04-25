<template>
  <div class="item-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="概览" name="overlook">
        <item-overlook-panel
          mode="DEFAULT"
          :note-item-id="noteItemId"
          :readonly="readonly"
          @onNoteItemPropertyUpdated="handleNoteItemPropertyUpdated"
          @onPanelFloatyButtonClicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane label="笔记" name="note">
        <item-note-panel
          ref="itemNotePanelRef"
          mode="DEFAULT"
          :note-item-id="noteItemId"
          :readonly="readonly"
          @onNoteItemNoteFileCommitted="handleNoteItemNoteFileCommitted('DEFAULT')"
          @onNoteItemSaveAsAttachmentCompleted="handleNoteItemSaveAsAttachmentCompleted"
          @onPanelFloatyButtonClicked="showPanelFloaty(1)"
        />
      </el-tab-pane>
      <el-tab-pane label="附件" name="attachment">
        <item-attachment-panel
          ref="itemAttachmentPanelRef"
          mode="DEFAULT"
          :note-item-id="noteItemId"
          :readonly="readonly"
          @onItemAttachmentUpdated="handleItemAttachmentUpdated"
          @onFileFloaty="handleFileFloaty"
          @onPanelFloatyButtonClicked="showPanelFloaty(2)"
        />
      </el-tab-pane>
    </el-tabs>
    <floaty-dialog
      v-model:visible="panelFloatyVisible"
      show-dock-button
      show-opacity-button
      show-content-mask
      :title="panelFloatyTitle"
      :z-index="100"
      :min-width="550"
      :min-height="200"
      :initial-x="panelFloatyInitialX"
      :initial-y="panelFloatyInitialY"
      :initial-height="panelFloatyInitialHeight"
      :initial-width="panelFloatyInitialWidth"
      :initial-dock-status="panelFloatyInitialDockStatus"
      :initial-content-opacity="panelFloatyInitialContentOpacity"
      @onVisualFieldAdjusted="handlePanelFloatyVisualFieldAdjusted"
      @onClosed="handlePanelFloatyClosed"
    >
      <item-overlook-panel
        v-if="panelFloatyType === 0"
        mode="FLOATY"
        :note-item-id="noteItemId"
        :readonly="readonly"
        @onNoteItemPropertyUpdated="handleNoteItemPropertyUpdated"
      />
      <item-note-panel
        v-if="panelFloatyType === 1"
        ref="floatyItemNotePanelRef"
        mode="FLOATY"
        :note-item-id="noteItemId"
        :readonly="readonly"
        @onNoteItemNoteFileCommitted="handleNoteItemNoteFileCommitted('FLOATY')"
        @onNoteItemSaveAsAttachmentCompleted="handleNoteItemSaveAsAttachmentCompleted"
      />
      <item-attachment-panel
        v-if="panelFloatyType === 2"
        ref="floatyItemAttachmentPanelRef"
        mode="FLOATY"
        :note-item-id="noteItemId"
        :readonly="readonly"
        @onItemAttachmentUpdated="handleItemAttachmentUpdated"
        @onFileFloaty="handleFileFloaty"
      />
    </floaty-dialog>
    <floaty-dialog
      v-model:visible="fileFloatyVisible"
      show-dock-button
      show-opacity-button
      show-content-mask
      :title="fileFloatyTitle"
      :z-index="100"
      :min-width="550"
      :min-height="200"
      :initial-x="fileFloatyInitialX"
      :initial-y="fileFloatyInitialY"
      :initial-height="fileFloatyInitialHeight"
      :initial-width="fileFloatyInitialWidth"
      :initial-dock-status="fileFloatyInitialDockStatus"
      :initial-content-opacity="fileFloatyInitialContentOpacity"
      @onVisualFieldAdjusted="handleFileFloatyVisualFieldAdjusted"
    >
      <file-edit-panel :type="fileFloatyType" :id="fileFloatyId" :mode="fileFloatyMode" />
    </floaty-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'

import type { ComponentExposed } from 'vue-component-type-helpers'

import { useUserPreference } from '@/composables/userPreference.ts'

import FloatyDialog from '@/components/dialog/floatyDialog/FloatyDialog.vue'

import type {
  UserPreference as FloatyDialogUserPreference,
  VisualField,
} from '@/components/dialog/floatyDialog/types.ts'
import { useUserPreferenceFloatyDialog } from '@/components/dialog/floatyDialog/composables.ts'

import FileEditPanel from '@/views/nodes/miscellaneous/fileEditor/FileEditPanel.vue'

import type { FileEditType, FileEditMode } from '@/views/nodes/miscellaneous/fileEditor/type.ts'

import ItemOverlookPanel from './subPanels/ItemOverlookPanel.vue'
import ItemNotePanel from './subPanels/ItemNotePanel.vue'
import ItemAttachmentPanel from './subPanels/ItemAttachmentPanel.vue'

defineOptions({
  name: 'ItemEditPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  noteItemId: string
  readonly?: boolean
  upsc?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  upsc: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onNoteItemPropertyUpdated'): void
  (e: 'onNoteItemNoteFileCommitted'): void
  (e: 'onNoteItemSaveAsAttachmentCompleted'): void
  (e: 'onNoteItemAttachmentUpdated'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Tab 页-----------------------------------------------------------
type TabsActiveName = 'overlook' | 'note' | 'attachment'

const tabsActiveName = ref<TabsActiveName>('overlook')

// -----------------------------------------------------------事件处理-----------------------------------------------------------
const itemNotePanelRef = useTemplateRef<ComponentExposed<typeof ItemNotePanel>>('itemNotePanelRef')
const floatyItemNotePanelRef =
  useTemplateRef<ComponentExposed<typeof ItemNotePanel>>('floatyItemNotePanelRef')
const itemAttachmentPanelRef =
  useTemplateRef<ComponentExposed<typeof ItemAttachmentPanel>>('itemAttachmentPanelRef')
const floatyItemAttachmentPanelRef = useTemplateRef<ComponentExposed<typeof ItemAttachmentPanel>>(
  'floatyItemAttachmentPanelRef',
)

function handleNoteItemPropertyUpdated(): void {
  emit('onNoteItemPropertyUpdated')
}

function handleNoteItemNoteFileCommitted(mode: 'DEFAULT' | 'FLOATY'): void {
  emit('onNoteItemNoteFileCommitted')
  // 根据 mode 取值，通过查询方法更新另一个面板的内容。
  if (mode === 'DEFAULT') {
    floatyItemNotePanelRef.value?.noteItemSearch()
  } else {
    itemNotePanelRef.value?.noteItemSearch()
  }
}

function handleNoteItemSaveAsAttachmentCompleted(): void {
  emit('onNoteItemSaveAsAttachmentCompleted')
  itemAttachmentPanelRef.value?.attachmentFileInfoSearch()
  floatyItemAttachmentPanelRef.value?.attachmentFileInfoSearch()
}

function handleItemAttachmentUpdated(): void {
  emit('onNoteItemAttachmentUpdated')
}

function handleFileFloaty(id: string, name: string, mode: FileEditMode): void {
  fileFloatyId.value = id
  fileFloatyTitle.value = name
  fileFloatyMode.value = mode
  fileFloatyType.value = 'NOTE_ATTACHMENT_FILE'
  fileFloatyVisible.value = true
}

// -----------------------------------------------------------面板悬浮-----------------------------------------------------------
const {
  visible: panelFloatyVisible,
  initialX: panelFloatyInitialX,
  initialY: panelFloatyInitialY,
  initialHeight: panelFloatyInitialHeight,
  initialWidth: panelFloatyInitialWidth,
  initialDockStatus: panelFloatyInitialDockStatus,
  initialContentOpacity: panelFloatyInitialContentOpacity,
  updateInitialVisualField: updatePanelFloatyInitialVisualField,
  provideUserPreference: providePanelFloatyUserPreference,
  applyUserPreference: applyPanelFloatyUserPreference,
} = useUserPreferenceFloatyDialog({
  x: 50,
  y: 100,
  height: 600,
  width: 800,
  dockStatus: 0,
  contentOpacity: 100,
})
const panelFloatyType = ref<0 | 1 | 2>(0)

const panelFloatyTitle = computed(() => {
  switch (panelFloatyType.value) {
    case 0:
      return '概览浮动窗口'
    case 1:
      return '笔记浮动窗口'
    case 2:
      return '附件浮动窗口'
    default:
      return '浮动窗口'
  }
})

function showPanelFloaty(type: 0 | 1 | 2): void {
  let changeFlag: boolean = false
  if (panelFloatyType.value !== type) {
    changeFlag = true
    panelFloatyType.value = type
  }
  if (!panelFloatyVisible.value) {
    changeFlag = true
    panelFloatyVisible.value = true
  }
  if (!changeFlag) {
    return
  }
  saveUserPreference()
}

function handlePanelFloatyVisualFieldAdjusted(visualField: VisualField): void {
  updatePanelFloatyInitialVisualField(visualField)
  saveUserPreference()
}

function handlePanelFloatyClosed(): void {
  saveUserPreference()
}

// -----------------------------------------------------------文件悬浮-----------------------------------------------------------
const {
  visible: fileFloatyVisible,
  initialX: fileFloatyInitialX,
  initialY: fileFloatyInitialY,
  initialHeight: fileFloatyInitialHeight,
  initialWidth: fileFloatyInitialWidth,
  initialDockStatus: fileFloatyInitialDockStatus,
  initialContentOpacity: fileFloatyInitialContentOpacity,
  updateInitialVisualField: updateFileFloatyInitialVisualField,
  provideUserPreference: provideFileFloatyUserPreference,
  applyUserPreference: applyFileFloatyUserPreference,
} = useUserPreferenceFloatyDialog({
  x: 50,
  y: 100,
  height: 600,
  width: 800,
  dockStatus: 0,
  contentOpacity: 100,
})
const fileFloatyType = ref<FileEditType>('')
const fileFloatyId = ref<string>('')
const fileFloatyMode = ref<FileEditMode>('')
const fileFloatyTitle = ref<string>('')

function handleFileFloatyVisualFieldAdjusted(visualField: VisualField): void {
  updateFileFloatyInitialVisualField(visualField)
  saveUserPreference()
}

// -----------------------------------------------------------用户偏好-----------------------------------------------------------
type UserPreference = {
  panelFloaty: {
    dialog: FloatyDialogUserPreference
    type: 0 | 1 | 2
  }
  fileFloaty: {
    dialog: FloatyDialogUserPreference
    type: FileEditType
    id: string
    mode: FileEditMode
    title: string
  }
}

const DEFAULT_USER_PREFERENCE: UserPreference = {
  panelFloaty: {
    dialog: {
      visible: false,
      initialX: 50,
      initialY: 100,
      initialHeight: 600,
      initialWidth: 800,
      initialDockStatus: 0,
      initialContentOpacity: 100,
    },
    type: 0,
  },
  fileFloaty: {
    dialog: {
      visible: false,
      initialX: 50,
      initialY: 100,
      initialHeight: 600,
      initialWidth: 800,
      initialDockStatus: 0,
      initialContentOpacity: 100,
    },
    type: '',
    id: '',
    mode: '',
    title: '',
  },
}

const { loadUserPreference, saveUserPreference } = useUserPreference(
  () => props.upsc,
  DEFAULT_USER_PREFERENCE,
  userPreferenceProvide,
  userPreferenceApply,
)

function userPreferenceProvide(): UserPreference | null {
  // FileFloatyDialog 默认不显示，只提供位置信息。
  const fileFloatyDialog: FloatyDialogUserPreference = provideFileFloatyUserPreference()
  fileFloatyDialog.visible = false
  return {
    panelFloaty: {
      dialog: providePanelFloatyUserPreference(),
      type: panelFloatyType.value,
    },
    fileFloaty: {
      dialog: fileFloatyDialog,
      type: fileFloatyType.value,
      id: fileFloatyId.value,
      mode: fileFloatyMode.value,
      title: fileFloatyTitle.value,
    },
  }
}

function userPreferenceApply(userPreference: UserPreference): void {
  applyPanelFloatyUserPreference(userPreference.panelFloaty.dialog)
  panelFloatyType.value = userPreference.panelFloaty.type
  // FileFloatyDialog 默认不显示，只应用位置信息。
  const fileFloatyDialog: FloatyDialogUserPreference = userPreference.fileFloaty.dialog
  fileFloatyDialog.visible = false
  applyFileFloatyUserPreference(fileFloatyDialog)
  fileFloatyType.value = userPreference.fileFloaty.type
  fileFloatyId.value = userPreference.fileFloaty.id
  fileFloatyMode.value = userPreference.fileFloaty.mode
  fileFloatyTitle.value = userPreference.fileFloaty.title
}

onMounted(() => {
  loadUserPreference()
})
</script>

<style scoped>
.item-edit-panel-container {
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
</style>
