<template>
  <div class="item-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabs.activeName" tab-position="left">
      <el-tab-pane label="概览" name="overlook">
        <item-overlook-panel
          mode="DEFAULT"
          :item-id="itemId"
          :readonly="readonly"
          @onItemPropertyUpdated="handleItemPropertyUpdated"
          @onPanelFloatyButtonClicked="handlePanelFloatyButtonClicked(0)"
        />
      </el-tab-pane>
      <el-tab-pane label="笔记" name="note">
        <item-note-panel
          mode="DEFAULT"
          :item-id="itemId"
          :readonly="readonly"
          @onItemNoteCommitted="handleItemNoteCommitted"
          @onPanelFloatyButtonClicked="handlePanelFloatyButtonClicked(1)"
        />
      </el-tab-pane>
      <el-tab-pane label="附件" name="attachment">
        <item-attachment-panel
          mode="DEFAULT"
          :item-id="itemId"
          :readonly="readonly"
          @onItemAttachmentUpdated="handleItemAttachmentUpdated"
          @onPanelFloatyButtonClicked="handlePanelFloatyButtonClicked(2)"
          @onFileFloaty="handleFileFloaty"
        />
      </el-tab-pane>
    </el-tabs>
    <floaty-dialog
      show-dock-button
      show-opacity-button
      show-content-mask
      :visible.sync="panelFloaty.visible"
      :title="panelFloaty.title"
      :z-index="100"
      :min-width="550"
      :min-height="200"
      :initial-x="panelFloaty.initialX"
      :initial-y="panelFloaty.initialY"
      :initial-height="panelFloaty.initialHeight"
      :initial-width="panelFloaty.initialWidth"
      :initial-dock-status="panelFloaty.initialDockStatus"
      :initial-content-opacity="panelFloaty.initialContentOpacity"
      @onVisualFieldAdjusted="handlePanelFloatyVisualFieldAdjusted"
      @onClosed="handlePanelFloatyClosed"
    >
      <item-overlook-panel
        v-if="panelFloaty.type===0"
        mode="FLOATY"
        :item-id="itemId"
        :readonly="readonly"
        @onItemPropertyUpdated="handleItemPropertyUpdated"
      />
      <item-note-panel
        v-if="panelFloaty.type===1"
        mode="FLOATY"
        :item-id="itemId"
        :readonly="readonly"
        @onItemNoteCommitted="handleItemNoteCommitted"
      />
      <item-attachment-panel
        v-if="panelFloaty.type===2"
        mode="FLOATY"
        :item-id="itemId"
        :readonly="readonly"
        @onItemAttachmentUpdated="handleItemAttachmentUpdated"
        @onFileFloaty="handleFileFloaty"
      />
    </floaty-dialog>
    <floaty-dialog
      show-dock-button
      show-opacity-button
      show-content-mask
      :visible.sync="fileFloaty.visible"
      :title="fileFloaty.title"
      :z-index="110"
      :min-width="550"
      :min-height="200"
      :initial-x="fileFloaty.initialX"
      :initial-y="fileFloaty.initialY"
      :initial-height="fileFloaty.initialHeight"
      :initial-width="fileFloaty.initialWidth"
      :initial-dock-status="fileFloaty.initialDockStatus"
      :initial-content-opacity="fileFloaty.initialContentOpacity"
      @onVisualFieldAdjusted="handleFileFloatyVisualFieldAdjusted"
    >
      <file-edit-panel :type="fileFloaty.type" :id="fileFloaty.id" :mode="fileFloaty.mode"/>
    </floaty-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ItemOverlookPanel from '@/views/items/note/noteManagement/ItemOverlookPanel.vue';
import ItemNotePanel from '@/views/items/note/noteManagement/ItemNotePanel.vue';
import ItemAttachmentPanel from '@/views/items/note/noteManagement/ItemAttachmentPanel.vue';
import FloatyDialog from '@/components/layout/FloatyDialog.vue';
import FileEditPanel from '@/views/items/miscellaneous/fileEditor/FileEditPanel.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/settingNode';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';
import resolveResponse from '@/util/response';

import { NOTE_ATTACHMENT_FILE } from '@/views/items/miscellaneous/fileEditor/fileTypeConstants';

