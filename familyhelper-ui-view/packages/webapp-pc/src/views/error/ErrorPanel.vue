<template>
  <div class="error-panel-container" v-cloak :style="backgroundImageStyle">
    <div class="error-panel">
      <div class="home-button-container">
        <el-tooltip effect="dark" content="点此返回主页" placement="right">
          <el-button
            class="home-button"
            type="primary"
            icon="el-icon-s-home"
            @click="handleBackToHome"
          />
        </el-tooltip>
      </div>
      <div class="slot-container">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script>
import backgroundImg from '@/assets/img/error-background.jpg';

export default {
  name: 'ErrorPanel',
  data() {
    return {
      backgroundImageStyle: {
        backgroundImage: `url(${backgroundImg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto 100%',
        backgroundPosition: 'center',
      },
    };
  },
  methods: {
    initBackgroundJustify() {
      if (document.documentElement.clientWidth < document.documentElement.clientHeight) {
        this.backgroundImageStyle.backgroundSize = 'auto 100%';
      } else {
        this.backgroundImageStyle.backgroundSize = '100% auto';
      }
      window.onresize = () => {
        if (document.documentElement.clientWidth < document.documentElement.clientHeight) {
          this.backgroundImageStyle.backgroundSize = 'auto 100%';
        } else {
          this.backgroundImageStyle.backgroundSize = '100% auto';
        }
      };
    },
    handleBackToHome() {
      this.$router.push({ path: '/vim' });
    },
  },
  mounted() {
    this.initBackgroundJustify();
  },
};
</script>

<style scoped>
.error-panel-container {
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}

.error-panel {
  position: relative;
  background-color: rgba(225, 225, 225, 0.5);
  height: min(768px, 85%);
  width: min(1024px, 85%);
  border-radius: 5px;
  box-shadow: 2px 2px 5px #808080;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 40px;
  box-sizing: border-box;
}

.slot-container {
  position: relative;
  z-index: 1;
  flex-grow: 1;
  width:100%;
  height:100%;
}

.home-button-container {
  position: absolute;
  z-index: 2;
  left:40px;
  top:25px;
}

.home-button {
  padding: 8px;
}
</style>
