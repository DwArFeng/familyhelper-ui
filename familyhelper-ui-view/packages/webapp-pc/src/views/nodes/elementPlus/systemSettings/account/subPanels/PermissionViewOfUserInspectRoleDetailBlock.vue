<template>
  <el-tabs class="role-detail-tabs" v-model="activeInnerTabName" tab-position="right">
    <el-tab-pane label="已接受权限" name="accepted">
      <header-layout-panel class="inner-tab-panel">
        <template v-slot:header>
          <div class="header-container">
            <el-input
              class="id-search-bar"
              v-model="acceptedPermissionsSearchValue"
              clearable
              placeholder="权限ID模糊匹配"
              @keydown.enter="handleAcceptedPermissionsFilter"
              @clear="handleAcceptedPermissionsFilter"
              @input="handleAcceptedPermissionsFilter"
            >
              <template v-slot:prepend>
                <span>权限ID</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleAcceptedPermissionsFilter" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="acceptedPermissionsTableCurrentPage"
            v-model:page-size="acceptedPermissionsTablePageSize"
            pagination-adjust-strategy="FORCE_COMPACT"
            :item-count="acceptedPermissionsTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="acceptedPermissionsTableItems"
            :operate-column-visible="false"
            :show-contextmenu="false"
            @onPagingAttributeChanged="handleAcceptedPermissionsPagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.permission_string_id"
                label="权限ID"
                show-overflow-tooltip
              />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </el-tab-pane>
    <el-tab-pane label="已拒绝权限" name="rejected">
      <header-layout-panel class="inner-tab-panel">
        <template v-slot:header>
          <div class="header-container">
            <el-input
              class="id-search-bar"
              v-model="rejectedPermissionsSearchValue"
              clearable
              placeholder="权限ID模糊匹配"
              @keydown.enter="handleRejectedPermissionsFilter"
              @clear="handleRejectedPermissionsFilter"
              @input="handleRejectedPermissionsFilter"
            >
              <template v-slot:prepend>
                <span>权限ID</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleRejectedPermissionsFilter" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="rejectedPermissionsTableCurrentPage"
            v-model:page-size="rejectedPermissionsTablePageSize"
            pagination-adjust-strategy="FORCE_COMPACT"
            :item-count="rejectedPermissionsTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="rejectedPermissionsTableItems"
            :operate-column-visible="false"
            :show-contextmenu="false"
            @onPagingAttributeChanged="handleRejectedPermissionsPagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.permission_string_id"
                label="权限ID"
                show-overflow-tooltip
              />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </el-tab-pane>
    <el-tab-pane label="全局拒绝权限" name="global_rejected">
      <header-layout-panel class="inner-tab-panel">
        <template v-slot:header>
          <div class="header-container">
            <el-input
              class="id-search-bar"
              v-model="globalRejectedPermissionsSearchValue"
              clearable
              placeholder="权限ID模糊匹配"
              @keydown.enter="handleGlobalRejectedPermissionsFilter"
              @clear="handleGlobalRejectedPermissionsFilter"
              @input="handleGlobalRejectedPermissionsFilter"
            >
              <template v-slot:prepend>
                <span>权限ID</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleGlobalRejectedPermissionsFilter" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="globalRejectedPermissionsTableCurrentPage"
            v-model:page-size="globalRejectedPermissionsTablePageSize"
            pagination-adjust-strategy="FORCE_COMPACT"
            :item-count="globalRejectedPermissionsTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="globalRejectedPermissionsTableItems"
            :operate-column-visible="false"
            :show-contextmenu="false"
            @onPagingAttributeChanged="handleGlobalRejectedPermissionsPagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.permission_string_id"
                label="权限ID"
                show-overflow-tooltip
              />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import { type Permission } from '../../../../../../../../component-api/src/api/rbac/permission.ts'
import { type PermissionViewOfUserInspectResultRoleDetail } from '../../../../../../../../component-api/src/api/rbac/inspect.ts'

defineOptions({
  name: 'PermissionViewOfUserInspectRoleDetailBlock',
})

// region Props 定义

type Props = {
  detail: PermissionViewOfUserInspectResultRoleDetail
}

const props = defineProps<Props>()

// endregion

const activeInnerTabName = ref<string>('accepted')

