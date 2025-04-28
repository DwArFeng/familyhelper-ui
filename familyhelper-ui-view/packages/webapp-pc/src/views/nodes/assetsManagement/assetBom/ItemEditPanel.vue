<template>
  <div class="item-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane name="itemInfo" label="信息">
        <item-info-panel
          ref="itemInfoPanelRef"
          mode="DEFAULT"
          :item-id="itemId"
          :readonly="readonly"
          @onItemPropertyUpdated="handleItemPropertyUpdated('DEFAULT')"
          @onItemCoverUpdated="handleItemCoverUpdated('DEFAULT')"
          @onPanelFloatyButtonClicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane name="itemFile" label="资料">
        <item-file-panel
          ref="itemFilePanelRef"
          mode="DEFAULT"
          :item-id="itemId"
          :readonly="readonly"
          @onItemFileUpdated="handleItemFileUpdated('DEFAULT')"
          @onFileFloaty="handleFileFloaty"
          @onPanelFloatyButtonClicked="showPanelFloaty(1)"
        />
      </el-tab-pane>
      <el-tab-pane name="itemParam" label="参数">
        <item-param-panel
          mode="DEFAULT"
          :item-id="itemId"
          :readonly="readonly"
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
      <item-info-panel
        v-if="panelFloatyType === 0"
        ref="floatyItemInfoPanelRef"
        mode="FLOATY"
        :item-id="itemId"
        :readonly="readonly"
        @onItemPropertyUpdated="handleItemPropertyUpdated('FLOATY')"
        @onItemCoverUpdated="handleItemCoverUpdated('FLOATY')"
      />
      <item-file-panel
        v-if="panelFloatyType === 1"
        ref="floatyItemFilePanelRef"
        mode="FLOATY"
        :item-id="itemId"
        :readonly="readonly"
        @onItemFileUpdated="handleItemFileUpdated('FLOATY')"
        @onFileFloaty="handleFileFloaty"
      />
      <item-param-panel
        v-if="panelFloatyType === 2"
        mode="FLOATY"
        :item-id="itemId"
        :readonly="readonly"
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

import { type ComponentExposed } from 'vue-component-type-helpers'

import { useUserPreference } from '@/composables/userPreference.ts'

import FloatyDialog from '@/components/dialog/floatyDialog/FloatyDialog.vue'

import {
  type UserPreference as FloatyDialogUserPreference,
  type VisualField,
} from '@/components/dialog/floatyDialog/types.ts'
import { useUserPreferenceFloatyDialog } from '@/components/dialog/floatyDialog/composables.ts'

import FileEditPanel from '@/views/nodes/miscellaneous/fileEditor/FileEditPanel.vue'

import {
  type FileEditType,
  type FileEditMode,
} from '@/views/nodes/miscellaneous/fileEditor/type.ts'

import ItemInfoPanel from './subPanels/ItemInfoPanel.vue'
import ItemFilePanel from './subPanels/ItemFilePanel.vue'
import ItemParamPanel from './subPanels/ItemParamPanel.vue'

defineOptions({
  name: 'ItemEditPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  itemId: string
  readonly?: boolean
  upsc?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  upsc: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onItemPropertyUpdated'): void
  (e: 'onItemCoverUpdated'): void
  (e: 'onItemFileUpdated'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Tab 页-----------------------------------------------------------
type TabsActiveName = 'itemInfo' | 'itemFile' | 'itemParam'

const tabsActiveName = ref<TabsActiveName>('itemInfo')

// -----------------------------------------------------------事件处理-----------------------------------------------------------
const itemInfoPanelRef = useTemplateRef<ComponentExposed<typeof ItemInfoPanel>>('itemInfoPanelRef')
const floatyItemInfoPanelRef =
  useTemplateRef<ComponentExposed<typeof ItemInfoPanel>>('floatyItemInfoPanelRef')
const itemFilePanelRef = useTemplateRef<ComponentExposed<typeof ItemFilePanel>>('itemFilePanelRef')
const floatyItemFilePanelRef =
  useTemplateRef<ComponentExposed<typeof ItemFilePanel>>('floatyItemFilePanelRef')

function handleItemPropertyUpdated(mode: 'DEFAULT' | 'FLOATY'): void {
  emit('onItemPropertyUpdated')
  // 根据 mode 取值，通过查询方法更新另一个面板的内容。
  if (mode === 'DEFAULT') {
    floatyItemInfoPanelRef.value?.itemSearch()
  } else {
    itemInfoPanelRef.value?.itemSearch()
  }
}

function handleItemCoverUpdated(mode: 'DEFAULT' | 'FLOATY'): void {
  emit('onItemCoverUpdated')
  // 根据 mode 取值，通过查询方法更新另一个面板的内容。
  if (mode === 'DEFAULT') {
    floatyItemInfoPanelRef.value?.itemSearch()
  } else {
    itemInfoPanelRef.value?.itemSearch()
  }
}

function handleItemFileUpdated(mode: 'DEFAULT' | 'FLOATY'): void {
  emit('onItemFileUpdated')
  // 根据 mode 取值，通过查询方法更新另一个面板的内容。
  if (mode === 'DEFAULT') {
    floatyItemFilePanelRef.value?.itemFileInfoSearch()
  } else {
    itemFilePanelRef.value?.itemFileInfoSearch()
  }
}

function handleFileFloaty(id: string, name: string, mode: FileEditMode): void {
  fileFloatyId.value = id
  fileFloatyTitle.value = name
  fileFloatyMode.value = mode
  fileFloatyType.value = 'ASSETS_ITEM_FILE'
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
      return '信息浮动窗口'
    case 1:
      return '资料浮动窗口'
    case 2:
      return '参数浮动窗口'
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
