<template>
  <div class="setting-category-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="showSettingCategoryCreateMaintainDialog"
          >
            新建类型
          </el-button>
          <el-button type="success" @click="handleSettingCategorySearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-input
            class="id-search-bar"
            v-model="idSearchBarValue"
            clearable
            @keydown.enter="handleSettingCategorySearch"
            @clear="handleSettingCategorySearch"
          >
            <template v-slot:prepend>
              <span>类型 ID</span>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleSettingCategorySearch" />
            </template>
          </el-input>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesButtonDisabled"
            @click="handleApplyChanges"
          >
            应用变更
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="settingCategoryTableCurrentPage"
          v-model:page-size="settingCategoryTablePageSize"
          :item-count="settingCategoryTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="settingCategoryTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleSettingCategoryPagingAttributeChanged"
          @onItemInspect="handleShowSettingCategoryInspectDialog"
          @onItemEdit="handleShowSettingCategoryEditDialog"
          @onItemDelete="handleSettingCategoryDelete"
        >
          <template v-slot:default>
            <el-table-column prop="key.string_id" label="配置类型" show-overflow-tooltip />
            <el-table-column prop="formatter_type" label="格式化器类型" show-overflow-tooltip />
            <el-table-column prop="formatter_param" label="格式化器参数" class-name="single-line" />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </template>
          <template
            v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
          >
            <ul>
              <li
                @click="
                  handleSettingCategoryCopyKeyContextmenuClicked(row as SettingCategory, close)
                "
              >
                复制主键
              </li>
              <el-divider />
              <li @click="fireItemInspect">查看...</li>
              <li @click="fireItemEdit">编辑...</li>
              <li @click="fireItemDelete">删除...</li>
            </ul>
          </template>
        </table-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      label-width="110px"
      v-model:visible="settingCategoryMaintainDialogVisible"
      :loading="settingCategoryMaintainDialogLoading"
      :mode="settingCategoryMaintainDialogMode"
      :item="settingCategoryMaintainDialogItem"
      :create-rules="settingCategoryMaintainDialogCreateRules"
      :edit-rules="settingCategoryMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleSettingCategoryCreate"
      @onItemEdit="handleSettingCategoryEdit"
    >
      <el-form-item label="配置类型" prop="key_string_id">
        <el-input
          v-model="settingCategoryMaintainDialogItem.key_string_id"
          oninput="this.value = this.value.toLowerCase()"
          :readonly="settingCategoryMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="格式化器类型" prop="formatter_type">
        <el-input
          v-model="settingCategoryMaintainDialogItem.formatter_type"
          :readonly="settingCategoryMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>
            <el-button
              v-if="settingCategoryMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="formatterSupportDialogVisible = true"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="格式化器参数" prop="formatter_param">
        <text-editor
          class="text-editor"
          v-model="settingCategoryMaintainDialogItem.formatter_param"
          :readonly="settingCategoryMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="settingCategoryMaintainDialogItem.remark"
          :readonly="settingCategoryMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <formatter-support-select-dialog
      v-model:visible="formatterSupportDialogVisible"
      @onConfirmed="handleFormatterSupportSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import type { FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import FormatterSupportSelectDialog from '@/views/items/settingrepo/formatterSupport/FormatterSupportSelectDialog.vue'

import type { SettingCategory } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingCategory.ts'
import {
  all,
  exists,
  idLike,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingCategory.ts'
import type { FormatterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/formatterSupport.ts'
import { exists as existsSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/formatterSupport.ts'
import { resetFormat } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/reset.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'SettingCategory',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const idSearchBarValue = ref<string>('')
const applyChangesButtonDisabled = ref<boolean>(false)

async function handleApplyChanges(): Promise<void> {
  loading.value += 1
  try {
    applyChangesButtonDisabled.value = true
    await resolveResponse(resetFormat())
    ElMessage({
      showClose: true,
      message: '变更应用成功！后台状态刷新中，请不要频繁点击',
      type: 'success',
      center: true,
    })
    setTimeout(() => {
      applyChangesButtonDisabled.value = false
    }, 3000)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------配置类型搜索-----------------------------------------------------------
function handleSettingCategorySearch(): void {
  if (idSearchBarValue.value !== '') {
    handleSettingCategoryIdLikeSearch()
  } else {
    handleSettingCategoryAllSearch()
  }
}

async function handleSettingCategoryIdLikeSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => idLike(idSearchBarValue.value, pagingInfo),
      settingCategoryTablePagingInfo.value,
    )
    updateSettingCategoryTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleSettingCategoryAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      settingCategoryTablePagingInfo.value,
    )
    updateSettingCategoryTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSettingCategorySearch()
})

// -----------------------------------------------------------配置类型表格处理-----------------------------------------------------------
const {
  currentPage: settingCategoryTableCurrentPage,
  pageSize: settingCategoryTablePageSize,
  itemCount: settingCategoryTableItemCount,
  items: settingCategoryTableItems,
  pagingInfo: settingCategoryTablePagingInfo,
  updateByLookup: updateSettingCategoryTableByLookup,
} = useIdentityBackendPagingTablePanel<SettingCategory>(15)

function handleSettingCategoryPagingAttributeChanged(): void {
  handleSettingCategorySearch()
}

async function handleSettingCategoryCopyKeyContextmenuClicked(
  row: SettingCategory,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.string_id)
  ElMessage({
    showClose: true,
    message: '复制成功',
    type: 'success',
    center: true,
  })
}

