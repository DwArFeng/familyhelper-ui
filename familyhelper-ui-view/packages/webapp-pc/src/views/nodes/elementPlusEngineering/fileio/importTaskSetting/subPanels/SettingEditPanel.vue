<template>
  <div class="setting-edit-panel-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="activeName" tab-position="left">
      <el-tab-pane name="settingBasic" :label="t('views.element_plus_engineering.fileio.overview')">
        <setting-basic-panel
          ref="settingBasicPanelRef"
          mode="DEFAULT"
          :setting-id="settingId"
          @onSettingPropertyUpdated="handleSettingPropertyUpdated('DEFAULT')"
          @onPanelFloatyButtonClicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane
        name="importConf"
        :label="t('views.element_plus_engineering.fileio.import_setting')"
      >
        <import-conf-panel
          ref="importConfPanelRef"
          mode="DEFAULT"
          :setting-id="settingId"
          @onPanelFloatyButtonClicked="showPanelFloaty(1)"
        />
      </el-tab-pane>
      <el-tab-pane
        name="importTemplate"
        :label="t('views.element_plus_engineering.fileio.template_setting')"
      >
        <import-template-panel
          ref="importTemplatePanelRef"
          mode="DEFAULT"
          :setting-id="settingId"
          @onPanelFloatyButtonClicked="showPanelFloaty(2)"
        />
      </el-tab-pane>
      <el-tab-pane
        name="importerInfo"
        :label="t('views.element_plus_engineering.fileio.importer_setting')"
      >
        <importer-info-panel
          ref="importerInfoPanelRef"
          mode="DEFAULT"
          :setting-id="settingId"
          @onPanelFloatyButtonClicked="showPanelFloaty(3)"
        />
      </el-tab-pane>
      <el-tab-pane
        name="writerInfo"
        :label="t('views.element_plus_engineering.fileio.writer_setting')"
      >
        <writer-info-panel
          ref="writerInfoPanelRef"
          mode="DEFAULT"
          :setting-id="settingId"
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
      <setting-basic-panel
        v-if="panelFloatyType === 0"
        ref="floatySettingBasicPanelRef"
        mode="FLOATY"
        :setting-id="settingId"
        @onSettingPropertyUpdated="handleSettingPropertyUpdated('FLOATY')"
      />
      <import-conf-panel
        v-if="panelFloatyType === 1"
        ref="floatyImportConfPanelRef"
        mode="FLOATY"
        :setting-id="settingId"
      />
      <import-template-panel
        v-if="panelFloatyType === 2"
        ref="floatyImportTemplatePanelRef"
        mode="FLOATY"
        :setting-id="settingId"
      />
      <importer-info-panel
        v-if="panelFloatyType === 3"
        ref="floatyImporterInfoPanelRef"
        mode="FLOATY"
        :setting-id="settingId"
      />
      <writer-info-panel
        v-if="panelFloatyType === 4"
        ref="floatyWriterInfoPanelRef"
        mode="FLOATY"
        :setting-id="settingId"
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
import SettingBasicPanel from '@/views/nodes/elementPlusEngineering/fileio/importTaskSetting/subPanels/SettingBasicPanel.vue'
import ImportConfPanel from '@/views/nodes/elementPlusEngineering/fileio/importTaskSetting/subPanels/ImportConfPanel.vue'
import ImportTemplatePanel from '@/views/nodes/elementPlusEngineering/fileio/importTaskSetting/subPanels/ImportTemplatePanel.vue'
import ImporterInfoPanel from '@/views/nodes/elementPlusEngineering/fileio/importTaskSetting/subPanels/ImporterInfoPanel.vue'
import WriterInfoPanel from '@/views/nodes/elementPlusEngineering/fileio/importTaskSetting/subPanels/WriterInfoPanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SettingEditPanel' })

// region I18n 引入

const { t } = useI18n()

// endregion
type Props = {
  settingId: string
  upsc?: string
}

const props = withDefaults(defineProps<Props>(), {
  settingId: '',
  upsc: '',
})

type Emits = {
  (e: 'onSettingPropertyUpdated'): void
}

const emit = defineEmits<Emits>()

const settingBasicPanelRef =
  useTemplateRef<ComponentExposed<typeof SettingBasicPanel>>('settingBasicPanelRef')
const floatySettingBasicPanelRef = useTemplateRef<ComponentExposed<typeof SettingBasicPanel>>(
  'floatySettingBasicPanelRef',
)

function handleSettingPropertyUpdated(mode: 'DEFAULT' | 'FLOATY'): void {
  emit('onSettingPropertyUpdated')
  if (mode === 'DEFAULT') {
    floatySettingBasicPanelRef.value?.refresh()
    return
  }
  settingBasicPanelRef.value?.refresh()
}
const activeName = ref<
  'settingBasic' | 'importConf' | 'importTemplate' | 'importerInfo' | 'writerInfo'
>('settingBasic')
const loading = ref<boolean>(false)

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
      return t('views.element_plus_engineering.fileio.overview_floaty')
    case 1:
      return t('views.element_plus_engineering.fileio.import_setting_floaty')
    case 2:
      return t('views.element_plus_engineering.fileio.template_setting_floaty')
    case 3:
      return t('views.element_plus_engineering.fileio.importer_setting_floaty')
    case 4:
      return t('views.element_plus_engineering.fileio.writer_setting_floaty')
    default:
      return t('views.element_plus_engineering.fileio.floaty_window')
  }
})

function showPanelFloaty(type: 0 | 1 | 2 | 3 | 4): void {
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
</script>

<style scoped>
.setting-edit-panel-container,
.tabs-panel {
  height: 100%;
  width: 100%;
}
.tabs-panel :deep(.el-tabs__content),
.tabs-panel :deep(.el-tab-pane) {
  height: 100%;
}
</style>
