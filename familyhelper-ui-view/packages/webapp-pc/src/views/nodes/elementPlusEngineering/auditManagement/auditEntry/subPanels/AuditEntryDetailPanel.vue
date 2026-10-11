<template>
  <div class="audit-entry-detail-panel-container">
    <placeholder-panel
      v-if="row === null"
      :text="t('views.element_plus_engineering.audit_management.please_select_audit_entry')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:default>
          <div class="detail-body">
            <overlay-scrollbars-component class="scroll-bar">
              <el-form class="property-form" label-position="left" label-width="120px" inline>
                <el-form-item
                  :label="t('views.element_plus_engineering.audit_management.category_id')"
                  style="width: 50%"
                >
                  {{ row.category_id }}
                </el-form-item>
                <el-form-item
                  :label="t('views.element_plus_engineering.audit_management.category_name')"
                  style="width: 50%"
                >
                  {{ row.category_name }}
                </el-form-item>
                <el-form-item
                  :label="t('views.element_plus_engineering.audit_management.created_time')"
                  style="width: 100%"
                >
                  {{ formatCreatedDate(row.created_date) }}
                </el-form-item>
              </el-form>
              <el-divider />
              <el-form
                class="property-form custom-property-form"
                label-position="left"
                label-width="120px"
                inline
              >
                <el-form-item
                  v-for="item in propertyItems"
                  :key="item.property_id"
                  style="width: 50%"
                >
                  <template #label>
                    <el-tooltip
                      placement="top"
                      :content="item.label"
                      :disabled="!isPropertyTextOverflow(item.property_id, 'label')"
                      :show-after="200"
                    >
                      <span
                        class="property-ellipsis"
                        @mouseenter="
                          handlePropertyTextMouseEnter($event, item.property_id, 'label')
                        "
                      >
                        {{ item.label }}
                      </span>
                    </el-tooltip>
                  </template>
                  <el-tooltip
                    placement="top"
                    :content="item.display_value"
                    :disabled="!isPropertyTextOverflow(item.property_id, 'value')"
                    :show-after="200"
                  >
                    <span
                      class="property-ellipsis"
                      @mouseenter="handlePropertyTextMouseEnter($event, item.property_id, 'value')"
                    >
                      {{ item.display_value }}
                    </span>
                  </el-tooltip>
                </el-form-item>
              </el-form>
            </overlay-scrollbars-component>
          </div>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import {
  type AuditEntryProperty,
  childForAuditEntryDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditEntryProperty.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AuditEntryDetailPanel',
})

// region Props 定义

type Props = {
  row: AuditEntryTableRow | null
}

const props = defineProps<Props>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 审计记录行

type AuditEntryTableRow = {
  entry_id: string
  category_id: string
  category_name: string
  created_date: number
}

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 属性查询

type PropertyItem = {
  property_id: string
  label: string
  has_indicator: boolean
  order: number
  display_value: string
}

const propertyItems = ref<PropertyItem[]>([])

const propertyTextOverflow = ref<Record<string, boolean>>({})

function propertyOverflowKey(propertyId: string, field: 'label' | 'value'): string {
  return `${propertyId}:${field}`
}

function isPropertyTextOverflow(propertyId: string, field: 'label' | 'value'): boolean {
  return propertyTextOverflow.value[propertyOverflowKey(propertyId, field)] === true
}

function handlePropertyTextMouseEnter(
  event: MouseEvent,
  propertyId: string,
  field: 'label' | 'value',
): void {
  const target = event.currentTarget as HTMLElement
  propertyTextOverflow.value[propertyOverflowKey(propertyId, field)] =
    target.scrollWidth > target.clientWidth
}

function formatPropertyValue(property: AuditEntryProperty): string {
  switch (property.property_type) {
    case 0:
      return property.string_value ?? ''
    case 1:
      return property.long_value ?? ''
    case 2:
      return String(property.double_value)
    case 3:
      return property.boolean_value
        ? t('views.element_plus_engineering.audit_management.yes')
        : t('views.element_plus_engineering.audit_management.no')
    case 4:
      return typeof property.date_value === 'number'
        ? formatTimestamp(property.date_value)
        : t('views.element_plus_engineering.audit_management.none_available_parenthesized')
    default:
      return ''
  }
}

function formatCreatedDate(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return t('views.element_plus_engineering.audit_management.none_available_parenthesized')
  }
  return formatTimestamp(value)
}

async function handleSearch(): Promise<void> {
  if (props.row === null) {
    propertyItems.value = []
    propertyTextOverflow.value = {}
    return
  }
  loading.value += 1
  try {
    const properties = await lookupAllToList((pagingInfo) =>
      childForAuditEntryDisp({ long_id: props.row!.entry_id }, pagingInfo),
    )
    propertyItems.value = properties
      .map((item) => ({
        property_id: item.key.property_string_id,
        label: item.audit_property_indicator?.label ?? item.key.property_string_id,
        has_indicator: item.audit_property_indicator !== null,
        order: item.audit_property_indicator === null ? 0 : item.audit_property_indicator.order,
        display_value: formatPropertyValue(item),
      }))
      .sort((left, right) => {
        if (left.has_indicator !== right.has_indicator) {
          return left.has_indicator ? -1 : 1
        }
        if (left.has_indicator && right.has_indicator) {
          return left.order - right.order
        }
        return 0
      })
    propertyTextOverflow.value = {}
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.row?.entry_id ?? '',
  () => {
    void handleSearch()
  },
)

onMounted(() => {
  void handleSearch()
})

// endregion
</script>

<style scoped>
.audit-entry-detail-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.main-container {
  width: 100%;
  height: 100%;
}

.detail-body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.detail-body :deep(.el-divider) {
  margin: 8px 0;
}

.scroll-bar {
  height: 0;
  flex-grow: 1;
  min-height: 0;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__label) {
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.custom-property-form :deep(.el-form-item__label) {
  overflow: hidden;
  min-width: 0;
}

.property-ellipsis {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 30px;
}
</style>
