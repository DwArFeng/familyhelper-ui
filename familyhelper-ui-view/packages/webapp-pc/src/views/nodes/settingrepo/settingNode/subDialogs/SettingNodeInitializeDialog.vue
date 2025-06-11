<template>
  <div class="setting-node-init-dialog-container">
    <el-dialog
      v-model="mainDialogVisible"
      append-to-body
      destroy-on-close
      title="初始化节点"
      :close-on-click-modal="false"
      @keydown.ctrl.enter="handleMainDialogHotKeyDown"
    >
      <template v-slot:default>
        <el-form
          ref="formRef"
          v-loading="mainDialogLoading"
          label-width="80px"
          :model="mainDialogModel"
          :rules="mainDialogRules"
          :validate-on-rule-change="false"
          @submit.prevent
        >
          <el-form-item label="权限节点" prop="category">
            <el-input v-model="mainDialogModel.category">
              <template v-slot:append>
                <el-button-group class="button-group">
                  <el-button
                    class="button"
                    :icon="SearchIcon"
                    @click="handleShowSettingCategorySelectDialog"
                  />
                  <el-button
                    class="button"
                    :icon="DocumentCopy"
                    @click="handleShowSettingNodeSelectDialog"
                  />
                </el-button-group>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="参数" prop="string_args">
            <json-editor class="json-editor" v-model="mainDialogModel.string_args" />
          </el-form-item>
          <el-form-item label="权限节点" prop="type">
            <el-select class="type-select" v-model="mainDialogModel.type" placeholder="请选择">
              <el-option
                v-for="item in mainDialogModelTypeIndicator"
                :key="item.type"
                :label="item.label"
                :value="item.type"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="mainDialogModel.remark" />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <div class="footer-container">
          <el-button
            type="primary"
            :disabled="mainDialogLoading > 0"
            @click="handleMainDialogConfirmButtonClicked"
          >
            确定
          </el-button>
          <el-button :disabled="mainDialogLoading > 0" @click="handleMainDialogCancelButtonClicked">
            取消
          </el-button>
        </div>
      </template>
    </el-dialog>
    <setting-category-select-dialog
      v-model:visible="settingCategorySelectDialogVisible"
      @onConfirmed="handleSettingCategorySelectConfirmed"
    />
    <setting-node-select-dialog
      v-model:visible="settingNodeSelectDialogVisible"
      @onConfirmed="handleSettingNodeSelectConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElForm, ElMessage } from 'element-plus'

import { Search as SearchIcon, DocumentCopy } from '@element-plus/icons-vue'

import JsonEditor from '@/components/text/jsonEditor/JsonEditor.vue'

import SettingCategorySelectDialog from '@/views/nodes/settingrepo/settingCategory/SettingCategorySelectDialog.vue'
import SettingNodeSelectDialog from '@/views/nodes/settingrepo/settingNode/subDialogs/SettingNodeSelectDialog.vue'

import { type SettingCategory } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingCategory.ts'
import {
  type SettingNode,
  type SettingNodeInitInfo,
  type SettingNodeType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { exists as settingCategoryExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingCategory.ts'
import { operateInit as settingNodeOperateInit } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'SettingNodeInitDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onSettingNodeInitialized'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------主对话框-----------------------------------------------------------
type MainDialogSettingNodeInitInfo = Omit<SettingNodeInitInfo, 'args'> & {
  string_args: string
}

const mainDialogVisible = ref<boolean>(props.visible)
const mainDialogLoading = ref<number>(0)
const mainDialogModel = ref<MainDialogSettingNodeInitInfo>({
  category: '',
  string_args: '',
  type: 0,
  remark: '',
})
const mainDialogCategoryValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('配置类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(settingCategoryExists({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('配置类型不存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const mainDialogArgsValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  // value 转 JSON。
  value = JSON.parse(value)
  // 参数不允许为 null。
  if (value === null) {
    callback(new Error('参数不能为 null'))
    return
  }
  // 如果参数不为 null，则必须是数组。
  if (!Array.isArray(value)) {
    callback(new Error('参数必须是数组'))
    return
  }
  // 数组中的每一个元素都是字符串。
  if (value.some((item) => typeof item !== 'string')) {
    callback(new Error('参数数组中的每一个元素必须是字符串'))
    return
  }
  // 通过验证。
  callback()
}
const mainDialogRules = ref({
  category: [
    { validator: mainDialogCategoryValidator, trigger: 'blur' },
    {
      required: true,
      message: '配置类型不能为空',
      trigger: 'blur',
    },
  ],
  string_args: [
    { validator: mainDialogArgsValidator, trigger: 'blur' },
    {
      required: true,
      message: '参数不能为空',
      trigger: 'blur',
    },
  ],
})
const mainDialogModelTypeIndicator = ref<{ type: SettingNodeType; label: string }[]>([
  { type: 0, label: '文本' },
  { type: 2, label: '图片' },
  { type: 3, label: '图片列表' },
])

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef')

watch(
  () => props.visible,
  (value) => {
    mainDialogVisible.value = value
  },
)

watch(
  () => mainDialogVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

function handleMainDialogConfirmButtonClicked(): void {
  handleInitSettingNode()
}

function handleMainDialogHotKeyDown(): void {
  handleInitSettingNode()
}

async function handleInitSettingNode(): Promise<void> {
  const form = formRef.value
  if (!form) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  try {
    await form.validate()
  } catch {
    return
  }
  await initSettingNode()
}

async function initSettingNode(): Promise<void> {
  mainDialogLoading.value += 1
  try {
    await resolveResponse(
      settingNodeOperateInit({
        category: mainDialogModel.value.category,
        // 经过表单验证，可以保证此处转换一定成立。
        args: JSON.parse(mainDialogModel.value.string_args) as string[],
        type: mainDialogModel.value.type,
        remark: mainDialogModel.value.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '配置节点初始化成功',
      type: 'success',
    })
    emit('onSettingNodeInitialized')
    mainDialogVisible.value = false
  } finally {
    mainDialogLoading.value -= 1
  }
}

function handleMainDialogCancelButtonClicked(): void {
  mainDialogVisible.value = false
}

onMounted(() => {
  mainDialogVisible.value = props.visible
})

// -----------------------------------------------------------配置类型选择对话框-----------------------------------------------------------
const settingCategorySelectDialogVisible = ref<boolean>(false)

function handleShowSettingCategorySelectDialog(): void {
  settingCategorySelectDialogVisible.value = true
}

function handleSettingCategorySelectConfirmed(selection: SettingCategory): void {
  mainDialogModel.value.category = selection.key.string_id
}

// -----------------------------------------------------------配置节点选择对话框-----------------------------------------------------------
const settingNodeSelectDialogVisible = ref<boolean>(false)

function handleShowSettingNodeSelectDialog(): void {
  settingNodeSelectDialogVisible.value = true
}

function handleSettingNodeSelectConfirmed(selection: SettingNode): void {
  mainDialogModel.value.category = selection.category
  mainDialogModel.value.string_args = JSON.stringify(selection.args)
}
</script>

<style scoped>
.button-group {
  display: flex;
}

.button-group .button {
  padding-left: 10px;
  padding-right: 10px;
}

.json-editor {
  height: 250px;
}

/*noinspection CssUnusedSymbol*/
.json-editor :deep(.jsoneditor-vue) {
  height: 100%;
}

.type-select {
  width: 100%;
}

.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
