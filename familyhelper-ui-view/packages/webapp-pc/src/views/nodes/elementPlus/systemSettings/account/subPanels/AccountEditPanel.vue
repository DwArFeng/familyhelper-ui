<template>
  <div class="account-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="概览" name="overlook">
        <account-overview-panel
          ref="accountOverviewPanelRef"
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @onAccountPropertyUpdated="handleAccountPropertyUpdated('DEFAULT')"
          @onPanelFloatyButtonClicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane label="角色" name="role">
        <account-role-panel
          ref="accountRolePanelRef"
          mode="DEFAULT"
          :account-id="accountId"
          @onPanelFloatyButtonClicked="showPanelFloaty(1)"
          @onRoleDataUpdated="handleRoleDataUpdated('DEFAULT')"
        />
      </el-tab-pane>
      <el-tab-pane label="保护器" name="protector">
        <account-protector-info-panel
          ref="accountProtectorInfoPanelRef"
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
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
      <account-overview-panel
        v-if="panelFloatyType === 0"
        ref="floatyAccountOverviewPanelRef"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
        @onAccountPropertyUpdated="handleAccountPropertyUpdated('FLOATY')"
      />
      <account-role-panel
        v-if="panelFloatyType === 1"
        ref="floatyAccountRolePanelRef"
        mode="FLOATY"
        :account-id="accountId"
        @onRoleDataUpdated="handleRoleDataUpdated('FLOATY')"
      />
      <account-protector-info-panel
        v-if="panelFloatyType === 2"
        ref="floatyAccountProtectorInfoPanelRef"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
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

import AccountOverviewPanel from './AccountOverviewPanel.vue'
import AccountProtectorInfoPanel from './AccountProtectorInfoPanel.vue'
import AccountRolePanel from './AccountRolePanel.vue'

defineOptions({
  name: 'AccountEditPanel',
})

// region Props 定义

type Props = {
  accountId: string
  readonly?: boolean
  upsc?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  upsc: '',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onAccountPropertyUpdated'): void
}

const emit = defineEmits<Emits>()

// endregion

// region Tab 页

type TabsActiveName = 'overlook' | 'role' | 'protector'

const tabsActiveName = ref<TabsActiveName>('overlook')

// endregion

// region 事件处理

const accountOverviewPanelRef =
  useTemplateRef<ComponentExposed<typeof AccountOverviewPanel>>('accountOverviewPanelRef')
const floatyAccountOverviewPanelRef = useTemplateRef<ComponentExposed<typeof AccountOverviewPanel>>(
  'floatyAccountOverviewPanelRef',
)
const accountRolePanelRef =
  useTemplateRef<ComponentExposed<typeof AccountRolePanel>>('accountRolePanelRef')
const floatyAccountRolePanelRef = useTemplateRef<ComponentExposed<typeof AccountRolePanel>>(
  'floatyAccountRolePanelRef',
)

function handleAccountPropertyUpdated(mode: 'DEFAULT' | 'FLOATY'): void {
  emit('onAccountPropertyUpdated')
  if (mode === 'DEFAULT') {
    floatyAccountOverviewPanelRef.value?.accountSearch()
  } else {
    accountOverviewPanelRef.value?.accountSearch()
  }
}

function handleRoleDataUpdated(mode: 'DEFAULT' | 'FLOATY'): void {
  if (mode === 'DEFAULT') {
    floatyAccountRolePanelRef.value?.roleSearch()
  } else {
    accountRolePanelRef.value?.roleSearch()
  }
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
      return '概览浮动窗口'
    case 1:
      return '角色浮动窗口'
    case 2:
      return '保护器浮动窗口'
    default:
      return '浮动窗口'
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
  if (props.upsc) {
    saveUserPreference()
  }
}

function handlePanelFloatyVisualFieldAdjusted(visualField: VisualField): void {
  updatePanelFloatyInitialVisualField(visualField)
  if (props.upsc) {
    saveUserPreference()
  }
}

function handlePanelFloatyClosed(): void {
  if (props.upsc) {
    saveUserPreference()
  }
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
  if (props.upsc) {
    loadUserPreference()
  }
})

// endregion
</script>

<style scoped>
.account-edit-panel-container {
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
