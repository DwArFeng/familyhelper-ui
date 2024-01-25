<template>
  <div class="activity-template-driver-panel-container">
    <div class="placeholder" v-if="activityTemplateId===''">请选择活动模板</div>
    <!--suppress VueUnrecognizedDirective -->
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              class="item"
              type="primary"
              :disabled="readonly"
              @click="handleShowEntityCreateDialog"
            >
              新建驱动器
            </el-button>
            <el-divider direction="vertical"/>
            <el-button
              class="item"
              type="success"
              @click="handleSearch"
            >
              刷新数据
            </el-button>
            <el-divider direction="vertical"/>
            <div v-if="mode==='DEFAULT'" style="flex-grow: 1"/>
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
          <table-panel
            class="table"
            :page-size.sync="table.pageSize"
            :entity-count="parseInt(table.entities.count)"
            :current-page.sync="table.currentPage"
            :page-sizes="[10,15,20,30]"
            :table-data="table.entities.data"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="enabled"
                label="使能"
                show-tooltip-when-overflow
                :formatter="booleanFormatter"
              />
              <el-table-column
                prop="type"
                label="类型"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="param"
                label="参数"
                class-name="single-line"
              />
              <el-table-column
                prop="generate_flag"
                label="生成活动"
                :formatter="booleanFormatter"
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
    <entity-maintain-dialog
      label-width="100px"
      top="9vh"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.createRules"
      :edit-rules="maintainDialog.editRules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="maintainDialog.anchorEntity.enabled"
          active-text="是"
          inactive-text="否"
          :disabled="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="maintainDialog.anchorEntity.type"
          :readonly="maintainDialog.mode === 'INSPECT'"
        >
          <template v-slot:append>
            <el-button
              v-if="maintainDialog.mode !== 'INSPECT'"
              icon="el-icon-search"
              @click="supportDialog.visible = true"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="参数" prop="param">
        <text-editor
          class="text-editor"
          v-model="maintainDialog.anchorEntity.param"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="生成活动" prop="generate_flag">
        <el-switch
          v-model="maintainDialog.anchorEntity.generate_flag"
          active-text="是"
          inactive-text="否"
          :disabled="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <activity-template-driver-support-select-dialog
      :visible.sync="supportDialog.visible"
      @onConfirmed="handleSupportSelected"
    />
  </div>
</template>

<script>

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TextEditor from '@/components/text/TextEditor.vue';
import ActivityTemplateDriverSupportSelectDialog
from '@/views/items/life/activityTemplateDriverSupport/ActivityTemplateDriverSupportSelectDialog.vue';

import { exists as existsSupport } from '@/api/life/activityTemplateDriverSupport';
import {
  childForActivityTemplate, insert, remove, update,
} from '@/api/life/activityTemplateDriverInfo';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityTemplateDriverPanel',
  components: {
    ActivityTemplateDriverSupportSelectDialog,
    TextEditor,
    EntityMaintainDialog,
    TablePanel,
    HeaderLayoutPanel,
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
    const typeValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(existsSupport(value));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('类型不支持'));
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
      loading: false,
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
        selection: null,
        loading: false,
      },
      maintainDialog: {
        loading: false,
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          key: {
            long_id: '',
          },
          enabled: false,
          type: '',
          param: '',
          generate_flag: false,
          remark: '',
        },
        createRules: {
          type: [
            { validator: typeValidator, trigger: 'blur' },
          ],
        },
        editRules: {
          type: [
            { validator: typeValidator, trigger: 'blur' },
          ],
        },
      },
      supportDialog: {
        visible: false,
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
      this.lookupDefault();
    },
    lookupDefault() {
      this.loading = true;
      resolveResponse(
        childForActivityTemplate(
          this.activityTemplateId, this.table.currentPage, this.table.pageSize,
        ),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForActivityTemplate(
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
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value === null || value === undefined) {
        return '';
      }
      return value ? '是' : '否';
    },
    handleShowEntityCreateDialog() {
      this.showDialog('CREATE');
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('INSPECT');
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('EDIT');
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.key.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.enabled = entity.enabled;
      this.maintainDialog.anchorEntity.type = entity.type;
      this.maintainDialog.anchorEntity.param = entity.param;
      this.maintainDialog.anchorEntity.generate_flag = entity.generate_flag;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.$nextTick(() => {
        this.maintainDialog.visible = true;
      });
    },
    handleEntityCreate() {
      resolveResponse(insert(
        '',
        this.activityTemplateId,
        this.maintainDialog.anchorEntity.enabled,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.param,
        this.maintainDialog.anchorEntity.generate_flag,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '驱动器创建成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        });
    },
    handleEntityEdit() {
      resolveResponse(update(
        this.maintainDialog.anchorEntity.key.long_id,
        this.activityTemplateId,
        this.maintainDialog.anchorEntity.enabled,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.param,
        this.maintainDialog.anchorEntity.generate_flag,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '驱动器更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        });
    },
    handleEntityDelete(category, entity) {
      Promise.resolve(entity.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此驱动器。<br>'
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
            message: '驱动器删除成功',
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
    handleSupportSelected(selection) {
      this.maintainDialog.anchorEntity.type = selection.key.string_id;
      this.maintainDialog.anchorEntity.param = selection.example_param;
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
.activity-template-driver-panel-container {
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

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-button {
  padding: 7px
}

.text-editor {
  height: 300px;
}
</style>
