<template>
  <el-dialog
    class="setting-category-select-dialog-container"
    tabindex="0"
    title="选择设置分类"
    destroy-on-close
    :visible.sync="watchedVisible"
    :close-on-click-modal="false"
    @keydown.ctrl.enter.native="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel v-loading="loading" apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <el-divider direction="vertical"/>
            <el-input
              class="id-search-bar"
              v-model="idSearchBar.value"
              clearable
              @keydown.enter.native="handleSearch"
              @clear="handleSearch"
            >
              <template v-slot:prepend>
                <span>类型 ID</span>
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
            highlight-current-row
            :page-size.sync="table.pageSize"
            :entity-count="parseInt(table.entities.count)"
            :current-page.sync="table.currentPage"
            :page-sizes="[15,20,30,50]"
            :table-data="table.entities.data"
            :operate-column-visible="false"
            :table-selection.sync="table.selection"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.string_id"
                label="设置类型"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="formatter_type"
                label="格式化器类型"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="formatter_param"
                label="格式化器参数"
                class-name="single-line"
              />
              <el-table-column
                prop="remark"
                label="备注"
                show-tooltip-when-overflow
              />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </template>
    <template v-slot:footer>
      <div slot="footer">
        <el-button
          type="primary"
          :disabled="loading || table.selection === null"
          @click="handleConfirmed"
        >
          确认
        </el-button>
        <el-button
          :disabled="loading"
          @click="handleCanceled"
        >
          取消
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';

import {
  all,
  idLike,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingCategory';
import resolveResponse from '@/util/response';

export default {
  name: 'SettingCategorySelectDialog',
  components: { TablePanel, HeaderLayoutPanel },
  props: {
    visible: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    visible(value) {
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      this.$emit('update:visible', value);
    },
  },
  data() {
    return {
      watchedVisible: false,
      loading: false,
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
          selection: null,
        },
        currentPage: 0,
        pageSize: 15,
      },
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
      resolveResponse(all(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(res.total_pages - 1, this.table.pageSize));
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
      resolveResponse(idLike(
        this.idSearchBar.value, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(
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
    handleConfirmed() {
      this.$emit('onConfirmed', this.table.selection);
      this.watchedVisible = false;
    },
    handleCanceled() {
      this.watchedVisible = false;
    },
    handleHotKeyDown() {
      if (this.table.selection === null) {
        return;
      }
      this.handleConfirmed();
    },
  },
  mounted() {
    this.watchedVisible = this.visible;
    this.handleSearch();
  },
};
</script>

<style scoped>
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

.header-container .id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar >>> .el-input-group__prepend {
  padding: 0 10px;
}

.table {
  height: 450px;
}

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
