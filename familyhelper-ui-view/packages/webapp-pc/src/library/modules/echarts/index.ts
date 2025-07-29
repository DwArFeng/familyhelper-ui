// noinspection DuplicatedCode

import { type VimLibraryModule } from '@/library/types.ts'

// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core'
// 引入图表。
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
// 引入组件。
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  ToolboxComponent,
  LegendComponent,
} from 'echarts/components'
// 引入特性。
import { LabelLayout, UniversalTransition } from 'echarts/features'
// 引入渲染器。
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init(): void {
  // 注册必须的组件
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    ToolboxComponent,
    LegendComponent,
    BarChart,
    LineChart,
    PieChart,
    RadarChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
    SVGRenderer,
  ])
}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
