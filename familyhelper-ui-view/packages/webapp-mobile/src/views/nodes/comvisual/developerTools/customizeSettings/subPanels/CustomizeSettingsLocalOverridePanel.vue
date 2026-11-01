<template>
  <div class="customize-settings-local-override-panel">
    <loading-overlay :loading="loading > 0 && !overrideEditDialogVisible" />
    <header-layout-panel class="header-panel">
      <template v-slot:header>
        <div class="header-container">
          <div class="header-actions">
            <native-button kind="primary" @click="openEditDialog">设置</native-button>
            <native-button :disabled="overrideInfo === null" @click="handleCancelOverride">
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
              <placeholder-panel v-if="overrideInfo === null" text="当前无本地定制覆盖" />
              <native-form
                v-else
                class="form form-compact"
                :model="readOnlyFormStub"
                label-width="100px"
              >
                <native-form-item label="定制键">
                  <input
                    :value="overrideInfo.customizeKey"
                    class="form-input form-input--readonly"
                    type="text"
                    readonly
                    aria-label="定制键"
                  />
                </native-form-item>
                <native-form-item label="名称">
                  <input
                    :value="overrideCustomizeLabel"
                    class="form-input form-input--readonly"
                    type="text"
                    readonly
                    aria-label="名称"
                  />
                </native-form-item>
              </native-form>
            </div>
          </title-layout-panel>
          <title-layout-panel title="本地覆盖 JSON" bordered class="local-section-detail">
            <div class="section-inner section-inner--grow">
              <placeholder-panel
                v-if="overrideInfo === null"
                text="无本地覆盖时无法展示定制覆盖详情"
              />
              <textarea
                v-else
                :value="overrideJsonText"
                class="text-area text-area--readonly"
                readonly
                spellcheck="false"
                aria-label="本地覆盖 JSON"
              />
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="overrideEditDialogVisible"
      label-width="100px"
      edit-title="设置本地定制覆盖"
      edit-confirm-button-label="确认"
      :loading="overrideEditDialogLoading > 0"
      :mode="overrideEditDialogMode"
      :item="overrideEditDialogItem"
      :close-on-click-modal="false"
      :width="480"
      @on-item-edit="handleOverrideEdit"
    >
      <native-form-item label="定制方案">
        <native-select
          v-model="overrideEditDialogItem.customizeKey"
          class="dialog-select"
          :disabled="overrideEditDialogLoading > 0"
          :options="customizeKeySelectOptions"
          placeholder="请选择定制方案"
        />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import vim from '@/vim'

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
import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  type TextNodeInspectResult,
  operateInspect,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { toSnakeCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'
import { resolveResponse } from '@/util/response.ts'

import { type CustomizeOverrideLookup, type CustomizeStore } from '@/store/modules/customize.ts'

defineOptions({
  name: 'CustomizeSettingsLocalOverridePanel',
})

// region Props 定义

type Props = {
  /**
   * 当前编辑的 Visualizer key。
   */
  visualizerKey: string
}

const props = defineProps<Props>()

// endregion

// region 类型定义

/**
 * 定制方案列表项。
 *
 * 列表项只描述方案身份，方案内容由 repo KV 节点单独维护。
 */
type CustomizeListSettingItem = {
  key: string
  label: string
  remark: string
}

// endregion

// region 配置仓库常量

const SETTINGREPO_CATEGORY = 'public$framework.mobile.customize'
const SETTINGREPO_ARGS_LIST = 'customize_list'

// endregion

// region Store

const customizeStore = vim.ctx().store().vueStore<'customize', CustomizeStore>('customize')

// endregion

// region 配置辅助函数

/**
 * 构建当前 Visualizer 对应的配置仓库参数。
 *
 * @param baseArg 配置节点的基础参数。
 * @returns 带 Visualizer 前缀的完整参数。
 */
function customizeSettingrepoArgs(baseArg: string): string[] {
  return [toSnakeCase(props.visualizerKey), baseArg]
}

/**
 * 查询当前 Visualizer 的定制方案列表。
 *
 * @returns 规范化后的定制方案列表。
 */
async function loadCustomizeSettingOptions(): Promise<CustomizeListSettingItem[]> {
  const result = await resolveResponse(
    operateInspect({
      category: SETTINGREPO_CATEGORY,
      args: customizeSettingrepoArgs(SETTINGREPO_ARGS_LIST),
    }),
  )
  const raw = (result as TextNodeInspectResult | null)?.value
  if (raw === null || raw === undefined || raw.trim() === '') {
    return []
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    throw new Error('定制方案列表 JSON 格式不正确')
  }
  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as { items?: unknown }).items)
  ) {
    throw new Error('定制方案列表 JSON 缺少 items 数组')
  }
  const options: CustomizeListSettingItem[] = []
  const seenKeys = new Set<string>()
  for (const item of (parsed as { items: unknown[] }).items) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      continue
    }
    const rawItem = item as Record<string, unknown>
    if (typeof rawItem.key !== 'string' || typeof rawItem.label !== 'string') {
      continue
    }
    const key = rawItem.key.trim()
    const label = rawItem.label.trim()
    if (key === '' || label === '' || seenKeys.has(key)) {
      continue
    }
    seenKeys.add(key)
    options.push({
      key,
      label,
      remark: typeof rawItem.remark === 'string' ? rawItem.remark.trim() : '',
    })
  }
  return options
}

