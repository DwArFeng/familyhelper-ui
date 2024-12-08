<template>
  <el-dialog
    class="note-book-select-dialog-container"
    ref="dialog"
    tabindex="0"
    destroy-on-close
    title="选择笔记本"
    top="8vh"
    width="80%"
    :visible.sync="watchedVisible"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
    @closed="handleClosed"
    @keydown.native="handleHotKeyDown"
  >
    <header-layout-panel class="body-wrapper">
      <template v-slot:header>
        <div class="header-container">
          <el-button
            type="success"
            size="medium"
            @click="handleSearch"
          >
            刷新数据
          </el-button>
          <el-divider direction="vertical"/>
          <el-switch
            v-model="favoredOnly"
            active-text="只看收藏"
            inactive-text="看所有的"
            @change="handleSearch"
          />
          <el-divider direction="vertical"/>
          <el-input
            class="name-search-bar"
            v-model="namePattern"
            clearable
            @keydown.enter.native="handleSearch"
            @clear="handleSearch"
          >
            <template v-slot:prepend>
              <span>笔记名称</span>
            </template>
            <template v-slot:append>
              <el-button
                icon="el-icon-search"
                @click="handleSearch"
              />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <div class="body-container">
          <card-panel
            title-prop="name"
            class="card-list-container"
            v-loading="cardLoading"
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
            <template v-slot:default="{item}">
              <!--suppress JSUnresolvedReference -->
              <corner-light-panel
                class="note-book-card-container-wrapper"
                light-bevel-edge="40px"
                light-color="#E6A23C"
                :show-south-east="item.favorite"
              >
                <div class="note-book-card-container">
                  <div class="note-book-property">
                    <span
                      class="iconfont note-book-property-icon" style="color:black"
                    >&#xfffa;</span>
                    <!--suppress JSUnresolvedVariable -->
                    <span class="note-book-property-text">
                权限: {{ resolvePermissionLabel(item.permission_level) }}
              </span>
                  </div>
                  <div class="note-book-property">
                    <span
                      class="iconfont note-book-property-icon" style="color:black"
                    >&#xfffb;</span>
                    <!--suppress JSUnresolvedVariable -->
                    <span class="note-book-property-text">
                所有者: {{ item.owner_account.display_name }}
              </span>
                  </div>
                  <div class="note-book-property">
                    <span
                      class="iconfont note-book-property-icon" style="color:black"
                    >&#xffe7;</span>
                    <!--suppress JSUnresolvedVariable -->
                    <span class="note-book-property-text">
                项目总数: {{ item.item_count }}
              </span>
                  </div>
                  <div class="note-book-property">
                    <span
                      class="iconfont note-book-property-icon" style="color:black"
                    >&#xffef;</span>
                    <!--suppress JSUnresolvedVariable -->
                    <span class="note-book-property-text">
                创建日期: {{ formatTimestamp(item.created_date) }}
              </span>
                  </div>
                </div>
              </corner-light-panel>
            </template>
          </card-panel>
          <el-checkbox v-model="checkboxValue">设为默认</el-checkbox>
        </div>
      </template>
    </header-layout-panel>
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
import CardPanel from '@/components/layout/CardPanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';

import {
  userPermittedWithConditionDisplayDisp,
  userOwnedWithConditionDisplayDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteBook';
import resolveResponse from '@/util/response';

import { formatTimestamp } from '@/util/timestamp';
import CornerLightPanel from '@/components/layout/CornerLightPanel.vue';

export default {
  name: 'NoteBookSelectDialog',
  components: { CornerLightPanel, HeaderLayoutPanel, CardPanel },
  props: {
    visible: {
      type: Boolean,
      default: () => false,
    },
    mode: {
      type: String,
      validator(value) {
        return [
          'NOTE_MANAGEMENT', 'DEFAULT',
        ].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
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
  computed: {
    isConfirmButtonDisabled() {
      return this.selection === null;
    },
  },
  data() {
    return {
      cardLoading: 0,
      entities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      watchedVisible: false,
      selection: null,
      checkboxValue: false,
      favoredOnly: false,
      namePattern: '',
    };
  },
  methods: {
    handleSearch() {
      switch (this.mode) {
        default:
          this.lookupAllPermitted();
          break;
      }
    },
    lookupAllPermitted() {
      this.cardLoading += 1;
      resolveResponse(userPermittedWithConditionDisplayDisp(
        this.namePattern,
        this.favoredOnly,
        0,
        1000,
      ))
        .then(this.updateCardListView)
        .catch(() => {
        })
        .finally(() => {
          this.cardLoading -= 1;
        });
    },
    lookupAllOwned() {
      this.cardLoading += 1;
      resolveResponse(userOwnedWithConditionDisplayDisp(
        this.namePattern,
        this.favoredOnly,
        0,
        1000,
      ))
        .then(this.updateCardListView)
        .catch(() => {
        })
        .finally(() => {
          this.cardLoading -= 1;
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
      this.$emit('onConfirm', this.selection, this.checkboxValue);
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
    this.watchedVisible = this.visible;
  },
};
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.note-book-select-dialog-container >>> .el-dialog {
  margin-bottom: 0 !important;
}

.body-wrapper >>> .main-container-wrapper.expand{
  height: unset;
  flex-grow: unset;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .name-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .name-search-bar >>> .el-input-group__prepend {
  padding: 0 10px;
}

.body-container{
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-list-container {
  width: 100%;
  height: 500px !important;
}

.note-book-card-container-wrapper {
  width: 100%;
  height: 100%;
}

.note-book-card-container {
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

.note-book-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.note-book-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.note-book-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
