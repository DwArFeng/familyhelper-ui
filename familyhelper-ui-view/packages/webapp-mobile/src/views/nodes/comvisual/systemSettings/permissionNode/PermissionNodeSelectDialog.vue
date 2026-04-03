<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="选择权限节点"
    width="1080px"
    top="6vh"
    :close-on-click-modal="false"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="permission-node-selector-dialog">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button
              kind="success"
              :disabled="scopeIndicatorValue === null"
              @click="handleSearch"
            >
              刷新数据
            </native-button>
            <vertical-divider />
            <permission-scope-indicator @on-changed="handlePermissionScopeIndicatorChanged" />
            <vertical-divider />
            <span class="search-label">权限节点</span>
            <input
              v-model="idSearchBarValue"
              class="search-input"
              type="text"
              :disabled="scopeIndicatorValue === null"
              placeholder="输入后回车或点搜索"
              @keydown.enter="handleSearch"
            />
            <native-button
              kind="primary"
              :disabled="scopeIndicatorValue === null"
              @click="handleSearch"
            >
              搜索
            </native-button>
          </div>
        </template>
        <template v-slot:default>
          <placeholder-panel
            v-if="scopeId === ''"
            class="placeholder-block"
            text="请选择权限作用域"
          />
          <paging-table-panel
            v-else
            class="table-block"
            v-model:current-page="permissionTableCurrentPage"
            v-model:page-size="permissionTablePageSize"
            :item-count="permissionTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="permissionTableItems"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-visible="false"
            :highlight-current-row="true"
            @on-paging-attribute-changed="handlePagingAttributeChanged"
            @on-current-changed="handlePermissionTableCurrentChanged"
          >
            <paging-table-column
              label="权限节点"
              prop="key.permission_string_id"
              :min-width="200"
            />
            <paging-table-column
              label="权限组"
              prop="group_key.permission_group_string_id"
              :min-width="140"
            />
            <paging-table-column label="名称" prop="name" :min-width="120" />
            <paging-table-column
              label="等级"
              prop="level"
              :width="72"
              align="right"
              header-class="th-num"
              cell-class="th-num"
            />
            <paging-table-column label="备注" prop="remark" :min-width="100" />
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </div>
    <template v-slot:footer>
      <div class="footer-row">
        <native-button
          kind="primary"
          :disabled="loading > 0 || permissionTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </native-button>
        <native-button :disabled="loading > 0" @click="handleCancelButtonClicked">
          取消
        </native-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import VerticalDivider from '@/components/comvisual/form/divider/verticalDivider/VerticalDivider.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import PermissionScopeIndicator from '@/views/nodes/comvisual/systemSettings/permissionScope/PermissionScopeIndicator.vue'

import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import {
  childForScopeDisp,
  childForScopePermissionStringIdLike,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'PermissionNodeSelectDialog',
})

// region 类型定义

type Props = {
  visible: boolean
}

const props = defineProps<Props>()

type Emits = {
  (e: 'update:visible', value: boolean): void
  /** 选中的权限实体（完整 `Permission`，由调用方自行格式化，如导航 `scopeId;permissionId`）。 */
  (e: 'onConfirmed', permission: Permission): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 对话框可见性

const watchedVisible = ref<boolean>(props.visible)

watch(
  () => props.visible,
  (v) => {
    watchedVisible.value = v
    if (v && scopeId.value !== '') {
      handleSearch()
    }
  },
)

watch(
  () => watchedVisible.value,
  (v) => {
    emit('update:visible', v)
  },
)

// endregion

// region 作用域

const scopeIndicatorValue = ref<Scope | null>(null)

const scopeId = computed<string>(() => {
  return scopeIndicatorValue.value === null ? '' : scopeIndicatorValue.value.key.string_id
})

function handlePermissionScopeIndicatorChanged(value: Scope | null): void {
  scopeIndicatorValue.value = value
}

watch(
  () => scopeIndicatorValue.value,
  (newVal) => {
    permissionTableCurrentRow.value = null
    if (newVal !== null) {
      handleSearch()
    }
  },
)

// endregion

// region 搜索栏

const idSearchBarValue = ref<string>('')

// endregion

// region 表格与搜索

const {
  currentPage: permissionTableCurrentPage,
  pageSize: permissionTablePageSize,
  itemCount: permissionTableItemCount,
  items: permissionTableItems,
  pagingInfo: permissionTablePagingInfo,
  updateByLookup: updatePermissionTableByLookup,
} = useIdentityBackendPagingTablePanel<Permission>(15)

const permissionTableCurrentRow = ref<Permission | null>(null)

function handlePagingAttributeChanged(): void {
  handleSearch()
}

function handlePermissionTableCurrentChanged(current: Permission | null): void {
  permissionTableCurrentRow.value = current
}

function handleSearch(): void {
  if (scopeId.value === '') {
    return
  }
  loading.value += 1
  const pattern = idSearchBarValue.value.trim()
  const lookupHandler =
    pattern === ''
      ? (p: { page: number; rows: number }) => childForScopeDisp({ string_id: scopeId.value }, p)
      : (p: { page: number; rows: number }) =>
          childForScopePermissionStringIdLike({ string_id: scopeId.value }, pattern, p)
  lookupWithAdjustPage(lookupHandler, permissionTablePagingInfo.value)
    .then(updatePermissionTableByLookup)
    .finally(() => {
      loading.value -= 1
    })
}

onMounted(() => {
  if (props.visible && scopeId.value !== '') {
    handleSearch()
  }
})

// endregion

// region 确认与快捷键

function handleConfirmButtonClicked(): void {
  const row = permissionTableCurrentRow.value
  if (row === null) {
    return
  }
  emit('onConfirmed', row)
  watchedVisible.value = false
  emit('update:visible', false)
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
  emit('update:visible', false)
}

function handleHotKeyDown(): void {
  handleConfirmButtonClicked()
}

// endregion
</script>

<style scoped>
.permission-node-selector-dialog {
  height: 600px;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
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

.placeholder-block {
  min-height: 200px;
}

.table-block {
  height: 100%;
  width: 100%;
}

.footer-row {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
