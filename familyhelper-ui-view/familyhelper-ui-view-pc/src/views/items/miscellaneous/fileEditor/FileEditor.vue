<template>
<div class="file-editor-container" v-loading="loading">
  <div class="editor-header">
    <div class="file-indicator">
      <!--suppress JSUnresolvedVariable -->
      <i class="iconfont icon">{{ fileIndicator.originName | fileType }}</i>
      <span>{{ fileIndicator.originName }}</span>
    </div>
    <div class="button">
      <el-button v-if="editable" type="primary">提交</el-button>
      <el-button v-if="editable" type="danger">取消</el-button>
    </div>
  </div>
  <el-divider/>
  <div class="editor-body">
    <div class="sub-editor-wrapper" v-if="typeSupported">
      <photo-sub-editor
        v-if="subEditor.photoEditorExtensions.indexOf(extension) >= 0"
        :url="fileIndicator.url"
      />
      <pdf-sub-editor
        v-else-if="subEditor.pdfEditorExtensions.indexOf(extension) >= 0"
        :url="fileIndicator.url"
      />
    </div>
    <div class="type-unsupported" v-else>不支持的类型: {{query.type}}</div>
  </div>
</div>
</template>

<script>
import PhotoSubEditor from '@/views/items/miscellaneous/fileEditor/PhotoSubEditor.vue';
import PdfSubEditor from '@/views/items/miscellaneous/fileEditor/PdfSubEditor.vue';

import { inspect, download } from '@/api/assets/itemFile';

import { fileExtension, fileType } from '@/util/file';
import resolveResponse from '@/util/response';

export default {
  name: 'FileEditor',
  components: { PhotoSubEditor, PdfSubEditor },
  computed: {
    typeSupported() {
      return this.util.supportedTypes.indexOf(this.query.type) >= 0;
    },
    editable() {
      return fileType(this.fileIndicator.originName) === 0;
    },
    extension() {
      return fileExtension(this.fileIndicator.originName).toUpperCase();
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
        supportedTypes: ['itemFile'],
      },
      loading: false,
      subEditor: {
        photoEditorExtensions: ['JPG', 'PNG', 'GIF'],
        pdfEditorExtensions: ['PDF'],
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
        default:
          break;
      }
    },
    inspectItemFile(id) {
      this.loading = true;
      if (this.fileIndicator.url !== '') {
        window.URL.revokeObjectURL(this.fileIndicator.url);
      }
      resolveResponse(inspect(id))
        .then((res) => {
        // noinspection JSUnresolvedVariable
          this.fileIndicator.originName = res.origin_name;
        })
        .then(() => download(id))
        .then((blob) => {
          this.fileIndicator.blob = blob;
          this.fileIndicator.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.loading = false;
        });
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
.file-editor-container{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.file-editor-container .el-divider {
  margin: 5px 0;
}

.file-editor-container .editor-header{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.file-editor-container .editor-header .file-indicator{
  display: flex;
  flex-direction: row;
  align-items: center;
}

.file-editor-container .editor-header .icon{
  font-size: 32px;
  user-select: none;
}

.file-editor-container .editor-body{
  height: 0;
  flex-grow: 1;
}

.file-editor-container .editor-body .sub-editor-wrapper{
  height: 100%;
  width: 100%;
}

.file-editor-container .editor-body .type-unsupported{
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
