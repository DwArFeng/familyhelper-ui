<template>
  <div class="inspection-task-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="35%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <inspection-task-list-panel
          ref="inspectionTaskListPanelRef"
          @onCurrentChanged="handleInspectionTaskListCurrentChanged"
        />
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="currentTask === null" text="请选择巡检任务" />
        <inspection-task-edit-panel
          v-else
          :task-id="currentTask.key.long_id"
          upsc="ui_preference.pc.audit_management.inspection_task.inspection_task_edit_panel"
          @onTaskUpdated="handleTaskUpdated"
        />
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import { type DispInspectionTask } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionTask.ts'

import InspectionTaskListPanel from './subPanels/InspectionTaskListPanel.vue'
import InspectionTaskEditPanel from './subPanels/InspectionTaskEditPanel.vue'

defineOptions({
  name: 'InspectionTask',
})

// region 巡检任务列表当前选中

const currentTask = ref<DispInspectionTask | null>(null)
const inspectionTaskListPanelRef = useTemplateRef<ComponentExposed<typeof InspectionTaskListPanel>>(
  'inspectionTaskListPanelRef',
)

function handleInspectionTaskListCurrentChanged(task: DispInspectionTask | null): void {
  currentTask.value = task
}

// endregion

// region 任务更新

function handleTaskUpdated(): void {
  inspectionTaskListPanelRef.value?.refresh()
}

// endregion
</script>

<style scoped>
.inspection-task-container {
  width: 100%;
  height: 100%;
}
</style>
