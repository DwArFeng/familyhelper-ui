<template>
  <div class="router-support-container">
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
        @onPagingAttributeChanged="handlePagingAttributeChanged"
        @onEntityInspect="handleShowEntityInspectDialog"
      >
        <el-table-column
          prop="key.string_id"
          label="类型"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="label"
          label="标签"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="description"
          label="描述"
          show-tooltip-when-overflow
        />
        <el-table-column
          class-name="single-line"
          prop="example_param"
          label="示例参数"
        />
      </table-panel>
      <div class="header-container" slot="header">
        <el-button
          type="success"
          @click="handleSearch"
        >
          刷新
        </el-button>
        <div class="tooltip">
          路由器的支持与程序相关，仅可查看，不能更改
        </div>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      mode="INSPECT"
      :visible.sync="dialogVisible"
      :entity="anchorEntity"
      :close-on-click-modal="false"
    >
      <el-form-item label="类型" prop="key.string_id">
        <el-input v-model="anchorEntity.key.string_id" readonly/>
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="anchorEntity.label" readonly/>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="anchorEntity.description" readonly/>
      </el-form-item>
      <el-form-item label="示例参数" prop="example_param">
        <text-editor class="text-editor" v-model="anchorEntity.example_param" readonly/>
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TextEditor from '@/components/text/TextEditor.vue';

import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport';
import resolveResponse from '@/util/response';

export default {
  name: 'RouterSupport',
  components: {
    TextEditor, EntityMaintainDialog, TablePanel, BorderLayoutPanel,
  },
  data() {
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
        label: '',
        description: '',
        example_param: '',
      },
      loading: false,
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupAll();
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
    updateTableView(res) {
      this.entities = res;
      this.currentPage = res.current_page;
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
    },
    syncAnchorEntity(entity) {
      this.anchorEntity.key.string_id = entity.key.string_id;
      this.anchorEntity.label = entity.label;
      this.anchorEntity.description = entity.description;
      this.anchorEntity.example_param = entity.example_param;
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.router-support-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-container .tooltip {
  font-size: 14px;
  color: #909399;
}

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor{
  height: 300px;
}
</style>
