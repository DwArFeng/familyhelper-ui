<template>
  <div class="account-book-panel-container">
    <div class="placeholder" v-if="accountBook === null">请选择账本</div>
    <div class="account-book-body" v-else>
      <div class="west-body-grid">
        <div class="details-wrapper">
          <title-layout-panel class="details" title="账本详情" bordered apply-container-height>
            <el-form class="account-book-detail" label-position="left" inline label-width="60px">
              <el-form-item label="名称" style="width: 50%">
                <!--suppress JSUnresolvedReference -->
                <span>{{ accountBook.name }}</span>
              </el-form-item>
              <el-form-item label="所有者" style="width: 50%">
                <!--suppress JSUnresolvedVariable -->
                <span>{{ accountBook.owner_account?.key?.string_id ?? '（未知）' }}</span>
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
                <!--suppress JSUnresolvedReference -->
                <span>{{ accountBook.remark }}</span>
              </el-form-item>
            </el-form>
          </title-layout-panel>
          <title-layout-panel class="details" title="总余额" bordered apply-container-height>
            <div class="total-balance-container">
              <div class="total-balance-label" :style="{ color: totalBalanceIndicatorColor }">
                {{ totalBalanceIndicatorValue }}
              </div>
              <div
                class="total-balance-label"
                :style="{ color: totalBalanceIndicatorFormattedColor }"
              >
                {{ totalBalanceIndicatorFormattedValue }}
              </div>
            </div>
          </title-layout-panel>
          <title-layout-panel class="details" title="总余额图表" bordered expand>
            <general-chart-panel
              class="total-balance-chart"
              v-loading="totalBalanceChartLoading"
              :option="totalBalanceChartOption"
              :theme="totalBalanceChartTheme"
              :renderer="totalBalanceChartRender"
            />
          </title-layout-panel>
        </div>
      </div>
      <div class="east-body-grid">
        <div class="details-wrapper">
          <title-layout-panel class="details" title="银行卡概述" bordered>
            <table-panel
              class="bank-card-table"
              v-loading="bankCardTableLoading"
              v-model:current-page="bankCardTableCurrentPage"
              v-model:page-size="bankCardTablePageSize"
              :item-count="bankCardTableItemCount"
              :page-sizes="[15, 20, 30, 50]"
              :items="bankCardTableItems"
              :inspect-button-visible="false"
              :edit-button-visible="false"
              :delete-button-visible="false"
              @onPagingAttributeChanged="handleBankCardTablePagingAttributeChanged"
            >
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column
                prop="card_type"
                label="类型"
                show-overflow-tooltip
                :formatter="bankCardTableCardTypeFormatter"
              />
              <el-table-column
                prop="balance_value"
                label="余额"
                align="right"
                show-overflow-tooltip
                :formatter="bankCardTableBalanceNumberFormatter"
              />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </table-panel>
          </title-layout-panel>
          <title-layout-panel class="details" title="资金变更概述" bordered>
            <table-panel
              class="fund-change-table"
              v-loading="fundChangeTableLoading"
              v-model:current-page="fundChangeTableCurrentPage"
              v-model:page-size="fundChangeTablePageSize"
              :item-count="fundChangeTableItemCount"
              :page-sizes="[15, 20, 30, 50]"
              :items="fundChangeTableItems"
              :inspect-button-visible="false"
              :edit-button-visible="false"
              :delete-button-visible="false"
              @onPagingAttributeChanged="handleFundChangeTablePagingAttributeChanged"
            >
              <!--suppress HtmlDeprecatedAttribute -->
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
import { type TotalBalanceHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/totalBalanceHistory.ts'
import { childForAccountBookDesc as totalBalanceHistoryChildForAccountBookDesc } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/totalBalanceHistory.ts'
import { type DispBankCard } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCard.ts'
import { childForAccountBookDisp as bankCardChildForAccountBookDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCard.ts'
import { type DispFundChange } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange.ts'
import { childForAccountBookDescDisp as fundChangeChildForAccountBookDescDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'AccountBookPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountBook: DispAccountBook | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------总余额指示器处理-----------------------------------------------------------
const totalBalanceIndicatorColor = ref<'red' | 'black'>('black')
const totalBalanceIndicatorValue = ref<string>('')
const totalBalanceIndicatorFormattedColor = ref<'red' | 'black'>('black')
const totalBalanceIndicatorFormattedValue = ref<string>('')

function updateTotalBalanceIndicator(): void {
  if (!props.accountBook) {
    return
  }
  updateTotalBalanceIndicator0()
}

function updateTotalBalanceIndicator0(): void {
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

  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  const formattedTotalValue: string = _accountBook.total_value.toFixed(2)
  totalBalanceIndicatorValue.value = `${formattedTotalValue}`
  let formattedValuePrefix: string
  if (_accountBook.total_value < 0) {
    formattedValuePrefix = '负'
    totalBalanceIndicatorColor.value = 'red'
    totalBalanceIndicatorFormattedColor.value = 'red'
  } else {
    formattedValuePrefix = ''
    totalBalanceIndicatorColor.value = 'black'
    totalBalanceIndicatorFormattedColor.value = 'black'
  }
  const absoluteTotalValue: string = `${Math.abs(_accountBook.total_value)}`
  totalBalanceIndicatorFormattedValue.value = `${formattedValuePrefix}${convertCurrency(absoluteTotalValue)}`
}

watch(
  () => props.accountBook,
  () => {
    updateTotalBalanceIndicator()
  },
)

onMounted(() => {
  updateTotalBalanceIndicator()
})

// -----------------------------------------------------------总余额图表处理-----------------------------------------------------------
const TOTAL_BALANCE_CHART_STATIC_OPTION: GeneralChartOption = {
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
      name: 'totalBalance',
      type: 'line',
    },
  ],
}

const {
  option: totalBalanceChartOption,
  theme: totalBalanceChartTheme,
  renderer: totalBalanceChartRender,
  dynamicOption: totalBalanceChartDynamicOption,
} = useSeparatedGeneralChartPanel(TOTAL_BALANCE_CHART_STATIC_OPTION, {}, undefined, undefined)
const totalBalanceChartLoading = ref<number>(0)

function updateTotalBalanceChart(): void {
  if (!props.accountBook) {
    return
  }
  updateTotalBalanceChart0()
}

async function updateTotalBalanceChart0(): Promise<void> {
  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  totalBalanceChartLoading.value += 1
  try {
    const res = await resolveResponse(
      totalBalanceHistoryChildForAccountBookDesc(_accountBook.key, { page: 0, rows: 20 }),
    )
    const histories: TotalBalanceHistory[] = res.data.reverse()
    const xAxisData: string[] = histories.map((history) => formatTimestamp(history.happened_date))
    const seriesData: [string, number][] = histories.map((history) => [
      formatTimestamp(history.happened_date),
      history.total_value,
    ])
    totalBalanceChartDynamicOption.value = {
      xAxis: {
        data: xAxisData,
      },
      series: [
        {
          name: 'totalBalance',
          data: seriesData,
        },
      ],
    }
  } finally {
    totalBalanceChartLoading.value -= 1
  }
}

watch(
  () => props.accountBook,
  () => {
    updateTotalBalanceChart()
  },
)

onMounted(() => {
  updateTotalBalanceChart()
})

// -----------------------------------------------------------银行卡表格处理-----------------------------------------------------------
const {
  currentPage: bankCardTableCurrentPage,
  pageSize: bankCardTablePageSize,
  itemCount: bankCardTableItemCount,
  items: bankCardTableItems,
  pagingInfo: bankCardTablePagingInfo,
  updateByLookup: updateBankCardTableByLookup,
} = useIdentityBackendPagingTablePanel<DispBankCard>(15)
const bankCardTableLoading = ref<number>(0)

// 此处 any 是 element-plus API 规定的，故忽略警告。
function bankCardTableCardTypeFormatter(row: DispBankCard): string {
  if (row.type_indicator !== null) {
    return row.type_indicator.label
  }
  if (row.card_type !== '' || row.card_type !== null) {
    return '（未知）'
  }
  return '（未指定）'
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bankCardTableBalanceNumberFormatter(row: DispBankCard, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (row as any)[column.property].toFixed(2)
}

function handleBankCardTablePagingAttributeChanged(): void {
  updateBankCardTable()
}

function updateBankCardTable(): void {
  if (!props.accountBook) {
    return
  }
  updateBankCardTable0()
}

async function updateBankCardTable0(): Promise<void> {
  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  bankCardTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => bankCardChildForAccountBookDisp(_accountBook.key, pagingInfo),
      bankCardTablePagingInfo.value,
    )
    updateBankCardTableByLookup(res)
  } finally {
    bankCardTableLoading.value -= 1
  }
}

