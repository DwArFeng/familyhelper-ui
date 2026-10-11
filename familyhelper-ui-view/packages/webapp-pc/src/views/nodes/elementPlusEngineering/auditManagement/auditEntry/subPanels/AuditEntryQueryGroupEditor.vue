<template>
  <div
    class="audit-entry-query-group-editor-container"
    :class="[`depth-${Math.min(depth, 4)}`]"
    role="group"
    :aria-label="groupTitle"
  >
    <div class="group-header">
      <div class="group-options">
        <span class="group-title">{{ groupTitle }}</span>
        <span class="group-logic-label">{{
          t('views.element_plus_engineering.audit_management.connection_logic')
        }}</span>
        <el-radio-group
          class="group-logic-radios"
          :aria-label="t('views.element_plus_engineering.audit_management.connection_logic')"
          :model-value="group.logic_operator"
          @update:model-value="handleLogicOperatorChanged"
        >
          <el-radio :value="LOGIC_OPERATOR_AND">AND</el-radio>
          <el-radio :value="LOGIC_OPERATOR_OR">OR</el-radio>
        </el-radio-group>
      </div>
      <div class="group-actions">
        <el-button
          type="primary"
          size="small"
          :disabled="lookupItemAddDisabled"
          @click="handleAddLookupItem"
        >
          {{ t('views.element_plus_engineering.audit_management.add_query_item') }}
        </el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="groupAddDisabled"
          @click="handleAddQueryGroup"
        >
          {{ t('views.element_plus_engineering.audit_management.add_subgroup') }}
        </el-button>
        <el-button v-if="depth > 0" type="danger" size="small" @click="emit('onRemove')">
          {{ t('views.element_plus_engineering.audit_management.delete_subgroup') }}
        </el-button>
      </div>
    </div>
    <div v-for="item in group.lookup_items" :key="item.nodeId" class="item-block">
      <div class="item-toolbar">
        <span>{{ t('views.element_plus_engineering.audit_management.query_item') }}</span>
        <el-button type="danger" link @click="handleRemoveLookupItem(item.nodeId)">
          {{ t('views.element_plus_engineering.audit_management.delete_query_item') }}
        </el-button>
      </div>
      <audit-entry-grouped-lookup-item-editor
        :item="item"
        :property-add-disabled="propertyAddDisabled"
        @update:item="handleLookupItemChanged"
      />
    </div>
    <div v-for="(child, childIndex) in group.query_groups" :key="child.nodeId" class="group-block">
      <audit-entry-query-group-editor
        :group="child"
        :depth="depth + 1"
        :group-index="childIndex + 1"
        :lookup-item-add-disabled="lookupItemAddDisabled"
        :group-add-disabled="groupAddDisabled || depth + 1 >= MAX_GROUP_DEPTH"
        :property-add-disabled="propertyAddDisabled"
        @update:group="handleQueryGroupChanged"
        @onRemove="handleRemoveQueryGroup(child.nodeId)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { type LogicOperator } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditEntryLookup.ts'
import { type AuditPropertyType } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditPropertyIndicator.ts'
import {
  type LongIdKey,
  type StringIdKey,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'

import AuditEntryGroupedLookupItemEditor from './AuditEntryGroupedLookupItemEditor.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AuditEntryQueryGroupEditor',
})

// region Props 定义

type Props = {
  group: GroupedQueryGroupDraft
  depth?: number
  groupIndex?: number
  lookupItemAddDisabled?: boolean
  groupAddDisabled?: boolean
  propertyAddDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  groupIndex: 1,
  lookupItemAddDisabled: false,
  groupAddDisabled: false,
  propertyAddDisabled: false,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:group', value: GroupedQueryGroupDraft): void
  (e: 'onRemove'): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 分组查询草稿

const LOGIC_OPERATOR_AND: LogicOperator = 0
const LOGIC_OPERATOR_OR: LogicOperator = 1
const MAX_GROUP_DEPTH = 3

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

function createNodeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
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

function cloneGroupedQueryGroupDraft(group: GroupedQueryGroupDraft): GroupedQueryGroupDraft {
  return JSON.parse(JSON.stringify(group)) as GroupedQueryGroupDraft
}

// endregion

// region 查询组编辑

const groupTitle = computed(() =>
  props.depth > 0
    ? t('views.element_plus_engineering.audit_management.subgroup_title', {
        groupIndex: props.groupIndex,
      })
    : t('views.element_plus_engineering.audit_management.root_group'),
)

function handleAddLookupItem(): void {
  emitGroup((group) => {
    group.lookup_items.push(createEmptyGroupedLookupItemDraft())
  })
}

function handleRemoveLookupItem(nodeId: string): void {
  emitGroup((group) => {
    group.lookup_items = group.lookup_items.filter((item) => item.nodeId !== nodeId)
  })
}

function handleAddQueryGroup(): void {
  emitGroup((group) => {
    group.query_groups.push(createEmptyGroupedQueryGroupDraft())
  })
}

function handleRemoveQueryGroup(nodeId: string): void {
  emitGroup((group) => {
    group.query_groups = group.query_groups.filter((item) => item.nodeId !== nodeId)
  })
}

function handleLogicOperatorChanged(value: string | number | boolean | undefined): void {
  if (value !== LOGIC_OPERATOR_AND && value !== LOGIC_OPERATOR_OR) {
    return
  }
  emitGroup((group) => {
    group.logic_operator = value
  })
}

function handleLookupItemChanged(item: GroupedLookupItemDraft): void {
  emitGroup((group) => {
    group.lookup_items = group.lookup_items.map((candidate) =>
      candidate.nodeId === item.nodeId ? item : candidate,
    )
  })
}

function handleQueryGroupChanged(group: GroupedQueryGroupDraft): void {
  emitGroup((currentGroup) => {
    currentGroup.query_groups = currentGroup.query_groups.map((candidate) =>
      candidate.nodeId === group.nodeId ? group : candidate,
    )
  })
}

function emitGroup(updater: (group: GroupedQueryGroupDraft) => void): void {
  const group = cloneGroupedQueryGroupDraft(props.group)
  updater(group)
  emit('update:group', group)
}

// endregion
</script>

<style scoped>
.audit-entry-query-group-editor-container {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-left: 3px solid #409eff;
  border-radius: 4px;
  padding: 10px;
  box-sizing: border-box;
  background: #fafafa;
}

/*noinspection CssUnusedSymbol*/
.audit-entry-query-group-editor-container.depth-1 {
  border-left-color: #67c23a;
  background: #f8faf5;
}

/*noinspection CssUnusedSymbol*/
.audit-entry-query-group-editor-container.depth-2 {
  border-left-color: #e6a23c;
  background: #fffaf0;
}

/*noinspection CssUnusedSymbol*/
.audit-entry-query-group-editor-container.depth-3,
.audit-entry-query-group-editor-container.depth-4 {
  border-left-color: #f56c6c;
  background: #fff6f6;
}

.group-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.group-options {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.group-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.group-actions :deep(.el-button + .el-button) {
  margin-left: 5px;
}

.group-options > * + * {
  margin-left: 5px;
}

.group-title {
  font-weight: 600;
  color: #303133;
}

.group-logic-label {
  color: #606266;
}

/*noinspection CssUnusedSymbol*/
.group-logic-radios :deep(.el-radio) {
  margin-right: 5px;
}

/*noinspection CssUnusedSymbol*/
.group-logic-radios :deep(.el-radio:last-child) {
  margin-right: 0;
}

.item-block,
.group-block {
  margin-top: 8px;
}

.item-block {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
}

.item-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  font-weight: 600;
}
</style>
