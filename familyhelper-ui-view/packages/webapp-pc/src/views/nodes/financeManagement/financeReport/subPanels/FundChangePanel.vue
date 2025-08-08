<template>
  <div class="fund-change-panel-container">
    <div class="placeholder" v-if="accountBook === null">请选择账本</div>
    <div class="fund-change-body" v-else>
      <div class="fund-change-body-grid expand">
        <div class="placeholder" v-if="fundChangeTableCurrent === null">请选择资金变更数据</div>
        <div class="fund-change-body-grid-main" v-else>
          <div class="details-wrapper">
            <title-layout-panel
              class="details"
              title="资金变更详情"
              bordered
              apply-container-height
            >
              <el-form class="fund-change-detail" label-position="left" inline label-width="70px">
                <el-form-item label="变更类型" style="width: 50%">
                  <span>{{ fundChangeDetailFormattedChangeType }}</span>
                </el-form-item>
                <el-form-item label="变更日期" style="width: 50%">
                  <span>{{ fundChangeDetailFormattedHappenedDate }}</span>
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  <span>{{ fundChangeDetailRemark }}</span>
                </el-form-item>
              </el-form>
            </title-layout-panel>
            <title-layout-panel class="details" title="变更金额" bordered apply-container-height>
              <div class="delta-container">
                <div class="delta-label" :style="{ color: deltaIndicatorColor }">
                  {{ deltaIndicatorValue }}
                </div>
                <div class="delta-label" :style="{ color: deltaIndicatorFormattedColor }">
                  {{ deltaIndicatorFormattedValue }}
                </div>
              </div>
            </title-layout-panel>
            <title-layout-panel class="details" title="图表" bordered>
              <general-chart-panel
                class="fund-change-chart"
                v-loading="fundChangeChartLoading"
                :option="fundChangeChartOption"
                :theme="fundChangeChartTheme"
                :renderer="fundChangeChartRender"
              />
            </title-layout-panel>
          </div>
        </div>
      </div>
      <div class="fund-change-body-grid item">
        <div class="details-wrapper">
          <title-layout-panel class="details" title="资金变更列表" bordered>
            <div class="fund-change-list-wrapper">
              <div
                class="fund-change-type-selector-wrapper loading-spinner__s24"
                v-loading="fundChangeTypeSelectorLoading"
              >
                <el-select
                  class="fund-change-type-selector-select"
                  v-model="fundChangeTypeSelectorSelectModel"
                  placeholder="选择资金变更类型"
                  clearable
                  @change="handleFundChangeTypeSelectorSelectChanged"
                >
                  <el-option
                    v-for="item in fundChangeTypeSelectorOptions"
                    :key="item.key.string_id"
                    :label="item.label"
                    :value="item.key.string_id"
                  />
                </el-select>
                <el-button
                  class="fund-change-type-selector-button"
                  type="success"
                  @click="handleFundChangeTypeSelectorButtonClicked"
                >
                  刷新
                </el-button>
              </div>
              <table-panel
                class="fund-change-table"
                v-loading="fundChangeTableLoading"
                v-model:current-page="fundChangeTableCurrentPage"
                v-model:page-size="fundChangeTablePageSize"
                :item-count="fundChangeTableItemCount"
                :page-sizes="[15, 20, 30, 50]"
                :items="fundChangeTableItems"
                :operate-column-visible="false"
                :inspect-button-visible="false"
                :edit-button-visible="false"
                :delete-button-visible="false"
                @onPagingAttributeChanged="handleFundChangeTablePagingAttributeChanged"
                @onCurrentChanged="handleFundChangeTableCurrentChanged"
              >
                <el-table-column
                  prop="delta"
                  label="变更金额"
                  align="right"
                  show-overflow-tooltip
                  :formatter="fundChangeTableBalanceNumberFormatter"
                />
                <el-table-column
                  prop="change_type"
                  label="资金变更类型"
                  show-overflow-tooltip
                  :formatter="fundChangeTableChangeTypeFormatter"
                />
                <el-table-column
                  prop="happened_date"
                  label="记录日期"
                  width="180px"
                  show-overflow-tooltip
                  :formatter="fundChangeTableTimestampFormatter"
                />
                <el-table-column prop="remark" label="备注" show-overflow-tooltip />
              </table-panel>
            </div>
          </title-layout-panel>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { type GeneralChartOption } from '@/components/chart/generalChartPanel/types.ts'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import TitleLayoutPanel from '@/components/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import GeneralChartPanel from '@/components/chart/generalChartPanel/GeneralChartPanel.vue'

