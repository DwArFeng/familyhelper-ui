<template>
  <div class="account-book-indicator-container">
    <el-input
      class="indicator loading-spinner__s24"
      v-loading="loading"
      v-model="displayValue"
      readonly
    >
      <template v-slot:prepend>
        <span>当前账本</span>
      </template>
      <template v-slot:append>
        <el-button-group class="button-group">
          <el-button class="button" :icon="SearchIcon" @click="handleShowDialog" />
          <el-button class="button" :icon="RefreshIcon" @click="loadUserPreference" />
        </el-button-group>
      </template>
    </el-input>
    <account-book-select-dialog
      v-model:visible="dialogVisible"
      :mode="mode"
      @onConfirmed="handleConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useUserPreference } from '@/composables/userPreference.ts'

import { Search as SearchIcon, Refresh as RefreshIcon } from '@element-plus/icons-vue'

import AccountBookSelectDialog from './subDialogs/AccountBookSelectDialog.vue'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import {
  exists,
  inspectDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'AccountBookIndicator',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  mode?: 'BANK_CARD' | 'BALANCE_RECORD' | 'FUND_CHANGE' | 'FINANCE_REPORT' | 'DEFAULT'
}

withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onChanged', value: DispAccountBook | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------数据逻辑-----------------------------------------------------------
const accountBook = ref<DispAccountBook | null>(null)

const displayValue = computed(() => {
  if (accountBook.value === null) {
    return '（未选择笔记本）'
  }
  return accountBook.value.name
})

async function updateAccountBook(accountBookId: string): Promise<void> {
  loading.value += 1
  try {
    if (accountBookId === '') {
      accountBook.value = null
      return
    }
    const _exists: boolean = await resolveResponse(exists({ long_id: accountBookId }))
    if (!_exists) {
      accountBook.value = null
      emit('onChanged', null)
      return
    }
    const _accountBook: DispAccountBook = await resolveResponse(
      inspectDisp({ long_id: accountBookId }),
    )
    accountBook.value = _accountBook
    emit('onChanged', _accountBook)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------选择对话框-----------------------------------------------------------
const dialogVisible = ref<boolean>(false)

function handleShowDialog(): void {
  dialogVisible.value = true
}

function handleConfirmed(neoValue: DispAccountBook, setDefault: boolean): void {
  const oldValue: DispAccountBook | null = accountBook.value
  accountBook.value = neoValue
  if (oldValue !== neoValue) {
    emit('onChanged', neoValue)
  }
  if (setDefault) {
    saveUserPreference()
  }
}

// -----------------------------------------------------------用户偏好-----------------------------------------------------------
type UserPreference = {
  accountBookId: string
}

const SETTINGREPO_CATEGORY_ID = 'finance_management.default_account_book'

const DEFAULT_USER_PREFERENCE: UserPreference = {
  accountBookId: '',
}

const { loadUserPreference, saveUserPreference } = useUserPreference<UserPreference>(
  () => SETTINGREPO_CATEGORY_ID,
  DEFAULT_USER_PREFERENCE,
  userPreferenceGetter,
  userPreferenceSetter,
)

function userPreferenceGetter(): UserPreference {
  return {
    accountBookId: accountBook.value === null ? '' : accountBook.value.key.long_id,
  }
}

function userPreferenceSetter(userPreference: UserPreference): void {
  const accountBookId: string = userPreference.accountBookId
  updateAccountBook(accountBookId)
}

onMounted(() => {
  loadUserPreference()
})
</script>

<style scoped>
.indicator {
  width: 420px;
}

/*noinspection CssUnusedSymbol*/
.indicator :deep(.el-input__inner) {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.indicator :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.button-group .button:not(:first-child) {
  padding-left: 7px;
}

.button-group .button:not(:last-child) {
  padding-right: 7px;
}
</style>
