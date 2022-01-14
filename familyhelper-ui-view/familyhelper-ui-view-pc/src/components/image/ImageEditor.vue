<template>
  <div class="image-editor-container">
    <div
      class="main-container"
      ref="mainContainer"
      tabindex="0"
      @keydown="handleHotKeyDown($event)"
    >
      <div class="header item">
        <div class="toolbar">
          <el-button
            size="mini"
            type="primary"
            :disabled="imageUrl === ''"
            @click="handleAvatarZoomIn"
          >
            <i class="iconfont">&#xffe8;</i>
          </el-button>
          <el-button
            size="mini"
            type="primary"
            :disabled="imageUrl === ''"
            @click="handleAvatarZoomOut"
          >
            <i class="iconfont">&#xffe9;</i>
          </el-button>
          <el-button
            size="mini"
            type="primary"
            :disabled="imageUrl === ''"
            @click="handleAvatarRotateRight"
          >
            <i class="iconfont">&#xffeb;</i>
          </el-button>
          <el-button
            size="mini"
            type="primary"
            :disabled="imageUrl === ''"
            @click="handleAvatarRotateLeft"
          >
            <i class="iconfont">&#xffea;</i>
          </el-button>
          <el-button
            size="mini"
            type="primary"
            :disabled="imageUrl === ''"
            @click="handleReload"
          >
            <i class="iconfont">&#xffe6;</i>
          </el-button>
        </div>
        <vue-cropper
          class="cropper"
          ref="cropper"
          outputType="jpeg"
          mode="cover"
          :style="cropperStyle"
          :img="imageUrl"
          :outputSize="outputSize"
          :info="true"
          :canScale="true"
          :autoCrop="true"
          :autoCropWidth="`${cropBoxWidth}px`"
          :autoCropHeight="`${cropBoxHeight}px`"
          :fixed="false"
          :full="false"
          :fixedBox="true"
          :canMove="true"
          :canMoveBox="false"
          :original="false"
          :centerBox="false"
          :height="true"
          :infoTrue="true"
          :maxImgSize="3000"
          :enlarge="enlarge"
          @mousedown.native="refocus"
          @mousewheel.native="refocus"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageEditor',
  props: {
    imageUrl: {
      type: String,
      default: '',
    },
    outputSize: {
      type: Number,
      default: 1,
    },
    cropperWidth: {
      type: Number,
      default: 400,
    },
    cropperHeight: {
      type: Number,
      default: 300,
    },
    cropBoxWidth: {
      type: Number,
      default: 400,
    },
    cropBoxHeight: {
      type: Number,
      default: 300,
    },
    enlarge: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    cropperStyle() {
      return {
        minWidth: `max(${this.cropperWidth}px, ${this.cropBoxWidth}px)`,
        minHeight: `max(${this.cropperHeight}px, ${this.cropBoxHeight}px)`,
      };
    },
  },
  methods: {
    handleAvatarZoomIn() {
      this.$refs.cropper.changeScale(1);
    },
    handleAvatarZoomOut() {
      this.$refs.cropper.changeScale(-1);
    },
    handleAvatarRotateRight() {
      this.$refs.cropper.rotateRight();
    },
    handleAvatarRotateLeft() {
      this.$refs.cropper.rotateLeft();
    },
    handleReload() {
      this.$refs.cropper.reload();
    },
    handleHotKeyDown(e) {
      if (this.imageUrl === '') {
        return;
      }
      let delta = 1;
      if (e.ctrlKey) {
        delta = 5;
      }
      switch (e.keyCode) {
        case 38: // 上
          this.$refs.cropper.$data.y -= delta;
          break;
        case 40: // 下
          this.$refs.cropper.$data.y += delta;
          break;
        case 37: // 左
          this.$refs.cropper.$data.x -= delta;
          break;
        case 39: // 右
          this.$refs.cropper.$data.x += delta;
          break;
        default:
      }
    },
    refocus() {
      this.$refs.mainContainer.focus();
    },
    getCropBlob(cb) {
      this.$refs.cropper.getCropBlob(cb);
    },
    getCropData(cb) {
      this.$refs.cropper.getCropData(cb);
    },
    reload() {
      this.$refs.cropper.reload();
    },
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-container:focus {
  outline: none;
}

.main-container .item {
  width: 100%;
}

.main-container .header {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-content: center;
}

.cropper {
  width: 0;
  flex-grow: 1;
}

.toolbar {
  display: flex;
  flex-direction: column;
  padding: 3px;
  background: #D6D6D6;
}

.toolbar button {
  padding: 2px;
  height: 22px;
  width: 22px;
  box-sizing: content-box;
  margin: 0;
}

.toolbar button:not(:last-child) {
  margin-bottom: 2px;
}

.toolbar i {
  font-size: 18px;
  color: white;
}
</style>
