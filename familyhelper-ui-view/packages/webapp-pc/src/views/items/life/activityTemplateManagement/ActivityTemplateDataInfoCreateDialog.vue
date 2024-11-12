<template>
  <div class="activity-template-data-info-create-dialog-container">
    <activity-data-item-select-dialog
      mode="ACTIVITY_TEMPLATE_DATA_INFO_CREATE_DIALOG"
      :visible.sync="watchedVisible"
      @onDataItemConfirmButtonClicked="handleDataItemConfirmButtonClicked"
    />
    <entity-maintain-dialog
      mode="CREATE"
      create-title="补充数据信息"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
    >
      <el-form-item label="初始值" prop="initial_value">
        <el-input-number
          v-model="maintainDialog.anchorEntity.initial_value"
          :precision="2"
          :step="1"
        />
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
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import ActivityDataItemSelectDialog
from '@/views/items/life/activityDataManagement/ActivityDataItemSelectDialog.vue';

import {
  create,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityTemplateDataInfo';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityTemplateDataInfoCreateDialog',
  components: {
    ActivityDataItemSelectDialog,
    EntityMaintainDialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: () => false,
    },
    activityTemplateId: {
      type: String,
      default: '',
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
      maintainDialog: {
        loading: false,
        visible: false,
        anchorEntity: {
          activity_data_item_id: '',
          remark: '',
          initial_value: 0,
        },
      },
    };
  },
  methods: {
    handleDataItemConfirmButtonClicked(row) {
      this.syncAnchorEntity(row);
      this.showEntityMaintainDialog();
    },
    syncAnchorEntity(row) {
      this.maintainDialog.anchorEntity.activity_data_item_id = row.key.long_id;
    },
    showEntityMaintainDialog() {
      this.maintainDialog.visible = true;
    },
    handleEntityCreate() {
      this.maintainDialog.loading = true;
      resolveResponse(create(
        this.activityTemplateId,
        this.maintainDialog.anchorEntity.activity_data_item_id,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.initial_value,
      )).then(() => {
        this.$message({
          showClose: true,
          message: '活动模板数据信息创建成功',
          type: 'success',
          center: true,
        });
      })
        .then(() => {
          this.$emit('onEntityCreate');
          this.maintainDialog.visible = false;
          return Promise.resolve();
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
  },
};
</script>

<style scoped>
</style>
