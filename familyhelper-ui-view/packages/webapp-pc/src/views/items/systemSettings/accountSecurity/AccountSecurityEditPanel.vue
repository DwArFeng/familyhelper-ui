<template>
  <div class="account-security-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
      <el-tab-pane label="账户概览" name="account_overlook">
        <account-overlook-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @on-panel-floaty-button-clicked="showPanelFloaty(0)"
        />
      </el-tab-pane>
      <el-tab-pane label="凭证管理" name="login_state">
        <login-state-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @on-panel-floaty-button-clicked="showPanelFloaty(1)"
        />
      </el-tab-pane>
      <el-tab-pane label="登录历史" name="login_history">
        <login-history-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @on-panel-floaty-button-clicked="showPanelFloaty(2)"
        />
      </el-tab-pane>
      <el-tab-pane label="派生历史" name="derive_history">
        <derive-history-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @on-panel-floaty-button-clicked="showPanelFloaty(3)"
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
      <account-overlook-panel
        v-if="panelFloatyType === 0"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
      />
      <login-state-panel
        v-if="panelFloatyType === 1"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
      />
      <login-history-panel
        v-if="panelFloatyType === 2"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
      />
      <derive-history-panel
        v-if="panelFloatyType === 3"
        mode="FLOATY"
        :account-id="accountId"
        :readonly="readonly"
      />
    </floaty-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useUserPreference } from '@/composables/userPreference.ts'

import type {
  UserPreference as FloatyDialogUserPreference,
  VisualField,
} from '@/components/dialog/floatyDialog/types.ts'
import { useUserPreferenceFloatyDialog } from '@/components/dialog/floatyDialog/composables.ts'
import FloatyDialog from '@/components/dialog/floatyDialog/FloatyDialog.vue'

import AccountOverlookPanel from './subPanels/AccountOverlookPanel.vue'
import LoginStatePanel from './subPanels/LoginStatePanel.vue'
import LoginHistoryPanel from './subPanels/LoginHistoryPanel.vue'
import DeriveHistoryPanel from './subPanels/DeriveHistoryPanel.vue'

defineOptions({
  name: 'AccountSecurityEditPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountId: string
  readonly: boolean
  upsc: string
}

const props = withDefaults(defineProps<Props>(), {
  accountId: '',
  readonly: false,
  upsc: '',
})

// -----------------------------------------------------------Tab 页-----------------------------------------------------------
type TabsActiveName = 'overlook' | 'login_state' | 'login_history' | 'derive_history'

const tabsActiveName = ref<TabsActiveName>('overlook')

// -----------------------------------------------------------悬浮面板-----------------------------------------------------------
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
const panelFloatyType = ref<0 | 1 | 2 | 3>(0)

const panelFloatyTitle = computed(() => {
  switch (panelFloatyType.value) {
    case 0:
      return '账户概览浮动窗口'
    case 1:
      return '凭证管理浮动窗口'
    case 2:
      return '登录历史浮动窗口'
    case 3:
      return '派生历史浮动窗口'
    default:
      return '浮动窗口'
  }
})

function showPanelFloaty(type: 0 | 1 | 2 | 3): void {
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

// -----------------------------------------------------------用户偏好-----------------------------------------------------------
type UserPreference = {
  panelFloaty: {
    dialog: FloatyDialogUserPreference
    type: 0 | 1 | 2 | 3
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
</script>

<style scoped>
.account-security-edit-panel-container {
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
