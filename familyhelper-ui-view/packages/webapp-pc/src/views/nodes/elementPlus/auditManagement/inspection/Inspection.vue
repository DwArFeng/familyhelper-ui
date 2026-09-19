<template>
  <div class="inspection-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="38%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <inspection-list-panel
          ref="inspectionListPanelRef"
          :apply-changes-disabled="superviseDisabled"
          @onCurrentChanged="handleInspectionListCurrentChanged"
          @onApplyChanges="handleApplySupervise"
        />
      </template>
      <template v-slot:default>
        <placeholder-panel v-show="currentInspectionId === ''" text="请选择巡检" />
        <inspection-edit-panel
          v-show="currentInspectionId !== ''"
          :key="currentInspectionId"
          :inspection-id="currentInspectionId"
          :supervise-disabled="superviseDisabled"
          :job-disabled="jobDisabled"
          upsc="ui_preference.pc.audit_management.inspection.inspection_edit_panel"
          @onInspectionPropertyUpdated="handleInspectionPropertyUpdated"
          @onApplySupervise="handleApplySupervise"
          @onApplyJob="handleApplyJob"
        />
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, useTemplateRef } from 'vue'

import { ElMessage } from 'element-plus'

import { type ComponentExposed } from 'vue-component-type-helpers'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import { type Inspection } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspection.ts'
import {
  resetInspectionJob,
  resetInspectionSupervise,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/reset.ts'
import { resolveResponse } from '@/util/response.ts'

import InspectionListPanel from './subPanels/InspectionListPanel.vue'
import InspectionEditPanel from './subPanels/InspectionEditPanel.vue'

defineOptions({
  name: 'InspectionComponent',
})

// region 巡检列表当前选中

const currentInspectionId = ref<string>('')
const inspectionListPanelRef =
  useTemplateRef<ComponentExposed<typeof InspectionListPanel>>('inspectionListPanelRef')

function handleInspectionListCurrentChanged(inspectionId: string): void {
  currentInspectionId.value = inspectionId
}

// endregion

// region 巡检属性更新

function handleInspectionPropertyUpdated(inspection: Inspection): void {
  inspectionListPanelRef.value?.applyPatch(inspection)
}

// endregion

// region 应用变更

const superviseDisabled = ref<boolean>(false)
const jobDisabled = ref<boolean>(false)
let superviseTimer: ReturnType<typeof setTimeout> | null = null
let jobTimer: ReturnType<typeof setTimeout> | null = null

async function handleApplySupervise(): Promise<void> {
  if (superviseDisabled.value) {
    return
  }
  superviseDisabled.value = true
  try {
    await resolveResponse(resetInspectionSupervise())
    ElMessage({
      showClose: true,
      message: '变更应用成功！后台状态刷新中，请不要频繁点击。',
      type: 'success',
    })
    superviseTimer = setTimeout(() => {
      superviseDisabled.value = false
      superviseTimer = null
    }, 3000)
  } catch {
    superviseDisabled.value = false
  }
}

async function handleApplyJob(): Promise<void> {
  if (jobDisabled.value) {
    return
  }
  jobDisabled.value = true
  try {
    await resolveResponse(resetInspectionJob())
    ElMessage({
      showClose: true,
      message: '变更应用成功！后台状态刷新中，请不要频繁点击。',
      type: 'success',
    })
    jobTimer = setTimeout(() => {
      jobDisabled.value = false
      jobTimer = null
    }, 3000)
  } catch {
    jobDisabled.value = false
  }
}

onUnmounted(() => {
  if (superviseTimer !== null) {
    clearTimeout(superviseTimer)
  }
  if (jobTimer !== null) {
    clearTimeout(jobTimer)
  }
})

// endregion
</script>

<style scoped>
.inspection-container {
  width: 100%;
  height: 100%;
}
</style>
