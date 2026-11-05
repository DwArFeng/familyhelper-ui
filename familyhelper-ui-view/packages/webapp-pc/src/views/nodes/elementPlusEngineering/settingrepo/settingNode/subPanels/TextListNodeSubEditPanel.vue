<template>
  <div class="text-list-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" :disabled="readonly" @click="handleCreate">
            {{ t('views.element_plus_engineering.settingrepo.create') }}
          </el-button>
          <el-button type="success" @click="handleInspect">
            {{ t('views.element_plus_engineering.settingrepo.refresh') }}
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="main-container">
          <title-layout-panel
            class="item list-container"
            :title="t('views.element_plus_engineering.settingrepo.text_list')"
          >
            <table-panel
              class="table"
              v-model:current-page="itemTableCurrentPage"
              v-model:page-size="itemTablePageSize"
              pagination-adjust-strategy="FORCE_COMPACT"
              :item-count="itemTableItemCount"
              :page-sizes="[15, 20, 30, 50]"
              :items="itemTableItems"
              :operate-column-width="106"
              @onPagingAttributeChanged="handleItemTablePagingAttributeChanged"
              @onCurrentChanged="handleItemTableCurrentChanged"
            >
              <template v-slot:default>
                <el-table-column
                  prop="index"
                  :label="t('views.element_plus_engineering.settingrepo.index')"
                  width="53px"
                  align="right"
                />
                <el-table-column
                  :label="t('views.element_plus_engineering.settingrepo.state')"
                  :formatter="itemTableStateFormatter"
                />
              </template>
              <template v-slot:operateColumn="{ row }">
                <el-button-group class="operate-column">
                  <el-button
                    class="table-button"
                    type="primary"
                    :icon="SortIcon"
                    :disabled="readonly"
                    @click="handleShowChangeOrderDialog(row as TableItem)"
                  />
                  <el-button
                    class="table-button"
                    type="danger"
                    :icon="DeleteIcon"
                    :disabled="readonly"
                    @click="handleRemove(row as TableItem)"
                  />
                </el-button-group>
              </template>
            </table-panel>
          </title-layout-panel>
          <el-divider direction="vertical" />
          <title-layout-panel
            class="item expand editor-container"
            :title="t('views.element_plus_engineering.settingrepo.text_content')"
          >
            <placeholder-panel
              v-if="!itemTableCurrentRow"
              :text="t('views.element_plus_engineering.settingrepo.select_text')"
            />
            <placeholder-panel
              v-else-if="itemTableCurrentRow.null_flag"
              :text="t('views.element_plus_engineering.settingrepo.empty_text_slot')"
            />
            <div class="editor-wrapper" v-else>
              <text-editor class="text-editor" v-model="content" :readonly="readonly" />
              <el-button type="primary" :disabled="readonly" @click="handleUpdate">
                {{ t('views.element_plus_engineering.settingrepo.save') }}
              </el-button>
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="insertDialogVisible"
      label-width="55px"
      :create-title="t('views.element_plus_engineering.settingrepo.create_text')"
      :create-confirm-button-label="t('views.element_plus_engineering.settingrepo.confirm')"
      :create-cancel-button-label="t('views.element_plus_engineering.settingrepo.cancel')"
      :mode="insertDialogMode"
      :item="insertDialogItem"
      :create-rules="insertDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleInsert"
    >
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.index')" prop="index">
        <el-input-number v-model="insertDialogItem.index" :min="0" />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.content')" prop="content">
        <el-input v-model="insertDialogItem.content" type="textarea" />
      </el-form-item>
    </maintain-dialog>
    <maintain-dialog
      v-model:visible="changeOrderDialogVisible"
      label-width="55px"
      :edit-title="t('views.element_plus_engineering.settingrepo.change_order')"
      :edit-confirm-button-label="t('views.element_plus_engineering.settingrepo.confirm')"
      :edit-cancel-button-label="t('views.element_plus_engineering.settingrepo.cancel')"
      :mode="changeOrderDialogMode"
      :item="changeOrderDialogItem"
      :edit-rules="changeOrderDialogRules"
      :close-on-click-modal="false"
      @onItemEdit="handleChangeOrder"
    >
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.old_index')" prop="index">
        <el-input v-model="changeOrderDialogItem.index" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.settingrepo.new_index')"
        prop="neo_index"
      >
        <el-input-number v-model="changeOrderDialogItem.neo_index" :min="0" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon, Sort as SortIcon } from '@element-plus/icons-vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import {
  useCreateOnlyMaintainDialog,
  useEditOnlyMaintainDialog,
} from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type TextListNodeInspectResultItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textListNode.ts'
import {
  operateChangeOrder,
  operateFetchText,
  operateInsertText,
  operateInspect,
  operateRemove,
  operateSize,
  operateUpdateText,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textListNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'TextListNodeSubEditPanel',
})

// region Props 定义

