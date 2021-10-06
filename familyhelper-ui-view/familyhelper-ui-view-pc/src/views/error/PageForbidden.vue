<template>
  <div class="page-forbidden-container">
    <error-panel>
      <div class="error-content-container">
        <span class="error-header-title-chs">权限禁止</span>
        <span class="error-header-title-en">请不要私自从导航栏中输入没有权限的页面哦~</span>
      </div>
    </error-panel>
  </div>
</template>

<script>
import ErrorPanel from '@/components/layout/ErrorPanel.vue';

export default {
  name: 'PageForbidden',
  components: { ErrorPanel },
};
</script>

<style scoped>
.page-forbidden-container {
  height: 100%;
  width: 100%;
}

.error-content-container{
  width: 100%;
  height:100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-header-title-chs {
  font-size: 64px;
  font-family: 微软雅黑, serif;
  color: #7BBDFF;
  text-shadow: 0 0 8px black;
  margin-bottom: 40px;
}

.error-header-title-en {
  font-size: 24px;
  font-family: 微软雅黑, serif;
  color: #7BBDFF;
  text-shadow: 0 0 4px black;
  margin-bottom: 40px;
}
</style>
