<template>
  <div class="image-list-node-edit-panel-container" v-loading="loading">
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
          <title-layout-panel class="item list-container" title="图片列表">
            <table-panel
              class="table"
              pagination-adjust-strategy="FORCE_COMPACT"
              :page-size.sync="table.pageSize"
              :entity-count="table.data.length"
              :current-page.sync="table.currentPage"
              :page-sizes="[10,15,20,30]"
              :table-data="table.scopedData"
              :operate-column-width="130"
              :table-selection.sync="table.selection"
              @onPagingAttributeChanged="handlePagingAttributeChanged"
            >
              <template v-slot:default>
                <el-table-column
                  prop="index"
                  label="索引"
                  width="50px"
                  align="right"
                  show-tooltip-when-overflow
                />
                <el-table-column
                  prop="origin_name"
                  label="文件名称"
                  show-tooltip-when-overflow
                  :formatter="originNameFormatter"
                />
                <el-table-column
                  prop="length"
                  label="文件大小"
                  width="95px"
                  show-tooltip-when-overflow
                  :formatter="unitFormatter"
                />
              </template>
              <template v-slot:operateColumn="{row, $index}">
                <el-button-group class=operate-column>
                  <el-button
                    class="table-button"
                    size="mini"
                    icon="el-icon-download"
                    type="success"
                    :disabled="!nodeItemRowDownloadEnabled(row)"
                    @click="handleDownload(row)"
                  />
                  <!--suppress JSUnresolvedReference -->
                  <el-button
                    class="table-button"
                    size="mini"
                    icon="el-icon-upload2"
                    type="primary"
                    :disabled="!nodeItemRowUploadEnabled"
                    @click="$refs['updateFileSelector' + $index].$refs.selector.click()"
                  />
                  <el-button
                    class="table-button"
                    size="mini"
                    icon="el-icon-sort"
                    type="primary"
                    :disabled="!nodeItemRowChangeOrderEnabled"
                    @click="handleShowChangeOrderDialog(row)"
                  />
                  <el-button
                    class="table-button"
                    size="mini"
                    icon="el-icon-delete"
                    type="danger"
                    :disabled="!nodeItemRowRemoveEnabled"
                    @click="handleRemove(row)"
                  />
                </el-button-group>
                <file-selector
                  class="update-file-selector"
                  :ref="'updateFileSelector' + $index"
                  accept="image/jpeg, image/png"
                  :multiple="false"
                  :tester="tester"
                  @onFileLoaded="(files) => handleUpdate(row, files)"
                />
              </template>
            </table-panel>
          </title-layout-panel>
          <el-divider direction="vertical"/>
          <title-layout-panel class="item expand image-container" title="图片预览">
            <div v-if="!table.selection" class="placeholder">
              请选择图片
            </div>
            <!--suppress JSUnresolvedReference -->
            <div v-else-if="table.selection.null_flag" class="placeholder">
              无图片
            </div>
            <div class="image-wrapper" v-else v-loading="thumbnail.loading">
              <el-image class="image" fit="contain" :src="thumbnail.url"/>
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <entity-maintain-dialog
      label-width="55px"
      mode="EDIT"
      edit-title="变更顺序"
      edit-confirm-button-label="确认"
      edit-cancel-button-label="取消"
      :visible.sync="changeOrderDialog.visible"
      :entity="changeOrderDialog.anchorEntity"
      :edit-rules="changeOrderDialog.rules"
      :close-on-click-modal="false"
      @onEntityEdit="handleChangeOrder"
    >
      <el-form-item label="旧索引" prop="index">
        <el-input
          v-model="changeOrderDialog.anchorEntity.index"
          readonly
        />
      </el-form-item>
      <el-form-item label="新索引" prop="neo_index">
        <el-input-number
          v-model="changeOrderDialog.anchorEntity.neo_index"
          :min="0"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import axios from 'axios';

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import FileSelector from '@/components/file/FileSelector.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  downloadThumbnail,
  operateInspect,
  uploadStream,
  requestFileStreamVoucher,
  updateStream,
  size,
  changeOrder,
  remove,
} from '@/api/settingrepo/imageListNode';
import resolveResponse from '@/util/response';
import { dataSizePreset, formatUnit } from '@/util/number';

