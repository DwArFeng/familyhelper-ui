<template>
  <el-dialog
    class="asset-catalog-select-dialog-container"
    ref="dialog"
    tabindex="0"
    append-to-body
    destroy-on-close
    title="选择账本"
    top="6vh"
    width="80%"
    :visible.sync="watchedVisible"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
    @closed="handleClosed"
    @keydown.native="handleHotKeyDown"
  >
    <card-panel
      title-prop="name"
      class="card-list-container"
      card-width="calc(20% - 18px)"
      select-mode="SINGLE"
      :data="entities.data"
      :maxCard="1000"
      :inspect-button-visible="false"
      :edit-button-visible="false"
      :delete-button-visible="false"
      :addon-button-visible="false"
      :inspect-menu-item-visible="false"
      :edit-menu-item-visible="false"
      :delete-menu-item-visible="false"
      @onSelectionChanged="handleSelectionChanged"
    >
      <template v-slot:default="{index,item}">
        <div class="asset-catalog-container">
          <div class="asset-catalog-property">
            <span class="iconfont asset-catalog-property-icon" style="color:black">&#xfffa;</span>
            <!--suppress JSUnresolvedVariable -->
            <span class="asset-catalog-property-text">
                权限: {{ resolvePermissionLabel(item.permission_level) }}
              </span>
          </div>
          <div class="asset-catalog-property">
            <span class="iconfont asset-catalog-property-icon" style="color:black">&#xfffb;</span>
            <!--suppress JSUnresolvedVariable -->
            <span class="asset-catalog-property-text">
                所有者: {{ item.owner_account.key.string_id }}
              </span>
          </div>
          <div class="asset-catalog-property">
            <span class="iconfont asset-catalog-property-icon" style="color:black">&#xffe7;</span>
            <!--suppress JSUnresolvedVariable -->
            <span class="asset-catalog-property-text">
                项目总数: {{ item.item_count }}
              </span>
          </div>
          <div class="asset-catalog-property">
            <span class="iconfont asset-catalog-property-icon" style="color:black">&#xffef;</span>
            <!--suppress JSUnresolvedVariable -->
            <span class="asset-catalog-property-text">
                创建日期: {{ formatTimestamp(item.created_date) }}
              </span>
          </div>
        </div>
      </template>
    </card-panel>
    <div class="footer-container" slot="footer">
      <el-button
        type="primary"
        :disabled="isConfirmButtonDisabled"
        @click="handleConfirm"
      >
        确定
      </el-button>
      <el-button
        @click="watchedVisible = false"
      >
        取消
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import CardPanel from '@/components/card/CardPanel.vue';

import resolveResponse from '@/util/response';
import { allOwned, allPermitted } from '@/api/assets/assetCatalog';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'AssetCatalogSelectDialog',
  components: { CardPanel },
  props: {
    visible: {
      type: Boolean,
      default: () => false,
    },
    mode: {
      type: String,
      validator(value) {
        return [
          'ASSET_BOM', 'FUND_CHANGE', 'ASSETS_REPORT', 'DEFAULT',
        ].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  watch: {
    visible(value) {
      this.watchedVisible = value;
    },
  },
  computed: {
    isConfirmButtonDisabled() {
      return this.selection === null;
    },
  },
  data() {
    return {
      entities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      watchedVisible: this.visible,
      selection: null,
    };
  },
  methods: {
    handleSearch() {
      switch (this.mode) {
        case 'ASSET_BOM':
          this.lookupAllOwned();
          break;
        case 'ASSETS_REPORT':
          this.lookupAllPermitted();
          break;
        default:
          this.lookupAllPermitted();
          break;
      }
    },
    lookupAllPermitted() {
      resolveResponse(allPermitted(0, 1000))
        .then(this.updateCardListView)
        .catch(() => {
        });
    },
    lookupAllOwned() {
      resolveResponse(allOwned(0, 1000))
        .then(this.updateCardListView)
        .catch(() => {
        });
    },
    resolvePermissionLabel(permissionLevel) {
      switch (permissionLevel) {
        case 0:
          return '所有者';
        case 1:
          return '访客';
        default:
          return ' 未知';
      }
    },
    formatTimestamp(timestamp) {
      return formatTimestamp(timestamp);
    },
    updateCardListView(res) {
      this.entities = res;
    },
    handleOpen() {
      this.handleSearch();
    },
    handleClose() {
      this.$emit('update:visible', this.watchedVisible);
    },
    handleClosed() {
      this.selection = null;
    },
    handleConfirm() {
      this.watchedVisible = false;
      this.$emit('onConfirm', this.selection);
    },
    handleSelectionChanged(index) {
      if (index === -1) {
        this.selection = null;
      } else {
        this.selection = this.entities.data[index];
      }
    },
    handleHotKeyDown(event) {
      if (this.selection === null) {
        return;
      }
      if (event.key === 'Enter' && event.shiftKey === false && event.altKey === false) {
        this.handleConfirm();
      }
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.card-list-container {
  width: 100%;
  height: 68vh;
}

/*noinspection CssUnusedSymbol*/
.asset-catalog-select-dialog-container >>> .el-dialog {
  margin-bottom: 0 !important;
}

.asset-catalog-container {
  width: 100%;
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.asset-catalog-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.asset-catalog-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.asset-catalog-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