import { useSeparatedGeneralChartPanel } from '@/components/chart/generalChartPanel/composables.ts'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { type FundChangeTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator.ts'
import { all as fundChangeTypeIndicatorAll } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator.ts'
import { type DispFundChange } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange.ts'
import {
  childForAccountBookDescDisp as fundChangeChildForAccountBookDisp,
  childForAccountBookTypeEqualsDescDisp as fundChangeChildForAccountBookTypeEqualsDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange.ts'
import { lookupAllToList, lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'FundChangePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountBook: DispAccountBook | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------资金变更类型指示器处理-----------------------------------------------------------
const fundChangeTypeSelectorOptions = ref<FundChangeTypeIndicator[]>([])
const fundChangeTypeSelectorLoading = ref<number>(0)
const fundChangeTypeSelectorSelectModel = ref<string | null>(null)

function handleFundChangeTypeSelectorButtonClicked(): void {
  updateFundChangeTypeIndicator()
}

function handleFundChangeTypeSelectorSelectChanged(): void {
  updateFundChangeTable()
}

function updateFundChangeTypeIndicator(): void {
  updateFundChangeTypeIndicator0()
}

async function updateFundChangeTypeIndicator0(): Promise<void> {
  fundChangeTypeSelectorLoading.value += 1
  try {
    fundChangeTypeSelectorOptions.value = await lookupAllToList((pagingInfo) =>
      fundChangeTypeIndicatorAll(pagingInfo),
    )
  } finally {
    fundChangeTypeSelectorLoading.value -= 1
  }
}

onMounted(() => {
  updateFundChangeTypeIndicator()
})

// -----------------------------------------------------------资金变更表格处理-----------------------------------------------------------
const {
  currentPage: fundChangeTableCurrentPage,
  pageSize: fundChangeTablePageSize,
  itemCount: fundChangeTableItemCount,
  items: fundChangeTableItems,
  pagingInfo: fundChangeTablePagingInfo,
  updateByLookup: updateFundChangeTableByLookup,
} = useIdentityBackendPagingTablePanel<DispFundChange>(15)
const fundChangeTableLoading = ref<number>(0)
const fundChangeTableCurrent = ref<DispFundChange | null>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fundChangeTableBalanceNumberFormatter(row: DispFundChange, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (row as any)[column.property].toFixed(2)
}

function fundChangeTableChangeTypeFormatter(row: DispFundChange): string {
  if (row.type_indicator !== null) {
    return row.type_indicator.label
  }
  if (row.change_type !== '' || row.change_type !== null) {
    return '（未知）'
  }
  return '（未指定）'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fundChangeTableTimestampFormatter(row: DispFundChange, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function handleFundChangeTablePagingAttributeChanged(): void {
  updateFundChangeTable()
}

function handleFundChangeTableCurrentChanged(current: DispFundChange | null): void {
  fundChangeTableCurrent.value = current
}

function updateFundChangeTable(): void {
  if (!props.accountBook) {
    return
  }
  if (!fundChangeTypeSelectorSelectModel.value) {
    updateFundChangeTableChildForAccountBookDisp()
  } else {
    updateFundChangeTableChildForAccountBookTypeEqualsDisp()
  }
}

async function updateFundChangeTableChildForAccountBookDisp(): Promise<void> {
  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  fundChangeTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => fundChangeChildForAccountBookDisp(_accountBook.key, pagingInfo),
      fundChangeTablePagingInfo.value,
    )
    updateFundChangeTableByLookup(res)
    if (fundChangeTableItems.value.length > 0) {
      fundChangeTableCurrent.value = fundChangeTableItems.value[0]
    }
  } finally {
    fundChangeTableLoading.value -= 1
  }
}

async function updateFundChangeTableChildForAccountBookTypeEqualsDisp(): Promise<void> {
  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  fundChangeTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) =>
        fundChangeChildForAccountBookTypeEqualsDisp(
          _accountBook.key,
          fundChangeTypeSelectorSelectModel.value ?? '',
          pagingInfo,
        ),
      fundChangeTablePagingInfo.value,
    )
    updateFundChangeTableByLookup(res)
    if (fundChangeTableItems.value.length > 0) {
      fundChangeTableCurrent.value = fundChangeTableItems.value[0]
    }
  } finally {
    fundChangeTableLoading.value -= 1
  }
}

