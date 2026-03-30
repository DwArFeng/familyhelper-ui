<template>
  <div class="account-protector-info-panel-container">
    <placeholder-panel v-if="accountId === ''" text="请选择用户" />
    <div v-else class="main-container">
      <loading-overlay :loading="loading > 0" />
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="primary" :disabled="readonly" @click="handleSaveProtectorInfo">
              保存保护器设置
            </native-button>
            <native-button kind="success" :disabled="readonly" @click="handleProtectorInfoSearch">
              刷新
            </native-button>
            <span class="header-sep" aria-hidden="true" />
            <native-button
              kind="primary"
              :disabled="readonly || applyChangesButtonDisabled"
              @click="handleApplyChanges"
            >
              应用变更
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
          <native-form class="form" :model="protectorInfoFormItem" label-width="60px">
            <native-form-item label="类型" :error="typeFieldError">
              <div class="type-row">
                <input
                  v-model="protectorInfoFormItem.type"
                  class="form-input"
                  type="text"
                  :readonly="readonly"
                />
                <native-button
                  kind="primary"
                  :disabled="readonly"
                  @click="accountProtectorSupportSelectDialogVisible = true"
                >
                  选择
                </native-button>
              </div>
            </native-form-item>
            <native-form-item class="form-item-grow" label="参数">
              <textarea
                v-model="protectorInfoFormItem.param"
                class="text-area"
                :readonly="readonly"
                spellcheck="false"
              />
            </native-form-item>
            <native-form-item label="备注">
              <input
                v-model="protectorInfoFormItem.remark"
                class="form-input"
                type="text"
                :readonly="readonly"
              />
            </native-form-item>
          </native-form>
        </template>
      </header-layout-panel>
    </div>
    <account-protector-support-select-dialog
      v-model:visible="accountProtectorSupportSelectDialogVisible"
      @on-confirmed="handleAccountProtectorSupportSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'

import AccountProtectorSupportSelectDialog from '@/views/nodes/comvisual/systemSettings/accountProtectorSupport/AccountProtectorSupportSelectDialog.vue'
import { type ProtectorSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { exists as protectorSupportExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import {
  exists as existsProtectorInfo,
  get as getProtectorInfo,
  insert as insertProtectorInfo,
  update as updateProtectorInfo,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorInfo.ts'
import { resetProtect } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/reset.ts'
import { resolveResponse } from '@/util/response.ts'

import { notifySuccess } from '@/library/modules/comvisual/util/nativeUi.ts'

defineOptions({
  name: 'AccountProtectorInfoPanel',
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
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 应用变更

const applyChangesButtonDisabled = ref<boolean>(false)

async function handleApplyChanges(): Promise<void> {
  applyChangesButtonDisabled.value = true
  try {
    await resolveResponse(resetProtect())
    notifySuccess('变更应用成功！后台状态刷新中，请不要频繁点击')
  } finally {
    setTimeout(() => {
      applyChangesButtonDisabled.value = false
    }, 3000)
  }
}

// endregion

// region 搜索逻辑

watch(
  () => props.accountId,
  () => {
    handleProtectorInfoSearch()
  },
)

function handleProtectorInfoSearch(): void {
  if (props.accountId === '') {
    return
  }
  handleInspectProtectorInfo()
}

async function handleInspectProtectorInfo(): Promise<void> {
  const accountId: string = props.accountId
  if (accountId === '') {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loading.value += 1
  try {
    const exists = await resolveResponse(existsProtectorInfo({ string_id: accountId }))
    if (!exists) {
      protectorInfoFormItem.value.type = ''
      protectorInfoFormItem.value.param = ''
      protectorInfoFormItem.value.remark = ''
      return
    }
    const protectorInfo = await resolveResponse(getProtectorInfo({ string_id: accountId }))
    protectorInfoFormItem.value.type = protectorInfo.type
    protectorInfoFormItem.value.param = protectorInfo.param
    protectorInfoFormItem.value.remark = protectorInfo.remark
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleProtectorInfoSearch()
})

// endregion

// region 保护器信息表单

type ProtectorInfoFormItem = {
  type: string
  param: string
  remark: string
}

const protectorInfoFormItem = ref<ProtectorInfoFormItem>({
  type: '',
  param: '',
  remark: '',
})

const typeFieldError = ref<string>('')

async function validateType(): Promise<boolean> {
  typeFieldError.value = ''
  const t = protectorInfoFormItem.value.type.trim()
  if (t === '') {
    typeFieldError.value = '保护器类型不能为空'
    return false
  }
  const ok = await resolveResponse(protectorSupportExists({ string_id: t }))
  if (!ok) {
    typeFieldError.value = '不支持的账户保护器类型'
    return false
  }
  return true
}

async function handleSaveProtectorInfo(): Promise<void> {
  const accountId: string = props.accountId
  if (accountId === '') {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (!(await validateType())) {
    return
  }
  loading.value += 1
  try {
    const exists = await resolveResponse(existsProtectorInfo({ string_id: accountId }))
    if (exists) {
      await resolveResponse(
        updateProtectorInfo({
          key: { string_id: accountId },
          type: protectorInfoFormItem.value.type,
          param: protectorInfoFormItem.value.param,
          remark: protectorInfoFormItem.value.remark,
        }),
      )
    } else {
      await resolveResponse(
        insertProtectorInfo({
          key: { string_id: accountId },
          type: protectorInfoFormItem.value.type,
          param: protectorInfoFormItem.value.param,
          remark: protectorInfoFormItem.value.remark,
        }),
      )
    }
    notifySuccess('保护器设置更新成功')
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 账户保护器支持选择对话框

const accountProtectorSupportSelectDialogVisible = ref<boolean>(false)

async function handleAccountProtectorSupportSelected(
  protectorSupport: ProtectorSupport,
): Promise<void> {
  protectorInfoFormItem.value.type = protectorSupport.key.string_id
  protectorInfoFormItem.value.param = protectorSupport.example_param
  await validateType()
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion
</script>

<style scoped>
.account-protector-info-panel-container {
  position: relative;
  height: 100%;
  width: 100%;
  background: #ffffff;
}

.main-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.header-sep {
  display: inline-block;
  width: 1px;
  height: 18px;
  background: #dcdfe6;
}

.header-spacer {
  flex: 1;
  min-width: 8px;
}

.form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
  box-sizing: border-box;
}

.form-item-grow {
  height: 0;
  flex-grow: 1;
  min-height: 120px;
}

/*noinspection CssUnusedSymbol*/
.form-item-grow :deep(.native-form-item__content) {
  height: 100%;
}

.type-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.form-input {
  width: 100%;
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
}

.text-area {
  width: 100%;
  height: 100%;
  min-height: 120px;
  box-sizing: border-box;
  padding: 8px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: none;
}
</style>