type Props = {
  category: string | null
  args: string[] | null
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

const settingNodeInvalid = computed(() => props.category === null || props.args === null)

// endregion

// region 文本列表

type TableItem = TextListNodeInspectResultItem
type InsertDialogItem = {
  index: number
  content: string
}
type ChangeOrderDialogItem = {
  index: number
  neo_index: number
}

const {
  currentPage: itemTableCurrentPage,
  pageSize: itemTablePageSize,
  items: itemTableItems,
  itemCount: itemTableItemCount,
  updateByLookup: updateItemTableByLookup,
  refreshPaging: refreshItemTablePaging,
} = useIdentityFrontendPagingTablePanel<TableItem>(15)
const itemTableCurrentRow = ref<TableItem | null>(null)
const content = ref<string>('')

const {
  visible: insertDialogVisible,
  item: insertDialogItem,
  mode: insertDialogMode,
  showDialog: showInsertDialog,
} = useCreateOnlyMaintainDialog<InsertDialogItem>({
  index: 0,
  content: '',
})
const insertDialogRules = ref({
  content: [
    {
      required: true,
      message: t('views.element_plus_engineering.settingrepo.content_required'),
      trigger: 'blur',
    },
  ],
})

const {
  visible: changeOrderDialogVisible,
  item: changeOrderDialogItem,
  mode: changeOrderDialogMode,
  showDialog: showChangeOrderDialog,
} = useEditOnlyMaintainDialog<TableItem, ChangeOrderDialogItem>(
  (row) => ({
    index: row.index,
    neo_index: row.index,
  }),
  {
    index: 0,
    neo_index: 0,
  },
)
const changeOrderDialogNeoIndexValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res < 0) {
        callback(new Error(t('views.element_plus_engineering.settingrepo.neo_index_negative')))
        return Promise.reject()
      }
      if (!props.category || !props.args) {
        throw new Error(
          t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
        )
      }
      return resolveResponse(
        operateSize({
          category: props.category,
          args: props.args,
        }),
      )
    })
    .then((res) => {
      if (!res) {
        throw new Error(
          t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
        )
      }
      if (res.size <= 0) {
        callback(new Error(t('views.element_plus_engineering.settingrepo.no_index_to_change')))
        return Promise.reject()
      }
      if (value > res.size - 1) {
        callback(new Error(t('views.element_plus_engineering.settingrepo.neo_index_out_of_range')))
        return Promise.reject()
      }
      callback()
      return Promise.resolve()
    })
    .catch(() => {})
}
const changeOrderDialogRules = ref({
  neo_index: [{ validator: changeOrderDialogNeoIndexValidator, trigger: 'blur' }],
})

watch(
  () => props.category,
  () => {
    handleInspect()
  },
)

watch(
  () => props.args,
  () => {
    handleInspect()
  },
)

onMounted(() => {
  handleInspect()
})

function itemTableStateFormatter(row: TableItem): string {
  return row.null_flag
    ? t('views.element_plus_engineering.settingrepo.vacant')
    : t('views.element_plus_engineering.settingrepo.text_present')
}

function handleItemTablePagingAttributeChanged(): void {
  refreshItemTablePaging()
}

function handleItemTableCurrentChanged(current: TableItem | null): void {
  itemTableCurrentRow.value = current
  const asyncWrapper = () => {
    handleFetchCurrent()
  }
  asyncWrapper()
}

function handleCreate(): void {
  showInsertDialog()
}

function handleShowChangeOrderDialog(row: TableItem): void {
  showChangeOrderDialog(row)
}

async function handleInspect(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    const res = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    if (!res) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    updateItemTableByLookup(res.items)
  } finally {
    loading.value -= 1
  }
}

async function handleFetchCurrent(): Promise<void> {
  const row = itemTableCurrentRow.value
  if (!row || row.null_flag || !props.category || !props.args) {
    content.value = ''
    return
  }
  loading.value += 1
  try {
    const result = await resolveResponse(
      operateFetchText({
        category: props.category,
        args: props.args,
        index: row.index,
      }),
    )
    content.value = result?.content ?? ''
  } finally {
    loading.value -= 1
  }
}

async function handleInsert(): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateInsertText({
        category: props.category,
        args: props.args,
        index: insertDialogItem.value.index,
        content: insertDialogItem.value.content,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.created_successfully'),
      type: 'success',
    })
    insertDialogVisible.value = false
    const asyncWrapper = () => {
      handleInspect()
    }
    asyncWrapper()
  } finally {
    loading.value -= 1
  }
}

async function handleUpdate(): Promise<void> {
  const row = itemTableCurrentRow.value
  if (!row || row.null_flag || !props.category || !props.args) {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateUpdateText({
        category: props.category,
        args: props.args,
        index: row.index,
        content: content.value,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.saved_successfully'),
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

async function handleChangeOrder(): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateChangeOrder({
        category: props.category,
        args: props.args,
        old_index: changeOrderDialogItem.value.index,
        neo_index: changeOrderDialogItem.value.neo_index,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.order_changed_successfully'),
      type: 'success',
    })
    changeOrderDialogVisible.value = false
    const asyncWrapper = () => {
      handleInspect()
    }
    asyncWrapper()
  } finally {
    loading.value -= 1
  }
}

async function handleRemove(row: TableItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.delete_text_item_confirmation'),
      {
        confirmButtonText: t('views.element_plus_engineering.settingrepo.confirm'),
        cancelButtonText: t('views.element_plus_engineering.settingrepo.cancel'),
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  if (!props.category || !props.args) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateRemove({
        category: props.category,
        args: props.args,
        index: row.index,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.text_item_deleted_successfully'),
      type: 'success',
    })
    const asyncWrapper = () => {
      handleInspect()
    }
    asyncWrapper()
  } finally {
    loading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.text-list-node-edit-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.main-container .el-divider--vertical {
  height: 100%;
  margin: 0 5px;
}

.main-container .item {
  height: 100%;
}

.main-container .expand {
  width: 0;
  flex-grow: 1;
}

.list-container {
  width: 420px;
}

.main-container .table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.editor-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-wrapper .text-editor {
  height: 0;
  flex-grow: 1;
}
</style>
