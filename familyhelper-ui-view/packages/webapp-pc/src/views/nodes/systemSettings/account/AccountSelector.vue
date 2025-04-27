<template>
  <div class="account-selector-container">
    <el-select
      v-model="watchedModelValue"
      placeholder="请选择用户"
      filterable
      remote
      :remote-method="updateOption"
      :loading="loading > 0"
    >
      <el-option
        v-for="option in filteredOptions"
        :key="option.key.string_id"
        :value="option.key.string_id"
      >
        <template v-slot>
          <div class="account-container">
            <avatar-panel
              class="account-container-item"
              :size="32"
              :object-user-id="option.key.string_id"
              :placeholder-font-size="14"
            />
            <span class="account-container-item">{{ option.key.string_id }}</span>
            <span class="account-container-item">({{ option.display_name }})</span>
          </div>
        </template>
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import AvatarPanel from '@/components/avatar/AvatarPanel.vue'

import { type DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'

import { idLikeDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account'
import { lookupAllToList } from '@/util/lookup.ts'

defineOptions({
  name: 'AccountSelector',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  modelValue?: string
  filter?: (account: DispAccount) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  filter: () => true,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:modelValue', accountId: string): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------值处理-----------------------------------------------------------
const watchedModelValue = ref(props.modelValue)

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
})

// -----------------------------------------------------------选项处理-----------------------------------------------------------
const options = ref<DispAccount[]>([])
const filteredOptions = ref<DispAccount[]>([])

watch(
  () => options.value,
  (modelValue) => {
    filteredOptions.value = modelValue.filter(props.filter)
  },
)

async function updateOption(pattern: string): Promise<void> {
  loading.value += 1
  try {
    lookupAllToList((pagingInfo) => idLikeDisp(pattern, pagingInfo)).then((res) => {
      options.value = res
    })
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.account-selector-container {
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.account-selector-container :deep(.el-select) {
  width: 100%;
}

.account-container {
  height: 34px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.account-container-item:not(:last-child) {
  margin-right: 10px;
}

.account-container-item:last-child {
  color: grey;
}
</style>
