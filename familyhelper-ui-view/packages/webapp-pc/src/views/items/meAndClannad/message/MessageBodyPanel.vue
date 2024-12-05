<template>
  <div class="message-body-panel-container">
    <div class="placeholder" v-if="messageId===''">请选择留言</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              class="item"
              v-if="!sendDisabled"
              type="primary"
              :disabled="readonly"
              @click="handleSendButtonClicked"
            >
              消息发送
            </el-button>
            <el-divider v-if="!sendDisabled" direction="vertical"/>
            <el-switch
              class="switch"
              v-model="header.editorEditable"
              active-text="编辑"
              inactive-text="只读"
              :disabled="readonly"
            />
            <div style="flex-grow: 1"/>
            <el-button
              class="confirm-button"
              type="primary"
              :disabled="editorReadOnly"
              @click="handleCommitButtonClicked"
            >
              <span class="unsaved-emphasis" v-if="contentChanged"/>
              <span class="text">提交</span>
            </el-button>
            <el-button
              type="danger"
              :disabled="editorReadOnly"
              @click="handleResetButtonClicked"
            >
              重置
            </el-button>
            <el-divider v-if="mode==='DEFAULT'" direction="vertical"/>
            <el-button
              class="item icon-button"
              v-if="mode==='DEFAULT'"
              type="info"
              @click="handlePanelFloatyButtonClicked"
            >
              <i class="iconfont">&#xffd3;</i>
            </el-button>
          </div>
        </template>
        <template v-slot:default>
          <div
            class="editor-wrapper"
            tabindex="0"
            @keydown.ctrl.s.prevent="handleCommitHotKeyDown"
          >
            <!--suppress HtmlUnknownTag -->
            <ckeditor
              :editor="editor.editorClass"
              v-model="editor.content"
              @ready="handleEditorReady"
            />
          </div>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script>
import Editor from '@dwarfeng/familyhelper-ui-component-ckeditor/dist/ckeditor';

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import { download, update } from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/messageBody';
import resolveResponse from '@/util/response';

export default {
  name: 'MessageBodyPanel',
  components: { HeaderLayoutPanel },
  props: {
    messageId: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    sendDisabled: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'DEFAULT',
      validator(value) {
        return ['DEFAULT', 'FLOATY'].indexOf(value) !== -1;
      },
    },
  },
  computed: {
    editorReadOnly() {
      return this.readonly || !this.header.editorEditable;
    },
    contentChanged() {
      return this.editor.content !== this.editor.backupContent;
    },
  },
  watch: {
    messageId() {
      this.handleSearch();
    },
    editorReadOnly(value) {
      this.editor.instance.isReadOnly = value;
    },
  },
  data() {
    return {
      loading: 0,
      header: {
        editorEditable: false,
      },
      editor: {
        editorClass: Editor,
        content: '',
        instance: null,
        backupContent: '',
      },
      hotKey: {
        commit: {
          coolDown: false,
          timeoutHandle: null,
        },
      },
    };
  },
  methods: {
    handleEditorReady(editor) {
      this.editor.instance = editor;
      // noinspection JSUnresolvedReference
      const toolbarElement = this.editor.instance.ui.view.toolbar.element;
      this.editor.instance.on('change:isReadOnly', (evt, propertyName, isReadOnly) => {
        if (isReadOnly) {
          toolbarElement.style.display = 'none';
        } else {
          toolbarElement.style.display = 'flex';
        }
      });
      this.editor.instance.isReadOnly = this.editorReadOnly;
    },
    handleSearch() {
      if (this.messageId === '') {
        return;
      }
      this.downloadMessageBody();
    },
    handleResetButtonClicked() {
      this.editor.content = this.editor.backupContent;
    },
    handleCommitButtonClicked() {
      this.updateMessageBody();
    },
    handleCommitHotKeyDown() {
      if (this.editorReadOnly) {
        return;
      }
      if (this.hotKey.commit.coolDown) {
        return;
      }
      this.hotKey.commit.coolDown = true;
      this.updateMessageBody();
      this.hotKey.commit.timeoutHandle = setTimeout(
        () => {
          this.hotKey.commit.coolDown = false;
          this.hotKey.commit.timeoutHandle = null;
        },
        1000,
      );
    },
    downloadMessageBody() {
      this.loading += 1;
      download(this.messageId)
        .then((blob) => blob.text())
        .then((text) => {
          this.editor.content = text;
          this.editor.backupContent = text;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateMessageBody() {
      this.loading += 1;
      const blob = new Blob([this.editor.content], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', blob, this.messageId);
      resolveResponse(update(this.messageId, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '笔记提交成功',
            type: 'success',
            center: true,
          });
          this.editor.backupContent = this.editor.content;
          this.$emit('onItemNoteCommitted', this.mode);
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
    handleSendButtonClicked() {
      this.$emit('onMessageSend');
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.message-body-panel-container {
  width: 100%;
  height: 100%;
  background: #FFFFFF;
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

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.main-container {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  padding: 11px;
}

.header-container .confirm-button {
  height: 40px;
  width: 70px;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.header-container .confirm-button .unsaved-emphasis {
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  margin-left: -6px;
}

.editor-wrapper {
  height: 100%;
  width: 100%;
}

.editor-wrapper:focus {
  outline: none;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper >>> .ck-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper >>> .ck-editor__main {
  height: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.editor-wrapper >>> .ck-content {
  height: 100%;
  box-sizing: border-box;
}
</style>
