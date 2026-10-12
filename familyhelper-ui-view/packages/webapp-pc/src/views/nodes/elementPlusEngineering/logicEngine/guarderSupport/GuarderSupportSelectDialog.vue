<template>
  <el-dialog
    class="guarder-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    :title="t('views.element_plus_engineering.logic_engine.guarder_support_selection')"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="guarderSupportTableCurrentPage"
      v-model:page-size="guarderSupportTablePageSize"
      highlight-current-row
      :item-count="guarderSupportTableItemCount"
      :page-sizes="[5, 15]"
      :items="guarderSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleGuarderSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleGuarderSupportTableCurrentChanged"
    >
      <el-table-column
        prop="label"
        :label="t('views.element_plus_engineering.logic_engine.label')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="key.string_id"
        :label="t('views.element_plus_engineering.logic_engine.type')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="description"
        :label="t('views.element_plus_engineering.logic_engine.description')"
        show-overflow-tooltip
      />
      <el-table-column
        prop="example_param"
        :label="t('views.element_plus_engineering.logic_engine.example_parameters')"
        min-width="110"
        show-overflow-tooltip
      />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || guarderSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          {{ t('views.element_plus_engineering.logic_engine.confirm') }}
        </el-button>
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">{{
          t('views.element_plus_engineering.logic_engine.cancel')
        }}</el-button>
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
  type GuarderSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/guarderSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'GuarderSupportSelectDialog',
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
  (e: 'onConfirmed', value: GuarderSupport): void
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
      guarderSupportTableCurrentRow.value = null
      handleGuarderSupportSearch()
    }
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 搜索

function handleGuarderSupportSearch(): void {
  handleGuarderSupportAllSearch()
}

async function handleGuarderSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      guarderSupportTablePagingInfo.value,
    )
    updateGuarderSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 守卫器支持表格处理

const {
  currentPage: guarderSupportTableCurrentPage,
  pageSize: guarderSupportTablePageSize,
  itemCount: guarderSupportTableItemCount,
  items: guarderSupportTableItems,
  pagingInfo: guarderSupportTablePagingInfo,
  updateByLookup: updateGuarderSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<GuarderSupport>(5)
const guarderSupportTableCurrentRow = ref<GuarderSupport | null>(null)

function handleGuarderSupportTablePagingAttributeChanged(): void {
  guarderSupportTableCurrentRow.value = null
  handleGuarderSupportSearch()
}

function handleGuarderSupportTableCurrentChanged(current: GuarderSupport | null): void {
  guarderSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const guarderSupport: GuarderSupport | null = guarderSupportTableCurrentRow.value
  if (!guarderSupport) {
    throw new Error(
      t('views.element_plus_engineering.logic_engine.unexpected_execution_contact_developer'),
    )
  }
  emit('onConfirmed', guarderSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const guarderSupport: GuarderSupport | null = guarderSupportTableCurrentRow.value
  if (!guarderSupport) {
    return
  }
  emit('onConfirmed', guarderSupport)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table {
  height: 450px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
}
</style>
