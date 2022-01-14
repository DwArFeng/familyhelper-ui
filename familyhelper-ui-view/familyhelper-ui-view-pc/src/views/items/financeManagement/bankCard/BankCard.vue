<template>
  <div class="bank-card-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
    >
      <card-panel
        title-prop="name"
        card-width="calc(20% - 18px)"
        :data="cardPanel.entities.data"
        :maxCard="cardPanel.maxCard"
        :show-contextmenu="true"
        :addon-button-visible="addonButtonVisible"
        @onAddonClicked="handleBankCardToCreate"
      >
        <template v-slot:default="{index,item}">
          <div class="bank-card-card-container">
            <div class="bank-card-property">
              <span class="iconfont bank-card-property-icon" style="color:black">&#xffee;</span>
              <!--suppress JSUnresolvedVariable -->
              <div class="bank-card-property-text">
                <span>类型: </span>
                <el-tooltip
                  effect="dark"
                  placement="right"
                  :content="cardTypeLabel(item).remark"
                  :open-delay="500"
                >
                  <span>{{ cardTypeLabel(item).label }}</span>
                </el-tooltip>
              </div>
            </div>
            <div class="bank-card-property">
              <span class="iconfont bank-card-property-icon" style="color:black">&#xfff9;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="bank-card-property-text">
                余额: {{ item.balance_value }}
              </span>
            </div>
            <div class="bank-card-property">
              <span class="iconfont bank-card-property-icon" style="color:black">&#xffef;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="bank-card-property-text">
                记录日期: {{ formatTimestamp(item.last_recorded_date) }}
              </span>
            </div>
          </div>
        </template>
        <template v-slot:header="{index,item}">
          <el-button-group class="bank-card-control-button-group">
            <el-button
              class="card-button"
              size="mini"
              icon="el-icon-edit"
              :disabled="parentSelection.accountBook.permission_level !== 0"
              @click="handleItemToEdit(index, item)"
            />
            <el-button
              class="card-button"
              size="mini"
              icon="el-icon-delete"
              :disabled="parentSelection.accountBook.permission_level !== 0"
              @click="handleItemToDelete(index, item)"
            />
          </el-button-group>
        </template>
        <template v-slot:contextmenu="{index,item,close}">
          <ul class="my-contextmenu">
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:parentSelection.accountBook.permission_level !== 0}"
              @click="handleEditMenuItemClicked(index,item,close,$event)"
            >
              编辑...
            </li>
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:parentSelection.accountBook.permission_level !== 0}"
              @click="handleDeleteMenuItemClicked(index,item,close,$event)"
            >
              删除...
            </li>
          </ul>
        </template>
      </card-panel>
      <div class="header-container" slot="header">
        <el-input
          class="header-account-book-indicator"
          v-model="parentSelection.displayValue"
          readonly
        >
          <span slot="prepend">当前账本</span>
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleShowAccountBookSelectDialog"
          />
        </el-input>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      :mode="entityMaintainDialog.mode"
      :visible.sync="entityMaintainDialog.visible"
      :entity="entityMaintainDialog.anchorEntity"
      :create-rules="entityMaintainDialog.rules"
      :edit-rules="entityMaintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleBankCardCreate"
      @onEntityEdit="handleBankCardEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="entityMaintainDialog.anchorEntity.name"
          :readonly="entityMaintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="类型" prop="card_type">
        <el-select
          class='bank-card-type-select'
          v-model="entityMaintainDialog.anchorEntity.card_type"
          placeholder="请选择"
        >
          <el-option
            v-for="item in bankCardTypeIndicator.entities.data"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="entityMaintainDialog.anchorEntity.remark"
          :readonly="entityMaintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <account-book-select-dialog
      type="BANK_CARD"
      :visible.sync="accountBookSelectDialog.visible"
      @onConfirm="handleAccountBookConfirmed"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import CardPanel from '@/components/card/CardPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import AccountBookSelectDialog
from '@/views/items/financeManagement/accountBook/AccountBookSelectDialog.vue';

