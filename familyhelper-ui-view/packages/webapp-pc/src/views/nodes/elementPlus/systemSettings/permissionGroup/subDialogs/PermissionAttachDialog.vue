<template>
  <el-dialog
    class="permission-attach-dialog-container"
    v-model="watchedVisible"
    append-to-body
    destroy-on-close
    title="关联权限节点"
    width="80%"
    top="6vh"
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
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
    <template v-slot:footer>
      <div class="footer-container">
        <el-button
          type="primary"
          :disabled="permissionSelection.length === 0"
          @click="handleConfirmButtonClicked"
        >
          关联
        </el-button>
        <el-button @click="handleCancelButtonClicked">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import { type PermissionGroupKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/key.ts'
import {
  childForScopeDisp,
  type DispPermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'PermissionAttachDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  scopeId: string
  currentGroupKey: PermissionGroupKey | null
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', permissions: DispPermission[]): void
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

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region Props 监听

watch(
  () => [props.visible, props.scopeId] as const,
  ([visible, scopeId]) => {
    if (visible && scopeId !== '') {
      permissionSelection.value = []
      fetchPermissions()
    }
  },
)

// endregion

// region 表格逻辑

const { currentPage, pageSize, itemCount, items, pagingInfo, updateByLookup } =
  useIdentityBackendPagingTablePanel<DispPermission>(15)

const permissionSelection = ref<DispPermission[]>([])

async function fetchPermissions(): Promise<void> {
  if (props.scopeId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (p) => childForScopeDisp({ string_id: props.scopeId }, p),
      pagingInfo.value,
    )
    updateByLookup(res)
  } finally {
    loading.value -= 1
  }
}

function handlePagingAttributeChanged(): void {
  fetchPermissions()
}

function handleSelectionChanged(selection: DispPermission[]): void {
  permissionSelection.value = selection
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  if (permissionSelection.value.length === 0) {
    return
  }
  emit('onConfirmed', permissionSelection.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (permissionSelection.value.length === 0) {
    return
  }
  emit('onConfirmed', permissionSelection.value)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table {
  height: 70vh;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
