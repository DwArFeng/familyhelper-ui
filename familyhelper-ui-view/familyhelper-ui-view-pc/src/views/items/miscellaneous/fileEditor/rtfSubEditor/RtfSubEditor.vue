<template>
  <div class="rtf-sub-editor-container">
    <ckeditor :editor="editorClass" v-model="content" @ready="handleEditorReady"/>
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
    blob(value) {
      value.text()
        .then((text) => {
          this.content = text;
        });
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
    };
  },
  methods: {
    contentToBlob() {
      return new Blob([this.content], { type: 'text/plain' });
    },
    handleEditorReady(editor) {
      this.editor = editor;
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
};
</script>

<style scoped>
.rtf-sub-editor-container {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.rtf-sub-editor-container >>> .ck-editor{
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.rtf-sub-editor-container >>> .ck-editor__main{
  height: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.rtf-sub-editor-container >>> .ck-content{
  height: 100%;
  box-sizing: border-box;
}
</style>
