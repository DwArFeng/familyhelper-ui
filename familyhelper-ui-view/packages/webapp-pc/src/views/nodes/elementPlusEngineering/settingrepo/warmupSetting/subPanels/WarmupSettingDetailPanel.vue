<template>
  <div class="warmup-setting-detail-panel-container">
    <placeholder-panel
      v-if="warmupSettingId === ''"
      :text="t('views.element_plus_engineering.settingrepo.select_warmup_setting')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="refresh">
              {{ t('views.element_plus_engineering.settingrepo.refresh_data') }}
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesDisabled"
              @click="handleApplyChangesClicked"
            >
              {{ t('views.element_plus_engineering.settingrepo.apply_changes') }}
            </el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <overlay-scrollbars-component class="scroll-bar">
            <placeholder-panel
              v-if="!warmupSetting"
              :text="t('views.element_plus_engineering.settingrepo.warmup_setting_unavailable')"
            />
            <el-form v-else class="property-form" label-position="left" label-width="110px" inline>
              <el-form-item
                :label="t('views.element_plus_engineering.settingrepo.primary_key')"
                style="width: 100%"
              >
                {{ warmupSetting.key.long_id }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.settingrepo.cache_type')"
                style="width: 100%"
              >
                {{ cacheTypeLabel }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.settingrepo.enabled')"
                style="width: 100%"
              >
                {{
                  warmupSetting.enabled
                    ? t('views.element_plus_engineering.settingrepo.yes')
                    : t('views.element_plus_engineering.settingrepo.no')
                }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.settingrepo.target_category_id')"
                style="width: 100%"
              >
                {{ warmupSetting.targetStringAlpha }}
              </el-form-item>
              <el-form-item
                v-if="warmupSetting.type === 1"
                :label="t('views.element_plus_engineering.settingrepo.item_string_id')"
                style="width: 100%"
              >
                {{ warmupSetting.targetStringBravo }}
              </el-form-item>
              <template v-if="warmupSetting.type === 20 || warmupSetting.type === 21">
                <el-form-item
                  :label="t('views.element_plus_engineering.settingrepo.language')"
                  style="width: 100%"
                >
                  {{ warmupSetting.targetStringCharlie }}
                </el-form-item>
                <el-form-item
                  :label="t('views.element_plus_engineering.settingrepo.country')"
                  style="width: 100%"
                >
                  {{ warmupSetting.targetStringDelta }}
                </el-form-item>
                <el-form-item
                  :label="t('views.element_plus_engineering.settingrepo.variant')"
                  style="width: 100%"
                >
                  {{ warmupSetting.targetStringEcho }}
                </el-form-item>
              </template>
              <el-form-item
                :label="t('views.element_plus_engineering.settingrepo.args_array')"
                style="width: 100%"
              >
                {{ argsText }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.settingrepo.remark')"
                style="width: 100%"
              >
                {{ warmupSetting.remark }}
              </el-form-item>
            </el-form>
          </overlay-scrollbars-component>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { type WarmupSetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupSetting.ts'
import { get } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupSetting.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'WarmupSettingDetailPanel',
})

// region Props 定义

type Props = {
  warmupSettingId: string
  applyChangesDisabled?: boolean
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  applyChangesDisabled: false,
  mode: 'DEFAULT',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onApplyChanges'): void
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

function handleApplyChangesClicked(): void {
  emit('onApplyChanges')
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 预热设置详情

const cacheTypeOptions: { type: number; label: string }[] = [
  { type: 0, label: t('views.element_plus_engineering.settingrepo.kv_inspect') },
  { type: 1, label: t('views.element_plus_engineering.settingrepo.kv_item_inspect') },
  { type: 10, label: t('views.element_plus_engineering.settingrepo.navigation_inspect') },
  { type: 20, label: t('views.element_plus_engineering.settingrepo.iahn_locale_map') },
  { type: 21, label: t('views.element_plus_engineering.settingrepo.iahn_message_map') },
  { type: 22, label: t('views.element_plus_engineering.settingrepo.iahn_locale_list') },
  { type: 23, label: t('views.element_plus_engineering.settingrepo.iahn_mek_list') },
  { type: 24, label: t('views.element_plus_engineering.settingrepo.iahn_message_table') },
]

const warmupSetting = ref<WarmupSetting | null>(null)

const cacheTypeLabel = computed(() => {
  const type = warmupSetting.value?.type
  return (
    cacheTypeOptions.find((option) => option.type === type)?.label ??
    t('views.element_plus_engineering.settingrepo.unknown_parenthesized')
  )
})

const argsText = computed(() => JSON.stringify(warmupSetting.value?.targetStringArrayAlpha ?? []))

watch(
  () => props.warmupSettingId,
  (value) => {
    handleInspect(value)
  },
)

async function handleInspect(id: string): Promise<void> {
  if (id === '') {
    warmupSetting.value = null
    return
  }
  loading.value += 1
  try {
    warmupSetting.value = await resolveResponse(get({ long_id: id }))
  } catch {
    warmupSetting.value = null
  } finally {
    loading.value -= 1
  }
}

function refresh(): void {
  void handleInspect(props.warmupSettingId)
}

defineExpose({
  refresh,
})

onMounted(() => {
  handleInspect(props.warmupSettingId)
})

// endregion
</script>

<style scoped>
.warmup-setting-detail-panel-container {
  width: 100%;
  height: 100%;
  background: var(--el-bg-color);
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.scroll-bar {
  height: 100%;
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
  width: 240px;
  color: var(--el-text-color-regular);
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
