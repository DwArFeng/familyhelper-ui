<template>
  <div class="meta-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="50%"
      :west-visible="true"
    >
      <div class="main-container" v-loading="west.loading" slot="west">
        <header-layout-panel>
          <template v-slot:header>
            <div class="header-container">
              <el-input
                class="item"
                v-model="west.notifySettingSelector.value"
                placeholder="通知设置名称过滤"
                @keyup.enter.native="handleNotifySettingSearch"
              >
                <template v-slot:append>
                  <el-button
                    icon="el-icon-search"
                    @click="handleNotifySettingSearch"
                  />
                </template>
              </el-input>
              <el-input
                class="item"
                v-model="west.topicSelector.value"
                placeholder="主题名称过滤"
                @keyup.enter.native="handleTopicSearch"
              >
                <template v-slot:append>
                  <el-button
                    icon="el-icon-search"
                    @click="handleTopicSearch"
                  />
                </template>
              </el-input>
              <account-selector
                class="item"
                v-if="accountSelectorVisible"
                v-model="west.accountSelector.value"
              />
              <el-divider direction="vertical"/>
              <el-button type="success" @click="handleWestSearch">刷新数据</el-button>
            </div>
          </template>
          <template v-slot:default>
            <div class="west-item-wrapper">
              <title-layout-panel class="item" title="通知设置">
                <table-panel
                  class="table"
                  v-loading="west.notifySettingTable.loading"
                  highlight-current-row
                  :page-size.sync="west.notifySettingTable.pageSize"
                  :entity-count="parseInt(west.notifySettingTable.entities.count)"
                  :current-page.sync="west.notifySettingTable.currentPage"
                  :page-sizes="[5,10,15,20]"
                  :table-data="west.notifySettingTable.entities.data"
                  :table-selection.sync="west.notifySettingTable.selection"
                  :operate-column-visible="false"
                  @onPagingAttributeChanged="handleNotifySettingPagingAttributeChanged"
                >
                  <el-table-column
                    prop="label"
                    label="名称"
                    show-tooltip-when-overflow
                  />
                  <el-table-column
                    prop="enabled"
                    label="使能"
                    width="50px"
                    :formatter="booleanFormatter"
                  />
                  <el-table-column
                    prop="remark"
                    label="备注"
                    show-tooltip-when-overflow
                  />
                </table-panel>
              </title-layout-panel>
              <title-layout-panel class="item" title="主题">
                <table-panel
                  class="table"
                  highlight-current-row
                  :page-size.sync="west.topicTable.pageSize"
                  :entity-count="parseInt(west.topicTable.entities.count)"
                  :current-page.sync="west.topicTable.currentPage"
                  :page-sizes="[5,10,15,20]"
                  :table-data="west.topicTable.entities.data"
                  :table-selection.sync="west.topicTable.selection"
                  :operate-column-visible="false"
                  @onPagingAttributeChanged="handleTopicPagingAttributeChanged"
                >
                  <el-table-column
                    prop="key.string_id"
                    label="ID"
                    show-tooltip-when-overflow
                  />
                  <el-table-column
                    prop="label"
                    label="名称"
                    show-tooltip-when-overflow
                  />
                  <el-table-column
                    prop="enabled"
                    label="使能"
                    width="50px"
                    :formatter="booleanFormatter"
                  />
                  <el-table-column
                    prop="priority"
                    label="优先级"
                    width="75px"
                  />
                  <el-table-column
                    prop="remark"
                    label="备注"
                    show-tooltip-when-overflow
                  />
                </table-panel>
              </title-layout-panel>
            </div>
          </template>
        </header-layout-panel>
      </div>
      <div class="main-container" v-loading="center.loading">
        <div class="placeholder" v-if="selectionInvalid">
          请选择通知设置、主题、用户
        </div>
        <header-layout-panel v-else>
          <template v-slot:header>
            <div class="header-container">
              <el-button type="primary" @click="center.createDialog.visible=true">新建</el-button>
              <el-button type="success" @click="handleMetaSearch">刷新</el-button>
            </div>
          </template>
          <template v-slot:default>
            <table-panel
              class="table"
              v-loading="center.table.loading"
              :page-size.sync="center.table.pageSize"
              :entity-count="parseInt(center.table.entities.count)"
              :current-page.sync="center.table.currentPage"
              :page-sizes="[15,20,30,50]"
              :table-data="center.table.entities.data"
              :operate-column-width="76"
              :inspect-button-visible="false"
              :edit-button-visible="true"
              :delete-button-visible="true"
              @onEntityEdit="handleShowMetaEditDialog"
              @onEntityDelete="handleMetaDelete"
              @onPagingAttributeChanged="handleMetaPagingAttributeChanged"
            >
              <el-table-column
                prop="key.meta_id"
                label="名称"
                show-tooltip-when-overflow
                :formatter="metaIdFormatter"
              />
              <el-table-column
                class-name="single-line"
                prop="value"
                label="当前值"
              />
            </table-panel>
          </template>
        </header-layout-panel>
      </div>
    </border-layout-panel>
    <meta-indicator-select-dialog
      mode="CHILD_FOR_META_MISSING"
      :visible.sync="center.createDialog.visible"
      :notify-setting-id="notifySettingId"
      :topic-id="topicId"
      :account-id="selectedAccount"
      @onConfirmed="handleMetaCreateConfirmed"
    />
    <entity-maintain-dialog
      top="10vh"
      mode="EDIT"
      :visible.sync="center.editDialog.visible"
      :entity="center.editDialog.anchorEntity"
      :close-on-click-modal="false"
      :loading="center.editDialog.loading"
      @onEntityEdit="handleMetaEdit"
    >
      <el-form-item label="当前值" prop="value">
        <el-input
          v-model="center.editDialog.anchorEntity.value"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import AccountSelector from '@/views/items/systemSettings/account/AccountSelector.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import MetaIndicatorSelectDialog
