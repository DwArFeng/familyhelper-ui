<template>
  <div class="info-tab-panel-container">
    <div class="info-container">
      <div class="divider-block">
        <el-divider
          class="divider"
          content-position="left"
        >
          封面
        </el-divider>
        <el-button
          class="button"
          size="mini"
          type="primary"
          icon="el-icon-edit"
          @click="itemCoverEditDialog.visible=true"
        />
      </div>
      <div class="content-block">
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
    </div>
    <div class="info-container">
      <div class="divider-block">
        <el-divider
          class="divider"
          content-position="left"
        >
          属性
        </el-divider>
      </div>
      <div class="content-block">
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
            {{ wrappedFormatTimestamp(form.entity.created_date) }}
          </el-form-item>
          <el-form-item label="修改日期" style="width: 33%">
            {{ wrappedFormatTimestamp(form.entity.modified_date) }}
          </el-form-item>
          <el-form-item label="废弃日期" style="width: 33%">
            {{ wrappedFormatTimestamp(form.entity.scrapped_date) }}
          </el-form-item>
          <el-form-item label="备注" 备注="width: 100%">
            {{form.entity.remark}}
          </el-form-item>
        </el-form>
      </div>
    </div>
    <item-cover-edit-dialog
      :item-id="itemId"
      :visible.sync="itemCoverEditDialog.visible"
      @onItemCoverChanged="searchImages"
    />
  </div>
</template>

<script>
import ItemCoverEditDialog from '@/views/items/assetsManagement/assetBom/ItemCoverEditDialog.vue';

import { inspectDisp } from '@/api/assets/item';
import { formatTimestamp } from '@/util/timestamp';
import { childForItem, download } from '@/api/assets/itemCover';
import resolveResponse from '@/util/response';

export default {
  name: 'InfoTabPanel',
  components: { ItemCoverEditDialog },
  props: {
    itemId: {
      type: String,
      default: '',
    },
  },
  watch: {
    itemId(val) {
      if (val === '') {
        return;
      }
      this.inspectItem();
      this.searchImages();
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
    };
  },
  methods: {
    inspectItem() {
      resolveResponse(inspectDisp(this.itemId))
        .then(this.updateFormView);
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
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.carousel.images.forEach((url) => { window.URL.revokeObjectURL(url); });
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
        });
    },
    updateView() {
      if (this.itemId === '') {
        return;
      }
      this.inspectItem();
      this.searchImages();
    },
    wrappedFormatTimestamp(timestamp) {
      return formatTimestamp(timestamp);
    },
  },
  mounted() {
    if (this.itemId === '') {
      return;
    }
    this.inspectItem();
    this.searchImages();
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

.info-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.info-container .divider-block {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.info-container .divider-block .divider {
  margin-top: 18px;
  margin-bottom: 18px;
  flex-grow: 1;
}

.info-container .divider-block .button {
  margin-left: 20px;
  padding: 7px
}

.info-container .content-block {
  flex-grow: 1;
}

.info-container:first-child {
  height: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.info-container:first-child .el-carousel {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-divider:not(:first-child) {
  margin-top: 40px
}

.property-form >>> label {
  width: 240px;
  color: #99a9bf;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item__content {
  overflow: hidden;
}

.property-form .form-tag:not(:first-child) {
  margin-left: 5px;
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

.el-carousel .image{
  height: 100%;
  width: 100%;
}
</style>
