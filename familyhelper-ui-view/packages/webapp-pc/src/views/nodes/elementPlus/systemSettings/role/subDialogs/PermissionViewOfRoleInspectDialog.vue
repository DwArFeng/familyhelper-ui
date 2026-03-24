<template>
  <el-dialog
    class="permission-view-of-role-inspect-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    append-to-body
    destroy-on-close
    title="角色权限视图查看"
    align-center
    width="55vw"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="body-wrapper" v-loading="loading">
      <el-tabs class="tabs-panel" v-model="activeTabName" tab-position="left">
        <el-tab-pane label="匹配权限" name="matched">
          <header-layout-panel class="tab-panel">
            <template v-slot:header>
              <div class="header-container">
                <el-input
                  class="id-search-bar"
                  v-model="matchedPermissionsSearchValue"
                  clearable
                  placeholder="权限ID模糊匹配"
                  @keydown.enter="handleMatchedPermissionsFilter"
                  @clear="handleMatchedPermissionsFilter"
                  @input="handleMatchedPermissionsFilter"
                >
                  <template v-slot:prepend>
                    <span>权限ID</span>
                  </template>
                  <template v-slot:append>
                    <el-button :icon="SearchIcon" @click="handleMatchedPermissionsFilter" />
                  </template>
                </el-input>
              </div>
            </template>
            <template v-slot:default>
              <table-panel
                class="table"
                v-model:current-page="matchedPermissionsTableCurrentPage"
                v-model:page-size="matchedPermissionsTablePageSize"
                pagination-adjust-strategy="FORCE_COMPACT"
                :item-count="matchedPermissionsTableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="matchedPermissionsTableItems"
                :operate-column-visible="false"
                :show-contextmenu="false"
                @onPagingAttributeChanged="handleMatchedPermissionsPagingAttributeChanged"
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
        <el-tab-pane label="已接受权限" name="accepted">
          <header-layout-panel class="tab-panel">
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
          <header-layout-panel class="tab-panel">
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
          <header-layout-panel class="tab-panel">
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

// 匹配权限表格 - 前端分页
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

// 已接受权限表格 - 前端分页
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

// 已拒绝权限表格 - 前端分页
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

// 全局拒绝权限表格 - 前端分页
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