import resolveResponse from '@/util/response';
import {
  childForAccountBookDisp, create, remove, update,
} from '@/api/finance/bankCard';
import {
  all as allBankCardTypeIndicator,
} from '@/api/finance/bankCardTypeIndicator';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'BankCard',
  components: {
    CardPanel, BorderLayoutPanel, EntityMaintainDialog, AccountBookSelectDialog,
  },
  computed: {
    addonButtonVisible() {
      return this.parentSelection.accountBookId !== ''
        && this.parentSelection.accountBook.permission_level === 0;
    },
  },
  data() {
    return {
      parentSelection: {
        accountBookId: '',
        accountBook: null,
        displayValue: '',
      },
      entityMaintainDialog: {
        mode: 'CREATE',
        visible: false,
        anchorEntity: {
          long_id: '',
          name: '',
          card_type: '',
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '银行卡名称不能为空', trigger: 'blur' },
          ],
          card_type: [
            { required: true, message: '请选择银行卡类型', trigger: 'blur' },
          ],
        },
      },
      cardPanel: {
        maxCard: 100,
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      accountBookSelectDialog: {
        visible: false,
      },
      bankCardTypeIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
    };
  },
  methods: {
    handleBankCardTypeIndicatorSearch() {
      this.lookupAllBankCardTypeIndicator();
    },
    lookupAllBankCardTypeIndicator() {
      resolveResponse(allBankCardTypeIndicator(0, 1000))
        .then(this.updateBankCardTypeIndicatorObject)
        .catch(() => {
        });
    },
    updateBankCardTypeIndicatorObject(res) {
      this.bankCardTypeIndicator.entities = res;
    },
    handleSearch() {
      this.lookupChildForAccountBook();
    },
    lookupChildForAccountBook() {
      resolveResponse(childForAccountBookDisp(this.parentSelection.accountBookId, 0, 1000))
        .then(this.updateCardPanelView)
        .catch(() => {
        });
    },
    updateCardPanelView(res) {
      this.cardPanel.entities = res;
    },
    handleBankCardToCreate() {
      resolveResponse(childForAccountBookDisp(this.parentSelection.accountBookId, 0, 1000))
        .then((res) => {
          if (res.count >= this.cardPanel.maxCard) {
            this.$alert(
              `您创建了过多的银行卡，每个人创建银行卡的最大数量不应超过 ${this.cardPanel.maxCard}
               个！<br>${this.cardPanel.maxCard}个应该够用了QwQ`,
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
          this.entityMaintainDialog.mode = 'CREATE';
          this.entityMaintainDialog.visible = true;
        })
        .catch(() => {
        });
    },
    handleBankCardCreate() {
      resolveResponse(create(
        this.parentSelection.accountBookId,
        this.entityMaintainDialog.anchorEntity.name,
        this.entityMaintainDialog.anchorEntity.card_type,
        this.entityMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `银行卡 ${this.entityMaintainDialog.anchorEntity.name} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.entityMaintainDialog.visible = false;
        })
        .catch(() => {
        });
    },
    handleBankCardEdit() {
      resolveResponse(update(
        this.entityMaintainDialog.anchorEntity.long_id,
        this.entityMaintainDialog.anchorEntity.name,
        this.entityMaintainDialog.anchorEntity.card_type,
        this.entityMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `银行卡 ${this.entityMaintainDialog.anchorEntity.name} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.entityMaintainDialog.visible = false;
        })
        .catch(() => {
        });
    },
    handleItemToEdit(index, item) {
      // noinspection JSUnresolvedVariable,JSIncompatibleTypesComparison
      if (this.parentSelection.accountBook.permission_level !== 0) {
        this.$alert('您不是此账本的所有者，无权编辑该账本！', '权限不足', {
          confirmButtonText: '确定',
          type: 'warning',
          customClass: 'custom-message-box__w500',
        });
        return;
      }
      this.entityMaintainDialog.anchorEntity.long_id = item.key.long_id;
      this.entityMaintainDialog.anchorEntity.name = item.name;
      this.entityMaintainDialog.anchorEntity.card_type = item.card_type;
      this.entityMaintainDialog.anchorEntity.remark = item.remark;
      this.entityMaintainDialog.mode = 'EDIT';
      this.entityMaintainDialog.visible = true;
    },
    handleItemToDelete(index, item) {
      // noinspection JSUnresolvedVariable
      Promise.resolve(item)
        .then((res) => {
          // noinspection JSUnresolvedVariable
          if (this.parentSelection.accountBook.permission_level !== 0) {
            this.$alert('您不是此账本的所有者，无权删除该账本！', '权限不足', {
              confirmButtonText: '确定',
              type: 'warning',
              customClass: 'custom-message-box__w500',
            });
            return Promise.reject();
          }
          return Promise.resolve(res.key.long_id);
        })
        .then((res) => this.$confirm('此操作将永久删除此银行卡。<br>是否继续?',
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
            message: `银行卡 ${item.name} 删除成功`,
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
    updateParentSelectionDisplayValue() {
      if (this.parentSelection.accountBook === null) {
        this.parentSelection.displayValue = '（未选择账本）';
      } else {
        this.parentSelection.displayValue = this.parentSelection.accountBook.name;
      }
    },
    handleShowAccountBookSelectDialog() {
      this.accountBookSelectDialog.visible = true;
    },
    handleAccountBookConfirmed(accountBook) {
      this.parentSelection.accountBook = accountBook;
      this.parentSelection.accountBookId = accountBook.key.long_id;
      this.parentSelection.displayValue = accountBook.name;
      this.handleSearch();
    },
    cardTypeLabel(item) {
      // noinspection JSUnresolvedVariable
      if (item.type_indicator !== null) {
        // noinspection JSUnresolvedVariable
        return {
          label: item.type_indicator.label,
          remark: item.type_indicator.remark,
        };
      }
      if ((item.card_type !== '' || item.card_type !== null)) {
        return {
          label: '（未知）',
          remark: '该银行卡类型经过维护，但是类型已经被删除',
        };
      }
      return {
        label: '（未指定）',
        remark: '该银行卡未指定类型',
      };
    },
    handleEditMenuItemClicked(index, item, close, event) {
      if (this.parentSelection.accountBook.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleItemToEdit(index, item);
    },
    handleDeleteMenuItemClicked(index, item, close, event) {
      if (this.parentSelection.accountBook.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleItemToDelete(index, item);
    },
  },
  mounted() {
    this.updateParentSelectionDisplayValue();
    this.handleBankCardTypeIndicatorSearch();
  },
};
</script>

<style scoped>
.bank-card-container {
  height: 100%;
  width: 100%;
}

.header-account-book-indicator {
  width: 360px;
}

/*noinspection CssUnusedSymbol*/
.header-account-book-indicator >>> .el-input__inner {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.header-account-book-indicator >>> .el-input-group__prepend {
  padding: 0 10px;
}

.bank-card-type-select {
  width: 100%;
}

.bank-card-card-container {
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

.bank-card-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.bank-card-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.bank-card-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.bank-card-control-button-group {
  display: flex;
}

.card-button {
  padding: 7px;
}

.my-contextmenu {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.my-contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
  user-select: none;
}

.my-contextmenu li:hover {
  background: #eee;
}

.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}
</style>
