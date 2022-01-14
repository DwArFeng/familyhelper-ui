<template>
  <div class="image-upload-edit-dialog-container">
    <el-dialog
      append-to-body
      destroy-on-close
      :title="title"
      :width="`${cropperWidth+85}px`"
      :visible.sync="watchedVisible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleHotKeyDown"
    >
      <div>
        <div class="editor-container">
          <div class="item header">
            <file-selector
              accept="image/jpeg, image/png"
              :multiple="false"
              :tester="tester"
              @onFileLoaded="handleFileLoaded"
            />
          </div>
          <el-divider class="item"/>
        </div>
        <image-editor
          ref="imageEditor"
          :output-size="outputSize"
          :cropper-height="cropperHeight"
          :cropper-width="cropperWidth"
          :crop-box-height="cropBoxHeight"
          :crop-box-width="cropBoxWidth"
          :image-url="imageUrl"
          :enlarge="enlarge"
        />
      </div>
      <div slot="footer">
        <el-button type="primary" @click="handleConfirmButtonClicked">确认</el-button>
        <el-button @click="watchedVisible=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FileSelector from '@/components/file/FileSelector.vue';
import ImageEditor from '@/components/image/ImageEditor.vue';

export default {
  name: 'ImageUploadEditDialog',
  components: { ImageEditor, FileSelector },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '上传图片',
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
  watch: {
    visible(value) {
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      if (value) {
        this.$nextTick(() => {
          this.$refs.imageEditor.reload();
        });
      }
      this.$emit('update:visible', value);
    },
  },
  data() {
    return {
      watchedVisible: false,
      tester: (files) => {
        if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(files[0].name)) {
          this.$message({
            message: '图片类型要求：jpeg、jpg、png',
            type: 'error',
          });
          return false;
        }
        return true;
      },
      imageUrl: '',
      fileName: '',
    };
  },
  methods: {
    handleFileLoaded(files) {
      if (this.imageUrl !== '') {
        window.URL.revokeObjectURL(this.imageUrl);
      }
      const file = files[0];
      this.imageUrl = window.URL.createObjectURL(file.blob);
      this.fileName = file.name;
    },
    handleConfirmButtonClicked() {
      this.handleConfirm();
    },
    handleHotKeyDown() {
      this.handleConfirm();
    },
    handleConfirm() {
      const blobPromise = new Promise((resolve) => {
        this.$refs.imageEditor.getCropBlob(((blob) => {
          resolve(blob);
        }));
      });
      const dataPromise = new Promise((resolve) => {
        this.$refs.imageEditor.getCropData(((data) => {
          resolve(data);
        }));
      });
      Promise.all([blobPromise, dataPromise])
        .then((res) => {
          this.$emit('onConfirmed', this.fileName, res[0], res[1]);
          this.watchedVisible = false;
        });
    },
  },
  destroyed() {
    if (this.imageUrl !== '') {
      window.URL.revokeObjectURL(this.imageUrl);
    }
  },
};
</script>

<style scoped>
.editor-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.editor-container .item {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.editor-container .el-divider {
  margin: 5px 0;
}

.editor-container .header {
  display: block;
}
</style>
