<template>
  <div class="customize-list-panel-container">
    <loading-overlay :loading="loading > 0 || maintainLoading > 0" />
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="primary" @click="handleShowCreateDialog">新增定制</native-button>
          <native-button kind="success" @click="handleRefresh">刷新</native-button>
        </div>
      </template>
      <template v-slot:default>
        <draggable-table-panel
          v-model:items="allRows"
          :row-key="customizeRowKey"
          :highlight-current-row="true"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="120"
          @on-current-changed="handleCurrentChanged"
          @on-item-order-changed="handleCustomizeOrderChanged"
        >
          <draggable-table-column label="定制键" prop="key" :min-width="130" />
          <draggable-table-column label="名称" prop="label" :min-width="140" />
          <draggable-table-column label="备注" prop="remark" :min-width="160" />
          <template v-slot:operateColumn="{ row }">
            <span class="operate-actions">
              <native-link type="primary" @click="handleEdit(row as CustomizeRow)"
                >编辑</native-link
              >
              <native-link type="danger" @click="handleDelete(row as CustomizeRow)"
                >删除</native-link
              >
            </span>
          </template>
        </draggable-table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="createDialogVisible"
      create-title="新增定制"
      create-confirm-button-label="保存"
      label-width="80px"
      :loading="maintainLoading > 0"
      :mode="createDialogMode"
      :item="createDialogItem"
      :close-on-click-modal="false"
      @on-item-create="handleCreate"
    >
      <native-form-item label="定制键">
        <input v-model="createDialogItem.key" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item label="名称">
        <input v-model="createDialogItem.label" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item label="备注">
        <input v-model="createDialogItem.remark" class="dialog-input" type="text" />
      </native-form-item>
    </maintain-dialog>
    <maintain-dialog
      v-model:visible="editDialogVisible"
      edit-title="编辑定制"
      edit-confirm-button-label="保存"
      label-width="80px"
      :loading="maintainLoading > 0"
      :mode="editDialogMode"
      :item="editDialogItem"
      :close-on-click-modal="false"
      @on-item-edit="handleEditConfirm"
    >
      <native-form-item label="定制键">
        <input :value="editDialogItem.key" class="dialog-input" type="text" readonly />
      </native-form-item>
      <native-form-item label="名称">
        <input v-model="editDialogItem.label" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item label="备注">
        <input v-model="editDialogItem.remark" class="dialog-input" type="text" />
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
import {
  useCreateOnlyMaintainDialog,
  useEditOnlyMaintainDialog,
} from '@/components/comvisual/dialog/maintainDialog/composables.ts'
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
  name: 'CustomizeListPanel',
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

const SETTINGREPO_CATEGORY = 'public$framework.mobile.customize'
const SETTINGREPO_ARGS_LIST = 'customize_list'
const SETTINGREPO_ARGS_REPO = 'repo'

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

// region 配置仓库参数

/**
 * 构建当前 Visualizer 的配置仓库参数。
 *
 * 配置仓库中的 Visualizer key 使用 snake_case，实际存储格式由 Store 与列表页面共同约定。
 *
 * @param baseArg 配置节点的基础参数。
 * @returns 带 Visualizer 前缀的完整参数。
 */
function settingrepoArgs(baseArg: string): string[] {
  return [toSnakeCase(props.visualizerKey), baseArg]
}

/**
 * 构建指定定制方案的 repo KV 节点参数。
 *
 * @param customizeKey 定制方案 key。
 * @returns 完整定制仓库参数。
 */
function customizeRepoArgs(customizeKey: string): string[] {
  return [...settingrepoArgs(SETTINGREPO_ARGS_REPO), customizeKey]
}

// endregion

// region 类型与对话框

type CustomizeRow = CustomizeListSettingItem & {
  index: number
}

type CustomizeMaintainItem = {
  key: string
  label: string
  remark: string
}

const INITIAL_MAINTAIN_ITEM: CustomizeMaintainItem = {
  key: '',
  label: '',
  remark: '',
}

/**
 * 将定制列表行映射为维护对话框的数据。
 *
 * @param row 定制列表行。
 * @returns 对话框使用的定制数据。
 */
function mapCustomizeMaintainItem(row: CustomizeRow): CustomizeMaintainItem {
  return {
    key: row.key,
    label: row.label,
    remark: row.remark,
  }
}

const {
  visible: createDialogVisible,
  item: createDialogItem,
  mode: createDialogMode,
  showDialog: showCreateDialog,
} = useCreateOnlyMaintainDialog<CustomizeMaintainItem>({ ...INITIAL_MAINTAIN_ITEM })

const {
  visible: editDialogVisible,
  item: editDialogItem,
  mode: editDialogMode,
  showDialog: showEditDialog,
} = useEditOnlyMaintainDialog<CustomizeRow, CustomizeMaintainItem>(mapCustomizeMaintainItem, {
  ...INITIAL_MAINTAIN_ITEM,
})

// endregion

// region 列表状态

const loading = ref(0)
const maintainLoading = ref(0)
const allRows = ref<CustomizeRow[]>([])

// endregion

// region 数据解析与持久化

/**
 * 使用列表数据刷新表格，并重新计算拖拽表格所需的行索引。
 *
 * @param rows 最新的定制列表行。
 */
function refreshRows(rows: CustomizeRow[]): void {
  allRows.value = rows.map((row, index) => ({ ...row, index }))
}

/**
 * 将定制方案列表写回 customize_list TextNode。
 *
 * @param rows 要保存的定制列表行。
 */
async function persistCustomizeList(rows: readonly CustomizeRow[]): Promise<void> {
  await resolveResponse(
    operatePut({
      category: SETTINGREPO_CATEGORY,
      args: settingrepoArgs(SETTINGREPO_ARGS_LIST),
      value: stringifyCustomizeListSetting(rows),
    }),
  )
}

