<template>
  <header-layout-panel class="tab-inner">
    <template v-slot:header>
      <div class="header-container">
        <native-button kind="primary" @click="handleOpenOverviewSettingsDialog">
          编辑导航设置
        </native-button>
        <native-button kind="success" @click="emitInspect">刷新数据</native-button>
        <vertical-divider />
        <native-button kind="warning" @click="handleSyncDefaultNavigationClick">
          同步默认导航
        </native-button>
      </div>
    </template>
    <template v-slot:default>
      <div class="scroll-bar">
        <div class="property-form">
          <div class="property-row">
            <span class="property-label">子节点条目总数</span>
            <span class="property-value">{{ overviewDisplay.count }}</span>
          </div>
          <div class="property-row">
            <span class="property-label">defaultNodeKey</span>
            <span class="property-value">{{ overviewDisplay.defaultNodeKey }}</span>
          </div>
          <div class="property-row">
            <span class="property-label">ezNavEnabled</span>
            <span class="property-value">{{ formatBoolean(overviewDisplay.ezNavEnabled) }}</span>
          </div>
          <div class="property-row">
            <span class="property-label">ezNavMaxActiveItem</span>
            <span class="property-value">{{ overviewDisplay.ezNavMaxActiveItem }}</span>
          </div>
          <div class="property-row">
            <span class="property-label">ezNavRestoreWhenLogin</span>
            <span class="property-value">{{ overviewDisplay.ezNavRestoreWhenLogin }}</span>
          </div>
        </div>
      </div>
    </template>
  </header-layout-panel>
  <maintain-dialog
    v-model:visible="overviewSettingsMaintainVisible"
    label-width="200px"
    edit-title="编辑导航设置"
    :loading="overviewSettingsDialogLoading > 0"
    :mode="overviewSettingsMaintainMode"
    :item="overviewSettingsMaintainItem"
    :close-on-click-modal="false"
    @on-item-edit="handleOverviewSettingsSave"
  >
    <native-form-item label="defaultNodeKey">
      <input
        v-model="overviewSettingsMaintainItem.defaultNodeKey"
        class="overview-input"
        type="text"
        placeholder="默认入口节点键，如 welcome"
        spellcheck="false"
      />
    </native-form-item>
    <native-form-item label="ezNavEnabled">
      <label class="check-label">
        <input v-model="overviewSettingsMaintainItem.ezNavEnabled" type="checkbox" />
        <span>启用 EzNav</span>
      </label>
    </native-form-item>
    <native-form-item label="ezNavMaxActiveItem">
      <input
        v-model.number="overviewSettingsMaintainItem.ezNavMaxActiveItem"
        class="overview-input overview-input-narrow"
        type="number"
        min="1"
        step="1"
      />
    </native-form-item>
    <native-form-item label="ezNavRestoreWhenLogin">
      <select v-model="overviewSettingsMaintainItem.ezNavRestoreWhenLogin" class="overview-select">
        <option value="restore-pinned">restore-pinned</option>
        <option value="restore-all">restore-all</option>
      </select>
    </native-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import VerticalDivider from '@/components/comvisual/form/divider/verticalDivider/VerticalDivider.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'

import { useEditOnlyMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  type NavigationNodeInspectResult,
  updateNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/navigationNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { SETTINGREPO_CATEGORY } from '../customNavigation.ts'
import {
  DEFAULT_NAVIGATION_ROOT_SETTING,
  type NavigationSetting,
  parseNavigationSetting,
  stringifyNavigationSetting,
} from '../navigationSetting.ts'
import { syncCustomNavigationFromVimDefaults } from '../syncDefaultNavigation.ts'

defineOptions({
  name: 'NavigationOverviewPanel',
})

// region Props 定义

type Props = {
  navigationNode: NavigationNodeInspectResult | null
  selectedKey: string | null
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  inspect: []
  'loading-delta': [delta: number]
}

const emit = defineEmits<Emits>()

function emitInspect(): void {
  emit('inspect')
}

function emitLoadingDelta(delta: number): void {
  emit('loading-delta', delta)
}

// endregion

// region 概览只读展示

type OverviewDisplayModel = { count: number } & NavigationSetting

const overviewDisplay = computed<OverviewDisplayModel>(() => {
  if (!props.navigationNode) {
    return {
      count: 0,
      ...parseNavigationSetting(''),
    }
  }
  return {
    count: props.navigationNode.count,
    ...parseNavigationSetting(props.navigationNode.content),
  }
})

function formatBoolean(value: boolean): string {
  return value ? '是' : '否'
}

// endregion

// region 编辑根设置对话框

function overviewSettingsMaintainMap(src: OverviewDisplayModel): NavigationSetting {
  return {
    defaultNodeKey: src.defaultNodeKey,
    ezNavEnabled: src.ezNavEnabled,
    ezNavMaxActiveItem: src.ezNavMaxActiveItem,
    ezNavRestoreWhenLogin: src.ezNavRestoreWhenLogin,
  }
}

const {
  visible: overviewSettingsMaintainVisible,
  item: overviewSettingsMaintainItem,
  mode: overviewSettingsMaintainMode,
  showDialog: showOverviewSettingsMaintainDialog,
} = useEditOnlyMaintainDialog<OverviewDisplayModel, NavigationSetting>(
  overviewSettingsMaintainMap,
  { ...DEFAULT_NAVIGATION_ROOT_SETTING },
)

const overviewSettingsDialogLoading = ref(0)

function handleOpenOverviewSettingsDialog(): void {
  showOverviewSettingsMaintainDialog(overviewDisplay.value)
}

function navigationArgs(): string[] | null {
  const k = props.selectedKey
  return k === null ? null : ['custom', k]
}

async function handleOverviewSettingsSave(item: NavigationSetting): Promise<void> {
  const args = navigationArgs()
  if (args === null) {
    return
  }
  const payload: NavigationSetting = {
    defaultNodeKey: item.defaultNodeKey.trim(),
    ezNavEnabled: item.ezNavEnabled,
    ezNavMaxActiveItem: item.ezNavMaxActiveItem,
    ezNavRestoreWhenLogin: item.ezNavRestoreWhenLogin,
  }
  if (!Number.isFinite(payload.ezNavMaxActiveItem) || payload.ezNavMaxActiveItem < 1) {
    notifyWarning('ezNavMaxActiveItem 须为不小于 1 的数字')
    return
  }
  overviewSettingsDialogLoading.value += 1
  try {
    const content = stringifyNavigationSetting(payload)
    await resolveResponse(
      updateNode({
        category: SETTINGREPO_CATEGORY,
        args,
        content,
      }),
    )
    notifySuccess('导航根设置已保存')
    overviewSettingsMaintainVisible.value = false
    emitInspect()
  } finally {
    overviewSettingsDialogLoading.value -= 1
  }
}

// endregion

// region 同步默认导航

async function handleSyncDefaultNavigationClick(): Promise<void> {
  const args = navigationArgs()
  if (args === null) {
    return
  }
  if (
    !window.confirm(
      '即将删除当前导航项在库中的全部数据，并按当前应用内置的默认导航结构重写。\n' +
        '若您不了解后果，请勿继续。\n' +
        '是否继续？',
    )
  ) {
    return
  }
  try {
    await syncCustomNavigationFromVimDefaults({
      category: SETTINGREPO_CATEGORY,
      args,
      adjustLoading: emitLoadingDelta,
    })
    notifySuccess('已按默认导航同步')
    emitInspect()
  } catch {
    notifyWarning('同步默认导航失败')
  }
}

// endregion
</script>

<style scoped>
.tab-inner {
  height: 100%;
  min-height: 0;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  padding: 8px;
  overflow: auto;
  max-height: 100%;
}

.property-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  min-width: 160px;
}

.property-label {
  flex-shrink: 0;
  width: 200px;
  font-size: 14px;
  color: #99a9bf;
  line-height: 1.4;
}

.property-value {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #303133;
  word-break: break-word;
}

.overview-input {
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.overview-input-narrow {
  max-width: 200px;
}

.overview-select {
  height: 32px;
  min-width: 220px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 8px;
}

.check-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}
</style>
