<template>
  <div class="customize-kv-panel">
    <loading-overlay :loading="loading > 0 && !createDialogVisible && !editDialogVisible" />
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="primary" @click="handleShowCreateDialog">新增配置</native-button>
          <native-button kind="success" @click="handleRefresh">刷新</native-button>
        </div>
      </template>
      <template v-slot:default>
        <paging-table-panel
          v-model:current-page="tableCurrentPage"
          v-model:page-size="tablePageSize"
          :item-count="tableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="tableItems"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="106"
          :row-key="kvRowKey"
          @on-paging-attribute-changed="handleTablePagingAttributeChanged"
        >
          <paging-table-column label="配置键" prop="key" :min-width="180" />
          <paging-table-column label="配置值" :min-width="360">
            <template v-slot:default="{ row }">
              <span class="ellipsis">{{ row.value }}</span>
            </template>
          </paging-table-column>
          <template v-slot:operateColumn="{ row }">
            <span class="operate-actions">
              <native-link type="primary" @click="handleShowEditDialog(row as KvRow)">
                编辑
              </native-link>
              <native-link type="danger" @click="handleDelete(row as KvRow)"> 删除 </native-link>
            </span>
          </template>
        </paging-table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="createDialogVisible"
      create-title="新增定制配置"
      create-confirm-button-label="保存"
      label-width="80px"
      :loading="maintainLoading > 0"
      :mode="createDialogMode"
      :item="createDialogItem"
      :close-on-click-modal="false"
      :width="760"
      @on-item-create="handleCreate"
    >
      <native-form-item label="配置键">
        <input
          v-model="createDialogItem.key"
          class="dialog-input"
          type="text"
          placeholder="必填，唯一"
        />
      </native-form-item>
      <native-form-item label="配置值" class="text-editor-item">
        <text-editor v-model="createDialogItem.value" height="360px" />
      </native-form-item>
    </maintain-dialog>
    <maintain-dialog
      v-model:visible="editDialogVisible"
      edit-title="编辑定制配置"
      edit-confirm-button-label="保存"
      label-width="80px"
      :loading="maintainLoading > 0"
      :mode="editDialogMode"
      :item="editDialogItem"
      :close-on-click-modal="false"
      :width="760"
      @on-item-edit="handleEdit"
    >
      <native-form-item label="配置键">
        <input :value="editDialogItem.key" class="dialog-input" type="text" readonly />
      </native-form-item>
      <native-form-item label="配置值" class="text-editor-item">
        <text-editor v-model="editDialogItem.value" height="360px" />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import TextEditor from '@/components/comvisual/text/textEditor/TextEditor.vue'
import {
  useCreateOnlyMaintainDialog,
  useEditOnlyMaintainDialog,
} from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'
import {
  confirmAction,
  notifyError,
  notifySuccess,
  notifyWarning,
} from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  type KvNodeInspectResult,
  operateInspect,
  operatePutItem,
  operateRemoveItem,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/kvNode.ts'
import { toSnakeCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'CustomizeKvPanel',
})

// region Props 定义

type Props = {
  /**
   * 当前定制所属的 Visualizer key。
   */
  visualizerKey: string
  /**
   * 当前选中的定制方案 key。
   */
  customizeKey: string
}

const props = defineProps<Props>()

// endregion

// region 配置仓库常量

const SETTINGREPO_CATEGORY = 'public$framework.pc.customize'
const SETTINGREPO_ARGS_REPO = 'repo'

// endregion

// region 配置仓库参数

/**
 * 构建当前定制方案的 repo KV 节点参数。
 *
 * 使用与 Store 完全一致的参数顺序，保证管理页面写入的配置能够被运行时立即加载。
 *
 * @returns 当前定制方案的仓库参数。
 */
function customizeRepoArgs(): string[] {
  return [toSnakeCase(props.visualizerKey), SETTINGREPO_ARGS_REPO, props.customizeKey]
}

// endregion

// region 类型与对话框

/**
 * 定制仓库中的一行配置。
 *
 * value 保留 API 返回的原始字符串，不按可视化器语义解析。
 */
type KvRow = {
  key: string
  value: string
}

type KvMaintainItem = {
  key: string
  value: string
}

const INITIAL_KV_MAINTAIN_ITEM: KvMaintainItem = {
  key: '',
  value: '',
}

/**
 * 将配置行映射为编辑对话框数据。
 *
 * @param row 当前配置行。
 * @returns 对话框使用的配置数据。
 */
function kvMaintainItemMap(row: KvRow): KvMaintainItem {
  return {
    key: row.key,
    value: row.value,
  }
}

const {
  visible: createDialogVisible,
  item: createDialogItem,
  mode: createDialogMode,
  showDialog: showCreateDialog,
} = useCreateOnlyMaintainDialog<KvMaintainItem>({ ...INITIAL_KV_MAINTAIN_ITEM })

const {
  visible: editDialogVisible,
  item: editDialogItem,
  mode: editDialogMode,
  showDialog: showEditDialog,
} = useEditOnlyMaintainDialog<KvRow, KvMaintainItem>(kvMaintainItemMap, {
  ...INITIAL_KV_MAINTAIN_ITEM,
})

// endregion

// region 状态与分页

