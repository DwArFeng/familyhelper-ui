<template>
  <div class="project-indicator-container">
    <el-input
      v-loading="loading"
      class="indicator"
      v-model="displayValue"
      readonly
    >
      <span slot="prepend">当前工程</span>
      <el-button-group class="button-group" slot="append">
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
    </el-input>
    <project-select-dialog
      :mode="mode"
      :visible.sync="dialogVisible"
      @onConfirm="handleConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ProjectSelectDialog
from '@/views/items/projectHelper/project/ProjectSelectDialog.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/settingNode';
import { exists, inspectDisp } from '@/api/project/project';

import resolveResponse from '@/util/response';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';

const SETTINGREPO_CATEGORY_ID = 'project_helper.default_project';

// noinspection JSAnnotator
export default {
  name: 'ProjectIndicator',
  components: { ProjectSelectDialog },
  props: {
    mode: {
      type: String,
      validator(value) {
        return ['TASK_VIEW', 'DEFAULT'].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  computed: {
    projectId() {
      if (this.project === null) {
        return '';
      }
      return this.project.key.long_id;
    },
    displayValue() {
      if (this.project === null) {
        return '（未选择工程）';
      }
      return this.project.name;
    },
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      project: null,
      dialogVisible: false,
      loading: false,
    };
  },
  methods: {
    handleShowDialog() {
      this.dialogVisible = true;
    },
    handleConfirmed(project, setDefault) {
      this.project = project;
      this.$emit('change', project);
      if (!setDefault) {
        return;
      }
      resolveResponse(operatePut(
        SETTINGREPO_CATEGORY_ID,
        [this.me],
        this.projectId,
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
            this.project = null;
            return Promise.reject();
          }
          return Promise.resolve(res.value);
        })
        .then((res) => resolveResponse(exists(res))
          .then((existsFlag) => {
            if (existsFlag) {
              return Promise.resolve(res);
            }
            this.project = null;
            return Promise.reject();
          }))
        .then((res) => resolveResponse(inspectDisp(res)))
        .then((res) => {
          this.project = res;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
          this.$emit('change', this.project);
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
  width: 360px;
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
