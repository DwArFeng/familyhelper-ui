<template>
  <div class="activity-template-participant-panel-container">
    <div class="placeholder" v-if="activityTemplateId===''">请选择活动模板</div>
    <!--suppress VueUnrecognizedDirective -->
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowEntityCreateDialog"
            >
              新建参与者
            </el-button>
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
            :page-sizes="[15,20,30,50]"
            :table-data="table.entities.data"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="103"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column
                prop="user_account"
                label="用户"
                show-tooltip-when-overflow
                width="150px"
                :formatter="accountFormatter"
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
      <el-form-item label="用户" prop="key.user_string_id">
        <account-selector
          v-if="maintainDialog.mode === 'CREATE'"
          v-model="maintainDialog.anchorEntity.key.user_string_id"
        />
        <el-input
          v-else
          v-model="maintainDialog.anchorEntity.key.user_string_id"
          readonly
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import AccountSelector from '@/views/items/systemSettings/account/AccountSelector.vue';

import {
  childForActivityTemplateDisp,
  create,
  exists,
  update,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityTemplateParticipant';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'ActivityTemplateParticipantPanel',
  components: {
    AccountSelector,
    EntityMaintainDialog,
    TablePanel,
    HeaderLayoutPanel,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
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
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('用户不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(
            this.activityTemplateId,
            this.maintainDialog.anchorEntity.key.user_string_id,
            value,
          ));
        })
        .then((res) => {
          if (res) {
            callback(new Error('该用户已经是活动参与者了哦'));
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
      accountSelector: {
        userId: '',
      },
      permissionLevelSelector: {
        permissionLevel: 1,
      },
      permissionLevelIndicators: [
        { key: 0, label: '所有者', selectable: false },
        { key: 1, label: '访客', selectable: true },
      ],
      table: {
        pageSize: 15,
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
      },
      maintainDialog: {
        loading: false,
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          key: {
            user_string_id: '',
          },
          remark: '',
        },
        createRules: {
          'key.user_string_id': [
            { validator: keyValidator, trigger: 'blur' },
          ],
        },
        editRules: {},
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
    accountFormatter(row, column) {
      const account = row[column.property];
      return `${account.display_name}(${account.key.string_id})`;
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
      this.maintainDialog.anchorEntity.key.user_string_id = entity.key.user_string_id;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handleEntityCreate() {
      resolveResponse(create(
        this.activityTemplateId,
        this.maintainDialog.anchorEntity.key.user_string_id,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '参与者创建成功',
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
        this.activityTemplateId,
        this.maintainDialog.anchorEntity.key.user_string_id,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '参与者更新成功',
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
      Promise.resolve()
        .then((res) => this.$confirm('此操作将永久删除此参与者。<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then(() => resolveResponse(remove(
          entity.key.activity_template_long_id,
          entity.key.user_string_id,
        )))
        .then(() => {
          this.$message({
            showClose: true,
            message: '提醒驱动删除成功',
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
.activity-template-participant-panel-container {
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

.table-container {
  width: 100%;
  height: 100%;
}

.table-button {
  padding: 7px
}
</style>
