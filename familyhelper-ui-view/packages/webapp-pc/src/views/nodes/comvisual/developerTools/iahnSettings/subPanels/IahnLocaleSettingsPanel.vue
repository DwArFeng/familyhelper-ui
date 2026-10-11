<template>
  <div class="iahn-locale-settings-panel">
    <loading-overlay :loading="loading > 0" />
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="primary" @click="handleShowCreateDialog">新增地区</native-button>
          <native-button kind="success" @click="handleRefresh">刷新</native-button>
          <span v-if="repositoryMismatchCount > 0" class="mismatch-hint">
            检测到 {{ repositoryMismatchCount }} 个地区配置不一致，请检查消息仓库
          </span>
        </div>
      </template>
      <template v-slot:default>
        <draggable-table-panel
          v-model:items="allRows"
          :row-key="localeRowKey"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="120"
          @on-item-order-changed="handleLocaleOrderChanged"
        >
          <draggable-table-column label="地区" prop="locale" :min-width="130" />
          <draggable-table-column label="标签" prop="label" :min-width="140" />
          <draggable-table-column label="语言" prop="language" :min-width="90" />
          <draggable-table-column label="国家" prop="country" :min-width="90" />
          <draggable-table-column label="变体" prop="variant" :min-width="100" />
          <draggable-table-column label="备注" prop="remark" :min-width="160" />
          <template v-slot:operateColumn="{ row }">
            <span class="operate-actions">
              <native-link type="primary" @click="handleEdit(row as LocaleRow)">编辑</native-link>
              <native-link type="danger" @click="handleDelete(row as LocaleRow)">删除</native-link>
            </span>
          </template>
        </draggable-table-panel>
      </template>
    </header-layout-panel>

    <maintain-dialog
      v-model:visible="maintainDialogVisible"
      create-title="新增地区"
      edit-title="编辑地区"
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
      <native-form-item v-if="maintainDialogMode === 'EDIT'" label="地区">
        <input :value="maintainDialogLocale" class="dialog-input" type="text" readonly />
      </native-form-item>
      <native-form-item label="标签">
        <input v-model="maintainDialogItem.label" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item v-if="maintainDialogMode === 'CREATE'" label="语言">
        <input v-model="maintainDialogItem.language" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item v-if="maintainDialogMode === 'CREATE'" label="国家">
        <input v-model="maintainDialogItem.country" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item v-if="maintainDialogMode === 'CREATE'" label="变体">
        <input v-model="maintainDialogItem.variant" class="dialog-input" type="text" />
      </native-form-item>
      <native-form-item label="备注">
        <input v-model="maintainDialogItem.remark" class="dialog-input" type="text" />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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

import {
  type IahnNodeLocaleListInspectResultItem,
  inspectLocaleList,
  putLocale,
  removeLocale,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/iahnNode.ts'
import {
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { formatLocale } from '@dwarfeng/familyhelper-ui-component-util/src/util/i18n.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'IahnLocaleSettingsPanel',
})

// region 配置仓库常量

const SETTINGREPO_CATEGORY = 'public$framework.pc.iahn'
const SETTINGREPO_ARGS_LOCALE_LIST: string[] = ['locale_list']
const SETTINGREPO_ARGS_REPO: string[] = ['repo']

// endregion

// region 类型与对话框

type LocaleRow = IahnNodeLocaleListInspectResultItem & {
  locale: string
  index: number
}

type LocaleMaintainItem = {
  language: string
  country: string
  variant: string
  label: string
  remark: string
  originalLocale: string
}

const INITIAL_MAINTAIN_ITEM: LocaleMaintainItem = {
  language: '',
  country: '',
  variant: '',
  label: '',
  remark: '',
  originalLocale: '',
}

function mapLocaleMaintainItem(row: LocaleRow): LocaleMaintainItem {
  return {
    language: row.language,
    country: row.country,
    variant: row.variant,
    label: row.label,
    remark: row.remark,
    originalLocale: row.locale,
  }
}