// endregion

// region 数据解析

/**
 * 判断一个值是否为有效的定制方案列表项。
 *
 * @param value 待判断的值。
 * @returns 列表项是否有效。
 */
function isCustomizeListSettingItem(value: unknown): value is CustomizeListSettingItem {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  const item = value as Record<string, unknown>
  return typeof item.key === 'string' && typeof item.label === 'string'
}

/**
 * 解析定制方案列表 TextNode。
 *
 * 无效列表项会被跳过，使单个损坏项不影响管理页面的其他功能；列表层级格式错误则直接
 * 抛出异常，以便管理员知道当前数据需要修复，而不是误以为列表为空。
 *
 * @param value TextNode 中保存的 JSON 字符串。
 * @returns 规范化后的定制方案列表。
 */
function parseCustomizeListSetting(value: string | null | undefined): CustomizeListSettingItem[] {
  if (value === null || value === undefined || value.trim() === '') {
    return []
  }
  let raw: unknown
  try {
    raw = JSON.parse(value) as unknown
  } catch {
    throw new Error('定制方案列表 JSON 格式不正确')
  }
  if (
    raw === null ||
    typeof raw !== 'object' ||
    !Array.isArray((raw as { items?: unknown }).items)
  ) {
    throw new Error('定制方案列表 JSON 缺少 items 数组')
  }

  const rows: CustomizeListSettingItem[] = []
  const seenKeys = new Set<string>()
  for (const item of (raw as { items: unknown[] }).items) {
    if (!isCustomizeListSettingItem(item)) {
      continue
    }
    const key = item.key.trim()
    const label = item.label.trim()
    if (key === '' || label === '' || seenKeys.has(key)) {
      continue
    }
    seenKeys.add(key)
    rows.push({
      key,
      label,
      remark: typeof item.remark === 'string' ? item.remark.trim() : '',
    })
  }
  return rows
}

/**
 * 将定制方案列表序列化为 TextNode 值。
 *
 * 数组顺序会原样保存，因此拖拽排序结果可通过该函数直接落库。
 *
 * @param items 定制方案列表。
 * @returns 格式化后的 JSON 字符串。
 */
function stringifyCustomizeListSetting(items: readonly CustomizeListSettingItem[]): string {
  return (
    JSON.stringify(
      {
        items: items.map(({ key, label, remark }) => ({
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

// endregion

// region 加载逻辑

async function handleRefresh(): Promise<void> {
  loading.value += 1
  try {
    const result = (await resolveResponse(
      operateInspect({
        category: SETTINGREPO_CATEGORY,
        args: settingrepoArgs(SETTINGREPO_ARGS_LIST),
      }),
    )) as { value: string } | null
    const items = parseCustomizeListSetting(result?.value)
    refreshRows(items.map((item, index) => ({ ...item, index })))
    emit('on-current-changed', null)
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制列表加载失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 定制维护

function handleShowCreateDialog(): void {
  createDialogItem.value = { ...INITIAL_MAINTAIN_ITEM }
  showCreateDialog()
}

function handleEdit(row: CustomizeRow): void {
  showEditDialog(row)
}

async function handleCreate(item: CustomizeMaintainItem): Promise<void> {
  const key = item.key.trim()
  const label = item.label.trim()
  if (key === '' || label === '') {
    notifyWarning('定制键和名称不能为空')
    return
  }
  if (allRows.value.some((row) => row.key === key)) {
    notifyWarning('定制键已经存在')
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
    await persistCustomizeList(nextRows)
    refreshRows(nextRows)
    createDialogVisible.value = false
    notifySuccess('定制 ' + key + ' 创建成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制创建失败')
  } finally {
    maintainLoading.value -= 1
  }
}

async function handleEditConfirm(item: CustomizeMaintainItem): Promise<void> {
  const label = item.label.trim()
  if (label === '') {
    notifyWarning('名称不能为空')
    return
  }
  if (!allRows.value.some((row) => row.key === item.key)) {
    notifyError('定制不存在，请刷新后重试')
    return
  }
  maintainLoading.value += 1
  try {
    const nextRows = allRows.value.map((row) =>
      row.key === item.key ? { ...row, label, remark: item.remark.trim() } : row,
    )
    await persistCustomizeList(nextRows)
    refreshRows(nextRows)
    editDialogVisible.value = false
    notifySuccess('定制 ' + item.key + ' 更新成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制更新失败')
  } finally {
    maintainLoading.value -= 1
  }
}

/**
 * 删除定制方案及其独立 repo KV 节点。
 *
 * 配置节点不存在时只更新 customize_list；存在时先清空配置并删除节点，再保存方案列表。
 * 这样可以避免列表删除后留下无法在页面中管理的孤立配置。
 *
 * @param row 要删除的定制方案列表行。
 */
async function handleDelete(row: CustomizeRow): Promise<void> {
  if (!confirmAction('是否删除定制 ' + row.key + '？该操作会同步删除定制仓库节点。')) {
    return
  }
  loading.value += 1
  try {
    const args = customizeRepoArgs(row.key)
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
    await persistCustomizeList(nextRows)
    refreshRows(nextRows)
    emit('on-current-changed', null)
    notifySuccess('定制 ' + row.key + ' 删除成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制删除失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 拖拽排序

async function handleCustomizeOrderChanged(rows: readonly CustomizeRow[]): Promise<void> {
  loading.value += 1
  try {
    await persistCustomizeList(rows)
    refreshRows([...rows])
    notifySuccess('定制顺序保存成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制顺序保存失败')
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

function customizeRowKey(row: CustomizeRow): string {
  return row.key
}

function handleCurrentChanged(current: CustomizeRow | null): void {
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
.customize-list-panel-container {
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
