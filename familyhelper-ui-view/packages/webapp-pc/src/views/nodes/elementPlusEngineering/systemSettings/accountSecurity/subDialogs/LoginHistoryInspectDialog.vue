<template>
  <el-dialog
    class="login-history-inspect-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    append-to-body
    destroy-on-close
    :title="t('views.element_plus_engineering.system_settings.login_history_details')"
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
            :label="t('views.element_plus_engineering.system_settings.login_date')"
            style="width: 33%"
          >
            {{ formatTimestamp(formLoginHistory.happened_date) }}
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.login_response')"
            style="width: 33%"
          >
            {{ formatResponseCode(formLoginHistory.response_code) }}
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.alarm_level')"
            style="width: 34%"
          >
            {{ formLoginHistory.alarm_level }}
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.message')"
            style="width: 100%"
          >
            {{ formLoginHistory.message }}
          </el-form-item>
          <el-form-item
            :label="t('views.element_plus_engineering.system_settings.login_remark')"
            style="width: 100%"
          >
            {{ formLoginHistory.login_remark }}
          </el-form-item>
        </el-form>
        <el-divider content-position="left">{{
          t('views.element_plus_engineering.system_settings.login_parameter_record')
        }}</el-divider>
        <div v-if="formLoginParamRecords.length === 0" class="empty-placeholder">
          {{ t('views.element_plus_engineering.system_settings.none_parenthesized') }}
        </div>
        <el-form v-else class="property-form" label-position="left" label-width="80px" inline>
          <template
            v-for="record in formLoginParamRecords"
            :key="`${record.key.login_history_id}-${record.key.record_id}`"
          >
            <el-form-item
              :label="t('views.element_plus_engineering.system_settings.key')"
              style="width: 33%"
            >
              {{ record.key.record_id }}
            </el-form-item>
            <el-form-item
              :label="t('views.element_plus_engineering.system_settings.value')"
              style="width: 67%"
            >
              {{ record.value }}
            </el-form-item>
          </template>
        </el-form>
        <el-divider content-position="left">{{
          t('views.element_plus_engineering.system_settings.protector_detail_record')
        }}</el-divider>
        <div v-if="formProtectorDetailRecords.length === 0" class="empty-placeholder">
          {{ t('views.element_plus_engineering.system_settings.none_parenthesized') }}
        </div>
        <el-form v-else class="property-form" label-position="left" label-width="80px" inline>
          <template
            v-for="record in formProtectorDetailRecords"
            :key="`${record.key.login_history_id}-${record.key.record_id}`"
          >
            <el-form-item
              :label="t('views.element_plus_engineering.system_settings.key')"
              style="width: 33%"
            >
              {{ record.key.record_id }}
            </el-form-item>
            <el-form-item
              :label="t('views.element_plus_engineering.system_settings.value')"
              style="width: 67%"
            >
              {{ record.value }}
            </el-form-item>
          </template>
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

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import {
  type LoginHistory,
  type LoginResponseCode,
  get as getLoginHistory,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/loginHistory.ts'
import {
  type LoginParamRecord,
  childForLoginHistory as loginParamRecordChildForLoginHistory,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/loginParamRecord.ts'
import {
  type ProtectDetailRecord,
  childForLoginHistory as protectorDetailChildForLoginHistory,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectDetailRecord.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'LoginHistoryInspectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  loginHistoryId: string
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
  if (!props.loginHistoryId) {
    return
  }
  loading.value += 1
  try {
    const loginHistoryRes = await resolveResponse(
      getLoginHistory({ long_id: props.loginHistoryId }),
    )
    updateLoginHistory(loginHistoryRes)
    const loginParamsRes = await lookupAllToList((pagingInfo) =>
      loginParamRecordChildForLoginHistory({ long_id: props.loginHistoryId }, pagingInfo),
    )
    updateLoginParamRecords(loginParamsRes)
    const protectorDetailRes = await lookupAllToList((pagingInfo) =>
      protectorDetailChildForLoginHistory({ long_id: props.loginHistoryId }, pagingInfo),
    )
    updateProtectorDetailRecords(protectorDetailRes)
  } finally {
    loading.value -= 1
  }
}

function updateLoginHistory(res: LoginHistory): void {
  formLoginHistory.value.happened_date = res.happened_date
  formLoginHistory.value.response_code = res.response_code
  formLoginHistory.value.message = res.message
  formLoginHistory.value.alarm_level = res.alarm_level
  formLoginHistory.value.login_remark = res.login_remark
}

function updateLoginParamRecords(res: LoginParamRecord[]): void {
  formLoginParamRecords.value = res
}

function updateProtectorDetailRecords(res: ProtectDetailRecord[]): void {
  formProtectorDetailRecords.value = res
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

type FormLoginHistory = Omit<LoginHistory, 'key' | 'account_id'>

const formLoginHistory = ref<FormLoginHistory>({
  happened_date: 0,
  response_code: 0,
  message: '',
  alarm_level: 0,
  login_remark: '',
})
const formLoginParamRecords = ref<LoginParamRecord[]>([])
const formProtectorDetailRecords = ref<ProtectDetailRecord[]>([])

function formatResponseCode(responseCode: LoginResponseCode): string {
  switch (responseCode) {
    case 0:
      return t('views.element_plus_engineering.system_settings.accepted')
    case 10:
      return t('views.element_plus_engineering.system_settings.account_not_found')
    case 20:
      return t('views.element_plus_engineering.system_settings.account_is_disabled')
    case 30:
      return t('views.element_plus_engineering.system_settings.incorrect_password')
    case 40:
      return t('views.element_plus_engineering.system_settings.protector_disabled')
    case 50:
      return t('views.element_plus_engineering.system_settings.protector_information_not_found')
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

.empty-placeholder {
  color: #606266;
  font-size: 14px;
}
</style>
