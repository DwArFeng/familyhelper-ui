<template>
  <div class="text-list-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" :disabled="readonly" @click="handleCreate">新建</el-button>
          <el-button type="success" @click="handleInspect">刷新</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="main-container">
          <title-layout-panel class="item list-container" title="文本列表">
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
                <el-table-column prop="index" label="索引" width="53px" align="right" />
                <el-table-column label="状态" :formatter="itemTableStateFormatter" />
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
          <title-layout-panel class="item expand editor-container" title="文本内容">
            <placeholder-panel v-if="!itemTableCurrentRow" text="请选择文本" />
            <placeholder-panel v-else-if="itemTableCurrentRow.null_flag" text="该位置没有文本" />
            <div class="editor-wrapper" v-else>
              <text-editor class="text-editor" v-model="content" :readonly="readonly" />
              <el-button type="primary" :disabled="readonly" @click="handleUpdate">保存</el-button>
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="insertDialogVisible"
      label-width="55px"
      create-title="新建文本"
      create-confirm-button-label="确认"
      create-cancel-button-label="取消"
      :mode="insertDialogMode"
      :item="insertDialogItem"
      :create-rules="insertDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleInsert"
    >
      <el-form-item label="索引" prop="index">
        <el-input-number v-model="insertDialogItem.index" :min="0" />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input v-model="insertDialogItem.content" type="textarea" />
      </el-form-item>
    </maintain-dialog>
    <maintain-dialog
      v-model:visible="changeOrderDialogVisible"
      label-width="55px"
      edit-title="变更顺序"
      edit-confirm-button-label="确认"
      edit-cancel-button-label="取消"
      :mode="changeOrderDialogMode"
      :item="changeOrderDialogItem"
      :edit-rules="changeOrderDialogRules"
      :close-on-click-modal="false"
      @onItemEdit="handleChangeOrder"
    >
      <el-form-item label="旧索引" prop="index">
        <el-input v-model="changeOrderDialogItem.index" readonly />
      </el-form-item>
      <el-form-item label="新索引" prop="neo_index">
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
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import TextEditor from '@/components/elementPlus/text/textEditor/TextEditor.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import {
  useCreateOnlyMaintainDialog,
  useEditOnlyMaintainDialog,
} from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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
  content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
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
        callback(new Error('新索引不能小于 0'))
        return Promise.reject()
      }
      if (!props.category || !props.args) {
        throw new Error('不应该执行到此处，请联系开发人员')
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
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      if (res.size <= 0) {
        callback(new Error('没有可变更的索引'))
        return Promise.reject()
      }
      if (value > res.size - 1) {
        callback(new Error('新索引不能大于等于当前索引总数'))
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
  return row.null_flag ? '空缺' : '已有文本'
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
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const res = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    if (!res) {
      throw new Error('不应该执行到此处，请联系开发人员')
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
    throw new Error('不应该执行到此处，请联系开发人员')
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
      message: '新建成功',
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
      message: '保存成功',
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

async function handleChangeOrder(): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
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
      message: '变更顺序成功',
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
    await ElMessageBox.confirm('此操作将永久删除此文本项。<br>是否继续?', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
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
      message: '文本项删除成功',
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
