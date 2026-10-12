<template>
  <div class="import-conf-panel-container">
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
              class-name="single-line"
              prop="content"
              :label="t('views.element_plus_engineering.fileio.content')"
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
        <el-form-item :label="t('views.element_plus_engineering.fileio.content')" prop="content"
          ><text-editor
            class="text-editor"
            :readonly="dialogMode === 'INSPECT'"
            v-model="dialogItem.content"
        /></el-form-item>
        <el-form-item :label="t('views.element_plus_engineering.fileio.remark')" prop="remark"
          ><el-input :readonly="dialogMode === 'INSPECT'" v-model="dialogItem.remark"
        /></el-form-item>
      </maintain-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  childForTaskSetting,
  exists,
  type ImportConf,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/importConf.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ImportConfPanel' })

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
} = useIdentityBackendPagingTablePanel<ImportConf>(10)

const dialogVisible = ref<boolean>(false)
const dialogLoading = ref<boolean>(false)
const dialogMode = ref<'CREATE' | 'INSPECT' | 'EDIT'>('CREATE')
const dialogItem = ref<{ identifier: string; content: string; remark: string }>({
  identifier: '',
  content: '',
  remark: '',
})
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
  dialogItem.value = { identifier: '', content: '', remark: '' }
  dialogVisible.value = true
}
function handleEntityInspect(info: ImportConf): void {
  dialogMode.value = 'INSPECT'
  dialogItem.value = {
    identifier: info.key.identifier,
    content: info.content ?? '',
    remark: info.remark ?? '',
  }
  dialogVisible.value = true
}
function handleEntityEdit(info: ImportConf): void {
  dialogMode.value = 'EDIT'
  dialogItem.value = {
    identifier: info.key.identifier,
    content: info.content ?? '',
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
        content: dialogItem.value.content,
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
        content: dialogItem.value.content,
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
async function handleEntityDelete(row: ImportConf): Promise<void> {
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
.import-conf-panel-container {
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