from '@/views/items/notifyManagement/metaIndicator/MetaIndicatorSelectDialog.vue';

import {
  all as allTopic, labelLike as labelLikeTopic,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic';
import {
  all as allNotifySetting,
  labelLike as labelLikeNotifySetting,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';
import {
  insert as insertMeta,
  update as updateMeta,
  remove as removeMeta,
  childForNotifySettingTopicUserDisp as dispMeta,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/meta';
import resolveResponse from '@/util/response';

const COMPONENT_VISIBLE_PERMISSION_ACCOUNT_SELECTOR = 'ui.pc.component_visible.notify_management.meta.account_selector';

// noinspection JSAnnotator
export default {
  name: 'Meta',
  components: {
    EntityMaintainDialog,
    MetaIndicatorSelectDialog,
    AccountSelector,
    TitleLayoutPanel,
    TablePanel,
    HeaderLayoutPanel,
    BorderLayoutPanel,
  },
  computed: {
    notifySettingId() {
      const { selection } = this.west.notifySettingTable;
      if (selection === null) {
        return '';
      }
      return selection.key.long_id;
    },
    topicId() {
      const { selection } = this.west.topicTable;
      if (selection === null) {
        return '';
      }
      return selection.key.string_id;
    },
    selectionInvalid() {
      return this.west.notifySettingTable.selection === null
        || this.west.topicTable.selection === null
        || this.selectedAccount === '';
    },
    selectedAccount() {
      if (this.hasPermission(COMPONENT_VISIBLE_PERMISSION_ACCOUNT_SELECTOR)) {
        return this.west.accountSelector.value;
      }
      return this.me;
    },
    accountSelectorVisible() {
      return this.hasPermission(COMPONENT_VISIBLE_PERMISSION_ACCOUNT_SELECTOR);
    },
    ...mapGetters('lnp', ['me', 'hasPermission']),
  },
  watch: {
    'west.notifySettingTable.selection': {
      handler() {
        this.handleMetaSearch();
      },
    },
    'west.topicTable.selection': {
      handler() {
        this.handleMetaSearch();
      },
    },
    selectedAccount: {
      handler() {
        this.handleMetaSearch();
      },
    },
  },
  data() {
    return {
      west: {
        notifySettingTable: {
          loading: false,
          entities: {
            current_page: 0,
            total_pages: 0,
            rows: 0,
            count: '0',
            data: [],
          },
          currentPage: 0,
          pageSize: 5,
          selection: null,
        },
        topicTable: {
          loading: false,
          entities: {
            current_page: 0,
            total_pages: 0,
            rows: 0,
            count: '0',
            data: [],
          },
          currentPage: 0,
          pageSize: 5,
          selection: null,
        },
        notifySettingSelector: {
          value: '',
        },
        topicSelector: {
          value: '',
        },
        accountSelector: {
          value: '',
        },
      },
      center: {
        loading: false,
        table: {
          entities: {
            current_page: 0,
            total_pages: 0,
            rows: 0,
            count: '0',
            data: [],
          },
          currentPage: 0,
          pageSize: 15,
        },
        createDialog: {
          visible: false,
        },
        editDialog: {
          loading: false,
          visible: false,
          anchorEntity: {
            key: {
              notify_setting_id: '',
              topic_id: '',
              user_id: '',
              meta_id: '',
            },
            value: '',
          },
        },
      },
    };
  },
  methods: {
    handleWestSearch() {
      this.handleNotifySettingSearch();
      this.handleTopicSearch();
    },
    handleNotifySettingPagingAttributeChanged() {
      this.handleNotifySettingSearch();
    },
    handleNotifySettingSearch() {
      if (this.west.notifySettingSelector.value === null) {
        this.lookupAllNotifySetting();
      } else {
        this.lookupLabelLikeNotifySetting();
      }
    },
    lookupAllNotifySetting() {
      this.west.notifySettingTable.loading = true;
      resolveResponse(allNotifySetting(
        this.west.notifySettingTable.currentPage, this.west.notifySettingTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allNotifySetting(
              res.total_pages - 1, this.west.notifySettingTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateNotifySettingTableView)
        .catch(() => {
        })
        .finally(() => {
          this.west.notifySettingTable.loading = false;
        });
    },
    lookupLabelLikeNotifySetting() {
      this.west.notifySettingTable.loading = true;
      resolveResponse(labelLikeNotifySetting(
        this.west.notifySettingSelector.value, this.west.notifySettingTable.currentPage,
        this.west.notifySettingTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(labelLikeNotifySetting(
              this.west.notifySettingSelector.value, res.total_pages - 1,
              this.west.notifySettingTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateNotifySettingTableView)
        .catch(() => {
        })
        .finally(() => {
          this.west.notifySettingTable.loading = false;
        });
    },
    updateNotifySettingTableView(res) {
      this.west.notifySettingTable.entities = res;
      this.west.notifySettingTable.currentPage = res.current_page;
    },
    handleTopicPagingAttributeChanged() {
      this.handleTopicSearch();
    },
    handleTopicSearch() {
      if (this.west.topicSelector.value === '') {
        this.lookupAllTopic();
      } else {
        this.lookupLabelLikeTopic();
      }
    },
    lookupAllTopic() {
      this.west.topicTable.loading = true;
      resolveResponse(allTopic(this.west.topicTable.currentPage, this.west.topicTable.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allTopic(res.total_pages - 1, this.west.topicTable.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTopicTableView)
        .catch(() => {
        })
        .finally(() => {
          this.west.topicTable.loading = false;
        });
    },
    lookupLabelLikeTopic() {
      this.west.topicTable.loading = true;
      resolveResponse(labelLikeTopic(
        this.west.topicSelector.value, this.west.topicTable.currentPage,
        this.west.topicTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(labelLikeTopic(
              this.west.topicSelector.value, res.total_pages - 1, this.west.topicTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTopicTableView)
        .catch(() => {
        })
        .finally(() => {
          this.west.topicTable.loading = false;
        });
    },
    updateTopicTableView(res) {
      this.west.topicTable.entities = res;
      this.west.topicTable.currentPage = res.current_page;
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value === null || value === undefined) {
        return '';
      }
      return value ? '是' : '否';
    },
    handleMetaPagingAttributeChanged() {
      this.handleMetaSearch();
    },
    handleMetaSearch() {
      if (this.selectionInvalid) {
        return;
      }
      this.lookupChildForTopicMeta();
    },
    lookupChildForTopicMeta() {
      this.center.loading = true;
      resolveResponse(dispMeta(
        this.west.notifySettingTable.selection.key.long_id,
        this.west.topicTable.selection.key.string_id,
        this.selectedAccount,
        this.center.table.currentPage, this.center.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(dispMeta(
              this.west.notifySettingTable.selection.key.long_id,
              this.west.topicTable.selection.key.string_id,
              this.selectedAccount,
              res.total_pages - 1, this.center.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMetaTableView)
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    updateMetaTableView(res) {
      this.center.table.entities = res;
      this.center.table.currentPage = res.current_page;
    },
    handleMetaCreateConfirmed(selection) {
      const promises = selection.map((s) => resolveResponse(insertMeta(
        this.west.notifySettingTable.selection.key.long_id,
        this.west.topicTable.selection.key.string_id,
        this.selectedAccount,
        s.key.meta_id,
        s.default_value,
        `更新时间: ${formatTimestamp(currentTimestamp())}`,
      )));
      this.center.loading = true;
      Promise.all(promises)
        .then(() => {
          this.$message({
            showClose: true,
            message: '创建成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleMetaSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    handleMetaEdit() {
      this.center.editDialog.loading = true;
      resolveResponse(updateMeta(
        this.center.editDialog.anchorEntity.key.notify_setting_id,
        this.center.editDialog.anchorEntity.key.topic_id,
        this.center.editDialog.anchorEntity.key.user_id,
        this.center.editDialog.anchorEntity.key.meta_id,
        this.center.editDialog.anchorEntity.value,
        `更新时间: ${formatTimestamp(currentTimestamp())}`,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleMetaSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.center.editDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.center.editDialog.loading = false;
        });
    },
    handleShowMetaEditDialog(index, entity) {
      this.center.editDialog.anchorEntity.key.notify_setting_id = entity.key.notify_setting_id;
      this.center.editDialog.anchorEntity.key.topic_id = entity.key.topic_id;
      this.center.editDialog.anchorEntity.key.user_id = entity.key.user_id;
      this.center.editDialog.anchorEntity.key.meta_id = entity.key.meta_id;
      this.center.editDialog.anchorEntity.value = entity.value;
      this.center.editDialog.visible = true;
    },
    handleMetaDelete(index, entity) {
      Promise.resolve()
        .then(() => this.$confirm('此操作将永久删除此元数据。<br>'
          + '该操作不可恢复！<br>'
          + '是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject()))
        .then(() => {
          this.center.loading = true;
        })
        .then(() => resolveResponse(removeMeta(
          entity.key.notify_setting_id, entity.key.topic_id, entity.key.user_id,
          entity.key.meta_id,
        )))
        .then(() => {
          this.$message({
            showClose: true,
            message: '元数据删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleMetaSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    metaIdFormatter(row) {
      // noinspection JSUnresolvedVariable
      if (row.indicator !== null) {
        // noinspection JSUnresolvedVariable
        return row.indicator.label;
      }
      return row.key.meta_id;
    },
  },
  mounted() {
    this.west.accountSelector.value = this.me;
    this.handleWestSearch();
  },
};
</script>

<style scoped>
.meta-container {
  height: 100%;
  width: 100%;
}

.main-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .item {
  width: 0;
  flex-grow: 1;
  min-width: 200px;
}

.header-container .item:not(:last-child) {
  margin-right: 5px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.west-item-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.west-item-wrapper .item {
  flex-grow: 1;
}

.west-item-wrapper .item:not(:last-child) {
  margin-bottom: 5px;
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

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
