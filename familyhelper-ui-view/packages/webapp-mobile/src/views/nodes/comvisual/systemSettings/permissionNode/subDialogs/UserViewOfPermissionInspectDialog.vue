<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="权限用户视图查看"
    align-center
    width="55vw"
    :close-on-click-modal="false"
  >
    <div class="body-wrapper">
      <loading-overlay :loading="loading > 0" />
      <native-tabs v-model="activeTabName">
        <native-tab-pane name="matched" label="匹配用户">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <span class="search-label">用户ID</span>
                <input
                  v-model="matchedUsersSearchValue"
                  class="search-input"
                  type="text"
                  placeholder="用户ID模糊匹配"
                  @input="handleMatchedUsersFilter"
                  @keydown.enter="handleMatchedUsersFilter"
                />
                <native-button kind="primary" @click="handleMatchedUsersFilter">搜索</native-button>
              </div>
            </template>
            <template v-slot:default>
              <paging-table-panel
                class="table"
                v-model:current-page="matchedUsersTableCurrentPage"
                v-model:page-size="matchedUsersTablePageSize"
                pagination-adjust-strategy="FORCE_COMPACT"
                :item-count="matchedUsersTableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="matchedUsersTableItems"
                :operate-column-visible="false"
                :inspect-button-visible="false"
                :edit-button-visible="false"
                :delete-button-visible="false"
                @on-paging-attribute-changed="handleMatchedUsersPagingAttributeChanged"
              >
                <paging-table-column label="用户ID" prop="key.string_id" :min-width="160" />
                <paging-table-column label="备注" prop="remark" :min-width="120" />
              </paging-table-panel>
            </template>
          </header-layout-panel>
        </native-tab-pane>
        <native-tab-pane name="accepted" label="已接受角色">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <span class="search-label">角色ID</span>
                <input
                  v-model="acceptedRolesSearchValue"
                  class="search-input"
                  type="text"
                  placeholder="角色ID模糊匹配"
                  @input="handleAcceptedRolesFilter"
                  @keydown.enter="handleAcceptedRolesFilter"
                />
                <native-button kind="primary" @click="handleAcceptedRolesFilter"
                  >搜索</native-button
                >
              </div>
            </template>
            <template v-slot:default>
              <paging-table-panel
                class="table"
                v-model:current-page="acceptedRolesTableCurrentPage"
                v-model:page-size="acceptedRolesTablePageSize"
                pagination-adjust-strategy="FORCE_COMPACT"
                :item-count="acceptedRolesTableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="acceptedRolesTableItems"
                :operate-column-visible="false"
                :inspect-button-visible="false"
                :edit-button-visible="false"
                :delete-button-visible="false"
                @on-paging-attribute-changed="handleAcceptedRolesPagingAttributeChanged"
              >
                <paging-table-column label="角色ID" prop="key.string_id" :min-width="140" />
                <paging-table-column label="名称" prop="name" :min-width="120" />
                <paging-table-column label="备注" prop="remark" :min-width="120" />
              </paging-table-panel>
            </template>
          </header-layout-panel>
        </native-tab-pane>
        <native-tab-pane name="rejected" label="已拒绝角色">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <span class="search-label">角色ID</span>
                <input
                  v-model="rejectedRolesSearchValue"
                  class="search-input"
                  type="text"
                  placeholder="角色ID模糊匹配"
                  @input="handleRejectedRolesFilter"
                  @keydown.enter="handleRejectedRolesFilter"
                />
                <native-button kind="primary" @click="handleRejectedRolesFilter"
                  >搜索</native-button
                >
              </div>
            </template>
            <template v-slot:default>
              <paging-table-panel
                class="table"
                v-model:current-page="rejectedRolesTableCurrentPage"
                v-model:page-size="rejectedRolesTablePageSize"
                pagination-adjust-strategy="FORCE_COMPACT"
                :item-count="rejectedRolesTableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="rejectedRolesTableItems"
                :operate-column-visible="false"
                :inspect-button-visible="false"
                :edit-button-visible="false"
                :delete-button-visible="false"
                @on-paging-attribute-changed="handleRejectedRolesPagingAttributeChanged"
              >
                <paging-table-column label="角色ID" prop="key.string_id" :min-width="140" />
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

