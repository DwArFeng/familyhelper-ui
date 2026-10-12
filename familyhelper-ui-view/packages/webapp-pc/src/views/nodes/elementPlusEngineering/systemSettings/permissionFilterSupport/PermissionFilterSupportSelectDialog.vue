<template>
  <el-dialog
    class="permission-filter-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    :title="t('views.element_plus_engineering.system_settings.template_selection')"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="permissionFilterSupportTableCurrentPage"
      v-model:page-size="permissionFilterSupportTablePageSize"
      highlight-current-row
      :item-count="permissionFilterSupportTableItemCount"
      :page-sizes="[15, 20, 30, 50]"
      :items="permissionFilterSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handlePermissionFilterSupportTablePagingAttributeChanged"
      @onCurrentChanged="handlePermissionFilterSupportTableCurrentChanged"
    >
      <el-table-column
        prop="label"
        :label="t('views.element_plus_engineering.system_settings.name')"
        show-overflow-tooltip
      />
      <el-table-column prop="key.string_id" label="ID" show-overflow-tooltip />
      <el-table-column
        prop="description"
        :label="t('views.element_plus_engineering.system_settings.description')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="example_pattern"
        :label="t('views.element_plus_engineering.system_settings.example_parameters')"
        show-overflow-tooltip
      />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || permissionFilterSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          {{ t('views.element_plus_engineering.system_settings.confirm_action') }}
        </el-button>
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">
          {{ t('views.element_plus_engineering.system_settings.cancel') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import { type FilterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/filterSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/filterSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PermissionFilterSupportSelectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: FilterSupport): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 可见性处理

const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
  handlePermissionFilterSupportSearch()
})

// endregion

// region 搜索

function handlePermissionFilterSupportSearch(): void {
  handlePermissionFilterSupportAllSearch()
}

async function handlePermissionFilterSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      permissionFilterSupportTablePagingInfo.value,
    )
    updatePermissionFilterSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 权限过滤器支持表格处理

const {
  currentPage: permissionFilterSupportTableCurrentPage,
  pageSize: permissionFilterSupportTablePageSize,
  itemCount: permissionFilterSupportTableItemCount,
  items: permissionFilterSupportTableItems,
  pagingInfo: permissionFilterSupportTablePagingInfo,
  updateByLookup: updatePermissionFilterSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<FilterSupport>(15)
const permissionFilterSupportTableCurrentRow = ref<FilterSupport | null>(null)

function handlePermissionFilterSupportTablePagingAttributeChanged(): void {
  handlePermissionFilterSupportSearch()
}

function handlePermissionFilterSupportTableCurrentChanged(current: FilterSupport | null): void {
  permissionFilterSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const formatSupport: FilterSupport | null = permissionFilterSupportTableCurrentRow.value
  if (!formatSupport) {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const formatSupport: FilterSupport | null = permissionFilterSupportTableCurrentRow.value
  if (!formatSupport) {
    return
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table {
  height: 450px;
}
</style>
