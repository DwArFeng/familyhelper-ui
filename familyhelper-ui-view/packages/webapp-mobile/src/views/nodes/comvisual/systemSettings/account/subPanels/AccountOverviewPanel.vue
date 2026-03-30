<template>
  <div class="account-overview-panel-container">
    <placeholder-panel v-if="accountId === ''" text="请选择用户" />
    <div v-else class="main-container">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="primary" :disabled="readonly" @click="handleShowEditDialog">
              编辑用户
            </native-button>
            <native-button
              kind="warning"
              :disabled="readonly"
              @click="handleShowPasswordResetDialog"
            >
              重置密码
            </native-button>
            <native-button kind="success" :disabled="readonly" @click="handleSearch">
              刷新数据
            </native-button>
            <span class="header-spacer" />
            <native-button
              v-if="mode === 'DEFAULT'"
              title="弹出"
              @click="handlePanelFloatyButtonClicked"
            >
              弹出
            </native-button>
          </div>
        </template>
        <template v-slot:default>
          <div class="scroll-bar">
            <div class="property-form">
              <div class="property-row">
                <span class="property-label">ID</span>
                <span class="property-value">{{ accountFormItem.string_id }}</span>
              </div>
              <div class="property-row">
                <span class="property-label">名称</span>
                <span class="property-value">{{ accountFormItem.name }}</span>
              </div>
              <div class="property-row">
                <span class="property-label">启用</span>
                <span class="property-value">{{ formatBoolean(accountFormItem.enabled) }}</span>
              </div>
              <div class="property-row property-row--full">
                <span class="property-label">备注</span>
                <span class="property-value">{{ accountFormItem.remark }}</span>
              </div>
              <div class="property-row property-row--full">
                <span class="property-label">显示名称</span>
                <span class="property-value">{{ accountFormItem.display_name }}</span>
              </div>
            </div>
          </div>
        </template>
      </header-layout-panel>
    </div>
    <account-edit-dialog
      v-model:visible="accountEditDialogVisible"
      :account-id="accountId"
      :initial-item="accountFormItemForEdit"
      @on-updated="handleAccountUpdated"
    />
    <account-password-reset-dialog
      v-model:visible="accountPasswordResetDialogVisible"
      :account-id="accountId"
      @on-reset="handlePasswordReset"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'

import { inspectDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

import AccountEditDialog from '../subDialogs/AccountEditDialog.vue'
import AccountPasswordResetDialog from '../subDialogs/AccountPasswordResetDialog.vue'

defineOptions({
  name: 'AccountOverviewPanel',
})

// region Props 定义

type Props = {
  accountId: string
  readonly?: boolean
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  mode: 'DEFAULT',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onAccountPropertyUpdated'): void
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 账户查询

async function handleSearch(): Promise<void> {
  if (props.accountId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await resolveResponse(inspectDisp({ string_id: props.accountId }))
    accountFormItem.value.string_id = res.key.string_id
    accountFormItem.value.name = res.name
    accountFormItem.value.enabled = res.enabled
    accountFormItem.value.remark = res.remark
    accountFormItem.value.display_name = res.display_name
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.accountId,
  () => {
    handleSearch()
  },
)

onMounted(() => {
  handleSearch()
})

// endregion

// region 账户表单

type AccountFormItem = {
  string_id: string
  name: string
  enabled: boolean
  remark: string
  display_name: string
}

const accountFormItem = ref<AccountFormItem>({
  string_id: '',
  name: '',
  enabled: false,
  remark: '',
  display_name: '',
})

const accountFormItemForEdit = computed(() => {
  const item = accountFormItem.value
  if (item.string_id === '') {
    return null
  }
  return {
    key: { string_id: item.string_id },
    name: item.name,
    enabled: item.enabled,
    remark: item.remark,
    display_name: item.display_name,
  }
})

function formatBoolean(value: boolean): string {
  return value ? '是' : '否'
}

// endregion

// region 对话框

const accountEditDialogVisible = ref<boolean>(false)
const accountPasswordResetDialogVisible = ref<boolean>(false)

function handleShowEditDialog(): void {
  accountEditDialogVisible.value = true
}

function handleShowPasswordResetDialog(): void {
  accountPasswordResetDialogVisible.value = true
}

function handleAccountUpdated(): void {
  emit('onAccountPropertyUpdated')
  handleSearch()
}

function handlePasswordReset(): void {
  handleSearch()
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 方法暴露

function accountSearch(): void {
  handleSearch()
}

defineExpose({
  accountSearch,
})

// endregion
</script>

<style scoped>
.account-overview-panel-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.header-spacer {
  flex: 1;
  min-width: 8px;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  padding: 8px;
  overflow: auto;
  max-height: 100%;
}

.property-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: calc(33% - 8px);
  min-width: 160px;
}

.property-row--full {
  width: 100%;
}

.property-label {
  flex-shrink: 0;
  width: 80px;
  font-size: 14px;
  color: #99a9bf;
  line-height: 1.4;
}

.property-value {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #303133;
  word-break: break-word;
}

.scroll-bar {
  box-sizing: border-box;
}
</style>
