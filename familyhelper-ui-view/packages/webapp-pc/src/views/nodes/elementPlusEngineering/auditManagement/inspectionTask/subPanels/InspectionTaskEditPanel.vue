<template>
  <div class="inspection-task-edit-panel-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane
        :label="t('views.element_plus_engineering.audit_management.overview')"
        name="overview"
      >
        <inspection-task-overview-panel
          ref="inspectionTaskOverviewPanelRef"
          mode="DEFAULT"
          :task-id="taskId"
          @onTaskUpdated="handleTaskUpdated('DEFAULT')"
          @onPanelFloatyButtonClicked="showPanelFloaty('overview')"
        />
      </el-tab-pane>
      <el-tab-pane
        :label="t('views.element_plus_engineering.audit_management.task_events')"
        name="taskEvent"
      >
        <inspection-task-event-panel
          ref="inspectionTaskEventPanelRef"
          mode="DEFAULT"
          :task-id="taskId"
          @onPanelFloatyButtonClicked="showPanelFloaty('taskEvent')"
        />
      </el-tab-pane>
      <el-tab-pane :label="t('views.element_plus_engineering.audit_management.alarm')" name="alarm">
        <inspection-task-alarm-panel
          ref="inspectionTaskAlarmPanelRef"
          mode="DEFAULT"
          :task-id="taskId"
          @onPanelFloatyButtonClicked="showPanelFloaty('alarm')"
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
      <inspection-task-overview-panel
        v-if="panelFloatyType === 'overview'"
        ref="floatyInspectionTaskOverviewPanelRef"
        mode="FLOATY"
        :task-id="taskId"
        @onTaskUpdated="handleTaskUpdated('FLOATY')"
      />
      <inspection-task-event-panel
        v-if="panelFloatyType === 'taskEvent'"
        ref="floatyInspectionTaskEventPanelRef"
        mode="FLOATY"
        :task-id="taskId"
      />
      <inspection-task-alarm-panel
        v-if="panelFloatyType === 'alarm'"
        ref="floatyInspectionTaskAlarmPanelRef"
        mode="FLOATY"
        :task-id="taskId"
      />
    </floaty-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import { useUserPreference } from '@/composables/userPreference.ts'

import FloatyDialog from '@/components/elementPlusEngineering/dialog/floatyDialog/FloatyDialog.vue'
import {
  type UserPreference as FloatyDialogUserPreference,
  type VisualField,
} from '@/components/elementPlusEngineering/dialog/floatyDialog/types.ts'
import { useUserPreferenceFloatyDialog } from '@/components/elementPlusEngineering/dialog/floatyDialog/composables.ts'

import InspectionTaskOverviewPanel from './InspectionTaskOverviewPanel.vue'
import InspectionTaskEventPanel from './InspectionTaskEventPanel.vue'
import InspectionTaskAlarmPanel from './InspectionTaskAlarmPanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'InspectionTaskEditPanel',
})

// region Props 定义

type Props = {
  taskId: string
  upsc?: string
}

const props = withDefaults(defineProps<Props>(), {
  upsc: '',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onTaskUpdated'): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region Tab 页

type TabsActiveName = 'overview' | 'taskEvent' | 'alarm'

const tabsActiveName = ref<TabsActiveName>('overview')
const loading = ref<boolean>(false)

// endregion

// region 事件处理

const inspectionTaskOverviewPanelRef = useTemplateRef<
  ComponentExposed<typeof InspectionTaskOverviewPanel>
>('inspectionTaskOverviewPanelRef')
const floatyInspectionTaskOverviewPanelRef = useTemplateRef<
  ComponentExposed<typeof InspectionTaskOverviewPanel>
>('floatyInspectionTaskOverviewPanelRef')
const inspectionTaskEventPanelRef = useTemplateRef<
  ComponentExposed<typeof InspectionTaskEventPanel>
>('inspectionTaskEventPanelRef')
const floatyInspectionTaskEventPanelRef = useTemplateRef<
  ComponentExposed<typeof InspectionTaskEventPanel>
>('floatyInspectionTaskEventPanelRef')
const inspectionTaskAlarmPanelRef = useTemplateRef<
  ComponentExposed<typeof InspectionTaskAlarmPanel>
>('inspectionTaskAlarmPanelRef')
const floatyInspectionTaskAlarmPanelRef = useTemplateRef<
  ComponentExposed<typeof InspectionTaskAlarmPanel>
>('floatyInspectionTaskAlarmPanelRef')

function handleTaskUpdated(mode: 'DEFAULT' | 'FLOATY'): void {
  emit('onTaskUpdated')
  if (mode === 'DEFAULT') {
    floatyInspectionTaskOverviewPanelRef.value?.refresh()
  } else {
    inspectionTaskOverviewPanelRef.value?.refresh()
  }
  inspectionTaskEventPanelRef.value?.refresh()
  floatyInspectionTaskEventPanelRef.value?.refresh()
  inspectionTaskAlarmPanelRef.value?.refresh()
  floatyInspectionTaskAlarmPanelRef.value?.refresh()
}

// endregion

// region 面板悬浮

type PanelFloatyType = 'overview' | 'taskEvent' | 'alarm'

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
const panelFloatyType = ref<PanelFloatyType>('overview')

const panelFloatyTitle = computed(() => {
  switch (panelFloatyType.value) {
    case 'overview':
      return t('views.element_plus_engineering.audit_management.overview_floaty_window')
    case 'taskEvent':
      return t('views.element_plus_engineering.audit_management.task_events_floaty_window')
    case 'alarm':
      return t('views.element_plus_engineering.audit_management.alarm_floaty_window')
    default:
      return t('views.element_plus_engineering.audit_management.floaty_window')
  }
})

function showPanelFloaty(type: PanelFloatyType): void {
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
    type: PanelFloatyType
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
    type: 'overview',
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
    panelFloatyType.value = normalizePanelFloatyType(userPreference.panelFloaty.type)
  },
)

function normalizePanelFloatyType(type: PanelFloatyType | number): PanelFloatyType {
  if (typeof type === 'string') {
    return type
  }
  switch (type) {
    case 0:
      return 'overview'
    case 1:
      return 'taskEvent'
    case 2:
      return 'alarm'
    default:
      return 'overview'
  }
}

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
.inspection-task-edit-panel-container {
  width: 100%;
  height: 100%;
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
