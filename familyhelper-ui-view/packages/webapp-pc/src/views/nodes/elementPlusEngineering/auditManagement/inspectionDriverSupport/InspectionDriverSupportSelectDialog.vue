<template>
  <el-dialog
    class="inspection-driver-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    :title="
      t('views.element_plus_engineering.audit_management.inspection_driver_support_selection')
    "
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="inspectionDriverSupportTableCurrentPage"
      v-model:page-size="inspectionDriverSupportTablePageSize"
      highlight-current-row
      :item-count="inspectionDriverSupportTableItemCount"
      :page-sizes="[5, 15]"
      :items="inspectionDriverSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleInspectionDriverSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleInspectionDriverSupportTableCurrentChanged"
    >
      <el-table-column
        prop="label"
        :label="t('views.element_plus_engineering.audit_management.label')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="key.string_id"
        :label="t('views.element_plus_engineering.audit_management.type')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="description"
        :label="t('views.element_plus_engineering.audit_management.description')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="example_param"
        :label="t('views.element_plus_engineering.audit_management.example_parameters')"
        show-overflow-tooltip
      />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || inspectionDriverSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          {{ t('views.element_plus_engineering.audit_management.confirm') }}
        </el-button>
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">
          {{ t('views.element_plus_engineering.audit_management.cancel') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  all,
  type InspectionDriverSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionDriverSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'InspectionDriverSupportSelectDialog',
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
  (e: 'onConfirmed', value: InspectionDriverSupport): void
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
    if (value) {
      inspectionDriverSupportTableCurrentRow.value = null
      handleInspectionDriverSupportSearch()
    }
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 搜索

function handleInspectionDriverSupportSearch(): void {
  handleInspectionDriverSupportAllSearch()
}

async function handleInspectionDriverSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      inspectionDriverSupportTablePagingInfo.value,
    )
    updateInspectionDriverSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 巡检驱动支持表格处理

const {
  currentPage: inspectionDriverSupportTableCurrentPage,
  pageSize: inspectionDriverSupportTablePageSize,
  itemCount: inspectionDriverSupportTableItemCount,
  items: inspectionDriverSupportTableItems,
  pagingInfo: inspectionDriverSupportTablePagingInfo,
  updateByLookup: updateInspectionDriverSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<InspectionDriverSupport>(5)
const inspectionDriverSupportTableCurrentRow = ref<InspectionDriverSupport | null>(null)

function handleInspectionDriverSupportTablePagingAttributeChanged(): void {
  inspectionDriverSupportTableCurrentRow.value = null
  handleInspectionDriverSupportSearch()
}

function handleInspectionDriverSupportTableCurrentChanged(
  current: InspectionDriverSupport | null,
): void {
  inspectionDriverSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const inspectionDriverSupport: InspectionDriverSupport | null =
    inspectionDriverSupportTableCurrentRow.value
  if (!inspectionDriverSupport) {
    throw new Error(
      t('views.element_plus_engineering.audit_management.unexpected_execution_contact_developer'),
    )
  }
  emit('onConfirmed', inspectionDriverSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const inspectionDriverSupport: InspectionDriverSupport | null =
    inspectionDriverSupportTableCurrentRow.value
  if (!inspectionDriverSupport) {
    return
  }
  emit('onConfirmed', inspectionDriverSupport)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table {
  height: 450px;
}
</style>
