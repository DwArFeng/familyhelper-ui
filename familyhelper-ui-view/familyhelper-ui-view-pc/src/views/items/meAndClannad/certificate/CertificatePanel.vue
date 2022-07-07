<template>
  <div class="certificate-panel-container">
    <header-layout-panel class="center-panel" v-loading="loading">
      <table-panel
        :page-size.sync="table.pageSize"
        :entity-count="parseInt(table.entities.count)"
        :current-page.sync="table.currentPage"
        :page-sizes="[10,15,30,50]"
        :table-data="table.entities.data"
        :show-contextmenu="true"
        :table-selection.sync="table.selection"
        :operate-column-width="130"
        :contextmenu-width="89"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
      >
        <template v-slot:default>
          <el-table-column
            prop="owner_account.display_name"
            label="持有者"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="name"
            label="名称"
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
              @click="handleShowEntityInspectDialog($index, row)"
            />
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-edit"
              type="primary"
              :disabled="row.permission_level !== 0"
              @click="handleShowEntityEditDialog($index, row)"
            />
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-lock"
              type="primary"
              :disabled="row.permission_level !== 0"
              @click="handleItemToPermit($index, row)"
            />
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-delete"
              type="danger"
              :disabled="row.permission_level !== 0"
              @click="handleEntityDelete($index, row)"
            />
          </el-button-group>
        </template>
        <template v-slot:contextmenu="{index,row,close}">
          <ul class="my-contextmenu">
            <!--suppress JSUnresolvedVariable -->
            <li
              @click="handleInspectMenuItemClicked(index,row,close,$event)"
            >
              查看...
            </li>
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:row.permission_level !== 0}"
              @click="handleEditMenuItemClicked(index,row,close,$event)"
            >
              编辑...
            </li>
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:row.permission_level !== 0}"
              @click="handlePermitMenuItemClicked(index,row,close,$event)"
            >
              分配权限...
            </li>
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:row.permission_level !== 0}"
              @click="handleDeleteMenuItemClicked(index,row,close,$event)"
            >
              删除...
            </li>
          </ul>
        </template>
      </table-panel>
      <div class="header-container" slot="header">
        <el-button
          type="primary"
          @click="handleShowEntityRecordDialog"
        >
          创建证件
        </el-button>
        <el-button type="success" @click="handleSearch">
          刷新数据
        </el-button>
        <el-divider direction="vertical"/>
        <el-switch
          v-loading="watchedUiPreference.loading"
          v-model="watchedUiPreference.data.lookupAllPermitted"
          active-text="看所有的"
          inactive-text="看自己的"
          active-color="#409EFF"
          inactive-color="#409EFF"
          :disabled="header.switchDisabled"
          @change="handleSwitchChanged"
        />
      </div>
    </header-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="maintainDialog.anchorEntity.name"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <permit-maintain-dialog
      :visible.sync="permitMaintainDialog.visible"
      :certificate-id="permitMaintainDialog.certificateId"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import PermitMaintainDialog from '@/views/items/meAndClannad/certificate/PermitMaintainDialog.vue';

import {
  allOwnedDisp as allOwned,
  allPermittedDisp as allPermitted,
  create,
  remove,
  update,
} from '@/api/clannad/certificate';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'CertificatePanel',
  components: {
    TablePanel, EntityMaintainDialog, HeaderLayoutPanel, PermitMaintainDialog,
  },
  props: {
    uiPreference: {
      type: Object,
      default: () => null,
    },
    certificateSelection: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    uiPreference: {
      handler(value) {
        this.watchedUiPreference = value;
        this.handleSearch();
      },
      deep: true,
    },
    'table.selection': {
      handler(value) {
        this.$emit('update:certificateSelection', value);
      },
    },
  },
  data() {
    const deltaValidator = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('变更金额不能为空'));
      } else if (value === '+' || value === '-') {
        callback(new Error('请输入有效的数字'));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      watchedUiPreference: {
        loading: true,
        data: {
          lookupAllPermitted: true,
        },
      },
      header: {
        switchDisabled: false,
      },
      table: {
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
        mode: 'CREATE',
        visible: false,
        rules: {
          delta: [
            { validator: deltaValidator, trigger: 'blur' },
          ],
          change_type: [
            { required: true, message: '类型不能为空', trigger: 'change' },
          ],
        },
        anchorEntity: {
          long_id: '',
          name: '',
          remark: '',
        },
      },
      permitMaintainDialog: {
        visible: false,
        certificateId: '',
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.watchedUiPreference.data.lookupAllPermitted) {
        this.lookupAllPermitted();
      } else {
        this.lookupAllOwned();
      }
    },
    lookupAllPermitted() {
      this.loading = true;
      resolveResponse(allPermitted(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allPermitted(res.total_pages, this.table.pageSize));
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
    lookupAllOwned() {
      this.loading = true;
      resolveResponse(allOwned(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allOwned(res.total_pages, this.table.pageSize));
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
    handleEntityCreate() {
      resolveResponse(create(
        this.maintainDialog.anchorEntity.name,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '证件创建成功',
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
        this.maintainDialog.anchorEntity.long_id,
        this.maintainDialog.anchorEntity.delta,
        this.maintainDialog.anchorEntity.change_type,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '证件更新成功',
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
    handleItemToPermit(index, item) {
      Promise.resolve(item)
        .then((res) => {
          // noinspection JSUnresolvedVariable
          if (res.permission_level !== 0) {
            this.$alert('您不是此证件的所有者，无权分配该证件点权限！', '权限不足', {
              confirmButtonText: '确定',
              type: 'warning',
              customClass: 'custom-message-box__w500',
            });
            return Promise.reject();
          }
          return Promise.resolve(res.key.long_id);
        }).then(() => {
          this.permitMaintainDialog.certificateId = item.key.long_id;
          this.permitMaintainDialog.visible = true;
        }).catch(() => {
        });
    },
    handleEntityDelete(index, entity) {
      this.$confirm('此操作将永久删除此条证件。<br>是否继续?',
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
            message: '证件删除成功',
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
    handleShowEntityRecordDialog() {
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
      this.maintainDialog.anchorEntity.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.name = entity.name;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handleInspectMenuItemClicked(index, row, close) {
      close();
      this.handleShowEntityInspectDialog(index, row);
    },
    handleEditMenuItemClicked(index, row, close, event) {
      if (row.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleShowEntityEditDialog(index, row);
    },
    handlePermitMenuItemClicked(index, row, close, event) {
      if (row.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleItemToPermit(index, row);
    },
    handleDeleteMenuItemClicked(index, row, close, event) {
      if (row.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleEntityDelete(index, row);
    },
    handleSwitchChanged() {
      // 刷新数据。
      this.handleSearch();
      // 广播事件。
      this.$emit('update:uiPreference', this.watchedUiPreference);
      // 防抖。
      this.header.switchDisabled = true;
      setTimeout(() => {
        this.header.switchDisabled = false;
      }, 1000);
    },
  },
};
</script>

<style scoped>
.certificate-panel-container {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.el-divider--vertical {
  margin: 0 8px;
}

.table-button {
  padding: 7px
}

.my-contextmenu {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.my-contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
  user-select: none;
}

.my-contextmenu li:hover {
  background: #eee;
}

.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}

.center-panel {
  width: 100%;
  height: 100%;
}
</style>
