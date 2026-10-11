<template>
  <div class="audit-entry-container">
    <root-border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
      :west-visible="true"
      west-width="38%"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleAuditEntrySearch">{{
            t('views.element_plus_engineering.audit_management.refresh_data')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-button type="primary" @click="auditEntrySearchDialogVisible = true">
            {{ t('views.element_plus_engineering.audit_management.advanced_search') }}
          </el-button>
          <el-button @click="handleClearConditions">{{
            t('views.element_plus_engineering.audit_management.clear_conditions')
          }}</el-button>
        </div>
      </template>
      <template v-slot:west>
        <table-panel
          class="table"
          v-model:current-page="auditEntryTableCurrentPage"
          v-model:page-size="auditEntryTablePageSize"
          highlight-current-row
          pagination-adjust-strategy="FORCE_COMPACT"
          :item-count="auditEntryTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="auditEntryTableItems"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-visible="false"
          :show-contextmenu="true"
          :contextmenu-width="120"
          @onPagingAttributeChanged="handleAuditEntryPagingAttributeChanged"
          @onCurrentChanged="handleAuditEntryTableCurrentChanged"
        >
          <template v-slot:default>
            <el-table-column
              prop="category_id"
              :label="t('views.element_plus_engineering.audit_management.category_id')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="category_name"
              :label="t('views.element_plus_engineering.audit_management.category_name')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="created_date"
              :label="t('views.element_plus_engineering.audit_management.created_time')"
              width="180px"
              show-overflow-tooltip
              :formatter="createdDateFormatter"
            />
          </template>
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li
                @click="handleAuditEntryCopyKeyContextmenuClicked(row as AuditEntryTableRow, close)"
              >
                {{ t('views.element_plus_engineering.audit_management.copy_entry_key') }}
              </li>
              <li
                @click="
                  handleAuditEntryCopyCategoryIdContextmenuClicked(row as AuditEntryTableRow, close)
                "
              >
                {{ t('views.element_plus_engineering.audit_management.copy_category_id') }}
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
      <template v-slot:default>
        <audit-entry-detail-panel :row="currentRow" />
      </template>
    </root-border-layout-panel>
    <audit-entry-search-dialog
      v-model:visible="auditEntrySearchDialogVisible"
      :applied-query="appliedQuery"
      @onSearched="handleAdvancedSearched"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage } from 'element-plus'

import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  childForAuditCategoryDisp,
  createdDateDescDisp,
  type DispAuditEntry,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditEntry.ts'
import {
  type AuditEntryLookupCompositeItem,
  type AuditEntryLookupItem,
  type AuditEntryLookupQueryGroup,
  type AuditEntryLookupResult,
  type AuditEntryLookupResultData,
  composite,
  grouped,
  type LogicOperator,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditEntryLookup.ts'
import { type AuditPropertyType } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditPropertyIndicator.ts'
import {
  type LongIdKey,
  type StringIdKey,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type PagingInfo } from '@dwarfeng/familyhelper-ui-component-api/src/util/request.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import AuditEntrySearchDialog from './AuditEntrySearchDialog.vue'
import AuditEntryDetailPanel from './subPanels/AuditEntryDetailPanel.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AuditEntry',
})

// region I18n 引入

const { t } = useI18n()

// endregion

// region 查询草稿

const LOGIC_OPERATOR_AND: LogicOperator = 0

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

type AuditEntryTableRow = {
  entry_id: string
  category_id: string
  category_name: string
  created_date: number
}

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

function isBlank(value: string | null | undefined): boolean {
  return value === null || value === undefined || value === ''
}

function mapCompositePropertyCondition(
  condition: CompositePropertyConditionDraft,
): AuditEntryLookupCompositeItem | null {
  if (!condition.enabled) {
    return null
  }
  return {
    property_id: condition.property_id,
    property_type: condition.property_type,
    first_condition: isBlank(condition.first_condition) ? null : condition.first_condition,
    second_condition: isBlank(condition.second_condition) ? null : condition.second_condition,
    enabled: condition.enabled,
  }
}

