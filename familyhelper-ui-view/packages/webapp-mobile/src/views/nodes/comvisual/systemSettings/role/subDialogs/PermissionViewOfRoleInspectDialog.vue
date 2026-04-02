<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="角色权限视图查看"
    align-center
    width="55vw"
    :close-on-click-modal="false"
  >
    <div class="body-wrapper">
      <loading-overlay :loading="loading > 0" />
      <native-tabs v-model="activeTabName">
        <native-tab-pane name="matched" label="匹配权限">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <span class="search-label">权限ID</span>
                <input
                  v-model="matchedPermissionsSearchValue"
                  class="search-input"
                  type="text"
                  placeholder="权限ID模糊匹配"
                  @input="handleMatchedPermissionsFilter"
                  @keydown.enter="handleMatchedPermissionsFilter"
                />
                <native-button kind="primary" @click="handleMatchedPermissionsFilter"
                  >搜索</native-button
                >
              </div>
            </template>
            <template v-slot:default>
              <paging-table-panel
                class="table"
                v-model:current-page="matchedPermissionsTableCurrentPage"
                v-model:page-size="matchedPermissionsTablePageSize"
                pagination-adjust-strategy="FORCE_COMPACT"
                :item-count="matchedPermissionsTableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="matchedPermissionsTableItems"
                :operate-column-visible="false"
                :inspect-button-visible="false"
                :edit-button-visible="false"
                :delete-button-visible="false"
                @on-paging-attribute-changed="handleMatchedPermissionsPagingAttributeChanged"
              >
                <paging-table-column
                  label="权限ID"
                  prop="key.permission_string_id"
                  :min-width="160"
                />
                <paging-table-column label="名称" prop="name" :min-width="120" />
                <paging-table-column label="备注" prop="remark" :min-width="120" />
              </paging-table-panel>
            </template>
          </header-layout-panel>
        </native-tab-pane>
        <native-tab-pane name="accepted" label="已接受权限">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <span class="search-label">权限ID</span>
                <input
                  v-model="acceptedPermissionsSearchValue"
                  class="search-input"
                  type="text"
                  placeholder="权限ID模糊匹配"
                  @input="handleAcceptedPermissionsFilter"
                  @keydown.enter="handleAcceptedPermissionsFilter"
                />
                <native-button kind="primary" @click="handleAcceptedPermissionsFilter"
                  >搜索</native-button
                >
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
                @on-paging-attribute-changed="handleAcceptedPermissionsPagingAttributeChanged"
              >
                <paging-table-column
                  label="权限ID"
                  prop="key.permission_string_id"
                  :min-width="160"
                />
                <paging-table-column label="名称" prop="name" :min-width="120" />
                <paging-table-column label="备注" prop="remark" :min-width="120" />
              </paging-table-panel>
            </template>
          </header-layout-panel>
        </native-tab-pane>
        <native-tab-pane name="rejected" label="已拒绝权限">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <span class="search-label">权限ID</span>
                <input
                  v-model="rejectedPermissionsSearchValue"
                  class="search-input"
                  type="text"
                  placeholder="权限ID模糊匹配"
                  @input="handleRejectedPermissionsFilter"
                  @keydown.enter="handleRejectedPermissionsFilter"
                />
                <native-button kind="primary" @click="handleRejectedPermissionsFilter"
                  >搜索</native-button
                >
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
                @on-paging-attribute-changed="handleRejectedPermissionsPagingAttributeChanged"
              >
                <paging-table-column
                  label="权限ID"
                  prop="key.permission_string_id"
                  :min-width="160"
                />
                <paging-table-column label="名称" prop="name" :min-width="120" />
                <paging-table-column label="备注" prop="remark" :min-width="120" />
              </paging-table-panel>
            </template>
          </header-layout-panel>
        </native-tab-pane>
        <native-tab-pane name="global_rejected" label="全局拒绝权限">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <span class="search-label">权限ID</span>
                <input
                  v-model="globalRejectedPermissionsSearchValue"
                  class="search-input"
                  type="text"
                  placeholder="权限ID模糊匹配"
                  @input="handleGlobalRejectedPermissionsFilter"
                  @keydown.enter="handleGlobalRejectedPermissionsFilter"
                />
                <native-button kind="primary" @click="handleGlobalRejectedPermissionsFilter">
                  搜索
                </native-button>
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
                @on-paging-attribute-changed="handleGlobalRejectedPermissionsPagingAttributeChanged"
              >
                <paging-table-column
                  label="权限ID"
                  prop="key.permission_string_id"
                  :min-width="160"
                />
                <paging-table-column label="名称" prop="name" :min-width="120" />
                <paging-table-column label="备注" prop="remark" :min-width="120" />
              </paging-table-panel>
            </template>
          </header-layout-panel>
        </native-tab-pane>
      </native-tabs>
    </div>
    <template v-slot:footer>
      <native-button @click="watchedVisible = false">关闭</native-button>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { resolveResponse } from '@/util/response.ts'

