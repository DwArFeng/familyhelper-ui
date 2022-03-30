<template>
  <div class="asset-catalog-indicator-container">
    <el-input
      v-loading="loading"
      class="indicator"
      v-model="displayValue"
      readonly
    >
      <span slot="prepend">当前资产目录</span>
      <el-button-group class="button-group" slot="append">
        <el-button
          class="button"
          icon="el-icon-search"
          @click="handleShowDialog"
        />
        <el-button
          class="button"
          icon="el-icon-refresh"
          @click="handleResetDefault"
        />
      </el-button-group>
    </el-input>
    <asset-catalog-select-dialog
      :mode="mode"
      :visible.sync="dialogVisible"
      @onConfirm="handleConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import AssetCatalogSelectDialog
from '@/views/items/assetsManagement/assetCatalog/AssetCatalogSelectDialog.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/settingNode';
import { exists, inspectDisp } from '@/api/assets/assetCatalog';

import resolveResponse from '@/util/response';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';

const SETTINGREPO_CATEGORY_ID = 'assets_management.default_asset_catalog';

// noinspection JSAnnotator
export default {
  name: 'AssetCatalogIndicator',
  components: { AssetCatalogSelectDialog },
  props: {
    mode: {
      type: String,
      validator(value) {
        return [
          'ASSET_BOM', 'ASSETS_REPORT', 'DEFAULT',
        ].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  computed: {
    assetCatalogId() {
      if (this.assetCatalog === null) {
        return '';
      }
      return this.assetCatalog.key.long_id;
    },
    displayValue() {
      if (this.assetCatalog === null) {
        return '（未选择账本）';
      }
      return this.assetCatalog.name;
    },
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      assetCatalog: null,
      dialogVisible: false,
      loading: false,
      defaultAssetCatalog: null,
    };
  },
  methods: {
    handleShowDialog() {
      this.dialogVisible = true;
    },
    handleConfirmed(assetCatalog, setDefault) {
      this.assetCatalog = assetCatalog;
      this.$emit('change', assetCatalog);
      if (!setDefault) {
        return;
      }
      resolveResponse(operatePut(
        SETTINGREPO_CATEGORY_ID,
        [this.me],
        this.assetCatalogId,
        `更新时间: ${formatTimestamp(currentTimestamp())}`,
      ))
        .then(() => {
          this.defaultAssetCatalog = this.assetCatalog;
        })
        .catch(() => {
        });
    },
    fetchSettingrepo() {
      this.loading = true;
      resolveResponse(operateInspect(SETTINGREPO_CATEGORY_ID, [this.me]))
        .then((res) => {
          if (res === null) {
            this.assetCatalog = null;
            return Promise.reject();
          }
          return Promise.resolve(res.value);
        })
        .then((res) => resolveResponse(exists(res))
          .then((existsFlag) => {
            if (existsFlag) {
              return Promise.resolve(res);
            }
            this.assetCatalog = null;
            return Promise.reject();
          }))
        .then((res) => resolveResponse(inspectDisp(res)))
        .then((res) => {
          this.defaultAssetCatalog = res;
          this.assetCatalog = res;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
          this.$emit('change', this.assetCatalog);
        });
    },
    handleResetDefault() {
      this.assetCatalog = this.defaultAssetCatalog;
      this.$emit('change', this.assetCatalog);
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

.button-group{
  display: flex;
}

.button-group .button{
  padding-left: 10px;
  padding-right: 10px;
}
</style>
