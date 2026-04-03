<template>
  <native-form class="node-setting-form" :model="model" :label-width="labelWidth">
    <native-form-item label="导航键">
      <input v-model="model.key" class="form-input" type="text" :readonly="readonly" />
    </native-form-item>
    <native-form-item class="form-item-grow json-tabs-form-item" label="显示">
      <native-tabs v-model="displayTabActiveName" tab-position="top" class="json-record-tabs">
        <native-tab-pane
          v-for="tab in vizRecordTabs"
          :key="tab.tabKey"
          :name="tab.paramKey"
          :label="tab.label"
        >
          <textarea
            :value="displayTextareaValue(tab.paramKey)"
            class="text-area"
            :readonly="readonly"
            spellcheck="false"
            :aria-label="tab.label"
            @input="onDisplayFieldInput(tab.paramKey, $event)"
          />
        </native-tab-pane>
      </native-tabs>
    </native-form-item>
    <native-form-item label="在菜单中显示">
      <label class="check-label">
        <input v-model="model.menu.shown" type="checkbox" :disabled="readonly" />
        <span>启用</span>
      </label>
    </native-form-item>
    <native-form-item label="在快捷导航中显示">
      <label class="check-label">
        <input v-model="model.ezNav.shown" type="checkbox" :disabled="readonly" />
        <span>启用</span>
      </label>
    </native-form-item>
    <native-form-item label="在快捷导航中固定">
      <label class="check-label">
        <input v-model="model.ezNav.affix" type="checkbox" :disabled="readonly" />
        <span>启用</span>
      </label>
    </native-form-item>
    <native-form-item label="快捷导航固定索引">
      <input
        v-model.number="model.ezNav.affixIndex"
        class="form-input narrow"
        type="number"
        :readonly="readonly"
        min="0"
        step="1"
      />
    </native-form-item>
    <native-form-item label="快捷导航关闭行为">
      <select v-model="model.ezNav.closedBehavior.type" class="form-select" :disabled="readonly">
        <option value="back">back</option>
        <option value="default">default</option>
        <option value="none">none</option>
      </select>
    </native-form-item>
    <native-form-item class="form-item-grow" label="快捷导航关闭行为数据">
      <textarea
        v-model="closedBehaviorDataText"
        class="text-area"
        :readonly="readonly"
        spellcheck="false"
      />
    </native-form-item>
    <native-form-item label="分配路由">
      <label class="check-label">
        <input v-model="model.router.required" type="checkbox" :disabled="readonly" />
        <span>启用</span>
      </label>
    </native-form-item>
    <native-form-item label="路由路径">
      <input v-model="model.router.path" class="form-input" type="text" :readonly="readonly" />
    </native-form-item>
    <native-form-item label="路由组件键">
      <div class="row-with-btn">
        <input
          v-model="model.router.component.key"
          class="form-input"
          type="text"
          :readonly="readonly"
        />
        <native-button kind="primary" :disabled="readonly" @click="compregDialogVisible = true">
          选择
        </native-button>
      </div>
    </native-form-item>
    <native-form-item class="form-item-grow json-tabs-form-item" label="路由组件参数">
      <native-tabs v-model="routerParamTabActiveName" tab-position="top" class="json-record-tabs">
        <native-tab-pane
          v-for="tab in vizRecordTabs"
          :key="`p-${tab.tabKey}`"
          :name="tab.paramKey"
          :label="tab.label"
        >
          <textarea
            :value="routerParamTextareaValue(tab.paramKey)"
            class="text-area"
            :readonly="readonly"
            spellcheck="false"
            :aria-label="tab.label"
            @input="onRouterParamFieldInput(tab.paramKey, $event)"
          />
        </native-tab-pane>
      </native-tabs>
    </native-form-item>
    <native-form-item label="权限控制">
      <label class="check-label">
        <input v-model="model.permission.required" type="checkbox" :disabled="readonly" />
        <span>启用</span>
      </label>
    </native-form-item>
    <native-form-item label="权限节点">
      <div class="row-with-btn">
        <input
          v-model="model.permission.node"
          class="form-input"
          type="text"
          :readonly="readonly"
        />
        <native-button
          kind="primary"
          :disabled="readonly"
          @click="permissionSelectorVisible = true"
        >
          选择
        </native-button>
      </div>
    </native-form-item>
  </native-form>
  <compreg-support-select-dialog
    v-model:visible="compregDialogVisible"
    @on-confirmed="onCompregPicked"
  />
  <permission-node-select-dialog
    v-model:visible="permissionSelectorVisible"
    @on-confirmed="onPermissionPicked"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import vim from '@/vim'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import { type CompregSupportRow } from '@/views/nodes/comvisual/developerTools/compregSupport/compregSupportRow.ts'
