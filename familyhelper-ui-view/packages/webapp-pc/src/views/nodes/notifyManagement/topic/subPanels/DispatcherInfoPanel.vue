<template>
  <div class="dispatcher-info-panel-container" v-loading="loading">
    <div class="placeholder" v-if="!topic">请选择主题</div>
    <header-layout-panel v-else>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleSaveDispatcherInfo">保存调度器设置</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleDispatcherInfoSearch">刷新数据</el-button>
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
          <el-form-item class="validated" label="类型" prop="type">
            <el-input v-model="dispatcherInfoFormItem.type">
              <template v-slot:append>
                <el-button
                  :icon="SearchIcon"
                  @click="dispatcherSupportSelectDialogVisible = true"
                />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="参数" prop="param">
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

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/text/textEditor/TextEditor.vue'

import DispatcherSupportSelectDialog from '@/views/nodes/notifyManagement/dispatcherSupport/DispatcherSupportSelectDialog.vue'
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

defineOptions({
  name: 'DispatcherInfoPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  topic: Topic | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------搜索逻辑-----------------------------------------------------------
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
    throw new Error('不应该执行到此处, 请联系开发人员')
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

// -----------------------------------------------------------头部面板-----------------------------------------------------------
async function handleSaveDispatcherInfo(): Promise<void> {
  const topic: Topic | null = props.topic
  if (!topic) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const form = formRef.value
  if (!form) {
    throw new Error('不应该执行到此处, 请联系开发人员')
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
      message: '调度器设置更新成功',
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------调度器信息表单-----------------------------------------------------------
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
        callback(new Error('调度器类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(dispatcherSupportExists({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('不支持的调度器类型'))
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
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
  type: [{ required: true, validator: dispatcherInfoFormTypeValidator, trigger: 'blur' }],
})

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef')

// -----------------------------------------------------------调度器支持选择对话框-----------------------------------------------------------
const dispatcherSupportSelectDialogVisible = ref<boolean>(false)

function handleDispatcherSupportSelected(dispatcherSupport: DispatcherSupport): void {
  dispatcherInfoFormItem.value.type = dispatcherSupport.key.string_id
  dispatcherInfoFormItem.value.param = dispatcherSupport.example_param
  const form = formRef.value
  if (!form) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  form.validate()
}
</script>

<style scoped>
.dispatcher-info-panel-container {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
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