export default {
  name: 'ImageListNodeEditPanel',
  components: {
    EntityMaintainDialog,
    TablePanel,
    TitleLayoutPanel,
    FileSelector,
    HeaderLayoutPanel,
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
    nodeItemRowDownloadEnabled() {
      // noinspection JSUnresolvedReference
      return (row) => !row.null_flag;
    },
    nodeItemRowUploadEnabled() {
      return !this.readonly;
    },
    nodeItemRowChangeOrderEnabled() {
      return !this.readonly;
    },
    nodeItemRowRemoveEnabled() {
      return !this.readonly;
    },
  },
  watch: {
    category() {
      this.handleInspect();
    },
    args() {
      this.handleInspect();
    },
    'table.selection': {
      handler() {
        this.refreshThumbnail();
      },
    },
  },
  data() {
    const changeOrderNeoIndexValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res < 0) {
            callback(new Error('新索引不能小于 0'));
            return Promise.reject();
          }
          return resolveResponse(size(this.category, this.args));
        })
        .then((res) => {
          if (res.size <= 0) {
            callback(new Error('没有可变更的索引'));
            return Promise.reject();
          }
          if (value > res.size - 1) {
            callback(new Error('新索引不能大于等于当前索引总数'));
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          callback();
        })
        .catch(() => {
        });
    };
    return {
      loading: 0,
      thumbnail: {
        loading: 0,
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
      table: {
        data: [],
        scopedData: [],
        currentPage: 0,
        pageSize: 10,
        selection: null,
      },
      changeOrderDialog: {
        visible: false,
        anchorEntity: {
          index: 0,
          neo_index: 0,
        },
        rules: {
          neo_index: [
            { validator: changeOrderNeoIndexValidator, trigger: 'blur' },
          ],
        },
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
          this.updateTableView(res);
          this.refreshPaging();
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateTableView(res) {
      this.table.data.splice(0, this.table.data.length);
      for (let i = 0; i < res.items.length; i += 1) {
        const item = res.items[i];
        item.index = i;
        this.table.data.push(item);
      }
    },
    refreshPaging() {
      // 计算当前 rows 下的最大页数。
      const maxPage = Math.floor(this.table.data.length / this.table.pageSize);
      // 如果 currentPage 超过了最大页数，则将 currentPage 设置为最大页数。
      if (this.table.currentPage > maxPage) {
        this.table.currentPage = maxPage;
      }
      // 重新计算 scopedData。
      this.table.scopedData.splice(0, this.table.scopedData.length);
      const start = (this.table.currentPage) * this.table.pageSize;
      const end = Math.min(start + this.table.pageSize, this.table.data.length);
      for (let i = start; i < end; i += 1) {
        this.table.scopedData.push(this.table.data[i]);
      }
    },
    handlePagingAttributeChanged() {
      this.refreshPaging();
    },
    originNameFormatter(row, column) {
      // noinspection JSUnresolvedReference
      if (row.null_flag) {
        return '（无文件）';
      }
      return row[column.property];
    },
    unitFormatter(row, column) {
      // noinspection JSUnresolvedReference
      if (row.null_flag) {
        return '（无文件）';
      }
      return formatUnit(row[column.property], dataSizePreset);
    },
    refreshThumbnail() {
      if (!this.table.selection) {
        if (this.thumbnail.url !== '') {
          window.URL.revokeObjectURL(this.thumbnail.url);
        }
        this.thumbnail.url = '';
        return;
      }
      // noinspection JSUnresolvedReference
      if (this.table.selection.null_flag) {
        if (this.thumbnail.url !== '') {
          window.URL.revokeObjectURL(this.thumbnail.url);
        }
        this.thumbnail.url = '';
        return;
      }
      this.thumbnail.loading += 1;
      if (this.thumbnail.url !== '') {
        window.URL.revokeObjectURL(this.thumbnail.url);
      }
      downloadThumbnail({
        category: this.category,
        args: this.args,
        index: this.table.selection.index,
      })
        .then((blob) => {
          this.thumbnail.origin_name = this.table.selection.origin_name;
          this.thumbnail.length = this.table.selection.length;
          // noinspection JSCheckFunctionSignatures
          this.thumbnail.url = window.URL.createObjectURL(blob);
        })
        .finally(() => {
          this.thumbnail.loading -= 1;
        });
    },
    handleUpload(files) {
      // 构造表单数据。
      const file = files[0];
      const formData = new FormData();
      formData.append('category', this.category);
      formData.append('args', JSON.stringify(this.args));
      formData.append('index', '');
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
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    handleDownload(row) {
      // noinspection JSUnresolvedReference
      if (!row || row.null_flag) {
        return;
      }
      resolveResponse(requestFileStreamVoucher(this.category, this.args, row.index))
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
          const url = `${axios.defaults.baseURL}/settingrepo/image-list-node/download-file-by-voucher?voucher-id=${voucherKey.long_id}`;
          iframe.setAttribute('src', url);
        });
    },
    handleUpdate(row, files) {
      // 构造表单数据。
      const file = files[0];
      const formData = new FormData();
      formData.append('category', this.category);
      formData.append('args', JSON.stringify(this.args));
      formData.append('index', row.index);
      formData.append('file', file.blob, file.name);

      // 执行更新。
      this.loading += 1;
      resolveResponse(updateStream(formData))
        .then(() => {
          // 进行提示。
          this.$message({
            showClose: true,
            message: '更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleInspect();
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    handleShowChangeOrderDialog(row) {
      this.changeOrderDialog.anchorEntity.index = row.index;
      this.changeOrderDialog.anchorEntity.neo_index = row.index;
      this.changeOrderDialog.visible = true;
    },
    handleChangeOrder() {
      this.loading += 1;
      resolveResponse(changeOrder(
        this.category,
        this.args,
        this.changeOrderDialog.anchorEntity.index,
        this.changeOrderDialog.anchorEntity.neo_index,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '变更顺序成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleInspect();
          return Promise.resolve();
        })
        .then(() => {
          this.changeOrderDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    handleRemove(row) {
      this.$confirm(
        '此操作将永久删除此图片项。<br>是否继续?',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        },
      ).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(remove(this.category, this.args, row.index)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '图片项删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleInspect();
        })
        .catch(() => {
        });
    },
  },
  mounted() {
    this.handleInspect();
  },
};
</script>

<style scoped>
.image-list-node-edit-panel-container {
  height: 100%;
  width: 100%;
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

.main-container .table .table-button {
  padding: 7px;
}

.main-container .table .update-file-selector {
  display: none;
}

.list-container {
  width: 500px
}

.image-container .image-wrapper {
  height: 100%;
  width: 100%;
  display: block;
}

.image-container .image {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.placeholder {
  width: 100%;
  height: 100%;
  line-height: 184px;
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
