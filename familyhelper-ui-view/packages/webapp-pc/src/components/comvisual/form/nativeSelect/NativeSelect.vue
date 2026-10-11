<template>
  <div
    ref="rootRef"
    class="native-select"
    :class="{
      'is-disabled': disabled,
      'is-multiple': multiple,
      'is-opened': opened,
      'is-collapse-tags': multiple && collapseTags,
    }"
  >
    <div
      ref="controlRef"
      class="native-select__control"
      role="combobox"
      :aria-expanded="opened"
      :aria-disabled="disabled"
      tabindex="0"
      @click="toggleOpened"
      @keydown.enter.prevent="toggleOpened"
      @keydown.space.prevent="toggleOpened"
    >
      <div class="native-select__values">
        <template v-if="multiple">
          <span
            v-if="selectedOptions.length === 0 && !searchText"
            class="native-select__placeholder"
          >
            {{ placeholder }}
          </span>
          <span
            v-for="option in visibleSelectedOptions"
            :key="String(option.value)"
            class="native-select__tag"
          >
            <span class="native-select__tag-label">{{ option.label }}</span>
            <button
              v-if="!disabled"
              class="native-select__tag-remove"
              type="button"
              :aria-label="`移除 ${option.label}`"
              @click.stop="removeValue(String(option.value))"
            >
              ×
            </button>
          </span>
          <span
            v-if="collapsedSelectedCount > 0"
            ref="collapseTagRef"
            class="native-select__tag native-select__tag--collapse"
            @mouseenter="onCollapseTagEnter"
            @mouseleave="scheduleHideCollapseTooltip"
          >
            + {{ collapsedSelectedCount }}
          </span>
        </template>
        <template v-else>
          <span v-if="!selectedSingleLabel && !searchText" class="native-select__placeholder">
            {{ placeholder }}
          </span>
          <span v-else-if="!searchText" class="native-select__single-label">{{
            selectedSingleLabel
          }}</span>
        </template>
        <input
          v-if="filterable && opened"
          v-model="searchText"
          class="native-select__search"
          type="search"
          autocomplete="off"
          :disabled="disabled"
          aria-label="过滤选项"
          @click.stop
          @keydown.stop
        />
      </div>
      <button
        v-if="showClearButton"
        class="native-select__clear"
        type="button"
        aria-label="清空选择"
        @click.stop="clearSelection"
      >
        ×
      </button>
      <span class="native-select__arrow" aria-hidden="true">{{ opened ? '▴' : '▾' }}</span>
    </div>
    <Teleport to="body">
      <div
        v-if="collapseTooltipVisible"
        ref="collapseTooltipRef"
        class="native-select__collapse-tooltip"
        :style="collapseTooltipStyle"
        role="tooltip"
        @mouseenter="cancelHideCollapseTooltip"
        @mouseleave="scheduleHideCollapseTooltip"
      >
        <span
          v-for="option in selectedOptions"
          :key="String(option.value)"
          class="native-select__collapse-tooltip-tag"
        >
          {{ option.label }}
        </span>
      </div>
    </Teleport>
    <Teleport to="body">
      <div
        v-if="opened"
        ref="optionsRef"
        class="native-select__options"
        role="listbox"
        :style="optionsFloatingStyle"
        :aria-multiselectable="multiple ? 'true' : undefined"
      >
        <template v-if="multiple">
          <label
            v-for="option in filteredOptions"
            :key="String(option.value)"
            class="native-select__option"
          >
            <input
              type="checkbox"
              :checked="selectedValues.includes(String(option.value))"
              :disabled="disabled"
              @change="toggleValue(String(option.value))"
            />
            <span>{{ option.label }}</span>
          </label>
        </template>
        <template v-else>
          <div
            v-for="option in filteredOptions"
            :key="String(option.value)"
            class="native-select__option native-select__option--single"
            :class="{ 'native-select__option--selected': isSingleSelected(option.value) }"
            role="option"
            :aria-selected="isSingleSelected(option.value)"
            @click="selectSingle(String(option.value))"
          >
            <span>{{ option.label }}</span>
          </div>
        </template>
        <div v-if="filteredOptions.length === 0" class="native-select__empty">无匹配选项</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

defineOptions({
  name: 'NativeSelect',
})

// region Props 定义

export type NativeSelectOption = {
  label: string
  value: string | number
}

type Props = {
  modelValue: string | number | string[]
  options: NativeSelectOption[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
  filterable?: boolean
  clearable?: boolean
  /** 多选时折叠 tag，仅展示前若干项并以 +N 表示其余（对齐 Element Plus collapse-tags） */
  collapseTags?: boolean
  /** 悬停 +N 时浮层展示全部已选 tag（对齐 Element Plus collapse-tags-tooltip，需配合 collapse-tags） */
  collapseTagsTooltip?: boolean
  /** collapse-tags 下最多展示的标签数，超出部分计入 +N */
  maxCollapseTags?: number
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  placeholder: '',
  disabled: false,
  filterable: true,
  clearable: undefined,
  collapseTags: false,
  collapseTagsTooltip: false,
  maxCollapseTags: 1,
})

