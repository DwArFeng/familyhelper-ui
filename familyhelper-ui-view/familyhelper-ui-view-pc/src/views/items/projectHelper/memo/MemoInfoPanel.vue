<template>
  <div class="memo-info-panel-container">
    <div class="placeholder" v-if="memoId===''">请选择备忘录</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              class="item"
              type="primary"
              :disabled="readonly"
              @click="handleShowEditDialog"
            >
              属性编辑
            </el-button>
            <el-divider direction="vertical"/>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
          </div>
        </template>
        <template v-slot:default>
          <title-layout-panel class="property-container" title="属性" bordered>
            <overlay-scrollbars class="scroll-bar">
              <el-form
                class="property-form"
                label-position="left"
                label-width="120px"
                inline
                :model="memo"
              >
                <el-form-item label="概要" style="width: 100%">
                  {{ memo.profile }}
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  {{ memo.remark }}
                </el-form-item>
                <el-form-item label="星标" style="width: 50%">
                  {{ memo.star_flag ? '是' : '否' }}
                </el-form-item>
                <el-form-item label="优先级" style="width: 50%">
                  {{ memo.priority }}
                </el-form-item>
                <el-form-item label="创建日期" style="width: 50%">
                  {{ wrappedFormatTimestamp(memo.created_date) }}
                </el-form-item>
                <el-form-item label="修改日期" style="width: 50%">
                  {{ wrappedFormatTimestamp(memo.modified_date) }}
                </el-form-item>
                <el-form-item label="预期完成时间" style="width: 50%">
                  {{ wrappedFormatTimestamp(memo.expected_finish_date) }}
                </el-form-item>
                <el-form-item label="简报" style="width: 100%">
                  <el-input
                    v-model="memo.brief"
                    type="textarea"
                    resize="none"
                    readonly
                    autosize
                  />
                </el-form-item>
              </el-form>
            </overlay-scrollbars>
          </title-layout-panel>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      custom-class="entity-maintain-dialog"
      top="12vh"
      label-width="120px"
      mode="EDIT"
      :visible.sync="maintainDialog.dialogVisible"
      :entity="maintainDialog.anchorEntity"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="概要" prop="profile">
        <el-input
          v-model="maintainDialog.anchorEntity.profile"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
        />
      </el-form-item>
      <el-form-item label="星标" prop="star_flag">
        <el-switch
          v-model="maintainDialog.anchorEntity.star_flag"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-input-number
          class="short-bar"
          v-model="maintainDialog.anchorEntity.priority"
          :min="0"
          :max="10"
        />
      </el-form-item>
      <el-form-item label="预期完成时间" prop="expected_finish_date">
        <el-date-picker
          class="short-bar"
          v-model="maintainDialog.anchorEntity.expected_finish_date"
          type="datetime"
          placeholder="选择时间"
          :picker-options="maintainDialog.pickerOptions"
        />
      </el-form-item>
      <el-form-item label="简报" prop="brief">
        <el-input
          v-model="maintainDialog.anchorEntity.brief"
          type="textarea"
          resize="none"
          :rows="6"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import { formatTimestamp } from '@/util/timestamp';
import { inspect, update } from '@/api/project/memo';
import resolveResponse from '@/util/response';

export default {
  name: 'MemoInfoPanel',
  components: { EntityMaintainDialog, TitleLayoutPanel, HeaderLayoutPanel },
  props: {
    memoId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    memoId() {
      this.handleSearch();
    },
  },
  data() {
    return {
      loading: false,
      memo: {
        profile: '',
        remark: '',
        star_flag: false,
        priority: 0,
        created_date: '',
        modified_date: '',
        expected_finish_date: null,
        brief: '',
      },
      maintainDialog: {
        loading: false,
        dialogVisible: false,
        anchorEntity: {
          profile: '',
          remark: '',
          star_flag: false,
          priority: 0,
          expected_finish_date: null,
          brief: '',
        },
        rules: {
          profile: [
            { required: true, message: '概要不能为空', trigger: 'blur' },
          ],
        },
        pickerOptions: {
          shortcuts: [
            {
              text: '今天',
              onClick(picker) {
                picker.$emit('pick', new Date());
              },
            },
            {
              text: '明天',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24);
                picker.$emit('pick', date);
              },
            },
            {
              text: '一周后',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
                picker.$emit('pick', date);
              },
            },
            {
              text: '30天后',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 30);
                picker.$emit('pick', date);
              },
            },
          ],
        },
      },
    };
  },
  methods: {
    handleSearch() {
      if (this.memoId === '') {
        return;
      }
      this.inspectEntity();
    },
    inspectEntity() {
      this.loading = true;
      resolveResponse(inspect(this.memoId))
        .then(this.updateEntityView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateEntityView(res) {
      this.memo.profile = res.profile;
      this.memo.remark = res.remark;
      this.memo.star_flag = res.star_flag;
      this.memo.priority = res.priority;
      this.memo.created_date = res.created_date;
      this.memo.modified_date = res.modified_date;
      this.memo.expected_finish_date = res.expected_finish_date;
      this.memo.brief = res.brief;
    },
    wrappedFormatTimestamp(timestamp) {
      if (timestamp === null || timestamp === undefined || timestamp === 0) {
        return '（暂无）';
      }
      return formatTimestamp(timestamp);
    },
    handleShowEditDialog() {
      this.syncAnchorEntity();
      this.showDialog();
    },
    syncAnchorEntity() {
      this.maintainDialog.anchorEntity.profile = this.memo.profile;
      this.maintainDialog.anchorEntity.remark = this.memo.remark;
      this.maintainDialog.anchorEntity.star_flag = this.memo.star_flag;
      this.maintainDialog.anchorEntity.priority = this.memo.priority;
      this.maintainDialog.anchorEntity.expected_finish_date = this.memo.expected_finish_date;
      this.maintainDialog.anchorEntity.brief = this.memo.brief;
    },
    showDialog() {
      this.maintainDialog.dialogVisible = true;
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.memoId,
        this.maintainDialog.anchorEntity.profile,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.star_flag,
        this.maintainDialog.anchorEntity.priority,
        this.maintainDialog.anchorEntity.expected_finish_date,
        this.maintainDialog.anchorEntity.brief,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '备忘录更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.maintainDialog.dialogVisible = false;
          this.$emit('onMemoPropertyUpdated');
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.memo-info-panel-container {
  height: 100%;
  width: 100%;
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

.property-container {
  height: 100%;
  width: 100%;
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-container .property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.property-container .property-form >>> textarea{
  padding: 0;
  border: none;
  font:unset;
  font-size: 14px;
  color: #303133;
}

/*noinspection CssUnusedSymbol*/
.entity-maintain-dialog .short-bar{
  width: 200px;
}
</style>
