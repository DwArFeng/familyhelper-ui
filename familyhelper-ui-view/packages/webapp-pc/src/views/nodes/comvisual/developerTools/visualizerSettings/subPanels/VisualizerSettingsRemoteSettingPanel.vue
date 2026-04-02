<template>
  <div class="visualizer-settings-remote-panel">
    <loading-overlay :loading="loading > 0" />
    <header-layout-panel class="header-panel">
      <template v-slot:header>
        <div class="header-container">
          <div class="header-actions">
            <native-button kind="primary" @click="openSelectDialog">设置</native-button>
            <native-button kind="success" @click="handleRefresh">刷新</native-button>
          </div>
        </div>
      </template>
      <template v-slot:default>
        <div class="body-wrap">
          <title-layout-panel
            title="当前可视化器"
            bordered
            :apply-container-height="false"
            class="detail-title-panel"
          >
            <native-form class="form" :model="detailForm" label-width="60px">
              <native-form-item label="Key">
                <input
                  v-model="detailForm.key"
                  class="form-input form-input--readonly"
                  type="text"
                  readonly
                  aria-label="Key"
                />
              </native-form-item>
              <native-form-item label="名称">
                <input
                  v-model="detailForm.name"
                  class="form-input form-input--readonly"
                  type="text"
                  readonly
                  aria-label="名称"
                />
              </native-form-item>
              <native-form-item class="form-item-grow" label="描述">
                <textarea
                  v-model="detailForm.description"
                  class="text-area text-area--readonly"
                  readonly
                  spellcheck="false"
                  aria-label="描述"
                />
              </native-form-item>
              <native-form-item class="form-item-grow" label="参数示例">
                <textarea
                  v-model="detailForm.exampleDisplayText"
                  class="text-area text-area--readonly"
                  readonly
                  spellcheck="false"
                  aria-label="参数示例"
                />
              </native-form-item>
            </native-form>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <visualizer-support-select-dialog
      v-model:visible="selectDialogVisible"
      @on-confirmed="handleSelectConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, ref } from 'vue'

import {
  operateInspect,
  operatePut,
  type TextNodeInspectResult,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import { notifySuccess } from '@/library/modules/comvisual/util/nativeUi.ts'
import { resolveResponse } from '@/util/response.ts'

import VisualizerSupportSelectDialog from '../../visualizerSupport/VisualizerSupportSelectDialog.vue'
import { type VisualizerSupportRow } from '../../visualizerSupport/visualizerSupportRow.ts'

defineOptions({
  name: 'VisualizerSettingsRemoteSettingPanel',
})

// region 配置仓库常量

const SETTINGREPO_CATEGORY = 'public$framework.pc.visualizer'

const SETTINGREPO_ARGS_KEY: string[] = ['key']

// endregion

// region 类型与详情表单

type DetailFormItem = {
  key: string
  name: string
  description: string
  exampleDisplayText: string
}

const detailForm = ref<DetailFormItem>({
  key: '',
  name: '',
  description: '',
  exampleDisplayText: '',
})

function clearDetailFields(): void {
  detailForm.value = {
    key: '',
    name: '',
    description: '',
    exampleDisplayText: '',
  }
}

function syncDetailFromLibrary(visualizerKey: string): void {
  const info = vim.ctx().library().visualizerInfo(visualizerKey)
  if (!info) {
    clearDetailFields()
    return
  }
  detailForm.value = {
    key: visualizerKey,
    name: info.name,
    description: info.description,
    exampleDisplayText: JSON.stringify(info.exampleDisplay as object, null, 2),
  }
}

// endregion

// region 状态

const loading = ref(0)
const selectDialogVisible = ref(false)

// endregion

// region 解析与刷新

function defaultVisualizerKey(): string {
  return vim.ctx().library().setting.defaultVisualizerKey
}

function resolveEffectiveKeyFromInspectResult(result: TextNodeInspectResult | null): string {
  const fallback = defaultVisualizerKey()
  if (!result) {
    return fallback
  }
  const raw = result.value.trim()
  if (raw === '') {
    return fallback
  }
  try {
    const kebab = toKebabCase(raw)
    if (vim.ctx().library().visualizerInfo(kebab)) {
      return kebab
    }
  } catch {
    return fallback
  }
  return fallback
}

function notifyError(message: string): void {
  vim.ctx().library().defaultVisualizerInfo().visualizer.notify('errorMessage', message)
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
    const key = resolveEffectiveKeyFromInspectResult(result)
    syncDetailFromLibrary(key)
  } catch (e: unknown) {
    const key = defaultVisualizerKey()
    syncDetailFromLibrary(key)
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

// region 对话框与写入

function openSelectDialog(): void {
  selectDialogVisible.value = true
}

async function handleSelectConfirmed(row: VisualizerSupportRow): Promise<void> {
  loading.value += 1
  try {
    await resolveResponse(
      operatePut({
        category: SETTINGREPO_CATEGORY,
        args: SETTINGREPO_ARGS_KEY,
        value: row.key,
      }),
    )
    await handleRefresh()
    notifySuccess('远端可视化器设置保存成功')
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

// endregion

// region 生命周期

onMounted(() => {
  void handleRefresh()
})

// endregion
</script>

<style scoped>
.visualizer-settings-remote-panel {
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
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
  box-sizing: border-box;
}

.form-item-grow {
  height: 0;
  flex-grow: 1;
  min-height: 120px;
}

/*noinspection CssUnusedSymbol*/
.form-item-grow :deep(.native-form-item__content) {
  height: 100%;
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
</style>
