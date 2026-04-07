<template>
  <div class="navigation-settings-local-override-panel">
    <loading-overlay :loading="loading > 0 && !localOverrideEditDialogVisible" />
    <header-layout-panel class="header-panel">
      <template v-slot:header>
        <div class="header-container">
          <div class="header-actions">
            <native-button kind="primary" @click="openEditDialog">设置</native-button>
            <native-button :disabled="modalOverrideInfo === null" @click="handleCancelOverride">
              取消设置
            </native-button>
            <native-button kind="success" @click="handleRefresh">刷新</native-button>
          </div>
        </div>
      </template>
      <template v-slot:default>
        <div class="local-body">
          <title-layout-panel title="本地覆盖信息" bordered class="local-section-info">
            <div class="section-inner">
              <placeholder-panel v-if="modalOverrideInfo === null" text="当前无本地覆盖" />
              <native-form
                v-else-if="modalOverrideInfo"
                class="form form-compact"
                :model="readOnlyFormStub"
                label-width="100px"
              >
                <native-form-item label="类型">
                  <input
                    :value="readOnlyTypeLabel"
                    class="form-input form-input--readonly"
                    type="text"
                    readonly
                    aria-label="类型"
                  />
                </native-form-item>
                <native-form-item
                  v-if="modalOverrideInfo.navigationKey.type === 'custom'"
                  label="自定义 ID"
                >
                  <input
                    :value="modalOverrideInfo.navigationKey.id ?? ''"
                    class="form-input form-input--readonly"
                    type="text"
                    readonly
                    aria-label="自定义 ID"
                  />
                </native-form-item>
              </native-form>
            </div>
          </title-layout-panel>
          <title-layout-panel title="Navigation Key JSON" bordered class="local-section-detail">
            <div class="section-inner section-inner--grow">
              <placeholder-panel
                v-if="modalOverrideInfo === null"
                text="无本地覆盖时无法展示 Navigation Key 详情"
              />
              <textarea
                v-else
                :value="navigationKeyJsonText"
                class="text-area text-area--readonly"
                readonly
                spellcheck="false"
                aria-label="Navigation Key JSON"
              />
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="localOverrideEditDialogVisible"
      label-width="100px"
      edit-title="设置本地 Navigation 覆盖"
      edit-confirm-button-label="确认"
      :loading="localOverrideEditDialogLoading"
      :mode="localOverrideEditDialogMode"
      :item="localOverrideEditDialogItem"
      :close-on-click-modal="false"
      :width="480"
      @on-item-edit="handleLocalOverrideEdit"
    >
      <native-form-item label="类型">
        <native-select
          v-model="localOverrideEditDialogItem.type"
          class="dialog-select"
          :disabled="localOverrideEditDialogLoading > 0"
          :options="localOverrideTypeSelectOptions"
        />
      </native-form-item>
      <native-form-item v-if="localOverrideEditDialogItem.type === 'custom'" label="自定义 ID">
        <div class="custom-id-row">
          <input
            v-model="localOverrideEditDialogItem.customId"
            class="form-input form-input--dialog"
            type="text"
            autocomplete="off"
            aria-label="自定义 ID"
            :disabled="localOverrideEditDialogLoading > 0"
          />
          <native-button
            kind="primary"
            :disabled="localOverrideEditDialogLoading > 0"
            @click="openLocalOverrideCustomNavDialog"
          >
            选择
          </native-button>
        </div>
      </native-form-item>
    </maintain-dialog>
    <custom-navigation-select-dialog
      v-model:visible="localOverrideCustomNavDialogVisible"
      @on-confirmed="handleLocalOverrideCustomNavConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import {
  type ModalOverrideInfo,
  type NavigationKey,
  type NavigationKeyType,
  type NavigationStore,
} from '@/store/modules/navigation.ts'

import { computed, ref, watch } from 'vue'

