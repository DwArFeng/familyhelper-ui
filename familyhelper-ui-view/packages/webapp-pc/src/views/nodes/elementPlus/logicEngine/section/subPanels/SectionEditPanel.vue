<template>
  <div class="section-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="基本信息" name="basic">
        <section-basic-panel
          ref="sectionBasicPanelRef"
          mode="DEFAULT"
          :section-id="sectionId"
          :apply-changes-disabled="superviseDisabled"
          @onSectionUpdated="handleSectionPropertyUpdated('DEFAULT', $event)"
          @onApplyChanges="handleApplySupervise"
          @onPanelFloatyButtonClicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane label="状态" name="state">
        <state-panel
          mode="DEFAULT"
          :section-id="sectionId"
          :apply-changes-disabled="superviseDisabled"
          @onApplyChanges="handleApplySupervise"
          @onPanelFloatyButtonClicked="showPanelFloaty(1)"
        />
      </el-tab-pane>
      <el-tab-pane label="驱动器" name="driver">
        <driver-info-panel
          mode="DEFAULT"
          :section-id="sectionId"
          :apply-changes-disabled="jobDisabled"
          @onApplyChanges="handleApplyJob"
          @onPanelFloatyButtonClicked="showPanelFloaty(2)"
        />
      </el-tab-pane>
      <el-tab-pane label="执行器" name="performer">
        <performer-info-panel
          mode="DEFAULT"
          :section-id="sectionId"
          :apply-changes-disabled="jobDisabled"
          @onApplyChanges="handleApplyJob"
          @onPanelFloatyButtonClicked="showPanelFloaty(3)"
        />
      </el-tab-pane>
      <el-tab-pane label="守卫器" name="guarder">
        <guarder-info-panel
          mode="DEFAULT"
          :section-id="sectionId"
          :apply-changes-disabled="jobDisabled"
          @onApplyChanges="handleApplyJob"
          @onPanelFloatyButtonClicked="showPanelFloaty(4)"
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
      <section-basic-panel
        v-if="panelFloatyType === 0"
        ref="floatySectionBasicPanelRef"
        mode="FLOATY"
        :section-id="sectionId"
        :apply-changes-disabled="superviseDisabled"
        @onSectionUpdated="handleSectionPropertyUpdated('FLOATY', $event)"
        @onApplyChanges="handleApplySupervise"
      />
      <state-panel
        v-if="panelFloatyType === 1"
        mode="FLOATY"
        :section-id="sectionId"
        :apply-changes-disabled="superviseDisabled"
        @onApplyChanges="handleApplySupervise"
      />
      <driver-info-panel
        v-if="panelFloatyType === 2"
        mode="FLOATY"
        :section-id="sectionId"
        :apply-changes-disabled="jobDisabled"
        @onApplyChanges="handleApplyJob"
      />
      <performer-info-panel
        v-if="panelFloatyType === 3"
        mode="FLOATY"
        :section-id="sectionId"
        :apply-changes-disabled="jobDisabled"
        @onApplyChanges="handleApplyJob"
      />
      <guarder-info-panel
        v-if="panelFloatyType === 4"
        mode="FLOATY"
        :section-id="sectionId"
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

import { type Section } from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/section.ts'

import SectionBasicPanel from './SectionBasicPanel.vue'
import StatePanel from './StatePanel.vue'
import DriverInfoPanel from './DriverInfoPanel.vue'
import PerformerInfoPanel from './PerformerInfoPanel.vue'
import GuarderInfoPanel from './GuarderInfoPanel.vue'

defineOptions({
  name: 'SectionEditPanel',
})

// region Props 定义

type Props = {
  sectionId: string
  superviseDisabled?: boolean
  jobDisabled?: boolean
  upsc: string
}

const props = withDefaults(defineProps<Props>(), {
  superviseDisabled: false,
  jobDisabled: false,
  upsc: '',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onSectionPropertyUpdated', section: Section): void
  (e: 'onApplySupervise'): void
  (e: 'onApplyJob'): void
}

const emit = defineEmits<Emits>()

// endregion

// region Tab 页

type TabsActiveName = 'basic' | 'state' | 'driver' | 'performer' | 'guarder'

const tabsActiveName = ref<TabsActiveName>('basic')

// endregion

// region 事件处理

const sectionBasicPanelRef =
  useTemplateRef<ComponentExposed<typeof SectionBasicPanel>>('sectionBasicPanelRef')
const floatySectionBasicPanelRef = useTemplateRef<ComponentExposed<typeof SectionBasicPanel>>(
  'floatySectionBasicPanelRef',
)

function handleSectionPropertyUpdated(mode: 'DEFAULT' | 'FLOATY', section: Section): void {
  emit('onSectionPropertyUpdated', section)
  if (mode === 'DEFAULT') {
    floatySectionBasicPanelRef.value?.refresh()
    return
  }
  sectionBasicPanelRef.value?.refresh()
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
const panelFloatyType = ref<0 | 1 | 2 | 3 | 4>(0)

const panelFloatyTitle = computed(() => {
  switch (panelFloatyType.value) {
    case 0:
      return '基本信息浮动窗口'
    case 1:
      return '状态浮动窗口'
    case 2:
      return '驱动器浮动窗口'
    case 3:
      return '执行器浮动窗口'
    case 4:
      return '守卫器浮动窗口'
    default:
      return '浮动窗口'
  }
})

function showPanelFloaty(type: 0 | 1 | 2 | 3 | 4): void {
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
    type: 0 | 1 | 2 | 3 | 4
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
.section-edit-panel-container {
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
