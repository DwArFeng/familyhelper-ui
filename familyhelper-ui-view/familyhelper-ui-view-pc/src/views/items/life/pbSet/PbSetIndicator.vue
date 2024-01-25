<template>
  <div class="pb-set-indicator-container">
    <el-input
      v-loading="loading"
      class="indicator"
      v-model="displayValue"
      readonly
    >
      <template v-slot:prepend>
        <span>当前个人最佳集合</span>
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
    <pb-set-select-dialog
      :mode="mode"
      :visible.sync="dialogVisible"
      @onConfirm="handleConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import PbSetSelectDialog
from '@/views/items/life/pbSet/PbSetSelectDialog.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/settingNode';
import { exists, inspectDisp } from '@/api/life/pbSet';

import resolveResponse from '@/util/response';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';

const SETTINGREPO_CATEGORY_ID = 'life.default_pb_set';

// noinspection JSAnnotator
export default {
  name: 'PbSetIndicator',
  components: { PbSetSelectDialog },
  props: {
    mode: {
      type: String,
      validator(value) {
        return [
          'PB_MANAGEMENT', 'DEFAULT',
        ].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  computed: {
    pbSetId() {
      if (this.pbSet === null) {
        return '';
      }
      return this.pbSet.key.long_id;
    },
    displayValue() {
      if (this.pbSet === null) {
        return '（未选择个人最佳集合）';
      }
      return this.pbSet.name;
    },
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      pbSet: null,
      dialogVisible: false,
      loading: false,
    };
  },
  methods: {
    handleShowDialog() {
      this.dialogVisible = true;
    },
    handleConfirmed(pbSet, setDefault) {
      this.pbSet = pbSet;
      this.$emit('change', pbSet);
      if (!setDefault) {
        return;
      }
      resolveResponse(operatePut(
        SETTINGREPO_CATEGORY_ID,
        [this.me],
        this.pbSetId,
        `更新时间: ${formatTimestamp(currentTimestamp())}`,
      ))
        .catch(() => {
        });
    },
    fetchSettingrepo() {
      this.loading = true;
      resolveResponse(operateInspect(SETTINGREPO_CATEGORY_ID, [this.me]))
        .then((res) => {
          if (res === null) {
            this.pbSet = null;
            return Promise.reject();
          }
          return Promise.resolve(res.value);
        })
        .then((res) => resolveResponse(exists(res))
          .then((existsFlag) => {
            if (existsFlag) {
              return Promise.resolve(res);
            }
            this.pbSet = null;
            return Promise.reject();
          }))
        .then((res) => resolveResponse(inspectDisp(res)))
        .then((res) => {
          this.pbSet = res;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
          this.$emit('change', this.pbSet);
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

.button-group{
  display: flex;
}

.button-group .button{
  padding-left: 10px;
  padding-right: 10px;
}
</style>
