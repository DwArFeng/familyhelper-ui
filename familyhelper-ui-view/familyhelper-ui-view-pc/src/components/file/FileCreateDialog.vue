<template>
  <el-dialog
    class="file-create-dialog-container"
    append-to-body
    destroy-on-close
    :title="title"
    :visible.sync="watchedVisible"
    :close-on-click-modal="false"
    @keydown.ctrl.enter.native="handleHotKeyDown"
  >
    <div>
      <div
        class="placeholder"
        v-if="validIndicators.length === 0 && mode==='PERMITTED'"
      >
        您没有创建任何类型文件的权限！
      </div>
      <div
        class="placeholder"
        v-else-if="validIndicators.length === 0 && mode==='SPECIFIED'"
      >
        您在此处不能创建任何类型的文件！
      </div>
      <!--suppress HtmlUnknownAttribute -->
      <div
        class="editor-container"
        v-else
        v-loading="loading"
        element-loading-text="作者偷懒没有做进度显示，长时间转圈是正常现象，请耐心等待"
      >
        <div class="type-selector">
          <div
            class="item-wrapper"
            :class="index === selectedIndex ? 'selected' : 'unselected'"
            v-for="(indicator, index) in validIndicators"
            :key="index"
            @click="selectedIndex = index"
          >
            <el-tooltip
              placement="top"
              :open-delay="1000"
              :content="indicator.description"
            >
              <div class="item">
                <i class="iconfont">{{ indicator.icon }}</i>
                <span>{{ indicator.label }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
        <!--suppress RegExpDuplicateCharacterInClass, RegExpRedundantEscape -->
        <el-input
          class="input"
          placeholder="请输入文件名称（不用输入后缀名），注意不要输入非法字符"
          v-model="fileName"
          oninput="this.value = this.value.replace(/[&\|\\\*^%$'&quot;#@:;，。？！\,@\$]/g,'')"
        >
          <template slot="append">{{ currentIndicator.extension }}</template>
        </el-input>
      </div>
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
</template>

<script>
import { mapGetters } from 'vuex';

import { fileType } from '@/util/file';

// noinspection JSAnnotator
export default {
  name: 'FileCreateDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '上传文件',
    },
    mode: {
      type: String,
      default: 'PERMITTED',
      validator(value) {
        return ['PERMITTED', 'SPECIFIED'].indexOf(value) !== -1;
      },
    },
    specifiedExtensions: {
      type: Array,
      default: () => [],
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
    validIndicators() {
      switch (this.mode) {
        case 'SPECIFIED':
          return this.specificIndicators;
        case 'PERMITTED':
        default:
          return this.permittedIndicators;
      }
    },
    permittedIndicators() {
      return this.indicators.filter((indicator) => {
        const { required, node } = indicator.permission;
        if (!required) {
          return true;
        }
        return this.hasPermission(node);
      });
    },
    specificIndicators() {
      return this.indicators.filter((indicator) => {
        const { extension } = indicator;
        return this.specifiedExtensions.includes(extension);
      });
    },
    ...mapGetters('lnp', ['hasPermission']),
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
          permission: {
            required: true,
            node: 'action.file_create.rtf',
          },
        },
        {
          icon: '\uffe1',
          label: '纯文本',
          description: '纯文本文件，节约空间',
          extension: '.txt',
          permission: {
            required: true,
            node: 'action.file_create.txt',
          },
        },
        {
          icon: '\uffe0',
          label: '思维导图',
          description: '通过图标助力思维散发',
          extension: '.mmd',
          permission: {
            required: true,
            node: 'action.file_create.mmd',
          },
        },
      ],
      selectedIndex: 0,
      fileName: '',
    };
  },
  methods: {
    handleConfirmButtonClicked() {
      this.handleConfirm();
    },
    handleHotKeyDown() {
      this.handleConfirm();
    },
    handleConfirm() {
      this.loading = true;
      const callback = (successFlag) => {
        if (successFlag) {
          this.watchedVisible = false;
          this.selectedIndex = 0;
          this.fileName = '';
        }
        this.loading = false;
      };
      const name = `${this.fileName}${this.currentIndicator.extension}`;
      const blob = new Blob([]);
      this.$emit('onConfirmed', { name, blob }, callback);
    },
    handleCancelButtonClicked() {
      this.watchedVisible = false;
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

.type-selector .item-wrapper {
  height: 100px;
  width: 85px;
  background: rgba(0, 0, 0, .025);
  cursor: pointer;
}

.type-selector .item-wrapper:hover {
  background: rgba(0, 0, 0, .05);
}

/*noinspection CssUnusedSymbol*/
.item-wrapper.unselected {
  padding: 2px;
}

/*noinspection CssUnusedSymbol*/
.item-wrapper.selected {
  padding: 0;
  border-style: solid;
  border-width: 2px;
  border-color: #409EFF;
}

.type-selector .item-wrapper:not(:nth-child(1)) {
  margin-left: 10px;
}

.type-selector .item-wrapper .item{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.type-selector .item-wrapper .item i {
  font-size: 48px;
  user-select: none;
}

.type-selector .item-wrapper .item span {
  user-select: none;
  margin-bottom: 10px;
}

.editor-container .input {
  width: 85%;
}

.placeholder {
  width: 100%;
  line-height: 184px;
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
