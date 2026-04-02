<template>
  <div class="visualizer-settings-local-override-panel">
    <loading-overlay :loading="loading > 0" />
    <header-layout-panel class="header-panel">
      <template v-slot:header>
        <div class="header-container">
          <div class="header-actions">
            <native-button kind="primary" @click="openSelectDialog">设置</native-button>
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
                :model="modalOverrideInfo"
                label-width="100px"
              >
                <native-form-item label="Visualizer Key">
                  <input
                    :value="modalOverrideInfo.visualizerKey"
                    class="form-input form-input--readonly"
                    type="text"
                    readonly
                    aria-label="Visualizer Key"
                  />
                </native-form-item>
                <native-form-item label="覆盖">
                  <input
                    :value="modalOverrideInfo.override ? '是' : '否'"
                    class="form-input form-input--readonly"
                    type="text"
                    readonly
                    aria-label="覆盖"
                  />
                </native-form-item>
              </native-form>
            </div>
          </title-layout-panel>
          <title-layout-panel
            title="当前可视化器"
            bordered
            :apply-container-height="false"
            class="local-section-detail"
          >
            <div class="section-inner section-inner--grow">
              <placeholder-panel
                v-if="modalOverrideInfo === null"
                text="无本地覆盖时无法展示可视化器详情"
              />
              <native-form v-else class="form" :model="detailForm" label-width="60px">
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
            </div>
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

import { type ModalOverrideInfo, type VisualizerStore } from '@/store/modules/visualizer.ts'

import { ref } from 'vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import { notifySuccess } from '@/library/modules/comvisual/util/nativeUi.ts'

import VisualizerSupportSelectDialog from '../../visualizerSupport/VisualizerSupportSelectDialog.vue'
import { type VisualizerSupportRow } from '../../visualizerSupport/visualizerSupportRow.ts'

defineOptions({
  name: 'VisualizerSettingsLocalOverridePanel',
})

// region Store 引入

const visualizerStore = vim.ctx().store().vueStore<'visualizer', VisualizerStore>('visualizer')

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
const modalOverrideInfo = ref<ModalOverrideInfo | null>(null)

// endregion

// region 本地覆盖同步与刷新

function readOverrideAndSyncDetail(): void {
  modalOverrideInfo.value = visualizerStore.getModalOverrideInfo()
  if (modalOverrideInfo.value === null) {
    clearDetailFields()
    return
  }
  syncDetailFromLibrary(modalOverrideInfo.value.visualizerKey)
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

// region 对话框与覆盖操作

function openSelectDialog(): void {
  selectDialogVisible.value = true
}

function handleCancelOverride(): void {
  loading.value += 1
  try {
    const key: string =
      modalOverrideInfo.value?.visualizerKey ?? vim.ctx().library().setting.defaultVisualizerKey
    visualizerStore.setModalOverrideInfo({
      visualizerKey: key,
      override: false,
    })
    readOverrideAndSyncDetail()
    notifySuccess('已取消本地覆盖设置')
  } finally {
    loading.value -= 1
  }
}

function handleSelectConfirmed(row: VisualizerSupportRow): void {
  loading.value += 1
  try {
    visualizerStore.setModalOverrideInfo({
      visualizerKey: row.key,
      override: true,
    })
    readOverrideAndSyncDetail()
    notifySuccess('本地可视化器覆盖设置保存成功')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 初始化

readOverrideAndSyncDetail()

// endregion
</script>

<style scoped>
.visualizer-settings-local-override-panel {
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
  height: 140px;
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
