<template>
  <div class="kv-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" :disabled="readonly" @click="showCreateDialog">
            {{ t('views.element_plus_engineering.settingrepo.create') }}
          </el-button>
          <el-button type="success" @click="handleInspect">
            {{ t('views.element_plus_engineering.settingrepo.refresh') }}
          </el-button>
          <el-button type="danger" :disabled="readonly" @click="handleClear">
            {{ t('views.element_plus_engineering.settingrepo.clear_all') }}
          </el-button>
          <el-button type="warning" :disabled="readonly" @click="handleClearCache">
            {{ t('views.element_plus_engineering.settingrepo.clear_cache') }}
          </el-button>
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
            <el-table-column
              prop="item_string_id"
              :label="t('views.element_plus_engineering.settingrepo.item_string_id')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="value"
              :label="t('views.element_plus_engineering.settingrepo.value')"
              show-overflow-tooltip
            />
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
      <el-form-item
        :label="t('views.element_plus_engineering.settingrepo.item_string_id')"
        prop="item_string_id"
      >
        <el-input v-model="dialogItem.item_string_id" :readonly="dialogMode === 'EDIT'" />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.value')" prop="value">
        <text-editor class="form-text-editor" v-model="dialogItem.value" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon, Edit as EditIcon } from '@element-plus/icons-vue'

import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type KvNodeInspectResultItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/kvNode.ts'
import {
  operateClear,
  operateClearCache,
  operateInspect,
  operatePutItem,
  operateRemoveItem,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/kvNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

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

// region I18n 引入

const { t } = useI18n()

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
  item_string_id: [
    {
      required: true,
      message: t('views.element_plus_engineering.settingrepo.item_string_id_required'),
      trigger: 'blur',
    },
  ],
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
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
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
      message: t('views.element_plus_engineering.settingrepo.saved_successfully'),
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
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.delete_kv_item_confirmation'),
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
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.deleted_successfully'),
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

async function handleClear(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.clear_all_items_confirmation'),
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
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.cleared_successfully'),
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

async function handleClearCache(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.clear_node_cache_confirmation'),
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
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.cache_cleared_successfully'),
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