function handleShowSettingCategoryInspectDialog(item: SettingCategory): void {
  showSettingCategoryInspectMaintainDialog(item)
}

function handleShowSettingCategoryEditDialog(item: SettingCategory): void {
  showSettingCategoryEditMaintainDialog(item)
}

async function handleSettingCategoryDelete(item: SettingCategory): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此配置类型。<br>' +
        '<div style="color: #b22222"><b>如果您不知道删除该类型后会产生什么后果，' +
        '请不要进行操作！</b></div>' +
        '<b>错误的操作可能导致前端界面、后台出错，甚至崩溃！</b><br>' +
        '是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: `配置类型 ${item.key} 删除成功`,
      type: 'success',
      center: true,
    })
    handleSettingCategorySearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------配置类型维护对话框处理-----------------------------------------------------------
type SettingCategoryMaintainDialogItem = {
  key_string_id: string
  formatter_type: string
  formatter_param: string
  remark: string
}

const {
  visible: settingCategoryMaintainDialogVisible,
  item: settingCategoryMaintainDialogItem,
  mode: settingCategoryMaintainDialogMode,
  showCreateDialog: showSettingCategoryCreateMaintainDialog,
  showEditDialog: showSettingCategoryEditMaintainDialog,
  showInspectDialog: showSettingCategoryInspectMaintainDialog,
} = useGeneralMaintainDialog<SettingCategory, SettingCategoryMaintainDialogItem>(
  settingCategoryMaintainDialogItemMap,
  {
    key_string_id: '',
    formatter_type: '',
    formatter_param: '',
    remark: '',
  },
)
const settingCategoryMaintainDialogLoading = ref<number>(0)
const settingCategoryMaintainDialogKeyValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('配置类型 ID 不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('配置类型已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const settingCategoryMaintainDialogFormatterTypeValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('格式化器类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(existsSupport({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('格式化器类型不支持'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const settingCategoryMaintainDialogCreateRules = ref({
  key_string_id: [
    {
      validator: settingCategoryMaintainDialogKeyValidator,
      trigger: 'blur',
    },
    { required: true, message: '配置类型 ID 不能为空', trigger: 'blur' },
  ],
  formatter_type: [
    { validator: settingCategoryMaintainDialogFormatterTypeValidator, trigger: 'blur' },
    { required: true, message: '格式化器类型不能为空', trigger: 'blur' },
  ],
})
const settingCategoryMaintainDialogEditRules = ref({
  formatter_type: [
    { validator: settingCategoryMaintainDialogFormatterTypeValidator, trigger: 'blur' },
    { required: true, message: '格式化器类型不能为空', trigger: 'blur' },
  ],
})

function settingCategoryMaintainDialogItemMap(
  t: SettingCategory,
): SettingCategoryMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    formatter_type: t.formatter_type,
    formatter_param: t.formatter_param,
    remark: t.remark,
  }
}

async function handleSettingCategoryCreate(item: SettingCategoryMaintainDialogItem): Promise<void> {
  settingCategoryMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: { string_id: item.key_string_id },
        formatter_type: item.formatter_type,
        formatter_param: item.formatter_param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `配置类型 ${item.key_string_id} 创建成功`,
      type: 'success',
      center: true,
    })
    handleSettingCategorySearch()
    settingCategoryMaintainDialogVisible.value = false
  } finally {
    settingCategoryMaintainDialogLoading.value -= 1
  }
}

async function handleSettingCategoryEdit(item: SettingCategoryMaintainDialogItem): Promise<void> {
  settingCategoryMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { string_id: item.key_string_id },
        formatter_type: item.formatter_type,
        formatter_param: item.formatter_param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `配置类型 ${item.key_string_id} 更新成功`,
      type: 'success',
      center: true,
    })
    handleSettingCategorySearch()
    settingCategoryMaintainDialogVisible.value = false
  } finally {
    settingCategoryMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------格式化器选择对话框处理-----------------------------------------------------------
const formatterSupportDialogVisible = ref<boolean>(false)

function handleFormatterSupportSelected(value: FormatterSupport): void {
  settingCategoryMaintainDialogItem.value.formatter_type = value.key.string_id
  settingCategoryMaintainDialogItem.value.formatter_param = value.example_param
}
</script>

<style scoped>
.setting-category-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}

.text-editor {
  height: 300px;
}
</style>
