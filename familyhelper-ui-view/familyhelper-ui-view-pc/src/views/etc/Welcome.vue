<template>
  <div class="readme-container">
    <content-panel
      class="content-panel"
      :breadcrumb="['首页']"
    >
      <div class="main-container">
        <div class="placeholder">
          欢迎使用家庭助手，我们是幸福的一家人 （๑╹◡╹)ﾉ”
        </div>
      </div>
    </content-panel>
  </div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';

export default {
  name: 'Readme',
  components: { ContentPanel },
};
</script>

<style scoped>
.readme-container {
  width: 100%;
  height: 100%;
}

.main-container {
  width: 100%;
  height: 100%;
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
  color: #BFBFBF;
  user-select: none;
}
</style>
