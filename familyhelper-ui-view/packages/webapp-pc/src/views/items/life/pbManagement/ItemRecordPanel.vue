<template>
  <div class="item-record-panel-container">
    <header-layout-panel class="record-panel block">
      <template v-slot:header>
        <div class="header">
          <el-button
            type="primary"
            :disabled="readOnly"
            @click="handleShowRecordCreateDialog"
          >
            新建记录
          </el-button>
          <el-button type="success" @click="handleSearchRecord">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table-panel"
          v-loading="record.table.loading"
          highlight-current-row
          :page-size.sync="record.table.pageSize"
          :entity-count="parseInt(record.table.entities.count)"
          :current-page.sync="record.table.currentPage"
          :page-sizes="[10,15,20,50]"
          :table-data="record.table.entities.data"
          :table-selection.sync="record.table.selection"
          @onPagingAttributeChanged="handleRecordPagingAttributeChanged"
        >
          <el-table-column
            prop="recorded_date"
            label="记录日期"
            show-tooltip-when-overflow
            :formatter="timestampFormatter"
          />
          <el-table-column
            prop="value"
            label="记录值"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
          <template v-slot:operateColumn="{$index,row}">
            <el-button-group class=operate-column>
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-search"
                type="success"
                @click="handleShowRecordInspectDialog($index, row)"
              />
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-edit"
                type="primary"
                :disabled="readOnly"
                @click="handleShowRecordEditDialog($index, row)"
              />
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-delete"
                type="danger"
                :disabled="readOnly"
                @click="handleRecordDelete($index, row)"
              />
            </el-button-group>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <header-layout-panel class="file-panel block">
      <template v-slot:header>
        <div class="header">
          <el-button
            type="primary"
            :disabled="readOnly || record.table.selection===null"
            @click="file.uploadDialog.visible=true"
          >
            上传图片
          </el-button>
          <el-button type="success" @click="handleSearchFile">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table-panel"
          v-loading="file.table.loading"
          :page-size.sync="file.table.pageSize"
          :entity-count="parseInt(file.table.count)"
          :current-page.sync="file.table.currentPage"
          :page-sizes="[5,10,15,20]"
          :table-data="file.table.data"
          :operate-column-width="76"
          @onPagingAttributeChanged="handleFilePagingAttributeChanged"
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
            prop="uploaded_date"
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
                @click="handleFileDelete(index,row)"
              />
            </el-button-group>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <entity-maintain-dialog
      :loading="record.maintainDialog.loading"
      :mode="record.maintainDialog.mode"
      :visible.sync="record.maintainDialog.visible"
      :entity="record.maintainDialog.anchorEntity"
      :create-rules="record.maintainDialog.rules"
      :edit-rules="record.maintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleRecordCreate"
      @onEntityEdit="handleRecordEdit"
    >
      <el-form-item label="值" prop="value">
        <el-input
          v-model="record.maintainDialog.anchorEntity.value"
          placeholder="请填写当前值"
          :readonly="record.maintainDialog.mode === 'INSPECT'"
          @input="handleValueInput($event)"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="record.maintainDialog.anchorEntity.remark"
          :readonly="record.maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <image-upload-edit-dialog
      title="上传图片"
      :visible.sync="file.uploadDialog.visible"
      :output-size="0.95"
      :cropper-height="400"
      :cropper-width="680"
      :crop-box-height="360"
      :crop-box-width="640"
      :enlarge="3"
      @onConfirmed="handleFileUploadConfirmed"
    />
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import ImageUploadEditDialog from '@/components/image/ImageUploadEditDialog.vue';

