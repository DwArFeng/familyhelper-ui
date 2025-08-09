<template>
  <div class="bank-card-panel-container">
    <div class="placeholder" v-if="accountBook === null">请选择账本</div>
    <div class="bank-card-body" v-else>
      <div class="bank-card-body-grid expand">
        <div class="placeholder" v-if="bankCardTableAnchor === null">请选择银行卡</div>
        <div class="bank-card-body-grid-main" v-else>
          <div class="details-wrapper">
            <title-layout-panel class="details" title="银行卡详情" bordered apply-container-height>
              <el-form class="bank-card-detail" label-position="left" inline label-width="60px">
                <el-form-item label="名称" style="width: 50%">
                  <span>{{ bankCardTableAnchor?.name ?? '（未知）' }}</span>
                </el-form-item>
                <el-form-item label="所有者" style="width: 50%">
                  <span>{{
                    bankCardTableAnchor?.account_book?.owner_account?.key?.string_id ?? '（未知）'
                  }}</span>
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  <!--suppress JSUnresolvedReference -->
                  <span>{{ bankCardTableAnchor?.remark ?? '（未知）' }}</span>
                </el-form-item>
              </el-form>
            </title-layout-panel>
            <title-layout-panel class="details" title="余额" bordered apply-container-height>
              <div class="balance-container">
                <div class="balance-label" :style="{ color: balanceIndicatorColor }">
                  {{ balanceIndicatorValue }}
                </div>
                <div class="balance-label" :style="{ color: balanceIndicatorFormattedColor }">
                  {{ balanceIndicatorFormattedValue }}
                </div>
              </div>
            </title-layout-panel>
            <title-layout-panel class="details" title="图表" bordered>
              <general-chart-panel
                class="balance-chart"
                v-loading="balanceChartLoading"
                :option="balanceChartOption"
                :theme="balanceChartTheme"
                :renderer="balanceChartRender"
              />
            </title-layout-panel>
          </div>
        </div>
      </div>
      <div class="bank-card-body-grid item">
        <div class="details-wrapper">
          <title-layout-panel class="details" title="银行卡列表" bordered>
            <table-panel
              class="bank-card-table"
              v-loading="bankCardTableLoading"
              v-model:current-page="bankCardTableCurrentPage"
              v-model:page-size="bankCardTablePageSize"
              :item-count="bankCardTableItemCount"
              :page-sizes="[15, 20, 30, 50]"
              :items="bankCardTableItems"
              :operate-column-visible="false"
              :inspect-button-visible="false"
              :edit-button-visible="false"
              :delete-button-visible="false"
              @onPagingAttributeChanged="handleBankCardTablePagingAttributeChanged"
              @onCurrentChanged="handleBankCardTableCurrentChanged"
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
import { type DispBankCard } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCard.ts'
import { childForAccountBookDisp as bankCardChildForAccountBookDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCard.ts'
import { type BankCardBalanceHistory } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCardBalanceHistory.ts'
import { childForBankCardDesc as bankCardBalanceHistoryChildForBankCardDesc } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCardBalanceHistory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { computed } from 'vue'

defineOptions({
  name: 'BankCardPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountBook: DispAccountBook | null
}

const props = defineProps<Props>()

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
const bankCardTableCurrent = ref<DispBankCard | null>(null)

const bankCardTableAnchor = computed<DispBankCard | null>(()=>{
  const _bankCardTableCurrent: DispBankCard | null = bankCardTableCurrent.value
  if (_bankCardTableCurrent) {
    return _bankCardTableCurrent
  }
  const _bankCardTableItems: DispBankCard[] = bankCardTableItems.value
  if (_bankCardTableItems.length > 0) {
    return _bankCardTableItems[0]
  }
  return null
})

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

function handleBankCardTableCurrentChanged(current: DispBankCard | null): void {
  bankCardTableCurrent.value = current
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

// -----------------------------------------------------------余额指示器处理-----------------------------------------------------------
const balanceIndicatorColor = ref<'red' | 'black'>('black')
const balanceIndicatorValue = ref<string>('')
const balanceIndicatorFormattedColor = ref<'red' | 'black'>('black')
const balanceIndicatorFormattedValue = ref<string>('')

function updateBalanceIndicator(): void {
  if (!bankCardTableAnchor.value) {
    return
  }
  updateBalanceIndicator0()
}

function updateBalanceIndicator0(): void {
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

  const _bankCard: DispBankCard | null = bankCardTableAnchor.value
  if (!_bankCard) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  const formattedBalanceValue: string = _bankCard.balance_value.toFixed(2)
  balanceIndicatorValue.value = `${formattedBalanceValue}`
  let formattedValuePrefix: string
  if (_bankCard.balance_value < 0) {
    formattedValuePrefix = '负'
    balanceIndicatorColor.value = 'red'
    balanceIndicatorFormattedColor.value = 'red'
  } else {
    formattedValuePrefix = ''
    balanceIndicatorColor.value = 'black'
    balanceIndicatorFormattedColor.value = 'black'
  }
  const absoluteBalanceValue: string = `${Math.abs(_bankCard.balance_value)}`
  balanceIndicatorFormattedValue.value = `${formattedValuePrefix}${convertCurrency(absoluteBalanceValue)}`
}

watch(
  () => bankCardTableAnchor.value,
  () => {
    updateBalanceIndicator()
  },
)

onMounted(() => {
  updateBalanceIndicator()
})

// -----------------------------------------------------------余额图表处理-----------------------------------------------------------
const BALANCE_CHART_STATIC_OPTION: GeneralChartOption = {
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
  option: balanceChartOption,
  theme: balanceChartTheme,
  renderer: balanceChartRender,
  dynamicOption: balanceChartDynamicOption,
} = useSeparatedGeneralChartPanel(BALANCE_CHART_STATIC_OPTION, {}, undefined, undefined)
const balanceChartLoading = ref<number>(0)

function updateBalanceChart(): void {
  if (!bankCardTableAnchor.value) {
    return
  }
  updateBalanceChart0()
}

async function updateBalanceChart0(): Promise<void> {
  const _bankCard: DispBankCard | null = bankCardTableAnchor.value
  if (!_bankCard) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  balanceChartLoading.value += 1
  try {
    const res = await resolveResponse(
      bankCardBalanceHistoryChildForBankCardDesc(_bankCard.key, { page: 0, rows: 20 }),
    )
    const histories: BankCardBalanceHistory[] = res.data.reverse()
    const xAxisData: string[] = histories.map((history) => formatTimestamp(history.happened_date))
    const seriesData: [string, number][] = histories.map((history) => [
      formatTimestamp(history.happened_date),
      history.value,
    ])
    balanceChartDynamicOption.value = {
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
    balanceChartLoading.value -= 1
  }
}

watch(
  () => bankCardTableAnchor.value,
  () => {
    updateBalanceChart()
  },
)

onMounted(() => {
  updateBalanceChart()
})
</script>

<style scoped>
.bank-card-panel-container {
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

.bank-card-body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.bank-card-body-grid {
  height: 100%;
}

.bank-card-body-grid.item {
  width: 600px;
}

.bank-card-body-grid.expand {
  width: 0;
  flex-grow: 1;
}

.bank-card-body-grid:first-child {
  margin-right: 10px;
}

.bank-card-body-grid-main {
  width: 100%;
  height: 100%;
}

.bank-card-detail {
  display: flex;
  flex-wrap: wrap;
}

.bank-card-detail :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.bank-card-detail :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.bank-card-detail :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.balance-container {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.balance-label {
  width: 0;
  flex-grow: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.balance-chart {
  width: 100%;
  height: 100%;
}

.bank-card-table {
  width: 100%;
  height: 100%;
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
