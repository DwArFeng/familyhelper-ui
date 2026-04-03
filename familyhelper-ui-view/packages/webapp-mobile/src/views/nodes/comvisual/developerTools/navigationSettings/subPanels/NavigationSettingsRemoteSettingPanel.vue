<template>
  <div class="navigation-settings-remote-panel">
    <loading-overlay :loading="loading > 0 && !editDialogVisible" />
    <header-layout-panel class="header-panel">
      <template v-slot:header>
        <div class="header-container">
          <div class="header-actions">
            <native-button kind="primary" @click="openEditDialog">设置</native-button>
            <native-button kind="success" @click="handleRefresh">刷新</native-button>
          </div>
        </div>
      </template>
      <template v-slot:default>
        <div class="body-wrap">
          <title-layout-panel
            title="当前 Navigation Key"
            bordered
            :apply-container-height="false"
            class="detail-title-panel"
          >
            <native-form class="form" :model="detailFormStub" label-width="100px">
              <native-form-item label="类型">
                <input
                  :value="detailTypeLabel"
                  class="form-input form-input--readonly"
                  type="text"
                  readonly
                  aria-label="类型"
                />
              </native-form-item>
              <native-form-item v-if="displayedKey.type === 'custom'" label="自定义 ID">
                <input
                  :value="displayedKey.id ?? ''"
                  class="form-input form-input--readonly"
                  type="text"
                  readonly
                  aria-label="自定义 ID"
                />
              </native-form-item>
            </native-form>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <modal-dialog
      v-model:visible="editDialogVisible"
      title="设置远端 Navigation Key"
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

import { computed, onMounted, ref, watch } from 'vue'

import {
  operateInspect,
  operatePut,
  type TextNodeInspectResult,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeSelect, {
  type NativeSelectOption,
} from '@/components/comvisual/form/nativeSelect/NativeSelect.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import { notifySuccess } from '@/library/modules/comvisual/util/nativeUi.ts'
import { resolveResponse } from '@/util/response.ts'

import { type NavigationKey, type NavigationKeyType } from '@/store/modules/navigation.ts'

import CustomNavigationSelectDialog from '../../navigation/CustomNavigationSelectDialog.vue'
import { type CustomNavigation } from '../../navigation/customNavigation.ts'
import {
  DEFAULT_NAVIGATION_KEY,
  stringifyNavigationKeyForSave,
  tryParseNavigationKeyJson,
} from '../navigationKeyUtils.ts'

defineOptions({
  name: 'NavigationSettingsRemoteSettingPanel',
})

// region 配置仓库常量

const SETTINGREPO_CATEGORY = 'public$framework.mobile.navigation'

const SETTINGREPO_ARGS_KEY: string[] = ['key']

// endregion

// region 详情状态

const displayedKey = ref<NavigationKey>({ ...DEFAULT_NAVIGATION_KEY })

const detailFormStub = ref<Record<string, unknown>>({})

const detailTypeLabel = computed(() =>
  displayedKey.value.type === 'default' ? '内置默认导航' : '自定义导航',
)

// endregion

// region 加载与刷新

const loading = ref(0)

function notifyError(message: string): void {
  vim.ctx().library().defaultVisualizerInfo().visualizer.notify('errorMessage', message)
}

function resolveKeyFromInspectResult(result: TextNodeInspectResult | null): NavigationKey {
  if (!result) {
    return { ...DEFAULT_NAVIGATION_KEY }
  }
  const parsed = tryParseNavigationKeyJson(result.value)
  if (!parsed) {
    return { ...DEFAULT_NAVIGATION_KEY }
  }
  return parsed
}

async function handleRefresh(): Promise<void> {
  loading.value += 1
  try {
    const result = (await resolveResponse(
      operateInspect({
        category: SETTINGREPO_CATEGORY,
        args: SETTINGREPO_ARGS_KEY,
      }),
    )) as TextNodeInspectResult | null
    displayedKey.value = resolveKeyFromInspectResult(result)
  } catch (e: unknown) {
    displayedKey.value = { ...DEFAULT_NAVIGATION_KEY }
    let message: string
    if (e instanceof Error) {
      message = e.message
    } else {
      message = '未知错误'
    }
    notifyError(message)
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

function syncEditFormFromDisplayed(): void {
  const k = displayedKey.value
  editType.value = k.type
  editCustomId.value = k.type === 'custom' ? (k.id ?? '') : ''
}

function openEditDialog(): void {
  syncEditFormFromDisplayed()
  editDialogVisible.value = true
}

function closeEditDialog(): void {
  editDialogVisible.value = false
}

watch(editDialogVisible, (visible) => {
  if (visible) {
    syncEditFormFromDisplayed()
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

async function handleEditConfirm(): Promise<void> {
  const key = buildKeyFromEditForm()
  if (!key) {
    return
  }
  let payload: string
  try {
    payload = stringifyNavigationKeyForSave(key)
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '未知错误')
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      operatePut({
        category: SETTINGREPO_CATEGORY,
        args: SETTINGREPO_ARGS_KEY,
        value: payload,
      }),
    )
    await handleRefresh()
    notifySuccess('远端 Navigation Key 保存成功')
    closeEditDialog()
  } catch (e: unknown) {
    let message: string
    if (e instanceof Error) {
      message = e.message
    } else {
      message = '未知错误'
    }
    notifyError(message)
  } finally {
    loading.value -= 1
  }
}

function handleEditHotConfirm(): void {
  void handleEditConfirm()
}

// endregion

// region 生命周期

onMounted(() => {
  void handleRefresh()
})

// endregion
</script>

<style scoped>
.navigation-settings-remote-panel {
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

.body-wrap {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.detail-title-panel {
  flex: 1;
  min-height: 0;
}

.form {
  width: 100%;
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