// endregion

// region Emits 定义

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | string[]): void
}>()

// endregion

// region 状态

const rootRef = ref<HTMLElement | null>(null)
const controlRef = ref<HTMLElement | null>(null)
const optionsRef = ref<HTMLElement | null>(null)
const collapseTagRef = ref<HTMLElement | null>(null)
const collapseTooltipRef = ref<HTMLElement | null>(null)
const opened = ref(false)
const collapseTooltipVisible = ref(false)
const collapseTooltipStyle = ref<Record<string, string>>({})
let collapseTooltipHideTimer: ReturnType<typeof setTimeout> | null = null
const searchText = ref('')
const optionsFloatingStyle = ref<Record<string, string>>({})
const selectedValues = ref<string[]>(
  props.multiple && Array.isArray(props.modelValue) ? [...props.modelValue] : [],
)

const effectiveClearable = computed(() => {
  if (props.clearable !== undefined) {
    return props.clearable
  }
  return props.multiple
})

const showClearButton = computed(() => {
  if (!effectiveClearable.value || props.disabled) {
    return false
  }
  if (props.multiple) {
    return selectedOptions.value.length > 0
  }
  return props.modelValue !== '' && props.modelValue !== undefined
})

watch(
  () => props.modelValue,
  (value) => {
    if (props.multiple && Array.isArray(value)) {
      selectedValues.value = [...value]
    }
  },
)

const selectedOptions = computed(() => {
  const selected = new Set(selectedValues.value)
  return props.options.filter((option) => selected.has(String(option.value)))
})

const visibleSelectedOptions = computed(() => {
  if (!props.multiple || !props.collapseTags) {
    return selectedOptions.value
  }
  const maxVisible = Math.max(0, props.maxCollapseTags)
  if (selectedOptions.value.length <= maxVisible) {
    return selectedOptions.value
  }
  return selectedOptions.value.slice(0, maxVisible)
})

const collapsedSelectedOptions = computed(() => {
  if (!props.multiple || !props.collapseTags) {
    return []
  }
  const maxVisible = Math.max(0, props.maxCollapseTags)
  if (selectedOptions.value.length <= maxVisible) {
    return []
  }
  return selectedOptions.value.slice(maxVisible)
})

const collapsedSelectedCount = computed(() => collapsedSelectedOptions.value.length)

const selectedSingleLabel = computed(() => {
  if (props.multiple) {
    return ''
  }
  const match = props.options.find((option) => String(option.value) === String(props.modelValue))
  return match ? match.label : ''
})

const filteredOptions = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) {
    return props.options
  }
  return props.options.filter((option) => String(option.label).toLowerCase().includes(keyword))
})

// endregion

// region 选择处理

function emitSelectedValues(values: string[]): void {
  selectedValues.value = values
  emit('update:modelValue', values)
}

function updateOptionsPosition(): void {
  const control = controlRef.value
  if (!control) {
    return
  }
  const rect = control.getBoundingClientRect()
  optionsFloatingStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

function cancelHideCollapseTooltip(): void {
  if (collapseTooltipHideTimer !== null) {
    clearTimeout(collapseTooltipHideTimer)
    collapseTooltipHideTimer = null
  }
}

function hideCollapseTooltip(): void {
  cancelHideCollapseTooltip()
  collapseTooltipVisible.value = false
}

function scheduleHideCollapseTooltip(): void {
  cancelHideCollapseTooltip()
  collapseTooltipHideTimer = setTimeout(() => {
    collapseTooltipVisible.value = false
    collapseTooltipHideTimer = null
  }, 200)
}

function updateCollapseTooltipPosition(): void {
  const tag = collapseTagRef.value
  const tooltip = collapseTooltipRef.value
  if (!tag) {
    return
  }
  const rect = tag.getBoundingClientRect()
  const tooltipHeight = tooltip?.offsetHeight ?? 0
  const tooltipWidth = tooltip?.offsetWidth ?? 0
  const gap = 8
  const viewportMargin = 8
  const centerX = rect.left + rect.width / 2
  const clampedCenterX = Math.min(
    window.innerWidth - viewportMargin - tooltipWidth / 2,
    Math.max(viewportMargin + tooltipWidth / 2, centerX),
  )
  const placeAbove = rect.top - tooltipHeight - gap > viewportMargin
  if (placeAbove) {
    collapseTooltipStyle.value = {
      top: `${rect.top - gap}px`,
      left: `${clampedCenterX}px`,
      transform: 'translate(-50%, -100%)',
    }
    return
  }
  collapseTooltipStyle.value = {
    top: `${rect.bottom + gap}px`,
    left: `${clampedCenterX}px`,
    transform: 'translate(-50%, 0)',
  }
}

function onCollapseTagEnter(): void {
  if (!props.collapseTags || !props.collapseTagsTooltip || collapsedSelectedCount.value === 0) {
    return
  }
  cancelHideCollapseTooltip()
  collapseTooltipVisible.value = true
  nextTick(() => {
    updateCollapseTooltipPosition()
  })
}

function toggleOpened(): void {
  if (props.disabled) {
    return
  }
  hideCollapseTooltip()
  opened.value = !opened.value
  if (!opened.value) {
    searchText.value = ''
  }
}

function toggleValue(value: string): void {
  if (props.disabled) {
    return
  }
  const values = selectedValues.value.includes(value)
    ? selectedValues.value.filter((item) => item !== value)
    : [...selectedValues.value, value]
  emitSelectedValues(values)
}

function removeValue(value: string): void {
  emitSelectedValues(selectedValues.value.filter((item) => item !== value))
}

function isSingleSelected(value: string | number): boolean {
  return String(value) === String(props.modelValue)
}

function selectSingle(raw: string): void {
  if (props.disabled) {
    return
  }
  const match = props.options.find((option) => String(option.value) === raw)
  if (match) {
    emit('update:modelValue', match.value)
  }
  opened.value = false
  searchText.value = ''
}

function clearSelection(): void {
  if (props.multiple) {
    emitSelectedValues([])
    return
  }
  emit('update:modelValue', '')
}

// endregion

// region 外部点击处理

function handleDocumentPointerDown(event: PointerEvent): void {
  const target = event.target as Node
  if (rootRef.value?.contains(target)) {
    return
  }
  if (optionsRef.value?.contains(target)) {
    return
  }
  opened.value = false
  searchText.value = ''
  hideCollapseTooltip()
}

function handleScrollOrResize(): void {
  if (opened.value) {
    updateOptionsPosition()
  }
}

watch(opened, (value) => {
  if (value) {
    hideCollapseTooltip()
    nextTick(() => {
      updateOptionsPosition()
    })
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return
  }
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})

watch(filteredOptions, () => {
  if (opened.value) {
    nextTick(() => {
      updateOptionsPosition()
    })
  }
})

watch(selectedOptions, () => {
  if (collapseTooltipVisible.value) {
    nextTick(() => {
      updateCollapseTooltipPosition()
    })
  }
})

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
  cancelHideCollapseTooltip()
})

