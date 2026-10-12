<template>
  <div class="iahn-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" :disabled="readonly" @click="handleShowPutLocaleDialog">{{
            t('views.element_plus_engineering.settingrepo.push_locale')
          }}</el-button>
          <el-button type="primary" :disabled="readonly" @click="handleShowPutMekDialog">{{
            t('views.element_plus_engineering.settingrepo.push_message_key')
          }}</el-button>
          <el-button type="success" @click="handleInspect">{{
            t('views.element_plus_engineering.settingrepo.refresh')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-select
            class="locale-selector"
            v-model="localeSelectModel"
            multiple
            collapse-tags
            collapse-tags-tooltip
            filterable
            clearable
            :placeholder="t('views.element_plus_engineering.settingrepo.locale_filter')"
          >
            <el-option
              v-for="option in localeSelectOptions"
              :key="option.formattedLocale"
              :label="option.label"
              :value="option.formattedLocale"
            />
          </el-select>
          <el-input
            class="mek-filter"
            v-model="mekFilterModel"
            :placeholder="t('views.element_plus_engineering.settingrepo.message_key_filter')"
            clearable
          />
        </div>
      </template>
      <template v-slot:default>
        <el-table
          class="table"
          height="100%"
          stripe
          tooltip-effect="dark"
          border
          :data="tableDatas"
        >
          <el-table-column
            prop="mek_id"
            :label="t('views.element_plus_engineering.settingrepo.message_key')"
            width="200"
            fixed="left"
            show-overflow-tooltip
          >
            <template v-slot:default="{ row }">
              <div class="mek-cell">
                <div class="label">
                  {{ row.mek_id }}
                </div>
                <el-button
                  class="button"
                  v-if="!readonly"
                  type="danger"
                  :icon="DeleteIcon"
                  @click="handleDeleteMek(row.mek_id)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="label"
            :label="t('views.element_plus_engineering.settingrepo.label')"
            width="200"
            fixed="left"
            show-overflow-tooltip
          />
          <el-table-column
            prop="default_message"
            :label="t('views.element_plus_engineering.settingrepo.default_message')"
            width="200"
            fixed="left"
            show-overflow-tooltip
          />
          <el-table-column
            v-for="(column, index) in tableColumns"
            width="200"
            :key="index"
            :label="`${column.label}(${formatLocale(column.language, column.country, column.variant)})`"
          >
            <template v-slot:header="{ column }">
              <div class="iahn-header">
                <div class="label">
                  {{ column.label }}
                </div>
                <el-button
                  class="button"
                  v-if="!readonly"
                  type="danger"
                  :icon="DeleteIcon"
                  @click="handleDeleteLocale(column)"
                />
              </div>
            </template>
            <template v-slot:default="{ row }">
              <div class="iahn-cell">
                <div class="label" @dblclick="handleTableCellDbclicked(row, column, index)">
                  {{ row.row_datas[index].message }}
                </div>
                <el-button
                  class="button"
                  v-if="!readonly"
                  type="primary"
                  :icon="EditPen"
                  @click="handleTableCellDbclicked(row, column, index)"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </header-layout-panel>
    <el-dialog
      v-model="putLocaleDialogVisible"
      id="dialog"
      :title="t('views.element_plus_engineering.settingrepo.push_locale')"
      append-to-body
      destroy-on-close
      @keydown.ctrl.enter="handlePutLocaleDialogHotKeyDown"
    >
      <template v-slot:default>
        <el-form
          ref="putLocaleDialogFormRef"
          v-loading="putLocaleDialogLoading"
          :model="putLocaleDialogFormData"
          :label-width="55"
          :rules="putLocaleDialogFormRules"
          :validate-on-rule-change="false"
          @submit.prevent
        >
          <el-form-item :label="t('views.element_plus_engineering.settingrepo.label')" prop="label">
            <el-input v-model="putLocaleDialogFormData.label" />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.settingrepo.language')"
            prop="language"
          >
            <el-input v-model="putLocaleDialogFormData.language" />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.settingrepo.country')"
            prop="country"
          >
            <el-input v-model="putLocaleDialogFormData.country" />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.settingrepo.variant')"
            prop="variant"
          >
            <el-input v-model="putLocaleDialogFormData.variant" />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.settingrepo.remark')"
            prop="remark"
          >
            <el-input v-model="putLocaleDialogFormData.remark" />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <el-button
          type="primary"
          :disabled="putLocaleDialogLoading > 0"
          @click="handlePutLocaleDialogConfirmButtonClicked"
          >{{ t('views.element_plus_engineering.settingrepo.confirm') }}
        </el-button>
        <el-button :disabled="putLocaleDialogLoading > 0" @click="putLocaleDialogVisible = false"
          >{{ t('views.element_plus_engineering.settingrepo.cancel') }}
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="putMekDialogVisible"
      id="dialog"
      :title="t('views.element_plus_engineering.settingrepo.push_message_key')"
      append-to-body
      destroy-on-close
      @keydown.ctrl.enter="handlePutMekDialogHotKeyDown"
    >
      <template v-slot:default>
        <el-form
          ref="putMekDialogFormRef"
          v-loading="putMekDialogLoading"
          :model="putMekDialogFormData"
          :label-width="65"
          :rules="putMekDialogFormRules"
          :validate-on-rule-change="false"
          @submit.prevent
        >
          <el-form-item
            :label="t('views.element_plus_engineering.settingrepo.message_key')"
            prop="mek_id"
          >
            <el-input v-model="putMekDialogFormData.mek_id" />
          </el-form-item>
          <el-form-item :label="t('views.element_plus_engineering.settingrepo.label')" prop="label">
            <el-input v-model="putMekDialogFormData.label" />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.settingrepo.default_value')"
            prop="default_message"
          >
            <el-input v-model="putMekDialogFormData.default_message" />
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.settingrepo.remark')"
            prop="remark"
          >
            <el-input v-model="putMekDialogFormData.remark" />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <el-button
          type="primary"
          :disabled="putMekDialogLoading > 0"
          @click="handlePutMekDialogConfirmButtonClicked"
          >{{ t('views.element_plus_engineering.settingrepo.confirm') }}
        </el-button>
        <el-button :disabled="putMekDialogLoading > 0" @click="putMekDialogVisible = false"
          >{{ t('views.element_plus_engineering.settingrepo.cancel') }}
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="messageEditDialogVisible"
      id="dialog"
      :title="t('views.element_plus_engineering.settingrepo.edit_message')"
      append-to-body
      destroy-on-close
      @keydown.ctrl.enter="handleMessageEditDialogHotKeyDown"
    >
      <template v-slot:default>
        <el-form
          class="message-edit-dialog-form"
          ref="messageEditDialogFormRef"
          v-loading="messageEditDialogLoading"
          :model="messageEditDialogFormData"
          :label-width="65"
          :rules="messageEditDialogFormRules"
          :validate-on-rule-change="false"
          @submit.prevent
        >
          <el-form-item
            :label="t('views.element_plus_engineering.settingrepo.message')"
            prop="message"
          >
            <text-editor class="text-editor" v-model="messageEditDialogFormData.message" />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <el-button
          type="primary"
          :disabled="messageEditDialogLoading > 0"
          @click="handleMessageEditDialogConfirmButtonClicked"
          >{{ t('views.element_plus_engineering.settingrepo.confirm') }}
        </el-button>
        <el-button
          :disabled="messageEditDialogLoading > 0"
          @click="messageEditDialogVisible = false"
          >{{ t('views.element_plus_engineering.settingrepo.cancel') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useTemplateRef } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'

import { Delete as DeleteIcon, EditPen } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import {
  type IahnNodeMessageTableInspectResult,
  type IahnNodeMessageTableInspectResultRow,
  type IahnNodeMessageTableInspectResultColumn,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/iahnNode.ts'
import {
  inspectMessageTable,
  putLocale,
  putMek,
  upsertMessage,
  removeLocale,
  removeMek,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/iahnNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatLocale } from '@dwarfeng/familyhelper-ui-component-util/src/util/i18n.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'IahnNodeSubEditPanel',
})

// region Props 定义

type Props = {
  category: string | null
  args: string[] | null
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region Props 处理

const settingNodeInvalid = computed(() => {
  return props.category === null || props.args === null
})

watch(
  () => props.category,
  () => {
    handlePropsUpdate()
  },
)

watch(
  () => props.args,
  () => {
    handlePropsUpdate()
  },
)

onMounted(() => {
  handlePropsUpdate()
})

function handlePropsUpdate(): void {
  handleInspect()
}

// endregion

// region 头部面板

type LocaleSelectOption = {
  formattedLocale: string
  label: string
}

const localeSelectModel = ref<string[]>([])
const mekFilterModel = ref<string>('')

const localeSelectOptions = computed<LocaleSelectOption[]>(() => {
  if (!messageTable.value) {
    return []
  }
  return messageTable.value.columns.map((column) => {
    const formattedLocale = formatLocale(column.language, column.country, column.variant)
    return {
      formattedLocale,
      label: `${formattedLocale}(${column.label})`,
    }
  })
})

// endregion

// region 编辑器数据

const messageTable = ref<IahnNodeMessageTableInspectResult | null>(null)

function handleInspect(): void {
  handleInspectMessageTable()
}

async function handleInspectMessageTable(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    const iahnNodeMessageTableInspectResult: IahnNodeMessageTableInspectResult | null =
      await resolveResponse(
        inspectMessageTable({
          category: props.category,
          args: props.args,
        }),
      )
    if (!iahnNodeMessageTableInspectResult) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    messageTable.value = iahnNodeMessageTableInspectResult
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 表格

async function handleDeleteMek(mekId: string): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.delete_message_key_confirmation', { mekId }),
      t('views.element_plus_engineering.settingrepo.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.settingrepo.confirm'),
        cancelButtonText: t('views.element_plus_engineering.settingrepo.cancel'),
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
    if (!props.category || !props.args) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    await resolveResponse(
      removeMek({
        category: props.category,
        args: props.args,
        mek_id: mekId,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.message_key_deleted', { mekId }),
      type: 'success',
    })
    handleInspect()
  } finally {
    loading.value -= 1
  }
}

async function handleDeleteLocale(column: { no: number }): Promise<void> {
  const _columnNo = column.no
  if (_columnNo < 3) {
    return
  }
  const _column: IahnNodeMessageTableInspectResultColumn | null = tableColumns.value[_columnNo - 3]
  if (!_column) {
    return
  }
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.delete_locale_confirmation', {
        localeLabel: _column.label,
        localeCode: formatLocale(_column.language, _column.country, _column.variant),
      }),
      t('views.element_plus_engineering.settingrepo.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.settingrepo.confirm'),
        cancelButtonText: t('views.element_plus_engineering.settingrepo.cancel'),
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
    if (!props.category || !props.args) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    await resolveResponse(
      removeLocale({
        category: props.category,
        args: props.args,
        language: _column.language,
        country: _column.country,
        variant: _column.variant,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.locale_deleted', {
        localeLabel: _column.label,
        localeCode: formatLocale(_column.language, _column.country, _column.variant),
      }),
      type: 'success',
    })
    localeSelectModel.value = localeSelectModel.value.filter(
      (locale) => locale !== formatLocale(_column.language, _column.country, _column.variant),
    )
    handleInspect()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 推入地区对话框

type PutLocaleDialogFormData = {
  language: string
  country: string
  variant: string
  label: string
  remark: string
}

const putLocaleDialogVisible = ref<boolean>(false)
const putLocaleDialogFormData = ref<PutLocaleDialogFormData>({
  language: '',
  country: '',
  variant: '',
  label: '',
  remark: '',
})
const putLocaleDialogLanguageValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  // 语言不能为空。
  if (!value || value.trim() === '') {
    callback(new Error(t('views.element_plus_engineering.settingrepo.language_required')))
    return
  }
  // 按照 RFC 5646 的规范进行校验：
  //   1. 最小长度为 2。
  //   2. 最大长度为 3。
  //   3. 必须是字母。
  if (!/^[a-zA-Z]{2,3}$/.test(value)) {
    callback(new Error(t('views.element_plus_engineering.settingrepo.invalid_language_format')))
    return
  }
  callback()
}
const putLocaleDialogCountryValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  // 国家允许为空。
  if (value === '') {
    callback()
    return
  }
  // 按照 RFC 5646 的规范进行校验：
  //   1. 最小长度为 2。
  //   2. 最大长度为 3。
  //   3. 必须是 2 位字母或 3 位数字。
  if (!/^(?:[a-zA-Z]{2}|[0-9]{3})$/.test(value)) {
    callback(new Error(t('views.element_plus_engineering.settingrepo.invalid_country_format')))
    return
  }
  callback()
}
const putLocaleDialogVariantValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  // 变体允许为空。
  if (value === '') {
    callback()
    return
  }
  // 按照 RFC 5646 的规范进行校验：
  //   1. 最小长度为 2。
  //   2. 最大长度为 8。
  //   3. 必须是字母或数字。
  if (!/^[a-zA-Z0-9]{2,8}$/.test(value)) {
    callback(new Error(t('views.element_plus_engineering.settingrepo.invalid_variant_format')))
    return
  }
  callback()
}
const putLocaleDialogFormRules = {
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.settingrepo.label_required'),
      trigger: 'blur',
    },
  ],
  language: [
    {
      required: true,
      message: t('views.element_plus_engineering.settingrepo.language_required'),
      trigger: 'blur',
    },
    { validator: putLocaleDialogLanguageValidator, trigger: 'blur' },
  ],
  country: [{ validator: putLocaleDialogCountryValidator, trigger: 'blur' }],
  variant: [{ validator: putLocaleDialogVariantValidator, trigger: 'blur' }],
}
const putLocaleDialogLoading = ref<number>(0)

