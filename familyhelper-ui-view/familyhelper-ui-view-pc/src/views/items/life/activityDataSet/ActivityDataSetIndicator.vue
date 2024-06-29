<template>
  <div class="activity-data-set-container">
    <el-input
      v-loading="loading"
      class="indicator"
      v-model="displayValue"
      readonly
    >
      <template v-slot:prepend>
        <span>当前数据集</span>
      </template>
      <template v-slot:append>
        <el-button-group class="button-group">
          <el-button
            class="button"
            icon="el-icon-search"
            @click="handleShowDialog"
          />
          <el-button
            class="button"
            icon="el-icon-refresh"
            @click="fetchSettingrepo"
          />
        </el-button-group>
      </template>
    </el-input>
    <activity-data-set-select-dialog
      :mode="mode"
      :visible.sync="dialogVisible"
      @onConfirm="handleConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ActivityDataSetSelectDialog
from '@/views/items/life/activityDataSet/ActivityDataSetSelectDialog.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/textNode';
import { exists, inspectDisp } from '@/api/life/activityDataSet';

import resolveResponse from '@/util/response';

const SETTINGREPO_CATEGORY_ID = 'life.default_activity_data_set';

// noinspection JSAnnotator
export default {
  name: 'ActivityDataSetIndicator',
  components: { ActivityDataSetSelectDialog },
  props: {
    mode: {
      type: String,
      validator(value) {
        return [
          'ACTIVITY_DATA_MANAGEMENT', 'ACTIVITY_DATA_ITEM_SELECT_DIALOG', 'DEFAULT',
        ].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  computed: {
    activityDataSetId() {
      if (this.activityDataSet === null) {
        return '';
      }
      return this.activityDataSet.key.long_id;
    },
    displayValue() {
      if (this.activityDataSet === null) {
        return '（未选择数据集合）';
      }
      return this.activityDataSet.name;
    },
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      activityDataSet: null,
      dialogVisible: false,
      loading: false,
    };
  },
  methods: {
    handleShowDialog() {
      this.dialogVisible = true;
    },
    handleConfirmed(activityDataSet, setDefault) {
      this.activityDataSet = activityDataSet;
      this.$emit('change', activityDataSet);
      if (!setDefault) {
        return;
      }
      resolveResponse(operatePut(
        SETTINGREPO_CATEGORY_ID,
        [this.me],
        this.activityDataSetId,
      ))
        .catch(() => {
        });
    },
    fetchSettingrepo() {
      this.loading = true;
      resolveResponse(operateInspect(SETTINGREPO_CATEGORY_ID, [this.me]))
        .then((res) => {
          if (res === null) {
            this.activityDataSet = null;
            return Promise.reject();
          }
          return Promise.resolve(res.value);
        })
        .then((res) => resolveResponse(exists(res))
          .then((existsFlag) => {
            if (existsFlag) {
              return Promise.resolve(res);
            }
            this.activityDataSet = null;
            return Promise.reject();
          }))
        .then((res) => resolveResponse(inspectDisp(res)))
        .then((res) => {
          this.activityDataSet = res;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
          this.$emit('change', this.activityDataSet);
        });
    },
  },
  mounted() {
    this.fetchSettingrepo();
  },
};
</script>

<style scoped>
.indicator {
  width: 420px;
}

/*noinspection CssUnusedSymbol*/
.indicator >>> .el-input__inner {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.indicator >>> .el-input-group__prepend {
  padding: 0 10px;
}

.button-group {
  display: flex;
}

.button-group .button {
  padding-left: 10px;
  padding-right: 10px;
}
</style>
