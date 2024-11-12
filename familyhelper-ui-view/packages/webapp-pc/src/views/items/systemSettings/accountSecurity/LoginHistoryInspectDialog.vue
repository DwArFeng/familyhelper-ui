<template>
  <el-dialog
    class="login-history-inspect-dialog-container"
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
            {{ loginHistory.happened_date|timestampFilter }}
          </el-form-item>
          <el-form-item label="登录响应" style="width: 33%">
            {{ loginHistory.response_code|responseCodeFilter }}
          </el-form-item>
          <el-form-item label="警报级别" style="width: 34%">
            {{ loginHistory.alarm_level }}
          </el-form-item>
          <el-form-item label="消息" style="width: 100%">
            {{ loginHistory.message }}
          </el-form-item>
          <el-form-item label="登录备注" style="width: 100%">
            {{ loginHistory.login_remark }}
          </el-form-item>
        </el-form>
        <el-divider content-position="left">登录参数记录</el-divider>
        <div v-if="loginParamRecords.length===0" class="empty-placeholder">（无）</div>
        <el-form
          v-else
          class="property-form"
          label-position="left"
          label-width="80px"
          inline
        >
          <template v-for="record in loginParamRecords">
            <el-form-item label="键" style="width: 33%" :key="'k.' + record.key.record_id">
              {{ record.key.record_id }}
            </el-form-item>
            <el-form-item label="值" style="width: 67%" :key="'v.' + record.key.record_id">
              {{ record.value }}
            </el-form-item>
          </template>
        </el-form>
        <el-divider content-position="left">保护详情记录</el-divider>
        <div v-if="protectorDetailRecords.length===0" class="empty-placeholder">（无）</div>
        <el-form
          v-else
          class="property-form"
          label-position="left"
          label-width="80px"
          inline
        >
          <template v-for="record in protectorDetailRecords">
            <el-form-item label="键" style="width: 33%" :key="'k.' + record.key.record_id">
              {{ record.key.record_id }}
            </el-form-item>
            <el-form-item label="值" style="width: 67%" :key="'v.' + record.key.record_id">
              {{ record.value }}
            </el-form-item>
          </template>
        </el-form>
      </overlay-scrollbars>
    </div>
    <div class="footer-container" slot="footer">
      <el-button @click="watchedVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { inspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginHistory';
import { formatTimestamp } from '@/util/timestamp';
import {
  childForLoginHistory as loginParamRecordChildForLoginHistory,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/loginParamRecord';
import {
  childForLoginHistory as protectorDetailChildForLoginHistory,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/protectDetailRecord';
import resolveResponse from '@/util/response';

export default {
  name: 'LoginHistoryInspectDialog',
  props: {
    visible: {
      type: Boolean,
      default: () => false,
    },
    loginHistoryId: {
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
          return '账号不存在';
        case 20:
          return '账号已禁用';
        case 30:
          return '密码错误';
        case 40:
          return '受保护';
        case 50:
          return '保护器信息不存在';
        default:
          return '（未知）';
      }
    },
  },
  data() {
    return {
      watchedVisible: this.visible,
      loading: false,
      loginHistory: {
        happened_date: 0,
        response_code: 0,
        message: '',
        alarm_level: 0,
        login_remark: '',
      },
      loginParamRecords: [],
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
      if (!this.loginHistoryId) {
        return;
      }
      this.loading = true;
      resolveResponse(inspect(this.loginHistoryId))
        .then(this.updateLoginHistory)
        .then(() => resolveResponse(loginParamRecordChildForLoginHistory(
          this.loginHistoryId, 0, 99999,
        )))
        .then(this.updateLoginParamRecords)
        .then(() => resolveResponse(protectorDetailChildForLoginHistory(
          this.loginHistoryId, 0, 99999,
        )))
        .then(this.updateProtectorDetailRecords)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateLoginHistory(res) {
      this.loginHistory.happened_date = res.happened_date;
      this.loginHistory.response_code = res.response_code;
      this.loginHistory.message = res.message;
      this.loginHistory.alarm_level = res.alarm_level;
      this.loginHistory.login_remark = res.login_remark;
    },
    updateLoginParamRecords(res) {
      this.loginParamRecords = res.data;
    },
    updateProtectorDetailRecords(res) {
      this.protectorDetailRecords = res.data;
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

.empty-placeholder {
  color: #606266;
  font-size: 14px;
}
</style>