const {
  visible: maintainDialogVisible,
  item: maintainDialogItem,
  mode: maintainDialogMode,
  showCreateDialog,
  showEditDialog,
} = useGeneralMaintainDialog<LocaleRow, LocaleMaintainItem>(mapLocaleMaintainItem, {
  ...INITIAL_MAINTAIN_ITEM,
})

const maintainDialogLocale = computed(() => {
  const item = maintainDialogItem.value
  return formatLocale(item.language, item.country, item.variant)
})

// endregion

// region 状态与分页

const loading = ref(0)
const maintainLoading = ref(0)
const allRows = ref<LocaleRow[]>([])
const repositoryLocales = ref<IahnNodeLocaleListInspectResultItem[]>([])

const repositoryMismatchCount = computed(() => {
  const localKeys = new Set(allRows.value.map((row) => row.locale))
  const repositoryKeys = new Set(
    repositoryLocales.value.map((item) => formatLocale(item.language, item.country, item.variant)),
  )
  let count = 0
  for (const key of localKeys) {
    if (!repositoryKeys.has(key)) {
      count += 1
    }
  }
  for (const key of repositoryKeys) {
    if (!localKeys.has(key)) {
      count += 1
    }
  }
  return count
})

// endregion

// region 数据解析与持久化

function parseLocaleList(value: string | null | undefined): LocaleRow[] {
  if (!value || value.trim() === '') {
    return []
  }
  let raw: unknown
  try {
    raw = JSON.parse(value)
  } catch {
    throw new Error('地区列表 JSON 格式不正确')
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { items?: unknown }).items)) {
    throw new Error('地区列表 JSON 缺少 items 数组')
  }
  const rows: LocaleRow[] = []
  const identities = new Set<string>()
  for (const item of (raw as { items: unknown[] }).items) {
    if (!item || typeof item !== 'object') {
      continue
    }
    const valueItem = item as Partial<IahnNodeLocaleListInspectResultItem>
    if (typeof valueItem.language !== 'string' || typeof valueItem.label !== 'string') {
      continue
    }
    const row = {
      language: valueItem.language,
      country: typeof valueItem.country === 'string' ? valueItem.country : '',
      variant: typeof valueItem.variant === 'string' ? valueItem.variant : '',
      label: valueItem.label,
      remark: typeof valueItem.remark === 'string' ? valueItem.remark : '',
      locale: formatLocale(valueItem.language, valueItem.country, valueItem.variant),
      index: rows.length,
    }
    if (row.locale === '#default' || identities.has(row.locale)) {
      continue
    }
    identities.add(row.locale)
    rows.push(row)
  }
  return rows
}

function stringifyLocaleList(rows: readonly LocaleRow[]): string {
  return (
    JSON.stringify(
      {
        items: rows.map(({ language, country, variant, label, remark }) => ({
          language,
          country,
          variant,
          label,
          remark,
        })),
      },
      null,
      2,
    ) + '\n'
  )
}

async function inspectRepositoryLocaleList(): Promise<IahnNodeLocaleListInspectResultItem[]> {
  const result = await resolveResponse(
    inspectLocaleList({
      category: SETTINGREPO_CATEGORY,
      args: [...SETTINGREPO_ARGS_REPO],
    }),
  )
  return result?.items ?? []
}

async function persistLocaleList(rows: readonly LocaleRow[]): Promise<void> {
  await resolveResponse(
    operatePut({
      category: SETTINGREPO_CATEGORY,
      args: [...SETTINGREPO_ARGS_LOCALE_LIST],
      value: stringifyLocaleList(rows),
    }),
  )
}

function refreshRows(rows: LocaleRow[]): void {
  allRows.value = rows.map((row, index) => ({ ...row, index }))
}

// endregion

// region 加载逻辑

