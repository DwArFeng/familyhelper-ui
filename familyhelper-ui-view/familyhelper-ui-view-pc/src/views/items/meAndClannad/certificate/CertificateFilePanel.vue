<template>
  <div class="certificate-file-panel-container">
    <div class="center-panel-wrapper">
      <div class="placeholder" v-if="certificate===null">请选择一个证件（๑╹◡╹)ﾉ</div>
      <header-layout-panel v-else>
        <table-panel
          class="table-panel"
          v-loading="table.loading"
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[5,10,15,20]"
          :table-data="table.data"
          :operate-column-width="76"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
        >
          <el-table-column
            label="内容"
            width="141px"
            :resizable="false"
          >
            <template v-slot:default="{row}">
              <div class="image-wrapper">
                <!--suppress JSUnresolvedReference -->
                <el-image class="image" fit="cover" :src="row.url" :preview-src-list="[row.url]"/>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="length"
            label="大小"
            width="95px"
            show-tooltip-when-overflow
            :formatter="unitFormatter"
          />
          <el-table-column
            prop="upload_date"
            label="上传日期"
            width="180px"
            show-tooltip-when-overflow
            :formatter="timestampFormatter"
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
          <template v-slot:operateColumn="{index,row}">
            <el-button-group class=operate-column>
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-download"
                type="success"
                @click="handleFileDownload(row)"
              />
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-delete"
                type="danger"
                :disabled="readOnly"
                @click="handleEntityDelete(index,row)"
              />
            </el-button-group>
          </template>
        </table-panel>
        <div class="header-container" slot="header">
          <el-button
            type="primary"
            :disabled="readOnly"
            @click="uploadDialog.visible=true"
          >
            上传证件照片
          </el-button>
          <el-button type="success" @click="handleSearch">
            刷新数据
          </el-button>
        </div>
      </header-layout-panel>
      <image-upload-edit-dialog
        title="上传证件照片"
        :visible.sync="uploadDialog.visible"
        :output-size="1"
        :cropper-height="400"
        :cropper-width="680"
        :crop-box-height="360"
        :crop-box-width="640"
        :enlarge="6"
        @onConfirmed="handleImageUploadConfirmed"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import ImageUploadEditDialog from '@/components/image/ImageUploadEditDialog.vue';

import { dataSizePreset, formatUnit } from '@/util/number';
import { formatTimestamp } from '@/util/timestamp';
import {
  childForCertificate,
  downloadThumbnail,
  remove,
  requestCertificateFileStreamVoucher,
  uploadStream,
} from '@/api/clannad/certificateFile';
import resolveResponse from '@/util/response';

export default {
  name: 'CertificateFilePanel',
  components: { ImageUploadEditDialog, TablePanel, HeaderLayoutPanel },
  props: {
    certificate: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    readOnly() {
      return this.certificate === null || this.certificate.permission_level !== 0;
    },
  },
  watch: {
    certificate() {
      this.handleSearch();
    },
    $route(val) {
      if (val.name === 'meAndClannad.certificate') {
        this.mayShowNotify();
      } else {
        this.mayCloseNotify();
      }
    },
  },
  data() {
    return {
      table: {
        loading: false,
        currentPage: 0,
        pageSize: 5,
        count: '0',
        data: [],
      },
      uploadDialog: {
        visible: false,
      },
      notify: {
        show: false,
        handle: null,
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.certificate === null) {
        return;
      }
      this.lookupChildForCertificate();
    },
    lookupChildForCertificate() {
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.table.data.forEach((data) => {
        window.URL.revokeObjectURL(data.url);
      });
      this.table.data.splice(0, this.table.data.length);
      this.table.loading = true;
      resolveResponse(childForCertificate(
        this.certificate.key.long_id, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForCertificate(
              this.certificate.key.long_id, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then((res) => {
          const promises = [];
          res.data.forEach((certificateFileInfo) => {
            promises.push(downloadThumbnail(certificateFileInfo.key.long_id).then(((blob) => {
              const neoCertificateFileInfo = certificateFileInfo;
              // noinspection JSCheckFunctionSignatures
              neoCertificateFileInfo.url = window.URL.createObjectURL(blob);
              return Promise.resolve(neoCertificateFileInfo);
            })));
          });
          return Promise.all(promises);
        })
        .then((res) => {
          res.map((data) => {
            const neoData = data;
            neoData.id = neoData.key.long_id;
            return neoData;
          });
          this.$set(this.table, 'data', res);
        })
        .finally(() => {
          this.table.loading = false;
        });
    },
    handleImageUploadConfirmed(fileName, blob) {
      const formData = new FormData();
      formData.append('file', blob, fileName);
      resolveResponse(uploadStream(this.certificate.key.long_id, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '证件照片上传成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
    unitFormatter(row, column) {
      return formatUnit(row[column.property], dataSizePreset);
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleEntityDelete(index, entity) {
      this.$confirm('此操作将永久删除此证件照片。<br>是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(remove(entity.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '证件照片删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
    handleFileDownload(fileInfo) {
      resolveResponse(requestCertificateFileStreamVoucher(fileInfo.key.long_id))
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
          const url = `${axios.defaults.baseURL}/clannad/certificate-file/download-file-by-voucher?voucher-id=${voucherKey.long_id}`;
          iframe.setAttribute('src', url);
        });
    },
    mayShowNotify() {
      if (this.notify.show) {
        return;
      }
      this.notify.show = true;
      // noinspection JSCheckFunctionSignatures
      this.notify.handle = this.$notify({
        title: '使用提示',
        customClass: 'custom-message-box__w450',
        message: '<div style="line-height: 20px">'
          + '显示内容使用的是缩略图，清晰度较低，仅供预览。<br>'
          + '<b>请勿截屏或使用浏览器的保存图片功能！</b><br>如需下载原图，请点击下载按钮。'
          + '</div>',
        dangerouslyUseHTMLString: true,
        type: 'info',
        center: true,
        position: 'bottom-right',
        offset: 75,
        duration: 0,
        onClose: () => {
          this.notify.show = false;
          this.notify.handle = null;
        },
      });
    },
    mayCloseNotify() {
      if (!this.notify.show) {
        return;
      }
      this.notify.handle.close();
    },
  },
  mounted() {
    this.handleSearch();
    this.mayShowNotify();
  },
  beforeDestroy() {
    this.mayCloseNotify();
  },
};
</script>

<style scoped>
.certificate-file-panel-container {
  height: 100%;
  width: 100%;
}

.table-panel .image-wrapper {
  line-height: 0;
}

.table-panel .image {
  width: 100%;
  height: 67px;
}

.table-panel .table-button {
  padding: 7px;
}

.header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.center-panel-wrapper {
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
</style>