const putLocaleDialogFormRef = useTemplateRef<InstanceType<typeof ElForm>>('putLocaleDialogFormRef')

function handleShowPutLocaleDialog(): void {
  putLocaleDialogVisible.value = true
}

function handlePutLocaleDialogConfirmButtonClicked(): void {
  if (!putLocaleDialogFormRef.value) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  putLocaleDialogFormRef.value.validate((accept: boolean) => {
    if (accept) {
      handlePutLocale()
    }
  })
}

function handlePutLocaleDialogHotKeyDown(): void {
  if (!putLocaleDialogFormRef.value) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  putLocaleDialogFormRef.value.validate((accept: boolean) => {
    if (accept) {
      handlePutLocale()
    }
  })
}

async function handlePutLocale(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  putLocaleDialogLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    const language: string = putLocaleDialogFormData.value.language
    const country: string = putLocaleDialogFormData.value.country
    const variant: string = putLocaleDialogFormData.value.variant
    const label: string = putLocaleDialogFormData.value.label
    const remark: string = putLocaleDialogFormData.value.remark
    await resolveResponse(
      putLocale({
        category: props.category,
        args: props.args,
        language,
        country,
        variant,
        label,
        remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.locale_pushed', {
        localeLabel: label,
        localeCode: formatLocale(language, country, variant),
      }),
      type: 'success',
    })
    handleInspect()
    putLocaleDialogVisible.value = false
  } finally {
    putLocaleDialogLoading.value -= 1
    loading.value -= 1
  }
}

