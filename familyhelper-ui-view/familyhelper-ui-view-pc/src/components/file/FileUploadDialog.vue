<template>
  <div class="file-upload-dialog-container">
    <el-dialog
      append-to-body
      destroy-on-close
      :title="title"
      :visible.sync="watchedVisible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleHotKeyDown"
    >
      <!--suppress HtmlUnknownAttribute -->
      <div
        class="editor-container"
        v-loading="loading"
        element-loading-text="作者偷懒没有做进度显示，长时间转圈是正常现象，请耐心等待"
      >
        <div class="item header">
          <file-selector
            :accept="accept"
            :multiple="true"
            :tester="tester"
            @onFileLoaded="handleFileLoaded"
          />
        </div>
        <el-divider class="item"/>
        <overlay-scrollbars class="scroll-bar body">
          <div class="file-detail" v-for="(file, index) in files" :key="index">
            <i class="file-item iconfont icon">{{ file.name | fileType }}</i>
            <span class="file-item name">{{ file.name }}</span>
            <span class="file-item size">{{ wrappedFormatUnit(file.blob.size) }}</span>
            <el-button
              class="file-item button"
              icon="el-icon-delete"
              type="danger"
              @click="files.splice(index, 1)"
            />
          </div>
        </overlay-scrollbars>
        <span>温馨提示：请不要上传过大（超过40MB）的文件哦，会失败的</span>
      </div>
      <div slot="footer">
        <el-button
          type="primary"
          :disabled="loading"
          @click="handleConfirmButtonClicked"
        >
          确认
        </el-button>
        <el-button
          :disabled="loading"
          @click="handleCancelButtonClicked"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FileSelector from '@/components/file/FileSelector.vue';

import { dataSizePreset, formatUnit } from '@/util/number';
import { fileType } from '@/util/file';

export default {
  name: 'FileUploadDialog',
  components: { FileSelector },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '上传文件',
    },
    accept: {
      type: String,
      default: '',
    },
  },
  watch: {
    visible(value) {
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      this.$emit('update:visible', value);
    },
  },
  filters: {
    fileType(fileName) {
      const typeIndex = fileType(fileName);
      switch (typeIndex) {
        case 0:
          return '\uffe4';
        case 1:
          return '\uffe3';
        default:
          return '\uffe5';
      }
    },
  },
  data() {
    return {
      watchedVisible: false,
      loading: false,
      tester: () => true,
      files: [],
    };
  },
  methods: {
    handleFileLoaded(files) {
      files.forEach((file) => {
        this.files.push({ blob: file.blob, name: file.name });
      });
    },
    handleConfirmButtonClicked() {
      this.handleConfirm();
    },
    handleHotKeyDown() {
      this.handleConfirm();
    },
    wrappedFormatUnit(size) {
      return formatUnit(size, dataSizePreset);
    },
    handleConfirm() {
      this.loading = true;
      const callback = (successFlag) => {
        if (successFlag) {
          this.watchedVisible = false;
          this.files.splice(0, this.files.length);
        }
        this.loading = false;
      };
      this.$emit('onConfirmed', this.files, callback);
    },
    handleCancelButtonClicked() {
      this.watchedVisible = false;
      this.files.splice(0, this.files.length);
    },
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

.editor-container .body {
  height: 300px;
}

.file-detail {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 3px 0;
  margin-right: 10px;
}

.file-detail .file-item:not(:first-child) {
  margin-left: 10px;
}

.file-detail .icon {
  font-size: 32px;
  user-select: none;
}

.file-detail .name {
  flex-grow: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.file-detail .size {
  text-align: right;
  width: 95px;
}

.file-detail .button {
  padding: 7px
}
</style>
