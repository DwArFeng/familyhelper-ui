<template>
  <el-dialog
    class="derive-history-inspect-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    append-to-body
    destroy-on-close
    :title="t('views.element_plus_engineering.system_settings.derive_history_details')"
    top="8vh"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="body-wrapper" v-loading="loading">
      <overlay-scrollbars-component class="scroll-bar">
        <el-divider content-position="left">{{
          t('views.element_plus_engineering.system_settings.basic_information')
        }}</el-divider>
        <el-form class="property-form" label-position="left" label-width="80px" inline>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.derive_date')"
            style="width: 50%"
          >
            {{ formatTimestamp(formDeriveHistory.happened_date) }}
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.derive_response')"
            style="width: 50%"
          >
            {{ formatResponseCode(formDeriveHistory.response_code) }}
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.derive_remark')"
            style="width: 100%"
          >
            {{ formDeriveHistory.derive_remark }}
          </el-form-item>
        </el-form>
      </overlay-scrollbars-component>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button @click="watchedVisible = false">{{
          t('views.element_plus_engineering.system_settings.close')
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElForm } from 'element-plus'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import {
  type DeriveHistory,
  type DeriveResponseCode,
  get as getDeriveHistory,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/deriveHistory.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'DeriveHistoryInspectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  deriveHistoryId: string
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 可见性处理

const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 搜索

async function handleSearch(): Promise<void> {
  if (!props.deriveHistoryId) {
    return
  }
  loading.value += 1
  try {
    const deriveHistoryRes = await resolveResponse(
      getDeriveHistory({ long_id: props.deriveHistoryId }),
    )
    updateDeriveHistory(deriveHistoryRes)
  } finally {
    loading.value -= 1
  }
}

function updateDeriveHistory(res: DeriveHistory): void {
  formDeriveHistory.value.happened_date = res.happened_date
  formDeriveHistory.value.response_code = res.response_code
  formDeriveHistory.value.derive_remark = res.derive_remark
}

onMounted(() => {
  handleSearch()
})

// endregion

// region 对话框事件

function handleOpen(): void {
  handleSearch()
}

function handleClose(): void {
  watchedVisible.value = false
}

// endregion

// region 表单

type FormDeriveHistory = Omit<DeriveHistory, 'key' | 'account_id'>

const formDeriveHistory = ref<FormDeriveHistory>({
  happened_date: 0,
  response_code: 0,
  derive_remark: '',
})

function formatResponseCode(responseCode: DeriveResponseCode): string {
  switch (responseCode) {
    case 0:
      return t('views.element_plus_engineering.system_settings.accepted')
    case 10:
      return t('views.element_plus_engineering.system_settings.login_state_not_found')
    case 15:
      return t('views.element_plus_engineering.system_settings.login_state_expired')
    case 20:
      return t('views.element_plus_engineering.system_settings.account_not_found')
    case 30:
      return t('views.element_plus_engineering.system_settings.account_disabled')
    case 40:
      return t('views.element_plus_engineering.system_settings.serial_version_mismatch')
    default:
      return t('views.element_plus_engineering.system_settings.unknown_parenthesized')
  }
}

// endregion
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.asset-catalog-select-dialog-container :deep(.el-dialog) {
  margin-bottom: 0 !important;
}

.body-wrapper {
  width: 100%;
  height: 550px;
  display: flex;
  flex-direction: column;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
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