// endregion

// region 推入文本键对话框

type PutMekDialogFormData = {
  mek_id: string
  label: string
  default_message: string
  remark: string
}

const putMekDialogVisible = ref<boolean>(false)
const putMekDialogFormData = ref<PutMekDialogFormData>({
  mek_id: '',
  label: '',
  default_message: '',
  remark: '',
})
const putMekDialogFormRules = {
  mek_id: [
    {
      required: true,
      message: t('views.element_plus_engineering.settingrepo.message_key_required'),
      trigger: 'blur',
    },
  ],
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.settingrepo.label_required'),
      trigger: 'blur',
    },
  ],
}
const putMekDialogLoading = ref<number>(0)

const putMekDialogFormRef = useTemplateRef<InstanceType<typeof ElForm>>('putMekDialogFormRef')

function handleShowPutMekDialog(): void {
  putMekDialogVisible.value = true
}

function handlePutMekDialogConfirmButtonClicked(): void {
  if (!putMekDialogFormRef.value) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  putMekDialogFormRef.value.validate((accept: boolean) => {
    if (accept) {
      handlePutMek()
    }
  })
}

function handlePutMekDialogHotKeyDown(): void {
  if (!putMekDialogFormRef.value) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  putMekDialogFormRef.value.validate((accept: boolean) => {
    if (accept) {
      handlePutMek()
    }
  })
}

