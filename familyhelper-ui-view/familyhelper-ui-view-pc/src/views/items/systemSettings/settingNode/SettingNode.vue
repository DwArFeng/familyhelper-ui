<template>
  <div class="setting-node-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <table-panel
        class="table"
        :page-size.sync="pageSize"
        :entity-count="parseInt(entities.count)"
        :current-page.sync="currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="entities.data"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="49"
        :show-contextmenu="true"
        :contextmenu-width="100"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
        @onEntityInspect="handleShowEntityInspectDialog"
      >
        <template v-slot:default>
          <el-table-column
            prop="key.string_id"
            label="设置节点"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="type"
            label="类型"
            width="110px"
            :formatter="typeFormatter"
          />
          <el-table-column
            prop="last_modified_date"
            label="最近更新日期"
            show-tooltip-when-overflow
            :formatter="timestampFormatter"
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
        </template>
        <template v-slot:contextmenu="{row,index,close}">
          <ul>
            <li @click="handleEntityCopyKeyContextmenuClicked(row,close)">
              复制节点
            </li>
            <el-divider/>
            <li @click="handleEntityInspectContextmenuClicked(row,index,close)">
              查看...
            </li>
          </ul>
        </template>
      </table-panel>
      <div class="header-container" slot="header">
        <el-button
          class="insert-button"
          type="success"
          @click="handleSearch"
        >
          刷新数据
        </el-button>
        <el-divider direction="vertical"/>
        <el-input
          class="id-search-bar"
          v-model="idSearchBar.value"
          clearable
          @keydown.enter.native="handleSearch"
          @clear="handleSearch"
        >
          <template v-slot:prepend>
            设置节点
          </template>
          <template v-slot:append>
            <el-button
              icon="el-icon-search"
              @click="handleSearch"
            />
          </template>
        </el-input>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      mode="INSPECT"
      label-width="100px"
      :visible.sync="dialogVisible"
      :entity="anchorEntity"
      :create-rules="createRules"
      :close-on-click-modal="false"
    >
      <el-form-item label="设置节点" prop="key.string_id">
        <el-input
          v-model="anchorEntity.key.string_id"
          oninput="this.value = this.value.toLowerCase()"
          disabled
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="anchorEntity.formatted_type"
          readonly
        />
      </el-form-item>
      <el-form-item label="最近更新日期" prop="last_modified_date">
        <el-input
          v-model="anchorEntity.formatted_last_modified_date"
          readonly
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="anchorEntity.remark"
          readonly
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  all, exists, idLike,
} from '@/api/settingrepo/settingNode';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'SettingNode',
  components: {
    EntityMaintainDialog, BorderLayoutPanel, TablePanel,
  },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('设置节点不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('设置节点已经存在'));
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
      entities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      currentPage: 0,
      pageSize: 15,
      dialogVisible: false,
      anchorEntity: {
        key: {
          string_id: '',
        },
        type: 0,
        last_modified_date: 0,
        remark: '',
        formatted_type: '',
        formatted_last_modified_date: '',
      },
      createRules: {
        'key.string_id': [
          { validator: keyValidator, trigger: 'blur' },
        ],
      },
      idSearchBar: {
        value: '',
      },
      loading: false,
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.idSearchBar.value !== '') {
        this.lookupIdLike();
      } else {
        this.lookupAll();
      }
    },
    lookupAll() {
      this.loading = true;
      resolveResponse(all(this.currentPage, this.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(res.total_pages - 1, this.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    lookupIdLike() {
      this.loading = true;
      resolveResponse(idLike(this.idSearchBar.value, this.currentPage, this.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(this.idSearchBar.value, res.total_pages - 1, this.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateTableView(res) {
      this.entities = res;
      this.currentPage = res.current_page;
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('INSPECT');
    },
    handleEntityInspectContextmenuClicked(row, index, close) {
      close();
      this.handleShowEntityInspectDialog(index, row);
    },
    syncAnchorEntity(entity) {
      this.anchorEntity.key.string_id = entity.key.string_id;
      this.anchorEntity.type = entity.type;
      this.anchorEntity.last_modified_date = entity.last_modified_date;
      this.anchorEntity.remark = entity.remark;
      switch (entity.type) {
        case 0:
          this.anchorEntity.formatted_type = '文本';
          break;
        case 1:
          this.anchorEntity.formatted_type = '长文本';
          break;
        case 2:
          this.anchorEntity.formatted_type = '图片';
          break;
        case 3:
          this.anchorEntity.formatted_type = '图片列表';
          break;
        default:
          this.anchorEntity.formatted_type = '（未知）';
      }
      this.anchorEntity.formatted_last_modified_date = formatTimestamp(entity.last_modified_date);
    },
    showDialog(mode) {
      this.dialogMode = mode;
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
    },
    handleEntityCopyKeyContextmenuClicked(row, close) {
      close();
      navigator.clipboard.writeText(row.key.string_id)
        .then(() => {
          this.$message({
            showClose: true,
            message: '复制成功',
            type: 'success',
            center: true,
          });
        });
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    typeFormatter(row, column) {
      const value = row[column.property];
      switch (value) {
        case 0:
          return '文本';
        case 1:
          return '长文本';
        case 2:
          return '图片';
        case 3:
          return '图片列表';
        default:
          return '（未知）';
      }
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.setting-node-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.id-search-bar{
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.id-search-bar >>> .el-input-group__prepend {
  padding: 0 10px;
}

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*noinspection CssUnusedSymbol*/
.table >>> .contextmenu .el-divider--horizontal {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
