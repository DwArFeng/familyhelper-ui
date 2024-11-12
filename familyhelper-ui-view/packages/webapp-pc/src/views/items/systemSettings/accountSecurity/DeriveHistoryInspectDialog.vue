<template>
  <el-dialog
    class="derive-history-inspect-dialog-container"
    ref="dialog"
    tabindex="0"
    append-to-body
    destroy-on-close
    title="登录历史详情"
    top="8vh"
    :visible.sync="watchedVisible"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="body-wrapper" v-loading="loading">
      <overlay-scrollbars class="scroll-bar">
        <el-divider content-position="left">基本信息</el-divider>
        <el-form
          class="property-form"
          label-position="left"
          label-width="80px"
          inline
        >
          <el-form-item label="登录日期" style="width: 33%">
            {{ deriveHistory.happened_date|timestampFilter }}
          </el-form-item>
          <el-form-item label="登录响应" style="width: 33%">
            {{ deriveHistory.response_code|responseCodeFilter }}
          </el-form-item>
          <el-form-item label="警报级别" style="width: 34%">
            {{ deriveHistory.alarm_level }}
          </el-form-item>
          <el-form-item label="消息" style="width: 100%">
            {{ deriveHistory.message }}
          </el-form-item>
          <el-form-item label="登录备注" style="width: 100%">
            {{ deriveHistory.derive_remark }}
          </el-form-item>
        </el-form>
      </overlay-scrollbars>
    </div>
    <div class="footer-container" slot="footer">
      <el-button @click="watchedVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { formatTimestamp } from '@/util/timestamp';
import resolveResponse from '@/util/response';
import { inspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/deriveHistory';

export default {
  name: 'DeriveHistoryInspectDialog',
  props: {
    visible: {
      type: Boolean,
      default: () => false,
    },
    deriveHistoryId: {
      type: String,
      default: '',
    },
  },
  watch: {
    visible(value) {
      if (value) {
        this.checkboxValue = false;
      }
      this.watchedVisible = value;
    },
  },
  filters: {
    timestampFilter(value) {
      if (value === '') {
        return '';
      }
      return formatTimestamp(value);
    },
    responseCodeFilter(value) {
      switch (value) {
        case 0:
          return '通过';
        case 10:
          return '登录状态不存在';
        case 20:
          return '账号不存在';
        case 30:
          return '账号已禁用';
        case 40:
          return '序列化版本不一致';
        default:
          return '（未知）';
      }
    },
  },
  data() {
    return {
      watchedVisible: this.visible,
      loading: false,
      deriveHistory: {
        happened_date: 0,
        response_code: 0,
        message: '',
        alarm_level: 0,
        derive_remark: '',
      },
      deriveParamRecords: [],
      protectorDetailRecords: [],
    };
  },
  methods: {
    handleOpen() {
      this.handleSearch();
    },
    handleClose() {
      this.$emit('update:visible', this.watchedVisible);
    },
    handleSearch() {
      if (!this.deriveHistoryId) {
        return;
      }
      this.loading = true;
      resolveResponse(inspect(this.deriveHistoryId))
        .then(this.updateDeriveHistory)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateDeriveHistory(res) {
      this.deriveHistory.happened_date = res.happened_date;
      this.deriveHistory.response_code = res.response_code;
      this.deriveHistory.message = res.message;
      this.deriveHistory.alarm_level = res.alarm_level;
      this.deriveHistory.derive_remark = res.derive_remark;
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.asset-catalog-select-dialog-container >>> .el-dialog {
  margin-bottom: 0 !important;
}

.body-wrapper {
  width: 100%;
  height: 550px;
  display: flex;
  flex-direction: column;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}
</style>
