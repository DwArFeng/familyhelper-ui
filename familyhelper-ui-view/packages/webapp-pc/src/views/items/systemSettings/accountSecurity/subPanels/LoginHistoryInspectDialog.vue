<template>
  <el-dialog
    class="login-history-inspect-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    append-to-body
    destroy-on-close
    title="登录历史详情"
    top="8vh"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="body-wrapper" v-loading="loading">
      <overlay-scrollbars-component class="scroll-bar">
        <el-divider content-position="left">基本信息</el-divider>
        <el-form class="property-form" label-position="left" label-width="80px" inline>
          <el-form-item label="登录日期" style="width: 33%">
            {{ formatTimestamp(formLoginHistory.happened_date) }}
          </el-form-item>
          <el-form-item label="登录响应" style="width: 33%">
            {{ formatResponseCode(formLoginHistory.response_code) }}
          </el-form-item>
          <el-form-item label="警报级别" style="width: 34%">
            {{ formLoginHistory.alarm_level }}
          </el-form-item>
          <el-form-item label="消息" style="width: 100%">
            {{ formLoginHistory.message }}
          </el-form-item>
          <el-form-item label="登录备注" style="width: 100%">
            {{ formLoginHistory.login_remark }}
          </el-form-item>
        </el-form>
        <el-divider content-position="left">登录参数记录</el-divider>
        <div v-if="formLoginParamRecords.length === 0" class="empty-placeholder">（无）</div>
        <el-form v-else class="property-form" label-position="left" label-width="80px" inline>
          <template
            v-for="record in formLoginParamRecords"
            :key="`${record.key.login_history_id}-${record.key.record_id}`"
          >
            <el-form-item label="键" style="width: 33%">
              {{ record.key.record_id }}
            </el-form-item>
            <el-form-item label="值" style="width: 67%">
              {{ record.value }}
            </el-form-item>
          </template>
        </el-form>
        <el-divider content-position="left">保护详情记录</el-divider>
        <div v-if="formProtectorDetailRecords.length === 0" class="empty-placeholder">（无）</div>
        <el-form v-else class="property-form" label-position="left" label-width="80px" inline>
          <template
            v-for="record in formProtectorDetailRecords"
            :key="`${record.key.login_history_id}-${record.key.record_id}`"
          >
            <el-form-item label="键" style="width: 33%">
              {{ record.key.record_id }}
            </el-form-item>
            <el-form-item label="值" style="width: 67%">
              {{ record.value }}
            </el-form-item>
          </template>
        </el-form>
      </overlay-scrollbars-component>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button @click="watchedVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElForm } from 'element-plus'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import type {
  LoginHistory,
  LoginHistoryResponseCode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginHistory.ts'
import { inspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginHistory.ts'
import type { LoginParamRecord } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginParamRecord.ts'
import { childForLoginHistory as loginParamRecordChildForLoginHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginParamRecord.ts'
import type { ProtectDetailRecord } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/protectDetailRecord.ts'
import { childForLoginHistory as protectorDetailChildForLoginHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/protectDetailRecord.ts'
import { lookupAllToList } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'LoginHistoryInspectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  loginHistoryId: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  loginHistoryId: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
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

// -----------------------------------------------------------搜索-----------------------------------------------------------
async function handleSearch(): Promise<void> {
  if (!props.loginHistoryId) {
    return
  }
  loading.value += 1
  try {
    const loginHistoryRes = await resolveResponse(inspect({ long_id: props.loginHistoryId }))
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

// -----------------------------------------------------------对话框事件-----------------------------------------------------------
function handleOpen(): void {
  handleSearch()
}

function handleClose(): void {
  watchedVisible.value = false
}

// -----------------------------------------------------------表单-----------------------------------------------------------
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

function formatResponseCode(responseCode: LoginHistoryResponseCode) {
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

.property-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
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