import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { type User } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/user.ts'
import { type Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/role.ts'
import { inspectUserViewOfPermission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/inspect.ts'

defineOptions({
  name: 'UserViewOfPermissionInspectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  permission: Permission | null
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

const matchedUsersSearchValue = ref<string>('')
const acceptedRolesSearchValue = ref<string>('')
const rejectedRolesSearchValue = ref<string>('')

const matchedUsersRaw = ref<User[]>([])
const acceptedRolesRaw = ref<Role[]>([])
const rejectedRolesRaw = ref<Role[]>([])

const {
  currentPage: matchedUsersTableCurrentPage,
  pageSize: matchedUsersTablePageSize,
  itemCount: matchedUsersTableItemCount,
  items: matchedUsersTableItems,
  refreshPaging: matchedUsersTableRefreshPaging,
  updateByLookup: matchedUsersTableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<User>(10)

function handleMatchedUsersPagingAttributeChanged(): void {
  matchedUsersTableRefreshPaging()
}

function filterUsersByPattern(users: User[], pattern: string): User[] {
  if (!pattern.trim()) {
    return users
  }
  const lower = pattern.trim().toLowerCase()
  return users.filter((u) => u.key.string_id.toLowerCase().includes(lower))
}

function handleMatchedUsersFilter(): void {
  matchedUsersTableUpdateByLookup(
    filterUsersByPattern(matchedUsersRaw.value, matchedUsersSearchValue.value),
  )
}

const {
  currentPage: acceptedRolesTableCurrentPage,
  pageSize: acceptedRolesTablePageSize,
  itemCount: acceptedRolesTableItemCount,
  items: acceptedRolesTableItems,
  refreshPaging: acceptedRolesTableRefreshPaging,
  updateByLookup: acceptedRolesTableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<Role>(10)

function handleAcceptedRolesPagingAttributeChanged(): void {
  acceptedRolesTableRefreshPaging()
}

function filterRolesByPattern(roles: Role[], pattern: string): Role[] {
  if (!pattern.trim()) {
    return roles
  }
  const lower = pattern.trim().toLowerCase()
  return roles.filter((r) => r.key.string_id.toLowerCase().includes(lower))
}

function handleAcceptedRolesFilter(): void {
  acceptedRolesTableUpdateByLookup(
    filterRolesByPattern(acceptedRolesRaw.value, acceptedRolesSearchValue.value),
  )
}

const {
  currentPage: rejectedRolesTableCurrentPage,
  pageSize: rejectedRolesTablePageSize,
  itemCount: rejectedRolesTableItemCount,
  items: rejectedRolesTableItems,
  refreshPaging: rejectedRolesTableRefreshPaging,
  updateByLookup: rejectedRolesTableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<Role>(10)

function handleRejectedRolesPagingAttributeChanged(): void {
  rejectedRolesTableRefreshPaging()
}

function handleRejectedRolesFilter(): void {
  rejectedRolesTableUpdateByLookup(
    filterRolesByPattern(rejectedRolesRaw.value, rejectedRolesSearchValue.value),
  )
}

// endregion

// region 搜索

async function handleSearch(): Promise<void> {
  if (!props.permission) {
    return
  }
  loading.value += 1
  try {
    const result = await resolveResponse(
      inspectUserViewOfPermission({
        permission_key: props.permission.key,
        detail_mode: true,
      }),
    )
    matchedUsersRaw.value = result.matched_users ?? []
    acceptedRolesRaw.value = result.accepted_roles ?? []
    rejectedRolesRaw.value = result.rejected_roles ?? []
    matchedUsersTableUpdateByLookup(
      filterUsersByPattern(matchedUsersRaw.value, matchedUsersSearchValue.value),
    )
    acceptedRolesTableUpdateByLookup(
      filterRolesByPattern(acceptedRolesRaw.value, acceptedRolesSearchValue.value),
    )
    rejectedRolesTableUpdateByLookup(
      filterRolesByPattern(rejectedRolesRaw.value, rejectedRolesSearchValue.value),
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
