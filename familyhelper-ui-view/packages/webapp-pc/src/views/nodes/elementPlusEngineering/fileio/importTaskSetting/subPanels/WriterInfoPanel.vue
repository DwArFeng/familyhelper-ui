<template>
  <div class="writer-panel-container">
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
            @onPagingAttributeChanged="handleSearch"
            @onItemInspect="handleEntityInspect"
            @onItemEdit="handleEntityEdit"
            @onItemDelete="handleEntityDelete"
          >
            <el-table-column
              prop="key.identifier"
              :label="t('views.element_plus_engineering.fileio.identifier')"
            />
            <el-table-column
              prop="enabled"
              :label="t('views.element_plus_engineering.fileio.enabled')"
              :formatter="enabledFormatter"
            />
            <el-table-column prop="type" :label="t('views.element_plus_engineering.fileio.type')" />
            <el-table-column
              class-name="single-line"
              prop="param"
              :label="t('views.element_plus_engineering.fileio.parameters')"
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.fileio.remark')"
              show-overflow-tooltip
            />
          </table-panel>
        </template>
      </header-layout-panel>

      <maintain-dialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :item="dialogItem"
        :loading="dialogLoading"
        :create-rules="dialogCreateRules"
        :close-on-click-modal="false"
        @onItemCreate="handleEntityCreate"
        @onItemEdit="handleEntityEditDialog"
      >
        <el-form-item
          :label="t('views.element_plus_engineering.fileio.identifier')"
          prop="identifier"
          ><el-input :disabled="dialogMode !== 'CREATE'" v-model="dialogItem.identifier"
        /></el-form-item>
        <el-form-item :label="t('views.element_plus_engineering.fileio.enabled')" prop="enabled"
          ><el-switch
            :disabled="dialogMode === 'INSPECT'"
            v-model="dialogItem.enabled"
            :active-text="t('views.element_plus_engineering.fileio.yes')"
            :inactive-text="t('views.element_plus_engineering.fileio.no')"
        /></el-form-item>
        <el-form-item :label="t('views.element_plus_engineering.fileio.type')" prop="type"
          ><el-input :readonly="dialogMode === 'INSPECT'" v-model="dialogItem.type"
            ><template v-slot:append
              ><el-button
                v-if="dialogMode !== 'INSPECT'"
                :icon="SearchIcon"
                @click="supportDialogVisible = true" /></template></el-input
        ></el-form-item>
        <el-form-item :label="t('views.element_plus_engineering.fileio.parameters')" prop="param"
          ><text-editor
            class="text-editor"
            :readonly="dialogMode === 'INSPECT'"
            v-model="dialogItem.param"
        /></el-form-item>
        <el-form-item :label="t('views.element_plus_engineering.fileio.remark')" prop="remark"
          ><el-input :readonly="dialogMode === 'INSPECT'" v-model="dialogItem.remark"
        /></el-form-item>
      </maintain-dialog>

      <writer-support-select-dialog
        v-model:visible="supportDialogVisible"
        @onConfirmed="handleSupportSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'
import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'
import WriterSupportSelectDialog from '@/views/nodes/elementPlusEngineering/fileio/writerSupport/WriterSupportSelectDialog.vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  childForTaskSetting,
  exists,
  insert,
  remove,
  update,
  type WriterInfo,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/writerInfo.ts'
import { type WriterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/writerSupport.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'WriterInfoPanel' })

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
} = useIdentityBackendPagingTablePanel<WriterInfo>(10)

const dialogVisible = ref<boolean>(false)
const dialogLoading = ref<boolean>(false)
const dialogMode = ref<'CREATE' | 'INSPECT' | 'EDIT'>('CREATE')
const dialogItem = ref({ identifier: '', enabled: true, type: '', param: '', remark: '' })
const supportDialogVisible = ref<boolean>(false)
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
  dialogMode.value = 'CREATE'
  dialogItem.value = { identifier: '', enabled: true, type: '', param: '', remark: '' }
  dialogVisible.value = true
}
function handleEntityInspect(info: WriterInfo): void {
  dialogMode.value = 'INSPECT'
  dialogItem.value = {
    identifier: info.key.identifier,
    enabled: info.enabled,
    type: info.type,
    param: info.param ?? '',
    remark: info.remark ?? '',
  }
  dialogVisible.value = true
}
function handleEntityEdit(info: WriterInfo): void {
  dialogMode.value = 'EDIT'
  dialogItem.value = {
    identifier: info.key.identifier,
    enabled: info.enabled,
    type: info.type,
    param: info.param ?? '',
    remark: info.remark ?? '',
  }
  dialogVisible.value = true
}
async function handleEntityCreate(): Promise<void> {
  dialogLoading.value = true
  try {
    await resolveResponse(
      insert({
        key: { task_setting_id: props.settingId, identifier: dialogItem.value.identifier },
        enabled: dialogItem.value.enabled,
        type: dialogItem.value.type,
        param: dialogItem.value.param,
        remark: dialogItem.value.remark,
      }),
    )
    dialogVisible.value = false
    ElMessage({
      showClose: true,
      type: 'success',
      message: t('views.element_plus_engineering.fileio.setting_created'),
    })
    await handleSearch()
  } finally {
    dialogLoading.value = false
  }
}
async function handleEntityEditDialog(): Promise<void> {
  dialogLoading.value = true
  try {
    await resolveResponse(
      update({
        key: { task_setting_id: props.settingId, identifier: dialogItem.value.identifier },
        enabled: dialogItem.value.enabled,
        type: dialogItem.value.type,
        param: dialogItem.value.param,
        remark: dialogItem.value.remark,
      }),
    )
    dialogVisible.value = false
    ElMessage({
      showClose: true,
      type: 'success',
      message: t('views.element_plus_engineering.fileio.setting_updated'),
    })
    await handleSearch()
  } finally {
    dialogLoading.value = false
  }
}
async function handleEntityDelete(row: WriterInfo): Promise<void> {
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
    await resolveResponse(remove(row.key.task_setting_id, row.key.identifier))
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
function handleSupportSelected(selection: WriterSupport): void {
  dialogItem.value.type = selection.key.string_id
  dialogItem.value.param = selection.example_param ?? ''
}
function enabledFormatter(row: WriterInfo): string {
  return row.enabled
    ? t('views.element_plus_engineering.fileio.yes')
    : t('views.element_plus_engineering.fileio.no')
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
.writer-panel-container {
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

.text-editor {
  height: 300px;
}
</style>
