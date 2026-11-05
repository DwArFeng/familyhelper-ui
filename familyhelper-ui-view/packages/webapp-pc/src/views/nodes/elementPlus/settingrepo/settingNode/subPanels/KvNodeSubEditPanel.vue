<template>
  <div class="kv-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" :disabled="readonly" @click="showCreateDialog">新建</el-button>
          <el-button type="success" @click="handleInspect">刷新</el-button>
          <el-button type="danger" :disabled="readonly" @click="handleClear">清空</el-button>
          <el-button type="warning" :disabled="readonly" @click="handleClearCache"
            >清除缓存</el-button
          >
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="itemTableCurrentPage"
          v-model:page-size="itemTablePageSize"
          :item-count="itemTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="itemTableItems"
          :operate-column-width="80"
          @onPagingAttributeChanged="refreshItemTablePaging"
        >
          <template v-slot:default>
            <el-table-column prop="item_string_id" label="条目主键" show-overflow-tooltip />
            <el-table-column prop="value" label="值" show-overflow-tooltip />
          </template>
          <template v-slot:operateColumn="{ row }">
            <el-button-group>
              <el-button
                class="table-button"
                type="primary"
                :icon="EditIcon"
                :disabled="readonly"
                @click="showEditDialog(row as TableItem)"
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
      </template>
    </header-layout-panel>
    <maintain-dialog
      top="9vh"
      v-model:visible="dialogVisible"
      label-width="80px"
      :mode="dialogMode"
      :item="dialogItem"
      :create-rules="dialogRules"
      :edit-rules="dialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePut"
      @onItemEdit="handlePut"
    >
      <el-form-item label="条目主键" prop="item_string_id">
        <el-input v-model="dialogItem.item_string_id" :readonly="dialogMode === 'EDIT'" />
      </el-form-item>
      <el-form-item label="值" prop="value">
        <text-editor class="form-text-editor" v-model="dialogItem.value" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon, Edit as EditIcon } from '@element-plus/icons-vue'

import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/elementPlus/text/textEditor/TextEditor.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type KvNodeInspectResultItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/kvNode.ts'
import {
  operateClear,
  operateClearCache,
  operateInspect,
  operatePutItem,
  operateRemoveItem,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/kvNode.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'KvNodeSubEditPanel',
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

// region 键值对

type TableItem = KvNodeInspectResultItem
type DialogItem = {
  item_string_id: string
  value: string
}

const {
  currentPage: itemTableCurrentPage,
  pageSize: itemTablePageSize,
  items: itemTableItems,
  itemCount: itemTableItemCount,
  updateByLookup: updateItemTableByLookup,
  refreshPaging: refreshItemTablePaging,
} = useIdentityFrontendPagingTablePanel<TableItem>(15)

const {
  visible: dialogVisible,
  item: dialogItem,
  mode: dialogMode,
  showCreateDialog,
  showEditDialog,
} = useGeneralMaintainDialog<TableItem, DialogItem>(
  (row) => ({
    item_string_id: row.item_string_id,
    value: row.value ?? '',
  }),
  {
    item_string_id: '',
    value: '',
  },
)
const dialogRules = ref({
  item_string_id: [{ required: true, message: '条目主键不能为空', trigger: 'blur' }],
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

async function handleInspect(): Promise<void> {
  if (settingNodeInvalid.value || !props.category || !props.args) {
    updateItemTableByLookup([])
    return
  }
  loading.value += 1
  try {
    const inspectResult = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    updateItemTableByLookup(inspectResult?.items ?? [])
  } finally {
    loading.value -= 1
  }
}

async function handlePut(): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    await resolveResponse(
      operatePutItem({
        category: props.category,
        args: props.args,
        item_string_id: dialogItem.value.item_string_id,
        value: dialogItem.value.value,
      }),
    )
    ElMessage({
      showClose: true,
      message: '保存成功',
      type: 'success',
    })
    dialogVisible.value = false
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
    await ElMessageBox.confirm('此操作将删除该条目。<br>是否继续?', {
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
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateRemoveItem({
        category: props.category,
        args: props.args,
        item_string_id: row.item_string_id,
      }),
    )
    ElMessage({ showClose: true, message: '删除成功', type: 'success' })
    const asyncWrapper = () => {
      handleInspect()
    }
    asyncWrapper()
  } finally {
    loading.value -= 1
  }
}

async function handleClear(): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将清空全部条目。<br>是否继续?', {
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
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateClear({
        category: props.category,
        args: props.args,
      }),
    )
    ElMessage({ showClose: true, message: '清空成功', type: 'success' })
    const asyncWrapper = () => {
      handleInspect()
    }
    asyncWrapper()
  } finally {
    loading.value -= 1
  }
}

async function handleClearCache(): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将清除该节点的缓存。<br>是否继续?', {
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
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateClearCache({
        category: props.category,
        args: props.args,
      }),
    )
    ElMessage({ showClose: true, message: '缓存已清除', type: 'success' })
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
.kv-node-edit-panel-container {
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

.table {
  height: 100%;
}

.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.form-text-editor {
  height: 500px;
}
</style>
