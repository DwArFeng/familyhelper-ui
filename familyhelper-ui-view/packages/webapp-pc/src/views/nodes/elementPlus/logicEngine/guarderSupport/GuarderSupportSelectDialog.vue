<template>
  <el-dialog
    class="guarder-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    title="守卫器支持选择"
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
      <el-table-column prop="label" label="标签" show-overflow-tooltip />
      <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column
        prop="example_param"
        label="示例参数"
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
          确认
        </el-button>
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import {
  all,
  type GuarderSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/guarderSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

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
    throw new Error('不应该执行到此处，请联系开发人员')
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
