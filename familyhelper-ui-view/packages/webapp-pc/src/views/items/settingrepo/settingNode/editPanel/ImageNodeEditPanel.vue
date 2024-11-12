<template>
  <div class="image-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <file-selector
            class="file-selector"
            accept="image/jpeg, image/png"
            :multiple="false"
            :tester="tester"
            @onFileLoaded="handleUpload"
          >
            <template v-slot:default="{select}">
              <el-button type="primary" :disabled="readonly" @click="select">
                上传
              </el-button>
            </template>
          </file-selector>
          <el-button
            type="primary"
            @click="handleDownload"
          >
            下载
          </el-button>
          <el-divider direction="vertical"/>
          <el-button
            type="success"
            @click="handleInspect"
          >
            刷新
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="main-container">
          <title-layout-panel class="item property-container" title="图片属性">
            <el-form
              class="property-form"
              label-position="left"
              label-width="80px"
              inline
            >
              <el-form-item label="文件名称" style="width: 100%">
                {{ thumbnail.origin_name }}
              </el-form-item>
              <el-form-item label="文件大小" style="width: 100%">
                {{ thumbnail.length|lengthFilter }}
              </el-form-item>
            </el-form>
          </title-layout-panel>
          <el-divider direction="vertical"/>
          <title-layout-panel class="item expand image-container" title="图片预览">
            <el-image class="image" fit="contain" :src="thumbnail.url"/>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script>
import axios from 'axios';

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import FileSelector from '@/components/file/FileSelector.vue';

import {
  operateInspect,
  downloadThumbnail,
  requestFileStreamVoucher,
  uploadStream,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageNode';
import resolveResponse from '@/util/response';
import { dataSizePreset, formatUnit } from '@/util/number';

export default {
  name: 'ImageNodeEditPanel',
  components: {
    FileSelector, TitleLayoutPanel, HeaderLayoutPanel,
  },
  props: {
    category: {
      type: String,
      required: true,
    },
    args: {
      type: Array,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    settingNodeInvalid() {
      return !this.category || !this.args;
    },
  },
  watch: {
    category() {
      this.handleInspect();
    },
    args() {
      this.handleInspect();
    },
  },
  filters: {
    lengthFilter(value) {
      return formatUnit(value, dataSizePreset);
    },
  },
  data() {
    return {
      loading: 0,
      thumbnail: {
        origin_name: '',
        length: 0,
        url: '',
      },
      tester: (files) => {
        if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(files[0].name)) {
          this.$message({
            message: '图片类型要求：jpeg、jpg、png',
            type: 'error',
          });
          return false;
        }
        return true;
      },
    };
  },
  methods: {
    handleInspect() {
      if (this.settingNodeInvalid) {
        return;
      }
      this.loading += 1;
      if (this.thumbnail.url !== '') {
        window.URL.revokeObjectURL(this.thumbnail.url);
      }
      resolveResponse(operateInspect(this.category, this.args))
        .then((res) => {
          this.thumbnail.origin_name = res.origin_name;
          this.thumbnail.length = res.length;
          return downloadThumbnail({ category: this.category, args: this.args });
        })
        .then((blob) => {
          // noinspection JSCheckFunctionSignatures
          this.thumbnail.url = window.URL.createObjectURL(blob);
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    handleDownload() {
      if (this.settingNodeInvalid) {
        return;
      }
      resolveResponse(requestFileStreamVoucher(this.category, this.args))
        .then((voucherKey) => {
          // 进行提示。
          this.$message({
            showClose: true,
            message: '后台正在准备文件，文件越大，准备时间越长，请耐心等待...',
            type: 'success',
            center: true,
            duration: 10000,
          });
          // 执行下载。
          const iframe = document.createElement('iframe');
          iframe.setAttribute('hidden', 'hidden');
          document.body.appendChild(iframe);
          const url = `${axios.defaults.baseURL}/settingrepo/image-node/download-file-by-voucher?voucher-id=${voucherKey.long_id}`;
          iframe.setAttribute('src', url);
        });
    },
    handleUpload(files) {
      // 构造表单数据。
      const file = files[0];
      const formData = new FormData();
      formData.append('category', this.category);
      formData.append('args', JSON.stringify(this.args));
      formData.append('file', file.blob, file.name);

      // 执行上传。
      this.loading += 1;
      resolveResponse(uploadStream(formData))
        .then(() => {
          // 进行提示。
          this.$message({
            showClose: true,
            message: '上传成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleInspect();
        })
        .catch(() => {})
        .finally(() => {
          this.loading -= 1;
        });
    },
  },
  mounted() {
    this.handleInspect();
  },
};
</script>

<style scoped>
.image-node-edit-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .file-selector{
  margin-right: 10px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

/*noinspection CssUnusedSymbol*/
.main-container .el-divider--vertical {
  height: 100%;
  margin: 0 5px;
}

.main-container .item {
  height: 100%;
}

.main-container .expand {
  width: 0;
  flex-grow: 1;
}

.property-container {
  width: 500px
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-container .property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.image-container .image {
  width: 100%;
  height: 100%;
}
</style>
