<template>
  <div class="item-cover-edit-dialog-container">
    <el-dialog
      append-to-body
      destroy-on-close
      title="项目封面编辑"
      width="50%"
      top="10vh"
      :visible.sync="watchedVisible"
      :close-on-click-modal="false"
    >
      <header-layout-panel>
        <template v-slot:header>
          <div class="header">
            <div>
              <el-button
                type="primary"
                :disabled="table.data.length >= maxSize"
                @click="uploadDialog.visible=true"
              >
                上传
              </el-button>
              <el-button
                type="success"
                @click="handleSearch"
              >
                刷新
              </el-button>
            </div>
            <span>封面数量:{{ table.data.length }}/{{ maxSize }}</span>
          </div>
        </template>
        <template v-slot:default>
          <draggable-table-panel
            class="table-panel"
            row-key="id"
            v-loading="table.loading"
            :table-data.sync="table.data"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :operate-column-width="49"
            :show-contextmenu="true"
            @onEntityDelete="handleEntityDelete"
            @onEntityOrderChanged="handleEntityOrderChanged"
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
          </draggable-table-panel>
        </template>
      </header-layout-panel>
      <div class="footer-container" slot="footer">
        <el-button @click="watchedVisible=false">关闭</el-button>
      </div>
    </el-dialog>
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
  </div>
</template>

<script>
import DraggableTablePanel from '@/components/layout/DraggableTablePanel.vue';
import ImageUploadEditDialog from '@/components/image/ImageUploadEditDialog.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';

import {
  childForItem, download, upload, remove, updateOrder,
} from '@/api/assets/itemCover';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';
import { formatUnit, dataSizePreset } from '@/util/number';

export default {
  name: 'ItemCoverEditDialog',
  components: {
    HeaderLayoutPanel,
    ImageUploadEditDialog,
    DraggableTablePanel,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    itemId: {
      type: String,
      default: '',
    },
  },
  watch: {
    visible(value) {
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      if (value) {
        this.handleSearch();
      }
      this.$emit('update:visible', value);
    },
  },
  data() {
    return {
      watchedVisible: false,
      uploadDialog: {
        visible: false,
      },
      editorDialog: {
        imageUrl: '',
      },
      table: {
        data: [],
        loading: false,
      },
      maxSize: 6,
    };
  },
  methods: {
    handleSearch() {
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.table.data.forEach((data) => {
        window.URL.revokeObjectURL(data.url);
      });
      this.table.data.splice(0, this.table.data.length);
      this.table.loading = true;
      resolveResponse(childForItem(this.itemId, 0, 100))
        .then((res) => {
          const promises = [];
          res.data.forEach((itemCoverInfo) => {
            promises.push(download(itemCoverInfo.key.long_id).then(((blob) => {
              const neoItemCoverInfo = itemCoverInfo;
              // noinspection JSCheckFunctionSignatures
              neoItemCoverInfo.url = window.URL.createObjectURL(blob);
              return Promise.resolve(neoItemCoverInfo);
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
      resolveResponse(upload(this.itemId, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '封面上传成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.$emit('onItemCoverChanged');
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
      this.$confirm('此操作将永久删除此项目封面。<br>是否继续?',
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
            message: '项目封面删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.$emit('onItemCoverChanged');
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
    handleEntityOrderChanged(entities) {
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
          this.$emit('onItemCoverChanged');
        })
        .catch(() => {
        });
    },
  },
};
</script>

<style scoped>
.header {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
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
