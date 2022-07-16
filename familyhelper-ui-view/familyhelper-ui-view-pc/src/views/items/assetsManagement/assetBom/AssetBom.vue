<template>
  <div class="asset-bom-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:default>
        <div class="placeholder" v-if="treePanel.selection.data.key.long_id === ''">
          请选择项目
        </div>
        <el-tabs
          class="asset-tabs"
          tab-position="left"
          v-model="assetTabs.activeName"
          v-else
        >
          <el-tab-pane label="信息" name="info">
            <info-tab-panel
              ref="infoTabPanel"
              :item-id="assetTabs.itemId"
              :read-only="readOnly"
              @onEntityEdit="handleShowEntityEditDialog"
            />
          </el-tab-pane>
          <el-tab-pane label="资料" name="file">
            <file-tab-panel :item-id="assetTabs.itemId" :read-only="readOnly"/>
          </el-tab-pane>
          <el-tab-pane label="参数" name="params">
            <params-tab-panel/>
          </el-tab-pane>
        </el-tabs>
      </template>
      <asset-bom-tree-panel
        class="tree-container"
        slot="west"
        ref="assetBomTreePanel"
        mode="ASSET_BOM"
        :asset-catalog-key="parentSelection.assetCatalogId"
        :read-only="readOnly"
        @onCurrentChanged="handleCurrentChanged"
        @onEntityDelete="handleEntityDelete"
      />
      <div class="header-container" slot="header">
        <el-button
          class="header-button"
          type="primary"
          :disabled="headerButtonDisabled"
          @click="handleShowEntityCreateDialogParent"
        >
          新建项目
        </el-button>
        <el-button
          class="header-button"
          type="primary"
          :disabled="headerButtonDisabled"
          @click="handleShowEntityCreateDialogChild"
        >
          新建子项目
        </el-button>
        <el-divider direction="vertical"/>
        <asset-catalog-indicator mode="ASSET_BOM" @change="handleAssetCatalogChanged"/>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      inspect-title="查看项目"
      create-title="创建项目"
      edit-title="编辑项目"
      :visible.sync="maintainDialog.visible"
      :mode="maintainDialog.mode"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="maintainDialog.anchorEntity.name"
          placeholder="必填"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          class='asset-bom-select'
          v-model="maintainDialog.anchorEntity.type"
          placeholder="请选择"
        >
          <el-option
            v-for="item in typeIndicator.entities.data"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签" prop="label_keys">
        <el-select
          class='asset-bom-select'
          v-model="maintainDialog.anchorEntity.label_keys"
          placeholder="请选择"
          multiple
        >
          <el-option
            v-for="item in label.entities.data"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生命周期" prop="life_cycle">
        <el-select
          class='asset-bom-select'
          v-model="maintainDialog.anchorEntity.life_cycle"
          placeholder="请选择"
        >
          <el-option
            v-for="item in lifeCycle.entities.data"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import AssetBomTreePanel from '@/views/items/assetsManagement/assetBom/AssetBomTreePanel.vue';
import InfoTabPanel from '@/views/items/assetsManagement/assetBom/InfoTabPanel.vue';
import ParamsTabPanel from '@/views/items/assetsManagement/assetBom/ParamsTabPanel.vue';
import FileTabPanel from '@/views/items/assetsManagement/assetBom/FileTabPanel.vue';
import AssetCatalogIndicator
from '@/views/items/assetsManagement/assetCatalog/AssetCatalogIndicator.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import resolveResponse from '@/util/response';
import {
  create, inspectDisp, remove, update,
} from '@/api/assets/item';
import { all as allTypeIndicator } from '@/api/assets/itemTypeIndicator';
import { all as allLabel, allExists as allLabelExists } from '@/api/assets/itemLabel';

