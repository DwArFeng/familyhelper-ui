<template>
  <div class="bill-file-panel-container">
    <div class="center-panel-wrapper">
      <div class="placeholder" v-if="accountBook===null">请选择一个账本（๑╹◡╹)ﾉ</div>
      <div class="placeholder" v-else-if="fundChange===null">请选择一条记录（๑╹◡╹)ﾉ</div>
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
            prop="created_date"
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
            上传票据
          </el-button>
          <el-button type="success" @click="handleSearch">
            刷新数据
          </el-button>
        </div>
      </header-layout-panel>
      <image-upload-edit-dialog
        title="上传票据照片"
        :visible.sync="uploadDialog.visible"
        :output-size="0.95"
        :cropper-height="400"
        :cropper-width="680"
        :crop-box-height="360"
        :crop-box-width="640"
        :enlarge="3"
        @onConfirmed="handleImageUploadConfirmed"
      />
    </div>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import ImageUploadEditDialog from '@/components/image/ImageUploadEditDialog.vue';

import {
  childForFundChange, download, remove, upload,
} from '@/api/finance/billFile';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';
import { dataSizePreset, formatUnit } from '@/util/number';

export default {
  name: 'BillFilePanel',
  components: { ImageUploadEditDialog, TablePanel, HeaderLayoutPanel },
  props: {
    accountBook: {
      type: Object,
      default: () => null,
    },
    fundChange: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    readOnly() {
      return this.accountBook === null || this.accountBook.permission_level !== 0;
    },
  },
  watch: {
    fundChange() {
      this.handleSearch();
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
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.accountBook === null) {
        return;
      }
      if (this.fundChange === null) {
        return;
      }
      this.lookupChildForFundChange();
    },
    lookupChildForFundChange() {
      this.revokeTableDataUrl();
      this.table.loading = true;
      resolveResponse(childForFundChange(
        this.fundChange.key.long_id, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForFundChange(
              this.fundChange.key.long_id, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then((res) => {
          const promises = [];
          res.data.forEach((billFileInfo) => {
            promises.push(download(billFileInfo.key.long_id).then(((blob) => {
              const neoBillFileInfo = billFileInfo;
              // noinspection JSCheckFunctionSignatures
              neoBillFileInfo.url = window.URL.createObjectURL(blob);
              return Promise.resolve(neoBillFileInfo);
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
    revokeTableDataUrl() {
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.table.data.forEach((data) => {
        window.URL.revokeObjectURL(data.url);
      });
      this.table.data.splice(0, this.table.data.length);
    },
    handleImageUploadConfirmed(fileName, blob) {
      const formData = new FormData();
      formData.append('file', blob, fileName);
      resolveResponse(upload(this.fundChange.key.long_id, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '票据照片上传成功',
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
      this.$confirm('此操作将永久删除此票据照片。<br>是否继续?',
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
            message: '票据照片删除成功',
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
      download(fileInfo.key.long_id)
        .then((blob) => {
          // noinspection JSUnresolvedVariable
          const fileName = fileInfo.origin_name;
          const link = document.createElement('a');
          // noinspection JSCheckFunctionSignatures
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(link.href);
        });
    },
  },
  mounted() {
    this.handleSearch();
  },
  destroyed() {
    this.revokeTableDataUrl();
  },
};
</script>

<style scoped>
.bill-file-panel-container {
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
