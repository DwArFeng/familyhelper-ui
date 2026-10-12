<template>
  <div class="export-task-setting-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="35%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <export-task-setting-list-panel
          ref="exportTaskSettingListPanelRef"
          @onCurrentChanged="handleSettingCurrentChanged"
        />
      </template>
      <template v-slot:default>
        <placeholder-panel
          v-show="currentSetting === null"
          :text="t('views.element_plus_engineering.fileio.please_select_task_setting')"
        />
        <setting-edit-panel
          v-show="currentSetting !== null"
          :key="currentSetting?.key?.long_id ?? ''"
          :setting-id="currentSetting?.key?.long_id ?? ''"
          upsc="ui_preference.pc.fileio.export_task_setting.setting_edit_panel"
          @onSettingPropertyUpdated="handleSettingPropertyUpdated"
        />
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import { type ExportTaskSetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exportTaskSetting.ts'

import ExportTaskSettingListPanel from './subPanels/ExportTaskSettingListPanel.vue'
import SettingEditPanel from './subPanels/SettingEditPanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'ExportTaskSetting',
})

// region I18n 引入

const { t } = useI18n()

// endregion
const currentSetting = ref<ExportTaskSetting | null>(null)
const exportTaskSettingListPanelRef = useTemplateRef<
  ComponentExposed<typeof ExportTaskSettingListPanel>
>('exportTaskSettingListPanelRef')

function handleSettingCurrentChanged(setting: ExportTaskSetting | null): void {
  currentSetting.value = setting
}

function handleSettingPropertyUpdated(): void {
  exportTaskSettingListPanelRef.value?.refresh()
}
</script>

<style scoped>
.export-task-setting-container {
  width: 100%;
  height: 100%;
}
</style>