watch(
  () => props.accountBook,
  () => {
    updateBankCardTable()
  },
)

onMounted(() => {
  updateBankCardTable()
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

function updateFundChangeTable(): void {
  if (!props.accountBook) {
    return
  }
  updateFundChangeTable0()
}

async function updateFundChangeTable0(): Promise<void> {
  const _accountBook: DispAccountBook | null = props.accountBook
  if (!_accountBook) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  fundChangeTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => fundChangeChildForAccountBookDescDisp(_accountBook.key, pagingInfo),
      fundChangeTablePagingInfo.value,
    )
    updateFundChangeTableByLookup(res)
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
</script>

<style scoped>
.account-book-panel-container {
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

.account-book-body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.west-body-grid {
  height: 100%;
  width: 0;
  flex-grow: 1;
  margin-right: 10px;
}

.east-body-grid {
  height: 100%;
  width: 0;
  flex-grow: 1;
}

.account-book-detail {
  display: flex;
  flex-wrap: wrap;
}

.account-book-detail :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.account-book-detail :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.account-book-detail :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.total-balance-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.total-balance-label {
  width: 0;
  flex-grow: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.total-balance-chart {
  width: 100%;
  height: 100%;
}

.details-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.west-body-grid .details-wrapper .details:not(:first-child) {
  margin-top: 5px;
}

.west-body-grid .details-wrapper .details:last-child {
  height: 0;
  flex-grow: 1;
}

.east-body-grid .details-wrapper .details:not(:first-child) {
  margin-top: 5px;
}

.east-body-grid .details-wrapper .details {
  height: 0;
  flex-grow: 1;
}

.bank-card-table {
  width: 100%;
  height: 100%;
}

.fund-change-table {
  width: 100%;
  height: 100%;
}
</style>
