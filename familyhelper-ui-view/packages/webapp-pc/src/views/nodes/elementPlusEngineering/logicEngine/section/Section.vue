<template>
  <div class="section-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="38%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <section-list-panel
          ref="sectionListPanelRef"
          :apply-changes-disabled="superviseDisabled"
          @onCurrentChanged="handleSectionListCurrentChanged"
          @onApplyChanges="handleApplySupervise"
        />
      </template>
      <template v-slot:default>
        <placeholder-panel
          v-show="currentSectionId === ''"
          :text="t('views.element_plus_engineering.logic_engine.please_select_section')"
        />
        <section-edit-panel
          v-show="currentSectionId !== ''"
          :key="currentSectionId"
          :section-id="currentSectionId"
          :supervise-disabled="superviseDisabled"
          :job-disabled="jobDisabled"
          :upsc="sectionEditPanelUpsc"
          @onSectionPropertyUpdated="handleSectionPropertyUpdated"
          @onApplySupervise="handleApplySupervise"
          @onApplyJob="handleApplyJob"
        />
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, useTemplateRef } from 'vue'

import { ElMessage } from 'element-plus'

import { type ComponentExposed } from 'vue-component-type-helpers'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import { type Section } from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/section.ts'
import {
  resetJob,
  resetSupervise,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/reset.ts'
import { resolveResponse } from '@/util/response.ts'

import SectionListPanel from './subPanels/SectionListPanel.vue'
import SectionEditPanel from './subPanels/SectionEditPanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SectionComponent',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 部件编辑面板

const UPSC_SECTION_EDIT_PANEL = 'ui_preference.pc.logic_engine.section.section_edit_panel'

const sectionEditPanelUpsc = computed(() => UPSC_SECTION_EDIT_PANEL)

// endregion

// region 部件列表当前选中

const currentSectionId = ref<string>('')
const sectionListPanelRef =
  useTemplateRef<ComponentExposed<typeof SectionListPanel>>('sectionListPanelRef')

function handleSectionListCurrentChanged(sectionId: string): void {
  currentSectionId.value = sectionId
}

// endregion

// region 部件属性更新

function handleSectionPropertyUpdated(section: Section): void {
  sectionListPanelRef.value?.applyPatch(section)
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
    await resolveResponse(resetSupervise())
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.changes_applied_backend_refreshing'),
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
    await resolveResponse(resetJob())
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.changes_applied_backend_refreshing'),
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
.section-container {
  width: 100%;
  height: 100%;
}
</style>
