<template>
  <modal-dialog v-model:visible="watchedVisible" title="添加角色" :close-on-click-modal="false">
    <loading-overlay :loading="loading > 0" />
    <paging-table-panel
      class="table"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :item-count="itemCount"
      :page-sizes="[15, 20, 30, 50]"
      :items="items"
      :operate-column-visible="false"
      :inspect-button-visible="false"
      :edit-button-visible="false"
      :delete-button-visible="false"
      :highlight-current-row="false"
      :selection-column-visible="true"
      :selected-keys="selectedKeys"
      :row-key="roleRowKey"
      @on-paging-attribute-changed="handlePagingAttributeChanged"
      @on-selection-change="handleSelectionChange"
    >
      <paging-table-column label="角色ID" prop="key.string_id" :min-width="160" />
      <paging-table-column label="显示名称" prop="name" :min-width="140" />
    </paging-table-panel>
    <template v-slot:footer>
      <div class="footer-container">
        <native-button @click="handleCancelButtonClicked">取消</native-button>
        <native-button
          kind="primary"
          :disabled="selectedRoles.length === 0"
          @click="handleConfirmButtonClicked"
        >
          确定
        </native-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import {
  type Role,
  notChildForUser,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/role.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'AccountRoleAttachDialog',
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
  (e: 'onAttached', roles: Role[]): void
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
  () => [props.visible, props.accountId] as const,
  ([visible, accountId]) => {
    if (visible && accountId !== '') {
      selectedKeys.value = []
      selectedRoleById.value = {}
      fetchRoles()
    }
  },
)

// endregion

// region 表格逻辑

const { currentPage, pageSize, itemCount, items, pagingInfo, updateByLookup } =
  useIdentityBackendPagingTablePanel<Role>(15)

const selectedKeys = ref<(string | number)[]>([])
/** 跨页保留已选角色 */
const selectedRoleById = ref<Record<string, Role>>({})

const selectedRoles = computed<Role[]>(() =>
  selectedKeys.value.map((k) => selectedRoleById.value[String(k)]).filter(Boolean),
)

function roleRowKey(row: Role): string {
  return row.key.string_id
}

async function fetchRoles(): Promise<void> {
  if (props.accountId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (p) => notChildForUser({ string_id: props.accountId }, p),
      pagingInfo.value,
    )
    updateByLookup(res)
  } finally {
    loading.value -= 1
  }
}

function handlePagingAttributeChanged(): void {
  fetchRoles()
}

function handleSelectionChange(keys: (string | number)[]): void {
  const keySet = new Set(keys.map(String))
  const next: Record<string, Role> = { ...selectedRoleById.value }
  for (const id of Object.keys(next)) {
    if (!keySet.has(id)) {
      delete next[id]
    }
  }
  for (const row of items.value) {
    const id = row.key.string_id
    if (keySet.has(id)) {
      next[id] = row
    }
  }
  selectedRoleById.value = next
  selectedKeys.value = keys
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const list = selectedRoles.value
  if (list.length === 0) {
    return
  }
  emit('onAttached', list)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table {
  height: 50vh;
  min-height: 200px;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
