<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="模板选择"
    :close-on-click-modal="false"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="dialog-table-wrap">
      <loading-overlay :loading="loading > 0" />
      <paging-table-panel
        class="table"
        v-model:current-page="permissionFilterSupportTableCurrentPage"
        v-model:page-size="permissionFilterSupportTablePageSize"
        highlight-current-row
        :item-count="permissionFilterSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="permissionFilterSupportTableItems"
        :operate-column-visible="false"
        @on-paging-attribute-changed="handlePermissionFilterSupportTablePagingAttributeChanged"
        @on-current-changed="handlePermissionFilterSupportTableCurrentChanged"
      >
        <paging-table-column label="名称" prop="label" :min-width="120" />
        <paging-table-column label="ID" prop="key.string_id" :min-width="120" />
        <paging-table-column label="描述" prop="description" :min-width="160" />
        <paging-table-column
          label="示例参数"
          prop="example_pattern"
          :min-width="200"
          cell-class="single-line"
        />
      </paging-table-panel>
    </div>
    <template v-slot:footer>
      <div class="footer-row">
        <native-button
          kind="primary"
          :disabled="loading > 0 || permissionFilterSupportTableCurrentRow === null"
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

import { type FilterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/filterSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/filterSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

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
  void handlePermissionFilterSupportAllSearch()
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
    throw new Error('不应该执行到此处，请联系开发人员')
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
.dialog-table-wrap {
  position: relative;
  width: min(80vw, 1000px);
  max-width: 92vw;
}

.table {
  height: 450px;
}

.footer-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}
</style>
