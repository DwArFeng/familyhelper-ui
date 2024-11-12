<template>
  <div class="item-overlook-panel-container">
    <div class="placeholder" v-if="itemId===''">请选择项目</div>
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
            <div style="flex-grow: 1"/>
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
          <title-layout-panel class="property-container" title="属性" bordered>
            <overlay-scrollbars class="scroll-bar">
              <el-form
                class="property-form"
                label-position="left"
                label-width="80px"
                inline
                :model="item"
              >
                <el-form-item label="名称" style="width: 33%">
                  {{ item.name }}
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  {{ item.remark }}
                </el-form-item>
                <el-form-item label="记录计数" style="width: 33%">
                  {{ item.record_count }}
                </el-form-item>
                <el-form-item label="求和" style="width: 33%">
                  {{ item.sum }}
                </el-form-item>
                <el-form-item label="平均数" style="width: 34%">
                  {{ item.avg }}
                </el-form-item>
                <el-form-item label="最大值" style="width: 33%">
                  {{ item.max }}
                </el-form-item>
                <el-form-item label="最小值" style="width: 64%">
                  {{ item.min }}
                </el-form-item>
                <el-form-item label="最早时间" style="width: 33%">
                  {{ item.earliest_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="最晚时间" style="width: 33%">
                  {{ item.latest_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="持续时间" style="width: 34%">
                  {{ item.duration|durationFilter }}
                </el-form-item>
              </el-form>
            </overlay-scrollbars>
          </title-layout-panel>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      label-width="100px"
      edit-title="编辑项目"
      mode="EDIT"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="maintainDialog.anchorEntity.name" placeholder="必填"/>
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

import {
  inspectDisp as inspect,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityDataItem';
import resolveResponse from '@/util/response';
import { formatDuration, formatTimestamp } from '@/util/timestamp';

export default {
  name: 'ItemOverlookPanel',
  components: { EntityMaintainDialog, TitleLayoutPanel, HeaderLayoutPanel },
  props: {
    itemId: {
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
    itemId() {
      this.handleSearch();
    },
  },
  filters: {
    timestampFilter(value) {
      if (value === '') {
        return '';
      }
      return formatTimestamp(value);
    },
    durationFilter(value) {
      if (value === '') {
        return '';
      }
      return formatDuration(value);
    },
  },
  data() {
    return {
      loading: false,
      item: {
        node_long_id: '',
        name: '',
        remark: '',
        record_count: 0,
        sum: 0,
        avg: 0,
        max: 0,
        min: 0,
        earliest_date: '',
        latest_date: '',
        duration: 0,
      },
      maintainDialog: {
        loading: false,
        visible: false,
        anchorEntity: {
          node_long_id: '',
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
      if (this.itemId === '') {
        return;
      }
      this.inspectEntity();
    },
    inspectEntity() {
      this.loading = true;
      resolveResponse(inspect(this.itemId))
        .then(this.updateEntityView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateEntityView(res) {
      if (res.node_key === null) {
        this.item.node_long_id = '';
      } else {
        this.item.node_long_id = res.node_key.long_id;
      }
      this.item.name = res.name;
      this.item.remark = res.remark;
      this.item.record_count = res.record_count;
      this.item.sum = res.sum;
      this.item.avg = res.avg;
      this.item.max = res.max;
      this.item.min = res.min;
      this.item.earliest_date = res.earliest_date;
      this.item.latest_date = res.latest_date;
      this.item.duration = res.duration;
    },
    handleShowEditDialog() {
      this.syncAnchorEntity();
      this.showDialog();
    },
    syncAnchorEntity() {
      this.maintainDialog.anchorEntity.node_long_id = this.item.node_long_id;
      this.maintainDialog.anchorEntity.name = this.item.name;
      this.maintainDialog.anchorEntity.remark = this.item.remark;
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.itemId,
        this.maintainDialog.anchorEntity.node_long_id,
        this.maintainDialog.anchorEntity.name,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '项目更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.maintainDialog.visible = false;
          this.$emit('onItemPropertyUpdated');
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
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
.item-overlook-panel-container {
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

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  padding: 11px;
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