watch(
  () => props.accountBook,
  () => {
    updateFundChangeTable()
  },
)

onMounted(() => {
  updateFundChangeTable()
})

// -----------------------------------------------------------资金变更详情处理-----------------------------------------------------------
const fundChangeDetailFormattedChangeType = ref<string>('')
const fundChangeDetailFormattedHappenedDate = ref<string>('')
const fundChangeDetailRemark = ref<string>('')

function updateFundChangeDetail(): void {
  function formatChangeType(fundChange: DispFundChange): string {
    if (fundChange.type_indicator !== null) {
      return fundChange.type_indicator.label
    }
    if (fundChange.change_type !== '' || fundChange.change_type !== null) {
      return '（未知）'
    }
    return '（未指定）'
  }

  const _fundChange: DispFundChange | null = fundChangeTableCurrent.value
  if (!_fundChange) {
    fundChangeDetailFormattedChangeType.value = ''
    fundChangeDetailFormattedHappenedDate.value = ''
    fundChangeDetailRemark.value = ''
  } else {
    fundChangeDetailFormattedChangeType.value = formatChangeType(_fundChange)
    fundChangeDetailFormattedHappenedDate.value = formatTimestamp(_fundChange.happened_date)
    fundChangeDetailRemark.value = _fundChange.remark
  }
}

watch(
  () => fundChangeTableCurrent.value,
  () => {
    updateFundChangeDetail()
  },
)

onMounted(() => {
  updateFundChangeDetail()
})

// -----------------------------------------------------------变更金额指示器处理-----------------------------------------------------------
const deltaIndicatorColor = ref<'red' | 'black'>('black')
const deltaIndicatorValue = ref<string>('')
const deltaIndicatorFormattedColor = ref<'red' | 'black'>('black')
const deltaIndicatorFormattedValue = ref<string>('')

function updateDeltaIndicator(): void {
  if (!fundChangeTableCurrent.value) {
    return
  }
  updateDeltaIndicator0()
}

function updateDeltaIndicator0(): void {
  function convertCurrency(value: string): string {
    if (value === '-') {
      return ''
    }

    let lead: string
    let absoluteValue: string
    if (value.substring(0, 1) === '-') {
      lead = '负'
      absoluteValue = value.substring(1)
    } else {
      lead = ''
      absoluteValue = value
    }

    const maxValue: number = 999999999999.99
    if (parseFloat(absoluteValue) > maxValue) {
      throw new Error(`参数 value 的绝对值超过解析范围: value=${value}, maxValue=${maxValue}`)
    }

    let n: string = absoluteValue

    if (n === '') {
      return ''
    }
    if (n.charAt(n.length - 1) === '.') {
      n = n.substring(0, n.length - 1)
    }

    let unit: string = '千佰拾亿千佰拾万千佰拾元角分'
    let str: string = ''

    const indexPoint: number = n.indexOf('.') // 如果是小数，截取小数点前面的位数

    if (indexPoint >= 0) {
      // 去除小数点，并转化为定点数（*100）。
      const integerPart = n.substring(0, indexPoint)
      let decimalPart = n.substring(indexPoint + 1, n.length)
      if (decimalPart.length === 1) {
        decimalPart += '0'
      }
      n = integerPart + decimalPart
    } else {
      n += '00'
    }

    unit = unit.substring(unit.length - n.length) // 若为整数，截取需要使用的unit单位
    for (let i = 0; i < n.length; i += 1) {
      // noinspection JSCheckFunctionSignatures
      str += '零壹贰叁肆伍陆柒捌玖'.charAt(parseInt(n.charAt(i))) + unit.charAt(i) // 遍历转化为大写的数字
    }

    // noinspection RegExpSingleCharAlternation
    return (
      lead +
      str
        .replace(/零(千|佰|拾|角)/g, '零')
        .replace(/(零)+/g, '零')
        .replace(/零(万|亿|元)/g, '$1')
        .replace(/(亿)万|壹(拾)/g, '$1$2')
        .replace(/^元零?|零分/g, '')
        .replace(/元$/g, '元整')
    )
  }

  const _fundChange: DispFundChange | null = fundChangeTableCurrent.value
  if (!_fundChange) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  const formattedDeltaValue: string = _fundChange.delta.toFixed(2)
  deltaIndicatorValue.value = `${formattedDeltaValue}`
  let formattedValuePrefix: string
  if (_fundChange.delta < 0) {
    formattedValuePrefix = '负'
    deltaIndicatorColor.value = 'red'
    deltaIndicatorFormattedColor.value = 'red'
  } else {
    formattedValuePrefix = ''
    deltaIndicatorColor.value = 'black'
    deltaIndicatorFormattedColor.value = 'black'
  }
  const absoluteDeltaValue: string = `${Math.abs(_fundChange.delta)}`
  deltaIndicatorFormattedValue.value = `${formattedValuePrefix}${convertCurrency(absoluteDeltaValue)}`
}

