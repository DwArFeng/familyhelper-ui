<template>
  <div class="warmup-setting-detail-panel-container">
    <placeholder-panel v-if="warmupSettingId === ''" text="请选择预热设置" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="refresh">刷新数据</el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesDisabled"
              @click="handleApplyChangesClicked"
            >
              应用变更
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
            <placeholder-panel v-if="!warmupSetting" text="无法查看预热设置" />
            <el-form v-else class="property-form" label-position="left" label-width="110px" inline>
              <el-form-item label="主键" style="width: 100%">
                {{ warmupSetting.key.long_id }}
              </el-form-item>
              <el-form-item label="缓存类型" style="width: 100%">
                {{ cacheTypeLabel }}
              </el-form-item>
              <el-form-item label="使能" style="width: 100%">
                {{ warmupSetting.enabled ? '是' : '否' }}
              </el-form-item>
              <el-form-item label="分类主键" style="width: 100%">
                {{ warmupSetting.targetStringAlpha }}
              </el-form-item>
              <el-form-item v-if="warmupSetting.type === 1" label="条目主键" style="width: 100%">
                {{ warmupSetting.targetStringBravo }}
              </el-form-item>
              <template v-if="warmupSetting.type === 20 || warmupSetting.type === 21">
                <el-form-item label="语言" style="width: 100%">
                  {{ warmupSetting.targetStringCharlie }}
                </el-form-item>
                <el-form-item label="国家" style="width: 100%">
                  {{ warmupSetting.targetStringDelta }}
                </el-form-item>
                <el-form-item label="变体" style="width: 100%">
                  {{ warmupSetting.targetStringEcho }}
                </el-form-item>
              </template>
              <el-form-item label="参数数组" style="width: 100%">
                {{ argsText }}
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
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
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { type WarmupSetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupSetting.ts'
import { get } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupSetting.ts'
import { resolveResponse } from '@/util/response.ts'

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
  { type: 0, label: '键值查看' },
  { type: 1, label: '键值条目查看' },
  { type: 10, label: '导航查看' },
  { type: 20, label: '国际化地区映射' },
  { type: 21, label: '国际化消息映射' },
  { type: 22, label: '国际化地区列表' },
  { type: 23, label: '国际化文本键列表' },
  { type: 24, label: '国际化消息表' },
]

const warmupSetting = ref<WarmupSetting | null>(null)

const cacheTypeLabel = computed(() => {
  const type = warmupSetting.value?.type
  return cacheTypeOptions.find((option) => option.type === type)?.label ?? '（未知）'
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
  background: #ffffff;
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
  color: #99a9bf;
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
