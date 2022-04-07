<template>
  <div class="info-tab-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header">
          <el-button type="primary" @click="handleEntityEdit">编辑属性</el-button>
          <el-button type="primary" @click="itemCoverEditDialog.visible=true">编辑封面</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="details-wrapper">
          <title-layout-panel class="details" title="属性" bordered>
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
              <el-form-item label="类型" style="width: 33%">
                {{ formatType() }}
              </el-form-item>
              <el-form-item label="生命周期" style="width: 33%">
                {{ formatLifeCycle() }}
              </el-form-item>
              <el-form-item label="标签" style="width: 100%">
                <el-tag
                  class="form-tag"
                  v-for="label in form.entity.labels"
                  type="info"
                  :key="label.key.string_id"
                >
                  {{ label.label }}
                </el-tag>
              </el-form-item>
              <el-form-item label="创建日期" style="width: 33%">
                {{ form.entity.created_date | timestamp }}
              </el-form-item>
              <el-form-item label="修改日期" style="width: 33%">
                {{ form.entity.modified_date | timestamp }}
              </el-form-item>
              <el-form-item label="废弃日期" style="width: 33%">
                {{ form.entity.scrapped_date | timestamp }}
              </el-form-item>
              <el-form-item label="备注" 备注="width: 100%">
                {{ form.entity.remark }}
              </el-form-item>
            </el-form>
          </title-layout-panel>
          <title-layout-panel class="details" title="封面" bordered>
            <div class="carousel-wrapper">
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
              <span class="placeholder" v-else>暂无封面，请上传</span>
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <item-cover-edit-dialog
      :item-id="itemId"
      :visible.sync="itemCoverEditDialog.visible"
      @onItemCoverChanged="searchImages"
    />
  </div>
</template>

<script>
import ItemCoverEditDialog from '@/views/items/assetsManagement/assetBom/ItemCoverEditDialog.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';

import { inspectDisp } from '@/api/assets/item';
import { formatTimestamp } from '@/util/timestamp';
import { childForItem, download } from '@/api/assets/itemCover';
import resolveResponse from '@/util/response';

export default {
  name: 'InfoTabPanel',
  components: {
    TitleLayoutPanel, HeaderLayoutPanel, ItemCoverEditDialog,
  },
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
      return this.itemLoading || this.coverLoading;
    },
  },
  filters: {
    timestamp(timestamp) {
      if (timestamp === null || timestamp === undefined) {
        return '（暂无）';
      }
      return formatTimestamp(timestamp);
    },
  },
  watch: {
    itemId() {
      this.updateView();
    },
  },
  data() {
    return {
      carousel: {
        images: [],
      },
      form: {
        entity: {
          name: '',
          item_type: '',
          created_date: 0,
          modified_date: 0,
          scrapped_date: 0,
          life_cycle: 0,
          remark: '',
          type_indicator: null,
          labels: [],
        },
      },
      lifeCycle: {
        entities: {
          data: [
            { key: 0, label: '准备中' },
            { key: 1, label: '使用中' },
            { key: 2, label: '禁用中' },
            { key: 3, label: '已废弃' },
          ],
        },
      },
      itemCoverEditDialog: {
        visible: false,
      },
      maintainDialog: {
        visible: false,
        anchorEntity: {
          long_id: '',
          parent_long_id: '',
          name: '',
          label_keys: [],
          type: '',
          life_cycle: '',
          remark: '',
        },
      },
      itemLoading: false,
      coverLoading: false,
    };
  },
  methods: {
    inspectItem() {
      this.itemLoading = true;
      resolveResponse(inspectDisp(this.itemId))
        .then(this.updateFormView)
        .catch(() => {
        })
        .finally(() => {
          this.itemLoading = false;
        });
    },
    updateFormView(res) {
      this.$set(this.form, 'entity', res);
    },
    formatLifeCycle() {
      return this.lifeCycle.entities.data.filter(
        (indicator) => indicator.key === this.form.entity.life_cycle,
      )[0].label;
    },
    formatType() {
      // noinspection JSIncompatibleTypesComparison
      if (this.form.entity.type_indicator !== null) {
        return this.form.entity.type_indicator.label;
      }
      return '（未知）';
    },
    searchImages() {
      this.coverLoading = true;
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.carousel.images.forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
      this.carousel.images.splice(0, this.carousel.images.length);
      resolveResponse(childForItem(this.itemId, 0, 100))
        .then((res) => {
          const promises = [];
          res.data.forEach((itemCoverInfo) => {
            promises.push(download(itemCoverInfo.key.long_id));
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
          this.coverLoading = false;
        });
    },
    updateView() {
      if (this.itemId === '') {
        return;
      }
      this.inspectItem();
      this.searchImages();
    },
    handleEntityEdit() {
      this.$emit('onEntityEdit');
    },
  },
  mounted() {
    this.updateView();
  },
};
</script>

<style scoped>
.info-tab-panel-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.details-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.details-wrapper .details:not(:first-child) {
  margin-top: 5px;
}

.details-wrapper .details:last-child {
  height: 0;
  flex-grow: 1;
}

.carousel-wrapper {
  width: 100%;
  height: 100%;
}

.carousel-wrapper .el-carousel {
  width: 100%;
  height: 100%;
}

.carousel-wrapper .el-carousel .image {
  height: 100%;
  width: 100%;
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

.property-form .form-tag:not(:first-child) {
  margin-left: 5px;
}

.property-form .form-tag {
  height: 25px;
  line-height: 23px;
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
