<template>
  <div class="sender-info-panel-container" v-loading="loading">
    <div class="placeholder" v-if="propsInvalid">请选择通知设置</div>
    <header-layout-panel v-else>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleSaveSenderInfo">保存发送器设置</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleSenderInfoSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <el-form
          class="form"
          ref="formRef"
          label-position="left"
          label-width="45px"
          :model="senderInfoFormItem"
          :rules="senderInfoFormRules"
        >
          <el-form-item class="validated" label="类型" prop="type">
            <el-input v-model="senderInfoFormItem.type">
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="senderSupportSelectDialogVisible = true" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="参数" prop="param">
            <text-editor class="text-editor" v-model="senderInfoFormItem.param" />
          </el-form-item>
        </el-form>
      </template>
    </header-layout-panel>
    <sender-support-select-dialog
      v-model:visible="senderSupportSelectDialogVisible"
      @onConfirmed="handleSenderSupportSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElForm, ElMessage } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/text/textEditor/TextEditor.vue'

import SenderSupportSelectDialog from '@/views/nodes/notifyManagement/senderSupport/SenderSupportSelectDialog.vue'
import { type NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import { type Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { type SenderSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/senderSupport.ts'
import { exists as senderSupportExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/senderSupport.ts'
import {
  exists as existsSenderInfo,
  insert as insertSenderInfo,
  inspect as inspectSenderInfo,
  update as updateSenderInfo,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/senderInfo.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'SenderInfoPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  notifySetting: NotifySetting | null
  topic: Topic | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------搜索逻辑-----------------------------------------------------------
const propsInvalid = computed<boolean>(() => {
  return !props.notifySetting || !props.topic
})

watch(
  () => props.notifySetting,
  () => {
    handleSenderInfoSearch()
  },
)

watch(
  () => props.topic,
  () => {
    handleSenderInfoSearch()
  },
)

function handleSenderInfoSearch(): void {
  if (!props.notifySetting || !props.topic) {
    return
  }
  handleInspectSenderInfo()
}

async function handleInspectSenderInfo(): Promise<void> {
  const notifySetting: NotifySetting | null = props.notifySetting
  if (!notifySetting) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const topic: Topic | null = props.topic
  if (!topic) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loading.value += 1
  try {
    const exists = await resolveResponse(
      existsSenderInfo({
        notify_setting_id: notifySetting.key.long_id,
        topic_id: topic.key.string_id,
      }),
    )
    if (!exists) {
      senderInfoFormItem.value.type = ''
      senderInfoFormItem.value.param = ''
      return
    }
    const senderInfo = await resolveResponse(
      inspectSenderInfo({
        notify_setting_id: notifySetting.key.long_id,
        topic_id: topic.key.string_id,
      }),
    )
    senderInfoFormItem.value.type = senderInfo.type
    senderInfoFormItem.value.param = senderInfo.param
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------头部面板-----------------------------------------------------------
async function handleSaveSenderInfo(): Promise<void> {
  const notifySetting: NotifySetting | null = props.notifySetting
  if (!notifySetting) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
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
    const exists = await resolveResponse(
      existsSenderInfo({
        notify_setting_id: notifySetting.key.long_id,
        topic_id: topic.key.string_id,
      }),
    )
    if (exists) {
      await resolveResponse(
        updateSenderInfo({
          key: {
            notify_setting_id: notifySetting.key.long_id,
            topic_id: topic.key.string_id,
          },
          label: notifySetting.label,
          type: senderInfoFormItem.value.type,
          param: senderInfoFormItem.value.param,
          remark: notifySetting.remark,
        }),
      )
    } else {
      await resolveResponse(
        insertSenderInfo({
          key: {
            notify_setting_id: notifySetting.key.long_id,
            topic_id: topic.key.string_id,
          },
          label: notifySetting.label,
          type: senderInfoFormItem.value.type,
          param: senderInfoFormItem.value.param,
          remark: notifySetting.remark,
        }),
      )
    }
    ElMessage({
      showClose: true,
      message: '发送器设置更新成功',
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------发送器信息表单-----------------------------------------------------------
type SenderInfoFormItem = {
  type: string
  param: string
}

const senderInfoFormItem = ref<SenderInfoFormItem>({
  type: '',
  param: '',
})
const senderInfoFormTypeValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('发送器类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(senderSupportExists({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('不支持的发送器类型'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const senderInfoFormRules = ref({
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
  type: [{ required: true, validator: senderInfoFormTypeValidator, trigger: 'blur' }],
})

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef')

// -----------------------------------------------------------发送器支持选择对话框-----------------------------------------------------------
const senderSupportSelectDialogVisible = ref<boolean>(false)

function handleSenderSupportSelected(senderSupport: SenderSupport): void {
  senderInfoFormItem.value.type = senderSupport.key.string_id
  senderInfoFormItem.value.param = senderSupport.example_param
  const form = formRef.value
  if (!form) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  form.validate()
}
</script>

<style scoped>
.sender-info-panel-container {
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
