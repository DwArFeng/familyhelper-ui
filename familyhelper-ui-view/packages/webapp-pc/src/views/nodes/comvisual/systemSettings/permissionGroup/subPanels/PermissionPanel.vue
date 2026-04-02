<template>
  <div class="permission-panel-container">
    <placeholder-panel v-if="permissionGroupKey === null" text="请选择权限组" />
    <div v-else class="center-container">
      <div v-if="currentPermissionGroup !== null" class="detail-block">
        <div class="detail-row">
          <div class="detail-field">
            <span class="detail-label">权限组ID</span>
            <span class="detail-value">{{
              currentPermissionGroup.key.permission_group_string_id
            }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">父权限组ID</span>
            <span class="detail-value">{{
              currentPermissionGroup.parent === null
                ? '（根节点）'
                : currentPermissionGroup.parent.key.permission_group_string_id
            }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-field detail-field--full">
            <span class="detail-label">名称</span>
            <span class="detail-value">{{ currentPermissionGroup.name }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-field detail-field--full">
            <span class="detail-label">备注</span>
            <span class="detail-value">{{ currentPermissionGroup.remark }}</span>
          </div>
        </div>
      </div>
      <section-divider />
      <paging-table-panel
        class="permission-table-panel"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :item-count="itemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="items"
        :operate-column-visible="false"
        :inspect-button-visible="false"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :selection-column-visible="true"
        :selected-keys="selectedKeys"
        :row-key="permissionRowKey"
        @on-paging-attribute-changed="handlePagingAttributeChanged"
        @on-selection-change="handleTableSelectionChange"
      >
        <paging-table-column label="权限节点" prop="key.permission_string_id" :min-width="160" />
        <paging-table-column label="名称" prop="name" :min-width="120" />
        <paging-table-column label="备注" prop="remark" :min-width="140" />
      </paging-table-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import SectionDivider from '@/components/comvisual/form/divider/sectionDivider/SectionDivider.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { type PermissionGroupKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/key.ts'
import {
  childForGroupDisp,
  type DispPermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import {
  type DispPermissionGroup,
  getDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permissionGroup.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionPanel',
})

// region Props 定义

type Props = {
  permissionGroupKey: PermissionGroupKey | null
  scopeId: string
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'onSelectionChanged', selection: DispPermission[]): void
}

const emit = defineEmits<Emits>()

// endregion

// region 详情逻辑

const currentPermissionGroup = ref<DispPermissionGroup | null>(null)

async function fetchPermissionGroup(): Promise<void> {
  if (props.permissionGroupKey === null) {
    currentPermissionGroup.value = null
    return
  }
  currentPermissionGroup.value = await resolveResponse(
    getDisp(
      props.permissionGroupKey.scope_string_id,
      props.permissionGroupKey.permission_group_string_id,
    ),
  )
}

// endregion

// region 表格逻辑

const { currentPage, pageSize, itemCount, items, pagingInfo, updateByLookup } =
  useIdentityBackendPagingTablePanel<DispPermission>(15)

const selectedKeys = ref<(string | number)[]>([])

function permissionRowKey(row: DispPermission): string {
  return `${row.key.scope_string_id}::${row.key.permission_string_id}`
}

async function fetchPermissions(): Promise<void> {
  if (props.permissionGroupKey === null) {
    return
  }
  selectedKeys.value = []
  emit('onSelectionChanged', [])
  const res = await lookupWithAdjustPage(
    (p) => childForGroupDisp(props.permissionGroupKey!, p),
    pagingInfo.value,
  )
  updateByLookup(res)
}

function handlePagingAttributeChanged(): void {
  fetchPermissions()
}

function handleTableSelectionChange(keys: (string | number)[]): void {
  selectedKeys.value = keys
  const selected = items.value.filter((row) => keys.includes(permissionRowKey(row)))
  emit('onSelectionChanged', selected)
}

// endregion

// region expose

function refresh(): void {
  fetchPermissionGroup()
  fetchPermissions()
}

defineExpose({
  refresh,
})

// endregion

// region watch

watch(
  () => props.permissionGroupKey,
  (newKey) => {
    if (newKey === null) {
      currentPermissionGroup.value = null
      return
    }
    fetchPermissionGroup()
    fetchPermissions()
  },
  { immediate: true },
)

// endregion
</script>

<style scoped>
.permission-panel-container {
  width: 100%;
  height: 100%;
}

.center-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.detail-block {
  flex-shrink: 0;
  padding: 4px 0;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.detail-field {
  flex: 1 1 45%;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.detail-field--full {
  flex: 1 1 100%;
}

.detail-label {
  flex: 0 0 100px;
  color: #99a9bf;
  font-size: 14px;
  line-height: 1.4;
}

.detail-value {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-table-panel {
  flex-grow: 1;
  min-height: 0;
}
</style>