// endregion
</script>

<style scoped>
.native-select {
  width: 100%;
  min-width: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

.native-select__control {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  font-size: inherit;
  line-height: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.native-select.is-multiple .native-select__control {
  height: auto;
  min-height: 32px;
  padding: 2px 8px;
}

.native-select:not(.is-disabled) .native-select__control:hover {
  border-color: #c0c4cc;
}

/* 对齐原生 select 聚焦/展开时的深色描边（非 hover、非主题蓝） */
.native-select:not(.is-disabled) .native-select__control:focus,
.native-select.is-opened:not(.is-disabled) .native-select__control {
  border: 2px solid #303133;
  padding: 0 9px;
}

.native-select.is-multiple:not(.is-disabled) .native-select__control:focus,
.native-select.is-multiple.is-opened:not(.is-disabled) .native-select__control {
  padding: 1px 7px;
}

.native-select__values {
  display: flex;
  align-items: center;
  flex: 1;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

.native-select.is-collapse-tags .native-select__values {
  flex-wrap: nowrap;
  overflow: hidden;
}

.native-select.is-collapse-tags .native-select__tag:not(.native-select__tag--collapse) {
  flex-shrink: 1;
  min-width: 0;
}

.native-select__placeholder {
  color: #a8abb2;
}

.native-select__single-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.native-select__tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  max-width: 100%;
  padding: 2px 6px;
  border-radius: 3px;
  background: #ecf5ff;
  color: #409eff;
}

.native-select__tag-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.native-select__tag--collapse {
  flex-shrink: 0;
  background: #f0f2f5;
  color: #909399;
}

.native-select__collapse-tooltip {
  position: fixed;
  z-index: 3100;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: min(320px, calc(100vw - 16px));
  padding: 6px 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
  pointer-events: auto;
}

.native-select__collapse-tooltip-tag {
  display: inline-block;
  max-width: 100%;
  padding: 2px 6px;
  border-radius: 3px;
  background: #ecf5ff;
  color: #409eff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.native-select__tag-remove,
.native-select__clear {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.native-select__search {
  flex: 1;
  min-width: 80px;
  height: 22px;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: inherit;
  line-height: inherit;
}

.native-select__arrow {
  flex-shrink: 0;
  margin-left: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1;
}

.native-select__options {
  position: fixed;
  z-index: 3000;
  box-sizing: border-box;
  max-height: 240px;
  overflow: auto;
  padding: 4px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
  font-size: 14px;
  line-height: 1.4;
  color: #606266;
}

.native-select__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  min-height: 30px;
  cursor: pointer;
  font-size: inherit;
  line-height: inherit;
}

.native-select__option:hover {
  background: #f5f7fa;
}

.native-select__option--single.native-select__option--selected {
  color: #409eff;
}

.native-select__empty {
  padding: 8px 10px;
  color: #909399;
  text-align: center;
}

.native-select.is-disabled {
  cursor: not-allowed;
}

.native-select.is-disabled .native-select__control {
  background: #f5f7fa;
  cursor: not-allowed;
}
</style>
