<template>
  <div class="item-info-panel-container">
    <div class="placeholder" v-if="itemId===''">请选择项目</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowItemEditDialog"
            >
              编辑属性
            </el-button>
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowCoverEditDialog"
            >
              编辑封面
            </el-button>
            <el-divider direction="vertical"/>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <div style="flex-grow: 1"/>
            <el-button
              class="item icon-button"
              v-if="mode==='DEFAULT'"
              type="info"
              @click="handlePanelFloatyButtonClicked"
            >
              <i class="iconfont">&#xffd3;</i>
            </el-button>
          </div>
        </template>
        <template v-slot:default>
          <div class="body-container">
            <title-layout-panel
              class="property-container"
              title="属性"
              bordered apply-container-height
            >
              <el-form
                class="property-form"
                label-position="left"
                label-width="80px"
                inline
                :model="item"
              >
                <el-form-item label="名称" style="width: 33%">
                  {{ item.name }}
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
                    v-for="label in item.labels"
                    type="info"
                    :key="label.key.string_id"
                  >
                    {{ label.label }}
                  </el-tag>
                </el-form-item>
                <el-form-item label="创建日期" style="width: 33%">
                  {{ item.created_date | timestamp }}
                </el-form-item>
                <el-form-item label="修改日期" style="width: 33%">
                  {{ item.modified_date | timestamp }}
                </el-form-item>
                <el-form-item label="废弃日期" style="width: 33%">
                  {{ item.scrapped_date | timestamp }}
                </el-form-item>
                <el-form-item label="备注" 备注="width: 100%">
                  {{ item.remark }}
                </el-form-item>
              </el-form>
            </title-layout-panel>
            <title-layout-panel class="property-container" title="封面" bordered>
              <div class="carousel-wrapper">
                <el-carousel
                  class="el-carousel"
                  v-if="cover.images.length > 0"
                  height="calc(100% - 30px)"
                  type="card"
                  :autoplay="false"
                >
                  <el-carousel-item v-for="(url,index) in cover.images" :key="index">
                    <el-image class="image" fit="cover" :src="url"/>
                  </el-carousel-item>
                </el-carousel>
                <span class="placeholder" v-else>暂无封面，请上传</span>
              </div>
            </title-layout-panel>
          </div>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      label-width="100px"
      edit-title="编辑项目"
      mode="EDIT"
      :visible.sync="itemDialog.visible"
      :entity="itemDialog.anchorEntity"
      :edit-rules="itemDialog.rules"
      :close-on-click-modal="false"
      :loading="itemDialog.loading"
      @onEntityEdit="handleItemEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="itemDialog.anchorEntity.name"
          placeholder="必填"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          class='form-select'
          v-model="itemDialog.anchorEntity.item_type"
          placeholder="请选择"
        >
          <el-option
            v-for="item in itemTypeIndicator"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签" prop="label_keys">
        <el-select
          class='form-select'
          v-model="itemDialog.anchorEntity.label_keys"
          placeholder="请选择"
          multiple
        >
          <el-option
            v-for="item in label"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生命周期" prop="life_cycle">
        <el-select
          class='form-select'
          v-model="itemDialog.anchorEntity.life_cycle"
          placeholder="请选择"
        >
          <el-option
            v-for="item in lifeCycleIndicator"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="itemDialog.anchorEntity.remark"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <item-cover-edit-dialog
      :item-id="itemId"
      :visible.sync="coverDialog.visible"
      @onItemCoverChanged="handleCoverEdit"
    />
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import { formatTimestamp } from '@/util/timestamp';
import { inspectDisp as inspectItem, update } from '@/api/assets/item';
import { childForItem as inspectCover, download } from '@/api/assets/itemCover';
import { all as inspectLabel, allExists as allLabelExists } from '@/api/assets/itemLabel';
import { all as inspectItemTypeIndicator } from '@/api/assets/itemTypeIndicator';
import resolveResponse from '@/util/response';
import ItemCoverEditDialog from '@/views/items/assetsManagement/assetBom/ItemCoverEditDialog.vue';

