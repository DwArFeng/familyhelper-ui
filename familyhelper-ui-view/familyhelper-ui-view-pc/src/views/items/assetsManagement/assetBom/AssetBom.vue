<template>
  <div class="asset-bom-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="350px"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
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
      </template>
      <template v-slot:west>
        <asset-tree-panel
          ref="assetBomTreePanel"
          mode="ASSET_BOM"
          :asset-catalog-key="parentSelection.assetCatalogId"
          :read-only="readonly"
          @onCurrentChanged="handleCurrentChanged"
          @onEntityDelete="handleEntityDelete"
        />
      </template>
      <template v-slot:default>
        <item-edit-panel
          :item-id="itemEditPanel.itemId"
          :readonly="readonly"
          :upsc="itemEditPanel.upsc"
          @onItemPropertyUpdated="handleItemPropertyUpdated"
        />
      </template>
    </border-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      create-title="创建项目"
      mode="CREATE"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
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
            v-for="item in itemTypeIndicator"
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
            v-for="item in label"
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
            v-for="item in lifeCycleIndicator"
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
import AssetTreePanel from '@/views/items/assetsManagement/assetBom/AssetTreePanel.vue';
import AssetCatalogIndicator
from '@/views/items/assetsManagement/assetCatalog/AssetCatalogIndicator.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import ItemEditPanel from '@/views/items/assetsManagement/assetBom/ItemEditPanel.vue';

import {
  create, inspectDisp, remove,
  inspectDisp as inspectItem,
} from '@/api/assets/item';
import {
  all as inspectItemTypeIndicator,
} from '@/api/assets/itemTypeIndicator';
import {
  all as inspectLabel,
  allExists as allLabelExists,
} from '@/api/assets/itemLabel';
import resolveResponse from '@/util/response';

export default {
  name: 'AssetBom',
  components: {
    ItemEditPanel,
    EntityMaintainDialog,
    AssetCatalogIndicator,
    BorderLayoutPanel,
    AssetTreePanel,
  },
  computed: {
    headerButtonDisabled() {
      return this.parentSelection.assetCatalogId === '' || this.readonly;
    },
    readonly() {
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
      itemTypeIndicator: [],
      label: [],
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
      lifeCycleIndicator: [
        { key: 0, label: '准备中' },
        { key: 1, label: '使用中' },
        { key: 2, label: '禁用中' },
        { key: 3, label: '已废弃' },
      ],
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
      itemEditPanel: {
        itemId: '',
        upsc: 'ui_preference.pc.assert_management.assert_bom.item_edit_panel',
      },
    };
  },
  methods: {
    handleSearch() {
      this.handleItemTypeIndicatorSearch();
      this.handleLabelSearch();
    },
    handleItemTypeIndicatorSearch() {
      this.lookupAllItemTypeIndicator();
    },
    lookupAllItemTypeIndicator() {
      this.loading += 1;
      resolveResponse(inspectItemTypeIndicator(0, 1000))
        .then(this.updateItemTypeIndicatorView)
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateItemTypeIndicatorView(res) {
      this.itemTypeIndicator.splice(0, this.itemTypeIndicator.length);
      res.data.forEach((data) => this.itemTypeIndicator.push(data));
    },
    handleLabelSearch() {
      this.lookupAllLabel();
    },
    lookupAllLabel() {
      this.loading += 1;
      resolveResponse(inspectLabel(0, 1000))
        .then(this.updateLabelView)
        .catch(() => {
        })
        .finally(() => {
          this.loading -= 1;
        });
    },
    updateLabelView(res) {
      this.label.splice(0, this.label.length);
      res.data.forEach((data) => this.label.push(data));
    },
    handleAssetCatalogChanged(assetCatalog) {
      const oldAssertCatalogId = this.parentSelection.assetCatalogId;
      if (assetCatalog === null) {
        this.parentSelection.assetCatalog = null;
        this.parentSelection.assetCatalogId = '';
      } else {
        this.parentSelection.assetCatalog = assetCatalog;
        this.parentSelection.assetCatalogId = assetCatalog.key.long_id;
      }
      if (oldAssertCatalogId === this.parentSelection.assetCatalogId) {
        return;
      }
      this.treePanel.selection.node = null;
      this.treePanel.selection.data = null;
      this.itemEditPanel.itemId = '';
    },
    handleCurrentChanged(node, data) {
      this.treePanel.selection.node = node;
      this.treePanel.selection.data = data;

      if (data === null) {
        this.itemEditPanel.itemId = '';
        return;
      }

      this.itemEditPanel.itemId = data.key.long_id;
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
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
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
    handleItemPropertyUpdated() {
      resolveResponse(inspectItem(this.itemEditPanel.itemId))
        .then((res) => {
          this.$refs.assetBomTreePanel.update(res);
        })
        .catch(() => {
        });
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
          if (entity.key.long_id === this.itemEditPanel.itemId) {
            this.itemEditPanel.itemId = '';
          }
        })
        .catch(() => {
        });
    },
  },
  mounted() {
    this.handleSearch();
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

.asset-bom-select {
  width: 100%;
}
</style>
