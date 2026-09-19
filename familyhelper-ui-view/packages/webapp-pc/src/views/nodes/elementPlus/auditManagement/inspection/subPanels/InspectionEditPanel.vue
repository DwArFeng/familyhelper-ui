<template>
  <div class="inspection-edit-panel-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="基本信息" name="basic">
        <inspection-basic-panel
          ref="inspectionBasicPanelRef"
          mode="DEFAULT"
          :inspection-id="inspectionId"
          :apply-changes-disabled="superviseDisabled"
          @onInspectionPropertyUpdated="handleInspectionPropertyUpdated('DEFAULT', $event)"
          @onApplyChanges="handleApplySupervise"
          @onPanelFloatyButtonClicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane label="巡检驱动" name="driver">
        <inspection-driver-info-panel
          mode="DEFAULT"
          :inspection-id="inspectionId"
          :apply-changes-disabled="jobDisabled"
          @onApplyChanges="handleApplyJob"
          @onPanelFloatyButtonClicked="showPanelFloaty(1)"
        />
      </el-tab-pane>
      <el-tab-pane label="检查器" name="inspector">
        <inspector-info-panel
          mode="DEFAULT"
          :inspection-id="inspectionId"
          :apply-changes-disabled="jobDisabled"
          @onApplyChanges="handleApplyJob"
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
      <inspection-basic-panel
        v-if="panelFloatyType === 0"
        ref="floatyInspectionBasicPanelRef"
        mode="FLOATY"
        :inspection-id="inspectionId"
        :apply-changes-disabled="superviseDisabled"
        @onInspectionPropertyUpdated="handleInspectionPropertyUpdated('FLOATY', $event)"
        @onApplyChanges="handleApplySupervise"
      />
      <inspection-driver-info-panel
        v-if="panelFloatyType === 1"
        mode="FLOATY"
        :inspection-id="inspectionId"
        :apply-changes-disabled="jobDisabled"
        @onApplyChanges="handleApplyJob"
      />
      <inspector-info-panel
        v-if="panelFloatyType === 2"
        mode="FLOATY"
        :inspection-id="inspectionId"
        :apply-changes-disabled="jobDisabled"
        @onApplyChanges="handleApplyJob"
      />
    </floaty-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { useUserPreference } from '@/composables/userPreference.ts'

import FloatyDialog from '@/components/elementPlus/dialog/floatyDialog/FloatyDialog.vue'
import {
  type UserPreference as FloatyDialogUserPreference,
  type VisualField,
} from '@/components/elementPlus/dialog/floatyDialog/types.ts'
import { useUserPreferenceFloatyDialog } from '@/components/elementPlus/dialog/floatyDialog/composables.ts'

import { type Inspection } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspection.ts'

import InspectionBasicPanel from './InspectionBasicPanel.vue'
import InspectionDriverInfoPanel from './InspectionDriverInfoPanel.vue'
import InspectorInfoPanel from './InspectorInfoPanel.vue'

defineOptions({
  name: 'InspectionEditPanel',
})

// region Props 定义

type Props = {
  inspectionId: string
  superviseDisabled?: boolean
  jobDisabled?: boolean
  upsc?: string
}

const props = withDefaults(defineProps<Props>(), {
  superviseDisabled: false,
  jobDisabled: false,
  upsc: '',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onInspectionPropertyUpdated', inspection: Inspection): void
  (e: 'onApplySupervise'): void
  (e: 'onApplyJob'): void
}

const emit = defineEmits<Emits>()

// endregion

// region Tab 页

type TabsActiveName = 'basic' | 'driver' | 'inspector'

const tabsActiveName = ref<TabsActiveName>('basic')
const loading = ref<boolean>(false)

// endregion

// region 事件处理

const inspectionBasicPanelRef =
  useTemplateRef<ComponentExposed<typeof InspectionBasicPanel>>('inspectionBasicPanelRef')
const floatyInspectionBasicPanelRef = useTemplateRef<ComponentExposed<typeof InspectionBasicPanel>>(
  'floatyInspectionBasicPanelRef',
)

function handleInspectionPropertyUpdated(mode: 'DEFAULT' | 'FLOATY', inspection: Inspection): void {
  emit('onInspectionPropertyUpdated', inspection)
  if (mode === 'DEFAULT') {
    floatyInspectionBasicPanelRef.value?.refresh()
    return
  }
  inspectionBasicPanelRef.value?.refresh()
}

function handleApplySupervise(): void {
  emit('onApplySupervise')
}

function handleApplyJob(): void {
  emit('onApplyJob')
}

// endregion

// region 面板悬浮

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
      return '基本信息浮动窗口'
    case 1:
      return '巡检驱动浮动窗口'
    case 2:
      return '检查器浮动窗口'
    default:
      return '浮动窗口'
  }
})

function showPanelFloaty(type: 0 | 1 | 2): void {
  let changed = false
  if (panelFloatyType.value !== type) {
    panelFloatyType.value = type
    changed = true
  }
  if (!panelFloatyVisible.value) {
    panelFloatyVisible.value = true
    changed = true
  }
  if (changed && props.upsc) {
    void saveUserPreference()
  }
}

function handlePanelFloatyVisualFieldAdjusted(visualField: VisualField): void {
  updatePanelFloatyInitialVisualField(visualField)
  if (props.upsc) {
    void saveUserPreference()
  }
}

function handlePanelFloatyClosed(): void {
  if (props.upsc) {
    void saveUserPreference()
  }
}

// endregion

// region 用户偏好

type UserPreference = {
  panelFloaty: {
    dialog: FloatyDialogUserPreference
    type: 0 | 1 | 2
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
}

const { loadUserPreference, saveUserPreference } = useUserPreference(
  () => props.upsc,
  DEFAULT_USER_PREFERENCE,
  () => ({
    panelFloaty: {
      dialog: providePanelFloatyUserPreference(),
      type: panelFloatyType.value,
    },
  }),
  (userPreference: UserPreference) => {
    applyPanelFloatyUserPreference(userPreference.panelFloaty.dialog)
    panelFloatyType.value = userPreference.panelFloaty.type
  },
)

onMounted(async () => {
  if (props.upsc) {
    loading.value = true
    try {
      await loadUserPreference()
    } finally {
      loading.value = false
    }
  }
})

// endregion
</script>

<style scoped>
.inspection-edit-panel-container {
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
