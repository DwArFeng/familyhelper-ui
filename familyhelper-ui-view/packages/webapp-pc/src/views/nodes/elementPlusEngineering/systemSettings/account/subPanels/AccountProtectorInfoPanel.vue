<template>
  <div class="account-protector-info-panel-container">
    <placeholder-panel
      v-if="accountId === ''"
      :text="t('views.element_plus_engineering.system_settings.please_select_user')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="readonly" @click="handleSaveProtectorInfo">
              {{ t('views.element_plus_engineering.system_settings.save_protector_settings') }}
            </el-button>
            <el-button type="success" :disabled="readonly" @click="handleProtectorInfoSearch">
              {{ t('views.element_plus_engineering.system_settings.refresh') }}
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="readonly || applyChangesButtonDisabled"
              @click="handleApplyChanges"
            >
              {{ t('views.element_plus_engineering.system_settings.apply_changes') }}
            </el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <el-form
            class="form"
            ref="formRef"
            label-position="right"
            label-width="60px"
            :model="protectorInfoFormItem"
            :rules="protectorInfoFormRules"
          >
            <el-form-item
              class="validated"
              :label="t('views.element_plus_engineering.system_settings.type')"
              prop="type"
            >
              <el-input v-model="protectorInfoFormItem.type">
                <template v-slot:append>
                  <el-button
                    :icon="SearchIcon"
                    :disabled="readonly"
                    @click="accountProtectorSupportSelectDialogVisible = true"
                  />
                </template>
              </el-input>
            </el-form-item>
            <el-form-item
              class="form-item-grow"
              :label="t('views.element_plus_engineering.system_settings.parameters')"
              prop="param"
            >
              <text-editor
                class="text-editor"
                v-model="protectorInfoFormItem.param"
                :readonly="readonly"
              />
            </el-form-item>
            <el-form-item
              :label="t('views.element_plus_engineering.system_settings.remark')"
              prop="remark"
            >
              <el-input v-model="protectorInfoFormItem.remark" :readonly="readonly" />
            </el-form-item>
          </el-form>
        </template>
      </header-layout-panel>
    </div>
    <account-protector-support-select-dialog
      v-model:visible="accountProtectorSupportSelectDialogVisible"
      @onConfirmed="handleAccountProtectorSupportSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElForm, ElMessage } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import AccountProtectorSupportSelectDialog from '@/views/nodes/elementPlusEngineering/systemSettings/accountProtectorSupport/AccountProtectorSupportSelectDialog.vue'
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

import { useI18n } from 'vue-i18n'

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

// region I18n 引入

const { t } = useI18n()

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
    ElMessage({
      showClose: true,
      message: t(
        'views.element_plus_engineering.system_settings.changes_applied_backend_refreshing',
      ),
      type: 'success',
    })
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
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
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

// region 头部面板

async function handleSaveProtectorInfo(): Promise<void> {
  const accountId: string = props.accountId
  if (accountId === '') {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  const form = formRef.value
  if (!form) {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  try {
    await form.validate()
  } catch {
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
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.system_settings.protector_settings_updated'),
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

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
const protectorInfoFormTypeValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(
          new Error(t('views.element_plus_engineering.system_settings.protector_type_required')),
        )
        return Promise.reject()
      }
      return resolveResponse(protectorSupportExists({ string_id: res }))
    })
    .then((res) => {
      if (!res) {
        callback(
          new Error(
            t('views.element_plus_engineering.system_settings.unsupported_account_protector_type'),
          ),
        )
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const protectorInfoFormRules = ref({
  type: [{ required: true, validator: protectorInfoFormTypeValidator, trigger: 'blur' }],
})

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef')

// endregion

// region 账户保护器支持选择对话框

const accountProtectorSupportSelectDialogVisible = ref<boolean>(false)

function handleAccountProtectorSupportSelected(protectorSupport: ProtectorSupport): void {
  protectorInfoFormItem.value.type = protectorSupport.key.string_id
  protectorInfoFormItem.value.param = protectorSupport.example_param
  const form = formRef.value
  if (!form) {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  form.validate()
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion
</script>

<style scoped>
.account-protector-info-panel-container {
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
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form .form-item-grow {
  height: 0;
  flex-grow: 1;
  margin-bottom: 0;
}

/*noinspection CssUnusedSymbol*/
.form :deep(.el-form-item__label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.form :deep(.el-form-item) {
  margin-right: 0;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.form :deep(.el-form-item:not(:last-child)) {
  margin-bottom: 5px;
}

/*noinspection CssUnusedSymbol*/
.form :deep(.el-form-item).validated.is-error {
  margin-bottom: 18px;
}

/*noinspection CssUnusedSymbol*/
.form :deep(.el-form-item__content) {
  width: 0;
  height: 100%;
  flex-grow: 1;
}

.text-editor {
  height: 100%;
  min-height: 120px;
}
</style>
