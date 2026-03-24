<template>
  <el-dialog
    class="permission-view-of-user-inspect-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    append-to-body
    destroy-on-close
    title="用户权限视图查看"
    align-center
    width="55vw"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="body-wrapper" v-loading="loading">
      <header-layout-panel class="dialog-main-panel">
        <template v-slot:header>
          <div class="header-container">
            <permission-scope-indicator @onChanged="handlePermissionScopeIndicatorChanged" />
          </div>
        </template>
        <template v-slot:default>
          <placeholder-panel v-if="scopeIndicatorValue === null" text="请选择权限作用域" />
          <div v-else class="dialog-body-inner">
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
              <el-tab-pane label="角色明细" name="role_details">
                <div class="role-details-pane">
                  <el-tabs
                    class="role-details-inner-tabs"
                    v-if="roleDetailsItems.length > 0"
                    v-model="activeRoleTabName"
                    type="card"
                  >
                    <el-tab-pane
                      v-for="item in roleDetailsItems"
                      :key="item.role.key.string_id"
                      :name="item.role.key.string_id"
                    >
                      <template v-slot:label>
                        <span class="role-tab-label" :title="roleTabTitle(item)">{{
                          roleTabTitle(item)
                        }}</span>
                      </template>
                      <permission-view-of-user-inspect-role-detail-block :detail="item" />
                    </el-tab-pane>
                  </el-tabs>
                  <div v-else class="role-details-empty">暂无角色明细</div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </template>
      </header-layout-panel>
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

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import PermissionScopeIndicator from '@/views/nodes/elementPlus/systemSettings/permissionScope/PermissionScopeIndicator.vue'
import PermissionViewOfUserInspectRoleDetailBlock from '../subPanels/PermissionViewOfUserInspectRoleDetailBlock.vue'

import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import {
  inspectPermissionViewOfUser,
  type PermissionViewOfUserInspectResultRoleDetail,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/inspect.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionViewOfUserInspectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  accountId: string
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

// region 作用域

const scopeIndicatorValue = ref<Scope | null>(null)

function handlePermissionScopeIndicatorChanged(value: Scope | null): void {
  scopeIndicatorValue.value = value
}

// endregion

// region 数据

const activeTabName = ref<string>('matched')

const matchedPermissionsSearchValue = ref<string>('')

const matchedPermissionsRaw = ref<Permission[]>([])

const roleDetailsItems = ref<PermissionViewOfUserInspectResultRoleDetail[]>([])

/** 角色明细内横向 Tab 当前选中的角色 ID */
const activeRoleTabName = ref<string>('')

function roleTabTitle(item: PermissionViewOfUserInspectResultRoleDetail): string {
  return `${item.role.name} (${item.role.key.string_id})`
}

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

function clearInspectResult(): void {
  matchedPermissionsRaw.value = []
  matchedPermissionsTableUpdateByLookup(
    filterPermissionsByPattern(matchedPermissionsRaw.value, matchedPermissionsSearchValue.value),
  )
  roleDetailsItems.value = []
  activeRoleTabName.value = ''
}

// endregion

// region 搜索

async function handleSearch(): Promise<void> {
  if (!scopeIndicatorValue.value || props.accountId === '') {
    return
  }
  loading.value += 1
  try {
    const result = await resolveResponse(
      inspectPermissionViewOfUser({
        scoped_user_key: {
          scope_string_id: scopeIndicatorValue.value.key.string_id,
          user_string_id: props.accountId,
        },
        detail_mode: true,
      }),
    )
    matchedPermissionsRaw.value = result.matched_permissions ?? []
    matchedPermissionsTableUpdateByLookup(
      filterPermissionsByPattern(matchedPermissionsRaw.value, matchedPermissionsSearchValue.value),
    )
    const details = result.role_details ?? []
    roleDetailsItems.value = details
    if (details.length > 0) {
      activeRoleTabName.value = details[0].role.key.string_id
    } else {
      activeRoleTabName.value = ''
    }
  } finally {
    loading.value -= 1
  }
}

watch(
  () => scopeIndicatorValue.value,
  (neo) => {
    if (neo === null) {
      if (watchedVisible.value) {
        clearInspectResult()
      }
      return
    }
    if (watchedVisible.value) {
      handleSearch()
    }
  },
)

watch(
  () => props.accountId,
  () => {
    if (watchedVisible.value && scopeIndicatorValue.value !== null) {
      handleSearch()
    }
  },
)

watch(
  () => watchedVisible.value,
  (vis) => {
    if (vis && scopeIndicatorValue.value !== null) {
      handleSearch()
    }
  },
)

// endregion

// region 对话框事件

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

.dialog-main-panel {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.dialog-body-inner {
  width: 100%;
  height: 100%;
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

.role-details-pane {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.role-details-inner-tabs {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.role-details-inner-tabs :deep(.el-tabs__content) {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.role-details-inner-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.role-tab-label {
  display: inline-block;
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
}

.role-details-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
