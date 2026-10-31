<template>
  <div class="customize-settings-remote-panel">
    <loading-overlay :loading="loading > 0 && !remoteKeyEditDialogVisible" />
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
            title="当前远端定制"
            bordered
            :apply-container-height="false"
            class="detail-title-panel"
          >
            <native-form class="form" :model="detailFormStub" label-width="100px">
              <native-form-item label="定制键">
                <input
                  :value="displayedCustomizeKey || '未设置'"
                  class="form-input form-input--readonly"
                  type="text"
                  readonly
                  aria-label="定制键"
                />
              </native-form-item>
              <native-form-item label="名称">
                <input
                  :value="displayedCustomizeLabel || '未设置'"
                  class="form-input form-input--readonly"
                  type="text"
                  readonly
                  aria-label="名称"
                />
              </native-form-item>
            </native-form>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="remoteKeyEditDialogVisible"
      label-width="100px"
      edit-title="设置远端定制"
      edit-confirm-button-label="确认"
      :loading="remoteKeyEditDialogLoading > 0"
      :mode="remoteKeyEditDialogMode"
      :item="remoteKeyEditDialogItem"
      :close-on-click-modal="false"
      :width="480"
      @on-item-edit="handleRemoteKeyEdit"
    >
      <native-form-item label="定制方案">
        <native-select
          v-model="remoteKeyEditDialogItem.customizeKey"
          class="dialog-select"
          :disabled="remoteKeyEditDialogLoading > 0"
          :options="customizeKeySelectOptions"
          placeholder="请选择定制方案"
        />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeSelect, {
  type NativeSelectOption,
} from '@/components/comvisual/form/nativeSelect/NativeSelect.vue'
import { useEditOnlyMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import {
  notifyError,
  notifySuccess,
  notifyWarning,
} from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  type TextNodeInspectResult,
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { toSnakeCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'CustomizeSettingsRemoteSettingPanel',
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

const SETTINGREPO_CATEGORY = 'public$framework.pc.customize'
const SETTINGREPO_ARGS_LIST = 'customize_list'
const CUSTOMIZE_KEY_SETTINGREPO_ARGS_KEY = 'key'

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
 * 解析定制默认 key TextNode 的值。
 *
 * 兼容原生字符串和 JSON 字符串两种历史格式；空值或对象格式无法表示方案 key 时返回空字符串。
 *
 * @param value TextNode 中保存的值。
 * @returns 去空格后的定制方案 key。
 */
function parseCustomizeKey(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') {
    return ''
  }
  const trimmed = value.trim()
  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (typeof parsed === 'string') {
      return parsed.trim()
    }
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const customizeKey = (parsed as { customizeKey?: unknown }).customizeKey
      return typeof customizeKey === 'string' ? customizeKey.trim() : ''
    }
  } catch {
    // 原生字符串是当前约定的主要格式，按原始文本处理。
  }
  return trimmed
}

/**
 * 将定制方案 key 序列化为默认 key TextNode 的值。
 *
 * @param customizeKey 定制方案 key。
 * @returns 待保存的默认 key。
 */
function stringifyCustomizeKey(customizeKey: string): string {
  return customizeKey.trim()
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
const displayedCustomizeKey = ref('')
const detailFormStub: Record<string, unknown> = {}

/**
 * 将远端 key 映射为列表中可展示的方案名称。
 */
const displayedCustomizeLabel = computed(() => {
  const customizeKey = displayedCustomizeKey.value
  if (customizeKey === '') {
    return ''
  }
  return (
    customizeOptions.value.find((item) => item.key === customizeKey)?.label ?? '未在定制方案列表中'
  )
})

const customizeKeySelectOptions = computed<NativeSelectOption[]>(() =>
  customizeOptions.value.map((item) => ({
    label: item.label + ' (' + item.key + ')',
    value: item.key,
  })),
)

// endregion

// region 加载与刷新

/**
 * 读取远端默认定制 key，以及当前可视化器全部可选方案。
 *
 * 方案列表与 key 并行读取，避免在不影响结果一致性的情况下增加页面等待时间。
 */
async function handleRefresh(): Promise<void> {
  loading.value += 1
  try {
    const [keyResult, options] = await Promise.all([
      resolveResponse(
        operateInspect({
          category: SETTINGREPO_CATEGORY,
          args: customizeSettingrepoArgs(CUSTOMIZE_KEY_SETTINGREPO_ARGS_KEY),
        }),
      ),
      loadCustomizeSettingOptions(),
    ])
    customizeOptions.value = options
    displayedCustomizeKey.value = parseCustomizeKey(
      (keyResult as TextNodeInspectResult | null)?.value,
    )
  } catch (e: unknown) {
    customizeOptions.value = []
    displayedCustomizeKey.value = ''
    notifyError(e instanceof Error ? e.message : '远端定制设置加载失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 远端定制 key 编辑对话框

type RemoteKeyEditDialogItem = {
  customizeKey: string
}

const INITIAL_REMOTE_KEY_EDIT_ITEM: RemoteKeyEditDialogItem = {
  customizeKey: '',
}

/**
 * 将当前远端定制 key 映射为对话框数据。
 *
 * @param customizeKey 当前远端定制 key。
 * @returns 对话框使用的定制 key。
 */
function customizeKeyToRemoteKeyEditItem(customizeKey: string): RemoteKeyEditDialogItem {
  return { customizeKey }
}

const { item: remoteKeyEditDialogItem, mode: remoteKeyEditDialogMode } = useEditOnlyMaintainDialog<
  string,
  RemoteKeyEditDialogItem
>(customizeKeyToRemoteKeyEditItem, INITIAL_REMOTE_KEY_EDIT_ITEM)

const remoteKeyEditDialogLoading = ref(0)
const remoteKeyEditDialogVisible = ref(false)

watch(
  () => [remoteKeyEditDialogVisible.value, displayedCustomizeKey.value] as const,
  ([visible, customizeKey]) => {
    if (visible) {
      remoteKeyEditDialogItem.value = customizeKeyToRemoteKeyEditItem(customizeKey)
    }
  },
)

/**
 * 将远端默认 key 保存到当前 Visualizer 的独立配置节点。
 *
 * @param item 对话框提交的定制 key。
 */
async function handleRemoteKeyEdit(item: RemoteKeyEditDialogItem): Promise<void> {
  const customizeKey = item.customizeKey.trim()
  if (customizeKey === '') {
    notifyWarning('请选择定制方案')
    return
  }
  if (!customizeOptions.value.some((option) => option.key === customizeKey)) {
    notifyWarning('所选定制方案不在当前列表中')
    return
  }
  remoteKeyEditDialogLoading.value += 1
  try {
    await resolveResponse(
      operatePut({
        category: SETTINGREPO_CATEGORY,
        args: customizeSettingrepoArgs(CUSTOMIZE_KEY_SETTINGREPO_ARGS_KEY),
        value: stringifyCustomizeKey(customizeKey),
      }),
    )
    displayedCustomizeKey.value = customizeKey
    remoteKeyEditDialogVisible.value = false
    notifySuccess('远端定制保存成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '远端定制保存失败')
  } finally {
    remoteKeyEditDialogLoading.value -= 1
  }
}

function openEditDialog(): void {
  if (customizeOptions.value.length === 0) {
    notifyWarning('当前可视化器没有可用的定制方案')
    return
  }
  remoteKeyEditDialogVisible.value = true
}

// endregion

// region 生命周期

onMounted(() => {
  void handleRefresh()
})

// endregion
</script>

<style scoped>
.customize-settings-remote-panel {
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

.dialog-select {
  width: 100%;
  min-width: 0;
}
</style>
