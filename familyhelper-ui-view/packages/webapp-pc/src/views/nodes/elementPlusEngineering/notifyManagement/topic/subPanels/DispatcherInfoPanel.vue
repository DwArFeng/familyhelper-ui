<template>
  <div class="dispatcher-info-panel-container" v-loading="loading">
    <placeholder-panel
      v-if="!topic"
      :text="t('views.element_plus_engineering.notify_management.please_select_topic')"
    />
    <header-layout-panel v-else>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleSaveDispatcherInfo">{{
            t('views.element_plus_engineering.notify_management.save_dispatcher_setting')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleDispatcherInfoSearch">{{
            t('views.element_plus_engineering.notify_management.refresh_data')
          }}</el-button>
        </div>
      </template>
      <template v-slot:default>
        <el-form
          class="form"
          ref="formRef"
          label-position="left"
          label-width="45px"
          :model="dispatcherInfoFormItem"
          :rules="dispatcherInfoFormRules"
        >
          <el-form-item
            class="validated"
            :label="t('views.element_plus_engineering.notify_management.type')"
            prop="type"
          >
            <el-input v-model="dispatcherInfoFormItem.type">
              <template v-slot:append>
                <el-button
                  :icon="SearchIcon"
                  @click="dispatcherSupportSelectDialogVisible = true"
                />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.notify_management.parameters')"
            prop="param"
          >
            <text-editor class="text-editor" v-model="dispatcherInfoFormItem.param" />
          </el-form-item>
        </el-form>
      </template>
    </header-layout-panel>
    <dispatcher-support-select-dialog
      v-model:visible="dispatcherSupportSelectDialogVisible"
      @onConfirmed="handleDispatcherSupportSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElForm, ElMessage } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import DispatcherSupportSelectDialog from '@/views/nodes/elementPlusEngineering/notifyManagement/dispatcherSupport/DispatcherSupportSelectDialog.vue'
import { type Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { type DispatcherSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherSupport.ts'
import { exists as dispatcherSupportExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherSupport.ts'
import {
  exists as existsDispatcherInfo,
  insert as insertDispatcherInfo,
  inspect as inspectDispatcherInfo,
  update as updateDispatcherInfo,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherInfo.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'DispatcherInfoPanel',
})

// region Props 定义

type Props = {
  topic: Topic | null
}

const props = defineProps<Props>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

watch(
  () => props.topic,
  () => {
    handleDispatcherInfoSearch()
  },
)

function handleDispatcherInfoSearch(): void {
  if (!props.topic) {
    return
  }
  handleInspectDispatcherInfo()
}

async function handleInspectDispatcherInfo(): Promise<void> {
  const topic: Topic | null = props.topic
  if (!topic) {
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
  }
  loading.value += 1
  try {
    const exists = await resolveResponse(existsDispatcherInfo(topic.key))
    if (!exists) {
      dispatcherInfoFormItem.value.type = ''
      dispatcherInfoFormItem.value.param = ''
      return
    }
    const dispatcherInfo = await resolveResponse(inspectDispatcherInfo(topic.key))
    dispatcherInfoFormItem.value.type = dispatcherInfo.type
    dispatcherInfoFormItem.value.param = dispatcherInfo.param
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 头部面板

async function handleSaveDispatcherInfo(): Promise<void> {
  const topic: Topic | null = props.topic
  if (!topic) {
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
  }
  const form = formRef.value
  if (!form) {
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
  }
  try {
    await form.validate()
  } catch {
    return
  }
  loading.value += 1
  try {
    const exists = await resolveResponse(existsDispatcherInfo(topic.key))
    if (exists) {
      await resolveResponse(
        updateDispatcherInfo({
          key: topic.key,
          label: topic.label,
          type: dispatcherInfoFormItem.value.type,
          param: dispatcherInfoFormItem.value.param,
          remark: topic.remark,
        }),
      )
    } else {
      await resolveResponse(
        insertDispatcherInfo({
          key: topic.key,
          label: topic.label,
          type: dispatcherInfoFormItem.value.type,
          param: dispatcherInfoFormItem.value.param,
          remark: topic.remark,
        }),
      )
    }
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.notify_management.dispatcher_setting_updated'),
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 调度器信息表单

type DispatcherInfoFormItem = {
  type: string
  param: string
}

const dispatcherInfoFormItem = ref<DispatcherInfoFormItem>({
  type: '',
  param: '',
})
const dispatcherInfoFormTypeValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(
          new Error(t('views.element_plus_engineering.notify_management.dispatcher_type_required')),
        )
        return Promise.reject()
      }
      return resolveResponse(dispatcherSupportExists({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(
          new Error(
            t('views.element_plus_engineering.notify_management.unsupported_dispatcher_type'),
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
const dispatcherInfoFormRules = ref({
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.notify_management.label_required'),
      trigger: 'blur',
    },
  ],
  type: [{ required: true, validator: dispatcherInfoFormTypeValidator, trigger: 'blur' }],
})

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef')

// endregion

// region 调度器支持选择对话框

const dispatcherSupportSelectDialogVisible = ref<boolean>(false)

function handleDispatcherSupportSelected(dispatcherSupport: DispatcherSupport): void {
  dispatcherInfoFormItem.value.type = dispatcherSupport.key.string_id
  dispatcherInfoFormItem.value.param = dispatcherSupport.example_param
  const form = formRef.value
  if (!form) {
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
  }
  form.validate()
}

// endregion
</script>

<style scoped>
.dispatcher-info-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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
.form :deep(.el-form-item:last-child) {
  height: 0;
  flex-grow: 1;
  margin-bottom: 0;
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
</style>