// endregion

// region 状态与选择项

const loading = ref(0)
const customizeOptions = ref<CustomizeListSettingItem[]>([])
const overrideInfo = ref<CustomizeOverrideLookup | null>(null)
const readOnlyFormStub: Record<string, unknown> = {}

/**
 * 将本地覆盖 key 映射为列表中可展示的方案名称。
 */
const overrideCustomizeLabel = computed(() => {
  const customizeKey = overrideInfo.value?.customizeKey
  if (!customizeKey) {
    return ''
  }
  return (
    customizeOptions.value.find((item) => item.key === customizeKey)?.label ?? '未在定制方案列表中'
  )
})

const overrideJsonText = computed(() => {
  if (overrideInfo.value === null) {
    return ''
  }
  return `${JSON.stringify(overrideInfo.value, null, 2)}\n`
})

const customizeKeySelectOptions = computed<NativeSelectOption[]>(() =>
  customizeOptions.value.map((item) => ({
    label: item.label + ' (' + item.key + ')',
    value: item.key,
  })),
)

// endregion

// region 本地覆盖同步与刷新

/**
 * 从 Store 读取本地覆盖。
 *
 * 按页面当前所选 Visualizer 读取覆盖，使浏览器正在运行其他可视化器时也能查看和管理该条目。
 */
function readOverrideAndSyncDetail(): void {
  overrideInfo.value = customizeStore.getCustomizeOverrideInfoItem(props.visualizerKey)
}

/**
 * 清除页面展示的本地覆盖。
 *
 * 覆盖映射按 Visualizer 分别保存，因此这里只清除当前页面所选可视化器的条目。
 */
function clearLocalOverride(): void {
  customizeStore.clearCustomizeOverride(props.visualizerKey)
  overrideInfo.value = null
  notifySuccess('本地定制覆盖已取消')
}

async function handleRefresh(): Promise<void> {
  loading.value += 1
  try {
    customizeOptions.value = await loadCustomizeSettingOptions()
    readOverrideAndSyncDetail()
  } catch {
    customizeOptions.value = []
    readOverrideAndSyncDetail()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 本地覆盖编辑对话框

type OverrideEditDialogItem = {
  customizeKey: string
}

const INITIAL_OVERRIDE_EDIT_ITEM: OverrideEditDialogItem = {
  customizeKey: '',
}

/**
 * 将当前本地覆盖映射为对话框数据。
 *
 * @param customizeKey 当前本地覆盖的定制 key。
 * @returns 对话框使用的定制 key。
 */
function customizeKeyToOverrideEditItem(customizeKey: string): OverrideEditDialogItem {
  return { customizeKey }
}

const { item: overrideEditDialogItem, mode: overrideEditDialogMode } = useEditOnlyMaintainDialog<
  string,
  OverrideEditDialogItem
>(customizeKeyToOverrideEditItem, INITIAL_OVERRIDE_EDIT_ITEM)

const overrideEditDialogLoading = ref(0)
const overrideEditDialogVisible = ref(false)

const initialCustomizeKeyForEdit = computed(
  (): string => overrideInfo.value?.customizeKey ?? customizeStore.customizeKey,
)

watch(
  () => [overrideEditDialogVisible.value, initialCustomizeKeyForEdit.value] as const,
  ([visible, customizeKey]) => {
    if (visible) {
      overrideEditDialogItem.value = customizeKeyToOverrideEditItem(customizeKey)
    }
  },
)

/**
 * 保存当前浏览器的定制方案覆盖。
 *
 * 写入后重新读取 Store，只有在 Store 实际接受覆盖时才提示成功，避免无效表单造成假成功。
 *
 * @param item 对话框提交的定制 key。
 */
function handleOverrideEdit(item: OverrideEditDialogItem): void {
  const customizeKey = item.customizeKey.trim()
  if (customizeKey === '') {
    notifyWarning('请选择定制方案')
    return
  }
  if (!customizeOptions.value.some((option) => option.key === customizeKey)) {
    notifyWarning('所选定制方案不在当前列表中')
    return
  }
  overrideEditDialogLoading.value += 1
  try {
    customizeStore.setCustomizeOverrideInfoItem(props.visualizerKey, {
      customizeKey,
      override: true,
    })
    const savedInfo = customizeStore.getCustomizeOverrideInfoItem(props.visualizerKey)
    if (savedInfo === null || savedInfo.customizeKey !== customizeKey) {
      notifyWarning('本地覆盖未生效，请确认定制方案列表后重试')
      return
    }
    overrideInfo.value = savedInfo
    overrideEditDialogVisible.value = false
    notifySuccess('本地定制覆盖已保存')
  } finally {
    overrideEditDialogLoading.value -= 1
  }
}

function openEditDialog(): void {
  if (customizeOptions.value.length === 0) {
    notifyWarning('当前可视化器没有可用的定制方案')
    return
  }
  overrideEditDialogVisible.value = true
}

// endregion

// region 取消本地覆盖

function handleCancelOverride(): void {
  if (overrideInfo.value === null) {
    return
  }
  clearLocalOverride()
}

// endregion

// region 生命周期

onMounted(() => {
  void handleRefresh()
})

// endregion
</script>

<style scoped>
.customize-settings-local-override-panel {
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
  height: 160px;
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

.dialog-select {
  width: 100%;
  min-width: 0;
}
</style>
