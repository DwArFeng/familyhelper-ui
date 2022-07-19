<template>
  <div class="pb-set-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
    >
      <card-panel
        title-prop="name"
        card-width="calc(20% - 18px)"
        :data="cardPanel.entities.data"
        :maxCard="1000"
        :show-contextmenu="true"
        :contextmenu-width="110"
        @onAddonClicked="handlePbSetToCreate"
      >
        <template v-slot:default="{index,item}">
          <div class="pb-set-card-container">
            <div class="pb-set-property">
              <span class="iconfont pb-set-property-icon" style="color:black">&#xfffa;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="pb-set-property-text">
                权限: {{ resolvePermissionLabel(item.permission_level) }}
              </span>
            </div>
            <div class="pb-set-property">
              <span class="iconfont pb-set-property-icon" style="color:black">&#xfffb;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="pb-set-property-text">
                所有者: {{ item.owner_account.display_name }}
              </span>
            </div>
            <div class="pb-set-property">
              <span class="iconfont pb-set-property-icon" style="color:black">&#xffe7;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="pb-set-property-text">
                项目总数: {{ item.item_count }}
              </span>
            </div>
            <div class="pb-set-property">
              <span class="iconfont pb-set-property-icon" style="color:black">&#xffef;</span>
              <!--suppress JSUnresolvedVariable -->
              <span class="pb-set-property-text">
                最新记录日期: {{ formatTimestamp(item.last_recorded_date) }}
              </span>
            </div>
          </div>
        </template>
        <template v-slot:header="{index,item}">
          <el-button-group class="pb-set-control-button-group">
            <el-button
              class="card-button"
              size="mini"
              icon="el-icon-edit"
              :disabled="item.permission_level !== 0"
              @click="handleItemToEdit(index, item)"
            />
            <el-button
              class="card-button"
              size="mini"
              icon="el-icon-lock"
              :disabled="item.permission_level !== 0"
              @click="handleItemToPermit(index, item)"
            />
            <el-button
              class="card-button"
              size="mini"
              icon="el-icon-delete"
              :disabled="item.permission_level !== 0"
              @click="handleItemToDelete(index, item)"
            />
          </el-button-group>
        </template>
        <template v-slot:contextmenu="{index,item,close}">
          <ul class="my-contextmenu">
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:item.permission_level !== 0}"
              @click="handleEditMenuItemClicked(index,item,close,$event)"
            >
              编辑...
            </li>
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:item.permission_level !== 0}"
              @click="handlePermitMenuItemClicked(index,item,close,$event)"
            >
              分配权限...
            </li>
            <!--suppress JSUnresolvedVariable -->
            <li
              :class="{disabled:item.permission_level !== 0}"
              @click="handleDeleteMenuItemClicked(index,item,close,$event)"
            >
              删除...
            </li>
          </ul>
        </template>
      </card-panel>
      <div class="header-container" slot="header">
        <el-switch
          v-model="inspectAllSwitch.inspectAll"
          active-text="看所有的"
          inactive-text="看自己的"
          @change="handleInspectAllSwitchChanged"
        />
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      :mode="entityMaintainDialog.mode"
      :visible.sync="entityMaintainDialog.visible"
      :entity="entityMaintainDialog.anchorEntity"
      :create-rules="entityMaintainDialog.rules"
      :edit-rules="entityMaintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handlePbSetCreate"
      @onEntityEdit="handlePbSetEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="entityMaintainDialog.anchorEntity.name"
          :readonly="entityMaintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="entityMaintainDialog.anchorEntity.remark"
          :readonly="entityMaintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <permit-maintain-dialog
      :visible.sync="permitMaintainDialog.visible"
      :pb-set-id="permitMaintainDialog.pbSetId"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import CardPanel from '@/components/layout/CardPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import PermitMaintainDialog from '@/views/items/life/pbSet/PermitMaintainDialog.vue';

