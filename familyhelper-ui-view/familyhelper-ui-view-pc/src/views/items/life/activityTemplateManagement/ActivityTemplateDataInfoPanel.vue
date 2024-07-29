<template>
  <div class="activity-template-data-panel-container">
    <div class="placeholder" v-if="activityTemplateId===''">请选择活动模板</div>
    <!--suppress VueUnrecognizedDirective -->
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleCreateButtonClicked"
            >
              新建数据信息
            </el-button>
            <el-divider direction="vertical"/>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <div style="flex-grow: 1"/>
            <el-button
              class="icon-button"
              v-if="mode==='DEFAULT'"
              type="info"
              @click="handlePanelFloatyButtonClicked"
            >
              <i class="iconfont">&#xffd3;</i>
            </el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table-container"
            :page-size.sync="table.pageSize"
            :entity-count="parseInt(table.entities.count)"
            :current-page.sync="table.currentPage"
            :page-sizes="[10,20,30,50]"
            :table-data="table.entities.data"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="activity_data_item.name"
                label="数据项名称"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="initial_value"
                label="初始值"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="remark"
                label="备注"
                show-tooltip-when-overflow
              />
            </template>
            <template v-slot:operateColumn="{$index,row}">
              <el-button-group class=operate-column>
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-search"
                  type="success"
                  @click="handleShowEntityInspectDialog($index,row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  :disabled="readonly"
                  @click="handleShowEntityEditDialog($index,row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  :disabled="readonly"
                  @click="handleEntityDelete($index,row)"
                />
              </el-button-group>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <activity-template-data-info-create-dialog
      :visible.sync="activityDataSelectDialog.visible"
      :activity-template-id="activityTemplateId"
      @onEntityCreate="handleSearch"
    />
    <entity-maintain-dialog
      :loading="maintainDialog.loading"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="初始值" prop="initial_value">
        <el-input
          v-if="maintainDialog.mode==='INSPECT'"
          v-model="maintainDialog.anchorEntity.initial_value"
          readonly
        />
        <el-input-number
          v-else
          v-model="maintainDialog.anchorEntity.initial_value"
          :precision="2"
          :step="1"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode==='INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import ActivityTemplateDataInfoCreateDialog
from '@/views/items/life/activityTemplateManagement/ActivityTemplateDataInfoCreateDialog.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import { childForActivityTemplateDisp, remove, update } from '@/api/life/activityTemplateDataInfo';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityTemplateDataInfoPanel',
  components: {
    EntityMaintainDialog, TablePanel, ActivityTemplateDataInfoCreateDialog, HeaderLayoutPanel,
  },
  props: {
    activityTemplateId: {
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
  watch: {
    activityTemplateId() {
      this.handleSearch();
    },
  },
  data() {
    return {
      loading: false,
      activityDataSelectDialog: {
        visible: false,
      },
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
      },
      maintainDialog: {
        loading: false,
        mode: 'EDIT',
        visible: false,
        anchorEntity: {
          long_id: '',
          remark: '',
          initial_value: 0,
        },
        rules: {
          name: [
            { required: true, message: '账本名称不能为空', trigger: 'blur' },
          ],
        },
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.activityTemplateId === '') {
        return;
      }
      this.lookupChildForActivityTemplate();
    },
    lookupChildForActivityTemplate() {
      this.loading = true;
      resolveResponse(childForActivityTemplateDisp(
        this.activityTemplateId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForActivityTemplateDisp(
              this.activityTemplateId, res.total_pages - 1, this.table.pageSize,
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
    handleCreateButtonClicked() {
      this.activityDataSelectDialog.visible = true;
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showEntityMaintainDialog('INSPECT');
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showEntityMaintainDialog('EDIT');
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.remark = entity.remark;
      this.maintainDialog.anchorEntity.initial_value = entity.initial_value;
    },
    showEntityMaintainDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.maintainDialog.anchorEntity.long_id,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.initial_value,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.maintainDialog.visible = false;
          this.handleSearch();
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
    handleEntityDelete(index, entity) {
      Promise.resolve(entity.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此数据信息。<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(res)).then(() => res))
        .then(() => {
          this.$message({
            showClose: true,
            message: '删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.activity-template-data-panel-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
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
  padding-left: 12px;
  padding-right: 12px;
}

.table-container {
  width: 100%;
  height: 100%;
}

.table-button {
  padding: 7px
}
</style>
