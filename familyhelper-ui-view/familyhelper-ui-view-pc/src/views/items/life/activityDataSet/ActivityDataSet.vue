<template>
  <div class="activity-data-set-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-switch
            v-model="inspectAllSwitch.inspectAll"
            active-text="看所有的"
            inactive-text="看自己的"
            @change="handleInspectAllSwitchChanged"
          />
          <el-divider direction="vertical"/>
          <el-button
            type="success"
            size="medium"
            @click="handleSearch"
          >
            刷新数据
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <card-panel
          class="card-panel"
          title-prop="name"
          card-width="calc(20% - 18px)"
          :data="cardPanel.entities.data"
          :maxCard="1000"
          :show-contextmenu="true"
          :contextmenu-width="110"
          @onAddonClicked="handleActivityDataSetToCreate"
        >
          <template v-slot:default="{item}">
            <div class="activity-data-set-card-container">
              <div class="activity-data-set-property">
                <span
                  class="iconfont activity-data-set-property-icon"
                  style="color:black"
                >
                  &#xfffa;
                </span>
                <!--suppress JSUnresolvedReference -->
                <span class="activity-data-set-property-text">
                  权限: {{ item.permission_level | permissionLabelFilter }}
                </span>
              </div>
              <div class="activity-data-set-property">
                <span
                  class="iconfont activity-data-set-property-icon"
                  style="color:black"
                >
                  &#xfffb;
                </span>
                <span class="activity-data-set-property-text">
                  所有者: {{ item.owner_account.display_name }}
                </span>
              </div>
              <div class="activity-data-set-property">
                <span
                  class="iconfont activity-data-set-property-icon"
                  style="color:black"
                >
                  &#xffe7;
                </span>
                <span class="activity-data-set-property-text">
                  项目总数: {{ item.item_count }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:header="{index,item}">
            <el-button-group class="activity-data-set-control-button-group">
              <!--suppress JSUnresolvedReference -->
              <el-button
                class="card-button"
                size="mini"
                icon="el-icon-edit"
                :disabled="item.permission_level !== 0"
                @click="handleItemToEdit(index, item)"
              />
              <!--suppress JSUnresolvedReference -->
              <el-button
                class="card-button"
                size="mini"
                icon="el-icon-lock"
                :disabled="item.permission_level !== 0"
                @click="handleItemToPermit(index, item)"
              />
              <!--suppress JSUnresolvedReference -->
              <el-button
                class="card-button"
                size="mini"
                icon="el-icon-delete"
                :disabled="item.permission_level !== 0"
                @click="handleItemToDelete(index, item)"
              />
            </el-button-group>
          </template>
        </card-panel>
      </template>
    </border-layout-panel>
    <entity-maintain-dialog
      :mode="entityMaintainDialog.mode"
      :visible.sync="entityMaintainDialog.visible"
      :entity="entityMaintainDialog.anchorEntity"
      :create-rules="entityMaintainDialog.rules"
      :edit-rules="entityMaintainDialog.rules"
      :close-on-click-modal="false"
      :loading="entityMaintainDialog.loading"
      @onEntityCreate="handleActivityDataSetCreate"
      @onEntityEdit="handleActivityDataSetEdit"
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
      :activity-data-set-id="permitMaintainDialog.activityDataSetId"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import CardPanel from '@/components/layout/CardPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import PermitMaintainDialog from '@/views/items/life/activityDataSet/PermitMaintainDialog.vue';

import {
  allOwnedDisp, allPermittedDisp, create, remove, update,
} from '@/api/life/activityDataSet';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityDataSet',
  components: {
    PermitMaintainDialog, EntityMaintainDialog, CardPanel, BorderLayoutPanel,
  },
  data() {
    return {
      loading: false,
      inspectAllSwitch: {
        inspectAll: false,
      },
      cardPanel: {
        maxCard: 100,
        entities: {
          data: [],
        },
      },
      entityMaintainDialog: {
        loading: false,
        mode: 'CREATE',
        visible: false,
        anchorEntity: {
          long_id: '',
          name: '',
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '活动数据集合名称不能为空', trigger: 'blur' },
          ],
        },
      },
      permitMaintainDialog: {
        visible: false,
        activityDataSetId: '',
      },
    };
  },
  filters: {
    permissionLabelFilter(permissionLevel) {
      switch (permissionLevel) {
        case 0:
          return '所有者';
        case 1:
          return '访客';
        default:
          return '未知';
      }
    },
  },
  methods: {
    handleInspectAllSwitchChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.inspectAllSwitch.inspectAll) {
        this.lookupAllPermitted();
      } else {
        this.lookupAllOwned();
      }
    },
    lookupAllPermitted() {
      this.loading = true;
      resolveResponse(allPermittedDisp(0, 1000))
        .then(this.updateCardListView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    lookupAllOwned() {
      this.loading = true;
      resolveResponse(allOwnedDisp(0, 1000))
        .then(this.updateCardListView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateCardListView(res) {
      this.cardPanel.entities.data = res.data;
    },
    handleActivityDataSetToCreate() {
      this.loading = true;
      resolveResponse(allOwnedDisp(0, 1000))
        .then((res) => {
          if (res.count >= this.cardPanel.maxCard) {
            this.$alert(
              `您创建了过多的活动数据集合，每个人创建活动数据集合的最大数量不应超过
            ${this.cardPanel.maxCard} 个！<br>${this.cardPanel.maxCard} 个应该够用了QwQ`,
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
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleActivityDataSetCreate() {
      this.entityMaintainDialog.loading = true;
      resolveResponse(create(
        this.entityMaintainDialog.anchorEntity.name,
        this.entityMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `活动数据集合 ${this.entityMaintainDialog.anchorEntity.name} 创建成功`,
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
        })
        .finally(() => {
          this.entityMaintainDialog.loading = false;
        });
    },
    handleActivityDataSetEdit() {
      this.entityMaintainDialog.loading = true;
      resolveResponse(update(
        this.entityMaintainDialog.anchorEntity.long_id,
        this.entityMaintainDialog.anchorEntity.name,
        this.entityMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `活动数据集合 ${this.entityMaintainDialog.anchorEntity.name} 更新成功`,
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
        })
        .finally(() => {
          this.entityMaintainDialog.loading = false;
        });
    },
    handleItemToEdit(index, item) {
      if (item.permission_level !== 0) {
        this.$alert(
          '您不是此活动数据集合的所有者，无权编辑该活动数据集合！', '权限不足', {
            confirmButtonText: '确定',
            dangerouslyUseHTMLString: true,
            type: 'warning',
            customClass: 'custom-message-box__w500',
          },
        );
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
            this.$alert(
              '您不是此活动数据集合的所有者，无权分配该活动数据集合的权限！',
              '权限不足', {
                confirmButtonText: '确定',
                type: 'warning',
                customClass: 'custom-message-box__w500',
              },
            );
            return Promise.reject();
          }
          return Promise.resolve(res.key.long_id);
        }).then(() => {
          this.permitMaintainDialog.activityDataSetId = item.key.long_id;
          this.permitMaintainDialog.visible = true;
        }).catch(() => {
        });
    },
    handleItemToDelete(index, item) {
      // noinspection JSUnresolvedReference
      Promise.resolve(item)
        .then((res) => {
          if (res.permission_level !== 0) {
            this.$alert(
              '您不是此活动数据集合的所有者，无权删除该活动数据集合！', '权限不足', {
                confirmButtonText: '确定',
                dangerouslyUseHTMLString: true,
                type: 'warning',
                customClass: 'custom-message-box__w500',
              },
            );
            return Promise.reject();
          }
          return Promise.resolve(res);
        })
        .then((res) => this.$confirm(
          `此操作将永久删除活动数据集合 ${res.name}。<br>是否继续?`,
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            type: 'warning',
            customClass: 'custom-message-box__w500',
          },
        ).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(res.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: `活动数据集合 ${item.name} 删除成功`,
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
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.activity-data-set-container {
  width: 100%;
  height: 100%;
}

.border-layout-panel {
  width: 100%;
  height: 100%;
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

.activity-data-set-card-container {
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

.activity-data-set-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.activity-data-set-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.activity-data-set-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.card-panel {
  width: 100%;
  height: 100%;
}

.card-panel .activity-data-set-control-button-group {
  display: flex;
}

.card-panel .card-button {
  padding: 7px;
}

</style>
