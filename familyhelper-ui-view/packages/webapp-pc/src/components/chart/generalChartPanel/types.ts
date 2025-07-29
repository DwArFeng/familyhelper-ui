// 引入系列类型定义。
import { type BarSeriesOption, type LineSeriesOption } from 'echarts/charts'

// 引入组件类型定义。
import {
  type TitleComponentOption,
  type TooltipComponentOption,
  type GridComponentOption,
  type DatasetComponentOption,
  type ToolboxComponentOption,
  type LegendComponentOption,
  type DataZoomComponentOption,
} from 'echarts/components'

// 引入类型组合工具
import { type ComposeOption } from 'echarts/core'

// 引入初始化选项。
import { type EChartsInitOpts } from 'echarts/core'

// 导出通用图表的类型。
export type GeneralChartPanelOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | ToolboxComponentOption
  | LegendComponentOption
  | DataZoomComponentOption
>

export type RendererType = EChartsInitOpts['renderer']
