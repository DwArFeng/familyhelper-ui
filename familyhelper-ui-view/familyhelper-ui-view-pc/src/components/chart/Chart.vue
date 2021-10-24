<template>
  <div class="chart" ref="container"></div>
</template>

<script>
export default {
  name: 'Chart',
  props: {
    optionSerial: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    optionSerial(value) {
      this.watchedOptionSerial = value;
      this.processOptionSerial();
    },
  },
  data() {
    return {
      instance: null,
      watchedOptionSerial: this.optionSerial,
    };
  },
  methods: {
    init() {
      // noinspection JSCheckFunctionSignatures
      this.instance = this.$echarts.init(this.$refs.container);
    },
    addChartResizeListener() {
      // noinspection JSUnresolvedFunction
      const observer = new ResizeObserver(() => {
        this.instance.resize();
      });
      // noinspection All
      observer.observe(this.$refs.container);
    },
    processOptionSerial() {
      if (this.instance == null) {
        return;
      }
      const changeFlag = this.watchedOptionSerial.length > 0;
      while (this.watchedOptionSerial.length > 0) {
        this.instance.setOption(this.watchedOptionSerial.shift());
      }
      if (changeFlag) {
        this.$emit('update:optionSerial', []);
      }
    },
  },
  mounted() {
    // 初始化 echarts 实例。
    this.init();
    // 添加尺寸变化的感知器。
    this.addChartResizeListener();
    // 处理 Option 序列。
    this.processOptionSerial();
  },
};
</script>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>
