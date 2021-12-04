<template>
  <div class="account-book-container">
    <content-panel
      class="content-panel"
      :header-visible="true"
    >
      <card-list-panel
        title-prop="name"
        card-width="calc(20% - 18px)"
        :data="entities.data"
        :maxCard="1000"
        :inspect-button-visible="false"
        :addon-button-visible="false"
        @onItemToEdit="handleItemToEdit"
        @onItemToDelete="handleItemToDelete"
      >
        <template slot-scope="card">
          <div class="account-book-card-container">
            <div class="account-book-property">
              <span class="iconfont account-book-property-icon" style="color:black">&#xfffa;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="account-book-property-text">
                权限: {{ card.item.owner_flag ? '所有者' : '访客' }}
              </span>
            </div>
            <div class="account-book-property">
              <span class="iconfont account-book-property-icon" style="color:black">&#xfffb;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="account-book-property-text">
                所有者: {{ card.item.owner_account.key.string_id }}
              </span>
            </div>
            <div class="account-book-property">
              <span class="iconfont account-book-property-icon" style="color:black">&#xfff9;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="account-book-property-text">
                余额: {{ card.item.total_value }}
              </span>
            </div>
            <div class="account-book-property">
              <span class="iconfont account-book-property-icon" style="color:black">&#xffef;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="account-book-property-text">
                记录日期: {{ formatTimestamp(card.item.last_recorded_date) }}
              </span>
            </div>
          </div>
        </template>
      </card-list-panel>
      <div class="header-container" slot="header">
        <el-button
          type="primary"
          @click="handleAccountBookToCreate"
        >
          创建账本
        </el-button>
        <el-divider direction="vertical"/>
        <el-switch
          v-model="inspectAllSwitch.inspectAll"
          active-text="看所有的"
          inactive-text="看自己的"
          @change="handleInspectAllSwitchChanged"
        />
      </div>
    </content-panel>
    <entity-maintain-dialog
      :mode="accountBookMaintainDialog.dialogMode"
      :visible.sync="accountBookMaintainDialog.dialogVisible"
      :entity="accountBookMaintainDialog.anchorEntity"
      :create-rules="accountBookMaintainDialog.rules"
      :edit-rules="accountBookMaintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleAccountBookCreate"
      @onEntityEdit="handleAccountBookEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="accountBookMaintainDialog.anchorEntity.name"
          :readonly="accountBookMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="accountBookMaintainDialog.anchorEntity.remark"
          :readonly="accountBookMaintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import CardListPanel from '@/components/layout/CardListPanel.vue';
import EntityMaintainDialog from '@/components/dialog/EntityMaintainDialog.vue';

import resolveResponse from '@/util/response';
import {
  allPermitted, allOwned, create, update, remove,
} from '@/api/finance/accountBook';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'AccountBook',
  components: { CardListPanel, ContentPanel, EntityMaintainDialog },
  data() {
    return {
      entities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      accountBookMaintainDialog: {
        dialogMode: 'CREATE',
        dialogVisible: false,
        anchorEntity: {
          long_id: '',
          name: '',
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '账本名称不能为空', trigger: 'blur' },
          ],
        },
      },
      cardList: {
        maxCard: 10,
      },
      inspectAllSwitch: {
        inspectAll: true,
      },
    };
  },
  methods: {
    handleSearch() {
      if (this.inspectAllSwitch) {
        this.lookupAllPermitted();
      } else {
        this.lookupAllOwned();
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
    updateCardListView(res) {
      this.entities = res;
    },
    handleAccountBookToCreate() {
      resolveResponse(allOwned(0, 1000))
        .then((res) => {
          if (res.count >= this.cardList.maxCard) {
            this.$alert(
              `您创建了过多的账本，每个人创建账本的最大数量不应超过 ${this.cardList.maxCard}
               个！<br>${this.cardList.maxCard}个应该够用了QwQ`,
              {
                confirmButtonText: '确定',
                dangerouslyUseHTMLString: true,
                type: 'warning',
                customClass: 'custom-message-box__w500',
              },
            );
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          this.accountBookMaintainDialog.dialogMode = 'CREATE';
          this.accountBookMaintainDialog.dialogVisible = true;
        })
        .catch(() => {
        });
    },
    handleAccountBookCreate() {
      resolveResponse(create(
        this.accountBookMaintainDialog.anchorEntity.name,
        this.accountBookMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `账本 ${this.accountBookMaintainDialog.anchorEntity.name} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.accountBookMaintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleAccountBookEdit() {
      resolveResponse(update(
        this.accountBookMaintainDialog.anchorEntity.long_id,
        this.accountBookMaintainDialog.anchorEntity.name,
        this.accountBookMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `账本 ${this.accountBookMaintainDialog.anchorEntity.name} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.accountBookMaintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleItemToEdit(index, item) {
      if (!item.owner_flag) {
        this.$alert('您不是此账本的所有者，无权编辑该账本！', '权限不足', {
          confirmButtonText: '确定',
          type: 'warning',
          customClass: 'custom-message-box__w500',
        });
        return;
      }
      this.accountBookMaintainDialog.anchorEntity.long_id = item.key.long_id;
      this.accountBookMaintainDialog.anchorEntity.name = item.name;
      this.accountBookMaintainDialog.anchorEntity.remark = item.remark;
      this.accountBookMaintainDialog.dialogMode = 'EDIT';
      this.accountBookMaintainDialog.dialogVisible = true;
    },
    handleItemToDelete(index, item) {
      // noinspection JSUnresolvedVariable
      Promise.resolve(item)
        .then((res) => {
          // noinspection JSUnresolvedVariable
          if (!res.owner_flag) {
            this.$alert('您不是此账本的所有者，无权删除该账本！', '权限不足', {
              confirmButtonText: '确定',
              type: 'warning',
              customClass: 'custom-message-box__w500',
            });
            return Promise.reject();
          }
          return Promise.resolve(res.key.long_id);
        })
        .then((res) => this.$confirm('此操作将永久删除此账本。<br>是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            customClass: 'custom-message-box__w500',
            type: 'warning',
          }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(res)))
        .then(() => {
          this.$message({
            showClose: true,
            message: `账本 ${item.name} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
    formatTimestamp(timestamp) {
      return formatTimestamp(timestamp);
    },
    handleInspectAllSwitchChanged() {
      this.handleSearch();
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.account-book-container {
  width: 100%;
  height: 100%;
}

.account-book-card-container {
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

.account-book-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.account-book-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.account-book-property-text {
  font-size: 14px;
  margin-right: 4px;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
