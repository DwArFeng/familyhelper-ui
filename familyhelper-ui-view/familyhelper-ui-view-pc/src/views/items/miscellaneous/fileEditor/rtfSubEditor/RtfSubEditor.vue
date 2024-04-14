<template>
  <div class="rtf-sub-editor-container">
    <div v-show="busyFlag" class="placeholder">
      正在渲染数据，请稍候...
    </div>
    <div v-show="!busyFlag" class="editor">
      <ckeditor
        :editor="editorClass"
        v-model="content"
        @ready="handleEditorReady"
      />
    </div>
  </div>
</template>

<script>
import ClassicEditor from '@/elements/modules/ckeditor/bin/ckeditor';

export default {
  name: 'RtfSubEditor',
  props: {
    blob: {
      type: Blob,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    blob() {
      this.syncBlob();
    },
    readonly(value) {
      if (this.editor === null) {
        return;
      }
      this.editor.isReadOnly = value;
    },
  },
  data() {
    return {
      editorClass: ClassicEditor,
      editor: null,
      content: '',
      busyFlag: false,
    };
  },
  methods: {
    syncBlob() {
      if (this.blob === null) {
        this.content = '';
      }
      this.busyFlag = true;
      this.blob.text()
        .then((text) => {
          this.content = text;
        })
        .finally(() => {
          this.busyFlag = false;
        });
    },
    contentToBlob() {
      return new Blob([this.content], { type: 'text/plain' });
    },
    handleEditorReady(editor) {
      this.editor = editor;
      // noinspection JSUnresolvedReference
      const toolbarElement = this.editor.ui.view.toolbar.element;
      this.editor.on('change:isReadOnly', (evt, propertyName, isReadOnly) => {
        if (isReadOnly) {
          toolbarElement.style.display = 'none';
        } else {
          toolbarElement.style.display = 'flex';
        }
      });
      this.editor.isReadOnly = this.readonly;
    },
  },
  mounted() {
    this.syncBlob();
  },
};
</script>

<style scoped>
.rtf-sub-editor-container {
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
.editor >>> .ck-editor{
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.editor >>> .ck-editor__main{
  height: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.editor >>> .ck-content{
  height: 100%;
  box-sizing: border-box;
}
</style>
