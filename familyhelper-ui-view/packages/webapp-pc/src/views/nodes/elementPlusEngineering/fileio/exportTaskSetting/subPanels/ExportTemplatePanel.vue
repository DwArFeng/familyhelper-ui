<template>
  <div class="export-template-panel-container">
    <div v-if="settingId === ''" class="placeholder">
      {{ t('views.element_plus_engineering.fileio.please_select_task_setting') }}
    </div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="handleShowCreateDialog">{{
              t('views.element_plus_engineering.fileio.create_setting')
            }}</el-button>
            <el-divider direction="vertical" />
            <el-button type="success" @click="handleSearch">{{
              t('views.element_plus_engineering.fileio.refresh_data')
            }}</el-button>
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
          <table-panel
            class="table"
            v-model:page-size="tablePageSize"
            v-model:current-page="tableCurrentPage"
            :item-count="tableItemCount"
            :items="tableItems"
            :page-sizes="[10, 15, 20, 30]"
            :operate-column-width="84"
            @onPagingAttributeChanged="handleSearch"
          >
            <el-table-column
              prop="key.identifier"
              :label="t('views.element_plus_engineering.fileio.identifier')"
            />
            <el-table-column
              class-name="single-line"
              prop="origin_name"
              :label="t('views.element_plus_engineering.fileio.file_name')"
            />
            <el-table-column
              prop="length"
              :label="t('views.element_plus_engineering.fileio.file_size')"
              show-overflow-tooltip
              :formatter="unitFormatter"
            />
            <el-table-column
              prop="uploaded_date"
              :label="t('views.element_plus_engineering.fileio.upload_time')"
              show-overflow-tooltip
              :formatter="timestampFormatter"
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.fileio.remark')"
              show-overflow-tooltip
            />
            <template v-slot:operateColumn="{ row }">
              <el-button-group class="operate-column">
                <el-button
                  class="table-button"
                  type="success"
                  :icon="DownloadIcon"
                  @click="handleDownloadFile(row as ExportTemplateInfo)"
                />
                <el-button
                  class="table-button"
                  type="danger"
                  :icon="DeleteIcon"
                  @click="handleEntityDelete(row as ExportTemplateInfo)"
                />
              </el-button-group>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>

      <maintain-dialog
        v-model:visible="dialogVisible"
        mode="CREATE"
        :item="dialogItem"
        :loading="dialogLoading"
        :create-rules="dialogCreateRules"
        :close-on-click-modal="false"
        @onItemCreate="handleEntityCreate"
      >
        <el-form-item
          :label="t('views.element_plus_engineering.fileio.identifier')"
          prop="identifier"
          ><el-input v-model="dialogItem.identifier"
        /></el-form-item>
        <el-form-item :label="t('views.element_plus_engineering.fileio.template_file')">
          <el-upload
            action=""
            :file-list="fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :limit="1"
            :auto-upload="false"
          >
            <template v-slot:trigger
              ><el-button size="small" type="primary">{{
                t('views.element_plus_engineering.fileio.select_file')
              }}</el-button></template
            >
            <div class="el-upload__tip">
              {{ t('views.element_plus_engineering.fileio.large_file_upload_warning') }}
            </div>
          </el-upload>
        </el-form-item>
      </maintain-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { ref } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  type FormItemRule,
  type UploadFiles,
  type UploadUserFile,
} from 'element-plus'

import { Delete as DeleteIcon, Download as DownloadIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  childForTaskSetting,
  exists,
  type ExportTemplateInfo,
  remove,
  requestStreamVoucher,
  uploadStream,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exportTemplate.ts'
import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ExportTemplatePanel' })

// region I18n 引入

const { t } = useI18n()

// endregion
type Props = {
  settingId: string
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  settingId: '',
  mode: 'DEFAULT',
})

type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

const loading = ref<boolean>(false)
const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ExportTemplateInfo>(10)

