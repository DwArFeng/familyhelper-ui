<template>
  <div class="account-selector-container">
    <div class="account-selector-row">
      <input
        v-model="searchText"
        class="search-input"
        type="text"
        placeholder="输入筛选用户"
        aria-label="筛选用户"
        @input="onSearchInput"
      />
      <select
        v-model="watchedModelValue"
        class="account-select"
        :disabled="loading > 0"
        aria-label="选择用户"
      >
        <option value="" disabled>请选择用户</option>
        <option
          v-for="option in filteredOptions"
          :key="option.key.string_id"
          :value="option.key.string_id"
        >
          {{ option.key.string_id }} ({{ option.display_name }})
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { type DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'

import { idLikeDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account'
import { lookupAllToList } from '@/util/lookup.ts'

defineOptions({
  name: 'AccountSelector',
})

// region Props 定义

type Props = {
  modelValue?: string
  filter?: (account: DispAccount) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  filter: () => true,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:modelValue', accountId: string): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 值处理

const watchedModelValue = ref(props.modelValue)
const searchText = ref('')

watch(
  () => props.modelValue,
  (modelValue) => {
    watchedModelValue.value = modelValue
  },
)

watch(
  () => watchedModelValue.value,
  (modelValue) => {
    emit('update:modelValue', modelValue)
  },
)

onMounted(() => {
  watchedModelValue.value = props.modelValue
  void updateOption('')
})

// endregion

// region 选项处理

const options = ref<DispAccount[]>([])
const filteredOptions = ref<DispAccount[]>([])

watch(
  () => options.value,
  () => {
    filteredOptions.value = options.value.filter(props.filter)
  },
)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(): void {
  if (searchTimer !== null) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    void updateOption(searchText.value)
  }, 250)
}

async function updateOption(pattern: string): Promise<void> {
  loading.value += 1
  try {
    options.value = await lookupAllToList((pagingInfo) => idLikeDisp(pattern, pagingInfo))
  } finally {
    loading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.account-selector-container {
  width: 100%;
}

.account-selector-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 8px;
  width: 100%;
}

.search-input {
  flex: 0 0 140px;
  min-width: 0;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.account-select {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  background: #fff;
}
</style>
