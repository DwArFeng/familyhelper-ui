<template>
  <div class="digital-watch-container">
    {{ currentTime }}
  </div>
</template>

<script>
import { pad } from '@/util/number';

export default {
  name: 'DigitalWatch',
  data() {
    return {
      currentTime: '00:00:00',
      timer: null,
    };
  },
  methods: {
    updateTimer() {
      const myDate = new Date(); // 实例一个时间对象；
      this.currentTime = `${pad(myDate.getHours(), 2)}:${pad(myDate.getMinutes(), 2)}:${pad(myDate.getSeconds(), 2)}`;
    },
    initTimer() {
      this.timer = setInterval(() => {
        this.updateTimer();
      }, 250);
    },
    disposeTimer() {
      clearInterval(this.timer);
      this.timer = null;
    },
  },
  mounted() {
    this.updateTimer();
    this.initTimer();
  },
  destroyed() {
    this.disposeTimer();
  },
};
</script>

<style scoped>
.digital-watch-container {
  font-size: 14px;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial,
  sans-serif;
}
</style>
