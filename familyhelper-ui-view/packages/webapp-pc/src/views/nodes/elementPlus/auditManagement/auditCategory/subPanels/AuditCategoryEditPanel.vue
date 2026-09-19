<template>
  <div class="audit-category-edit-panel-container" v-loading="loading">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="基本信息" name="basic">
        <audit-category-basic-panel
          ref="auditCategoryBasicPanelRef"
          mode="DEFAULT"
          :category-id="categoryId"
          :apply-changes-disabled="applyChangesDisabled"
          @onCategoryPropertyUpdated="handleCategoryPropertyUpdated('DEFAULT', $event)"
          @onApplyChanges="handleApplyChanges"
          @onPanelFloatyButtonClicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane label="属性指标" name="property">
        <audit-property-indicator-panel
          mode="DEFAULT"
          :category-id="categoryId"
          :apply-changes-disabled="applyChangesDisabled"
          @onApplyChanges="handleApplyChanges"
          @onPanelFloatyButtonClicked="showPanelFloaty(1)"
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
      <audit-category-basic-panel
        v-if="panelFloatyType === 0"
        ref="floatyAuditCategoryBasicPanelRef"
        mode="FLOATY"
        :category-id="categoryId"
        :apply-changes-disabled="applyChangesDisabled"
        @onCategoryPropertyUpdated="handleCategoryPropertyUpdated('FLOATY', $event)"
        @onApplyChanges="handleApplyChanges"
      />
      <audit-property-indicator-panel
        v-if="panelFloatyType === 1"
        mode="FLOATY"
        :category-id="categoryId"
        :apply-changes-disabled="applyChangesDisabled"
        @onApplyChanges="handleApplyChanges"
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

import { type AuditCategory } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditCategory.ts'

import AuditCategoryBasicPanel from './AuditCategoryBasicPanel.vue'
import AuditPropertyIndicatorPanel from './AuditPropertyIndicatorPanel.vue'

defineOptions({
  name: 'AuditCategoryEditPanel',
})

// region Props 定义

type Props = {
  categoryId: string
  applyChangesDisabled?: boolean
  upsc?: string
}

const props = withDefaults(defineProps<Props>(), {
  applyChangesDisabled: false,
  upsc: '',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onCategoryPropertyUpdated', category: AuditCategory): void
  (e: 'onApplyChanges'): void
}

const emit = defineEmits<Emits>()

// endregion

// region Tab 页

type TabsActiveName = 'basic' | 'property'

const tabsActiveName = ref<TabsActiveName>('basic')
const loading = ref<boolean>(false)

// endregion

// region 事件处理

const auditCategoryBasicPanelRef = useTemplateRef<ComponentExposed<typeof AuditCategoryBasicPanel>>(
  'auditCategoryBasicPanelRef',
)
const floatyAuditCategoryBasicPanelRef = useTemplateRef<
  ComponentExposed<typeof AuditCategoryBasicPanel>
>('floatyAuditCategoryBasicPanelRef')

function handleCategoryPropertyUpdated(mode: 'DEFAULT' | 'FLOATY', category: AuditCategory): void {
  emit('onCategoryPropertyUpdated', category)
  if (mode === 'DEFAULT') {
    floatyAuditCategoryBasicPanelRef.value?.refresh()
    return
  }
  auditCategoryBasicPanelRef.value?.refresh()
}

function handleApplyChanges(): void {
  emit('onApplyChanges')
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
const panelFloatyType = ref<0 | 1>(0)

const panelFloatyTitle = computed(() => {
  switch (panelFloatyType.value) {
    case 0:
      return '基本信息浮动窗口'
    case 1:
      return '属性指标浮动窗口'
    default:
      return '浮动窗口'
  }
})

function showPanelFloaty(type: 0 | 1): void {
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
    type: 0 | 1
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

// endregion
</script>

<style scoped>
.audit-category-edit-panel-container {
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
