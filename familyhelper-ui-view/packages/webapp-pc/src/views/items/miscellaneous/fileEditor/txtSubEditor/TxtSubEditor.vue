<template>
  <div class="txt-sub-editor-container">
    <div v-show="busyFlag" class="placeholder">
      正在渲染数据，请稍候...
    </div>
    <div v-show="!busyFlag" class="editor">
      <el-input
        type="textarea"
        resize="none"
        v-model="content"
        :readonly="readonly"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TxtSubEditor',
  props: {
    blob: {
      type: Blob,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
    contentedChanged: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    blob() {
      this.syncBlob();
    },
    content() {
      this.syncContentChanged();
    },
  },
  data() {
    return {
      content: '',
      busyFlag: false,
      backupContent: '',
    };
  },
  methods: {
    syncBlob() {
      if (this.blob === null) {
        this.content = '';
        this.backupContent = '';
      }
      this.busyFlag = true;
      this.blob.text()
        .then((text) => {
          this.content = text;
          this.backupContent = text;
        })
        .finally(() => {
          this.busyFlag = false;
        });
    },
    contentToBlob() {
      this.backupContent = this.content;
      this.$emit('update:contentedChanged', false);
      return new Blob([this.content], { type: 'text/plain' });
    },
    syncContentChanged() {
      this.$emit('update:contentedChanged', this.content !== this.backupContent);
    },
  },
  mounted() {
    this.syncBlob();
  },
};
</script>

<style scoped>
.txt-sub-editor-container {
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

.editor {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.editor >>> .el-textarea {
  width: 100%;
  height: 100%;
}

.editor >>> textarea {
  width: 100%;
  height: 100%;
}
</style>
