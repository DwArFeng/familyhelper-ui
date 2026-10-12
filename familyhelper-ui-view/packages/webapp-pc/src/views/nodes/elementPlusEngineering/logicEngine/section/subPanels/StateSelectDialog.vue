<template>
  <el-dialog
    class="state-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    :title="t('views.element_plus_engineering.logic_engine.state_selection')"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="stateTableCurrentPage"
      v-model:page-size="stateTablePageSize"
      highlight-current-row
      :item-count="stateTableItemCount"
      :page-sizes="[5, 15]"
      :items="stateTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleStateTablePagingAttributeChanged"
      @onCurrentChanged="handleStateTableCurrentChanged"
    >
      <el-table-column
        prop="key.state_id"
        :label="t('views.element_plus_engineering.logic_engine.state_id')"
        min-width="100"
        show-overflow-tooltip
      />
      <el-table-column
        prop="name"
        :label="t('views.element_plus_engineering.logic_engine.name')"
        show-overflow-tooltip
      />
      <el-table-column
        :label="t('views.element_plus_engineering.logic_engine.type')"
        width="90px"
        :formatter="stateTypeFormatter"
      />
      <el-table-column
        prop="remark"
        :label="t('views.element_plus_engineering.logic_engine.remark')"
        show-overflow-tooltip
      />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || stateTableCurrentRow === null"
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
  childForSection,
  type State,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/state.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'StateSelectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  sectionId: string
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: State): void
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
      stateTableCurrentRow.value = null
      handleStateSearch()
    }
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 搜索

function handleStateSearch(): void {
  void handleStateAllSearch()
}

async function handleStateAllSearch(): Promise<void> {
  if (props.sectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForSection({ long_id: props.sectionId }, pagingInfo),
      stateTablePagingInfo.value,
    )
    updateStateTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 状态表格处理

const {
  currentPage: stateTableCurrentPage,
  pageSize: stateTablePageSize,
  itemCount: stateTableItemCount,
  items: stateTableItems,
  pagingInfo: stateTablePagingInfo,
  updateByLookup: updateStateTableByLookup,
} = useIdentityBackendPagingTablePanel<State>(5)
const stateTableCurrentRow = ref<State | null>(null)

function stateTypeFormatter(row: State): string {
  switch (row.type) {
    case 0:
      return t('views.element_plus_engineering.logic_engine.initial')
    case 1:
      return t('views.element_plus_engineering.logic_engine.normal')
    case 2:
      return t('views.element_plus_engineering.logic_engine.end')
    default:
      return t('views.element_plus_engineering.logic_engine.unknown_type', {
        type: row.type,
      })
  }
}

function handleStateTablePagingAttributeChanged(): void {
  stateTableCurrentRow.value = null
  handleStateSearch()
}

function handleStateTableCurrentChanged(current: State | null): void {
  stateTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const state: State | null = stateTableCurrentRow.value
  if (!state) {
    throw new Error(
      t('views.element_plus_engineering.logic_engine.unexpected_execution_contact_developer'),
    )
  }
  emit('onConfirmed', state)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const state: State | null = stateTableCurrentRow.value
  if (!state) {
    return
  }
  emit('onConfirmed', state)
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