export default {
  name: 'ItemInfoPanel',
  components: {
    ItemCoverEditDialog, EntityMaintainDialog, TitleLayoutPanel, HeaderLayoutPanel,
  },
  props: {
    itemId: {
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
      this.handleSearch();
    },
  },
  data() {
    const labelExistsValidator = (rule, value, callback) => {
      if (value === [] || value === null || value === undefined) {
        callback();
        return;
      }
      const keys = value.map((key) => ({ string_id: key }));
      resolveResponse(allLabelExists(keys))
        .then((res) => {
          if (!res) {
            callback(new Error('至少一个标签不存在'));
          } else {
            callback();
          }
        })
        .catch(() => {
          callback(new Error('通信故障'));
        });
    };
    return {
      loading: 0,
      itemTypeIndicator: [],
      label: [],
      item: {
        parent_long_id: '',
        label_keys: [],
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
      cover: {
        images: [],
      },
      lifeCycleIndicator: [
        { key: 0, label: '准备中' },
        { key: 1, label: '使用中' },
        { key: 2, label: '禁用中' },
        { key: 3, label: '已废弃' },
      ],
      itemDialog: {
        loading: false,
        visible: false,
        anchorEntity: {
          parent_long_id: '',
          name: '',
          label_keys: [],
          item_type: '',
          life_cycle: '',
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
          label_keys: [
            { validator: labelExistsValidator, trigger: 'blur' },
          ],
          item_type: [
            { required: true, message: '类型不能为空', trigger: 'blur' },
          ],
          life_cycle: [
            { required: true, message: '生命周期不能为空', trigger: 'blur' },
          ],
        },
      },
      coverDialog: {
        visible: false,
      },
    };
  },
  methods: {
    handleSearch() {
      this.handleItemTypeIndicatorSearch();
      this.handleLabelSearch();
      this.handleItemSearch();
    },
    handleItemTypeIndicatorSearch() {
      this.lookupAllItemTypeIndicator();
    },
    lookupAllItemTypeIndicator() {
      this.loading += 1;
      resolveResponse(inspectItemTypeIndicator(0, 1000))
        .then(this.updateItemTypeIndicatorView)
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateItemTypeIndicatorView(res) {
      this.itemTypeIndicator.splice(0, this.itemTypeIndicator.length);
      res.data.forEach((data) => this.itemTypeIndicator.push(data));
    },
    handleLabelSearch() {
      this.lookupAllLabel();
    },
    lookupAllLabel() {
      this.loading += 1;
      resolveResponse(inspectLabel(0, 1000))
        .then(this.updateLabelView)
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateLabelView(res) {
      this.label.splice(0, this.label.length);
      res.data.forEach((data) => this.label.push(data));
    },
    handleItemSearch() {
      if (this.itemId === '') {
        return;
      }
      this.inspectItem();
      this.inspectCover();
    },
    inspectItem() {
      this.loading += 1;
      resolveResponse(inspectItem(this.itemId))
        .then(this.updateItemView)
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateItemView(res) {
      if (res.parent_key === null) {
        this.item.parent_long_id = '';
      } else {
        this.item.parent_long_id = res.parent_key.long_id;
      }
      this.item.label_keys = res.label_keys;
      this.item.name = res.name;
      this.item.item_type = res.item_type;
      this.item.created_date = res.created_date;
      this.item.modified_date = res.modified_date;
      this.item.scrapped_date = res.scrapped_date;
      this.item.life_cycle = res.life_cycle;
      this.item.remark = res.remark;
      this.item.type_indicator = res.type_indicator;
      this.item.labels = res.labels;
    },
    inspectCover() {
      this.loading += 1;
      this.releaseOldCover();
      resolveResponse(inspectCover(this.itemId, 0, 100))
        .then((res) => {
          const promises = [];
          res.data.forEach((itemCoverInfo) => {
            promises.push(download(itemCoverInfo.key.long_id));
          });
          return Promise.all(promises);
        })
        .then(this.updateCoverView)
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    releaseOldCover() {
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.cover.images.forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
      this.cover.images.splice(0, this.cover.images.length);
    },
    updateCoverView(res) {
      res.forEach((blob) => {
        this.cover.images.push(window.URL.createObjectURL(blob));
      });
    },
    formatLifeCycle() {
      return this.lifeCycleIndicator.filter(
        (indicator) => indicator.key === this.item.life_cycle,
      )[0].label;
    },
    formatType() {
      // noinspection JSIncompatibleTypesComparison
      if (this.item.type_indicator !== null) {
        return this.item.type_indicator.label;
      }
      return '（未知）';
    },
    handleShowItemEditDialog() {
      this.syncAnchorItem();
      this.showItemDialog();
    },
    syncAnchorItem() {
      this.itemDialog.anchorEntity.parent_long_id = this.item.parent_long_id;
      this.itemDialog.anchorEntity.name = this.item.name;
      this.itemDialog.anchorEntity.item_type = this.item.item_type;
      this.itemDialog.anchorEntity.life_cycle = this.item.life_cycle;
      this.itemDialog.anchorEntity.remark = this.item.remark;
      this.itemDialog.anchorEntity.label_keys = [];
      this.itemDialog.anchorEntity.label_keys.splice(
        0, this.itemDialog.anchorEntity.label_keys.length,
      );
      this.item.label_keys.forEach(
        (key) => this.itemDialog.anchorEntity.label_keys.push(key.string_id),
      );
    },
    showItemDialog() {
      this.itemDialog.visible = true;
    },
    handleItemEdit() {
      this.itemDialog.loading = true;
      resolveResponse(update(
        this.itemId,
        this.itemDialog.anchorEntity.parent_long_id,
        this.itemDialog.anchorEntity.label_keys,
        this.itemDialog.anchorEntity.name,
        this.itemDialog.anchorEntity.item_type,
        this.itemDialog.anchorEntity.life_cycle,
        this.itemDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `项目 ${this.itemDialog.anchorEntity.name} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.itemDialog.visible = false;
          this.$emit('onItemPropertyUpdated');
        })
        .catch(() => {
        })
        .finally(() => {
          this.itemDialog.loading = false;
        });
    },
    handleShowCoverEditDialog() {
      this.coverDialog.visible = true;
    },
    handleCoverEdit() {
      this.handleSearch();
      this.$emit('onItemCoverUpdated');
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
  },
  mounted() {
    this.handleSearch();
  },
  destroyed() {
    this.releaseOldCover();
  },
};
</script>

<style scoped>
.item-info-panel-container {
  height: 100%;
  width: 100%;
  background: #FFFFFF;
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
  padding: 11px;
}

.body-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.body-container .property-container:not(:first-child) {
  margin-top: 5px;
}

.body-container .property-container:last-child {
  height: 0;
  flex-grow: 1;
}

.property-container {
  width: 100%;
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

.property-container .form-tag:not(:first-child) {
  margin-left: 5px;
}

.property-container .form-tag {
  height: 25px;
  line-height: 23px;
}

.property-container .carousel-wrapper {
  width: 100%;
  height: 100%;
}

.property-container .carousel-wrapper .el-carousel {
  width: 100%;
  height: 100%;
}

.property-container .carousel-wrapper .el-carousel .image {
  height: 100%;
  width: 100%;
}

.form-select {
  width: 100%;
}
</style>