async function handleRefresh(): Promise<void> {
  loading.value += 1
  try {
    const [localeListResult, repositoryResult] = await Promise.all([
      resolveResponse(
        operateInspect({
          category: SETTINGREPO_CATEGORY,
          args: [...SETTINGREPO_ARGS_LOCALE_LIST],
        }),
      ),
      inspectRepositoryLocaleList(),
    ])
    refreshRows(parseLocaleList(localeListResult?.value))
    repositoryLocales.value = repositoryResult
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '地区列表加载失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 地区维护

function validateLocaleItem(item: LocaleMaintainItem, allowIdentity: boolean): string | null {
  const label = item.label.trim()
  const language = item.language.trim()
  const country = item.country.trim()
  const variant = item.variant.trim()
  if (label === '') {
    return '标签不能为空'
  }
  if (allowIdentity && !/^[a-zA-Z]{2,3}$/.test(language)) {
    return '语言格式不正确，必须是 2 到 3 个字母'
  }
  if (allowIdentity && country !== '' && !/^(?:[a-zA-Z]{2}|[0-9]{3})$/.test(country)) {
    return '国家格式不正确，必须是 2 位字母或 3 位数字'
  }
  if (allowIdentity && variant !== '' && !/^[a-zA-Z0-9]{2,8}$/.test(variant)) {
    return '变体格式不正确，必须是 2 到 8 个字母或数字'
  }
  if (allowIdentity && formatLocale(language, country, variant) === '#default') {
    return '不能维护默认地区'
  }
  return null
}

function handleShowCreateDialog(): void {
  showCreateDialog()
}

function handleEdit(row: LocaleRow): void {
  showEditDialog(row)
}

async function handleCreate(item: LocaleMaintainItem): Promise<void> {
  const error = validateLocaleItem(item, true)
  if (error) {
    notifyWarning(error)
    return
  }
  const language = item.language.trim()
  const country = item.country.trim()
  const variant = item.variant.trim()
  const locale = formatLocale(language, country, variant)
  if (allRows.value.some((row) => row.locale === locale)) {
    notifyWarning('地区已经存在')
    return
  }

  maintainLoading.value += 1
  let repositoryCreated = false
  try {
    const repositoryItems = await inspectRepositoryLocaleList()
    const repositoryItem = repositoryItems.find(
      (row) => formatLocale(row.language, row.country, row.variant) === locale,
    )
    let nextItem: LocaleRow
    if (repositoryItem) {
      nextItem = {
        ...repositoryItem,
        locale,
        index: allRows.value.length,
      }
      notifyWarning('消息仓库已经存在 ' + locale + '，已沿用消息仓库中的标签和备注')
    } else {
      const payload = {
        category: SETTINGREPO_CATEGORY,
        args: [...SETTINGREPO_ARGS_REPO],
        language,
        country,
        variant,
        label: item.label.trim(),
        remark: item.remark.trim(),
      }
      await resolveResponse(putLocale(payload))
      repositoryCreated = true
      nextItem = {
        ...payload,
        locale,
        index: allRows.value.length,
      }
    }
    const nextRows = [...allRows.value, nextItem]
    try {
      await persistLocaleList(nextRows)
    } catch (e: unknown) {
      if (repositoryCreated) {
        await resolveResponse(
          removeLocale({
            category: SETTINGREPO_CATEGORY,
            args: [...SETTINGREPO_ARGS_REPO],
            language,
            country,
            variant,
          }),
        )
      }
      throw e
    }
    refreshRows(nextRows)
    repositoryLocales.value = await inspectRepositoryLocaleList()
    maintainDialogVisible.value = false
    notifySuccess('地区 ' + locale + ' 保存成功')
    emit('on-data-changed')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '地区保存失败')
  } finally {
    maintainLoading.value -= 1
  }
}

async function handleEditConfirm(item: LocaleMaintainItem): Promise<void> {
  const error = validateLocaleItem(item, false)
  if (error) {
    notifyWarning(error)
    return
  }
  const row = allRows.value.find((value) => value.locale === item.originalLocale)
  if (!row) {
    notifyError('地区不存在，请刷新后重试')
    return
  }

  maintainLoading.value += 1
  try {
    const repositoryItems = await inspectRepositoryLocaleList()
    const repositoryItem = repositoryItems.find(
      (value) => formatLocale(value.language, value.country, value.variant) === row.locale,
    )
    const nextRepositoryItem = {
      category: SETTINGREPO_CATEGORY,
      args: [...SETTINGREPO_ARGS_REPO],
      language: row.language,
      country: row.country,
      variant: row.variant,
      label: item.label.trim(),
      remark: item.remark.trim(),
    }
    await resolveResponse(putLocale(nextRepositoryItem))
    const nextRows = allRows.value.map((value) =>
      value.locale === row.locale
        ? { ...value, label: nextRepositoryItem.label, remark: nextRepositoryItem.remark }
        : value,
    )
    try {
      await persistLocaleList(nextRows)
    } catch (e: unknown) {
      if (repositoryItem) {
        await resolveResponse(
          putLocale({
            category: SETTINGREPO_CATEGORY,
            args: [...SETTINGREPO_ARGS_REPO],
            ...repositoryItem,
          }),
        )
      } else {
        await resolveResponse(
          removeLocale({
            category: SETTINGREPO_CATEGORY,
            args: [...SETTINGREPO_ARGS_REPO],
            language: row.language,
            country: row.country,
            variant: row.variant,
          }),
        )
      }
      throw e
    }
    refreshRows(nextRows)
    repositoryLocales.value = await inspectRepositoryLocaleList()
    maintainDialogVisible.value = false
    notifySuccess('地区 ' + row.locale + ' 更新成功')
    emit('on-data-changed')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '地区更新失败')
  } finally {
    maintainLoading.value -= 1
  }
}

