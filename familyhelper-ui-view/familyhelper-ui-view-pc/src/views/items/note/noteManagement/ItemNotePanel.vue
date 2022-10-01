<template>
  <div class="item-note-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header">
          <el-switch
            class="switch"
            v-model="header.editorEditable"
            active-text="编辑"
            inactive-text="只读"
            :disabled="readOnly"
          />
          <div class="placeholder"/>
          <el-button
            type="primary"
            :disabled="editorReadOnly"
            @click="uploadNoteFile"
          >
            提交
          </el-button>
          <el-button
            type="danger"
            :disabled="editorReadOnly"
            @click="downloadNoteFile"
          >
            重置
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="editor-wrapper">
          <ckeditor
            :editor="editor.editorClass"
            v-model="editor.content"
            @ready="handleEditorReady"
          />
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script>
import ClassicEditor from '@/elements/modules/ckeditor/bin/ckeditor';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';

import { downloadNoteFile, uploadNoteFile } from '@/api/note/noteItem';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'ItemNotePanel',
  components: { HeaderLayoutPanel },
  props: {
    itemId: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    editorReadOnly() {
      return this.readOnly || !this.header.editorEditable;
    },
  },
  watch: {
    itemId() {
      this.updateView();
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
      header: {
        editorEditable: false,
      },
      editor: {
        editorClass: ClassicEditor,
        content: '',
        instance: null,
      },
      loading: false,
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
    updateView() {
      if (this.itemId === '') {
        return;
      }
      this.downloadNoteFile();
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
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.updateView();
  },
};
</script>

<style scoped>
.item-note-panel-container {
  width: 100%;
  height: 100%;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.header .placeholder {
  width: 0;
  flex-grow: 1;
}

.editor-wrapper {
  height: 100%;
  width: 100%;
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
