<template>
  <div class="fund-change-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
      east-width="45%"
      :east-visible="header.showBillFilePanel"
    >
      <template v-slot:header>
        <div class="header-container">
          <account-book-indicator mode="FUND_CHANGE" @change="handleAccountBookChanged"/>
          <el-divider direction="vertical"/>
          <el-switch
            v-loading="uiPreference.loading"
            v-model="header.showBillFilePanel"
            active-text="显示票据"
            inactive-text="隐藏票据"
            active-color="#409EFF"
            inactive-color="#409EFF"
            :disabled="header.switchDisabled"
            @change="handleSwitchChanged"
          />
        </div>
      </template>
      <template v-slot:default>
        <fund-change-panel
          :account-book="header.accountBook"
          :fund-change-selection.sync="center.fundChange"
        />
      </template>
      <template v-slot:east>
        <bill-file-panel
          :account-book="header.accountBook"
          :fund-change="center.fundChange"
        />
      </template>
    </border-layout-panel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import AccountBookIndicator
from '@/views/items/financeManagement/accountBook/AccountBookIndicator.vue';
import FundChangePanel from '@/views/items/financeManagement/fundChange/FundChangePanel.vue';
import BillFilePanel from '@/views/items/financeManagement/fundChange/BillFilePanel.vue';

import {
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode';
import resolveResponse from '@/util/response';

const SETTINGREPO_UI_PREFERENCE_ID = 'ui_preference.pc.finance_management.fund_change';

// noinspection JSAnnotator
export default {
  name: 'FundChange',
  components: {
    BillFilePanel,
    FundChangePanel,
    AccountBookIndicator,
    BorderLayoutPanel,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    'uiPreference.data': {
      handler() {
        if (this.uiPreference.loading) {
          return;
        }
        resolveResponse(
          operatePut(
            SETTINGREPO_UI_PREFERENCE_ID,
            [this.me],
            JSON.stringify(this.uiPreference.data),
          ),
        ).then(() => {
          this.$message({
            showClose: true,
            message: '偏好已更新',
            type: 'success',
            center: true,
          });
        });
      },
      deep: true,
    },
  },
  data() {
    return {
      uiPreference: {
        loading: true,
        data: {
          showBillFilePanel: true,
        },
      },
      header: {
        accountBook: null,
        showBillFilePanel: true,
        switchDisabled: false,
      },
      center: {
        fundChange: null,
      },
    };
  },
  methods: {
    initUiPreference() {
      resolveResponse(operateInspect(SETTINGREPO_UI_PREFERENCE_ID, [this.me]))
        .then((res) => {
          if (res !== null) {
            this.uiPreference.data = JSON.parse(res.value);
          }
          return Promise.resolve();
        })
        .then(() => {
          this.header.showBillFilePanel = this.uiPreference.data.showBillFilePanel;
        }).catch(() => {})
        .finally(() => {
          this.uiPreference.loading = false;
        });
    },
    handleAccountBookChanged(accountBook) {
      if (accountBook === null) {
        this.header.accountBook = null;
      } else {
        this.header.accountBook = accountBook;
      }
    },
    handleSwitchChanged() {
      this.uiPreference.data.showBillFilePanel = this.header.showBillFilePanel;
      // 防抖。
      this.header.switchDisabled = true;
      setTimeout(() => {
        this.header.switchDisabled = false;
      }, 1000);
    },
  },
  mounted() {
    this.initUiPreference();
  },
};
</script>

<style scoped>
.fund-change-container {
  height: 100%;
  width: 100%;
}

.header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
