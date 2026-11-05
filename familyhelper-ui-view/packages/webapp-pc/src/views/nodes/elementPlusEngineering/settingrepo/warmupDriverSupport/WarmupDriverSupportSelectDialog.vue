<template>
  <el-dialog
    class="warmup-driver-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    :title="t('views.element_plus_engineering.settingrepo.select_driver_type')"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="warmupDriverSupportTableCurrentPage"
      v-model:page-size="warmupDriverSupportTablePageSize"
      highlight-current-row
      :item-count="warmupDriverSupportTableItemCount"
      :page-sizes="[15, 20, 30, 50]"
      :items="warmupDriverSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleWarmupDriverSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleWarmupDriverSupportTableCurrentChanged"
    >
      <el-table-column
        prop="key.string_id"
        :label="t('views.element_plus_engineering.settingrepo.type')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="label"
        :label="t('views.element_plus_engineering.settingrepo.label')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="description"
        :label="t('views.element_plus_engineering.settingrepo.description')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="example_param"
        :label="t('views.element_plus_engineering.settingrepo.example_parameters')"
        show-overflow-tooltip
      />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || warmupDriverSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
          >{{ t('views.element_plus_engineering.settingrepo.confirm') }}</el-button
        >
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">
          {{ t('views.element_plus_engineering.settingrepo.cancel') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import { type WarmupDriverSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupDriverSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupDriverSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'WarmupDriverSupportSelectDialog',
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
  (e: 'onConfirmed', value: WarmupDriverSupport): void
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

function handleWarmupDriverSupportSearch(): void {
  handleWarmupDriverSupportAllSearch()
}

async function handleWarmupDriverSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      warmupDriverSupportTablePagingInfo.value,
    )
    updateWarmupDriverSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 预热驱动器支持表格处理

const {
  currentPage: warmupDriverSupportTableCurrentPage,
  pageSize: warmupDriverSupportTablePageSize,
  itemCount: warmupDriverSupportTableItemCount,
  items: warmupDriverSupportTableItems,
  pagingInfo: warmupDriverSupportTablePagingInfo,
  updateByLookup: updateWarmupDriverSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<WarmupDriverSupport>(15)
const warmupDriverSupportTableCurrentRow = ref<WarmupDriverSupport | null>(null)

function handleWarmupDriverSupportTablePagingAttributeChanged(): void {
  handleWarmupDriverSupportSearch()
}

function handleWarmupDriverSupportTableCurrentChanged(current: WarmupDriverSupport | null): void {
  warmupDriverSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const formatSupport: WarmupDriverSupport | null = warmupDriverSupportTableCurrentRow.value
  if (!formatSupport) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const formatSupport: WarmupDriverSupport | null = warmupDriverSupportTableCurrentRow.value
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
