<template>
  <div class="activity-data-item-selector">
    <!--suppress VueUnrecognizedDirective -->
    <el-input
      v-model="input.value"
      v-loading="input.loading"
      class="input"
      placeholder="请选择活动数据条目"
      readonly
    >
      <template v-slot:append>
        <el-button
          class="button" icon="el-icon-search" :disabled="readonly"
          @click="handleShowActivityDataItemSelectDialog"
        />
      </template>
    </el-input>
    <activity-data-item-select-dialog
      mode="ACTIVITY_TEMPLATE_DATA_INFO_CREATE_DIALOG"
      :visible.sync="activityDataItemSelectDialog.visible"
      @onDataItemConfirmButtonClicked="handleDataItemConfirmButtonClicked"
    />
  </div>
</template>

<script>
import ActivityDataItemSelectDialog
from '@/views/items/life/activityDataManagement/ActivityDataItemSelectDialog.vue';

import { inspectDisp } from '@/api/life/activityDataItem';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityDataItemSelector',
  components: { ActivityDataItemSelectDialog },
  props: {
    value: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    value(val) {
      this.watchedValue = val;
      if (val !== this.input.cachedActivityDataItemId) {
        this.updateLabel();
      }
    },
    watchedValue(val) {
      this.$emit('input', val);
    },
  },
  data() {
    return {
      watchedValue: this.value,
      input: {
        loading: false,
        cachedActivityDataItemId: '',
        value: '',
      },
      activityDataItemSelectDialog: {
        visible: false,
      },
    };
  },
  methods: {
    updateLabel() {
      if (!this.watchedValue) {
        this.input.value = '';
        return;
      }
      this.input.loading = true;
      resolveResponse(inspectDisp(this.watchedValue))
        .then((res) => {
          this.input.cachedActivityDataItemId = res.key.long_id;
          this.input.value = res.name;
        })
        .catch(() => {
        })
        .finally(() => {
          this.input.loading = false;
        });
    },
    handleShowActivityDataItemSelectDialog() {
      this.activityDataItemSelectDialog.visible = true;
    },
    handleDataItemConfirmButtonClicked(row) {
      this.input.cachedActivityDataItemId = row.key.long_id;
      this.input.value = row.name;
      this.watchedValue = row.key.long_id;
      this.activityDataItemSelectDialog.visible = false;
    },
  },
  mounted() {
    this.watchedValue = this.value;
    this.updateLabel();
  },
};
</script>

<style scoped>
.activity-data-item-selector {
  width: 220px;
}

.input {
  width: 100%;
}

.input .button {
  padding-left: 10px;
  padding-right: 10px;
}
</style>
