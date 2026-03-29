<template>
  <div class="account-security-edit-panel-container">
    <vertical-tabs v-model="tabsActiveName" class="tabs-panel" :panes="tabPanes">
      <vertical-tab-pane name="account_overlook">
        <account-overlook-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @on-panel-floaty-button-clicked="showPanelFloaty(0)"
        />
      </vertical-tab-pane>
      <vertical-tab-pane name="login_state">
        <login-state-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @on-panel-floaty-button-clicked="showPanelFloaty(1)"
        />
      </vertical-tab-pane>
      <vertical-tab-pane name="login_history">
        <login-history-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @on-panel-floaty-button-clicked="showPanelFloaty(2)"
        />
      </vertical-tab-pane>
      <vertical-tab-pane name="derive_history">
        <derive-history-panel
          mode="DEFAULT"
          :account-id="accountId"
          :readonly="readonly"
          @on-panel-floaty-button-clicked="showPanelFloaty(3)"
        />
      </vertical-tab-pane>
    </vertical-tabs>
    <floaty-dialog
      v-model:visible="panelFloatyVisible"
      show-dock-button
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
      @on-visual-field-adjusted="handlePanelFloatyVisualFieldAdjusted"
      @on-closed="handlePanelFloatyClosed"
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
import { computed, onMounted, ref, watch } from 'vue'

import { useUserPreference } from '@/composables/userPreference.ts'

import FloatyDialog from '@/components/comvisual/dialog/floatyDialog/FloatyDialog.vue'
import {
  type UserPreference as FloatyDialogUserPreference,
  type VisualField,
} from '@/components/comvisual/dialog/floatyDialog/types.ts'
import { useUserPreferenceFloatyDialog } from '@/components/comvisual/dialog/floatyDialog/composables.ts'
import VerticalTabPane from '@/components/comvisual/tabs/verticalTabs/VerticalTabPane.vue'
import VerticalTabs from '@/components/comvisual/tabs/verticalTabs/VerticalTabs.vue'

import AccountOverlookPanel from './subPanels/AccountOverlookPanel.vue'
import DeriveHistoryPanel from './subPanels/DeriveHistoryPanel.vue'
import LoginHistoryPanel from './subPanels/LoginHistoryPanel.vue'
import LoginStatePanel from './subPanels/LoginStatePanel.vue'

defineOptions({
  name: 'AccountSecurityEditPanel',
})

// region Props 定义

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

// endregion

// region Tab 页

type TabsActiveName = 'account_overlook' | 'login_state' | 'login_history' | 'derive_history'

const tabsActiveName = ref<TabsActiveName>('account_overlook')

const tabPanes = [
  { name: 'account_overlook', label: '账户概览' },
  { name: 'login_state', label: '凭证管理' },
  { name: 'login_history', label: '登录历史' },
  { name: 'derive_history', label: '派生历史' },
]

// endregion

// region 面板悬浮

const {
  visible: panelFloatyVisible,
  initialX: panelFloatyInitialX,
  initialY: panelFloatyInitialY,
  initialHeight: panelFloatyInitialHeight,
  initialWidth: panelFloatyInitialWidth,
  initialDockStatus: panelFloatyInitialDockStatus,
  updateInitialVisualField: updatePanelFloatyInitialVisualField,
  provideUserPreference: providePanelFloatyUserPreference,
  applyUserPreference: applyPanelFloatyUserPreference,
} = useUserPreferenceFloatyDialog({
  x: 50,
  y: 100,
  height: 600,
  width: 800,
  dockStatus: 0,
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
  if (props.upsc) {
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
  activeTab: TabsActiveName
  panelFloaty: {
    dialog: FloatyDialogUserPreference
    type: 0 | 1 | 2 | 3
  }
}

const DEFAULT_USER_PREFERENCE: UserPreference = {
  activeTab: 'account_overlook',
  panelFloaty: {
    dialog: {
      visible: false,
      initialX: 50,
      initialY: 100,
      initialHeight: 600,
      initialWidth: 800,
      initialDockStatus: 0,
    },
    type: 0,
  },
}

const { loadUserPreference, saveUserPreference } = useUserPreference<UserPreference>(
  () => props.upsc,
  DEFAULT_USER_PREFERENCE,
  userPreferenceProvide,
  userPreferenceApply,
)

function userPreferenceProvide(): UserPreference | null {
  return {
    activeTab: tabsActiveName.value,
    panelFloaty: {
      dialog: providePanelFloatyUserPreference(),
      type: panelFloatyType.value,
    },
  }
}

function userPreferenceApply(userPreference: UserPreference): void {
  tabsActiveName.value = userPreference.activeTab
  if (userPreference.panelFloaty) {
    applyPanelFloatyUserPreference(userPreference.panelFloaty.dialog)
    panelFloatyType.value = userPreference.panelFloaty.type
  }
}

watch(
  () => tabsActiveName.value,
  () => {
    if (!props.upsc) {
      return
    }
    void saveUserPreference()
  },
)

onMounted(() => {
  if (props.upsc) {
    loadUserPreference()
  }
})

// endregion
</script>

<style scoped>
.account-security-edit-panel-container {
  height: 100%;
  width: 100%;
  min-height: 0;
}

.tabs-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