watch(
  () => fundChangeTableCurrent.value,
  () => {
    updateDeltaIndicator()
  },
)

onMounted(() => {
  updateDeltaIndicator()
})

// -----------------------------------------------------------资金变更图表处理-----------------------------------------------------------
const FUND_CHANGE_CHART_STATIC_OPTION: GeneralChartOption = {
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
      formatter(value) {
        return value.substring(0, 10)
      },
    },
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'delta',
      type: 'bar',
      itemStyle: {
        // 此处 any 是因为难以推断类型，且该方法仅在内部使用，相对可控，故忽略警告。
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: (params: any) => {
          if (params.data[1] >= 0) {
            return '#67C23A'
          }
          return '#F56C6C'
        },
      },
    },
  ],
}

const {
  option: fundChangeChartOption,
  theme: fundChangeChartTheme,
  renderer: fundChangeChartRender,
  dynamicOption: fundChangeChartDynamicOption,
} = useSeparatedGeneralChartPanel(FUND_CHANGE_CHART_STATIC_OPTION, {}, undefined, undefined)
const fundChangeChartLoading = ref<number>(0)

function updateFundChangeChart(): void {
  if (!props.accountBook) {
    return
  }
  updateFundChangeChart0()
}

async function updateFundChangeChart0(): Promise<void> {
  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  fundChangeChartLoading.value += 1
  try {
    let res
    if (!fundChangeTypeSelectorSelectModel.value) {
      res = await resolveResponse(
        fundChangeChildForAccountBookDisp(_accountBook.key, { page: 0, rows: 20 }),
      )
    } else {
      res = await resolveResponse(
        fundChangeChildForAccountBookTypeEqualsDisp(
          _accountBook.key,
          fundChangeTypeSelectorSelectModel.value,
          { page: 0, rows: 20 },
        ),
      )
    }
    const fundChanges: DispFundChange[] = res.data.reverse()
    const xAxisData: string[] = fundChanges.map((fundChange) =>
      formatTimestamp(fundChange.happened_date),
    )
    const seriesData: [string, number][] = fundChanges.map((fundChange) => [
      formatTimestamp(fundChange.happened_date),
      fundChange.delta,
    ])
    fundChangeChartDynamicOption.value = {
      xAxis: {
        data: xAxisData,
      },
      series: [
        {
          name: 'delta',
          data: seriesData,
        },
      ],
    }
  } finally {
    fundChangeChartLoading.value -= 1
  }
}

watch(
  () => [props.accountBook, fundChangeTypeSelectorSelectModel.value],
  () => {
    updateFundChangeChart()
  },
)

onMounted(() => {
  updateFundChangeChart()
})
</script>

<style scoped>
.fund-change-panel-container {
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

.fund-change-body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.fund-change-body-grid {
  height: 100%;
}

.fund-change-body-grid:first-child {
  margin-right: 10px;
}

.fund-change-body-grid.item {
  width: 600px;
}

.fund-change-body-grid.expand {
  width: 0;
  flex-grow: 1;
}

.fund-change-body-grid-main {
  width: 100%;
  height: 100%;
}

.fund-change-detail {
  display: flex;
  flex-wrap: wrap;
}

.fund-change-detail :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.fund-change-detail :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.fund-change-detail :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.delta-container {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.delta-label {
  width: 0;
  flex-grow: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.fund-change-chart {
  width: 100%;
  height: 100%;
}

.fund-change-list-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}

.fund-change-type-selector-wrapper {
  display: flex;
  flex-direction: row;
}

.fund-change-type-selector-select {
  width: 0;
  flex-grow: 1;
}

.fund-change-type-selector-button {
  margin-left: 5px;
}

.fund-change-table {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.details-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.details-wrapper .details:not(:first-child) {
  margin-top: 5px;
}

.details-wrapper .details:last-child {
  height: 0;
  flex-grow: 1;
}

.details-wrapper .details:not(:first-child) {
  margin-top: 5px;
}
</style>
