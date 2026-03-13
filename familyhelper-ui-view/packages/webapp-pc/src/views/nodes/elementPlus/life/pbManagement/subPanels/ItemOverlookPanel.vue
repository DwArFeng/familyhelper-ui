<template>
  <div class="item-overlook-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header">
          <el-button type="primary" :disabled="readOnly" @click="handleShowPbItemEditDialog">
            编辑属性
          </el-button>
          <el-button type="success" @click="updateView">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="overlook-wrapper">
          <title-layout-panel class="details" title="属性" bordered apply-container-height>
            <el-form
              class="property-form"
              label-position="left"
              label-width="80px"
              inline
              :model="formEntity"
            >
              <el-form-item label="名称" style="width: 33%">
                {{ formEntity.name }}
              </el-form-item>
              <el-form-item label="单位" style="width: 33%">
                {{ formEntity.unit }}
              </el-form-item>
              <el-form-item label="比较" style="width: 33%">
                {{ formattedComparator }}
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
                {{ formEntity.remark }}
              </el-form-item>
            </el-form>
          </title-layout-panel>
          <title-layout-panel class="details" title="当前记录" bordered>
            <div class="record-panel">
              <general-chart-panel
                class="record-panel-block chart-panel"
                v-loading="recordChartLoading"
                :option="recordChartOption"
                :theme="recordChartTheme"
                :renderer="recordChartRender"
              />
              <div class="record-panel-block carousel-panel">
                <div class="placeholder" v-if="carouselImages.length === 0">
                  最新记录没有上传图片
                </div>
                <el-carousel
                  class="el-carousel"
                  v-else
                  height="calc(100% - 30px)"
                  type="card"
                  :autoplay="false"
                >
                  <el-carousel-item v-for="(url, index) in carouselImages" :key="index">
                    <el-image
                      class="image"
                      fit="cover"
                      preview-teleported
                      :src="url"
                      :preview-src-list="[url]"
                    />
                  </el-carousel-item>
                </el-carousel>
              </div>
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="pbItemMaintainDialogVisible"
      label-width="100px"
      edit-title="编辑项目"
      :loading="pbItemMaintainDialogLoading"
      :mode="pbItemMaintainDialogMode"
      :item="pbItemMaintainDialogItem"
      :edit-rules="pbItemMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemEdit="handlePbItemEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="pbItemMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input v-model="pbItemMaintainDialogItem.unit" placeholder="数据单位" />
      </el-form-item>
      <el-form-item label="比较" prop="comparator">
        <el-select
          class="asset-bom-select"
          v-model="pbItemMaintainDialogItem.comparator"
          placeholder="请选择"
        >
          <el-option
            v-for="option in comparatorOptions"
            :key="option.key"
            :label="option.label"
            :value="option.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="pbItemMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/common/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import GeneralChartPanel from '@/components/common/chart/generalChartPanel/GeneralChartPanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { type GeneralChartOption } from '@/components/common/chart/generalChartPanel/types.ts'
