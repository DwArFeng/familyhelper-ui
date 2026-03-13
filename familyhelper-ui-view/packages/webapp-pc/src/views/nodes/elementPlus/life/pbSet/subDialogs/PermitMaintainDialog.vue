<template>
  <el-dialog
    class="permit-maintain-dialog-container"
    v-model="watchedVisible"
    id="dialog"
    append-to-body
    destroy-on-close
    title="权限管理"
    top="6vh"
    :close-on-click-modal="false"
  >
    <header-layout-panel class="dialog-container" v-loading="loading">
      <template v-slot:header>
        <div class="header-container">
          <el-form class="header-form" :inline="true" :model="form">
            <el-form-item class="header-form-item" label="用户">
              <account-selector
                v-model="form.userId"
                :filter="(d) => d.key.string_id !== lnpStore.me"
              />
            </el-form-item>
            <el-form-item class="header-form-item" label="权限等级">
              <el-select v-model="form.permissionLevel" placeholder="权限等级">
                <el-option
                  v-for="indicator in formPermissionLevelIndicator"
                  :key="indicator.key"
                  :label="indicator.label"
                  :value="indicator.key"
                  :disabled="!indicator.selectable"
                />
              </el-select>
            </el-form-item>
            <el-form-item class="header-form-item">
              <el-button type="primary" :disabled="form.userId === ''" @click="handlePopbUpsert">
                添加/更改
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table-container"
          v-model:current-page="popbTableCurrentPage"
          v-model:page-size="popbTablePageSize"
          :item-count="popbTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="popbTableItems"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="53"
          @onPagingAttributeChanged="handlePopbTablePagingAttributeChanged"
        >
          <template v-slot:default>
            <el-table-column
              prop="account"
              label="用户"
              show-overflow-tooltip
              :formatter="accountFormatter"
            />
            <el-table-column
              prop="permission_level"
              label="权限等级"
              show-overflow-tooltip
              width="85px"
              :formatter="permissionLevelFormatter"
            />
          </template>
          <template v-slot:operateColumn="{ row }">
            <el-button
              class="table-button"
              type="danger"
              :icon="DeleteIcon"
              :disabled="row.account.key.string_id === lnpStore.me"
              @click="handlePopbDelete(row as DispPopb)"
            />
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button @click="watchedVisible = false"> 关闭窗口</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import AccountSelector from '@/views/nodes/elementPlus/systemSettings/account/AccountSelector.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import {
  type DispPopb,
  type PopbPermissionLevel,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/popb.ts'
import { childForPbSetDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/popb.ts'
import { type DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import {
  removePermission,
  upsertPermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbSet.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermitMaintainDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  pbSetId: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  pbSetId: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
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

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const form = ref<{
  userId: string
  permissionLevel: PopbPermissionLevel
}>({
  userId: '',
  permissionLevel: 1,
})
const formPermissionLevelIndicator = ref<
  { key: PopbPermissionLevel; label: string; selectable: boolean }[]
>([
  { key: 0, label: '所有者', selectable: false },
  { key: 1, label: '访客', selectable: true },
])

async function handlePopbUpsert(): Promise<void> {
  loading.value += 1
  try {
    if (!props.pbSetId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      upsertPermission({
        pb_set_key: { long_id: props.pbSetId },
        user_key: { string_id: form.value.userId },
        permission_level: form.value.permissionLevel,
      }),
    )
    handlePopbSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------个人最佳集合权限查询-----------------------------------------------------------
watch(
  () => props.pbSetId,
  (value) => {
    if (!value) {
      return
    }
    handlePopbSearch()
  },
)

function handlePopbSearch(): void {
  if (!props.pbSetId) {
    return
  }
  handlePopbChildForPbSetSearch()
}

async function handlePopbChildForPbSetSearch(): Promise<void> {
  loading.value += 1
  try {
    if (!props.pbSetId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForPbSetDisp({ long_id: props.pbSetId }, pagingInfo),
      popbTablePagingInfo.value,
    )
    updatePopbTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handlePopbSearch()
})

// -----------------------------------------------------------个人最佳集合权限表格处理-----------------------------------------------------------
const {
  currentPage: popbTableCurrentPage,
  pageSize: popbTablePageSize,
  itemCount: popbTableItemCount,
  items: popbTableItems,
  pagingInfo: popbTablePagingInfo,
  updateByLookup: updatePopbTableByLookup,
} = useIdentityBackendPagingTablePanel<DispPopb>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function accountFormatter(row: DispPopb, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const account: DispAccount = (row as any)[column.property] as DispAccount
  return `${account.display_name}(${account.key.string_id})`
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function permissionLevelFormatter(row: DispPopb, column: any): string {
  for (let i = 0; i < formPermissionLevelIndicator.value.length; i += 1) {
    const indicator = formPermissionLevelIndicator.value[i]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (indicator.key === (row as any)[column.property]) {
      return indicator.label
    }
  }
  return '（未知）'
}

function handlePopbTablePagingAttributeChanged(): void {
  handlePopbSearch()
}

async function handlePopbDelete(row: DispPopb): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `此操作将删除 ${row.account.display_name}(${row.account.key.string_id}) 对该个人最佳集合的权限。<br>是否继续?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  loading.value += 1
  try {
    if (!props.pbSetId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      removePermission({
        pb_set_key: { long_id: props.pbSetId },
        user_key: { string_id: row.key.user_string_id },
      }),
    )
    ElMessage({
      showClose: true,
      message: '权限删除成功',
      type: 'success',
    })
    handlePopbSearch()
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 68vh;
}

.header-container {
  width: 100%;
}

.header-form {
  display: flex;
}

/*noinspection CssUnusedSymbol*/
.header-form :deep(.el-form-item__content) {
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.header-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.header-form-item {
  display: flex;
}

.header-form-item:first-child {
  width: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.header-form-item:nth-child(2) :deep(.el-form-item__content) {
  width: 100px;
}

.header-form-item:last-child {
  margin-right: 0;
}

.table-container {
  width: 100%;
}

.table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}
</style>
