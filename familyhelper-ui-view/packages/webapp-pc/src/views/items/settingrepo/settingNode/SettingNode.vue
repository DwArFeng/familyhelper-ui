<template>
  <div class="setting-node-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="handleShowInitDialog"
          >
            初始化节点
          </el-button>
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
              节点 ID
            </template>
            <template v-slot:append>
              <el-button
                icon="el-icon-search"
                @click="handleSearch"
              />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.entities.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[15,20,30,50]"
          :table-data="table.entities.data"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
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
              width="180px"
              show-tooltip-when-overflow
              :formatter="timestampFormatter"
            />
            <el-table-column
              prop="remark"
              label="备注"
              show-tooltip-when-overflow
            />
          </template>
          <template v-slot:operateColumn="{row}">
            <el-button-group class=operate-column>
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-search"
                type="success"
                :disabled="!settingNodeRowInspectEnabled(row)"
                @click="handleInspectButtonClicked(row)"
              />
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-edit"
                type="primary"
                :disabled="!settingNodeRowEditEnabled(row)"
                @click="handleEditButtonClicked(row)"
              />
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-delete"
                type="danger"
                @click="handleDeleteButtonClicked(row)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{row,index,close}">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row,close)">
                复制主键
              </li>
              <el-divider/>
              <li @click="handleInspectContextmenuClicked(row,index,close)">
                查看...
              </li>
              <li @click="handleEditContextmenuClicked(row,index,close)">
                编辑...
              </li>
              <li @click="handleDeleteContextmenuClicked(row,index,close)">
                删除...
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </border-layout-panel>
    <setting-node-init-dialog
      :visible.sync="initDialog.visible"
      @onSettingNodeInited="handleSearch"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';

import {
  inspect, reachable, idLikeReachable, operateRemove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';
import SettingNodeInitDialog from '@/views/items/settingrepo/settingNode/SettingNodeInitDialog.vue';

const SETTING_NODE_TYPE_INDICATOR = [
  { type: 0, label: '文本' },
  { type: 1, label: '长文本' },
  { type: 2, label: '图片' },
  { type: 3, label: '图片列表' },
];

export default {
  name: 'SettingNode',
  components: { SettingNodeInitDialog, TablePanel, BorderLayoutPanel },
  computed: {
    settingNodeRowInspectEnabled() {
      return (row) => SETTING_NODE_TYPE_INDICATOR.find((indicator) => indicator.type === row.type);
    },
    settingNodeRowEditEnabled() {
      return (row) => SETTING_NODE_TYPE_INDICATOR.find((indicator) => indicator.type === row.type);
    },
  },
  data() {
    return {
      loading: true,
      idSearchBar: {
        value: '',
      },
      table: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
        pageSize: 15,
      },
      initDialog: {
        visible: false,
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.idSearchBar.value !== '') {
        this.lookupIdLikeReachable();
      } else {
        this.lookupReachable();
      }
    },
    lookupReachable() {
      this.loading = true;
      resolveResponse(reachable(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(reachable(res.total_pages - 1, this.table.pageSize));
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
    lookupIdLikeReachable() {
      this.loading = true;
      resolveResponse(idLikeReachable(
        this.idSearchBar.value, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(idLikeReachable(
              this.idSearchBar.value, res.total_pages - 1, this.table.pageSize,
            ));
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
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    typeFormatter(row, column) {
      const value = row[column.property];
      const label = SETTING_NODE_TYPE_INDICATOR
        .find((indicator) => indicator.type === value)?.label;
      return label || '（未知）';
    },
    handleInspectButtonClicked(row) {
      this.forwardToEditor(row.key.string_id, 'inspect');
    },
    handleEditButtonClicked(row) {
      this.forwardToEditor(row.key.string_id, 'edit');
    },
    forwardToEditor(id, action) {
      this.$router.push({
        name: 'settingrepo.settingNodeEditor',
        query: {
          id,
          action,
        },
      });
    },
    handleDeleteButtonClicked(row) {
      this.handleDelete(row.key.string_id);
    },
    handleDelete(id) {
      Promise.resolve(id)
        .then((res) => this.$confirm('此操作将永久删除此设置节点。<br>'
          + '<div style="color: #b22222"><b>如果您不知道删除该类型后会产生什么后果，'
          + '请不要进行操作！</b></div>'
          + '<b>错误的操作可能导致前端界面、后台出错，甚至崩溃！</b><br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => {
          this.loading = true;
          return res;
        })
        .then((res) => resolveResponse(inspect(res))
          .then((settingNode) => {
            const { category, args } = settingNode;
            if (!category || !args) {
              return { id: res, invalid: true, remove: false };
            }
            return resolveResponse(operateRemove(category, args))
              .then(() => ({ id: res, invalid: false, remove: true }));
          }))
        .then((res) => {
          if (res.invalid) {
            return new Promise((resolve) => {
              setTimeout(() => {
                this.$msgbox({
                  title: '节点无效',
                  message: `节点 ${res.id} 无效，无法在该页面中删除。<br>`
                    + '请联系运维人员使用其它途径进行删除。',
                  dangerouslyUseHTMLString: true,
                  type: 'error',
                })
                  .catch(() => {
                  });
                resolve();
              }, 500);
            });
          }
          if (res.remove) {
            this.$message({
              showClose: true,
              message: `设置节点 ${res.id} 删除成功`,
              type: 'success',
              center: true,
            });
            return Promise.resolve();
          }
          return Promise.reject();
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCopyKeyContextmenuClicked(row, close) {
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
    handleInspectContextmenuClicked(row, index, close) {
      close();
      this.forwardToEditor(row.key.string_id, 'inspect');
    },
    handleEditContextmenuClicked(row, index, close) {
      close();
      this.forwardToEditor(row.key.string_id, 'edit');
    },
    handleDeleteContextmenuClicked(row, index, close) {
      close();
      this.handleDelete(row.key.string_id);
    },
    handleShowInitDialog() {
      this.initDialog.visible = true;
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.setting-node-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar >>> .el-input-group__prepend {
  padding: 0 10px;
}

.table .table-button {
  padding: 7px;
}

/*noinspection CssUnusedSymbol*/
.table >>> .contextmenu .el-divider--horizontal {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
