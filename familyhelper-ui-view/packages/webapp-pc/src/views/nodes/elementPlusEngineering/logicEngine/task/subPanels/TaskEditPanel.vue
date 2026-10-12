<template>
  <div class="task-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane
        :label="t('views.element_plus_engineering.logic_engine.overview')"
        name="overlook"
      >
        <task-overview-panel
          ref="taskOverviewPanelRef"
          mode="DEFAULT"
          :task-id="taskId"
          @onTaskUpdated="handleTaskUpdated('DEFAULT')"
          @onPanelFloatyButtonClicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane
        :label="t('views.element_plus_engineering.logic_engine.task_events')"
        name="task_event"
      >
        <task-event-panel
          ref="taskEventPanelRef"
          mode="DEFAULT"
          :task-id="taskId"
          @onPanelFloatyButtonClicked="showPanelFloaty(1)"
        />
      </el-tab-pane>
      <el-tab-pane
        :label="t('views.element_plus_engineering.logic_engine.task_variables')"
        name="task_variable"
      >
        <task-variable-panel
          ref="taskVariablePanelRef"
          mode="DEFAULT"
          :task-id="taskId"
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
      <task-overview-panel
        v-if="panelFloatyType === 0"
        ref="floatyTaskOverviewPanelRef"
        mode="FLOATY"
        :task-id="taskId"
        @onTaskUpdated="handleTaskUpdated('FLOATY')"
      />
      <task-event-panel
        v-if="panelFloatyType === 1"
        ref="floatyTaskEventPanelRef"
        mode="FLOATY"
        :task-id="taskId"
      />
      <task-variable-panel
        v-if="panelFloatyType === 2"
        ref="floatyTaskVariablePanelRef"
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

import TaskOverviewPanel from './TaskOverviewPanel.vue'
import TaskEventPanel from './TaskEventPanel.vue'
import TaskVariablePanel from './TaskVariablePanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'TaskEditPanel',
})

// region Props 定义

type Props = {
  taskId: string
  upsc: string
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

type TabsActiveName = 'overlook' | 'task_event' | 'task_variable'

const tabsActiveName = ref<TabsActiveName>('overlook')

// endregion

// region 事件处理

const taskOverviewPanelRef =
  useTemplateRef<ComponentExposed<typeof TaskOverviewPanel>>('taskOverviewPanelRef')
const floatyTaskOverviewPanelRef = useTemplateRef<ComponentExposed<typeof TaskOverviewPanel>>(
  'floatyTaskOverviewPanelRef',
)
const taskEventPanelRef =
  useTemplateRef<ComponentExposed<typeof TaskEventPanel>>('taskEventPanelRef')
const floatyTaskEventPanelRef =
  useTemplateRef<ComponentExposed<typeof TaskEventPanel>>('floatyTaskEventPanelRef')
const taskVariablePanelRef =
  useTemplateRef<ComponentExposed<typeof TaskVariablePanel>>('taskVariablePanelRef')
const floatyTaskVariablePanelRef = useTemplateRef<ComponentExposed<typeof TaskVariablePanel>>(
  'floatyTaskVariablePanelRef',
)

function handleTaskUpdated(mode: 'DEFAULT' | 'FLOATY'): void {
  emit('onTaskUpdated')
  if (mode === 'DEFAULT') {
    floatyTaskOverviewPanelRef.value?.refresh()
  } else {
    taskOverviewPanelRef.value?.refresh()
  }
  taskEventPanelRef.value?.refresh()
  floatyTaskEventPanelRef.value?.refresh()
  taskVariablePanelRef.value?.refresh()
  floatyTaskVariablePanelRef.value?.refresh()
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
      return t('views.element_plus_engineering.logic_engine.overview_floaty_window')
    case 1:
      return t('views.element_plus_engineering.logic_engine.task_events_floaty_window')
    case 2:
      return t('views.element_plus_engineering.logic_engine.task_variables_floaty_window')
    default:
      return t('views.element_plus_engineering.logic_engine.floaty_window')
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
  userPreferenceProvide,
  userPreferenceApply,
)

function userPreferenceProvide(): UserPreference | null {
  return {
    panelFloaty: {
      dialog: providePanelFloatyUserPreference(),
      type: panelFloatyType.value,
    },
  }
}

function userPreferenceApply(userPreference: UserPreference): void {
  applyPanelFloatyUserPreference(userPreference.panelFloaty.dialog)
  panelFloatyType.value = userPreference.panelFloaty.type
}

onMounted(() => {
  loadUserPreference()
})

// endregion
</script>

<style scoped>
.task-edit-panel-container {
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