function filterPermissionsByPattern(permissions: Permission[], pattern: string): Permission[] {
  if (!pattern.trim()) {
    return permissions
  }
  const lower = pattern.trim().toLowerCase()
  return permissions.filter((p) => p.key.permission_string_id.toLowerCase().includes(lower))
}

const acceptedPermissionsSearchValue = ref<string>('')
const rejectedPermissionsSearchValue = ref<string>('')
const globalRejectedPermissionsSearchValue = ref<string>('')

const acceptedPermissionsRaw = ref<Permission[]>([])
const rejectedPermissionsRaw = ref<Permission[]>([])
const globalRejectedPermissionsRaw = ref<Permission[]>([])

const {
  currentPage: acceptedPermissionsTableCurrentPage,
  pageSize: acceptedPermissionsTablePageSize,
  itemCount: acceptedPermissionsTableItemCount,
  items: acceptedPermissionsTableItems,
  refreshPaging: acceptedPermissionsTableRefreshPaging,
  updateByLookup: acceptedPermissionsTableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<Permission>(10)

function handleAcceptedPermissionsPagingAttributeChanged(): void {
  acceptedPermissionsTableRefreshPaging()
}

function handleAcceptedPermissionsFilter(): void {
  acceptedPermissionsTableUpdateByLookup(
    filterPermissionsByPattern(acceptedPermissionsRaw.value, acceptedPermissionsSearchValue.value),
  )
}

const {
  currentPage: rejectedPermissionsTableCurrentPage,
  pageSize: rejectedPermissionsTablePageSize,
  itemCount: rejectedPermissionsTableItemCount,
  items: rejectedPermissionsTableItems,
  refreshPaging: rejectedPermissionsTableRefreshPaging,
  updateByLookup: rejectedPermissionsTableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<Permission>(10)

function handleRejectedPermissionsPagingAttributeChanged(): void {
  rejectedPermissionsTableRefreshPaging()
}

function handleRejectedPermissionsFilter(): void {
  rejectedPermissionsTableUpdateByLookup(
    filterPermissionsByPattern(rejectedPermissionsRaw.value, rejectedPermissionsSearchValue.value),
  )
}

const {
  currentPage: globalRejectedPermissionsTableCurrentPage,
  pageSize: globalRejectedPermissionsTablePageSize,
  itemCount: globalRejectedPermissionsTableItemCount,
  items: globalRejectedPermissionsTableItems,
  refreshPaging: globalRejectedPermissionsTableRefreshPaging,
  updateByLookup: globalRejectedPermissionsTableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<Permission>(10)

function handleGlobalRejectedPermissionsPagingAttributeChanged(): void {
  globalRejectedPermissionsTableRefreshPaging()
}

function handleGlobalRejectedPermissionsFilter(): void {
  globalRejectedPermissionsTableUpdateByLookup(
    filterPermissionsByPattern(
      globalRejectedPermissionsRaw.value,
      globalRejectedPermissionsSearchValue.value,
    ),
  )
}

function syncFromDetail(): void {
  acceptedPermissionsRaw.value = props.detail.accepted_permissions ?? []
  rejectedPermissionsRaw.value = props.detail.rejected_permissions ?? []
  globalRejectedPermissionsRaw.value = props.detail.global_rejected_permissions ?? []
  acceptedPermissionsTableUpdateByLookup(
    filterPermissionsByPattern(acceptedPermissionsRaw.value, acceptedPermissionsSearchValue.value),
  )
  rejectedPermissionsTableUpdateByLookup(
    filterPermissionsByPattern(rejectedPermissionsRaw.value, rejectedPermissionsSearchValue.value),
  )
  globalRejectedPermissionsTableUpdateByLookup(
    filterPermissionsByPattern(
      globalRejectedPermissionsRaw.value,
      globalRejectedPermissionsSearchValue.value,
    ),
  )
}

watch(
  () => props.detail,
  () => {
    syncFromDetail()
  },
  { deep: true, immediate: true },
)
</script>

<style scoped>
.role-detail-tabs {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.role-detail-tabs :deep(.el-tabs__content) {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.role-detail-tabs :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.inner-tab-panel {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.table {
  flex: 1;
  min-height: 120px;
}
</style>
