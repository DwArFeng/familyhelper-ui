<template>
  <div class="router-info-panel-container" v-loading="loading">
    <div class="placeholder" v-if="!notifySetting">请选择通知设置</div>
    <header-layout-panel v-else>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleSaveRouterInfo">保存路由器设置</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleRouterInfoSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <el-form
          class="form"
          ref="formRef"
          label-position="left"
          label-width="45px"
          :model="routerInfoFormItem"
          :rules="routerInfoFormRules"
        >
          <el-form-item class="validated" label="类型" prop="type">
            <el-input v-model="routerInfoFormItem.type">
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="routerSupportSelectDialogVisible = true" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="参数" prop="param">
            <text-editor class="text-editor" v-model="routerInfoFormItem.param" />
          </el-form-item>
        </el-form>
      </template>
    </header-layout-panel>
    <router-support-select-dialog
      v-model:visible="routerSupportSelectDialogVisible"
      @onConfirmed="handleRouterSupportSelected"
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

import RouterSupportSelectDialog from '@/views/nodes/notifyManagement/routerSupport/RouterSupportSelectDialog.vue'
import { type NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import { type RouterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport.ts'
import { exists as routerSupportExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport.ts'
import {
  exists as existsRouterInfo,
  insert as insertRouterInfo,
  inspect as inspectRouterInfo,
  update as updateRouterInfo,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerInfo.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'RouterInfoPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  notifySetting: NotifySetting | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------搜索逻辑-----------------------------------------------------------
watch(
  () => props.notifySetting,
  () => {
    handleRouterInfoSearch()
  },
)

function handleRouterInfoSearch(): void {
  if (!props.notifySetting) {
    return
  }
  handleInspectRouterInfo()
}

async function handleInspectRouterInfo(): Promise<void> {
  const notifySetting: NotifySetting | null = props.notifySetting
  if (!notifySetting) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loading.value += 1
  try {
    const exists = await resolveResponse(existsRouterInfo(notifySetting.key))
    if (!exists) {
      routerInfoFormItem.value.type = ''
      routerInfoFormItem.value.param = ''
      return
    }
    const routerInfo = await resolveResponse(inspectRouterInfo(notifySetting.key))
    routerInfoFormItem.value.type = routerInfo.type
    routerInfoFormItem.value.param = routerInfo.param
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------头部面板-----------------------------------------------------------
async function handleSaveRouterInfo(): Promise<void> {
  const notifySetting: NotifySetting | null = props.notifySetting
  if (!notifySetting) {
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
    const exists = await resolveResponse(existsRouterInfo(notifySetting.key))
    if (exists) {
      await resolveResponse(
        updateRouterInfo({
          key: notifySetting.key,
          label: notifySetting.label,
          type: routerInfoFormItem.value.type,
          param: routerInfoFormItem.value.param,
          remark: notifySetting.remark,
        }),
      )
    } else {
      await resolveResponse(
        insertRouterInfo({
          key: notifySetting.key,
          label: notifySetting.label,
          type: routerInfoFormItem.value.type,
          param: routerInfoFormItem.value.param,
          remark: notifySetting.remark,
        }),
      )
    }
    ElMessage({
      showClose: true,
      message: '路由器设置更新成功',
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------路由器信息表单-----------------------------------------------------------
type RouterInfoFormItem = {
  type: string
  param: string
}

const routerInfoFormItem = ref<RouterInfoFormItem>({
  type: '',
  param: '',
})
const routerInfoFormTypeValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('路由器类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(routerSupportExists({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('不支持的路由器类型'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const routerInfoFormRules = ref({
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
  type: [{ required: true, validator: routerInfoFormTypeValidator, trigger: 'blur' }],
})

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef')

// -----------------------------------------------------------路由器支持选择对话框-----------------------------------------------------------
const routerSupportSelectDialogVisible = ref<boolean>(false)

function handleRouterSupportSelected(routerSupport: RouterSupport): void {
  routerInfoFormItem.value.type = routerSupport.key.string_id
  routerInfoFormItem.value.param = routerSupport.example_param
  const form = formRef.value
  if (!form) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  form.validate()
}
</script>

<style scoped>
.router-info-panel-container {
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