import { type Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/role.ts'
import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { inspectPermissionViewOfRole } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/inspect.ts'

defineOptions({
  name: 'PermissionViewOfRoleInspectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  role: Role | null
  scopeId: string
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
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

// endregion

// region 数据

const activeTabName = ref<string>('matched')

const matchedPermissionsSearchValue = ref<string>('')
const acceptedPermissionsSearchValue = ref<string>('')
const rejectedPermissionsSearchValue = ref<string>('')
const globalRejectedPermissionsSearchValue = ref<string>('')

const matchedPermissionsRaw = ref<Permission[]>([])
const acceptedPermissionsRaw = ref<Permission[]>([])
const rejectedPermissionsRaw = ref<Permission[]>([])
const globalRejectedPermissionsRaw = ref<Permission[]>([])

function filterPermissionsByPattern(permissions: Permission[], pattern: string): Permission[] {
  if (!pattern.trim()) {
    return permissions
  }
  const lower = pattern.trim().toLowerCase()
  return permissions.filter((p) => p.key.permission_string_id.toLowerCase().includes(lower))
}

const {
  currentPage: matchedPermissionsTableCurrentPage,
  pageSize: matchedPermissionsTablePageSize,
  itemCount: matchedPermissionsTableItemCount,
  items: matchedPermissionsTableItems,
  refreshPaging: matchedPermissionsTableRefreshPaging,
  updateByLookup: matchedPermissionsTableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<Permission>(10)

function handleMatchedPermissionsPagingAttributeChanged(): void {
  matchedPermissionsTableRefreshPaging()
}

function handleMatchedPermissionsFilter(): void {
  matchedPermissionsTableUpdateByLookup(
    filterPermissionsByPattern(matchedPermissionsRaw.value, matchedPermissionsSearchValue.value),
  )
}

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

// endregion

// region 搜索

async function handleSearch(): Promise<void> {
  if (!props.role || !props.scopeId) {
    return
  }
  loading.value += 1
  try {
    const result = await resolveResponse(
      inspectPermissionViewOfRole({
        scoped_role_key: {
          scope_string_id: props.scopeId,
          role_string_id: props.role.key.string_id,
        },
        detail_mode: true,
      }),
    )
    matchedPermissionsRaw.value = result.matched_permissions ?? []
    acceptedPermissionsRaw.value = result.accepted_permissions ?? []
    rejectedPermissionsRaw.value = result.rejected_permissions ?? []
    globalRejectedPermissionsRaw.value = result.global_rejected_permissions ?? []
    matchedPermissionsTableUpdateByLookup(
      filterPermissionsByPattern(matchedPermissionsRaw.value, matchedPermissionsSearchValue.value),
    )
    acceptedPermissionsTableUpdateByLookup(
      filterPermissionsByPattern(
        acceptedPermissionsRaw.value,
        acceptedPermissionsSearchValue.value,
      ),
    )
    rejectedPermissionsTableUpdateByLookup(
      filterPermissionsByPattern(
        rejectedPermissionsRaw.value,
        rejectedPermissionsSearchValue.value,
      ),
    )
    globalRejectedPermissionsTableUpdateByLookup(
      filterPermissionsByPattern(
        globalRejectedPermissionsRaw.value,
        globalRejectedPermissionsSearchValue.value,
      ),
    )
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.visible,
  (value) => {
    if (value) {
      handleSearch()
    }
  },
)
// endregion
</script>

<style scoped>
.body-wrapper {
  position: relative;
  width: min(55vw, 920px);
  height: 60vh;
  min-height: 320px;
}

.tab-panel {
  height: 100%;
  min-height: 0;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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
  flex: 1;
  min-height: 200px;
}
</style>
