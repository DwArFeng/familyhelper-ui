<template>
  <div class="audit-entry-composite-lookup-item-editor-container">
    <el-form label-width="90px">
      <el-form-item :label="t('views.element_plus_engineering.audit_management.audit_category')">
        <el-input :model-value="item.category_key?.string_id ?? ''" readonly>
          <template v-slot:append>
            <el-button :icon="SearchIcon" @click="auditCategorySelectDialogVisible = true" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.audit_management.created_time')">
        <div class="flex">
          <el-date-picker
            class="grid-like-date-picker"
            :model-value="item.start_created_date"
            :disabled="!categorySelected"
            type="datetime"
            value-format="x"
            :placeholder="t('views.element_plus_engineering.audit_management.select_start_date')"
            :shortcuts="datePickerShortcuts"
            @update:model-value="handleStartCreatedDateChanged"
          />
          <div class="center">
            {{ t('views.element_plus_engineering.audit_management.to') }}
          </div>
          <el-date-picker
            class="grid-like-date-picker"
            :model-value="item.end_created_date"
            :disabled="!categorySelected"
            type="datetime"
            value-format="x"
            :placeholder="t('views.element_plus_engineering.audit_management.select_end_date')"
            :shortcuts="datePickerShortcuts"
            @update:model-value="handleEndCreatedDateChanged"
          />
        </div>
      </el-form-item>
    </el-form>
    <div class="property-header">
      <span>{{ t('views.element_plus_engineering.audit_management.property_condition') }}</span>
      <el-button
        type="primary"
        size="small"
        :disabled="propertyAddDisabled || !categorySelected"
        @click="handleAddPropertyCondition"
      >
        {{ t('views.element_plus_engineering.audit_management.add_property') }}
      </el-button>
    </div>
    <el-table :data="item.composite_items" border size="small">
      <el-table-column
        :label="t('views.element_plus_engineering.audit_management.enabled')"
        width="70"
      >
        <template v-slot="{ row }">
          <el-switch
            :model-value="row.enabled"
            :disabled="!categorySelected"
            @update:model-value="
              (value: boolean) => handlePropertyEnabledChanged(row.nodeId, value)
            "
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="t('views.element_plus_engineering.audit_management.property')"
        min-width="140"
      >
        <template v-slot="{ row }">
          <el-select
            :model-value="row.property_id"
            :disabled="!categorySelected"
            style="width: 100%"
            @update:model-value="(value: string) => handlePropertyChanged(row.nodeId, value)"
          >
            <el-option
              v-for="indicator in indicators"
              :key="indicator.key.property_string_id"
              :label="indicator.label"
              :value="indicator.key.property_string_id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('views.element_plus_engineering.audit_management.type')"
        width="90"
      >
        <template v-slot="{ row }">
          {{ formatPropertyType(row.property_type) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('views.element_plus_engineering.audit_management.condition')"
        min-width="260"
      >
        <template v-slot="{ row }">
          <el-input
            v-if="row.property_type === 0"
            :model-value="row.first_condition ?? ''"
            :disabled="!categorySelected"
            :placeholder="t('views.element_plus_engineering.audit_management.contains_match')"
            @update:model-value="
              (value: string) => handlePropertyFirstConditionChanged(row.nodeId, value)
            "
          />
          <div v-else-if="row.property_type === 1" class="range-inputs">
            <el-input
              :model-value="row.first_condition ?? ''"
              :disabled="!categorySelected"
              :placeholder="
                t('views.element_plus_engineering.audit_management.starting_long_integer')
              "
              @update:model-value="
                (value: string) => handlePropertyFirstConditionChanged(row.nodeId, value)
              "
            />
            <el-input
              :model-value="row.second_condition ?? ''"
              :disabled="!categorySelected"
              :placeholder="
                t('views.element_plus_engineering.audit_management.ending_long_integer')
              "
              @update:model-value="
                (value: string) => handlePropertySecondConditionChanged(row.nodeId, value)
              "
            />
          </div>
          <div v-else-if="row.property_type === 2" class="range-inputs">
            <el-input
              :model-value="row.first_condition ?? ''"
              :disabled="!categorySelected"
              :placeholder="
                t('views.element_plus_engineering.audit_management.starting_floating_point')
              "
              @update:model-value="
                (value: string) => handlePropertyFirstConditionChanged(row.nodeId, value)
              "
            />
            <el-input
              :model-value="row.second_condition ?? ''"
              :disabled="!categorySelected"
              :placeholder="
                t('views.element_plus_engineering.audit_management.ending_floating_point')
              "
              @update:model-value="
                (value: string) => handlePropertySecondConditionChanged(row.nodeId, value)
              "
            />
          </div>
          <el-switch
            v-else-if="row.property_type === 3"
            :model-value="row.first_condition === 'true'"
            :disabled="!categorySelected"
            :active-text="t('views.element_plus_engineering.audit_management.yes')"
            :inactive-text="t('views.element_plus_engineering.audit_management.no')"
            @update:model-value="
              (value: boolean) =>
                handlePropertyFirstConditionChanged(row.nodeId, value ? 'true' : 'false')
            "
          />
          <div v-else-if="row.property_type === 4" class="flex">
            <el-date-picker
              class="grid-like-date-picker"
              :model-value="row.first_condition"
              :disabled="!categorySelected"
              type="datetime"
              value-format="x"
              :placeholder="t('views.element_plus_engineering.audit_management.select_start_date')"
              :shortcuts="datePickerShortcuts"
              @update:model-value="
                (value: string | number | Date | null) =>
                  handlePropertyDateFirstChanged(row.nodeId, value)
              "
            />
            <div class="center">
              {{ t('views.element_plus_engineering.audit_management.to') }}
            </div>
            <el-date-picker
              class="grid-like-date-picker"
              :model-value="row.second_condition"
              :disabled="!categorySelected"
              type="datetime"
              value-format="x"
              :placeholder="t('views.element_plus_engineering.audit_management.select_end_date')"
              :shortcuts="datePickerShortcuts"
              @update:model-value="
                (value: string | number | Date | null) =>
                  handlePropertyDateSecondChanged(row.nodeId, value)
              "
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('views.element_plus_engineering.audit_management.operations')"
        width="70"
      >
        <template v-slot="{ row }">
          <el-button
            type="danger"
            link
            :disabled="!categorySelected"
            @click="handleRemovePropertyCondition(row.nodeId)"
          >
            {{ t('views.element_plus_engineering.audit_management.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <audit-category-select-dialog
      v-model:visible="auditCategorySelectDialogVisible"
      @onConfirmed="handleAuditCategoryConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import { type AuditCategory } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditCategory.ts'
import {
  type AuditPropertyIndicator,
  type AuditPropertyType,
  childForAuditCategory,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditPropertyIndicator.ts'
import {
  type LongIdKey,
  type StringIdKey,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import AuditCategorySelectDialog from '../../auditCategory/AuditCategorySelectDialog.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AuditEntryCompositeLookupItemEditor',
})

// region Props 定义

type Props = {
  item: CompositeLookupItemDraft
  propertyAddDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  propertyAddDisabled: false,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:item', value: CompositeLookupItemDraft): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 组合查询草稿

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

function createNodeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function createEmptyCompositePropertyConditionDraft(
  propertyId: string,
  propertyType: AuditPropertyType,
): CompositePropertyConditionDraft {
  return {
    nodeId: createNodeId(),
    property_id: propertyId,
    property_type: propertyType,
    first_condition: null,
    second_condition: null,
    enabled: true,
  }
}

function cloneCompositeLookupItemDraft(item: CompositeLookupItemDraft): CompositeLookupItemDraft {
  return JSON.parse(JSON.stringify(item)) as CompositeLookupItemDraft
}

// endregion

// region 类别选择对话框

const categorySelected = computed(() => (props.item.category_key?.string_id ?? '') !== '')

const auditCategorySelectDialogVisible = ref<boolean>(false)
const indicators = ref<AuditPropertyIndicator[]>([])

async function loadIndicators(): Promise<void> {
  const categoryId = props.item.category_key?.string_id ?? ''
  if (categoryId === '') {
    indicators.value = []
    return
  }
  indicators.value = await lookupAllToList((pagingInfo) =>
    childForAuditCategory({ string_id: categoryId }, pagingInfo),
  )
}

function handleAuditCategoryConfirmed(category: AuditCategory): void {
  emitItem((item) => {
    item.category_key = { string_id: category.key.string_id }
    item.composite_items = []
  })
}

watch(
  () => props.item.category_key?.string_id ?? '',
  () => {
    void loadIndicators()
  },
)

onMounted(() => {
  void loadIndicators()
})

// endregion

// region 基础条件

const datePickerShortcuts: { text: string; value: Date | (() => Date) }[] = [
  {
    text: t('views.element_plus_engineering.audit_management.one_day_ago'),
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.audit_management.two_days_ago'),
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 2)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.audit_management.three_days_ago'),
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 3)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.audit_management.four_days_ago'),
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 4)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.audit_management.five_days_ago'),
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 5)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.audit_management.one_week_ago'),
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
  {
    text: t('views.element_plus_engineering.audit_management.two_weeks_ago'),
    value: () => {
      const date: Date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7 * 2)
      return date
    },
  },
]

function resolveDateValue(value: string | number | Date | null): number | null {
  if (value === null || value === '') {
    return null
  }
  return Number(value)
}

function handleStartCreatedDateChanged(value: string | number | Date | null): void {
  emitItem((item) => {
    item.start_created_date = resolveDateValue(value)
  })
}

function handleEndCreatedDateChanged(value: string | number | Date | null): void {
  emitItem((item) => {
    item.end_created_date = resolveDateValue(value)
  })
}

// endregion

// region 属性条件

function formatPropertyType(type: number): string {
  switch (type) {
    case 0:
      return t('views.element_plus_engineering.audit_management.string')
    case 1:
      return t('views.element_plus_engineering.audit_management.long_integer')
    case 2:
      return t('views.element_plus_engineering.audit_management.floating_point')
    case 3:
      return t('views.element_plus_engineering.audit_management.boolean')
    case 4:
      return t('views.element_plus_engineering.audit_management.date')
    default:
      return t('views.element_plus_engineering.audit_management.unknown_type', { type })
  }
}

function handleAddPropertyCondition(): void {
  if (!categorySelected.value) {
    return
  }
  const first = indicators.value[0]
  if (!first) {
    return
  }
  emitItem((item) => {
    item.composite_items.push(
      createEmptyCompositePropertyConditionDraft(first.key.property_string_id, first.property_type),
    )
  })
}

function handlePropertyChanged(nodeId: string, propertyId: string): void {
  const indicator = indicators.value.find((item) => item.key.property_string_id === propertyId)
  if (!indicator) {
    return
  }
  updatePropertyCondition(nodeId, (condition) => {
    condition.property_id = indicator.key.property_string_id
    condition.property_type = indicator.property_type
    condition.first_condition = condition.property_type === 3 ? 'false' : null
    condition.second_condition = null
  })
}

function handlePropertyEnabledChanged(nodeId: string, value: boolean): void {
  updatePropertyCondition(nodeId, (condition) => {
    condition.enabled = value
  })
}

function handlePropertyFirstConditionChanged(nodeId: string, value: string): void {
  updatePropertyCondition(nodeId, (condition) => {
    condition.first_condition = value === '' ? null : value
  })
}

function handlePropertySecondConditionChanged(nodeId: string, value: string): void {
  updatePropertyCondition(nodeId, (condition) => {
    condition.second_condition = value === '' ? null : value
  })
}

function handlePropertyDateFirstChanged(
  nodeId: string,
  value: string | number | Date | null,
): void {
  updatePropertyCondition(nodeId, (condition) => {
    const resolved = resolveDateValue(value)
    condition.first_condition = resolved === null ? null : String(resolved)
  })
}

function handlePropertyDateSecondChanged(
  nodeId: string,
  value: string | number | Date | null,
): void {
  updatePropertyCondition(nodeId, (condition) => {
    const resolved = resolveDateValue(value)
    condition.second_condition = resolved === null ? null : String(resolved)
  })
}

function handleRemovePropertyCondition(nodeId: string): void {
  emitItem((item) => {
    item.composite_items = item.composite_items.filter((condition) => condition.nodeId !== nodeId)
  })
}

function updatePropertyCondition(
  nodeId: string,
  updater: (condition: CompositePropertyConditionDraft) => void,
): void {
  emitItem((item) => {
    const condition = item.composite_items.find((candidate) => candidate.nodeId === nodeId)
    if (condition) {
      updater(condition)
    }
  })
}

function emitItem(updater: (item: CompositeLookupItemDraft) => void): void {
  const item = cloneCompositeLookupItemDraft(props.item)
  updater(item)
  emit('update:item', item)
}

// endregion
</script>

<style scoped>
.audit-entry-composite-lookup-item-editor-container {
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.audit-entry-composite-lookup-item-editor-container :deep(.el-form-item) {
  margin-bottom: 5px;
}

.property-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0;
}

.range-inputs {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.flex {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: left;
  align-items: center;
}

.flex .center {
  margin-right: 5px;
  margin-left: 5px;
}

.grid-like-date-picker {
  width: 260px;
}
</style>