// noinspection JSAnnotator
export default {
  name: 'ItemEditPanel',
  components: {
    FileEditPanel,
    FloatyDialog,
    ItemAttachmentPanel,
    ItemNotePanel,
    ItemOverlookPanel,
  },
  props: {
    itemId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    upsc: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      loading: false,
      tabs: {
        activeName: 'overlook',
      },
      panelFloaty: {
        visible: false,
        type: 0,
        title: '概览浮动窗口',
        initialX: 50,
        initialY: 100,
        initialHeight: 600,
        initialWidth: 800,
        initialDockStatus: 0,
        initialContentOpacity: 100,
      },
      fileFloaty: {
        visible: false,
        type: NOTE_ATTACHMENT_FILE,
        id: '',
        mode: 'INSPECT',
        title: '',
        initialX: 100,
        initialY: 100,
        initialHeight: 600,
        initialWidth: 800,
        initialDockStatus: 0,
        initialContentOpacity: 100,
      },
    };
  },
  methods: {
    handleItemPropertyUpdated() {
      this.$emit('onItemPropertyUpdated');
    },
    handleItemNoteCommitted() {
      this.$emit('onItemNoteCommitted');
    },
    handleItemAttachmentUpdated() {
      this.$emit('onItemAttachmentUpdated');
    },
    handlePanelFloatyButtonClicked(type) {
      let changeFlag = false;
      if (this.panelFloaty.type !== type) {
        changeFlag = true;
        this.panelFloaty.type = type;
      }
      switch (type) {
        case 0:
          this.panelFloaty.title = '概览浮动窗口';
          break;
        case 1:
          this.panelFloaty.title = '笔记浮动窗口';
          break;
        case 2:
          this.panelFloaty.title = '附件浮动窗口';
          break;
        default:
          this.panelFloaty.title = '浮动窗口';
          break;
      }
      if (!this.panelFloaty.visible) {
        changeFlag = true;
        this.panelFloaty.visible = true;
      }
      if (!changeFlag) {
        return;
      }
      this.updateUserPreference();
    },
    handlePanelFloatyVisualFieldAdjusted(visualField) {
      // 同步初始值。
      this.panelFloaty.initialX = visualField.x;
      this.panelFloaty.initialY = visualField.y;
      this.panelFloaty.initialHeight = visualField.height;
      this.panelFloaty.initialWidth = visualField.width;
      this.panelFloaty.initialDockStatus = visualField.dockStatus;
      this.panelFloaty.initialContentOpacity = visualField.contentOpacity;
      this.updateUserPreference();
    },
    handleFileFloaty(floatyInfo) {
      this.fileFloaty.id = floatyInfo.id;
      this.fileFloaty.mode = floatyInfo.mode;
      this.fileFloaty.title = floatyInfo.originName;
      this.fileFloaty.visible = true;
    },
    handleFileFloatyVisualFieldAdjusted(visualField) {
      // 同步初始值。
      this.fileFloaty.initialX = visualField.x;
      this.fileFloaty.initialY = visualField.y;
      this.fileFloaty.initialHeight = visualField.height;
      this.fileFloaty.initialWidth = visualField.width;
      this.fileFloaty.initialDockStatus = visualField.dockStatus;
      this.fileFloaty.initialContentOpacity = visualField.contentOpacity;
      this.updateUserPreference();
    },
    handlePanelFloatyClosed() {
      this.updateUserPreference();
    },
    loadUserPreference() {
      if (this.upsc === '') {
        return;
      }
      this.loading = true;
      resolveResponse(operateInspect(this.upsc, [this.me]))
        .then((res) => {
          if (res !== null) {
            this.resumeUserPreference(JSON.parse(res.value));
          }
          return Promise.resolve();
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    resumeUserPreference(userPreference) {
      this.panelFloaty.visible = userPreference.panelFloaty.visible;
      this.panelFloaty.type = userPreference.panelFloaty.type;
      this.panelFloaty.initialX = userPreference.panelFloaty.initialX;
      this.panelFloaty.initialY = userPreference.panelFloaty.initialY;
      this.panelFloaty.initialHeight = userPreference.panelFloaty.initialHeight;
      this.panelFloaty.initialWidth = userPreference.panelFloaty.initialWidth;
      this.panelFloaty.initialDockStatus = userPreference.panelFloaty.initialDockStatus;
      this.panelFloaty.initialContentOpacity = userPreference.panelFloaty.initialContentOpacity;
      switch (this.panelFloaty.type) {
        case 0:
          this.panelFloaty.title = '概览浮动窗口';
          break;
        case 1:
          this.panelFloaty.title = '笔记浮动窗口';
          break;
        case 2:
          this.panelFloaty.title = '附件浮动窗口';
          break;
        default:
          this.panelFloaty.title = '浮动窗口';
          break;
      }
      this.fileFloaty.initialX = userPreference.fileFloaty.initialX;
      this.fileFloaty.initialY = userPreference.fileFloaty.initialY;
      this.fileFloaty.initialHeight = userPreference.fileFloaty.initialHeight;
      this.fileFloaty.initialWidth = userPreference.fileFloaty.initialWidth;
      this.fileFloaty.initialDockStatus = userPreference.fileFloaty.initialDockStatus;
      this.fileFloaty.initialContentOpacity = userPreference.fileFloaty.initialContentOpacity;
    },
    updateUserPreference() {
      if (this.upsc === '') {
        return;
      }
      if (this.loading) {
        return;
      }
      resolveResponse(
        operatePut(this.upsc,
          [this.me],
          JSON.stringify(this.getUserPreference()),
          `更新时间: ${formatTimestamp(currentTimestamp())}`),
      ).then(() => {
        this.$message({
          showClose: true,
          message: '偏好已更新',
          type: 'success',
          center: true,
        });
      });
    },
    getUserPreference() {
      return {
        panelFloaty: {
          visible: this.panelFloaty.visible,
          type: this.panelFloaty.type,
          initialX: this.panelFloaty.initialX,
          initialY: this.panelFloaty.initialY,
          initialHeight: this.panelFloaty.initialHeight,
          initialWidth: this.panelFloaty.initialWidth,
          initialDockStatus: this.panelFloaty.initialDockStatus,
          initialContentOpacity: this.panelFloaty.initialContentOpacity,
        },
        fileFloaty: {
          visible: this.fileFloaty.visible,
          type: this.fileFloaty.type,
          initialX: this.fileFloaty.initialX,
          initialY: this.fileFloaty.initialY,
          initialHeight: this.fileFloaty.initialHeight,
          initialWidth: this.fileFloaty.initialWidth,
          initialDockStatus: this.fileFloaty.initialDockStatus,
          initialContentOpacity: this.fileFloaty.initialContentOpacity,
        },
      };
    },
  },
  mounted() {
    this.loadUserPreference();
  },
};
</script>

<style scoped>
.item-edit-panel-container {
  height: 100%;
  width: 100%;
}

.tabs-panel {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel >>> .el-tabs__content {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel >>> .el-tab-pane {
  height: 100%;
}
</style>
