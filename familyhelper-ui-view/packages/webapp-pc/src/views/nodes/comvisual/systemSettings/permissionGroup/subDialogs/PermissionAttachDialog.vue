<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="关联权限节点"
    :close-on-click-modal="false"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="dialog-body-wrap">
      <loading-overlay :loading="loading > 0" />
      <paging-table-panel
        class="table"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :item-count="itemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="items"
        :operate-column-visible="false"
        :inspect-button-visible="false"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :selection-column-visible="true"
        :selected-keys="selectedKeys"
        :row-key="permissionRowKey"
        @on-paging-attribute-changed="handlePagingAttributeChanged"
        @on-selection-change="handleSelectionChanged"
      >
        <paging-table-column label="权限节点" prop="key.permission_string_id" :min-width="160" />
        <paging-table-column label="名称" prop="name" :min-width="120" />
        <paging-table-column label="备注" prop="remark" :min-width="140" />
      </paging-table-panel>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <native-button
          kind="primary"
          :disabled="permissionSelection.length === 0"
          @click="handleConfirmButtonClicked"
        >
          关联
        </native-button>
        <native-button @click="handleCancelButtonClicked">取消</native-button>
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

import { type PermissionGroupKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/key.ts'
import {
  childForScopeDisp,
  type DispPermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'PermissionAttachDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  scopeId: string
  currentGroupKey: PermissionGroupKey | null
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', permissions: DispPermission[]): void
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
})

// endregion

// region Props 监听

watch(
  () => [props.visible, props.scopeId] as const,
  ([visible, scopeId]) => {
    if (visible && scopeId !== '') {
      permissionSelection.value = []
      selectedKeys.value = []
      fetchPermissions()
    }
  },
)

// endregion

// region 表格逻辑

const { currentPage, pageSize, itemCount, items, pagingInfo, updateByLookup } =
  useIdentityBackendPagingTablePanel<DispPermission>(15)

const permissionSelection = ref<DispPermission[]>([])
const selectedKeys = ref<(string | number)[]>([])

function permissionRowKey(row: DispPermission): string {
  return `${row.key.scope_string_id}::${row.key.permission_string_id}`
}

async function fetchPermissions(): Promise<void> {
  if (props.scopeId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (p) => childForScopeDisp({ string_id: props.scopeId }, p),
      pagingInfo.value,
    )
    updateByLookup(res)
  } finally {
    loading.value -= 1
  }
}

function handlePagingAttributeChanged(): void {
  permissionSelection.value = []
  selectedKeys.value = []
  fetchPermissions()
}

function handleSelectionChanged(keys: (string | number)[]): void {
  selectedKeys.value = keys
  permissionSelection.value = items.value.filter((row) => keys.includes(permissionRowKey(row)))
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  if (permissionSelection.value.length === 0) {
    return
  }
  emit('onConfirmed', permissionSelection.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (permissionSelection.value.length === 0) {
    return
  }
  emit('onConfirmed', permissionSelection.value)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.dialog-body-wrap {
  position: relative;
  min-height: 50vh;
}

.table {
  height: 70vh;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
