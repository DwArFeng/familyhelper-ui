<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="模板选择"
    :close-on-click-modal="false"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="table-wrap">
      <loading-overlay :loading="loading > 0" />
      <paging-table-panel
        class="table"
        v-model:current-page="accountProtectorSupportTableCurrentPage"
        v-model:page-size="accountProtectorSupportTablePageSize"
        :item-count="accountProtectorSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="accountProtectorSupportTableItems"
        :operate-column-visible="false"
        :highlight-current-row="true"
        @on-paging-attribute-changed="handleAccountProtectorSupportTablePagingAttributeChanged"
        @on-current-changed="handleAccountProtectorSupportTableCurrentChanged"
      >
        <paging-table-column label="名称" prop="label" :min-width="120" />
        <paging-table-column label="ID" prop="key.string_id" :min-width="120" />
        <paging-table-column label="描述" prop="description" :min-width="160" />
        <paging-table-column label="参数示例" prop="example_param" :min-width="200" />
      </paging-table-panel>
    </div>
    <template v-slot:footer>
      <div class="footer-row">
        <native-button
          kind="primary"
          :disabled="loading > 0 || accountProtectorSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </native-button>
        <native-button :disabled="loading > 0" @click="handleCancelButtonClicked"
          >取消</native-button
        >
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { type ProtectorSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'AccountProtectorSupportSelectDialog',
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
  (e: 'onConfirmed', value: ProtectorSupport): void
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
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
  handleAccountProtectorSupportSearch()
})

// endregion

// region 搜索

function handleAccountProtectorSupportSearch(): void {
  handleAccountProtectorSupportAllSearch()
}

async function handleAccountProtectorSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      accountProtectorSupportTablePagingInfo.value,
    )
    updateAccountProtectorSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 账户保护器支持表格处理

const {
  currentPage: accountProtectorSupportTableCurrentPage,
  pageSize: accountProtectorSupportTablePageSize,
  itemCount: accountProtectorSupportTableItemCount,
  items: accountProtectorSupportTableItems,
  pagingInfo: accountProtectorSupportTablePagingInfo,
  updateByLookup: updateAccountProtectorSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<ProtectorSupport>(15)
const accountProtectorSupportTableCurrentRow = ref<ProtectorSupport | null>(null)

function handleAccountProtectorSupportTablePagingAttributeChanged(): void {
  handleAccountProtectorSupportSearch()
}

function handleAccountProtectorSupportTableCurrentChanged(current: ProtectorSupport | null): void {
  accountProtectorSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const formatSupport: ProtectorSupport | null = accountProtectorSupportTableCurrentRow.value
  if (!formatSupport) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const formatSupport: ProtectorSupport | null = accountProtectorSupportTableCurrentRow.value
  if (!formatSupport) {
    return
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table-wrap {
  height: 450px;
  width: 100%;
}

.table {
  height: 100%;
}

.footer-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