export default {
  name: 'AssetBom',
  components: {
    EntityMaintainDialog,
    AssetCatalogIndicator,
    FileTabPanel,
    ParamsTabPanel,
    InfoTabPanel,
    BorderLayoutPanel,
    AssetBomTreePanel,
  },
  computed: {
    headerButtonDisabled() {
      return this.parentSelection.assetCatalogId === '' || this.readOnly;
    },
    readOnly() {
      if (this.parentSelection.assetCatalog === null) {
        return true;
      }
      return this.parentSelection.assetCatalog.permission_level === 1;
    },
  },
  data() {
    const labelExistsValidator = (rule, value, callback) => {
      if (value === [] || value === null || value === undefined) {
        callback();
        return;
      }
      const keys = value.map((key) => ({ string_id: key }));
      resolveResponse(allLabelExists(keys))
        .then((res) => {
          if (!res) {
            callback(new Error('至少一个标签不存在'));
          } else {
            callback();
          }
        })
        .catch(() => {
          callback(new Error('通信故障'));
        });
    };
    return {
      parentSelection: {
        assetCatalogId: '',
        assetCatalog: null,
      },
      maintainDialog: {
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          long_id: '',
          parent_long_id: '',
          name: '',
          label_keys: [],
          type: '',
          life_cycle: '',
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
          label_keys: [
            { validator: labelExistsValidator, trigger: 'blur' },
          ],
          type: [
            { required: true, message: '类型不能为空', trigger: 'blur' },
          ],
          life_cycle: [
            { required: true, message: '生命周期不能为空', trigger: 'blur' },
          ],
        },
        loading: false,
      },
      typeIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      label: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      lifeCycle: {
        entities: {
          data: [
            { key: 0, label: '准备中' },
            { key: 1, label: '使用中' },
            { key: 2, label: '禁用中' },
            { key: 3, label: '已废弃' },
          ],
        },
      },
      treePanel: {
        selection: {
          node: null,
          data: {
            key: {
              long_id: '',
            },
            parent_key: null,
            has_no_child: true,
          },
        },
        appendChild: false,
      },
      assetTabs: {
        activeName: 'info',
        itemId: '',
      },
    };
  },
  methods: {
    handleTypeIndicatorSearch() {
      this.lookupAllTypeIndicator();
    },
    lookupAllTypeIndicator() {
      resolveResponse(allTypeIndicator(0, 1000))
        .then(this.updateTypeIndicatorObject)
        .catch(() => {
        });
    },
    updateTypeIndicatorObject(res) {
      this.typeIndicator.entities = res;
    },
    handleLabelSearch() {
      this.lookupAllLabel();
    },
    lookupAllLabel() {
      resolveResponse(allLabel(0, 1000))
        .then(this.updateLabelObject)
        .catch(() => {
        });
    },
    updateLabelObject(res) {
      this.label.entities = res;
    },
    handleAssetCatalogChanged(assetCatalog) {
      this.parentSelection.assetCatalog = assetCatalog;
      this.parentSelection.assetCatalogId = assetCatalog.key.long_id;
    },
    handleCurrentChanged(node, data) {
      this.treePanel.selection.node = node;
      this.treePanel.selection.data = data;
      this.assetTabs.itemId = data.key.long_id;
      this.syncAnchorEntity(data);
    },
    handleShowEntityCreateDialogParent() {
      this.treePanel.appendChild = false;
      // noinspection JSIncompatibleTypesComparison
      if (this.treePanel.selection.data.parent_key === null) {
        this.maintainDialog.anchorEntity.parent_long_id = '';
      } else {
        this.maintainDialog.anchorEntity.parent_long_id = this
          .treePanel.selection.data.parent_key.long_id;
      }
      this.showDialog('CREATE');
    },
    handleShowEntityCreateDialogChild() {
      this.treePanel.appendChild = true;
      this.maintainDialog.anchorEntity.parent_long_id = this.treePanel.selection.data.key.long_id;
      this.showDialog('CREATE');
    },
    handleShowEntityEditDialog() {
      this.showDialog('EDIT');
    },
    handleEntityDelete(node, entity, accept) {
      this.$confirm('此操作将永久删除此项目，此项目的子项目将会一同被删除。<br>'
        + '<b>此操作不可恢复</b><br>'
        + '是否继续?',
      '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      }).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(remove(entity.key.long_id)))
        .then(() => {
          accept();
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: `项目 ${entity.name} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .then(this.resetTreeView)
        .catch(() => {
        });
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.long_id = entity.key.long_id;
      if (entity.parent_key === null) {
        this.maintainDialog.anchorEntity.parent_long_id = '';
      } else {
        this.maintainDialog.anchorEntity.parent_long_id = entity.parent_key.long_id;
      }
      this.maintainDialog.anchorEntity.name = entity.name;
      this.maintainDialog.anchorEntity.label_keys = entity.label_keys.map((key) => key.string_id);
      // noinspection JSUnresolvedVariable
      this.maintainDialog.anchorEntity.type = entity.item_type;
      this.maintainDialog.anchorEntity.life_cycle = entity.life_cycle;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.$nextTick(() => {
        this.maintainDialog.visible = true;
      });
    },
    resetTreeView() {
      this.treeData = [];
      this.treeSelection = {
        node: null,
        data: {
          key: {
            long_id: '',
          },
          parent_key: null,
          has_no_child: true,
        },
      };
      this.inspectRoot();
      return Promise.resolve();
    },
    handleEntityCreate() {
      this.maintainDialog.loading = true;
      resolveResponse(create(
        this.parentSelection.assetCatalogId,
        this.maintainDialog.anchorEntity.parent_long_id,
        this.maintainDialog.anchorEntity.label_keys,
        this.maintainDialog.anchorEntity.name,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.life_cycle,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `项目 ${this.maintainDialog.anchorEntity.name} 创建成功`,
            type: 'success',
            center: true,
          });
          return res;
        })
        .then((res) => resolveResponse(inspectDisp(res.long_id)))
        .then((res) => {
          const parentId = this.maintainDialog.anchorEntity.parent_long_id;
          if (parentId === '') {
            this.$refs.assetBomTreePanel.appendRoot(res);
          } else {
            const { node } = this.treePanel.selection;
            if (this.treePanel.appendChild) {
              this.$refs.assetBomTreePanel.append(node, res);
              this.$set(node, 'isLeaf', false);
            } else {
              this.$refs.assetBomTreePanel.insertAfter(node, res);
            }
          }
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.maintainDialog.anchorEntity.long_id,
        this.maintainDialog.anchorEntity.parent_long_id,
        this.maintainDialog.anchorEntity.label_keys,
        this.maintainDialog.anchorEntity.name,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.life_cycle,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `项目 ${this.maintainDialog.anchorEntity.name} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => resolveResponse(inspectDisp(this.maintainDialog.anchorEntity.long_id)))
        .then((res) => {
          this.$refs.assetBomTreePanel.update(res);
          this.$refs.infoTabPanel.updateView();
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
  },
  mounted() {
    this.handleTypeIndicatorSearch();
    this.handleLabelSearch();
  },
};
</script>

<style scoped>
.asset-bom-container {
  width: 100%;
  height: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.tree-container {
  width: calc(25vw - 230px - 20px + 80px);
  height: 100%;
}

.asset-bom-select {
  width: 100%;
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

.asset-tabs {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.asset-tabs >>> .el-tabs__content {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.asset-tabs >>> .el-tab-pane {
  height: 100%;
}
</style>