import resolveResponse from '@/util/response';
import {
  allOwnedDisp, allPermittedDisp, create, remove, update,
} from '@/api/life/pbSet';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'PbSet',
  components: {
    PermitMaintainDialog, CardPanel, BorderLayoutPanel, EntityMaintainDialog,
  },
  data() {
    return {
      entityMaintainDialog: {
        mode: 'CREATE',
        visible: false,
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
      permitMaintainDialog: {
        visible: false,
        pbSetId: '',
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
      inspectAllSwitch: {
        inspectAll: true,
      },
    };
  },
  methods: {
    handleSearch() {
      if (this.inspectAllSwitch.inspectAll) {
        this.lookupAllPermitted();
      } else {
        this.lookupAllOwned();
      }
    },
    lookupAllPermitted() {
      resolveResponse(allPermittedDisp(0, 1000))
        .then(this.updateCardListView)
        .catch(() => {
        });
    },
    lookupAllOwned() {
      resolveResponse(allOwnedDisp(0, 1000))
        .then(this.updateCardListView)
        .catch(() => {
        });
    },
    updateCardListView(res) {
      this.cardPanel.entities = res;
    },
    handlePbSetToCreate() {
      resolveResponse(allOwnedDisp(0, 1000))
        .then((res) => {
          if (res.count >= this.cardPanel.maxCard) {
            this.$alert(
              `您创建了过多的账本，每个人创建账本的最大数量不应超过 ${this.cardPanel.maxCard}
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
    handlePbSetCreate() {
      resolveResponse(create(
        this.entityMaintainDialog.anchorEntity.name,
        this.entityMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `账本 ${this.entityMaintainDialog.anchorEntity.name} 创建成功`,
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
    handlePbSetEdit() {
      resolveResponse(update(
        this.entityMaintainDialog.anchorEntity.long_id,
        this.entityMaintainDialog.anchorEntity.name,
        this.entityMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `账本 ${this.entityMaintainDialog.anchorEntity.name} 更新成功`,
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
      if (item.permission_level !== 0) {
        this.$alert('您不是此账本的所有者，无权编辑该账本！', '权限不足', {
          confirmButtonText: '确定',
          type: 'warning',
          customClass: 'custom-message-box__w500',
        });
        return;
      }
      this.entityMaintainDialog.anchorEntity.long_id = item.key.long_id;
      this.entityMaintainDialog.anchorEntity.name = item.name;
      this.entityMaintainDialog.anchorEntity.remark = item.remark;
      this.entityMaintainDialog.mode = 'EDIT';
      this.entityMaintainDialog.visible = true;
    },
    handleItemToPermit(index, item) {
      Promise.resolve(item)
        .then((res) => {
          // noinspection JSUnresolvedVariable
          if (res.permission_level !== 0) {
            this.$alert('您不是此账本的所有者，无权分配该账本的权限！', '权限不足', {
              confirmButtonText: '确定',
              type: 'warning',
              customClass: 'custom-message-box__w500',
            });
            return Promise.reject();
          }
          return Promise.resolve(res.key.long_id);
        }).then(() => {
          this.permitMaintainDialog.pbSetId = item.key.long_id;
          this.permitMaintainDialog.visible = true;
        }).catch(() => {
        });
    },
    handleItemToDelete(index, item) {
      // noinspection JSUnresolvedVariable
      Promise.resolve(item)
        .then((res) => {
          // noinspection JSUnresolvedVariable
          if (res.permission_level !== 0) {
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
    handleEditMenuItemClicked(index, item, close, event) {
      if (item.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleItemToEdit(index, item);
    },
    handlePermitMenuItemClicked(index, item, close, event) {
      if (item.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleItemToPermit(index, item);
    },
    handleDeleteMenuItemClicked(index, item, close, event) {
      if (item.permission_level !== 0) {
        event.preventDefault();
        return;
      }
      close();
      this.handleItemToEdit(index, item);
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.pb-set-container {
  width: 100%;
  height: 100%;
}

.pb-set-card-container {
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

.pb-set-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.pb-set-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.pb-set-property-text {
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

.pb-set-control-button-group {
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

/*noinspection CssUnusedSymbol*/
.my-contextmenu li.disabled {
  color: grey;
  cursor: not-allowed;
}
</style>
