<template>
  <chart :option-serial.sync="optionSerial"></chart>
</template>

<script>
import Chart from '@/components/chart/Chart.vue';

export default {
  name: 'FundChangeChart',
  components: { Chart },
  props: {
    category: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    category(value) {
      this.optionSerial.push({
        xAxis: {
          data: value,
        },
      });
    },
    data(value) {
      this.optionSerial.push({
        series: [{
          data: value,
        }],
      });
    },
  },
  data() {
    return {
      optionSerial: [],
      defaultOption: {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const firstParam = params[0];
            return `${firstParam.data.value[0]} : ${firstParam.data.value[1]}`;
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
              return value.substring(0, 10);
            },
          },
          data: this.category,
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          type: 'bar',
          itemStyle: {
            color: (params) => {
              if (params.data.value[1] >= 0) {
                return '#67C23A';
              }
              return '#F56C6C';
            },
          },
          data: this.data,
        }],
      },
    };
  },
  mounted() {
    this.optionSerial.push(this.defaultOption);
  },
};
</script>

<style scoped>
</style>
