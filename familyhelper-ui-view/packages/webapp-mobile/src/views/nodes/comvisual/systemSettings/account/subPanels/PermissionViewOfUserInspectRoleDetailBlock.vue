<template>
  <native-tabs v-model="activeInnerTabName" class="role-detail-tabs" tab-position="top">
    <native-tab-pane name="accepted" label="已接受权限">
      <header-layout-panel class="inner-tab-panel">
        <template v-slot:header>
          <div class="header-container">
            <div class="id-search-row">
              <input-group class="id-search-bar">
                <template v-slot:prepend>权限ID</template>
                <input
                  v-model="acceptedPermissionsSearchValue"
                  type="text"
                  placeholder="权限ID模糊匹配"
                  @input="handleAcceptedPermissionsFilter"
                  @keyup.enter="handleAcceptedPermissionsFilter"
                />
              </input-group>
              <native-button size="small" kind="primary" @click="handleAcceptedPermissionsFilter">
                筛选
              </native-button>
            </div>
          </div>
        </template>
        <template v-slot:default>
          <paging-table-panel
            class="table"
            v-model:current-page="acceptedPermissionsTableCurrentPage"
            v-model:page-size="acceptedPermissionsTablePageSize"
            pagination-adjust-strategy="FORCE_COMPACT"
            :item-count="acceptedPermissionsTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="acceptedPermissionsTableItems"
            :operate-column-visible="false"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :highlight-current-row="false"
            @on-paging-attribute-changed="handleAcceptedPermissionsPagingAttributeChanged"
          >
            <paging-table-column label="权限ID" prop="key.permission_string_id" :min-width="160" />
            <paging-table-column label="名称" prop="name" :min-width="120" />
            <paging-table-column label="备注" prop="remark" :min-width="120" />
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </native-tab-pane>
    <native-tab-pane name="rejected" label="已拒绝权限">
      <header-layout-panel class="inner-tab-panel">
        <template v-slot:header>
          <div class="header-container">
            <div class="id-search-row">
              <input-group class="id-search-bar">
                <template v-slot:prepend>权限ID</template>
                <input
                  v-model="rejectedPermissionsSearchValue"
                  type="text"
                  placeholder="权限ID模糊匹配"
                  @input="handleRejectedPermissionsFilter"
                  @keyup.enter="handleRejectedPermissionsFilter"
                />
              </input-group>
              <native-button size="small" kind="primary" @click="handleRejectedPermissionsFilter">
                筛选
              </native-button>
            </div>
          </div>
        </template>
        <template v-slot:default>
          <paging-table-panel
            class="table"
            v-model:current-page="rejectedPermissionsTableCurrentPage"
            v-model:page-size="rejectedPermissionsTablePageSize"
            pagination-adjust-strategy="FORCE_COMPACT"
            :item-count="rejectedPermissionsTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="rejectedPermissionsTableItems"
            :operate-column-visible="false"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :highlight-current-row="false"
            @on-paging-attribute-changed="handleRejectedPermissionsPagingAttributeChanged"
          >
            <paging-table-column label="权限ID" prop="key.permission_string_id" :min-width="160" />
            <paging-table-column label="名称" prop="name" :min-width="120" />
            <paging-table-column label="备注" prop="remark" :min-width="120" />
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </native-tab-pane>
    <native-tab-pane name="global_rejected" label="全局拒绝权限">
      <header-layout-panel class="inner-tab-panel">
        <template v-slot:header>
          <div class="header-container">
            <div class="id-search-row">
              <input-group class="id-search-bar">
                <template v-slot:prepend>权限ID</template>
                <input
                  v-model="globalRejectedPermissionsSearchValue"
                  type="text"
                  placeholder="权限ID模糊匹配"
                  @input="handleGlobalRejectedPermissionsFilter"
                  @keyup.enter="handleGlobalRejectedPermissionsFilter"
                />
              </input-group>
              <native-button
                size="small"
                kind="primary"
                @click="handleGlobalRejectedPermissionsFilter"
              >
                筛选
              </native-button>
            </div>
          </div>
        </template>
        <template v-slot:default>
          <paging-table-panel
            class="table"
            v-model:current-page="globalRejectedPermissionsTableCurrentPage"
            v-model:page-size="globalRejectedPermissionsTablePageSize"
            pagination-adjust-strategy="FORCE_COMPACT"
            :item-count="globalRejectedPermissionsTableItemCount"
            :page-sizes="[10, 15, 20, 30]"
            :items="globalRejectedPermissionsTableItems"
            :operate-column-visible="false"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :highlight-current-row="false"
            @on-paging-attribute-changed="handleGlobalRejectedPermissionsPagingAttributeChanged"
          >
            <paging-table-column label="权限ID" prop="key.permission_string_id" :min-width="160" />
            <paging-table-column label="名称" prop="name" :min-width="120" />
            <paging-table-column label="备注" prop="remark" :min-width="120" />
          </paging-table-panel>
        </template>
      </header-layout-panel>
    </native-tab-pane>
  </native-tabs>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import InputGroup from '@/components/comvisual/form/inputGroup/InputGroup.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { type PermissionViewOfUserInspectResultRoleDetail } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/inspect.ts'

defineOptions({
  name: 'PermissionViewOfUserInspectRoleDetailBlock',
})

// region Props 定义

type Props = {
  detail: PermissionViewOfUserInspectResultRoleDetail
}

const props = defineProps<Props>()

// endregion

// region 表格与筛选

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
  { deep: true },
)

onMounted(() => {
  syncFromDetail()
})

// endregion
</script>

<style scoped>
.role-detail-tabs {
  width: 100%;
  height: 100%;
  min-height: 240px;
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

.id-search-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 8px;
  max-width: 480px;
}

.id-search-bar {
  flex: 1;
  min-width: 0;
}

.table {
  flex: 1;
  min-height: 120px;
}
</style>
