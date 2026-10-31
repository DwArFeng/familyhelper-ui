<template>
  <el-dialog
    class="theme-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    destroy-on-close
    :title="t('library.element_plus_engineering.theme_selector.placeholder')"
    @keydown.ctrl.enter="handleConfirmButtonClicked"
  >
    <div v-if="themeStore.ready && themeStore.themeList.length === 0" class="empty-container">
      {{ t('library.element_plus_engineering.theme_selector.no_theme') }}
    </div>
    <el-radio-group
      v-else
      class="theme-radio-group"
      v-model="selection"
      :disabled="!themeStore.ready || themeStore.themeList.length === 0"
    >
      <el-radio
        v-for="item in themeStore.themeList"
        :key="item.key"
        class="theme-radio"
        border
        :value="item.key"
      >
        <span>{{ item.label }}</span>
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

import { type ThemeStore } from '@/store/modules/theme.ts'

defineOptions({
  name: 'ThemeSelectDialog',
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

const themeStore = vim.ctx().store().vueStore<'theme', ThemeStore>('theme')

// endregion

// region 可见性与选择处理

const watchedVisible = ref<boolean>(props.visible)
const selection = ref<string>('')

const canConfirm = computed<boolean>(() => {
  return (
    themeStore.ready &&
    themeStore.themeList.length > 0 &&
    themeStore.themeList.some((item) => item.key === selection.value)
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
  () => themeStore.ready,
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
  selection.value = themeStore.theme
}

function handleConfirmButtonClicked(): void {
  if (!canConfirm.value) {
    return
  }
  themeStore.setTheme(selection.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.theme-radio-group {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.theme-radio {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.theme-radio span {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-container {
  color: var(--el-text-color-secondary);
  font-size: var(--el-font-size-base);
  text-align: center;
  padding: 24px 0;
}

@media (max-width: 768px) {
  .theme-radio-group {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