function mapCompositeLookupItemToApi(
  item: CompositeLookupItemDraft,
): AuditEntryCompositeLookupBody {
  return {
    category_key: item.category_key,
    audit_entry_key:
      item.audit_entry_key === null || item.audit_entry_key.long_id === ''
        ? null
        : item.audit_entry_key,
    start_created_date: item.start_created_date,
    end_created_date: item.end_created_date,
    composite_items: item.composite_items
      .map(mapCompositePropertyCondition)
      .filter((condition): condition is AuditEntryLookupCompositeItem => condition !== null),
  }
}

function mapGroupedPropertyCondition(
  condition: GroupedPropertyConditionDraft,
): AuditEntryLookupCompositeItem | null {
  if (!condition.enabled) {
    return null
  }
  return {
    property_id: condition.property_id,
    property_type: condition.property_type,
    first_condition: isBlank(condition.first_condition) ? null : condition.first_condition,
    second_condition: isBlank(condition.second_condition) ? null : condition.second_condition,
    enabled: condition.enabled,
  }
}

function mapGroupedLookupItemToApi(item: GroupedLookupItemDraft): AuditEntryLookupItem {
  return {
    category_key: item.category_key,
    audit_entry_key:
      item.audit_entry_key === null || item.audit_entry_key.long_id === ''
        ? null
        : item.audit_entry_key,
    start_created_date: item.start_created_date,
    end_created_date: item.end_created_date,
    composite_items: item.composite_items
      .map(mapGroupedPropertyCondition)
      .filter((condition): condition is AuditEntryLookupCompositeItem => condition !== null),
    enabled: item.enabled,
  }
}

function mapGroupedQueryGroupToApi(group: GroupedQueryGroupDraft): AuditEntryLookupQueryGroup {
  return {
    logic_operator: group.logic_operator,
    lookup_items: group.lookup_items.filter((item) => item.enabled).map(mapGroupedLookupItemToApi),
    query_groups: group.query_groups
      .filter((child) => child.enabled)
      .map(mapGroupedQueryGroupToApi),
    enabled: group.enabled,
  }
}

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 查询条件

const appliedQuery = ref<AuditEntryAppliedQuery>(createEmptySearchDraft())
const auditEntrySearchDialogVisible = ref<boolean>(false)

function handleClearConditions(): void {
  appliedQuery.value = createEmptySearchDraft()
  auditEntryTableCurrentPage.value = 0
  handleAuditEntrySearch()
}

function handleAdvancedSearched(query: AuditEntryAppliedQuery): void {
  appliedQuery.value = query
  auditEntryTableCurrentPage.value = 0
  handleAuditEntrySearch()
}

// endregion

// region 审计记录搜索

type AuditEntryCompositeLookupBody = {
  category_key: StringIdKey | null
  audit_entry_key: LongIdKey | null
  start_created_date: number | null
  end_created_date: number | null
  composite_items: AuditEntryLookupCompositeItem[]
}

function mapDispAuditEntry(item: DispAuditEntry): AuditEntryTableRow {
  return {
    entry_id: item.key.long_id,
    category_id:
      item.category_key === null
        ? t('views.element_plus_engineering.audit_management.unknown_parenthesized')
        : item.category_key.string_id,
    category_name:
      item.audit_category === null
        ? t('views.element_plus_engineering.audit_management.unknown_parenthesized')
        : item.audit_category.name,
    created_date: item.created_date,
  }
}

function mapLookupResult(item: AuditEntryLookupResultData): AuditEntryTableRow {
  return {
    entry_id: item.audit_entry.key.long_id,
    category_id:
      item.audit_entry.category_key === null
        ? t('views.element_plus_engineering.audit_management.unknown_parenthesized')
        : item.audit_entry.category_key.string_id,
    category_name:
      item.audit_category === null
        ? t('views.element_plus_engineering.audit_management.unknown_parenthesized')
        : item.audit_category.name,
    created_date: item.audit_entry.created_date,
  }
}

async function lookupCompositeWithAdjustPage(
  pagingInfo: PagingInfo,
): Promise<AuditEntryLookupResult> {
  const mappedItem = mapCompositeLookupItemToApi(appliedQuery.value.compositeItem)
  let result = await resolveResponse(
    composite({
      paging_info: pagingInfo,
      category_key: mappedItem.category_key,
      audit_entry_key: mappedItem.audit_entry_key,
      start_created_date: mappedItem.start_created_date,
      end_created_date: mappedItem.end_created_date,
      composite_items: mappedItem.composite_items,
    }),
  )
  if (result.current_page > result.total_pages && result.total_pages > 0) {
    result = await resolveResponse(
      composite({
        paging_info: {
          page: result.total_pages - 1,
          rows: pagingInfo.rows,
        },
        category_key: mappedItem.category_key,
        audit_entry_key: mappedItem.audit_entry_key,
        start_created_date: mappedItem.start_created_date,
        end_created_date: mappedItem.end_created_date,
        composite_items: mappedItem.composite_items,
      }),
    )
  }
  return result
}