const loading = ref(0)
const maintainLoading = ref(0)
const allRows = ref<KvRow[]>([])

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  updateByLookup: updateTableByLookup,
  refreshPaging: refreshTablePaging,
} = useIdentityFrontendPagingTablePanel<KvRow>(15)

// endregion

// region 加载逻辑

/**
 * 从 repo KV 节点加载当前定制的键值对。
 *
 * repo 查询返回 null 或缺少当前定制条目时，页面显示空列表即可；
 * 左侧定制本身是否存在由 customize_list 负责维护。
 */
async function handleRefresh(): Promise<void> {
  loading.value += 1
  try {
    const result = (await resolveResponse(
      operateInspect({
        category: SETTINGREPO_CATEGORY,
        args: customizeRepoArgs(),
      }),
    )) as KvNodeInspectResult | null
    allRows.value = parseKvRows(result)
    updateTableByLookup(allRows.value)
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制配置加载失败')
  } finally {
    loading.value -= 1
  }
}

/**
 * 将 KV 查询结果规范化为可编辑表格行。
 *
 * @param result KV 节点查询结果。
 * @returns 去重后的配置行。
 */
function parseKvRows(result: KvNodeInspectResult | null): KvRow[] {
  const rows: KvRow[] = []
  const seenKeys = new Set<string>()
  for (const item of result?.items ?? []) {
    if (!item || typeof item !== 'object') {
      continue
    }
    const itemKey = typeof item.item_string_id === 'string' ? item.item_string_id.trim() : ''
    if (itemKey === '' || seenKeys.has(itemKey)) {
      continue
    }
    seenKeys.add(itemKey)
    rows.push({
      key: itemKey,
      value: typeof item.value === 'string' ? item.value : '',
    })
  }
  return rows
}

// endregion

// region KV 创建

/**
 * 打开新增配置对话框，并清空上一次创建表单。
 */
function handleShowCreateDialog(): void {
  createDialogItem.value = { ...INITIAL_KV_MAINTAIN_ITEM }
  showCreateDialog()
}

/**
 * 创建当前定制的一个 KV 配置项。
 *
 * 配置键创建后不可修改，配置值按用户输入的原始文本保存。
 *
 * @param item 对话框提交的配置数据。
 */
async function handleCreate(item: KvMaintainItem): Promise<void> {
  const key = item.key.trim()
  if (key === '') {
    notifyWarning('配置键不能为空')
    return
  }
  if (allRows.value.some((row) => row.key === key)) {
    notifyWarning('配置键 ' + key + ' 已经存在')
    return
  }
  maintainLoading.value += 1
  try {
    await resolveResponse(
      operatePutItem({
        category: SETTINGREPO_CATEGORY,
        args: customizeRepoArgs(),
        item_string_id: key,
        value: item.value,
      }),
    )
    createDialogVisible.value = false
    await handleRefresh()
    notifySuccess('定制配置 ' + key + ' 创建成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制配置创建失败')
  } finally {
    maintainLoading.value -= 1
  }
}

// endregion

// region KV 编辑

/**
 * 打开已有配置的编辑对话框。
 *
 * @param row 要编辑的配置行。
 */
function handleShowEditDialog(row: KvRow): void {
  showEditDialog(row)
}

/**
 * 更新当前定制已有配置项的值。
 *
 * 使用原配置键覆盖 KV 条目，不允许修改键。
 *
 * @param item 对话框提交的配置数据。
 */
async function handleEdit(item: KvMaintainItem): Promise<void> {
  if (!allRows.value.some((row) => row.key === item.key)) {
    notifyError('配置项不存在，请刷新后重试')
    return
  }
  maintainLoading.value += 1
  try {
    await resolveResponse(
      operatePutItem({
        category: SETTINGREPO_CATEGORY,
        args: customizeRepoArgs(),
        item_string_id: item.key,
        value: item.value,
      }),
    )
    editDialogVisible.value = false
    await handleRefresh()
    notifySuccess('定制配置 ' + item.key + ' 更新成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制配置更新失败')
  } finally {
    maintainLoading.value -= 1
  }
}

// endregion

// region KV 删除

/**
 * 删除当前定制的单个配置项。
 *
 * @param row 要删除的配置行。
 */
async function handleDelete(row: KvRow): Promise<void> {
  if (!confirmAction('是否删除定制配置 ' + row.key + '？该操作不可恢复。')) {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateRemoveItem({
        category: SETTINGREPO_CATEGORY,
        args: customizeRepoArgs(),
        item_string_id: row.key,
      }),
    )
    await handleRefresh()
    notifySuccess('定制配置 ' + row.key + ' 删除成功')
  } catch (e: unknown) {
    notifyError(e instanceof Error ? e.message : '定制配置删除失败')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 事件与生命周期

/**
 * 生成配置表格的行标识。
 *
 * @param row 定制配置行。
 * @returns 配置键。
 */
function kvRowKey(row: KvRow): string {
  return row.key
}

function handleTablePagingAttributeChanged(): void {
  refreshTablePaging()
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
.customize-kv-panel {
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

.ellipsis {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.dialog-input[readonly] {
  background: #f5f7fa;
  color: #909399;
}

/*noinspection CssUnusedSymbol*/
.text-editor-item :deep(.native-form-item__content) {
  height: 390px;
}
</style>
