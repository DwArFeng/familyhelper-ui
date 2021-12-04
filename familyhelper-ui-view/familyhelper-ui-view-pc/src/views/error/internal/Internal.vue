<template>
  <div class="internal-container">
    <error-panel>
      <div class="error-content-container">
        <span class="error-header-title-chs">内部错误</span>
        <el-input
          class="error-message-container"
          type="textarea"
          v-model="textarea"
          resize="none"
          readonly
        >
        </el-input>
      </div>
    </error-panel>
  </div>
</template>

<script>
import ErrorPanel from '@/views/error/ErrorPanel.vue';

export default {
  name: 'PageInternal',
  components: { ErrorPanel },
  data() {
    return {
      textarea: '',
    };
  },
  methods: {
    initErrorMessage() {
      this.textarea = this.$route.params.message;
    },
  },
  mounted() {
    this.initErrorMessage();
  },
};
</script>

<style scoped>
.internal-container {
  height: 100%;
  width: 100%;
}

.error-content-container{
  width: 100%;
  height:100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-header-title-chs {
  font-size: 64px;
  font-family: 微软雅黑, serif;
  color: #7BBDFF;
  text-shadow: 0 0 8px black;
  margin-bottom: 10px;
}

.error-message-container{
  width:100%;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.error-message-container >>> .el-textarea__inner{
  height: 100%;
  background:rgba(255,255,255,0.8);
  font-size: 14px;
  font-family: 微软雅黑, serif;
}
</style>
