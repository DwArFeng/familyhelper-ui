<template>
  <div class="permission-panel-container">
    <placeholder-panel v-if="permissionGroupKey === null" text="请选择权限组" />
    <div class="center-container" v-else>
      <el-form
        v-if="currentPermissionGroup !== null"
        class="detail-form"
        label-position="left"
        label-width="100px"
        inline
      >
        <el-form-item label="权限组ID" style="width: 50%">
          {{ currentPermissionGroup.key.permission_group_string_id }}
        </el-form-item>
        <el-form-item label="父权限组ID" style="width: 50%">
          {{
            currentPermissionGroup.parent === null
              ? '（根节点）'
              : currentPermissionGroup.parent.key.permission_group_string_id
          }}
        </el-form-item>
        <el-form-item label="名称" style="width: 100%">
          {{ currentPermissionGroup.name }}
        </el-form-item>
        <el-form-item label="备注" style="width: 100%">
          {{ currentPermissionGroup.remark }}
        </el-form-item>
      </el-form>
      <el-divider class="divider" />
      <table-panel
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
        @onPagingAttributeChanged="handlePagingAttributeChanged"
        @onSelectionChanged="handleSelectionChanged"
      >
        <template v-slot:default>
          <el-table-column type="selection" width="55" />
          <el-table-column prop="key.permission_string_id" label="权限节点" show-overflow-tooltip />
          <el-table-column prop="name" label="名称" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </template>
      </table-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

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

async function fetchPermissions(): Promise<void> {
  if (props.permissionGroupKey === null) {
    return
  }
  const res = await lookupWithAdjustPage(
    (p) => childForGroupDisp(props.permissionGroupKey!, p),
    pagingInfo.value,
  )
  updateByLookup(res)
}

function handlePagingAttributeChanged(): void {
  fetchPermissions()
}

function handleSelectionChanged(selection: DispPermission[]): void {
  emit('onSelectionChanged', selection)
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

.detail-form {
  display: flex;
  flex-wrap: wrap;
}

.detail-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.detail-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.detail-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

.divider {
  margin: 15px 0;
}

.permission-table-panel {
  flex-grow: 1;
}
</style>
