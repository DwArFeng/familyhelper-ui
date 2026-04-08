<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="关联权限节点"
    :close-on-click-modal="false"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="dialog-body-wrap">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="success" :disabled="scopeId === ''" @click="handleSearch">
              刷新数据
            </native-button>
            <vertical-divider />
            <span class="search-label">权限节点</span>
            <input
              v-model="idSearchBarValue"
              class="search-input"
              type="text"
              :disabled="scopeId === ''"
              placeholder="输入后回车或点搜索"
              @keydown.enter="handleSearch"
            />
            <native-button kind="primary" :disabled="scopeId === ''" @click="handleSearch">
              搜索
            </native-button>
          </div>
        </template>
        <template v-slot:default>
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
            <paging-table-column
              label="权限节点"
              prop="key.permission_string_id"
              :min-width="160"
            />
            <paging-table-column label="名称" prop="name" :min-width="120" />
            <paging-table-column label="备注" prop="remark" :min-width="140" />
          </paging-table-panel>
        </template>
      </header-layout-panel>
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
import VerticalDivider from '@/components/comvisual/form/divider/verticalDivider/VerticalDivider.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { type PermissionGroupKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/key.ts'
import {
  childForScopeGroupIsNullDisp,
  childForScopeGroupIsNullPermissionStringIdLikeDisp,
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

// region 筛选栏

const idSearchBarValue = ref<string>('')

// endregion

// region 表格分页与选择

const { currentPage, pageSize, itemCount, items, pagingInfo, updateByLookup } =
  useIdentityBackendPagingTablePanel<DispPermission>(15)

const permissionSelection = ref<DispPermission[]>([])
const selectedKeys = ref<(string | number)[]>([])

function permissionRowKey(row: DispPermission): string {
  return `${row.key.scope_string_id}::${row.key.permission_string_id}`
}

function handleSelectionChanged(keys: (string | number)[]): void {
  selectedKeys.value = keys
  permissionSelection.value = items.value.filter((row) => keys.includes(permissionRowKey(row)))
}

// endregion

// region 数据加载

function handleSearch(): void {
  if (props.scopeId === '') {
    return
  }
  loading.value += 1
  const pattern = idSearchBarValue.value.trim()
  const lookupHandler =
    pattern === ''
      ? (p: { page: number; rows: number }) =>
          childForScopeGroupIsNullDisp({ string_id: props.scopeId }, p)
      : (p: { page: number; rows: number }) =>
          childForScopeGroupIsNullPermissionStringIdLikeDisp(
            { string_id: props.scopeId },
            pattern,
            p,
          )
  lookupWithAdjustPage(lookupHandler, pagingInfo.value)
    .then(updateByLookup)
    .finally(() => {
      loading.value -= 1
    })
}

function fetchPermissions(): void {
  handleSearch()
}

function handlePagingAttributeChanged(): void {
  permissionSelection.value = []
  selectedKeys.value = []
  fetchPermissions()
}

// endregion

// region 打开对话框时监听

watch(
  () => [props.visible, props.scopeId] as const,
  ([visible, scopeIdVal]) => {
    if (visible && scopeIdVal !== '') {
      idSearchBarValue.value = ''
      permissionSelection.value = []
      selectedKeys.value = []
      fetchPermissions()
    }
  },
)

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
  height: 600px;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  row-gap: 5px;
}

.search-label {
  font-size: 14px;
  color: #606266;
}

.search-input {
  width: min(280px, 100%);
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
}

.table {
  height: 100%;
  width: 100%;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
