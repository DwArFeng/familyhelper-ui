<template>
  <el-dialog
    class="derive-history-inspect-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    append-to-body
    destroy-on-close
    title="派生历史详情"
    top="8vh"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="body-wrapper" v-loading="loading">
      <overlay-scrollbars-component class="scroll-bar">
        <el-divider content-position="left">基本信息</el-divider>
        <el-form class="property-form" label-position="left" label-width="80px" inline>
          <el-form-item label="派生日期" style="width: 50%">
            {{ formatTimestamp(formDeriveHistory.happened_date) }}
          </el-form-item>
          <el-form-item label="派生响应" style="width: 50%">
            {{ formatResponseCode(formDeriveHistory.response_code) }}
          </el-form-item>
          <el-form-item label="派生备注" style="width: 100%">
            {{ formDeriveHistory.derive_remark }}
          </el-form-item>
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
  DeriveHistory,
  DeriveHistoryResponseCode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/deriveHistory.ts'
import { inspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/deriveHistory.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'DeriveHistoryInspectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  deriveHistoryId: string
}

const props = defineProps<Props>()

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
  if (!props.deriveHistoryId) {
    return
  }
  loading.value += 1
  try {
    const deriveHistoryRes = await resolveResponse(inspect({ long_id: props.deriveHistoryId }))
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

// -----------------------------------------------------------对话框事件-----------------------------------------------------------
function handleOpen(): void {
  handleSearch()
}

function handleClose(): void {
  watchedVisible.value = false
}

// -----------------------------------------------------------表单-----------------------------------------------------------
type FormDeriveHistory = Omit<DeriveHistory, 'key' | 'account_id'>

const formDeriveHistory = ref<FormDeriveHistory>({
  happened_date: 0,
  response_code: 0,
  derive_remark: '',
})

function formatResponseCode(responseCode: DeriveHistoryResponseCode) {
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
</style>