import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeSelect, {
  type NativeSelectOption,
} from '@/components/comvisual/form/nativeSelect/NativeSelect.vue'
import { useEditOnlyMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import { notifySuccess } from '@/library/modules/comvisual/util/nativeUi.ts'

import CustomNavigationSelectDialog from '../../navigation/CustomNavigationSelectDialog.vue'
import { type CustomNavigation } from '../../navigation/customNavigation.ts'
import { DEFAULT_NAVIGATION_KEY } from '../navigationKeyUtils.ts'

defineOptions({
  name: 'NavigationSettingsLocalOverridePanel',
})

// region Store

const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')

// endregion

// region 只读展示

const readOnlyFormStub = ref<Record<string, unknown>>({})

const modalOverrideInfo = ref<ModalOverrideInfo | null>(null)

const readOnlyTypeLabel = computed(() => {
  const info = modalOverrideInfo.value
  if (!info) {
    return ''
  }
  return info.navigationKey.type === 'default' ? '内置默认导航' : '自定义导航'
})

const navigationKeyJsonText = computed(() => {
  const info = modalOverrideInfo.value
  if (!info) {
    return ''
  }
  return `${JSON.stringify(info.navigationKey, null, 2)}\n`
})

// endregion

// region 状态

const loading = ref(0)

// endregion

// region 本地覆盖同步与刷新

function readOverrideAndSyncDetail(): void {
  modalOverrideInfo.value = navigationStore.getModalOverrideInfo()
}

function handleRefresh(): void {
  loading.value += 1
  try {
    readOverrideAndSyncDetail()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 取消覆盖

function handleCancelOverride(): void {
  loading.value += 1
  try {
    const key: NavigationKey = modalOverrideInfo.value?.navigationKey ?? {
      ...DEFAULT_NAVIGATION_KEY,
    }
    navigationStore.setModalOverrideInfo({
      navigationKey: key,
      override: false,
    })
    readOverrideAndSyncDetail()
    notifySuccess('已取消本地覆盖设置')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 本地覆盖编辑对话框

type LocalOverrideEditDialogItem = {
  type: NavigationKeyType
  customId: string
}

const INITIAL_LOCAL_OVERRIDE_EDIT_ITEM: LocalOverrideEditDialogItem = {
  type: 'default',
  customId: '',
}

function navigationKeyToLocalOverrideEditItem(key: NavigationKey): LocalOverrideEditDialogItem {
  return {
    type: key.type,
    customId: key.type === 'custom' ? (key.id ?? '') : '',
  }
}

const { item: localOverrideEditDialogItem, mode: localOverrideEditDialogMode } =
  useEditOnlyMaintainDialog<NavigationKey, LocalOverrideEditDialogItem>(
    navigationKeyToLocalOverrideEditItem,
    INITIAL_LOCAL_OVERRIDE_EDIT_ITEM,
  )

const localOverrideEditDialogLoading = ref<number>(0)

const localOverrideTypeSelectOptions: NativeSelectOption[] = [
  { label: '内置默认导航', value: 'default' },
  { label: '自定义导航', value: 'custom' },
]

const localOverrideEditDialogVisible = ref(false)

const initialNavigationKeyForEdit = computed((): NavigationKey => {
  return modalOverrideInfo.value?.navigationKey ?? { ...DEFAULT_NAVIGATION_KEY }
})

function notifyEditError(message: string): void {
  vim.ctx().library().defaultVisualizerInfo().visualizer.notify('errorMessage', message)
}

watch(
  () => [localOverrideEditDialogVisible.value, initialNavigationKeyForEdit.value] as const,
  ([visible, key]) => {
    if (visible) {
      localOverrideEditDialogItem.value = navigationKeyToLocalOverrideEditItem(key)
    }
  },
)

function buildKeyFromLocalOverrideEditItem(
  item: LocalOverrideEditDialogItem,
): NavigationKey | null {
  if (item.type === 'default') {
    return { type: 'default' }
  }
  const id = item.customId.trim()
  if (id === '') {
    notifyEditError('请选择或填写自定义导航 ID')
    return null
  }
  return { type: 'custom', id }
}

function handleLocalOverrideEdit(item: LocalOverrideEditDialogItem): void {
  const key = buildKeyFromLocalOverrideEditItem(item)
  if (!key) {
    return
  }
  localOverrideEditDialogLoading.value += 1
  try {
    navigationStore.setModalOverrideInfo({
      navigationKey: key,
      override: true,
    })
    readOverrideAndSyncDetail()
    notifySuccess('本地 Navigation 覆盖已保存')
    localOverrideEditDialogVisible.value = false
  } finally {
    localOverrideEditDialogLoading.value -= 1
  }
}

function openEditDialog(): void {
  localOverrideEditDialogVisible.value = true
}

// endregion

// region CustomNavigationSelectDialog

const localOverrideCustomNavDialogVisible = ref(false)

function openLocalOverrideCustomNavDialog(): void {
  localOverrideCustomNavDialogVisible.value = true
}

function handleLocalOverrideCustomNavConfirmed(row: CustomNavigation): void {
  localOverrideEditDialogItem.value.customId = row.key
}

// endregion

// region 初始化

readOverrideAndSyncDetail()

// endregion
</script>

<style scoped>
.navigation-settings-local-override-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.header-panel {
  height: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.local-body {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.local-section-info {
  flex: 0 0 auto;
  height: 130px;
}

.local-section-detail {
  flex: 1;
  min-height: 0;
}

.section-inner {
  height: 100%;
}

.section-inner--grow {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.form-compact {
  padding: 8px;
  box-sizing: border-box;
}

.form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
  box-sizing: border-box;
}

.form-input {
  width: 100%;
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-input--readonly {
  background: #f5f7fa;
}

.form-input--dialog {
  flex: 1;
  min-width: 160px;
}

.text-area {
  width: 100%;
  height: 100%;
  min-height: 120px;
  box-sizing: border-box;
  padding: 8px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: none;
}

.text-area--readonly {
  background: #f5f7fa;
}

.dialog-select {
  width: 100%;
  min-width: 0;
}

.custom-id-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
