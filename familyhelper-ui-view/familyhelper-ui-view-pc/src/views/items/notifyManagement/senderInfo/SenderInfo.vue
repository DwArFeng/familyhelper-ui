<template>
  <div class="sender-info-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="50%"
      :west-visible="true"
    >
      <div class="main-container" slot="west">
        <header-layout-panel>
          <template v-slot:header>
            <div class="header-container">
              <el-button type="success" @click="handleWestSearch">刷新数据</el-button>
              <el-divider direction="vertical"/>
              <el-button
                type="primary"
                :disabled="west.applyChangesButton.disabled"
                @click="handleApplyChanges"
              >
                应用变更
              </el-button>
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
                  :page-sizes="[3,4,5,10]"
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
                  :page-sizes="[3,4,5,10]"
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
          请选择通知设置和主题
        </div>
        <header-layout-panel v-else>
          <template v-slot:header>
            <div class="header-container">
              <el-button
                type="primary"
                @click="handleSaveSenderInfo"
              >
                保存发送器设置
              </el-button>
              <el-divider direction="vertical"/>
              <el-button type="success" @click="handleSenderInfoSearch">刷新数据</el-button>
            </div>
          </template>
          <template v-slot:default>
            <el-form
              class="form"
              ref="form"
              label-position="left"
              label-width="20px"
              :model="center.form.model"
              :rules="center.form.rules"
            >
              <el-form-item class="validated" label="类型" prop="type">
                <el-input v-model="center.form.model.type">
                  <template v-slot:append>
                    <el-button
                      icon="el-icon-search"
                      @click="center.senderSupportDialog.visible = true"
                    />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="参数" prop="param">
                <text-editor
                  class="text-editor"
                  v-model="center.form.model.param"
                />
              </el-form-item>
            </el-form>
          </template>
        </header-layout-panel>
      </div>
    </border-layout-panel>
    <sender-support-select-dialog
      :visible.sync="center.senderSupportDialog.visible"
      @onConfirmed="handleSenderSupportSelected"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TextEditor from '@/components/text/TextEditor.vue';
import SenderSupportSelectDialog
from '@/views/items/notifyManagement/senderSupport/SenderSupportSelectDialog.vue';

import { all as allNotifySetting } from '@/api/notify/notifySetting';
import { all as allTopic } from '@/api/notify/topic';
import {
  exists as existsSenderInfo, insert as insertSenderInfo,
  inspect as inspectSenderInfo,
  update as updateSenderInfo,
} from '@/api/notify/senderInfo';
import { exists as senderSupportExists } from '@/api/notify/senderSupport';
import { resetSend } from '@/api/notify/reset';
import resolveResponse from '@/util/response';

export default {
  name: 'SenderInfo',
  components: {
    SenderSupportSelectDialog,
    TextEditor,
    HeaderLayoutPanel,
    TablePanel,
    TitleLayoutPanel,
    BorderLayoutPanel,
  },
  computed: {
    selectionInvalid() {
      return this.west.notifySettingTable.selection === null
        || this.west.topicTable.selection === null;
    },
  },
  watch: {
    'west.notifySettingTable.selection': {
      handler() {
        this.handleSenderInfoSearch();
      },
    },
    'west.topicTable.selection': {
      handler() {
        this.handleSenderInfoSearch();
      },
    },
  },
  data() {
    const senderTypeValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('发送器类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(senderSupportExists(value));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('不支持的发送器类型'));
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          callback();
        })
        .catch(() => {
        });
    };
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
        applyChangesButton: {
          disabled: false,
        },
      },
      center: {
        loading: false,
        form: {
          model: {
            type: '',
            param: '',
          },
          rules: {
            label: [
              { required: true, message: '标签不能为空', trigger: 'blur' },
            ],
            type: [
              { validator: senderTypeValidator, trigger: 'blur' },
            ],
          },
        },
        senderSupportDialog: {
          visible: false,
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
      this.lookupAllNotifySetting();
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
    updateNotifySettingTableView(res) {
      this.west.notifySettingTable.entities = res;
      this.west.notifySettingTable.currentPage = res.current_page;
    },
    handleTopicPagingAttributeChanged() {
      this.handleTopicSearch();
    },
    handleTopicSearch() {
      this.lookupAllTopic();
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
    handleSenderSupportSelected(selection) {
      this.center.form.model.type = selection.key.string_id;
      this.center.form.model.param = selection.example_param;
    },
    handleSenderInfoSearch() {
      if (this.selectionInvalid) {
        this.center.form.model.type = '';
        this.center.form.model.param = '';
      } else {
        this.inspectSenderInfo();
      }
    },
    inspectSenderInfo() {
      this.center.loading = true;
      resolveResponse(existsSenderInfo(
        this.west.notifySettingTable.selection.key.long_id,
        this.west.topicTable.selection.key.string_id,
      ))
        .then((res) => {
          if (res) {
            return resolveResponse(inspectSenderInfo(
              this.west.notifySettingTable.selection.key.long_id,
              this.west.topicTable.selection.key.string_id,
            ));
          }
          return Promise.resolve(null);
        })
        .then(this.updateSenderInfoFormView)
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    updateSenderInfoFormView(res) {
      if (res === null) {
        this.center.form.model.type = '';
        this.center.form.model.param = '';
      } else {
        this.center.form.model.type = res.type;
        this.center.form.model.param = res.param;
      }
    },
    handleSaveSenderInfo() {
      if (this.selectionInvalid) {
        return;
      }
      this.$refs.form.validate((accept) => {
        if (accept) {
          this.saveSenderInfo();
        }
      });
    },
    saveSenderInfo() {
      this.center.loading = true;
      resolveResponse(existsSenderInfo(
        this.west.notifySettingTable.selection.key.long_id,
        this.west.topicTable.selection.key.string_id,
      ))
        .then((res) => {
          if (res) {
            return resolveResponse(updateSenderInfo(
              this.west.notifySettingTable.selection.key.long_id,
              this.west.topicTable.selection.key.string_id,
              this.west.notifySettingTable.selection.label,
              this.center.form.model.type,
              this.center.form.model.param,
              this.west.notifySettingTable.selection.remark,
            ));
          }
          return resolveResponse(insertSenderInfo(
            this.west.notifySettingTable.selection.key.long_id,
            this.west.topicTable.selection.key.string_id,
            this.west.notifySettingTable.selection.label,
            this.center.form.model.type,
            this.center.form.model.param,
            this.west.notifySettingTable.selection.remark,
          ));
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: '发送器设置更新成功',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    handleApplyChanges() {
      this.west.applyChangesButton.disabled = true;
      resolveResponse(resetSend())
        .then(() => {
          this.$message({
            showClose: true,
            message: '变更应用成功！后台状态刷新中，请不要频繁点击',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        })
        .finally(() => {
          setTimeout(() => {
            this.west.applyChangesButton.disabled = false;
          }, 3000);
        });
    },
  },
  mounted() {
    this.handleWestSearch();
  },
};
</script>

<style scoped>
.sender-info-container {
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

.form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item {
  margin-right: 0;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item:not(:last-child) {
  margin-bottom: 5px;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item:last-child {
  height: 0;
  flex-grow: 1;
  margin-bottom: 0;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item.validated {
  margin-bottom: 22px;
}

/*noinspection CssUnusedSymbol*/
.form >>> .el-form-item__content {
  width: 0;
  height: 100%;
  flex-grow: 1;
}
</style>