const dialogVisible = ref<boolean>(false)
const dialogLoading = ref<boolean>(false)
const dialogItem = ref<{ identifier: string }>({ identifier: '' })
const fileList = ref<UploadUserFile[]>([])
const dialogIdentifierValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  if (!props.settingId) {
    throw new Error(
      t('views.element_plus_engineering.fileio.unexpected_execution_contact_developer'),
    )
  }
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error(t('views.element_plus_engineering.fileio.identifier_required')))
        return Promise.reject()
      }
      return resolveResponse(exists(props.settingId, res))
    })
    .then((res) => {
      if (res) {
        callback(new Error(t('views.element_plus_engineering.fileio.identifier_already_exists')))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const dialogCreateRules = ref({
  identifier: [{ required: true, validator: dialogIdentifierValidator, trigger: 'blur' }],
})

async function handleSearch(): Promise<void> {
  if (!props.settingId) return
  loading.value = true
  try {
    updateTableByLookup(
      await lookupWithAdjustPage(
        (pagingInfo) => childForTaskSetting({ long_id: props.settingId }, pagingInfo),
        tablePagingInfo.value,
      ),
    )
  } finally {
    loading.value = false
  }
}
function handleShowCreateDialog(): void {
  dialogItem.value.identifier = ''
  fileList.value = []
  dialogVisible.value = true
}
async function handleEntityCreate(): Promise<void> {
  if (fileList.value.length < 1) {
    ElMessage({
      showClose: true,
      type: 'warning',
      message: t('views.element_plus_engineering.fileio.please_upload_template_file'),
    })
    return
  }
  const rawFile = fileList.value[0].raw
  if (!rawFile) {
    ElMessage({
      showClose: true,
      type: 'warning',
      message: t('views.element_plus_engineering.fileio.please_upload_template_file'),
    })
    return
  }
  if (props.settingId === '') {
    throw new Error(
      t('views.element_plus_engineering.fileio.unexpected_execution_contact_developer'),
    )
  }
  dialogLoading.value = true
  try {
    // 将 Blob 转换为 File。
    const fileBlob = new File([rawFile], rawFile.name, { type: 'application/octet-stream' })
    // 构造表单数据。
    const formData = new FormData()
    formData.append('file', fileBlob)
    // 执行上传。
    await resolveResponse(uploadStream(props.settingId, dialogItem.value.identifier, formData))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.fileio.setting_created'),
      type: 'success',
    })
    // 刷新数据。
    await handleSearch()
    // 关闭对话框。
    dialogVisible.value = false
  } finally {
    dialogLoading.value = false
  }
}
async function handleEntityDelete(row: ExportTemplateInfo): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.fileio.delete_setting_confirmation'),
      t('views.element_plus_engineering.fileio.prompt'),
      { type: 'warning' },
    )
  } catch {
    return
  }
  loading.value = true
  try {
    await resolveResponse(remove({ key: row.key }))
    ElMessage({
      showClose: true,
      type: 'success',
      message: t('views.element_plus_engineering.fileio.setting_deleted'),
    })
    await handleSearch()
  } finally {
    loading.value = false
  }
}
async function handleDownloadFile(row: ExportTemplateInfo): Promise<void> {
  loading.value = true
  try {
    // 获取文件下载凭证。
    const _voucherKey: LongIdKey = await resolveResponse(
      requestStreamVoucher(row.key.task_setting_id, row.key.identifier),
    )
    // 信息提示。
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.fileio.file_preparing_wait_hint'),
      type: 'success',
      duration: 10000,
    })
    // 创建 iframe, 执行下载。
    const iframe: HTMLIFrameElement = document.createElement('iframe')
    iframe.setAttribute('hidden', 'hidden')
    document.body.appendChild(iframe)
    const url: string = `${vim.ctx().api().baseUrl()}/fileio/export-template/download-by-voucher?voucher-id=${_voucherKey.long_id}`
    iframe.setAttribute('src', url)
    // 销毁 iframe。
    // 由于设置 src 属性的 iframe 不支持 onload 事件，所以使用定时器来销毁 iframe。
    // 假设文件准备的时间不会超过 10 分钟。
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 600000)
  } finally {
    loading.value = false
  }
}
function timestampFormatter(
  row: ExportTemplateInfo,
  column: { property: keyof ExportTemplateInfo },
): string {
  const v = row[column.property]
  return typeof v === 'number'
    ? formatTimestamp(v)
    : t('views.element_plus_engineering.fileio.none_available_parenthesized')
}
function unitFormatter(
  row: ExportTemplateInfo,
  column: { property: keyof ExportTemplateInfo },
): string {
  return formatUnit(Number(row[column.property]), dataSizePreset)
}
function handleFileChange(_file: unknown, list: UploadFiles): void {
  fileList.value = list
}
function handleFileRemove(_file: unknown, list: UploadFiles): void {
  fileList.value = list
}

void handleSearch()

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

function refresh(): void {
  void handleSearch()
}

defineExpose({
  refresh,
})
</script>

<style scoped>
.export-template-panel-container {
  height: 100%;
  width: 100%;
  background: #fff;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
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
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}
</style>
