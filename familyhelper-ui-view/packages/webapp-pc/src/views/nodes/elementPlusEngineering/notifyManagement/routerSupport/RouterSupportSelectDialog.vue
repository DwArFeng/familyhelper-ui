<template>
  <el-dialog
    class="router-support-select-dialog-container"
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
      v-model:current-page="routerSupportTableCurrentPage"
      v-model:page-size="routerSupportTablePageSize"
      highlight-current-row
      :item-count="routerSupportTableItemCount"
      :page-sizes="[15, 20, 30, 50]"
      :items="routerSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleRouterSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleRouterSupportTableCurrentChanged"
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
          :disabled="loading > 0 || routerSupportTableCurrentRow === null"
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

import { type RouterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'RouterSupportSelectDialog',
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
  (e: 'onConfirmed', value: RouterSupport): void
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

function handleRouterSupportSearch(): void {
  handleRouterSupportAllSearch()
}

async function handleRouterSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      routerSupportTablePagingInfo.value,
    )
    updateRouterSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 路由器支持表格处理

const {
  currentPage: routerSupportTableCurrentPage,
  pageSize: routerSupportTablePageSize,
  itemCount: routerSupportTableItemCount,
  items: routerSupportTableItems,
  pagingInfo: routerSupportTablePagingInfo,
  updateByLookup: updateRouterSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<RouterSupport>(15)
const routerSupportTableCurrentRow = ref<RouterSupport | null>(null)

function handleRouterSupportTablePagingAttributeChanged(): void {
  handleRouterSupportSearch()
}

function handleRouterSupportTableCurrentChanged(current: RouterSupport | null): void {
  routerSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const formatSupport: RouterSupport | null = routerSupportTableCurrentRow.value
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
  const formatSupport: RouterSupport | null = routerSupportTableCurrentRow.value
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