async function handleDelete(row: LocaleRow): Promise<void> {
  if (!confirmAction('是否删除地区 ' + row.locale + '？该操作会同步处理消息仓库地区列。')) {
    return
  }
  loading.value += 1
  let repositoryRemoved = false
  let repositoryItem: IahnNodeLocaleListInspectResultItem | undefined
  try {
    const repositoryItems = await inspectRepositoryLocaleList()
    repositoryItem = repositoryItems.find(
      (value) => formatLocale(value.language, value.country, value.variant) === row.locale,
    )
    if (repositoryItem) {
      await resolveResponse(
        removeLocale({
          category: SETTINGREPO_CATEGORY,
          args: [...SETTINGREPO_ARGS_REPO],
          language: repositoryItem.language,
          country: repositoryItem.country,
          variant: repositoryItem.variant,
        }),
      )
      repositoryRemoved = true
    }
    const nextRows = allRows.value.filter((value) => value.locale !== row.locale)
    try {
      await persistLocaleList(nextRows)
    } catch (e: unknown) {
      if (repositoryRemoved && repositoryItem) {
        await resolveResponse(
          putLocale({
            category: SETTINGREPO_CATEGORY,
            args: [...SETTINGREPO_ARGS_REPO],
            ...repositoryItem,
          }),
        )
      }
      throw e
    }
    refreshRows(nextRows)
    repositoryLocales.value = await inspectRepositoryLocaleList()
    notifySuccess('地区 ' + row.locale + ' 删除成功')
    emit('on-data-changed')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '地区删除失败')
  } finally {
    loading.value -= 1
  }
}

async function handleLocaleOrderChanged(items: readonly LocaleRow[]): Promise<void> {
  loading.value += 1
  try {
    await persistLocaleList(items)
    refreshRows([...items])
    notifySuccess('地区顺序保存成功')
    emit('on-data-changed')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '地区顺序保存失败')
    void handleRefresh()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 事件与生命周期

type Emits = {
  (e: 'on-data-changed'): void
}

const emit = defineEmits<Emits>()

function localeRowKey(row: LocaleRow): string {
  return row.locale
}

onMounted(() => {
  void handleRefresh()
})

defineExpose({
  refresh: handleRefresh,
})

// endregion
</script>

<style scoped>
.iahn-locale-settings-panel {
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

.mismatch-hint {
  color: #e6a23c;
  font-size: 13px;
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
