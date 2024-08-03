<template>
  <div class="node-overlook-panel-container">
    <div class="placeholder" v-if="nodeId===''">请选择节点</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowEditDialog"
            >
              编辑属性
            </el-button>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
          </div>
        </template>
        <template v-slot:default>
          <title-layout-panel class="property-container" title="属性" bordered>
            <overlay-scrollbars class="scroll-bar">
              <el-form
                class="property-form"
                label-position="left"
                label-width="80px"
                inline
                :model="node"
              >
                <el-form-item label="名称" style="width: 100%">
                  {{ node.name }}
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  {{ node.remark }}
                </el-form-item>
              </el-form>
            </overlay-scrollbars>
          </title-layout-panel>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      label-width="100px"
      edit-title="编辑节点"
      mode="EDIT"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="maintainDialog.anchorEntity.name" placeholder="必填"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="maintainDialog.anchorEntity.remark"/>
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import { inspectDisp as inspect, update } from '@/api/note/noteNode';
import resolveResponse from '@/util/response';

export default {
  name: 'NodeOverlookPanel',
  components: { EntityMaintainDialog, TitleLayoutPanel, HeaderLayoutPanel },
  props: {
    nodeId: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    nodeId() {
      this.handleSearch();
    },
  },
  data() {
    return {
      loading: false,
      node: {
        parent_long_id: '',
        name: '',
        remark: '',
      },
      maintainDialog: {
        loading: false,
        visible: false,
        anchorEntity: {
          parent_long_id: '',
          name: '',
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
        },
      },
    };
  },
  methods: {
    handleSearch() {
      if (this.nodeId === '') {
        return;
      }
      this.inspectEntity();
    },
    inspectEntity() {
      this.loading = true;
      resolveResponse(inspect(this.nodeId))
        .then(this.updateEntityView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateEntityView(res) {
      if (res.parent_key === null) {
        this.node.parent_long_id = '';
      } else {
        this.node.parent_long_id = res.parent_key.long_id;
      }
      this.node.name = res.name;
      this.node.remark = res.remark;
    },
    handleShowEditDialog() {
      this.syncAnchorEntity();
      this.showDialog();
    },
    syncAnchorEntity() {
      this.maintainDialog.anchorEntity.parent_long_id = this.node.parent_long_id;
      this.maintainDialog.anchorEntity.name = this.node.name;
      this.maintainDialog.anchorEntity.remark = this.node.remark;
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.nodeId,
        this.maintainDialog.anchorEntity.parent_long_id,
        this.maintainDialog.anchorEntity.name,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '节点更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.maintainDialog.visible = false;
          this.$emit('onNodePropertyUpdated');
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.node-overlook-panel-container {
  width: 100%;
  height: 100%;
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

.property-container {
  height: 100%;
  width: 100%;
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-container .property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.property-container .property-form >>> textarea {
  padding: 0;
  border: none;
  font: unset;
  font-size: 14px;
  color: #303133;
}
</style>
