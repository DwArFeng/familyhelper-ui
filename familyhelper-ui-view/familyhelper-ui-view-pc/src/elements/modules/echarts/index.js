import Vue from 'vue';

import echarts from 'echarts/lib/echarts';

require('echarts/lib/chart/line');
require('echarts/lib/chart/bar');

require('echarts/lib/component/tooltip');
require('echarts/lib/component/toolbox');
require('echarts/lib/component/dataZoom');
require('echarts/lib/component/title');
require('echarts/lib/component/grid');
require('echarts/lib/component/markArea');
require('echarts/lib/component/markLine');
require('echarts/lib/component/visualMap');
require('echarts/lib/component/legend');
require('echarts/lib/component/legendScroll');
require('echarts/lib/component/legendScroll');

// noinspection JSUnusedGlobalSymbols
Vue.prototype.$echarts = echarts;
