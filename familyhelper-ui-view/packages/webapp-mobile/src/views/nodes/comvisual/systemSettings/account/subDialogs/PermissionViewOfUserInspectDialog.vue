<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="用户权限视图查看"
    align-center
    width="55vw"
    :close-on-click-modal="false"
  >
    <div class="body-wrapper">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel class="dialog-main-panel">
        <template v-slot:header>
          <div class="header-container">
            <permission-scope-indicator @on-changed="handlePermissionScopeIndicatorChanged" />
          </div>
        </template>
        <template v-slot:default>
          <placeholder-panel v-if="scopeIndicatorValue === null" text="请选择权限作用域" />
          <div v-else class="dialog-body-inner">
            <native-tabs v-model="activeTabName" class="tabs-panel">
              <native-tab-pane name="matched" label="匹配权限">
                <header-layout-panel class="tab-panel">
                  <template v-slot:header>
                    <div class="header-container">
                      <div class="id-search-row">
                        <input-group class="id-search-bar">
                          <template v-slot:prepend>权限ID</template>
                          <input
                            v-model="matchedPermissionsSearchValue"
                            type="text"
                            placeholder="权限ID模糊匹配"
                            @input="handleMatchedPermissionsFilter"
                            @keyup.enter="handleMatchedPermissionsFilter"
                          />
                        </input-group>
                        <native-button
                          size="small"
                          kind="primary"
                          @click="handleMatchedPermissionsFilter"
                        >
                          筛选
                        </native-button>
                      </div>
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
                      :highlight-current-row="false"
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
              <native-tab-pane name="role_details" label="角色明细">
                <div class="role-details-pane">
                  <template v-if="roleDetailsItems.length > 0">
                    <label class="role-select">
                      <span class="role-select-label">角色</span>
                      <select v-model="activeRoleTabName" class="role-select-input">
                        <option
                          v-for="item in roleDetailsItems"
                          :key="item.role.key.string_id"
                          :value="item.role.key.string_id"
                        >
                          {{ roleTabTitle(item) }}
                        </option>
                      </select>
                    </label>
                    <permission-view-of-user-inspect-role-detail-block
                      v-for="item in roleDetailsItems"
                      v-show="activeRoleTabName === item.role.key.string_id"
                      :key="item.role.key.string_id"
                      :detail="item"
                    />
                  </template>
                  <div v-else class="role-details-empty">暂无角色明细</div>
                </div>
              </native-tab-pane>
            </native-tabs>
          </div>
        </template>
      </header-layout-panel>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <native-button @click="watchedVisible = false">关闭</native-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import InputGroup from '@/components/comvisual/form/inputGroup/InputGroup.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import PermissionScopeIndicator from '@/views/nodes/comvisual/systemSettings/permissionScope/PermissionScopeIndicator.vue'
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
</script>

<style scoped>
.body-wrapper {
  position: relative;
  width: 100%;
  height: 70vh;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
}

.dialog-main-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-body-inner {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.tabs-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
}

.tab-panel {
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
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
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.role-details-pane {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-select {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.role-select-label {
  flex-shrink: 0;
  font-size: 14px;
}

.role-select-input {
  min-width: 200px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.role-details-empty {
  width: 100%;
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
