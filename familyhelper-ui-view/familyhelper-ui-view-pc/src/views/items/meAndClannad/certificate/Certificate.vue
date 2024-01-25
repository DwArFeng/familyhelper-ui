<template>
  <div class="certificate-container">
    <border-layout-panel
      class="border-layout-panel"
      east-width="55%"
      :east-visible="true"
    >
      <template v-slot:default>
        <certificate-panel
          :ui-preference.sync="uiPreference"
          :certificate-selection.sync="center.certificate"
        />
      </template>
      <template v-slot:east>
        <certificate-file-panel
          :certificate="center.certificate"
        />
      </template>
    </border-layout-panel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import CertificatePanel from '@/views/items/meAndClannad/certificate/CertificatePanel.vue';
import CertificateFilePanel from '@/views/items/meAndClannad/certificate/CertificateFilePanel.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/settingNode';
import resolveResponse from '@/util/response';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';

const SETTINGREPO_UI_PREFERENCE_ID = 'ui_preference.pc.me_and_clannad.certificate';

// noinspection JSAnnotator
export default {
  name: 'Certificate',
  components: {
    CertificateFilePanel,
    CertificatePanel,
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
          operatePut(SETTINGREPO_UI_PREFERENCE_ID,
            [this.me],
            JSON.stringify(this.uiPreference.data),
            `更新时间: ${formatTimestamp(currentTimestamp())}`),
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
          lookupAllPermitted: true,
        },
      },
      center: {
        certificate: null,
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
        .catch(() => {
        })
        .finally(() => {
          this.uiPreference.loading = false;
        });
    },
  },
  mounted() {
    this.initUiPreference();
  },
};
</script>

<style scoped>
.certificate-container {
  height: 100%;
  width: 100%;
}
</style>