import { useSeparatedGeneralChartPanel } from '@/components/common/chart/generalChartPanel/composables.ts'
import { useIdentityEditOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import {
  type DispPbItem,
  type PbItemComparator,
  inspectDisp as inspectPbItem,
  updatePbItem,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbItem.ts'
import { childForPbItemRecordedDateDesc as lookupPbRecord } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbRecord.ts'
import {
  childForPbRecordUploadedDateAsc as lookupPbFile,
  downloadPbFile as downloadPbFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbFile.ts'
import { resolveResponse } from '@/util/response.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'ItemOverlookPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  itemId: string
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onItemEdit'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const itemLoading = ref<number>(0)
const recordLoading = ref<number>(0)
const fileLoading = ref<number>(0)
const recordChartLoading = ref<number>(0)

const loading = computed<boolean>(() => {
  return itemLoading.value > 0 || recordLoading.value > 0 || fileLoading.value > 0
})

// -----------------------------------------------------------表单实体-----------------------------------------------------------
type FormEntity = {
  name: string
  unit: string
  comparator: number
  remark: string
}

const formEntity = ref<FormEntity>({
  name: '',
  unit: '',
  comparator: 0,
  remark: '',
})

const formattedComparator = computed<string>(() => {
  switch (formEntity.value.comparator) {
    case 0:
      return '越高越好'
    case 1:
      return '越低越好'
    default:
      return '（未知）'
  }
})

// -----------------------------------------------------------图表处理-----------------------------------------------------------
const RECORD_CHART_STATIC_OPTION: GeneralChartOption = {
  tooltip: {
    trigger: 'axis',
    // 此处 any 是因为难以推断类型，且该方法仅在内部使用，相对可控，故忽略警告。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatter: (params: any) => {
      const firstParam = params[0]
      return `${firstParam.data[0]} : ${firstParam.data[1]}`
    },
    axisPointer: {
      animation: false,
      axis: 'x',
    },
  },
  grid: {
    left: '3px',
    right: '3px',
    top: '10px',
    bottom: '3px',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    splitLine: {
      show: false,
    },
    axisLabel: {
      margin: 8,
      rotate: 70,
      formatter(value: string) {
        return value.substring(0, 10)
      },
    },
  },
  yAxis: {
    type: 'value',
    scale: true,
  },
  series: [
    {
      name: 'value',
      type: 'line',
    },
  ],
}

const {
  option: recordChartOption,
  theme: recordChartTheme,
  renderer: recordChartRender,
  dynamicOption: recordChartDynamicOption,
} = useSeparatedGeneralChartPanel(RECORD_CHART_STATIC_OPTION, {}, undefined, undefined)

// -----------------------------------------------------------图片轮播-----------------------------------------------------------
const carouselImages = ref<string[]>([])

function revokeFileUrl(): void {
  // 释放旧图片的链接，并清空旧图片链接数组。
  carouselImages.value.forEach((url) => {
    window.URL.revokeObjectURL(url)
  })
  carouselImages.value.splice(0, carouselImages.value.length)
}

// -----------------------------------------------------------查询处理-----------------------------------------------------------
watch(
  () => props.itemId,
  () => {
    updateView()
  },
)

function updateView(): void {
  if (props.itemId === '') {
    return
  }
  inspectItem()
  inspectRecord()
  inspectFile()
}

async function inspectItem(): Promise<void> {
  itemLoading.value += 1
  try {
    const res = await resolveResponse(inspectPbItem({ long_id: props.itemId }))
    updateFormView(res)
  } finally {
    itemLoading.value -= 1
  }
}

function updateFormView(res: DispPbItem): void {
  formEntity.value.name = res.name
  formEntity.value.unit = res.unit
  formEntity.value.comparator = res.comparator ?? 0
  formEntity.value.remark = res.remark
  pbItemMaintainDialogItem.value = {
    long_id: res.key.long_id,
    node_long_id: res.node_key?.long_id ?? '',
    name: res.name,
    unit: res.unit,
    comparator: res.comparator ?? 0,
    remark: res.remark,
  }
}

async function inspectRecord(): Promise<void> {
  recordLoading.value += 1
  recordChartLoading.value += 1
  try {
    const res = await resolveResponse(
      lookupPbRecord({ long_id: props.itemId }, { page: 0, rows: 20 }),
    )
    const data = res.data.reverse()
    const xAxisData: string[] = data.map((record) => formatTimestamp(record.recorded_date))
    const seriesData: [string, number | null][] = data.map((record) => [
      formatTimestamp(record.recorded_date),
      record.value,
    ])
    recordChartDynamicOption.value = {
      xAxis: {
        data: xAxisData,
      },
      series: [
        {
          name: 'value',
          data: seriesData,
        },
      ],
    }
  } finally {
    recordLoading.value -= 1
    recordChartLoading.value -= 1
  }
}

async function inspectFile(): Promise<void> {
  fileLoading.value += 1
  revokeFileUrl()
  try {
    const recordRes = await resolveResponse(
      lookupPbRecord({ long_id: props.itemId }, { page: 0, rows: 1 }),
    )
    if (Number(recordRes.count) <= 0) {
      return
    }
    const record = recordRes.data[0]
    const fileRes = await resolveResponse(lookupPbFile(record.key, { page: 0, rows: 100 }))
    const promises: Promise<Blob | null>[] = []
    fileRes.data.forEach((itemCoverInfo) => {
      promises.push(downloadPbFile(itemCoverInfo.key))
    })
    const blobs = await Promise.all(promises)
    blobs.forEach((blob) => {
      if (blob) {
        carouselImages.value.push(window.URL.createObjectURL(blob))
      }
    })
  } finally {
    fileLoading.value -= 1
  }
}

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowPbItemEditDialog(): void {
  showPbItemMaintainDialog(pbItemMaintainDialogItem.value)
}

// -----------------------------------------------------------个人最佳项目维护对话框-----------------------------------------------------------
type PbItemMaintainDialogItem = {
  long_id: string
  node_long_id: string
  name: string
  unit: string
  comparator: PbItemComparator
  remark: string
}

const {
  visible: pbItemMaintainDialogVisible,
  item: pbItemMaintainDialogItem,
  mode: pbItemMaintainDialogMode,
  showDialog: showPbItemMaintainDialog,
} = useIdentityEditOnlyMaintainDialog<PbItemMaintainDialogItem>({
  long_id: '',
  node_long_id: '',
  name: '',
  unit: '',
  comparator: 0,
  remark: '',
})
const pbItemMaintainDialogLoading = ref<number>(0)
const pbItemMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
})

const comparatorOptions = [
  { key: 0, label: '越高越好' },
  { key: 1, label: '越低越好' },
]

async function handlePbItemEdit(item: PbItemMaintainDialogItem): Promise<void> {
  pbItemMaintainDialogLoading.value += 1
  try {
    const _nodeKey: LongIdKey | null =
      item.node_long_id === '' ? null : { long_id: item.node_long_id }
    await resolveResponse(
      updatePbItem({
        key: { long_id: item.long_id },
        node_key: _nodeKey,
        name: item.name,
        unit: item.unit,
        comparator: item.comparator,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '项目更新成功',
      type: 'success',
    })
    emit('onItemEdit')
    updateView()
    pbItemMaintainDialogVisible.value = false
  } finally {
    pbItemMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
function updateViewMethod(): void {
  updateView()
}

defineExpose({
  updateView: updateViewMethod,
})

onMounted(() => {
  updateView()
})

onUnmounted(() => {
  revokeFileUrl()
})
</script>

<style scoped>
.item-overlook-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.overlook-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.overlook-wrapper .details:not(:first-child) {
  margin-top: 5px;
}

.overlook-wrapper .details:last-child {
  height: 0;
  flex-grow: 1;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
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

.record-panel {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.record-panel .record-panel-block:not(:last-child) {
  margin-right: 10px;
}

.chart-panel {
  width: 0;
  flex-grow: 4;
}

.carousel-panel {
  width: 0;
  flex-grow: 5;
}

.carousel-panel .el-carousel {
  width: 100%;
  height: 100%;
}

.carousel-panel .el-carousel .image {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}
</style>
