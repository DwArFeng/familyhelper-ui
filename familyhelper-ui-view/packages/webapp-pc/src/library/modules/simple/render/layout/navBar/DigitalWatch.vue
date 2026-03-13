<template>
  <div class="digital-watch-container">
    {{ currentTime }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

import { pad } from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

defineOptions({
  name: 'DigitalWatch',
})

// -----------------------------------------------------------主业务处理-----------------------------------------------------------
const currentTime = ref<string>('00:00:00')

// 更新时间。
function updateTimer(): void {
  const myDate = new Date() // 实例一个时间对象；
  currentTime.value = `${pad(myDate.getHours(), 2)}:${pad(myDate.getMinutes(), 2)}:${pad(myDate.getSeconds(), 2)}`
}

// 定时逻辑。
let timer: number

onMounted(() => {
  updateTimer()
  timer = setInterval(() => {
    updateTimer()
  }, 250)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.digital-watch-container {
  font-size: 14px;
  font-family:
    Helvetica Neue,
    Helvetica,
    PingFang SC,
    Hiragino Sans GB,
    Microsoft YaHei,
    Arial,
    sans-serif;
}
</style>
