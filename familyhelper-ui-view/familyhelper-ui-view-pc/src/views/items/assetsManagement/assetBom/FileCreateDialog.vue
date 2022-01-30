<template>
  <div class="file-create-dialog-container">
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
        <div class="type-selector">
          <el-tooltip
            v-for="(indicator, index) in indicators"
            placement="top"
            :open-delay="1000"
            :content="indicator.description"
            :key="index"
          >
            <div
              class="item"
              :class="index === selectedIndex ? 'selected' : 'unselected'"
              @click="selectedIndex=index"
            >
              <i class="iconfont">{{ indicator.icon }}</i>
              <span>{{ indicator.label }}</span>
            </div>
          </el-tooltip>
        </div>
        <!--suppress RegExpDuplicateCharacterInClass, RegExpRedundantEscape -->
        <el-input
          class="input"
          placeholder="请输入文件名称（不用输入后缀名），注意不要输入非法字符"
          v-model="fileName"
          oninput="this.value = this.value.replace(/[&\|\\\*^%$'&quot;#@\-:;，。？！\,@\$]/g,'')"
        >
          <template slot="append">{{currentIndicator.extension}}</template>
        </el-input>
      </div>
      <div slot="footer">
        <el-button
          type="primary"
          :disabled="loading || fileName === ''"
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
import { fileType } from '@/util/file';
import { dataSizePreset, formatUnit } from '@/util/number';
import { upload } from '@/api/assets/itemFile';

export default {
  name: 'FileCreateDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    itemId: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '上传文件',
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
  computed: {
    currentIndicator() {
      return this.indicators[this.selectedIndex];
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
      indicators: [
        {
          icon: '\uffe2',
          label: '富文本',
          description: '包含文本，图片等多媒体的富文本文件',
          extension: '.rtf',
        },
        {
          icon: '\uffe1',
          label: '纯文本',
          description: '纯文本文件，节约空间',
          extension: '.txt',
        },
      ],
      selectedIndex: 0,
      fileName: '',
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
      const blob = new Blob([]);
      const formData = new FormData();
      formData.append('file', blob, `${this.fileName}${this.currentIndicator.extension}`);
      upload(this.itemId, formData)
        .then(() => {
          this.$message({
            showClose: true,
            message: '文件新建成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.$emit('onItemFileChanged');
          this.watchedVisible = false;
          this.selectedIndex = 0;
          this.fileName = '';
        })
        .finally(() => {
          this.loading = false;
        });
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
  align-items: center;
}

.type-selector {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 25px;
  margin-bottom: 15px;
}

.type-selector .item {
  height: 100px;
  width: 85px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  background: rgba(0, 0, 0, .025);
  cursor: pointer;
}

.type-selector .item:hover {
  background: rgba(0, 0, 0, .05);
}

/*noinspection CssUnusedSymbol*/
.item.unselected {
  padding: 2px;
}

/*noinspection CssUnusedSymbol*/
.item.selected {
  padding: 0;
  border-style: solid;
  border-width: 2px;
  border-color: #409EFF;
}

.type-selector .item:not(:nth-child(1)) {
  margin-left: 10px;
}

.type-selector .item i {
  font-size: 48px;
  user-select: none;
}

.type-selector .item span {
  user-select: none;
  margin-bottom: 10px;
}

.editor-container .input{
  width: 85%;
}
</style>
