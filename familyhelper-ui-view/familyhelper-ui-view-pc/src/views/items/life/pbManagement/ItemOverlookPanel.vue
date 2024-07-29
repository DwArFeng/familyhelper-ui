<template>
  <div class="item-overlook-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header">
          <el-button
            type="primary"
            :disabled="readOnly"
            @click="handleItemEdit"
          >
            编辑属性
          </el-button>
          <el-button type="success" @click="updateView">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="overlook-wrapper">
          <title-layout-panel class="details" title="属性" bordered apply-container-height>
            <el-form
              class="property-form"
              label-position="left"
              label-width="80px"
              inline
              :model="form.entity"
            >
              <el-form-item label="名称" style="width: 33%">
                {{ form.entity.name }}
              </el-form-item>
              <el-form-item label="单位" style="width: 33%">
                {{ form.entity.unit }}
              </el-form-item>
              <el-form-item label="比较" style="width: 33%">
                {{ form.entity.comparator | comparator }}
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
                {{ form.entity.remark }}
              </el-form-item>
            </el-form>
          </title-layout-panel>
          <title-layout-panel class="details" title="当前记录" bordered>
            <div class="record-panel">
              <record-chart
                class="record-panel-block chart-panel"
                :show-title="false"
                :hover-animation="false"
                :category="chart.category"
                :data="chart.data"
              />
              <div class="record-panel-block carousel-panel">
                <div class="placeholder" v-if="carousel.images.length===0">最新记录没有上传图片</div>
                <el-carousel
                  class="el-carousel"
                  v-else
                  height="calc(100% - 30px)"
                  type="card"
                  :autoplay="false"
                >
                  <el-carousel-item v-for="(url,index) in carousel.images" :key="index">
                    <el-image class="image" fit="cover" :src="url" :preview-src-list="[url]"/>
                  </el-carousel-item>
                </el-carousel>
              </div>
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import RecordChart from '@/views/items/life/pbManagement/RecordChart.vue';

import { inspectDisp as inspectItem } from '@/api/life/pbItem';
import { childForPbItemRecordedDateDesc as inspectRecord } from '@/api/life/pbRecord';
import {
  childForPbRecordUploadedDateAsc as inspectFile,
  download as downloadFile,
} from '@/api/life/pbFile';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'ItemOverlookPanel',
  components: { RecordChart, TitleLayoutPanel, HeaderLayoutPanel },
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
    loading() {
      return this.itemLoading || this.recordLoading || this.fileLoading;
    },
  },
  watch: {
    itemId() {
      this.updateView();
    },
  },
  filters: {
    comparator(value) {
      switch (value) {
        case 0:
          return '越高越好';
        case 1:
          return '越低越好';
        default:
          return '（未知）';
      }
    },
  },
  data() {
    return {
      itemLoading: false,
      recordLoading: false,
      fileLoading: false,
      form: {
        entity: {
          name: '',
          remark: '',
        },
      },
      chart: {
        category: [],
        data: [],
      },
      carousel: {
        images: [],
      },
    };
  },
  methods: {
    updateView() {
      if (this.itemId === '') {
        return;
      }
      this.inspectItem();
      this.inspectRecord();
      this.inspectFile();
    },
    inspectItem() {
      this.itemLoading = true;
      resolveResponse(inspectItem(this.itemId))
        .then(this.updateFormView)
        .catch(() => {
        })
        .finally(() => {
          this.itemLoading = false;
        });
    },
    inspectRecord() {
      this.recordLoading = true;
      this.chart.category.splice(0, this.chart.category.length);
      this.chart.data.splice(0, this.chart.data.length);
      resolveResponse(inspectRecord(this.itemId, 0, 20))
        .then((res) => {
          const data = res.data.reverse();
          data.forEach((record) => {
            // noinspection JSUnresolvedVariable
            this.chart.category.push(formatTimestamp(record.recorded_date));
            // noinspection JSUnresolvedVariable
            this.chart.data.push({
              value: [formatTimestamp(record.recorded_date), record.value],
            });
          });
        })
        .catch(() => {
        })
        .finally(() => {
          this.recordLoading = false;
        });
    },
    inspectFile() {
      this.fileLoading = true;
      this.revokeFileUrl();
      resolveResponse(inspectRecord(this.itemId, 0, 1))
        .then((res) => {
          if (res.count <= 0) {
            return Promise.reject();
          }
          return Promise.resolve(res.data[0]);
        })
        .then((res) => resolveResponse(inspectFile(res.key.long_id, 0, 100)))
        .then((res) => {
          const promises = [];
          res.data.forEach((itemCoverInfo) => {
            promises.push(downloadFile(itemCoverInfo.key.long_id));
          });
          return Promise.all(promises);
        })
        .then((res) => {
          res.forEach((blob) => {
            this.carousel.images.push(window.URL.createObjectURL(blob));
          });
        })
        .catch(() => {
        })
        .finally(() => {
          this.fileLoading = false;
        });
    },
    updateFormView(res) {
      this.$set(this.form, 'entity', res);
      return Promise.resolve();
    },
    handleItemEdit() {
      this.$emit('onItemEdit');
    },
    revokeFileUrl() {
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.carousel.images.forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
      this.carousel.images.splice(0, this.carousel.images.length);
    },
  },
  mounted() {
    this.updateView();
  },
  destroyed() {
    this.revokeFileUrl();
  },
};
</script>

<style scoped>
.item-overlook-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.overlook-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.overlook-wrapper .details:not(:first-child) {
  margin-top: 5px;
}

.overlook-wrapper .details:last-child {
  height: 0;
  flex-grow: 1;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.record-panel {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.record-panel .record-panel-block:not(:last-child) {
  margin-right: 10px;
}

.chart-panel {
  width: 0;
  flex-grow: 4;
}

.carousel-panel {
  width: 0;
  flex-grow: 5;
}

.carousel-panel .el-carousel {
  width: 100%;
  height: 100%;
}

.carousel-panel .el-carousel .image {
  height: 100%;
  width: 100%;
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