async function handlePutMek(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  putMekDialogLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    const mek_id: string = putMekDialogFormData.value.mek_id
    const label: string = putMekDialogFormData.value.label
    const default_message: string = putMekDialogFormData.value.default_message
    const remark: string = putMekDialogFormData.value.remark
    await resolveResponse(
      putMek({
        category: props.category,
        args: props.args,
        mek_id,
        label,
        default_message,
        remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.message_key_pushed', {
        label,
        mekId: mek_id,
      }),
      type: 'success',
    })
    handleInspect()
    putMekDialogVisible.value = false
  } finally {
    putMekDialogLoading.value -= 1
    loading.value -= 1
  }
}

// endregion

// region 消息表格

const tableColumns = computed<IahnNodeMessageTableInspectResultColumn[]>(() => {
  if (!messageTable.value) {
    return []
  }
  return messageTable.value.columns.filter((column) => {
    // 如果地区选择器有值，则只显示选择的地区。
    if (localeSelectModel.value.length > 0) {
      const formattedLocale = formatLocale(column.language, column.country, column.variant)
      return localeSelectModel.value.includes(formattedLocale)
    }
    // 否则显示所有地区。
    return true
  })
})
const tableDatas = computed<IahnNodeMessageTableInspectResultRow[]>(() => {
  if (!messageTable.value) {
    return []
  }
  return messageTable.value.rows.filter((row) => {
    // 如果文本键过滤器有值，则只显示包含过滤器值的文本键。
    if (mekFilterModel.value !== '') {
      return row.mek_id.includes(mekFilterModel.value)
    }
    // 否则显示所有文本键。
    return true
  })
})

