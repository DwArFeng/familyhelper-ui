<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    align-center
    title="登录历史详情"
    :close-on-click-modal="false"
  >
    <div class="body-wrapper">
      <loading-overlay :loading="loading > 0" />
      <div class="scroll-bar">
        <section-divider title="基本信息" />
        <div class="property-form">
          <div class="property-row">
            <span class="property-label">登录日期</span>
            <span class="property-value">{{
              formatTimestamp(formLoginHistory.happened_date)
            }}</span>
          </div>
          <div class="property-row">
            <span class="property-label">登录响应</span>
            <span class="property-value">{{
              formatResponseCode(formLoginHistory.response_code)
            }}</span>
          </div>
          <div class="property-row">
            <span class="property-label">警报级别</span>
            <span class="property-value">{{ formLoginHistory.alarm_level }}</span>
          </div>
          <div class="property-row property-row--full">
            <span class="property-label">消息</span>
            <span class="property-value">{{ formLoginHistory.message }}</span>
          </div>
          <div class="property-row property-row--full">
            <span class="property-label">登录备注</span>
            <span class="property-value">{{ formLoginHistory.login_remark }}</span>
          </div>
        </div>
        <section-divider title="登录参数记录" />
        <div v-if="formLoginParamRecords.length === 0" class="empty-placeholder">（无）</div>
        <div v-else class="property-form">
          <template
            v-for="record in formLoginParamRecords"
            :key="`${record.key.login_history_id}-${record.key.record_id}`"
          >
            <div class="property-row">
              <span class="property-label">键</span>
              <span class="property-value">{{ record.key.record_id }}</span>
            </div>
            <div class="property-row property-row--wide">
              <span class="property-label">值</span>
              <span class="property-value">{{ record.value }}</span>
            </div>
          </template>
        </div>
        <section-divider title="保护详情记录" />
        <div v-if="formProtectorDetailRecords.length === 0" class="empty-placeholder">（无）</div>
        <div v-else class="property-form">
          <template
            v-for="record in formProtectorDetailRecords"
            :key="`${record.key.login_history_id}-${record.key.record_id}`"
          >
            <div class="property-row">
              <span class="property-label">键</span>
              <span class="property-value">{{ record.key.record_id }}</span>
            </div>
            <div class="property-row property-row--wide">
              <span class="property-label">值</span>
              <span class="property-value">{{ record.value }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <native-button @click="watchedVisible = false">关闭</native-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import SectionDivider from '@/components/comvisual/form/divider/SectionDivider.vue'

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

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 可见性处理

const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
    if (value && props.loginHistoryId) {
      handleSearch()
    }
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

// endregion

// region 对话框事件

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
      return '通过'
    case 10:
      return '账号不存在'
    case 20:
      return '账号已禁用'
    case 30:
      return '密码错误'
    case 40:
      return '保护器禁止'
    case 50:
      return '保护器信息不存在'
    default:
      return '（未知）'
  }
}

// endregion
</script>

<style scoped>
.body-wrapper {
  position: relative;
  width: 100%;
  min-height: 400px;
  max-height: 70vh;
}

.scroll-bar {
  overflow: auto;
  max-height: 65vh;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.property-row {
  display: flex;
  flex-direction: row;
  width: 48%;
  min-width: 200px;
}

.property-row--full {
  width: 100%;
}

.property-row--wide {
  width: 100%;
}

.property-label {
  flex-shrink: 0;
  width: 80px;
  color: #99a9bf;
  line-height: 28px;
}

.property-value {
  flex: 1;
  min-width: 0;
  line-height: 28px;
  word-break: break-word;
}

.empty-placeholder {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
