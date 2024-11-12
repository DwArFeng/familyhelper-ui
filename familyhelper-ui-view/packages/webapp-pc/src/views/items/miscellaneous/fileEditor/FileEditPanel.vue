<template>
  <div class="file-edit-panel-container">
    <div v-if="type===''" class="placeholder">请指定文件类型</div>
    <div v-else-if="id===''" class="placeholder">请指定文件 ID</div>
    <div v-else-if="mode===''" class="placeholder">请指定编辑器模式</div>
    <div v-else class="main-container" v-loading="loading">
      <div class="editor-header">
        <div class="file-indicator">
          <!--suppress JSUnresolvedVariable -->
          <i class="iconfont icon">{{ fileIndicator.originName | fileType }}</i>
          <span>{{ fileIndicator.originName }}</span>
        </div>
        <div class="operate-area">
          <el-button
            v-if="editable"
            class="confirm-button"
            type="primary"
            @click="handleCommitButtonClicked"
          >
            <span class="unsaved-emphasis" v-if="contentChanged"/>
            <span class="text">提交</span>
          </el-button>
          <el-button
            v-if="editable"
            type="danger"
            @click="handleResetButtonClicked">
            重置
          </el-button>
        </div>
      </div>
      <el-divider/>
      <div class="editor-body" tabindex="0" @keydown.ctrl.s.prevent="handleCommitHotKeyDown">
        <div class="placeholder" v-if="loading">
          正在加载文件，请稍候
        </div>
        <photo-sub-editor
          v-else-if="photoSubEditorUsing"
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
          :readonly="mode==='INSPECT'"
          :contented-changed.sync="contentChangedIndicator.rtf"
        />
        <txt-sub-editor
          v-else-if="txtSubEditorUsing"
          ref="txtSubEditor"
          :blob="fileIndicator.blob"
          :readonly="mode==='INSPECT'"
          :contented-changed.sync="contentChangedIndicator.txt"
        />
        <mmd-sub-editor
          v-else-if="mmdSubEditorUsing"
          ref="mmdSubEditor"
          :blob="fileIndicator.blob"
          :readonly="mode==='INSPECT'"
          :contented-changed.sync="contentChangedIndicator.mmd"
        />
        <div class="placeholder" v-else>
          未能找到扩展名为 {{ extension }} 的{{ mode === 'INSPECT' ? '查看器' : '编辑器' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoSubEditor
from '@/views/items/miscellaneous/fileEditor/photoSubEditor/PhotoSubEditor.vue';
import PdfSubEditor from '@/views/items/miscellaneous/fileEditor/pdfSubEditor/PdfSubEditor.vue';
import RtfSubEditor from '@/views/items/miscellaneous/fileEditor/rtfSubEditor/RtfSubEditor.vue';
import TxtSubEditor from '@/views/items/miscellaneous/fileEditor/txtSubEditor/TxtSubEditor.vue';
import MmdSubEditor from '@/views/items/miscellaneous/fileEditor/mmdSubEditor/MmdSubEditor.vue';

import {
  download as downloadAssetsItemFile,
  inspect as inspectAssetsItemFile,
  update as updateAssetsItemFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemFile';
import {
  download as downloadProjectMemoFile,
  inspect as inspectProjectMemoFile,
  update as updateProjectMemoFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/project/memoFile';
import {
  download as downloadNoteAttachmentFile,
  inspect as inspectNoteAttachmentFile,
  update as updateNoteAttachmentFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/attachmentFile';
import {
  download as downloadLifeActivityTemplateFile,
  inspect as inspectLifeActivityTemplateFile,
  update as updateLifeActivityTemplateFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityTemplateFile';
import {
  download as downloadLifeActivityFile,
  inspect as inspectLifeActivityFile,
  update as updateLifeActivityFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityFile';

import { fileExtension, fileType } from '@/util/file';
import resolveResponse from '@/util/response';

import {
  ASSETS_ITEM_FILE,
  NOTE_ATTACHMENT_FILE,
  PROJECT_MEMO_FILE,
  LIFE_ACTIVITY_TEMPLATE_FILE,
  LIFE_ACTIVITY_FILE,
} from '@/views/items/miscellaneous/fileEditor/fileTypeConstants';

export default {
  name: 'FileEditPanel',
  components: {
    PhotoSubEditor, PdfSubEditor, RtfSubEditor, TxtSubEditor, MmdSubEditor,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      validator(value) {
        return ['INSPECT', 'EDIT', ''].indexOf(value) !== -1;
      },
      required: true,
    },
  },
  computed: {
    editable() {
      return fileType(this.fileIndicator.originName) === 0 && this.mode === 'EDIT';
    },
    extension() {
      return fileExtension(this.fileIndicator.originName).toUpperCase();
    },
    photoSubEditorUsing() {
      return this.subEditor.photoEditorExtensions.indexOf(this.extension) >= 0 && this.mode === 'INSPECT';
    },
    pdfSubEditorUsing() {
      return this.subEditor.pdfEditorExtensions.indexOf(this.extension) >= 0 && this.mode === 'INSPECT';
    },
    rtfSubEditorUsing() {
      return this.subEditor.rtfEditorExtensions.indexOf(this.extension) >= 0;
    },
    txtSubEditorUsing() {
      return this.subEditor.txtEditorExtensions.indexOf(this.extension) >= 0;
    },
    mmdSubEditorUsing() {
      return this.subEditor.mmdEditorExtensions.indexOf(this.extension) >= 0;
    },
    contentChanged() {
      if (this.rtfSubEditorUsing) {
        return this.contentChangedIndicator.rtf;
      } if (this.txtSubEditorUsing) {
        return this.contentChangedIndicator.txt;
      } if (this.mmdSubEditorUsing) {
        return this.contentChangedIndicator.mmd;
      }
      return false;
    },
    paramCombination() {
      return {
        type: this.type,
        id: this.id,
        mode: this.mode,
      };
    },
  },
  watch: {
    paramCombination() {
      this.handleInspect();
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
      loading: false,
      fileIndicator: {
        originName: '',
        blob: null,
        url: '',
      },
      subEditor: {
        photoEditorExtensions: ['JPG', 'PNG', 'GIF'],
        pdfEditorExtensions: ['PDF'],
        rtfEditorExtensions: ['RTF'],
        txtEditorExtensions: ['TXT'],
        mmdEditorExtensions: ['MMD'],
      },
      hotKey: {
        commit: {
          coolDown: false,
          timeoutHandle: null,
        },
      },
      contentChangedIndicator: {
        rtf: false,
        txt: false,
        mmd: false,
      },
    };
  },
  methods: {
    handleInspect() {
      if (this.type === '' || this.id === '' || this.mode === '') {
        return;
      }

      switch (this.type) {
        case ASSETS_ITEM_FILE:
          this.inspectAssetsItemFile(this.id);
          break;
        case PROJECT_MEMO_FILE:
          this.inspectProjectMemoFile(this.id);
          break;
        case NOTE_ATTACHMENT_FILE:
          this.inspectNoteAttachmentFile(this.id);
          break;
        case LIFE_ACTIVITY_TEMPLATE_FILE:
          this.inspectLifeActivityTemplateFile(this.id);
          break;
        case LIFE_ACTIVITY_FILE:
          this.inspectLifeActivityFile(this.id);
          break;
        default:
          break;
      }
    },
    inspectAssetsItemFile(id) {
      this.loading = true;
      if (this.fileIndicator.url !== '') {
        window.URL.revokeObjectURL(this.fileIndicator.url);
      }
      resolveResponse(inspectAssetsItemFile(id))
        .then((res) => {
          // noinspection JSUnresolvedVariable
          this.fileIndicator.originName = res.origin_name;
        })
        .then(() => downloadAssetsItemFile(id))
        .then((blob) => {
          this.fileIndicator.blob = blob;
          // noinspection JSCheckFunctionSignatures
          this.fileIndicator.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    inspectProjectMemoFile(id) {
      this.loading = true;
      if (this.fileIndicator.url !== '') {
        window.URL.revokeObjectURL(this.fileIndicator.url);
      }
      resolveResponse(inspectProjectMemoFile(id))
        .then((res) => {
          // noinspection JSUnresolvedVariable
          this.fileIndicator.originName = res.origin_name;
        })
        .then(() => downloadProjectMemoFile(id))
        .then((blob) => {
          this.fileIndicator.blob = blob;
          // noinspection JSCheckFunctionSignatures
          this.fileIndicator.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    inspectNoteAttachmentFile(id) {
      this.loading = true;
      if (this.fileIndicator.url !== '') {
        window.URL.revokeObjectURL(this.fileIndicator.url);
      }
      resolveResponse(inspectNoteAttachmentFile(id))
        .then((res) => {
          // noinspection JSUnresolvedVariable
          this.fileIndicator.originName = res.origin_name;
        })
        .then(() => downloadNoteAttachmentFile(id))
        .then((blob) => {
          this.fileIndicator.blob = blob;
          // noinspection JSCheckFunctionSignatures
          this.fileIndicator.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    inspectLifeActivityTemplateFile(id) {
      this.loading = true;
      if (this.fileIndicator.url !== '') {
        window.URL.revokeObjectURL(this.fileIndicator.url);
      }
      resolveResponse(inspectLifeActivityTemplateFile(id))
        .then((res) => {
          // noinspection JSUnresolvedVariable
          this.fileIndicator.originName = res.origin_name;
        })
        .then(() => downloadLifeActivityTemplateFile(id))
        .then((blob) => {
          this.fileIndicator.blob = blob;
          // noinspection JSCheckFunctionSignatures
          this.fileIndicator.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    inspectLifeActivityFile(id) {
      this.loading = true;
      if (this.fileIndicator.url !== '') {
        window.URL.revokeObjectURL(this.fileIndicator.url);
      }
      resolveResponse(inspectLifeActivityFile(id))
        .then((res) => {
          // noinspection JSUnresolvedVariable
          this.fileIndicator.originName = res.origin_name;
        })
        .then(() => downloadLifeActivityFile(id))
        .then((blob) => {
          this.fileIndicator.blob = blob;
          // noinspection JSCheckFunctionSignatures
          this.fileIndicator.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCommitButtonClicked() {
      this.commitFile();
    },
    handleCommitHotKeyDown() {
      if (this.hotKey.commit.coolDown) {
        return;
      }
      this.hotKey.commit.coolDown = true;
      this.commitFile();
      this.hotKey.commit.timeoutHandle = setTimeout(
        () => {
          this.hotKey.commit.coolDown = false;
          this.hotKey.commit.timeoutHandle = null;
        },
        1000,
      );
    },
    handleResetButtonClicked() {
      this.handleInspect();
    },
    commitFile() {
      if (this.type === '' || this.id === '' || this.mode === '') {
        return;
      }
      if (!this.editable) {
        return;
      }

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
      switch (this.type) {
        case ASSETS_ITEM_FILE:
          resolveResponse(updateAssetsItemFile(this.id, formData))
            .then(() => {
              this.$message({
                showClose: true,
                message: '项目文件提交成功',
                type: 'success',
                center: true,
              });
            });
          break;
        case PROJECT_MEMO_FILE:
          resolveResponse(updateProjectMemoFile(this.id, formData))
            .then(() => {
              this.$message({
                showClose: true,
                message: '备忘录文件提交成功',
                type: 'success',
                center: true,
              });
            });
          break;
        case NOTE_ATTACHMENT_FILE:
          resolveResponse(updateNoteAttachmentFile(this.id, formData))
            .then(() => {
              this.$message({
                showClose: true,
                message: '附件文件提交成功',
                type: 'success',
                center: true,
              });
            });
          break;
        case LIFE_ACTIVITY_TEMPLATE_FILE:
          resolveResponse(updateLifeActivityTemplateFile(this.id, formData))
            .then(() => {
              this.$message({
                showClose: true,
                message: '活动模板文件提交成功',
                type: 'success',
                center: true,
              });
            });
          break;
        case LIFE_ACTIVITY_FILE:
          resolveResponse(updateLifeActivityFile(this.id, formData))
            .then(() => {
              this.$message({
                showClose: true,
                message: '活动模板文件提交成功',
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
    this.handleInspect();
  },
  destroyed() {
    if (this.fileIndicator.url !== '') {
      window.URL.revokeObjectURL(this.fileIndicator.url);
    }
    if (this.hotKey.commit.timeoutHandle !== null) {
      clearTimeout(this.hotKey.commit.timeoutHandle);
    }
  },
};
</script>

<style scoped>
.file-edit-panel-container {
  height: 100%;
  width: 100%;
  background: #FFFFFF;
}

.main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.main-container .el-divider {
  margin: 5px 0;
}

.main-container .editor-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.main-container .editor-header .file-indicator {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #606266;
}

.main-container .editor-header .icon {
  font-size: 32px;
  user-select: none;
}

.main-container .editor-header .operate-area{
  display: flex;
  flex-direction: row;
  align-items: center;
}

.main-container .editor-header .operate-area .confirm-button {
  height: 40px;
  width: 70px;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.main-container .editor-header .confirm-button .unsaved-emphasis {
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  margin-left: -6px;
}

.main-container .editor-body {
  height: 0;
  flex-grow: 1;
}

.main-container .editor-body:focus {
  outline: none;
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
