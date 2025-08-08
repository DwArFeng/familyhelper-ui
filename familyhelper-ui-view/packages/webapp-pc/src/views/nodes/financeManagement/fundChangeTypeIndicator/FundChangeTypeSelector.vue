<template>
  <div class="fund-change-type-selector-container loading-spinner__s24">
    <el-select
      class="item"
      v-loading="loading"
      v-model="watchedModelValue"
      value-key="key.string_id"
      :disabled="readonly"
      :placeholder="placeholder"
      :clearable="clearable"
    >
      <el-option
        v-for="item in fundChangeTypeIndicators"
        :key="item.key.string_id"
        :label="item.label"
        :value="item"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { type FundChangeTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator.ts'
import { lookupAllToList } from '@/util/lookup.ts'

defineOptions({
  name: 'FundChangeTypeSelector',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  modelValue: FundChangeTypeIndicator | null
  readonly?: boolean
  placeholder?: string
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  placeholder: '请选择',
  clearable: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:modelValue', value: FundChangeTypeIndicator | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------值处理逻辑-----------------------------------------------------------
const watchedModelValue = ref<FundChangeTypeIndicator | null>(null)

watch(
  () => props.modelValue,
  (value) => {
    watchedModelValue.value = value
  },
)

watch(
  () => watchedModelValue.value,
  (value) => {
    emit('update:modelValue', value)
  },
)

onMounted(() => {
  watchedModelValue.value = props.modelValue
})

// -----------------------------------------------------------查询逻辑-----------------------------------------------------------
const fundChangeTypeIndicators = ref<FundChangeTypeIndicator[]>([])

function handleFundChangeTypeIndicatorSearch(): void {
  handleFundChangeTypeIndicatorAllSearch()
}

async function handleFundChangeTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    fundChangeTypeIndicators.value = await lookupAllToList((pagingInfo) => all(pagingInfo))
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleFundChangeTypeIndicatorSearch()
})

// -----------------------------------------------------------数据刷新处理-----------------------------------------------------------
function refresh(): void {
  handleFundChangeTypeIndicatorSearch()
}

defineExpose({
  refresh,
})
</script>

<style scoped>
.item {
  width: 100%;
}
</style>
