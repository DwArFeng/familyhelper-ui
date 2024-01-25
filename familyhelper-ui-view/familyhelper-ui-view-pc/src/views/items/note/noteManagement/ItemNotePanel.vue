<template>
  <div class="item-note-panel-container">
    <div class="placeholder" v-if="itemId===''">请选择项目</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-switch
              class="switch"
              v-model="header.editorEditable"
              active-text="编辑"
              inactive-text="只读"
              :disabled="readonly"
            />
            <el-divider direction="vertical"/>
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleSaveAsAttachmentButtonClicked"
            >
              另存为附件
            </el-button>
            <div style="flex-grow: 1"/>
            <el-button
              type="primary"
              :disabled="editorReadOnly"
              @click="handleCommitButtonClicked"
            >
              提交
            </el-button>
            <el-button
              type="danger"
              :disabled="editorReadOnly"
              @click="handleResetButtonClicked"
            >
              重置
            </el-button>
            <el-divider direction="vertical"/>
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
            <ckeditor
              :editor="editor.editorClass"
              v-model="editor.content"
              @ready="handleEditorReady"
            />
          </div>
        </template>
      </header-layout-panel>
    </div>
    <file-create-dialog
      title="另存为附件"
      mode="SPECIFIED"
      :visible.sync="attachmentCreateDialog.visible"
      :specified-extensions="['.rtf']"
      @onConfirmed="handleAttachmentCreateConfirmed"
    />
  </div>
</template>

<script>
import ClassicEditor from '@/elements/modules/ckeditor/bin/ckeditor';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import FileCreateDialog from '@/components/file/FileCreateDialog.vue';

import { downloadNoteFile, uploadNoteFile } from '@/api/note/noteItem';
import resolveResponse from '@/util/response';

import { formatTimestamp } from '@/util/timestamp';
import { upload } from '@/api/note/attachmentFile';

export default {
  name: 'ItemNotePanel',
  components: { FileCreateDialog, HeaderLayoutPanel },
  props: {
    itemId: {
      type: String,
      default: '',
    },
    readonly: {
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
  },
  watch: {
    itemId() {
      this.handleSearch();
    },
    editorReadOnly(value) {
      this.editor.instance.isReadOnly = value;
    },
  },
  filters: {
    timestampFilter(value) {
      return formatTimestamp(value);
    },
  },
  data() {
    return {
      loading: false,
      header: {
        editorEditable: false,
      },
      editor: {
        editorClass: ClassicEditor,
        content: '',
        instance: null,
      },
      hotKey: {
        commit: {
          coolDown: false,
          timeoutHandle: null,
        },
      },
      attachmentCreateDialog: {
        visible: false,
      },
    };
  },
  methods: {
    handleEditorReady(editor) {
      this.editor.instance = editor;
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
      if (this.itemId === '') {
        return;
      }
      this.downloadNoteFile();
    },
    handleResetButtonClicked() {
      this.downloadNoteFile();
    },
    handleCommitButtonClicked() {
      this.uploadNoteFile();
    },
    handleCommitHotKeyDown() {
      if (this.editorReadOnly) {
        return;
      }
      if (this.hotKey.commit.coolDown) {
        return;
      }
      this.hotKey.commit.coolDown = true;
      this.uploadNoteFile();
      this.hotKey.commit.timeoutHandle = setTimeout(
        () => {
          this.hotKey.commit.coolDown = false;
          this.hotKey.commit.timeoutHandle = null;
        },
        1000,
      );
    },
    downloadNoteFile() {
      this.loading = true;
      downloadNoteFile(this.itemId)
        .then((blob) => blob.text())
        .then((text) => {
          this.editor.content = text;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    uploadNoteFile() {
      this.loading = true;
      const blob = new Blob([this.editor.content], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', blob, this.itemId);
      resolveResponse(uploadNoteFile(this.itemId, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '笔记提交成功',
            type: 'success',
            center: true,
          });
          this.$emit('onItemNoteCommitted');
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
    handleSaveAsAttachmentButtonClicked() {
      this.attachmentCreateDialog.visible = true;
    },
    handleAttachmentCreateConfirmed(file, callback) {
      const blob = new Blob([this.editor.content], { type: 'text/plain' });
      const { name } = file;
      const formData = new FormData();
      formData.append('file', blob, name);
      resolveResponse(upload(this.itemId, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '另存为附件成功',
            type: 'success',
            center: true,
          });
          this.$emit('onSaveAsAttachmentCompleted');
          callback(true);
        })
        .catch(() => {
          callback(false);
        });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.item-note-panel-container {
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

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  padding-left: 12px;
  padding-right: 12px;
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
