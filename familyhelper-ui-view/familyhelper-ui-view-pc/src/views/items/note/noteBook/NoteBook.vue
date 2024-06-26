<template>
  <div class="note-book-container">
    <border-layout-panel
      class="border-layout-panel"
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
          title-prop="name"
          card-width="calc(20% - 18px)"
          :data="cardPanel.entities.data"
          :maxCard="1000"
          :show-contextmenu="true"
          :contextmenu-width="110"
          @onAddonClicked="handleNoteBookToCreate"
        >
          <template v-slot:default="{item}">
            <div class="note-book-card-container">
              <div class="note-book-property">
                <span
                  class="iconfont note-book-property-icon"
                  style="color:black"
                >
                  &#xfffa;
                </span>
                <!--suppress JSUnresolvedVariable -->
                <span class="note-book-property-text">
                权限: {{ resolvePermissionLabel(item.permission_level) }}
              </span>
              </div>
              <div class="note-book-property">
                <span
                  class="iconfont note-book-property-icon"
                  style="color:black"
                >
                  &#xfffb;
                </span>
                <!--suppress JSUnresolvedVariable -->
                <span class="note-book-property-text">
                所有者: {{ item.owner_account.display_name }}
              </span>
              </div>
              <div class="note-book-property">
                <span
                  class="iconfont note-book-property-icon"
                  style="color:black"
                >
                  &#xffe7;
                </span>
                <!--suppress JSUnresolvedVariable -->
                <span class="note-book-property-text">
                项目总数: {{ item.item_count }}
              </span>
              </div>
              <div class="note-book-property">
                <span
                  class="iconfont note-book-property-icon"
                  style="color:black"
                >
                  &#xffef;
                </span>
                <!--suppress JSUnresolvedVariable -->
                <span class="note-book-property-text">
                最新更新日期: {{ formatTimestamp(item.last_modified_date) }}
              </span>
              </div>
            </div>
          </template>
          <template v-slot:header="{index,item}">
            <el-button-group class="note-book-control-button-group">
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
      </template>
    </border-layout-panel>
    <entity-maintain-dialog
      :mode="entityMaintainDialog.mode"
      :visible.sync="entityMaintainDialog.visible"
      :entity="entityMaintainDialog.anchorEntity"
      :create-rules="entityMaintainDialog.rules"
      :edit-rules="entityMaintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleNoteBookCreate"
      @onEntityEdit="handleNoteBookEdit"
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
      :note-book-id="permitMaintainDialog.noteBookId"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import CardPanel from '@/components/layout/CardPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import PermitMaintainDialog from '@/views/items/note/noteBook/PermitMaintainDialog.vue';

import resolveResponse from '@/util/response';
import {
  allOwnedDisp, allPermittedDisp, create, remove, update,
} from '@/api/note/noteBook';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'NoteBook',
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
            { required: true, message: '笔记本名称不能为空', trigger: 'blur' },
          ],
        },
      },
      permitMaintainDialog: {
        visible: false,
        noteBookId: '',
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
    handleNoteBookToCreate() {
      resolveResponse(allOwnedDisp(0, 1000))
        .then((res) => {
          if (res.count >= this.cardPanel.maxCard) {
            this.$alert(
              `您创建了过多的笔记本，每个人创建笔记本的最大数量不应超过 ${this.cardPanel.maxCard}
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
    handleNoteBookCreate() {
      resolveResponse(create(
        this.entityMaintainDialog.anchorEntity.name,
        this.entityMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `笔记本 ${this.entityMaintainDialog.anchorEntity.name} 创建成功`,
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
    handleNoteBookEdit() {
      resolveResponse(update(
        this.entityMaintainDialog.anchorEntity.long_id,
        this.entityMaintainDialog.anchorEntity.name,
        this.entityMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `笔记本 ${this.entityMaintainDialog.anchorEntity.name} 更新成功`,
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
        this.$alert('您不是此笔记本的所有者，无权编辑该笔记本！', '权限不足', {
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
            this.$alert('您不是此笔记本的所有者，无权分配该笔记本的权限！', '权限不足', {
              confirmButtonText: '确定',
              type: 'warning',
              customClass: 'custom-message-box__w500',
            });
            return Promise.reject();
          }
          return Promise.resolve(res.key.long_id);
        }).then(() => {
          this.permitMaintainDialog.noteBookId = item.key.long_id;
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
            this.$alert('您不是此笔记本的所有者，无权删除该笔记本！', '权限不足', {
              confirmButtonText: '确定',
              type: 'warning',
              customClass: 'custom-message-box__w500',
            });
            return Promise.reject();
          }
          return Promise.resolve(res.key.long_id);
        })
        .then((res) => this.$confirm('此操作将永久删除此笔记本。<br>是否继续?',
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
            message: `笔记本 ${item.name} 删除成功`,
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
.note-book-container {
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

.note-book-control-button-group {
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
