<template>
  <div class="warmup-setting-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="38%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <warmup-setting-list-panel
          :apply-changes-disabled="applyChangesDisabled"
          @onCurrentChanged="handleCurrentChanged"
          @onMutated="handleMutated"
          @onApplyChanges="handleApplyChanges"
        />
      </template>
      <template v-slot:default>
        <placeholder-panel
          v-show="currentId === ''"
          :text="t('views.element_plus_engineering.settingrepo.select_warmup_setting')"
        />
        <warmup-setting-edit-panel
          v-show="currentId !== ''"
          ref="warmupSettingEditPanelRef"
          :key="currentId"
          :warmup-setting-id="currentId"
          :apply-changes-disabled="applyChangesDisabled"
          :upsc="warmupSettingEditPanelUpsc"
          @onApplyChanges="handleApplyChanges"
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

import { resetWarmup } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/reset.ts'
import { resolveResponse } from '@/util/response.ts'

import WarmupSettingListPanel from './subPanels/WarmupSettingListPanel.vue'
import WarmupSettingEditPanel from './subPanels/WarmupSettingEditPanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'WarmupSetting',
})

// region I18n 引入

const { t } = useI18n()

// endregion

// region 预热设置编辑面板

const UPSC_WARMUP_SETTING_EDIT_PANEL =
  'ui_preference.pc.settingrepo.warmup_setting.warmup_setting_edit_panel'

const warmupSettingEditPanelUpsc = computed(() => UPSC_WARMUP_SETTING_EDIT_PANEL)

const warmupSettingEditPanelRef = useTemplateRef<ComponentExposed<typeof WarmupSettingEditPanel>>(
  'warmupSettingEditPanelRef',
)

function handleMutated(): void {
  warmupSettingEditPanelRef.value?.refresh()
}

// endregion

// region 当前预热设置

const currentId = ref<string>('')

function handleCurrentChanged(id: string): void {
  currentId.value = id
}

// endregion

// region 应用变更

const applyChangesDisabled = ref<boolean>(false)
let applyChangesTimer: ReturnType<typeof setTimeout> | null = null

async function handleApplyChanges(): Promise<void> {
  if (applyChangesDisabled.value) {
    return
  }
  applyChangesDisabled.value = true
  try {
    await resolveResponse(resetWarmup())
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.changes_applied_backend_refreshing'),
      type: 'success',
    })
    applyChangesTimer = setTimeout(() => {
      applyChangesDisabled.value = false
      applyChangesTimer = null
    }, 3000)
  } catch {
    applyChangesDisabled.value = false
  }
}

onUnmounted(() => {
  if (applyChangesTimer !== null) {
    clearTimeout(applyChangesTimer)
  }
})

// endregion
</script>

<style scoped>
.warmup-setting-container {
  width: 100%;
  height: 100%;
}
</style>
