<template>
  <div class="child-for-meta-missing-sub-panel-container">
    <div class="placeholder" v-if="propsInvalid">请指定通知设置、主题、用户</div>
    <div class="valid-container" v-else v-loading="loading">
      <div class="placeholder" v-if="metaIndicatorItems.length === 0">没有需要添加的元数据项</div>
      <div class="select-container" v-else>
        <el-input v-model="labelFilterBarValue" placeholder="名称筛选" clearable />
        <el-table
          class="table"
          height="100%"
          stripe
          tooltip-effect="dark"
          border
          :data="metaIndicatorTableFilteredData"
          @selection-change="handleMetaIndicatorTableSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="label" label="属性名称" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column prop="default_value" label="默认值" show-overflow-tooltip />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import type { MetaIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import { metaMissing } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'ChildForMetaMissingSubPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  notifySettingId: string
  topicId: string
  accountId: string
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onSelectionChanged', selection: MetaIndicator[]): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const labelFilterBarValue = ref<string>('')

// -----------------------------------------------------------元数据指示器查询-----------------------------------------------------------
const propsInvalid = computed<boolean>(() => {
  return !props.notifySettingId || !props.topicId || !props.accountId
})

watch(
  () => props.notifySettingId,
  () => {
    handleMetaIndicatorSearch()
  },
)

watch(
  () => props.topicId,
  () => {
    handleMetaIndicatorSearch()
  },
)

watch(
  () => props.accountId,
  () => {
    handleMetaIndicatorSearch()
  },
)

function handleMetaIndicatorSearch(): void {
  if (propsInvalid.value) {
    metaIndicatorItems.value = []
  } else {
    handleMetaIndicatorMetaMissingSearch()
  }
}

async function handleMetaIndicatorMetaMissingSearch(): Promise<void> {
  loading.value += 1
  try {
    metaIndicatorItems.value = await resolveResponse(
      metaMissing(props.notifySettingId, props.topicId, props.accountId),
    )
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleMetaIndicatorSearch()
})

// -----------------------------------------------------------元数据指示器表格-----------------------------------------------------------
const metaIndicatorItems = ref<MetaIndicator[]>([])

const metaIndicatorTableFilteredData = computed<MetaIndicator[]>(() => {
  if (!labelFilterBarValue.value) {
    return metaIndicatorItems.value
  }
  return metaIndicatorItems.value.filter((data) => data.label.includes(labelFilterBarValue.value))
})

function handleMetaIndicatorTableSelectionChange(selection: MetaIndicator[]): void {
  emit('onSelectionChanged', selection)
}
</script>

<style scoped>
.child-for-meta-missing-sub-panel-container {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.select-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.select-container .table {
  height: 0;
  flex-grow: 1;
  margin-top: 5px;
}

.valid-container {
  width: 100%;
  height: 100%;
}
</style>