async function lookupGroupedWithAdjustPage(
  pagingInfo: PagingInfo,
): Promise<AuditEntryLookupResult> {
  const mappedGroup = mapGroupedQueryGroupToApi(appliedQuery.value.groupedRoot)
  let result = await resolveResponse(
    grouped({
      paging_info: pagingInfo,
      logic_operator: mappedGroup.logic_operator,
      lookup_items: mappedGroup.lookup_items,
      query_groups: mappedGroup.query_groups,
    }),
  )
  if (result.current_page > result.total_pages && result.total_pages > 0) {
    result = await resolveResponse(
      grouped({
        paging_info: {
          page: result.total_pages - 1,
          rows: pagingInfo.rows,
        },
        logic_operator: mappedGroup.logic_operator,
        lookup_items: mappedGroup.lookup_items,
        query_groups: mappedGroup.query_groups,
      }),
    )
  }
  return result
}

async function handleAuditEntrySearch(): Promise<void> {
  loading.value += 1
  try {
    if (appliedQuery.value.mode === 'CATEGORY') {
      const res = await lookupWithAdjustPage(
        (pagingInfo) =>
          childForAuditCategoryDisp({ string_id: appliedQuery.value.categoryId }, pagingInfo),
        auditEntryTablePagingInfo.value,
      )
      updateAuditEntryTableByLookup({
        ...res,
        data: res.data.map(mapDispAuditEntry),
      })
    } else if (appliedQuery.value.mode === 'COMPOSITE') {
      const res = await lookupCompositeWithAdjustPage(auditEntryTablePagingInfo.value)
      updateAuditEntryTableByLookup({
        ...res,
        data: res.data.map(mapLookupResult),
      })
    } else if (appliedQuery.value.mode === 'GROUPED') {
      const res = await lookupGroupedWithAdjustPage(auditEntryTablePagingInfo.value)
      updateAuditEntryTableByLookup({
        ...res,
        data: res.data.map(mapLookupResult),
      })
    } else {
      const res = await lookupWithAdjustPage(
        (pagingInfo) => createdDateDescDisp(pagingInfo),
        auditEntryTablePagingInfo.value,
      )
      updateAuditEntryTableByLookup({
        ...res,
        data: res.data.map(mapDispAuditEntry),
      })
    }
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleAuditEntrySearch()
})

// endregion

// region 审计记录表格处理

const {
  currentPage: auditEntryTableCurrentPage,
  pageSize: auditEntryTablePageSize,
  itemCount: auditEntryTableItemCount,
  items: auditEntryTableItems,
  pagingInfo: auditEntryTablePagingInfo,
  updateByLookup: updateAuditEntryTableByLookup,
} = useIdentityBackendPagingTablePanel<AuditEntryTableRow>(15)
const currentRow = ref<AuditEntryTableRow | null>(null)

function handleAuditEntryPagingAttributeChanged(): void {
  handleAuditEntrySearch()
}

function handleAuditEntryTableCurrentChanged(row: AuditEntryTableRow | null): void {
  currentRow.value = row
}

async function handleAuditEntryCopyKeyContextmenuClicked(
  row: AuditEntryTableRow,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.entry_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.audit_management.copy_succeeded'),
    type: 'success',
  })
}

async function handleAuditEntryCopyCategoryIdContextmenuClicked(
  row: AuditEntryTableRow,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.category_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.audit_management.copy_succeeded'),
    type: 'success',
  })
}

function formatCreatedDate(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return t('views.element_plus_engineering.audit_management.none_available_parenthesized')
  }
  return formatTimestamp(value)
}

function createdDateFormatter(row: AuditEntryTableRow): string {
  return formatCreatedDate(row.created_date)
}

// endregion
</script>

<style scoped>
.audit-entry-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