import CompregSupportSelectDialog from '@/views/nodes/comvisual/developerTools/compregSupport/CompregSupportSelectDialog.vue'
import PermissionNodeSelectDialog from '@/views/nodes/comvisual/systemSettings/permissionNode/PermissionNodeSelectDialog.vue'

import { type JsonObject } from '@dwarfeng/familyhelper-ui-component-util/src/util/json.ts'
import { type Permission } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/permission.ts'

import { type NodeInfo } from '../nodeInfo.ts'
import { parseNodeInfoContent, stringifyNodeInfo } from '../nodeInfo.ts'

defineOptions({
  name: 'NodeInfoForm',
})

// region Props 定义

type Props = {
  content: string
  fallbackKey: string
  labelWidth?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '80px',
  readonly: false,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:content', value: string): void
}

const emit = defineEmits<Emits>()

// endregion

// region 模型定义

const model = reactive<NodeInfo>(parseNodeInfoContent('', props.fallbackKey))

// endregion

// region 可视化器 Tab 与 JSON 字段

const vizRecordTabs = computed(() => {
  const lib = vim.ctx().library()
  const tabs: { tabKey: string; paramKey: string; label: string }[] = []
  const keys = [...lib.visualizerInfoKeys()].sort((a, b) => a.localeCompare(b))
  tabs.push({ tabKey: '0', paramKey: '', label: '默认' })
  for (const k of keys) {
    if (k === '') {
      continue
    }
    const v = lib.visualizerInfo(k)
    if (v) {
      tabs.push({ tabKey: `0${k}`, paramKey: k, label: v.name })
    }
  }
  return tabs
})

function allowedParamKeySet(): Set<string> {
  return new Set(vizRecordTabs.value.map((t) => t.paramKey))
}

function pruneJsonObjectRecord(record: Record<string, JsonObject>): void {
  const allow = allowedParamKeySet()
  for (const k of Object.keys(record)) {
    if (!allow.has(k)) {
      delete record[k]
    }
  }
}

const displayTabActiveName = ref('')
const routerParamTabActiveName = ref('')

function jsonBlockText(record: Record<string, JsonObject>, paramKey: string): string {
  if (!Object.prototype.hasOwnProperty.call(record, paramKey)) {
    return ''
  }
  return JSON.stringify(record[paramKey], null, 2)
}

// endregion

// region JSON 解析与应用

type ParseJsonObjectFieldResult =
  | { kind: 'object'; value: JsonObject }
  | { kind: 'empty' }
  | { kind: 'error' }

function parseJsonObjectField(raw: string): ParseJsonObjectFieldResult {
  const t = raw.trim()
  if (t === '') {
    return { kind: 'empty' }
  }
  try {
    const p: unknown = JSON.parse(raw)
    if (p !== null && typeof p === 'object' && !Array.isArray(p)) {
      return { kind: 'object', value: p as JsonObject }
    }
    return { kind: 'error' }
  } catch {
    return { kind: 'error' }
  }
}

function applyParsedToRecord(
  record: Record<string, JsonObject>,
  paramKey: string,
  parsed: ParseJsonObjectFieldResult,
): void {
  if (parsed.kind === 'empty') {
    delete record[paramKey]
    return
  }
  if (parsed.kind === 'object') {
    record[paramKey] = parsed.value
  }
}

function displayTextareaValue(paramKey: string): string {
  return jsonBlockText(model.display, paramKey)
}

function routerParamTextareaValue(paramKey: string): string {
  return jsonBlockText(model.router.component.param, paramKey)
}

function onDisplayFieldInput(paramKey: string, e: Event): void {
  if (props.readonly) {
    return
  }
  const raw = (e.target as HTMLTextAreaElement).value
  const r = parseJsonObjectField(raw)
  if (r.kind === 'error') {
    return
  }
  applyParsedToRecord(model.display, paramKey, r)
}

