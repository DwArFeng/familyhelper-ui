<template>
  <div class="theme-list-settings-panel">
    <loading-overlay :loading="loading > 0 || maintainLoading > 0" />
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="primary" @click="handleShowCreateDialog">新增主题</native-button>
          <native-button kind="success" @click="handleRefresh">刷新</native-button>
        </div>
      </template>
      <template v-slot:default>
        <draggable-table-panel
          v-model:items="allRows"
          :row-key="themeRowKey"
          :highlight-current-row="true"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="120"
          @on-current-changed="handleCurrentChanged"
          @on-item-order-changed="handleThemeOrderChanged"
        >
          <draggable-table-column label="主题键" prop="key" :min-width="130" />
          <draggable-table-column label="名称" prop="label" :min-width="140" />
          <draggable-table-column label="备注" prop="remark" :min-width="160" />
          <template v-slot:operateColumn="{ row }">
            <span class="operate-actions">
              <native-link type="primary" @click="handleEdit(row as ThemeRow)">编辑</native-link>
              <native-link type="danger" @click="handleDelete(row as ThemeRow)">删除</native-link>
            </span>
          </template>
        </draggable-table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="maintainDialogVisible"
      create-title="新增主题"
      edit-title="编辑主题"
      create-confirm-button-label="保存"
      edit-confirm-button-label="保存"
      label-width="70px"
      :loading="maintainLoading > 0"
      :mode="maintainDialogMode"
      :item="maintainDialogItem"
      :close-on-click-modal="false"
      @on-item-create="handleCreate"
      @on-item-edit="handleEditConfirm"
    >
      <native-form-item v-if="maintainDialogMode === 'CREATE'" label="主题键">
        <input v-model="maintainDialogItem.key" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item v-if="maintainDialogMode === 'EDIT'" label="主题键">
        <input :value="maintainDialogItem.key" class="dialog-input" type="text" readonly />
      </native-form-item>
      <native-form-item label="名称">
        <input v-model="maintainDialogItem.label" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item label="备注">
        <input v-model="maintainDialogItem.remark" class="dialog-input" type="text" />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'
import DraggableTableColumn from '@/components/comvisual/table/draggableTablePanel/DraggableTableColumn.vue'
import DraggableTablePanel from '@/components/comvisual/table/draggableTablePanel/DraggableTablePanel.vue'
import { useGeneralMaintainDialog } from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import {
  confirmAction,
  notifyError,
  notifySuccess,
  notifyWarning,
} from '@/library/modules/comvisual/util/nativeUi.ts'

