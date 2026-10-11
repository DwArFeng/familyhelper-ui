<template>
  <el-dialog
    class="audit-entry-search-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    :title="t('views.element_plus_engineering.audit_management.advanced_search')"
    width="920px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-tabs v-model="draft.mode">
      <el-tab-pane
        :label="t('views.element_plus_engineering.audit_management.composite_query')"
        name="COMPOSITE"
      >
        <audit-entry-composite-lookup-item-editor
          :item="draft.compositeItem"
          :property-add-disabled="compositePropertyAddDisabled"
          @update:item="handleCompositeItemChanged"
        />
      </el-tab-pane>
      <el-tab-pane
        :label="t('views.element_plus_engineering.audit_management.grouped_query')"
        name="GROUPED"
      >
        <div class="limit-tip">
          {{
            t('views.element_plus_engineering.audit_management.query_limits_summary', {
              groupedLookupItemCount,
              maxGroupedLookupItems: MAX_GROUPED_LOOKUP_ITEMS,
              groupedPropertyConditionCount,
              maxGroupedPropertyConditions: MAX_GROUPED_PROPERTY_CONDITIONS,
              maxGroupDepth: MAX_GROUP_DEPTH,
            })
          }}
        </div>
        <overlay-scrollbars-component class="group-scroll">
          <audit-entry-query-group-editor
            :group="draft.groupedRoot"
            :lookup-item-add-disabled="groupedLookupItemAddDisabled"
            :group-add-disabled="groupedGroupAddDisabled"
            :property-add-disabled="groupedPropertyAddDisabled"
            @update:group="handleGroupedRootChanged"
          />
        </overlay-scrollbars-component>
      </el-tab-pane>
    </el-tabs>
    <template v-slot:footer>
      <el-button type="primary" @click="handleSearchButtonClicked">{{
        t('views.element_plus_engineering.audit_management.search')
      }}</el-button>
      <el-button @click="handleResetButtonClicked">{{
        t('views.element_plus_engineering.audit_management.reset')
      }}</el-button>
      <el-button @click="handleCancelButtonClicked">{{
        t('views.element_plus_engineering.audit_management.cancel')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import AuditEntryCompositeLookupItemEditor from './subPanels/AuditEntryCompositeLookupItemEditor.vue'
import AuditEntryQueryGroupEditor from './subPanels/AuditEntryQueryGroupEditor.vue'

import { type LogicOperator } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditEntryLookup.ts'
import { type AuditPropertyType } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditPropertyIndicator.ts'
import {
  type LongIdKey,
  type StringIdKey,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AuditEntrySearchDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  appliedQuery: AuditEntryAppliedQuery
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onSearched', value: AuditEntryAppliedQuery): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 搜索草稿

const LOGIC_OPERATOR_AND: LogicOperator = 0
const MAX_GROUP_DEPTH = 3
const MAX_COMPOSITE_PROPERTY_CONDITIONS = 200
const MAX_GROUPED_LOOKUP_ITEMS = 100
const MAX_GROUPED_PROPERTY_CONDITIONS = 200

type AuditEntryQueryMode = 'ALL' | 'CATEGORY' | 'COMPOSITE' | 'GROUPED'

type CompositePropertyConditionDraft = {
  nodeId: string
  property_id: string
  property_type: AuditPropertyType
  first_condition: string | null
  second_condition: string | null
  enabled: boolean
}

type CompositeLookupItemDraft = {
  nodeId: string
  category_key: StringIdKey | null
  audit_entry_key: LongIdKey | null
  start_created_date: number | null
  end_created_date: number | null
  composite_items: CompositePropertyConditionDraft[]
}

type GroupedPropertyConditionDraft = {
  nodeId: string
  property_id: string
  property_type: AuditPropertyType
  first_condition: string | null
  second_condition: string | null
  enabled: boolean
}

type GroupedLookupItemDraft = {
  nodeId: string
  category_key: StringIdKey | null
  audit_entry_key: LongIdKey | null
  start_created_date: number | null
  end_created_date: number | null
  composite_items: GroupedPropertyConditionDraft[]
  enabled: boolean
}

type GroupedQueryGroupDraft = {
  nodeId: string
  logic_operator: LogicOperator
  lookup_items: GroupedLookupItemDraft[]
  query_groups: GroupedQueryGroupDraft[]
  enabled: boolean
}

type AuditEntrySearchDraft = {
  mode: AuditEntryQueryMode
  categoryId: string
  compositeItem: CompositeLookupItemDraft
  groupedRoot: GroupedQueryGroupDraft
}

type AuditEntryAppliedQuery = AuditEntrySearchDraft

function createNodeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function createEmptyCompositeLookupItemDraft(): CompositeLookupItemDraft {
  return {
    nodeId: createNodeId(),
    category_key: null,
    audit_entry_key: null,
    start_created_date: null,
    end_created_date: null,
    composite_items: [],
  }
}

function createEmptyGroupedLookupItemDraft(): GroupedLookupItemDraft {
  return {
    nodeId: createNodeId(),
    category_key: null,
    audit_entry_key: null,
    start_created_date: null,
    end_created_date: null,
    composite_items: [],
    enabled: true,
  }
}

function createEmptyGroupedQueryGroupDraft(): GroupedQueryGroupDraft {
  return {
    nodeId: createNodeId(),
    logic_operator: LOGIC_OPERATOR_AND,
    lookup_items: [createEmptyGroupedLookupItemDraft()],
    query_groups: [],
    enabled: true,
  }
}

function createEmptySearchDraft(): AuditEntrySearchDraft {
  return {
    mode: 'ALL',
    categoryId: '',
    compositeItem: createEmptyCompositeLookupItemDraft(),
    groupedRoot: createEmptyGroupedQueryGroupDraft(),
  }
}

function cloneSearchDraft(draft: AuditEntrySearchDraft): AuditEntrySearchDraft {
  return JSON.parse(JSON.stringify(draft)) as AuditEntrySearchDraft
}

// endregion

// region 可见性处理

const watchedVisible = ref(props.visible)
const draft = ref<AuditEntrySearchDraft>(createEmptySearchDraft())

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
    if (value) {
      draft.value = createAdvancedSearchDraft(props.appliedQuery)
    }
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 查询校验

function isBlank(value: string | null | undefined): boolean {
  return value === null || value === undefined || value === ''
}

function isCompositeLookupItemEffective(item: CompositeLookupItemDraft): boolean {
  if (item.category_key === null || item.category_key.string_id === '') {
    return false
  }
  if (item.audit_entry_key !== null && item.audit_entry_key.long_id !== '') {
    return true
  }
  if (item.start_created_date !== null || item.end_created_date !== null) {
    return true
  }
  return item.composite_items.some(
    (condition) => condition.enabled && !isBlank(condition.first_condition),
  )
}

function isCompositeLookupItemCategoryOnly(item: CompositeLookupItemDraft): boolean {
  if (item.category_key === null || item.category_key.string_id === '') {
    return false
  }
  if (item.audit_entry_key !== null && item.audit_entry_key.long_id !== '') {
    return false
  }
  if (item.start_created_date !== null || item.end_created_date !== null) {
    return false
  }
  return !item.composite_items.some(
    (condition) => condition.enabled && !isBlank(condition.first_condition),
  )
}

function canDowngradeCompositeToCategory(item: CompositeLookupItemDraft): boolean {
  return isCompositeLookupItemCategoryOnly(item) && isCompositeLookupItemEffective(item)
}

function validateDateRange(start: number | null, end: number | null, label: string): string | null {
  if (start !== null && end !== null && start > end) {
    return t('views.element_plus_engineering.audit_management.range_start_greater_than_end', {
      label,
    })
  }
  return null
}

function validateCompositePropertyCondition(
  condition: CompositePropertyConditionDraft,
): string | null {
  if (!condition.enabled) {
    return null
  }
  if (condition.property_id === '') {
    return t('views.element_plus_engineering.audit_management.property_condition_requires_property')
  }
  switch (condition.property_type) {
    case 1:
    case 2:
    case 4:
      return validateDateRange(
        isBlank(condition.first_condition) ? null : Number(condition.first_condition),
        isBlank(condition.second_condition) ? null : Number(condition.second_condition),
        t('views.element_plus_engineering.audit_management.property_range'),
      )
    default:
      return null
  }
}

function validateCompositeLookupItem(item: CompositeLookupItemDraft): string | null {
  if (item.category_key === null || item.category_key.string_id === '') {
    return t('views.element_plus_engineering.audit_management.query_item_audit_category_required')
  }
  const dateError = validateDateRange(
    item.start_created_date,
    item.end_created_date,
    t('views.element_plus_engineering.audit_management.created_time'),
  )
  if (dateError) {
    return dateError
  }
  for (const condition of item.composite_items) {
    const conditionError = validateCompositePropertyCondition(condition)
    if (conditionError) {
      return conditionError
    }
  }
  if (!isCompositeLookupItemEffective(item) && !isCompositeLookupItemCategoryOnly(item)) {
    return t('views.element_plus_engineering.audit_management.query_item_requires_condition')
  }
  return null
}

function countGroupedLookupItems(group: GroupedQueryGroupDraft): number {
  return (
    group.lookup_items.length +
    group.query_groups.reduce((sum, child) => sum + countGroupedLookupItems(child), 0)
  )
}

function countGroupedPropertyConditions(group: GroupedQueryGroupDraft): number {
  return (
    group.lookup_items.reduce((sum, item) => sum + item.composite_items.length, 0) +
    group.query_groups.reduce((sum, child) => sum + countGroupedPropertyConditions(child), 0)
  )
}

function isGroupedLookupItemEffective(item: GroupedLookupItemDraft): boolean {
  if (!item.enabled) {
    return false
  }
  if (item.category_key === null || item.category_key.string_id === '') {
    return false
  }
  if (item.audit_entry_key !== null && item.audit_entry_key.long_id !== '') {
    return true
  }
  if (item.start_created_date !== null || item.end_created_date !== null) {
    return true
  }
  return item.composite_items.some(
    (condition) => condition.enabled && !isBlank(condition.first_condition),
  )
}

function isGroupedLookupItemCategoryOnly(item: GroupedLookupItemDraft): boolean {
  if (item.category_key === null || item.category_key.string_id === '') {
    return false
  }
  if (item.audit_entry_key !== null && item.audit_entry_key.long_id !== '') {
    return false
  }
  if (item.start_created_date !== null || item.end_created_date !== null) {
    return false
  }
  return !item.composite_items.some(
    (condition) => condition.enabled && !isBlank(condition.first_condition),
  )
}

function validateGroupedPropertyCondition(condition: GroupedPropertyConditionDraft): string | null {
  if (!condition.enabled) {
    return null
  }
  if (condition.property_id === '') {
    return t('views.element_plus_engineering.audit_management.property_condition_requires_property')
  }
  switch (condition.property_type) {
    case 1:
    case 2:
    case 4:
      return validateDateRange(
        isBlank(condition.first_condition) ? null : Number(condition.first_condition),
        isBlank(condition.second_condition) ? null : Number(condition.second_condition),
        t('views.element_plus_engineering.audit_management.property_range'),
      )
    default:
      return null
  }
}

function validateGroupedLookupItem(item: GroupedLookupItemDraft): string | null {
  if (!item.enabled) {
    return null
  }
  if (item.category_key === null || item.category_key.string_id === '') {
    return t('views.element_plus_engineering.audit_management.query_item_audit_category_required')
  }
  const dateError = validateDateRange(
    item.start_created_date,
    item.end_created_date,
    t('views.element_plus_engineering.audit_management.created_time'),
  )
  if (dateError) {
    return dateError
  }
  for (const condition of item.composite_items) {
    const conditionError = validateGroupedPropertyCondition(condition)
    if (conditionError) {
      return conditionError
    }
  }
  if (!isGroupedLookupItemEffective(item) && !isGroupedLookupItemCategoryOnly(item)) {
    return t('views.element_plus_engineering.audit_management.query_item_requires_condition')
  }
  return null
}

function validateGroupedQueryGroup(group: GroupedQueryGroupDraft): string | null {
  if (!group.enabled) {
    return null
  }
  for (const item of group.lookup_items) {
    const itemError = validateGroupedLookupItem(item)
    if (itemError) {
      return itemError
    }
  }
  for (const child of group.query_groups) {
    const childError = validateGroupedQueryGroup(child)
    if (childError) {
      return childError
    }
  }
  const effectiveItemCount =
    group.lookup_items.filter(
      (item) => isGroupedLookupItemEffective(item) || isGroupedLookupItemCategoryOnly(item),
    ).length + group.query_groups.filter((child) => child.enabled).length
  if (effectiveItemCount <= 0) {
    return t(
      'views.element_plus_engineering.audit_management.query_group_requires_item_or_subgroup',
    )
  }
  return null
}

function validateGroupedRoot(group: GroupedQueryGroupDraft): string | null {
  if (countGroupedLookupItems(group) > MAX_GROUPED_LOOKUP_ITEMS) {
    return t('views.element_plus_engineering.audit_management.query_item_limit_exceeded', {
      maxGroupedLookupItems: MAX_GROUPED_LOOKUP_ITEMS,
    })
  }
  if (countGroupedPropertyConditions(group) > MAX_GROUPED_PROPERTY_CONDITIONS) {
    return t('views.element_plus_engineering.audit_management.property_condition_limit_exceeded', {
      maxGroupedPropertyConditions: MAX_GROUPED_PROPERTY_CONDITIONS,
    })
  }
  return validateGroupedQueryGroup(group)
}

// endregion

// region 限制计数

const groupedLookupItemCount = computed(() => countGroupedLookupItems(draft.value.groupedRoot))
const groupedPropertyConditionCount = computed(() =>
  countGroupedPropertyConditions(draft.value.groupedRoot),
)
const groupedLookupItemAddDisabled = computed(
  () => groupedLookupItemCount.value >= MAX_GROUPED_LOOKUP_ITEMS,
)
const groupedPropertyAddDisabled = computed(
  () => groupedPropertyConditionCount.value >= MAX_GROUPED_PROPERTY_CONDITIONS,
)
const groupedGroupAddDisabled = computed(() => groupedLookupItemAddDisabled.value)
const compositePropertyAddDisabled = computed(
  () => draft.value.compositeItem.composite_items.length >= MAX_COMPOSITE_PROPERTY_CONDITIONS,
)

// endregion

// region 对话框处理

function createAdvancedSearchDraft(query: AuditEntryAppliedQuery): AuditEntrySearchDraft {
  const nextDraft = cloneSearchDraft(query)
  if (nextDraft.mode === 'GROUPED' || nextDraft.mode === 'COMPOSITE') {
    return nextDraft
  }
  if (nextDraft.mode === 'CATEGORY' && nextDraft.categoryId !== '') {
    nextDraft.compositeItem.category_key = { string_id: nextDraft.categoryId }
  }
  nextDraft.mode = 'COMPOSITE'
  return nextDraft
}

function resolveAppliedMode(searchDraft: AuditEntrySearchDraft): AuditEntryAppliedQuery {
  if (searchDraft.mode === 'GROUPED') {
    return cloneSearchDraft({ ...searchDraft, mode: 'GROUPED' })
  }
  if (searchDraft.mode === 'COMPOSITE') {
    if (canDowngradeCompositeToCategory(searchDraft.compositeItem)) {
      return cloneSearchDraft({
        ...searchDraft,
        mode: 'CATEGORY',
        categoryId: searchDraft.compositeItem.category_key?.string_id ?? '',
      })
    }
    return cloneSearchDraft({ ...searchDraft, mode: 'COMPOSITE' })
  }
  if (searchDraft.mode === 'CATEGORY') {
    return cloneSearchDraft({ ...searchDraft, mode: 'CATEGORY' })
  }
  return cloneSearchDraft({ ...searchDraft, mode: 'ALL' })
}

function validateSearchDraft(searchDraft: AuditEntrySearchDraft): string | null {
  if (searchDraft.mode === 'CATEGORY') {
    if (searchDraft.categoryId === '') {
      return t(
        'views.element_plus_engineering.audit_management.audit_category_required_for_category_query',
      )
    }
    return null
  }
  if (searchDraft.mode === 'COMPOSITE') {
    return validateCompositeLookupItem(searchDraft.compositeItem)
  }
  if (searchDraft.mode === 'GROUPED') {
    return validateGroupedRoot(searchDraft.groupedRoot)
  }
  return null
}

function handleCompositeItemChanged(item: CompositeLookupItemDraft): void {
  draft.value.compositeItem = item
}

function handleGroupedRootChanged(group: GroupedQueryGroupDraft): void {
  draft.value.groupedRoot = group
}

function handleSearchButtonClicked(): void {
  const error = validateSearchDraft(draft.value)
  if (error) {
    ElMessage({
      showClose: true,
      message: error,
      type: 'warning',
    })
    return
  }
  emit('onSearched', resolveAppliedMode(draft.value))
  watchedVisible.value = false
}

function handleResetButtonClicked(): void {
  draft.value = createEmptySearchDraft()
  draft.value.mode = 'COMPOSITE'
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.limit-tip {
  margin-bottom: 8px;
  color: #909399;
}

.group-scroll {
  height: 460px;
}
</style>
