<template>
  <el-dialog
    class="permission-attach-dialog-container"
    v-model="watchedVisible"
    append-to-body
    destroy-on-close
    title="关联权限节点"
    width="80%"
    top="6vh"
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <div class="permission-attach-dialog-body" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              class="header-button"
              type="success"
              :disabled="scopeId === ''"
              @click="handleSearch"
            >
              刷新数据
            </el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              :disabled="scopeId === ''"
              @keydown.enter="handleSearch"
              @clear="handleSearch"
            >
              <template v-slot:prepend>
                <span>权限节点</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleSearch" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
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
            @onPagingAttributeChanged="handlePagingAttributeChanged"
            @onSelectionChanged="handleSelectionChanged"
          >
            <template v-slot:default>
              <el-table-column type="selection" width="55" />
              <el-table-column
                prop="key.permission_string_id"
                label="权限节点"
                show-overflow-tooltip
              />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button
          type="primary"
          :disabled="permissionSelection.length === 0"
          @click="handleConfirmButtonClicked"
        >
          关联
        </el-button>
        <el-button @click="handleCancelButtonClicked">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

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

function handleSelectionChanged(selection: DispPermission[]): void {
  permissionSelection.value = selection
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
.permission-attach-dialog-body {
  height: 600px;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

.header-button {
  margin-right: 0;
}

.id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.table {
  height: 100%;
  width: 100%;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