import { operateClear as kvNodeOperateClear } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/kvNode.ts'
import {
  operateInspect as settingNodeOperateInspect,
  operateRemove as settingNodeOperateRemove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import {
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { toSnakeCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'ThemeListSettingsPanel',
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

// region 配置仓库常量

const SETTINGREPO_CATEGORY = 'public$framework.mobile.theme'
const SETTINGREPO_ARGS_THEME_LIST: string = 'theme_list'
const SETTINGREPO_ARGS_REPO: string = 'repo'

/**
 * 构建当前 Visualizer 对应的配置仓库参数。
 *
 * 配置仓库中的 Visualizer key 使用 snake_case，因此这里不能直接使用前端的 kebab-case key。
 *
 * @param baseArg 配置节点的基础参数。
 * @returns 带 Visualizer 前缀的完整参数。
 */
function settingrepoArgs(baseArg: string): string[] {
  return [toSnakeCase(props.visualizerKey), baseArg]
}

/**
 * 构建指定主题的独立 repo KV 节点参数。
 *
 * @param themeKey 主题 key。
 * @returns 完整主题仓库参数。
 */
function themeRepoArgs(themeKey: string): string[] {
  return [...settingrepoArgs(SETTINGREPO_ARGS_REPO), themeKey]
}

// endregion

// region 类型与对话框

type ThemeRow = {
  key: string
  label: string
  remark: string
  index: number
}

type ThemeMaintainItem = {
  key: string
  label: string
  remark: string
}

const INITIAL_MAINTAIN_ITEM: ThemeMaintainItem = {
  key: '',
  label: '',
  remark: '',
}

/**
 * 将主题列表行映射为维护对话框的数据。
 *
 * @param row 主题列表行。
 * @returns 对话框使用的主题数据。
 */
function mapThemeMaintainItem(row: ThemeRow): ThemeMaintainItem {
  return {
    key: row.key,
    label: row.label,
    remark: row.remark,
  }
}

const {
  visible: maintainDialogVisible,
  item: maintainDialogItem,
  mode: maintainDialogMode,
  showCreateDialog,
  showEditDialog,
} = useGeneralMaintainDialog<ThemeRow, ThemeMaintainItem>(mapThemeMaintainItem, {
  ...INITIAL_MAINTAIN_ITEM,
})

// endregion

// region 状态

const loading = ref(0)
const maintainLoading = ref(0)
const allRows = ref<ThemeRow[]>([])

// endregion

// region 数据解析与持久化

/**
 * 解析 theme_list TextNode 中的主题列表。
 *
 * 无效条目会被跳过，避免单个损坏的主题影响整个列表。
 *
 * @param value TextNode 的原始值。
 * @returns 可展示和编辑的主题列表行。
 */
function parseThemeList(value: string | null | undefined): ThemeRow[] {
  if (!value || value.trim() === '') {
    return []
  }
  let raw: unknown
  try {
    raw = JSON.parse(value)
  } catch {
    throw new Error('主题列表 JSON 格式不正确')
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { items?: unknown }).items)) {
    throw new Error('主题列表 JSON 缺少 items 数组')
  }
  const rows: ThemeRow[] = []
  const identities = new Set<string>()
  for (const item of (raw as { items: unknown[] }).items) {
    if (!item || typeof item !== 'object') {
      continue
    }
    const valueItem = item as Partial<ThemeRow>
    if (typeof valueItem.key !== 'string' || typeof valueItem.label !== 'string') {
      continue
    }
    const key = valueItem.key.trim()
    const label = valueItem.label.trim()
    if (key === '' || label === '' || identities.has(key)) {
      continue
    }
    identities.add(key)
    rows.push({
      key,
      label,
      remark: typeof valueItem.remark === 'string' ? valueItem.remark : '',
      index: rows.length,
    })
  }
  return rows
}

/**
 * 将主题列表序列化为 theme_list TextNode 的值。
 *
 * 数组顺序即主题选择顺序，用于持久化拖拽后的排序结果。
 *
 * @param rows 主题列表行。
 * @returns JSON 字符串。
 */
function stringifyThemeList(rows: readonly ThemeRow[]): string {
  return (
    JSON.stringify(
      {
        items: rows.map(({ key, label, remark }) => ({
          key,
          label,
          remark,
        })),
      },
      null,
      2,
    ) + '\n'
  )
}

/**
 * 将主题列表写回 theme_list TextNode。
 *
 * @param rows 要保存的主题列表行。
 */
async function persistThemeList(rows: readonly ThemeRow[]): Promise<void> {
  await resolveResponse(
    operatePut({
      category: SETTINGREPO_CATEGORY,
      args: settingrepoArgs(SETTINGREPO_ARGS_THEME_LIST),
      value: stringifyThemeList(rows),
    }),
  )
}

/**
 * 使用行数据更新页面表格，同时重新计算行索引。
 *
 * @param rows 最新的主题列表行。
 */
function refreshRows(rows: ThemeRow[]): void {
  allRows.value = rows.map((row, index) => ({ ...row, index }))
}

// endregion

// region 加载逻辑

async function handleRefresh(): Promise<void> {
  loading.value += 1
  try {
    const result = (await resolveResponse(
      operateInspect({
        category: SETTINGREPO_CATEGORY,
        args: settingrepoArgs(SETTINGREPO_ARGS_THEME_LIST),
      }),
    )) as { value: string } | null
    refreshRows(parseThemeList(result?.value))
    emit('on-current-changed', null)
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '主题列表加载失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 主题维护

function handleShowCreateDialog(): void {
  maintainDialogItem.value = { ...INITIAL_MAINTAIN_ITEM }
  showCreateDialog()
}

function handleEdit(row: ThemeRow): void {
  showEditDialog(row)
}

async function handleCreate(item: ThemeMaintainItem): Promise<void> {
  const key = item.key.trim()
  const label = item.label.trim()
  if (key === '' || label === '') {
    notifyWarning('主题键和名称不能为空')
    return
  }
  if (allRows.value.some((row) => row.key === key)) {
    notifyWarning('主题键已经存在')
    return
  }
  maintainLoading.value += 1
  try {
    const nextRows = [
      ...allRows.value,
      {
        key,
        label,
        remark: item.remark.trim(),
        index: allRows.value.length,
      },
    ]
    await persistThemeList(nextRows)
    refreshRows(nextRows)
    maintainDialogVisible.value = false
    notifySuccess('主题 ' + key + ' 创建成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '主题创建失败')
  } finally {
    maintainLoading.value -= 1
  }
}

async function handleEditConfirm(item: ThemeMaintainItem): Promise<void> {
  const label = item.label.trim()
  if (label === '') {
    notifyWarning('名称不能为空')
    return
  }
  if (!allRows.value.some((row) => row.key === item.key)) {
    notifyError('主题不存在，请刷新后重试')
    return
  }
  maintainLoading.value += 1
  try {
    const nextRows = allRows.value.map((row) =>
      row.key === item.key ? { ...row, label, remark: item.remark.trim() } : row,
    )
    await persistThemeList(nextRows)
    refreshRows(nextRows)
    maintainDialogVisible.value = false
    notifySuccess('主题 ' + item.key + ' 更新成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '主题更新失败')
  } finally {
    maintainLoading.value -= 1
  }
}

/**
 * 删除主题及其独立 repo KV 节点。
 *
 * 主题节点不存在时只更新 theme_list；存在时先清空配置并删除节点，再保存主题列表。
 *
 * @param row 要删除的主题列表行。
 */
async function handleDelete(row: ThemeRow): Promise<void> {
  if (!confirmAction('是否删除主题 ' + row.key + '？该操作会同步删除主题仓库节点。')) {
    return
  }
  loading.value += 1
  try {
    const args = themeRepoArgs(row.key)
    const settingNode = await resolveResponse(
      settingNodeOperateInspect({
        category: SETTINGREPO_CATEGORY,
        args,
      }),
    )
    if (settingNode !== null) {
      await resolveResponse(
        kvNodeOperateClear({
          category: SETTINGREPO_CATEGORY,
          args,
        }),
      )
      await resolveResponse(
        settingNodeOperateRemove({
          category: SETTINGREPO_CATEGORY,
          args,
        }),
      )
    }
    const nextRows = allRows.value.filter((value) => value.key !== row.key)
    await persistThemeList(nextRows)
    refreshRows(nextRows)
    emit('on-current-changed', null)
    notifySuccess('主题 ' + row.key + ' 删除成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '主题删除失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 主题拖拽排序

async function handleThemeOrderChanged(rows: readonly ThemeRow[]): Promise<void> {
  loading.value += 1
  try {
    await persistThemeList(rows)
    refreshRows([...rows])
    notifySuccess('主题顺序保存成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '主题顺序保存失败')
    void handleRefresh()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 事件与生命周期

type Emits = {
  (e: 'on-current-changed', key: string | null): void
}

const emit = defineEmits<Emits>()

function themeRowKey(row: ThemeRow): string {
  return row.key
}

function handleCurrentChanged(current: ThemeRow | null): void {
  emit('on-current-changed', current === null ? null : current.key)
}

onMounted(() => {
  void handleRefresh()
})

watch(
  () => props.visualizerKey,
  () => {
    void handleRefresh()
  },
)

defineExpose({
  refresh: handleRefresh,
})

// endregion
</script>

<style scoped>
.theme-list-settings-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.header-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.operate-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}
</style>
