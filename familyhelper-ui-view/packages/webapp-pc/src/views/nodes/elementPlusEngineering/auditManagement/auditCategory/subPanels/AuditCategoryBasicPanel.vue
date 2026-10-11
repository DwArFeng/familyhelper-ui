<template>
  <div class="audit-category-basic-panel-container">
    <placeholder-panel
      v-if="categoryId === ''"
      :text="t('views.element_plus_engineering.audit_management.please_select_audit_category')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="handleShowEditDialog">{{
              t('views.element_plus_engineering.audit_management.edit_category')
            }}</el-button>
            <el-button type="success" @click="handleSearch">{{
              t('views.element_plus_engineering.audit_management.refresh_data')
            }}</el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesDisabled"
              @click="handleApplyChangesClicked"
            >
              {{ t('views.element_plus_engineering.audit_management.apply_changes') }}
            </el-button>
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
          <overlay-scrollbars-component class="scroll-bar">
            <el-form class="property-form" label-position="left" label-width="80px" inline>
              <el-form-item
                :label="t('views.element_plus_engineering.audit_management.category_id')"
                style="width: 50%"
              >
                {{ categoryFormItem.string_id }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.audit_management.name')"
                style="width: 50%"
              >
                {{ categoryFormItem.name }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.audit_management.enabled_state')"
                style="width: 50%"
              >
                {{ formatBoolean(categoryFormItem.enabled) }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.audit_management.remark')"
                style="width: 100%"
              >
                {{ categoryFormItem.remark }}
              </el-form-item>
            </el-form>
          </overlay-scrollbars-component>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      label-width="90px"
      v-model:visible="auditCategoryMaintainDialogVisible"
      mode="EDIT"
      :edit-title="t('views.element_plus_engineering.audit_management.edit_audit_category')"
      :loading="auditCategoryMaintainDialogLoading"
      :item="auditCategoryMaintainDialogItem"
      :edit-rules="auditCategoryMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemEdit="handleAuditCategoryEdit"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.category_id')"
        prop="key_string_id"
      >
        <el-input v-model="auditCategoryMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.audit_management.name')" prop="name">
        <el-input v-model="auditCategoryMaintainDialogItem.name" />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.enabled_state')"
        prop="enabled"
      >
        <el-switch
          v-model="auditCategoryMaintainDialogItem.enabled"
          :active-text="t('views.element_plus_engineering.audit_management.yes')"
          :inactive-text="t('views.element_plus_engineering.audit_management.no')"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.remark')"
        prop="remark"
      >
        <el-input v-model="auditCategoryMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { ElMessage } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import {
  type AuditCategory,
  get,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditCategory.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AuditCategoryBasicPanel',
})

// region Props 定义

type Props = {
  categoryId: string
  applyChangesDisabled?: boolean
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  applyChangesDisabled: false,
  mode: 'DEFAULT',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onCategoryPropertyUpdated', category: AuditCategory): void
  (e: 'onApplyChanges'): void
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 审计类别查询

async function handleSearch(): Promise<void> {
  if (props.categoryId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await resolveResponse(get({ string_id: props.categoryId }))
    categoryFormItem.value.string_id = res.key.string_id
    categoryFormItem.value.name = res.name
    categoryFormItem.value.enabled = res.enabled
    categoryFormItem.value.remark = res.remark
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.categoryId,
  () => {
    handleSearch()
  },
)

onMounted(() => {
  handleSearch()
})

function refresh(): void {
  void handleSearch()
}

defineExpose({
  refresh,
})

// endregion

// region 面板悬浮

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 审计类别表单

type CategoryFormItem = {
  string_id: string
  name: string
  enabled: boolean
  remark: string
}

const categoryFormItem = ref<CategoryFormItem>({
  string_id: '',
  name: '',
  enabled: false,
  remark: '',
})

function formatBoolean(value: boolean): string {
  return value
    ? t('views.element_plus_engineering.audit_management.yes')
    : t('views.element_plus_engineering.audit_management.no')
}

// endregion

// region 对话框

type AuditCategoryMaintainDialogItem = {
  key_string_id: string
  name: string
  enabled: boolean
  remark: string
}

const auditCategoryMaintainDialogVisible = ref<boolean>(false)
const auditCategoryMaintainDialogLoading = ref<number>(0)
const auditCategoryMaintainDialogItem = ref<AuditCategoryMaintainDialogItem>({
  key_string_id: '',
  name: '',
  enabled: true,
  remark: '',
})
const auditCategoryMaintainDialogEditRules = {
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.audit_management.name_required'),
      trigger: 'blur',
    },
  ],
}

function handleShowEditDialog(): void {
  auditCategoryMaintainDialogItem.value = {
    key_string_id: categoryFormItem.value.string_id,
    name: categoryFormItem.value.name,
    enabled: categoryFormItem.value.enabled,
    remark: categoryFormItem.value.remark,
  }
  auditCategoryMaintainDialogVisible.value = true
}

async function handleAuditCategoryEdit(item: AuditCategoryMaintainDialogItem): Promise<void> {
  auditCategoryMaintainDialogLoading.value += 1
  try {
    const payload: AuditCategory = {
      key: { string_id: item.key_string_id },
      name: item.name,
      enabled: item.enabled,
      remark: item.remark,
    }
    await resolveResponse(update(payload))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.audit_management.audit_category_updated', {
        categoryId: item.key_string_id,
      }),
      type: 'success',
    })
    emit('onCategoryPropertyUpdated', payload)
    auditCategoryMaintainDialogVisible.value = false
    await handleSearch()
  } finally {
    auditCategoryMaintainDialogLoading.value -= 1
  }
}

function handleApplyChangesClicked(): void {
  emit('onApplyChanges')
}

// endregion
</script>

<style scoped>
.audit-category-basic-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.scroll-bar {
  height: 100%;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__label) {
  width: 240px;
  color: #99a9bf;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}
</style>