function onRouterParamFieldInput(paramKey: string, e: Event): void {
  if (props.readonly) {
    return
  }
  const raw = (e.target as HTMLTextAreaElement).value
  const r = parseJsonObjectField(raw)
  if (r.kind === 'error') {
    return
  }
  applyParsedToRecord(model.router.component.param, paramKey, r)
}

// endregion

// region Watchers

watch(
  () => vizRecordTabs.value,
  (tabs) => {
    if (tabs.length === 0) {
      displayTabActiveName.value = ''
      routerParamTabActiveName.value = ''
      return
    }
    const names = new Set(tabs.map((t) => t.paramKey))
    if (!names.has(displayTabActiveName.value)) {
      displayTabActiveName.value = tabs[0]?.paramKey ?? ''
    }
    if (!names.has(routerParamTabActiveName.value)) {
      routerParamTabActiveName.value = tabs[0]?.paramKey ?? ''
    }
    pruneJsonObjectRecord(model.display)
    pruneJsonObjectRecord(model.router.component.param)
  },
  { immediate: true },
)

let syncingContentFromProps = 0

watch(
  () => props.content,
  () => {
    syncingContentFromProps += 1
    try {
      const next = parseNodeInfoContent(props.content, props.fallbackKey)
      Object.assign(model, next)
      pruneJsonObjectRecord(model.display)
      pruneJsonObjectRecord(model.router.component.param)
    } finally {
      syncingContentFromProps -= 1
    }
  },
  { immediate: true },
)

watch(
  () => stringifyNodeInfo(model),
  (serialized) => {
    if (props.readonly) {
      return
    }
    if (syncingContentFromProps > 0) {
      return
    }
    if (serialized === props.content) {
      return
    }
    emit('update:content', serialized)
  },
)

watch(
  () => props.fallbackKey,
  (fk) => {
    if (!model.key) {
      model.key = fk
    }
  },
)

// endregion

// region 快捷导航关闭行为数据

const closedBehaviorDataText = computed<string>({
  get: () => JSON.stringify(model.ezNav.closedBehavior.data, null, 2),
  set: (v: string) => {
    try {
      const p: unknown = JSON.parse(v || '{}')
      model.ezNav.closedBehavior.data =
        p !== null && typeof p === 'object' && !Array.isArray(p)
          ? coerceFlatStringRecord(p as Record<string, unknown>)
          : {}
    } catch {
      model.ezNav.closedBehavior.data = {}
    }
  },
})

function coerceFlatStringRecord(o: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(o)) {
    if (typeof val === 'string') {
      out[k] = val
    }
  }
  return out
}

// endregion

// region 组件注册 / 选择类对话框

const compregDialogVisible = ref(false)
const permissionSelectorVisible = ref(false)

function onCompregPicked(row: CompregSupportRow): void {
  model.router.component.key = row.key
  try {
    model.router.component.param = JSON.parse(
      JSON.stringify(row.exampleRouterComponentParam),
    ) as Record<string, JsonObject>
  } catch {
    model.router.component.param = {}
  }
  pruneJsonObjectRecord(model.router.component.param)
  compregDialogVisible.value = false
}

function onPermissionPicked(permission: Permission): void {
  model.permission.node = `${permission.key.scope_string_id};${permission.key.permission_string_id}`
  permissionSelectorVisible.value = false
}

// endregion
</script>

<style scoped>
.node-setting-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.form-input.narrow {
  max-width: 120px;
}

.form-select {
  height: 32px;
  min-width: 160px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 8px;
}

.text-area {
  width: 100%;
  min-height: 150px;
  box-sizing: border-box;
  padding: 8px 10px;
  font-size: 13px;
  font-family: monospace;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: none;
}

.form-item-grow {
  align-items: flex-start;
}

.json-record-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.json-tabs-form-item {
  min-height: 200px;
}

/*noinspection CssUnusedSymbol*/
.json-tabs-form-item :deep(.native-form-item__content) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/*noinspection CssUnusedSymbol*/
.json-record-tabs :deep(.native-tabs__content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/*noinspection CssUnusedSymbol*/
.json-record-tabs :deep(.native-tab-pane) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.check-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.row-with-btn {
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  width: 100%;
}

.row-with-btn .form-input {
  flex: 1;
}
</style>