function handleTableCellDbclicked(
  row: IahnNodeMessageTableInspectResultRow,
  column: IahnNodeMessageTableInspectResultColumn,
  index: number,
): void {
  // 如果当前是只读模式，则不允许编辑。
  if (props.readonly) {
    return
  }
  // 设置当前的行和列数据到编辑对话框中。
  messageEditDialogRow.value = row
  messageEditDialogColumn.value = column
  // 获取当前的消息并将其设置到编辑对话框中表单数据中。
  messageEditDialogFormData.value.message = row.row_datas[index].message ?? ''
  // 显示编辑对话框。
  handleShowMessageEditDialog()
}

// endregion

// region 消息编辑对话框

type MessageEditDialogFormData = {
  message: string
}

const messageEditDialogVisible = ref<boolean>(false)
const messageEditDialogRow = ref<IahnNodeMessageTableInspectResultRow | null>(null)
const messageEditDialogColumn = ref<IahnNodeMessageTableInspectResultColumn | null>(null)
const messageEditDialogFormData = ref<MessageEditDialogFormData>({
  message: '',
})
const messageEditDialogFormRules = {}
const messageEditDialogLoading = ref<number>(0)

const messageEditDialogFormRef = useTemplateRef<InstanceType<typeof ElForm>>(
  'messageEditDialogFormRef',
)

function handleShowMessageEditDialog(): void {
  messageEditDialogVisible.value = true
}

function handleMessageEditDialogConfirmButtonClicked(): void {
  if (!messageEditDialogFormRef.value) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  messageEditDialogFormRef.value.validate((accept: boolean) => {
    if (accept) {
      handleMessageEdit()
    }
  })
}

function handleMessageEditDialogHotKeyDown(): void {
  if (!messageEditDialogFormRef.value) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  messageEditDialogFormRef.value.validate((accept: boolean) => {
    if (accept) {
      handleMessageEdit()
    }
  })
}

async function handleMessageEdit(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  messageEditDialogLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    if (!messageEditDialogRow.value || !messageEditDialogColumn.value) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    const language = messageEditDialogColumn.value.language
    const country = messageEditDialogColumn.value.country
    const variant = messageEditDialogColumn.value.variant
    const mek_id = messageEditDialogRow.value.mek_id
    const message: string = messageEditDialogFormData.value.message
    await resolveResponse(
      upsertMessage({
        category: props.category,
        args: props.args,
        language,
        country,
        variant,
        mek_id,
        message,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.message_updated'),
      type: 'success',
    })
    handleInspect()
    messageEditDialogVisible.value = false
  } finally {
    messageEditDialogLoading.value -= 1
    loading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.iahn-node-edit-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .locale-selector {
  width: 240px;
  margin-right: 10px;
}

.header-container .mek-filter {
  width: 300px;
}

.table {
  height: 100%;
  width: 100%;
}

.table :deep(.mek-cell) {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.table :deep(.mek-cell .label) {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table :deep(.mek-cell .button) {
  height: 28px;
  width: 28px;
  padding: 7px;
  margin-left: 5px;
}

.table :deep(.iahn-header) {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.table :deep(.iahn-header .label) {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table :deep(.iahn-header .button) {
  height: 28px;
  width: 28px;
  padding: 7px;
  margin-left: 5px;
}

.table :deep(.iahn-cell) {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.table :deep(.iahn-cell .label) {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table :deep(.iahn-cell .button) {
  height: 28px;
  width: 28px;
  padding: 7px;
  margin-left: 5px;
}

.message-edit-dialog-form :deep(.text-editor) {
  height: 500px;
}
</style>
