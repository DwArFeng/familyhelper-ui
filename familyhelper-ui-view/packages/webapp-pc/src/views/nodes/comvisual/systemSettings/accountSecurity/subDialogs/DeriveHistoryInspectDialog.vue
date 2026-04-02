<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    align-center
    title="派生历史详情"
    :close-on-click-modal="false"
  >
    <div class="body-wrapper">
      <loading-overlay :loading="loading > 0" />
      <div class="scroll-bar">
        <section-divider title="基本信息" />
        <div class="property-form">
          <div class="property-row">
            <span class="property-label">派生日期</span>
            <span class="property-value">{{
              formatTimestamp(formDeriveHistory.happened_date)
            }}</span>
          </div>
          <div class="property-row">
            <span class="property-label">派生响应</span>
            <span class="property-value">{{
              formatResponseCode(formDeriveHistory.response_code)
            }}</span>
          </div>
          <div class="property-row property-row--full">
            <span class="property-label">派生备注</span>
            <span class="property-value">{{ formDeriveHistory.derive_remark }}</span>
          </div>
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
import SectionDivider from '@/components/comvisual/form/divider/sectionDivider/SectionDivider.vue'

import {
  type DeriveHistory,
  type DeriveResponseCode,
  get as getDeriveHistory,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/deriveHistory.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

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

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 可见性处理

const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
    if (value && props.deriveHistoryId) {
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

// endregion

// region 对话框事件

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
      return '通过'
    case 10:
      return '登录状态不存在'
    case 15:
      return '登录状态过期'
    case 20:
      return '账号不存在'
    case 30:
      return '账号禁用'
    case 40:
      return '序列号版本不一致'
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
  min-height: 200px;
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

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
