<template>
  <div class="navigation-settings-local-override-panel">
    <loading-overlay :loading="loading > 0 && !editDialogVisible" />
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
    <modal-dialog
      v-model:visible="editDialogVisible"
      title="设置本地 Navigation 覆盖"
      :close-on-click-modal="false"
      :width="480"
      :overlay-loading="loading > 0 && editDialogVisible"
      @hot-confirm="handleEditHotConfirm"
    >
      <native-form class="dialog-form" :model="dialogFormStub" label-width="100px">
        <native-form-item label="类型">
          <native-select
            v-model="editType"
            class="dialog-select"
            :disabled="loading > 0"
            :options="typeSelectOptions"
          />
        </native-form-item>
        <native-form-item v-if="editType === 'custom'" label="自定义 ID">
          <div class="custom-id-row">
            <input
              v-model="editCustomId"
              class="form-input"
              type="text"
              autocomplete="off"
              aria-label="自定义 ID"
              :disabled="loading > 0"
            />
            <native-button kind="primary" :disabled="loading > 0" @click="openCustomNavDialog">
              选择
            </native-button>
          </div>
        </native-form-item>
      </native-form>
      <template v-slot:footer>
        <div class="footer-row">
          <native-button kind="primary" :disabled="loading > 0" @click="handleEditConfirm">
            确认
          </native-button>
          <native-button :disabled="loading > 0" @click="closeEditDialog">取消</native-button>
        </div>
      </template>
    </modal-dialog>
    <custom-navigation-select-dialog
      v-model:visible="customNavDialogVisible"
      @on-confirmed="handleCustomNavConfirmed"
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
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
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

// region 编辑对话框

const dialogFormStub = ref<Record<string, unknown>>({})

const editDialogVisible = ref(false)
const editType = ref<NavigationKeyType>('default')
const editCustomId = ref('')
const customNavDialogVisible = ref(false)

const typeSelectOptions: NativeSelectOption[] = [
  { label: '内置默认导航', value: 'default' },
  { label: '自定义导航', value: 'custom' },
]

function notifyError(message: string): void {
  vim.ctx().library().defaultVisualizerInfo().visualizer.notify('errorMessage', message)
}

function syncEditFormFromCurrent(): void {
  const info = navigationStore.getModalOverrideInfo()
  if (!info) {
    editType.value = 'default'
    editCustomId.value = ''
    return
  }
  editType.value = info.navigationKey.type
  editCustomId.value = info.navigationKey.type === 'custom' ? (info.navigationKey.id ?? '') : ''
}

function openEditDialog(): void {
  syncEditFormFromCurrent()
  editDialogVisible.value = true
}

function closeEditDialog(): void {
  editDialogVisible.value = false
}

watch(editDialogVisible, (visible) => {
  if (visible) {
    syncEditFormFromCurrent()
  }
})

function openCustomNavDialog(): void {
  customNavDialogVisible.value = true
}

function handleCustomNavConfirmed(row: CustomNavigation): void {
  editCustomId.value = row.key
}

function buildKeyFromEditForm(): NavigationKey | null {
  if (editType.value === 'default') {
    return { type: 'default' }
  }
  const id = editCustomId.value.trim()
  if (id === '') {
    notifyError('请选择或填写自定义导航 ID')
    return null
  }
  return { type: 'custom', id }
}

function handleEditConfirm(): void {
  const key = buildKeyFromEditForm()
  if (!key) {
    return
  }
  loading.value += 1
  try {
    navigationStore.setModalOverrideInfo({
      navigationKey: key,
      override: true,
    })
    readOverrideAndSyncDetail()
    notifySuccess('本地 Navigation 覆盖已保存')
    closeEditDialog()
  } finally {
    loading.value -= 1
  }
}

function handleEditHotConfirm(): void {
  handleEditConfirm()
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

.dialog-form {
  padding: 8px 12px;
  box-sizing: border-box;
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

.custom-id-row .form-input {
  flex: 1;
  min-width: 160px;
}

.footer-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
