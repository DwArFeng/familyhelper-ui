<template>
  <el-dialog
    class="user-view-of-permission-inspect-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    append-to-body
    destroy-on-close
    title="权限用户视图查看"
    align-center
    width="55vw"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="body-wrapper" v-loading="loading">
      <el-tabs class="tabs-panel" v-model="activeTabName" tab-position="left">
        <el-tab-pane label="匹配用户" name="matched">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <el-input
                  class="id-search-bar"
                  v-model="matchedUsersSearchValue"
                  clearable
                  placeholder="用户ID模糊匹配"
                  @keydown.enter="handleMatchedUsersFilter"
                  @clear="handleMatchedUsersFilter"
                  @input="handleMatchedUsersFilter"
                >
                  <template v-slot:prepend>
                    <span>用户ID</span>
                  </template>
                  <template v-slot:append>
                    <el-button :icon="SearchIcon" @click="handleMatchedUsersFilter" />
                  </template>
                </el-input>
              </div>
            </template>
            <template v-slot:default>
              <table-panel
                class="table"
                v-model:current-page="matchedUsersTableCurrentPage"
                v-model:page-size="matchedUsersTablePageSize"
                pagination-adjust-strategy="FORCE_COMPACT"
                :item-count="matchedUsersTableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="matchedUsersTableItems"
                :operate-column-visible="false"
                :show-contextmenu="false"
                @onPagingAttributeChanged="handleMatchedUsersPagingAttributeChanged"
              >
                <template v-slot:default>
                  <el-table-column prop="key.string_id" label="用户ID" show-overflow-tooltip />
                  <el-table-column prop="remark" label="备注" show-overflow-tooltip />
                </template>
              </table-panel>
            </template>
          </header-layout-panel>
        </el-tab-pane>
        <el-tab-pane label="已接受角色" name="accepted">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <el-input
                  class="id-search-bar"
                  v-model="acceptedRolesSearchValue"
                  clearable
                  placeholder="角色ID模糊匹配"
                  @keydown.enter="handleAcceptedRolesFilter"
                  @clear="handleAcceptedRolesFilter"
                  @input="handleAcceptedRolesFilter"
                >
                  <template v-slot:prepend>
                    <span>角色ID</span>
                  </template>
                  <template v-slot:append>
                    <el-button :icon="SearchIcon" @click="handleAcceptedRolesFilter" />
                  </template>
                </el-input>
              </div>
            </template>
            <template v-slot:default>
              <table-panel
                class="table"
                v-model:current-page="acceptedRolesTableCurrentPage"
                v-model:page-size="acceptedRolesTablePageSize"
                pagination-adjust-strategy="FORCE_COMPACT"
                :item-count="acceptedRolesTableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="acceptedRolesTableItems"
                :operate-column-visible="false"
                :show-contextmenu="false"
                @onPagingAttributeChanged="handleAcceptedRolesPagingAttributeChanged"
              >
                <template v-slot:default>
                  <el-table-column prop="key.string_id" label="角色ID" show-overflow-tooltip />
                  <el-table-column prop="name" label="名称" show-overflow-tooltip />
                  <el-table-column prop="remark" label="备注" show-overflow-tooltip />
                </template>
              </table-panel>
            </template>
          </header-layout-panel>
        </el-tab-pane>
        <el-tab-pane label="已拒绝角色" name="rejected">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <el-input
                  class="id-search-bar"
                  v-model="rejectedRolesSearchValue"
                  clearable
                  placeholder="角色ID模糊匹配"
                  @keydown.enter="handleRejectedRolesFilter"
                  @clear="handleRejectedRolesFilter"
                  @input="handleRejectedRolesFilter"
                >
                  <template v-slot:prepend>
                    <span>角色ID</span>
                  </template>
                  <template v-slot:append>
                    <el-button :icon="SearchIcon" @click="handleRejectedRolesFilter" />
                  </template>
                </el-input>
              </div>
            </template>
            <template v-slot:default>
              <table-panel
                class="table"
                v-model:current-page="rejectedRolesTableCurrentPage"
                v-model:page-size="rejectedRolesTablePageSize"
                pagination-adjust-strategy="FORCE_COMPACT"
                :item-count="rejectedRolesTableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="rejectedRolesTableItems"
                :operate-column-visible="false"
                :show-contextmenu="false"
                @onPagingAttributeChanged="handleRejectedRolesPagingAttributeChanged"
              >
                <template v-slot:default>
                  <el-table-column prop="key.string_id" label="角色ID" show-overflow-tooltip />
                  <el-table-column prop="name" label="名称" show-overflow-tooltip />
                  <el-table-column prop="remark" label="备注" show-overflow-tooltip />
                </template>
              </table-panel>
            </template>
          </header-layout-panel>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button @click="watchedVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
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

// 匹配用户表格 - 前端分页
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

// 已接受角色表格 - 前端分页
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

// 已拒绝角色表格 - 前端分页
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

// endregion

// region 对话框事件

function handleOpen(): void {
  handleSearch()
}

function handleClose(): void {
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.body-wrapper {
  width: 100%;
  height: 60vh;
}

.tabs-panel {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tabs__content) {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  min-height: 200px;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
