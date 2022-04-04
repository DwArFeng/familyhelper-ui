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
    <item-maintain-dialog
      v-model="maintainDialog.anchorEntity"
      :visible.sync="maintainDialog.visible"
      :mode="maintainDialog.mode"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    />
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
import ItemMaintainDialog from '@/views/items/assetsManagement/assetBom/ItemMaintainDialog.vue';

import resolveResponse from '@/util/response';
import {
  create, inspectDisp, remove, update,
} from '@/api/assets/item';

export default {
  name: 'AssetBom',
  components: {
    ItemMaintainDialog,
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
          this.syncAnchorEntity(res);
        })
        .then(() => {
          this.$refs.infoTabPanel.updateView();
        })
        .then(() => {
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        });
    },
  },
};
</script>

<style scoped>
.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.asset-bom-container {
  width: 100%;
  height: 100%;
}

.tree-container {
  width: calc(25vw - 230px - 20px + 80px);
  height: 100%;
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