import {
  childForPbItemRecordedDateDesc as lookupRecord,
  create as createRecord,
  remove as removeRecord,
  update as updateRecord,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbRecord';
import {
  childForPbRecordUploadedDateAsc as lookupFile,
  download as downloadFile,
  remove as removeFile,
  upload as uploadFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbFile';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';
import { dataSizePreset, formatUnit } from '@/util/number';

export default {
  name: 'ItemRecordPanel',
  components: {
    ImageUploadEditDialog, EntityMaintainDialog, TablePanel, HeaderLayoutPanel,
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
  watch: {
    itemId() {
      this.updateView();
    },
    'record.table.selection': {
      handler() {
        this.handleSearchFile();
      },
    },
  },
  data() {
    return {
      record: {
        table: {
          loading: false,
          currentPage: 0,
          pageSize: 10,
          entities: {
            current_page: 0,
            total_pages: 0,
            rows: 0,
            count: '0',
            data: [],
          },
          selection: null,
        },
        maintainDialog: {
          loading: false,
          mode: 'CREATE',
          visible: false,
          anchorEntity: {
            long_id: '',
            value: '',
            remark: '',
          },
          rules: {
            value: [
              { required: true, message: '值不能为空', trigger: 'change' },
            ],
          },
        },
      },
      file: {
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
      },
    };
  },
  methods: {
    updateView() {
      this.handleSearchRecord();
      this.handleSearchFile();
    },
    handleSearchRecord() {
      if (this.itemId === '') {
        return;
      }
      this.inspectRecord();
    },
    inspectRecord() {
      this.record.table.loading = true;
      resolveResponse(lookupRecord(
        this.itemId, this.record.table.currentPage, this.record.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(lookupRecord(
              this.itemId, res.total_pages - 1, this.record.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateRecordTableView)
        .catch(() => {
        })
        .finally(() => {
          this.record.table.loading = false;
        });
    },
    updateRecordTableView(res) {
      this.record.table.entities = res;
      this.record.table.currentPage = res.current_page;
      return Promise.resolve();
    },
    handleRecordPagingAttributeChanged() {
      this.handleSearchRecord();
    },
    handleShowRecordCreateDialog() {
      this.showRecordDialog('CREATE');
    },
    handleShowRecordInspectDialog(index, entity) {
      this.syncAnchorRecord(entity);
      this.showRecordDialog('INSPECT');
    },
    handleShowRecordEditDialog(index, entity) {
      this.syncAnchorRecord(entity);
      this.showRecordDialog('EDIT');
    },
    syncAnchorRecord(entity) {
      this.record.maintainDialog.anchorEntity.long_id = entity.key.long_id;
      this.record.maintainDialog.anchorEntity.value = entity.value;
      this.record.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showRecordDialog(mode) {
      this.record.maintainDialog.mode = mode;
      this.record.maintainDialog.visible = true;
    },
    handleValueInput(value) {
      this.record.maintainDialog.anchorEntity.value = this.limitInput(value);
    },
    limitInput(value) {
      if (value === '' || value === null) {
        return '';
      }

      let [lead] = value;
      let val;
      if (lead === '+' || lead === '-') {
        val = (value.substring(1) && value.substring(1).split('')) || [];
      } else {
        lead = '';
        val = (value && value.split('')) || [];
      }

      if (val.length === 0) {
        return lead;
      }

      const reg1 = /\d/;
      const reg2 = /\./;

      // 第一个字符不能为小数点
      if (val[0] === '.') {
        return lead;
      }
      // 过滤掉除数字和小数点外的字符
      val = val.filter((e) => reg1.test(e) || reg2.test(e));
      const tempResult = val.join('')
        .match(/^\d*(\.?\d*)/g)[0] || '';

      return `${lead}${tempResult}`;
    },
    handleRecordCreate() {
      this.record.maintainDialog.loading = true;
      resolveResponse(createRecord(
        this.itemId,
        this.record.maintainDialog.anchorEntity.value,
        this.record.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '记录创建成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearchRecord();
          return Promise.resolve();
        })
        .then(() => {
          this.record.maintainDialog.visible = false;
          this.$emit('onContextChanged');
          return Promise.resolve();
        })
        .catch(() => {
        })
        .finally(() => {
          this.record.maintainDialog.loading = false;
        });
    },
    handleRecordEdit() {
      this.record.maintainDialog.loading = true;
      resolveResponse(updateRecord(
        this.record.maintainDialog.anchorEntity.long_id,
        this.record.maintainDialog.anchorEntity.value,
        this.record.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '记录更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearchRecord();
          return Promise.resolve();
        })
        .then(() => {
          this.record.maintainDialog.visible = false;
          this.$emit('onContextChanged');
          return Promise.resolve();
        })
        .catch(() => {
        })
        .finally(() => {
          this.record.maintainDialog.loading = false;
        });
    },
    handleRecordDelete(index, entity) {
      this.$confirm('此操作将永久删除此条记录，与记录关联的图片也会一并删除。<br>是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(removeRecord(entity.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '记录删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearchRecord();
          this.$emit('onContextChanged');
          return Promise.resolve();
        })
        .catch(() => {
        });
    },
    handleFilePagingAttributeChanged() {
      this.handleSearchFile();
    },
    handleSearchFile() {
      this.revokeFileTableDataUrl();
      if (this.record.table.selection === null) {
        return;
      }
      this.inspectFile();
    },
    revokeFileTableDataUrl() {
      // 释放旧图片的链接，并清空旧图片链接数组。
      this.file.table.data.forEach((data) => {
        window.URL.revokeObjectURL(data.url);
      });
      this.file.table.data.splice(0, this.file.table.data.length);
    },
    inspectFile() {
      this.file.table.loading = true;
      resolveResponse(lookupFile(
        this.record.table.selection.key.long_id,
        this.file.table.currentPage,
        this.file.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(lookupFile(
              this.record.table.selection, res.total_pages - 1, this.file.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then((res) => {
          const promises = [];
          res.data.forEach((pbFileInfo) => {
            promises.push(downloadFile(pbFileInfo.key.long_id).then(((blob) => {
              const neoPbFileInfo = pbFileInfo;
              // noinspection JSCheckFunctionSignatures
              neoPbFileInfo.url = window.URL.createObjectURL(blob);
              return Promise.resolve(neoPbFileInfo);
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
          this.$set(this.file.table, 'data', res);
        })
        .catch(() => {
        })
        .finally(() => {
          this.file.table.loading = false;
        });
    },
    handleFileDownload(fileInfo) {
      downloadFile(fileInfo.key.long_id)
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
    handleFileDelete(index, entity) {
      this.$confirm('此操作将永久删除此记录图片。<br>是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(removeFile(entity.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '记录图片删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearchFile();
          this.$emit('onContextChanged');
          return Promise.resolve();
        })
        .catch(() => {
        });
    },
    handleFileUploadConfirmed(fileName, blob) {
      const formData = new FormData();
      formData.append('file', blob, fileName);
      resolveResponse(uploadFile(this.record.table.selection.key.long_id, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '记录图片上传成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearchFile();
          this.$emit('onContextChanged');
          return Promise.resolve();
        })
        .catch(() => {
        });
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    unitFormatter(row, column) {
      return formatUnit(row[column.property], dataSizePreset);
    },
  },
  mounted() {
    this.updateView();
  },
  destroyed() {
    this.revokeFileTableDataUrl();
  },
};
</script>

<style scoped>
.item-record-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.item-record-panel-container .block:not(:last-child) {
  margin-right: 10px;
}

.record-panel {
  width: 0;
  flex-grow: 4;
}

.file-panel {
  width: 0;
  flex-grow: 6;
}

.table-panel {
  width: 100%;
  height: 100%;
}

.table-panel .table-button {
  padding: 7px
}
</style>
