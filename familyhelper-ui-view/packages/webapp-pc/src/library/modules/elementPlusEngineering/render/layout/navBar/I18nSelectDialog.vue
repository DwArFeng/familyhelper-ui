<template>
  <el-dialog
    class="i18n-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    destroy-on-close
    :title="t('library.element_plus_engineering.locale_selector.placeholder')"
    @keydown.ctrl.enter="handleConfirmButtonClicked"
  >
    <el-radio-group
      class="locale-radio-group"
      v-model="selection"
      :disabled="!iahnStore.ready || iahnStore.localeList.length === 0"
    >
      <el-radio
        v-for="item in iahnStore.localeList"
        :key="item.locale"
        class="locale-radio"
        border
        :value="item.locale"
      >
        <span :lang="item.locale">{{ item.label }}</span>
      </el-radio>
    </el-radio-group>
    <template v-slot:footer>
      <el-button type="primary" :disabled="!canConfirm" @click="handleConfirmButtonClicked">
        {{ t('library.element_plus_engineering.common.confirm') }}
      </el-button>
      <el-button @click="handleCancelButtonClicked">
        {{ t('library.element_plus_engineering.common.cancel') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed, onMounted, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import { type IahnStore } from '@/store/modules/iahn.ts'

defineOptions({
  name: 'I18nSelectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
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

// region Store 引入

const iahnStore = vim.ctx().store().vueStore<'iahn', IahnStore>('iahn')

// endregion

// region 可见性与选择处理

const watchedVisible = ref<boolean>(props.visible)
const selection = ref<string>('')

const canConfirm = computed<boolean>(() => {
  return (
    iahnStore.ready &&
    iahnStore.localeList.length > 0 &&
    iahnStore.localeList.some((item) => item.locale === selection.value)
  )
})

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
    if (value) {
      syncSelection()
    }
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

watch(
  () => iahnStore.ready,
  (value) => {
    if (value && watchedVisible.value) {
      syncSelection()
    }
  },
)

onMounted(() => {
  syncSelection()
})

function syncSelection(): void {
  selection.value = iahnStore.locale
}

function handleConfirmButtonClicked(): void {
  if (!canConfirm.value) {
    return
  }
  iahnStore.setLocale(selection.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.locale-radio-group {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.locale-radio {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.locale-radio span {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .locale-radio-group {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
