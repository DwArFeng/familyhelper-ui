<template>
  <el-dialog
    class="account-role-attach-dialog-container"
    v-model="watchedVisible"
    append-to-body
    destroy-on-close
    title="添加角色"
    width="80%"
    top="6vh"
    :close-on-click-modal="false"
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
        <el-table-column prop="key.string_id" label="角色ID" show-overflow-tooltip />
        <el-table-column prop="name" label="显示名称" show-overflow-tooltip />
      </template>
    </table-panel>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button @click="handleCancelButtonClicked">取消</el-button>
        <el-button
          type="primary"
          :disabled="roleSelection.length === 0"
          @click="handleConfirmButtonClicked"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

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
      roleSelection.value = []
      fetchRoles()
    }
  },
)

// endregion

// region 表格逻辑

const { currentPage, pageSize, itemCount, items, pagingInfo, updateByLookup } =
  useIdentityBackendPagingTablePanel<Role>(15)

const roleSelection = ref<Role[]>([])

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

function handleSelectionChanged(selection: Role[]): void {
  roleSelection.value = selection
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  if (roleSelection.value.length === 0) {
    return
  }
  emit('onAttached', roleSelection.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
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
