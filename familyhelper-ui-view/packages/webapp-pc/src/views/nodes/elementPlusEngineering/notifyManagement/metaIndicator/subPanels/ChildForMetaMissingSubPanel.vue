<template>
  <div class="child-for-meta-missing-sub-panel-container">
    <placeholder-panel
      v-if="propsInvalid"
      :text="
        t('views.element_plus_engineering.notify_management.specify_notify_setting_topic_user')
      "
    />
    <div class="valid-container" v-else v-loading="loading">
      <placeholder-panel
        v-if="metaIndicatorItems.length === 0"
        :text="t('views.element_plus_engineering.notify_management.no_missing_meta_items')"
      />
      <div class="select-container" v-else>
        <el-input
          v-model="labelFilterBarValue"
          :placeholder="t('views.element_plus_engineering.notify_management.name_filter')"
          clearable
        />
        <el-table
          class="table"
          height="100%"
          stripe
          tooltip-effect="dark"
          border
          :data="metaIndicatorTableFilteredData"
          @selection-change="handleMetaIndicatorTableSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            prop="label"
            :label="t('views.element_plus_engineering.notify_management.property_name')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="remark"
            :label="t('views.element_plus_engineering.notify_management.remark')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="default_value"
            :label="t('views.element_plus_engineering.notify_management.default_value')"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'

import { type MetaIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import { metaMissing } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'ChildForMetaMissingSubPanel',
})

// region Props 定义

type Props = {
  notifySettingId: string
  topicId: string
  accountId: string
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'onSelectionChanged', selection: MetaIndicator[]): void
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

const labelFilterBarValue = ref<string>('')

// endregion

// region 元数据指示器查询

const propsInvalid = computed<boolean>(() => {
  return !props.notifySettingId || !props.topicId || !props.accountId
})

watch(
  () => props.notifySettingId,
  () => {
    handleMetaIndicatorSearch()
  },
)

watch(
  () => props.topicId,
  () => {
    handleMetaIndicatorSearch()
  },
)

watch(
  () => props.accountId,
  () => {
    handleMetaIndicatorSearch()
  },
)

function handleMetaIndicatorSearch(): void {
  if (propsInvalid.value) {
    metaIndicatorItems.value = []
  } else {
    handleMetaIndicatorMetaMissingSearch()
  }
}

async function handleMetaIndicatorMetaMissingSearch(): Promise<void> {
  loading.value += 1
  try {
    metaIndicatorItems.value = await resolveResponse(
      metaMissing(props.notifySettingId, props.topicId, props.accountId),
    )
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleMetaIndicatorSearch()
})

// endregion

// region 元数据指示器表格

const metaIndicatorItems = ref<MetaIndicator[]>([])

const metaIndicatorTableFilteredData = computed<MetaIndicator[]>(() => {
  if (!labelFilterBarValue.value) {
    return metaIndicatorItems.value
  }
  return metaIndicatorItems.value.filter((data) => data.label.includes(labelFilterBarValue.value))
})

function handleMetaIndicatorTableSelectionChange(selection: MetaIndicator[]): void {
  emit('onSelectionChanged', selection)
}

// endregion
</script>

<style scoped>
.child-for-meta-missing-sub-panel-container {
  height: 100%;
  width: 100%;
}

.select-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.select-container .table {
  height: 0;
  flex-grow: 1;
  margin-top: 5px;
}

.valid-container {
  width: 100%;
  height: 100%;
}
</style>
