<template>
  <div class="file-editor-container" v-loading="loading">
    <div class="editor-header">
      <div class="file-indicator">
        <!--suppress JSUnresolvedVariable -->
        <i class="iconfont icon">{{ fileIndicator.originName | fileType }}</i>
        <span>{{ fileIndicator.originName }}</span>
      </div>
      <div class="button">
        <el-button v-if="editable" type="primary" @click="handleCommitButtonClicked">提交</el-button>
        <el-button v-if="editable" type="danger" @click="handleResetButtonClicked">重置</el-button>
      </div>
    </div>
    <el-divider/>
    <div class="editor-body">
      <photo-sub-editor
        v-if="photoSubEditorUsing"
        :url="fileIndicator.url"
      />
      <pdf-sub-editor
        v-else-if="pdfSubEditorUsing"
        :url="fileIndicator.url"
      />
      <rtf-sub-editor
        v-else-if="rtfSubEditorUsing"
        ref="rtfSubEditor"
        :blob="fileIndicator.blob"
        :readonly="query.action==='inspect'"
      />
      <txt-sub-editor
        v-else-if="txtSubEditorUsing"
        ref="txtSubEditor"
        :blob="fileIndicator.blob"
        :readonly="query.action==='inspect'"
      />
      <div class="placeholder" v-else>
        未能找到扩展名为 {{ extension }} 的{{ query.action === 'inspect' ? '查看器' : '编辑器' }}
      </div>
    </div>
  </div>
</template>

<script>
import PhotoSubEditor from '@/views/items/miscellaneous/fileEditor/PhotoSubEditor.vue';
import PdfSubEditor from '@/views/items/miscellaneous/fileEditor/PdfSubEditor.vue';
import RtfSubEditor from '@/views/items/miscellaneous/fileEditor/RtfSubEditor.vue';
import TxtSubEditor from '@/views/items/miscellaneous/fileEditor/TxtSubEditor.vue';

import {
  inspect as inspectItemFile,
  download as downloadItemFile,
  update as updateItemFile,
} from '@/api/assets/itemFile';
import {
  inspect as inspectMemoFile,
  download as downloadMemoFile,
  update as updateMemoFile,
} from '@/api/project/memoFile';

import { fileExtension, fileType } from '@/util/file';
import resolveResponse from '@/util/response';

export default {
  name: 'FileEditor',
  components: {
    PhotoSubEditor, PdfSubEditor, RtfSubEditor, TxtSubEditor,
  },
  computed: {
    editable() {
      return fileType(this.fileIndicator.originName) === 0 && this.query.action === 'edit';
    },
    extension() {
      return fileExtension(this.fileIndicator.originName).toUpperCase();
    },
    photoSubEditorUsing() {
      return this.subEditor.photoEditorExtensions.indexOf(this.extension) >= 0 && this.query.action === 'inspect';
    },
    pdfSubEditorUsing() {
      return this.subEditor.pdfEditorExtensions.indexOf(this.extension) >= 0 && this.query.action === 'inspect';
    },
    rtfSubEditorUsing() {
      return this.subEditor.rtfEditorExtensions.indexOf(this.extension) >= 0;
    },
    txtSubEditorUsing() {
      return this.subEditor.txtEditorExtensions.indexOf(this.extension) >= 0;
    },
  },
  watch: {
    $route(val) {
      if (val.name !== 'miscellaneous.fileEditor') {
        return;
      }
      const { type, action, id } = this.$route.query;
      let inspectFlag = false;
      if (this.query.type !== type) {
        this.query.type = type;
        inspectFlag = true;
      }
      if (this.query.action !== action) {
        this.query.action = action;
        inspectFlag = true;
      }
      if (this.query.id !== id) {
        this.query.id = id;
        inspectFlag = true;
      }
      if (inspectFlag) {
        this.handleInspect();
      }
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
      fileIndicator: {
        originName: '',
        blob: null,
        url: '',
      },
      query: {
        type: '',
        action: '',
        id: '',
      },
      util: {
        supportedTypes: ['itemFile', 'memoFile'],
      },
      loading: false,
      subEditor: {
        photoEditorExtensions: ['JPG', 'PNG', 'GIF'],
        pdfEditorExtensions: ['PDF'],
        rtfEditorExtensions: ['RTF'],
        txtEditorExtensions: ['TXT'],
      },
    };
  },
  methods: {
    handleInspect() {
      const { type, id } = this.query;
      switch (type) {
        case 'itemFile':
          this.inspectItemFile(id);
          break;
        case 'memoFile':
          this.inspectMemoFile(id);
          break;
        default:
          break;
      }
    },
    inspectItemFile(id) {
      this.loading = true;
      if (this.fileIndicator.url !== '') {
        window.URL.revokeObjectURL(this.fileIndicator.url);
      }
      resolveResponse(inspectItemFile(id))
        .then((res) => {
          // noinspection JSUnresolvedVariable
          this.fileIndicator.originName = res.origin_name;
        })
        .then(() => downloadItemFile(id))
        .then((blob) => {
          this.fileIndicator.blob = blob;
          this.fileIndicator.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    inspectMemoFile(id) {
      this.loading = true;
      if (this.fileIndicator.url !== '') {
        window.URL.revokeObjectURL(this.fileIndicator.url);
      }
      resolveResponse(inspectMemoFile(id))
        .then((res) => {
          // noinspection JSUnresolvedVariable
          this.fileIndicator.originName = res.origin_name;
        })
        .then(() => downloadMemoFile(id))
        .then((blob) => {
          this.fileIndicator.blob = blob;
          this.fileIndicator.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCommitButtonClicked() {
      this.commitFile();
    },
    handleResetButtonClicked() {
      this.handleInspect();
    },
    commitFile() {
      let blob = null;
      if (this.rtfSubEditorUsing) {
        blob = this.$refs.rtfSubEditor.contentToBlob();
      } else if (this.txtSubEditorUsing) {
        blob = this.$refs.txtSubEditor.contentToBlob();
      }
      if (blob === null) {
        return;
      }
      const formData = new FormData();
      formData.append('file', blob, this.fileIndicator.originName);
      switch (this.query.type) {
        case 'itemFile':
          resolveResponse(updateItemFile(this.query.id, formData))
            .then(() => {
              this.$message({
                showClose: true,
                message: '项目文件提交成功',
                type: 'success',
                center: true,
              });
            });
          break;
        case 'memoFile':
          resolveResponse(updateMemoFile(this.query.id, formData))
            .then(() => {
              this.$message({
                showClose: true,
                message: '备忘录文件提交成功',
                type: 'success',
                center: true,
              });
            });
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    const { type, action, id } = this.$route.query;
    this.query.type = type;
    this.query.action = action;
    this.query.id = id;
    this.handleInspect();
  },
  destroyed() {
    if (this.fileIndicator.url !== '') {
      window.URL.revokeObjectURL(this.fileIndicator.url);
    }
  },
};
</script>

<style scoped>
.file-editor-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.file-editor-container .el-divider {
  margin: 5px 0;
}

.file-editor-container .editor-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.file-editor-container .editor-header .file-indicator {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.file-editor-container .editor-header .icon {
  font-size: 32px;
  user-select: none;
}

.file-editor-container .editor-body {
  height: 0;
  flex-grow: 1;
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
</style>
