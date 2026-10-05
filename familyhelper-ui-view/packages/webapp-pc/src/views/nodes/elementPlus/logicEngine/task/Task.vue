<template>
  <div class="task-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="50%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <task-list-panel ref="taskListPanelRef" @onCurrentChanged="handleTaskListCurrentChanged" />
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="currentTask === null" text="请选择任务" />
        <task-edit-panel
          v-else
          :task-id="currentTask.key.long_id"
          :upsc="taskEditPanelUpsc"
          @onTaskUpdated="handleTaskUpdated"
        />
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import { type DispTask } from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/task.ts'

import TaskListPanel from './subPanels/TaskListPanel.vue'
import TaskEditPanel from './subPanels/TaskEditPanel.vue'

defineOptions({
  name: 'TaskComponent',
})

// region 任务编辑面板

const UPSC_TASK_EDIT_PANEL = 'ui_preference.pc.logic_engine.task.task_edit_panel'

const taskEditPanelUpsc = computed(() => UPSC_TASK_EDIT_PANEL)

// endregion

// region 任务列表当前选中

const currentTask = ref<DispTask | null>(null)
const taskListPanelRef = useTemplateRef<ComponentExposed<typeof TaskListPanel>>('taskListPanelRef')

function handleTaskListCurrentChanged(task: DispTask | null): void {
  currentTask.value = task
}

// endregion

// region 任务更新

function handleTaskUpdated(): void {
  taskListPanelRef.value?.refresh()
}

// endregion
</script>

<style scoped>
.task-container {
  width: 100%;
  height: 100%;
}
</style>
