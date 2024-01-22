<template>
  <div class="activity-cover-panel-container">
    <div class="placeholder" v-if="activityId===''">请选择活动</div>
    <!--suppress VueUnrecognizedDirective -->
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleUploadButtonClicked"
            >
              上传封面
            </el-button>
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleUpdateOrderButtonClicked"
            >
              调整顺序
            </el-button>
            <el-divider direction="vertical"/>
            <el-button type="success" @click="handleCarouselSearch">刷新数据</el-button>
            <div style="flex-grow: 1"/>
            <el-button
              class="icon-button"
              v-if="mode==='DEFAULT'"
              type="info"
              @click="handlePanelFloatyButtonClicked"
            >
              <i class="iconfont">&#xffd3;</i>
            </el-button>
          </div>
        </template>
        <template v-slot:default>
          <el-carousel
            class="el-carousel"
            v-if="carousel.images.length > 0"
            height="calc(100% - 30px)"
            type="card"
            :autoplay="false"
          >
            <el-carousel-item v-for="(url,index) in carousel.images" :key="index">
              <el-image class="image" fit="cover" :src="url"/>
            </el-carousel-item>
          </el-carousel>
          <div class="placeholder" v-else>暂无封面，请上传</div>
        </template>
      </header-layout-panel>
    </div>
    <image-upload-edit-dialog
      title="上传图片"
      :visible.sync="uploadDialog.visible"
      :output-size="0.95"
      :cropper-height="400"
      :cropper-width="680"
      :crop-box-height="360"
      :crop-box-width="640"
      :enlarge="2"
      @onConfirmed="handleImageUploadConfirmed"
    />
    <el-dialog
      title="调整顺序"
      append-to-body
      destroy-on-close
      width="50%"
      top="10vh"
      :visible.sync="updateOrderDialog.visible"
    >
      <!--suppress VueUnrecognizedDirective -->
      <draggable-table-panel
        class="table-panel"
        row-key="id"
        v-loading="updateOrderDialog.table.loading"
        :table-data.sync="updateOrderDialog.table.data"
        :inspect-button-visible="false"
        :edit-button-visible="false"
        :operate-column-width="49"
        :show-contextmenu="true"
        @onEntityDelete="handleCoverDelete"
        @onEntityOrderChanged="handleCoverOrderChanged"
      >
        <el-table-column
          label="内容"
          width="141px"
          :resizable="false"
        >
          <!--suppress VueUnrecognizedSlot -->
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
      </draggable-table-panel>
    </el-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import ImageUploadEditDialog from '@/components/image/ImageUploadEditDialog.vue';

import {
  childForActivity,
  download,
  remove,
  upload,
  updateOrder,
} from '@/api/life/activityCover';
import resolveResponse from '@/util/response';
import DraggableTablePanel from '@/components/layout/DraggableTablePanel.vue';
import { dataSizePreset, formatUnit } from '@/util/number';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'ActivityCoverPanel',
  components: { DraggableTablePanel, ImageUploadEditDialog, HeaderLayoutPanel },
  props: {
    activityId: {
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
  watch: {
    activityId() {
      this.handleCarouselSearch();
    },
  },
  data() {
    return {
      loading: false,
      carousel: {
        images: [],
      },
      uploadDialog: {
        visible: false,
      },
      updateOrderDialog: {
        visible: false,
        table: {
          loading: false,
          data: [],
        },
      },
    };
  },
  methods: {
    handleCarouselSearch() {
      if (this.activityId === '') {
        return;
      }

      this.loading = true;
      this.releaseOldCover();
      resolveResponse(childForActivity(this.activityId, 0, 100))
        .then((res) => {
          const promises = [];
          res.data.forEach((activityCoverInfo) => {
            promises.push(download(activityCoverInfo.key.long_id));
          });
          return Promise.all(promises);
        })
        .then(this.updateCarouselView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    releaseOldCover() {
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.carousel.images.forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
      this.carousel.images.splice(0, this.carousel.images.length);
    },
    updateCarouselView(res) {
      res.forEach((blob) => {
        this.carousel.images.push(window.URL.createObjectURL(blob));
      });
    },
    handleUploadButtonClicked() {
      this.uploadDialog.visible = true;
    },
    handleImageUploadConfirmed(fileName, blob) {
      const formData = new FormData();
      formData.append('file', blob, fileName);
      resolveResponse(upload(this.activityId, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '封面上传成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleCarouselSearch();
        })
        .catch(() => {
        });
    },
    handleUpdateOrderButtonClicked() {
      this.updateOrderDialog.visible = true;
      this.handleUpdateOrderDialogTableSearch();
    },
    handleUpdateOrderDialogTableSearch() {
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.updateOrderDialog.table.data.forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
      this.updateOrderDialog.table.data.splice(0, this.updateOrderDialog.table.data.length);
      this.updateOrderDialog.table.loading = true;
      resolveResponse(childForActivity(this.activityId, 0, 100))
        .then((res) => {
          const promises = [];
          res.data.forEach((activityCoverInfo) => {
            promises.push(download(activityCoverInfo.key.long_id).then(((blob) => {
              const neoActivityCoverInfo = activityCoverInfo;
              // noinspection JSCheckFunctionSignatures
              neoActivityCoverInfo.url = window.URL.createObjectURL(blob);
              return Promise.resolve(neoActivityCoverInfo);
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
          this.$set(this.updateOrderDialog.table, 'data', res);
        })
        .catch(() => {
        })
        .finally(() => {
          this.updateOrderDialog.table.loading = false;
        });
    },
    unitFormatter(row, column) {
      return formatUnit(row[column.property], dataSizePreset);
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleCoverDelete(index, entity) {
      this.$confirm('此操作将永久删除此活动封面。<br>是否继续?',
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
            message: '活动封面删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleCarouselSearch();
        })
        .then(() => {
          this.handleUpdateOrderDialogTableSearch();
        })
        .catch(() => {
        });
    },
    handleCoverOrderChanged(entities) {
      const keys = entities.map((e) => e.key);
      resolveResponse(updateOrder(keys))
        .then(() => {
          this.$message({
            showClose: true,
            message: '顺序调整成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleCarouselSearch();
        })
        .catch(() => {
          this.handleCarouselSearch();
          this.handleUpdateOrderDialogTableSearch();
        });
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
  },
  mounted() {
    this.handleCarouselSearch();
  },
};
</script>

<style scoped>
.activity-cover-panel-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
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

.el-carousel {
  width: 100%;
  height: 100%;
}

.el-carousel .image {
  height: 100%;
  width: 100%;
}

.table-panel {
  height: 500px
}

.table-panel .image-wrapper {
  line-height: 0;
}

.table-panel .image {
  width: 100%;
  height: 67px;
}
</style>
