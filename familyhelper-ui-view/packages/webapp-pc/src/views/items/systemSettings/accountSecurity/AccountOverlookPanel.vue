<template>
  <div class="account-overlook-panel-container">
    <div class="placeholder" v-if="accountId===''">请选择账号</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
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
          <overlay-scrollbars class="scroll-bar">
            <el-form
              class="property-form"
              label-position="left"
              label-width="80px"
              inline
              :model="account"
            >
              <el-form-item label="头像" style="width: 100%">
                <avatar-panel
                  shape="square"
                  render-mode="BY_ID"
                  :size="180"
                  :object-user-id="accountId"
                  :placeholder-font-size="14"
                />
              </el-form-item>
              <el-form-item label="ID" style="width: 33%">
                {{ account.key.string_id }}
              </el-form-item>
              <el-form-item label="名称" style="width: 33%">
                {{ account.name }}
              </el-form-item>
              <el-form-item label="启用" style="width: 34%">
                {{ account.enabled|booleanFilter }}
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
                {{ account.remark }}
              </el-form-item>
              <el-form-item label="显示名称" style="width: 100%">
                {{ account.display_name }}
              </el-form-item>
            </el-form>
          </overlay-scrollbars>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script>
import AvatarPanel from '@/components/avatar/AvatarPanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';

import { inspectDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account';
import resolveResponse from '@/util/response';

export default {
  name: 'AccountOverlookPanel',
  components: { HeaderLayoutPanel, AvatarPanel },
  props: {
    accountId: {
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
    accountId() {
      this.handleSearch();
    },
  },
  filters: {
    booleanFilter(value) {
      return value ? '是' : '否';
    },
  },
  data() {
    return {
      loading: false,
      account: {
        key: {
          string_id: '',
        },
        name: '',
        enabled: false,
        remark: '',
        display_name: '',
      },
    };
  },
  methods: {
    handleSearch() {
      if (!this.accountId) {
        return;
      }
      this.handleInspectAccount();
    },
    handleInspectAccount() {
      this.loading = true;
      resolveResponse(inspectDisp(this.accountId))
        .then(this.updateEntity)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateEntity(res) {
      this.account.key.string_id = res.key.string_id;
      this.account.name = res.name;
      this.account.enabled = res.enabled;
      this.account.remark = res.remark;
      this.account.display_name = res.display_name;
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
.account-overlook-panel-container {
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

.property-form >>> textarea {
  padding: 0;
  border: none;
  font: unset;
  font-size: 14px;
  color: #303133;
}
</style>
