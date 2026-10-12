<template>
  <el-dialog
    class="dispatcher-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    :title="t('views.element_plus_engineering.notify_management.select_template')"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="dispatcherSupportTableCurrentPage"
      v-model:page-size="dispatcherSupportTablePageSize"
      highlight-current-row
      :item-count="dispatcherSupportTableItemCount"
      :page-sizes="[15, 20, 30, 50]"
      :items="dispatcherSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleDispatcherSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleDispatcherSupportTableCurrentChanged"
    >
      <el-table-column
        prop="label"
        :label="t('views.element_plus_engineering.notify_management.name')"
        show-overflow-tooltip
      />
      <el-table-column prop="key.string_id" label="ID" show-overflow-tooltip />
      <el-table-column
        prop="description"
        :label="t('views.element_plus_engineering.notify_management.description')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="example_param"
        :label="t('views.element_plus_engineering.notify_management.parameter_example')"
        show-overflow-tooltip
      />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || dispatcherSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          {{ t('views.element_plus_engineering.notify_management.confirmation') }}
        </el-button>
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">
          {{ t('views.element_plus_engineering.notify_management.cancel') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import { type DispatcherSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'DispatcherSupportSelectDialog',
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
  (e: 'onConfirmed', value: DispatcherSupport): void
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
})

// endregion

// region 搜索

function handleDispatcherSupportSearch(): void {
  handleDispatcherSupportAllSearch()
}

async function handleDispatcherSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      dispatcherSupportTablePagingInfo.value,
    )
    updateDispatcherSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 调度器支持表格处理

const {
  currentPage: dispatcherSupportTableCurrentPage,
  pageSize: dispatcherSupportTablePageSize,
  itemCount: dispatcherSupportTableItemCount,
  items: dispatcherSupportTableItems,
  pagingInfo: dispatcherSupportTablePagingInfo,
  updateByLookup: updateDispatcherSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<DispatcherSupport>(15)
const dispatcherSupportTableCurrentRow = ref<DispatcherSupport | null>(null)

function handleDispatcherSupportTablePagingAttributeChanged(): void {
  handleDispatcherSupportSearch()
}

function handleDispatcherSupportTableCurrentChanged(current: DispatcherSupport | null): void {
  dispatcherSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const formatSupport: DispatcherSupport | null = dispatcherSupportTableCurrentRow.value
  if (!formatSupport) {
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const formatSupport: DispatcherSupport | null = dispatcherSupportTableCurrentRow.value
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
